"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { 
  ArrowLeft, FileUp, FileSpreadsheet, AlertCircle, 
  Activity, CreditCard, Wallet, Loader2,
  CheckCircle2, Tag, Info, RotateCcw, ShieldCheck, FileWarning
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

        // --- VALIDAÇÃO DE CONTEXTO REVISADA ---
        // Se estou em CC mas o arquivo tem 'nome_cartao_credito', bloqueia.
        if (tipoImportacao === 'CC' && colunasArquivo.includes('nome_cartao_credito')) {
          alert("Erro de Contexto! Este arquivo contém dados de Cartão de Crédito. Por favor, mude a seleção para 'Cartão de Crédito' no topo da página.");
          setLoading(false);
          return;
        }
        
        // Se estou em CARTÃO, o arquivo PRECISA ter 'nome_cartao_credito'.
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

      const rowsToInsert = novosLancamentos.map((item) => ({
        user_id: user.id,
        projeto: "Importação arquivo XLS", 
        tipo_origem: tipoImportacao === 'CARTAO' ? "Cartão de Crédito" : "Conta Corrente",
        // Prioriza banco para CC e nome_cartao_credito para Cartão
        origem: tipoImportacao === 'CC' ? (item.banco || "Não informado") : (item.nome_cartao_credito || "Cartão"),
        cartao_nome: tipoImportacao === 'CARTAO' ? item.nome_cartao_credito : null,
        descricao: item.descricao || "Sem descrição",
        valor: parseFloat(item.valor),
        natureza: item.natureza || "Despesa",
        data_competencia: formatarDataParaBanco(item.data_compra),
        tipo_de_custo: item.tipo_de_custo || "Variável",
        categoria: item.categoria || "Geral",
        sub_categoria: item.sub_categoria,
        hash_deduplicacao: item.hash_deduplicacao,
        parcelas_total: item.parcelas_totais || 1,
        parcela_atual: item.parcela_atual || 1
      }));

      const { error } = await supabase.from("lancamentos_financeiros").insert(rowsToInsert);
      if (error) throw error;

      alert(`${rowsToInsert.length} lançamentos salvos com sucesso!`);
      limparFluxo();
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const contagemNovos = dadosPreview.filter(d => !d.ja_existe).length;

  return (
    <div className="w-full pr-10 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <Link href="/lancamentos" className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors font-black text-[10px] uppercase tracking-widest mb-4">
            <ArrowLeft size={14} /> Voltar para Lançamentos
          </Link>
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight flex items-center">
            <span>Importar XLS<span className="text-orange-500">.</span></span>
            <FileUp size={60} className="text-orange-500 skew-x-12 opacity-35 ml-4" strokeWidth={1.2} />
          </h1>
        </div>
      </div>

      {/* 1. SELETOR DE CONTEXTO */}
      <div className={`mt-8 mb-4 transition-opacity ${dadosPreview.length > 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
         <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
            <Info size={14} className="text-orange-500" /> 1. O que deseja importar?
         </h3>
         <div className="flex flex-wrap gap-4">
            <button 
               onClick={() => setTipoImportacao('CC')}
               className={`flex-1 min-w-[240px] md:flex-none flex items-center justify-between gap-8 p-6 rounded-[2rem] border-2 transition-all ${tipoImportacao === 'CC' ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100 bg-white'}`}
            >
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tipoImportacao === 'CC' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                     <Wallet size={20} />
                  </div>
                  <p className={`font-bold text-sm ${tipoImportacao === 'CC' ? 'text-gray-900' : 'text-gray-400'}`}>Conta Corrente</p>
               </div>
               {tipoImportacao === 'CC' && <CheckCircle2 size={20} className="text-orange-500" />}
            </button>

            <button 
               onClick={() => setTipoImportacao('CARTAO')}
               className={`flex-1 min-w-[240px] md:flex-none flex items-center justify-between gap-8 p-6 rounded-[2rem] border-2 transition-all ${tipoImportacao === 'CARTAO' ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100 bg-white'}`}
            >
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tipoImportacao === 'CARTAO' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                     <CreditCard size={20} className={tipoImportacao === 'CARTAO' ? 'text-orange-500' : ''} />
                  </div>
                  <p className={`font-bold text-sm ${tipoImportacao === 'CARTAO' ? 'text-gray-900' : 'text-gray-400'}`}>Cartão de Crédito</p>
               </div>
               {tipoImportacao === 'CARTAO' && <CheckCircle2 size={20} className="text-orange-500" />}
            </button>
         </div>
      </div>

      {/* 2. ÁREA DE UPLOAD */}
      <div className="mt-8">
         <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
            2. Selecione o ficheiro
         </h3>
         
         {dadosPreview.length === 0 ? (
            <div 
               className={`min-h-[180px] border-4 border-dashed rounded-[2.5rem] transition-all flex flex-col items-center justify-center p-6 text-center
               ${dragActive ? 'border-orange-500 bg-orange-50/50' : 'border-gray-100 bg-gray-50/30 hover:border-gray-200'}`}
               onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
               onDragLeave={() => setDragActive(false)}
               onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) processarArquivo(e.dataTransfer.files[0]); }}
            >
               {loading ? (
                  <Loader2 size={32} className="animate-spin text-orange-500" />
               ) : (
                  <>
                     <FileSpreadsheet size={32} className="text-orange-500 mb-2" />
                     <h4 className="text-lg font-bold text-gray-900 mb-4">Arraste seu XLS de {tipoImportacao === 'CC' ? 'Extrato' : 'Fatura'}</h4>
                     <label className="cursor-pointer px-8 py-3 bg-gray-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl">
                        Selecionar Ficheiro
                        <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={(e) => e.target.files && processarArquivo(e.target.files[0])} />
                     </label>
                  </>
               )}
            </div>
         ) : (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-lg shadow-emerald-500/20">
                     <CheckCircle2 size={24} />
                  </div>
                  <div>
                     <p className="text-emerald-900 font-bold text-lg leading-tight">{contagemNovos} novos de {dadosPreview.length} registros</p>
                     <p className="text-emerald-600 text-xs">Layout validado com sucesso.</p>
                  </div>
               </div>
               <button onClick={limparFluxo} className="flex items-center gap-2 px-6 py-3 bg-white border border-emerald-200 text-emerald-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-100 transition-all">
                  <RotateCcw size={14} /> Limpar e Refazer
               </button>
            </div>
         )}
      </div>

      {/* 3. PREVIEW */}
      {dadosPreview.length > 0 && (
        <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Preview de Importação</p>
                {contagemNovos < dadosPreview.length && (
                  <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-2 py-1 rounded-full uppercase flex items-center gap-1">
                    <FileWarning size={10} /> {dadosPreview.length - contagemNovos} Duplicados ignorados
                  </span>
                )}
              </div>
              <button 
                onClick={salvarNoBanco}
                disabled={isSaving || contagemNovos === 0}
                className="px-8 py-3 bg-orange-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                {isSaving ? "A Guardar..." : `Gravar ${contagemNovos} Lançamentos`}
              </button>
            </div>

            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                    <th className="p-6">Status</th>
                    <th className="p-6">Data</th>
                    <th className="p-6">Descrição</th>
                    <th className="p-6 text-center">Cat / Sub-cat</th>
                    <th className="p-6 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dadosPreview.map((item, idx) => (
                    <tr key={idx} className={`transition-colors ${item.ja_existe ? 'bg-gray-50/50 opacity-60' : 'hover:bg-gray-50/30'}`}>
                      <td className="p-6">
                        {item.ja_existe ? (
                          <span className="flex items-center gap-1 text-[8px] font-black text-red-400 uppercase"><AlertCircle size={10}/> Duplicado</span>
                        ) : (
                          <span className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase"><CheckCircle2 size={10}/> Novo</span>
                        )}
                      </td>
                      <td className="p-6 text-xs font-bold text-gray-900">{formatarDataExibicao(item.data_compra)}</td>
                      <td className="p-6">
                        <span className="text-sm font-bold text-gray-900 block">{item.descricao}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase">
                          {tipoImportacao === 'CC' ? (item.banco || 'CC') : (item.nome_cartao_credito || 'CARTÃO')}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-gray-700 uppercase">{item.categoria}</span>
                          {item.sub_categoria && (
                            <span className="text-[8px] font-black text-orange-500 uppercase bg-orange-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Tag size={8} /> {item.sub_categoria}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`p-6 text-right text-base font-black ${item.ja_existe ? 'text-gray-400' : 'text-gray-900'}`}>
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

      {/* 4. CARDS DE DICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-gray-900 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <Activity className="absolute -right-6 -bottom-6 text-orange-500 opacity-10" size={100} />
          <p className="text-orange-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Dica Pro</p>
          <h4 className="text-white font-bold text-lg mb-3">Múltiplos Lançamentos</h4>
          <p className="text-gray-400 text-xs leading-relaxed">O sistema valida o layout antes de carregar. Certifique-se de usar o modelo correto para cada aba.</p>
        </div>
        
        <div className="bg-orange-50 border border-orange-100 p-8 rounded-[2rem] flex items-center gap-6 relative overflow-hidden">
          <div className="w-12 h-12 shrink-0 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg mb-1">Cuidado com duplicados</h4>
            <p className="text-[11px] text-gray-600 font-medium leading-relaxed">Mesmo se o arquivo for aceito, bloqueamos itens repetidos com base na data, valor e descrição.</p>
          </div>
        </div>
      </div>
    </div>
  );
}