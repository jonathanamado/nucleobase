"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { 
  ArrowLeft, FileUp, FileSpreadsheet, AlertCircle, 
  Activity, CreditCard, Wallet, Loader2,
  CheckCircle2, Tag, Info, RotateCcw, ShieldCheck, FileWarning,
  Download
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; 

export default function ImportarXLSPage() {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dadosPreview, setDadosPreview] = useState<any[]>([]);
  const [tipoImportacao, setTipoImportacao] = useState<'CC' | 'CARTAO'>('CC');

  // --- CONFIGURAÇÃO DE VALIDAÇÃO DE LAYOUT ---
  const COLUNAS_OBRIGATORIAS = {
    CC: ["data_compra", "descricao", "valor", "natureza", "categoria", "banco"],
    CARTAO: ["data_compra", "descricao", "valor", "natureza", "categoria", "nome_cartao_credito"]
  };

  const formatarDataParaBanco = (data: any) => {
    if (!data) return new Date().toISOString().split('T')[0];
    if (typeof data === "number") {
      const d = new Date(Math.round((data - 25569) * 86400 * 1000));
      return d.toISOString().split('T')[0];
    }
    if (typeof data === "string" && data.includes('/')) {
      const [dia, mes, ano] = data.split('/');
      const anoCompleto = ano.length === 2 ? `20${ano}` : ano;
      return `${anoCompleto}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    try {
      const d = new Date(data);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    } catch (e) {}
    return new Date().toISOString().split('T')[0];
  };

  const formatarDataExibicao = (serial: any) => {
    if (!serial) return "---";
    if (typeof serial === "number") {
      const data = new Date(Math.round((serial - 25569) * 86400 * 1000));
      return data.toLocaleDateString('pt-BR');
    }
    return serial;
  };

  const processarArquivo = async (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

        if (json.length === 0) throw new Error("O arquivo está vazio.");

        const colunasArquivo = Object.keys(json[0]);

        if (tipoImportacao === 'CC' && colunasArquivo.includes('nome_cartao_credito')) {
          alert("Erro de Contexto! Este arquivo contém dados de Cartão de Crédito. Por favor, mude a seleção para 'Cartão de Crédito' no topo da página.");
          setLoading(false);
          return;
        }
        
        if (tipoImportacao === 'CARTAO' && !colunasArquivo.includes('nome_cartao_credito')) {
          alert("Erro de Layout! Para importar Cartão, o arquivo deve conter a coluna 'nome_cartao_credito'.");
          setLoading(false);
          return;
        }

        const obrigatorias = COLUNAS_OBRIGATORIAS[tipoImportacao];
        const colunasFaltantes = obrigatorias.filter(col => !colunasArquivo.includes(col));

        if (colunasFaltantes.length > 0) {
          alert(`Erro de Layout! Faltam colunas obrigatórias: ${colunasFaltantes.join(", ")}`);
          setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();

        const dadosComHash = json.map((row: any) => {
          const dataFormatada = formatarDataParaBanco(row.data_compra);
          const valor = parseFloat(row.valor);
          const subCat = row.sub_categoria || row.Subcategoria || row.subcategoria || null;
          const hash = btoa(`${dataFormatada}-${valor}-${row.descricao}-${subCat || ''}`).substring(0, 50);
          
          return {
            ...row,
            sub_categoria: subCat,
            hash_deduplicacao: hash,
            ja_existe: false
          };
        });

        if (user) {
          const hashes = dadosComHash.map(d => d.hash_deduplicacao);
          const { data: existentes } = await supabase
            .from("lancamentos_financeiros")
            .select("hash_deduplicacao")
            .eq("user_id", user.id)
            .in("hash_deduplicacao", hashes);

          if (existentes) {
            const hashesExistentes = existentes.map(e => e.hash_deduplicacao);
            dadosComHash.forEach(d => {
              if (hashesExistentes.includes(d.hash_deduplicacao)) d.ja_existe = true;
            });
          }
        }

        setDadosPreview(dadosComHash);
      } catch (error: any) {
        alert(error.message || "Erro ao processar Excel.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const limparFluxo = () => {
    setDadosPreview([]);
    setLoading(false);
  };

  const salvarNoBanco = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const novosLancamentos = dadosPreview.filter(d => !d.ja_existe);
      if (novosLancamentos.length === 0) {
        alert("Nenhum novo lançamento para importar.");
        setIsSaving(false);
        return;
      }

      const rowsToInsert: any[] = [];

      novosLancamentos.forEach((item) => {
        const totalParcelas = parseInt(item.parcelas_totais) || 1;
        const valorTotal = parseFloat(item.valor);

        // Se for Cartão e tiver mais de 1 parcela, divide o valor
        if (tipoImportacao === 'CARTAO' && totalParcelas > 1) {
          const valorParcela = valorTotal / totalParcelas;
          
          for (let i = 1; i <= totalParcelas; i++) {
            rowsToInsert.push({
              user_id: user.id,
              projeto: "Importação arquivo XLS", 
              tipo_origem: "Cartão de Crédito",
              origem: item.nome_cartao_credito || "Cartão",
              cartao_nome: item.nome_cartao_credito,
              descricao: item.descricao || "Sem descrição",
              valor: valorParcela, // Valor dividido
              natureza: item.natureza || "Despesa",
              data_competencia: formatarDataParaBanco(item.data_compra),
              tipo_de_custo: item.tipo_de_custo || "Variável",
              categoria: item.categoria || "Geral",
              sub_categoria: item.sub_categoria,
              hash_deduplicacao: `${item.hash_deduplicacao}-p${i}`, // Hash único por parcela
              parcelas_total: totalParcelas,
              parcela_atual: i
            });
          }
        } else {
          // Lógica padrão para Conta Corrente ou Cartão à vista
          rowsToInsert.push({
            user_id: user.id,
            projeto: "Importação arquivo XLS", 
            tipo_origem: tipoImportacao === 'CARTAO' ? "Cartão de Crédito" : "Conta Corrente",
            origem: tipoImportacao === 'CC' ? (item.banco || "Não informado") : (item.nome_cartao_credito || "Cartão"),
            cartao_nome: tipoImportacao === 'CARTAO' ? item.nome_cartao_credito : null,
            descricao: item.descricao || "Sem descrição",
            valor: valorTotal,
            natureza: item.natureza || "Despesa",
            data_competencia: formatarDataParaBanco(item.data_compra),
            tipo_de_custo: item.tipo_de_custo || "Variável",
            categoria: item.categoria || "Geral",
            sub_categoria: item.sub_categoria,
            hash_deduplicacao: item.hash_deduplicacao,
            parcelas_total: item.parcelas_totais || 1,
            parcela_atual: item.parcela_atual || 1
          });
        }
      });

      const { error } = await supabase.from("lancamentos_financeiros").insert(rowsToInsert);
      if (error) throw error;

      alert(`${rowsToInsert.length} registros (incluindo parcelas) salvos com sucesso!`);
      limparFluxo();
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const contagemNovos = dadosPreview.filter(d => !d.ja_existe).length;

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER - Estilo "Sobre" */}
      <div className="mb-6 mt-2 flex flex-col text-left w-full">
        <Link href="/lancamentos" className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors font-black text-[10px] uppercase tracking-widest mb-4 w-fit">
          <ArrowLeft size={14} /> Voltar para Lançamentos Manuais
        </Link>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tight flex items-center">
          <span>Importar XLS<span className="text-orange-500">.</span></span>
          <FileUp size={60} className="text-orange-500 skew-x-12 opacity-35 ml-4" strokeWidth={1.2} />
        </h1>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-base text-gray-600 max-w-2xl leading-tight">
            <span className="font-bold text-gray-900">Agilize seus lançamentos</span> enviando sua planilha diretamente para o sistema. 
            "Baixe" o modelo adequado ao lado para evitar erros de processamento.
          </p>
          
          {/* DOWNLOAD DOS MODELOS */}
          <div className="flex gap-3 w-full md:w-auto">
            <a 
              href="/modelo_importacao_conta-corrente.xlsx" 
              download 
              className="flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-[10px] font-bold transition-all border border-gray-100"
            >
              <Download size={14} className="text-orange-500" /> 
              <span className="text-center">Modelo Conta Corrente</span>
            </a>
            <a 
              href="/modelo_importacao_cartao-credito.xlsx" 
              download 
              className="flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-[10px] font-bold transition-all border border-gray-100"
            >
              <Download size={14} className="text-orange-500" /> 
              <span className="text-center">Modelo Cartão de Crédito</span>
            </a>
          </div>
        </div>
      </div>

      {/* LINHA DIVISÓRIA PADRONIZADA */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4 w-full">
        Configuração e Upload <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* 1. SELETOR DE CONTEXTO */}
      <div className={`mb-8 transition-opacity ${dadosPreview.length > 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
         <div className="flex flex-wrap gap-4">
            <button 
                onClick={() => setTipoImportacao('CC')}
                className={`flex-1 min-w-[240px] md:flex-none flex items-center justify-between gap-8 p-6 rounded-[2rem] border-2 transition-all ${tipoImportacao === 'CC' ? 'border-orange-500 bg-orange-50/30 shadow-lg shadow-orange-500/5' : 'border-gray-100 bg-white'}`}
            >
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tipoImportacao === 'CC' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                     <Wallet size={20} />
                  </div>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${tipoImportacao === 'CC' ? 'text-gray-900' : 'text-gray-400'}`}>Conta Corrente</p>
                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">Extratos bancários</p>
                  </div>
               </div>
               {tipoImportacao === 'CC' && <CheckCircle2 size={20} className="text-orange-500" />}
            </button>

            <button 
                onClick={() => setTipoImportacao('CARTAO')}
                className={`flex-1 min-w-[240px] md:flex-none flex items-center justify-between gap-8 p-6 rounded-[2rem] border-2 transition-all ${tipoImportacao === 'CARTAO' ? 'border-orange-500 bg-orange-50/30 shadow-lg shadow-orange-500/5' : 'border-gray-100 bg-white'}`}
            >
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tipoImportacao === 'CARTAO' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                     <CreditCard size={20} className={tipoImportacao === 'CARTAO' ? 'text-orange-500' : ''} />
                  </div>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${tipoImportacao === 'CARTAO' ? 'text-gray-900' : 'text-gray-400'}`}>Cartão de Crédito</p>
                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">Faturas de Cartão</p>
                  </div>
               </div>
               {tipoImportacao === 'CARTAO' && <CheckCircle2 size={20} className="text-orange-500" />}
            </button>
         </div>
      </div>

      {/* 2. ÁREA DE UPLOAD */}
      <div className="mt-8">
         {dadosPreview.length === 0 ? (
            <div 
                className={`min-h-[200px] border-4 border-dashed rounded-[3rem] transition-all flex flex-col items-center justify-center p-8 text-center
                ${dragActive ? 'border-orange-500 bg-orange-50/50' : 'border-gray-100 bg-gray-50/30 hover:border-gray-200'}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) processarArquivo(e.dataTransfer.files[0]); }}
            >
               {loading ? (
                  <Loader2 size={40} className="animate-spin text-orange-500" />
               ) : (
                  <>
                     <div className="bg-white p-4 rounded-3xl shadow-sm mb-4">
                        <FileSpreadsheet size={32} className="text-orange-500" />
                     </div>
                     <h4 className="text-xl font-bold text-gray-900 mb-2">Arraste seu XLS de {tipoImportacao === 'CC' ? 'Extrato' : 'Fatura'}</h4>
                     <p className="text-xs text-gray-500 mb-6 max-w-xs">Certifique-se que o arquivo segue o layout das colunas do modelo baixado.</p>
                     <label className="cursor-pointer px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all">
                        Selecionar Ficheiro
                        <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={(e) => e.target.files && processarArquivo(e.target.files[0])} />
                     </label>
                  </>
               )}
            </div>
         ) : (
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
               <div className="flex items-center gap-5">
                  <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-500/20">
                     <CheckCircle2 size={28} />
                  </div>
                  <div>
                     <p className="text-emerald-900 font-bold text-xl leading-tight">{contagemNovos} novos de {dadosPreview.length} registros</p>
                     <p className="text-emerald-600 text-xs font-medium">Layout validado e pronto para importação.</p>
                  </div>
               </div>
               <button onClick={limparFluxo} className="flex items-center gap-2 px-8 py-4 bg-white border border-emerald-200 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm">
                  <RotateCcw size={16} /> Limpar e Refazer
               </button>
            </div>
         )}
      </div>

      {/* 3. PREVIEW */}
      {dadosPreview.length > 0 && (
        <div className="mt-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-900/5">
            <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Preview de Dados</p>
                {contagemNovos < dadosPreview.length && (
                  <span className="bg-orange-100 text-orange-600 text-[9px] font-black px-3 py-1.5 rounded-full uppercase flex items-center gap-1.5">
                    <FileWarning size={12} /> {dadosPreview.length - contagemNovos} Já existentes
                  </span>
                )}
              </div>
              <button 
                onClick={salvarNoBanco}
                disabled={isSaving || contagemNovos === 0}
                className="w-full md:w-auto px-10 py-4 bg-orange-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                {isSaving ? "Gravando..." : `Confirmar Importação de ${contagemNovos} Itens`}
              </button>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white z-10 shadow-sm border-b">
                  <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <th className="p-8">Status</th>
                    <th className="p-8">Data</th>
                    <th className="p-8">Descrição</th>
                    <th className="p-8 text-center">Cat / Sub-cat</th>
                    <th className="p-8 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dadosPreview.map((item, idx) => (
                    <tr key={idx} className={`transition-colors ${item.ja_existe ? 'bg-gray-50/50 opacity-60' : 'hover:bg-gray-50/30'}`}>
                      <td className="p-8">
                        {item.ja_existe ? (
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-red-400 uppercase"><AlertCircle size={12}/> Duplicado</span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase"><CheckCircle2 size={12}/> Novo</span>
                        )}
                      </td>
                      <td className="p-8 text-xs font-bold text-gray-900">{formatarDataExibicao(item.data_compra)}</td>
                      <td className="p-8">
                        <span className="text-sm font-bold text-gray-900 block mb-0.5">{item.descricao}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase">
                          {tipoImportacao === 'CC' ? (item.banco || 'CC') : (item.nome_cartao_credito || 'CARTÃO')}
                        </span>
                      </td>
                      <td className="p-8 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-bold text-gray-700 uppercase bg-gray-100 px-2 py-1 rounded">{item.categoria}</span>
                          {item.sub_categoria && (
                            <span className="text-[9px] font-black text-orange-500 uppercase bg-orange-50 px-2 py-0.5 rounded flex items-center gap-1">
                              <Tag size={10} /> {item.sub_categoria}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`p-8 text-right text-base font-black ${item.ja_existe ? 'text-gray-400' : 'text-gray-900'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. CARDS DE DICAS - Estilo Unificado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
        <div className="bg-gray-900 p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
          <Activity className="absolute -right-8 -bottom-8 text-orange-500 opacity-10" size={120} />
          <div className="relative z-10">
            <p className="text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Dica Estratégica</p>
            <h4 className="text-white font-bold text-2xl mb-4 tracking-tight">Múltiplos Lançamentos</h4>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              O sistema utiliza algoritmos de deduplicação. Isso significa que você pode subir o mesmo extrato várias vezes e nós identificaremos o que já foi processado.
            </p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-100 p-10 rounded-[3rem] flex flex-col justify-center relative overflow-hidden shadow-sm">
          <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-orange-100">
            <AlertCircle size={28} />
          </div>
          <h4 className="font-bold text-gray-900 text-2xl mb-2 tracking-tight">Segurança de Dados</h4>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            Bloqueamos itens repetidos com base na data, valor e descrição. Caso precise forçar uma entrada idêntica, altere levemente a descrição no arquivo.
          </p>
        </div>
      </div>
    </div>
  );
}