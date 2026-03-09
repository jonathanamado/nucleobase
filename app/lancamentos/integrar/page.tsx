"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, RefreshCw, Settings2, Link2, 
  Database, Cloud, HardHat
} from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";

// Interfaces para tipagem rigorosa
interface Fonte {
  id: number;
  nome: string;
  status: string;
  tipo: string;
  url: string;
}

interface LogEntry {
  horario: string;
  acao: string;
  fonte: string;
  resultado: string;
}

interface PlanilhaRow {
  descricao: string;
  valor: string;
  data_compra?: string;
  categoria?: string;
  natureza?: string;
  nome_cartao_credito?: string;
  banco?: string;
  sub_categoria?: string;
  fatura_mes?: string;
  tipo_de_custo?: string;
}

const DICIONARIO_CATEGORIAS: { [key: string]: string[] } = {
  "Alimentação": ["padaria", "mercado", "ifood", "restaurante", "café", "pão", "lanche", "açougue", "refeição", "supermercado"],
  "Saúde": ["farmacia", "drogaria", "médico", "hospital", "exame", "remedio", "dentista", "unimed", "consulta"],
  "Transporte": ["uber", "99app", "combustivel", "posto", "gasolina", "estacionamento", "pedagio", "shell", "ipiranga"],
  "Lazer": ["netflix", "spotify", "cinema", "show", "viagem", "hotel", "steam", "psn"],
  "Vestuário": ["roupa", "calçado", "loja", "renner", "zara", "cea", "shoes", "nike", "adidas"],
  "Educação": ["curso", "faculdade", "escola", "livros", "udemy", "alura"],
  "Moradia": ["aluguel", "condominio", "luz", "água", "internet", "enel", "copasa", "iptu"]
};

const categorizarPorDescricao = (descricao: string): string => {
  const desc = (descricao || "").toLowerCase();
  for (const [categoria, palavras] of Object.entries(DICIONARIO_CATEGORIAS)) {
    if (palavras.some(p => desc.includes(p))) return categoria;
  }
  return "Geral";
};

export default function IntegrarPage() {
  const [mounted, setMounted] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFonte, setSelectedFonte] = useState<Fonte | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);
  const [fontes, setFontes] = useState<Fonte[]>([
    { id: 1, nome: "Planilha Principal", status: "active", tipo: "Google Sheets", url: "" },
    { id: 2, nome: "Export Diário", status: "active", tipo: "CSV Externo", url: "" },
  ]);

  useEffect(() => {
    setMounted(true);
    setLogs([
      { 
        horario: new Date().toLocaleString('pt-BR'), 
        acao: "Sistema Pronto", 
        fonte: "Núcleo IA", 
        resultado: "Aguardando" 
      }
    ]);
  }, []);

  const openEditModal = (fonte: Fonte) => {
    setSelectedFonte(fonte);
    setNewUrl(fonte.url || "");
    setIsModalOpen(true);
  };

  const handleSaveEndpoint = async () => {
    if (!selectedFonte) return;
    setSavingUrl(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      let urlTratada = newUrl.trim();
      if (urlTratada.includes("/edit")) {
        urlTratada = urlTratada.replace(/\/edit.*$/, "/export?format=csv");
      }

      const { error } = await supabase
        .from("configuracoes_integracao")
        .upsert({ 
          user_id: user.id, 
          nome_fonte: selectedFonte.nome,
          endpoint_url: urlTratada,
          tipo_fonte: selectedFonte.tipo,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, nome_fonte' });

      if (error) throw error;
      setFontes(fontes.map(f => f.id === selectedFonte.id ? { ...f, url: urlTratada } : f));
      setIsModalOpen(false);
      alert("Configuração salva!");
    } catch (error: any) {
      alert("Erro ao salvar: " + (error.message || "Erro desconhecido"));
    } finally {
      setSavingUrl(false);
    }
  };

  const handleSyncNow = async () => {
    if (syncing) return;
    setSyncing(true);
    const agoraStr = new Date().toLocaleString('pt-BR');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: config, error: fetchError } = await supabase
          .from("configuracoes_integracao")
          .select("endpoint_url")
          .eq("user_id", user?.id)
          .eq("nome_fonte", "Planilha Principal")
          .maybeSingle();

      if (fetchError || !config?.endpoint_url) throw new Error("Configure a URL da planilha antes de sincronizar.");

      const response = await fetch(config.endpoint_url);
      if (!response.ok) throw new Error("Acesso negado à planilha. Verifique se ela está pública.");
      const csvText = await response.text();

      const parsedData: PlanilhaRow[] = await new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: 'greedy',
          transformHeader: (h) => h.trim().toLowerCase(),
          complete: (results) => resolve(results.data as PlanilhaRow[]),
          error: (err: Error) => reject(err)
        });
      });

      const dadosValidos = parsedData.filter((linha) => 
        (linha.descricao) && (linha.valor)
      );

      if (dadosValidos.length === 0) throw new Error("Planilha vazia ou colunas incompatíveis.");

      const lancamentosParaInserir = dadosValidos.map((linha) => {
        const desc = (linha.descricao).toString().trim();
        const valorBruto = (linha.valor || "0").toString();
        const valorTratado = parseFloat(valorBruto.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".")) || 0;

        let dF = (linha.data_compra || "").toString().trim();
        if (dF.includes('/')) {
          const p = dF.split('/');
          if (p.length === 3) dF = `${p[2]}-${p[1]}-${p[0]}`;
        }

        return {
          user_id: user?.id,
          descricao: desc,
          valor: valorTratado,
          data_competencia: dF || new Date().toISOString().split('T')[0],
          categoria: (linha.categoria && linha.categoria.trim() !== "") ? linha.categoria : categorizarPorDescricao(desc),
          tipo: (linha.natureza || "").toLowerCase().includes("receita") ? "receita" : "despesa",
          status: "pago",
          origem: "Sincronização Online",
          metodo_pagamento: linha.nome_cartao_credito || linha.banco || "Planilha",
          observacoes: `Subcat: ${linha.sub_categoria || 'N/A'} | Fatura: ${linha.fatura_mes || 'N/A'} | Custo: ${linha.tipo_de_custo || 'N/A'}`
        };
      });

      const { error: insertError } = await supabase
          .from("lancamentos_financeiros")
          .upsert(lancamentosParaInserir, { 
              onConflict: 'user_id, descricao, data_competencia, valor' 
          });

      if (insertError) throw insertError;

      setLastSync(agoraStr);
      setLogs(prev => [{
          horario: agoraStr,
          acao: `Sincronização`,
          fonte: "Planilha",
          resultado: `${lancamentosParaInserir.length} registros`
      }, ...prev]);
      
      alert(`Sucesso! ${lancamentosParaInserir.length} registros integrados.`);

    } catch (error: any) {
      console.error("Erro na Sincronização:", error);
      setLogs(prev => [{
          horario: agoraStr,
          acao: "Erro",
          fonte: "Conexão",
          resultado: "Falha"
      }, ...prev]);
      alert(error.message || "Erro inesperado");
    } finally {
      setSyncing(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="w-full lg:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER */}
      <div className="mb-6 mt-2 flex flex-col text-left w-full">
        <Link href="/lancamentos" className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors font-black text-[10px] uppercase tracking-widest mb-4 w-fit">
          <ArrowLeft size={14} /> Voltar para Lançamentos Manuais
        </Link>
        
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
          <span>Sincronização Remota<span className="text-orange-500">.</span></span>
          <Cloud size={60} className="text-orange-500 skew-x-12 opacity-35 ml-4 hidden md:block" strokeWidth={1.2} />
        </h1>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-[13px] md:text-base text-gray-600 max-w-2xl leading-tight">
            Configure o endpoint da <span className="font-bold text-gray-900 md:inline">Sincronização</span> e conecte o <span className="font-bold text-gray-900">Banco de Dados.</span>
          </p>
          
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2 flex items-center gap-6 w-full">
          Integração <div className="h-px bg-gray-300 flex-1"></div>
        </h3>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 bg-orange-50/60 px-4 py-2 rounded-xl border border-orange-100/50 w-fit">
              <HardHat size={18} className="text-orange-500 animate-bounce" />
              <p className="text-[11px] md:text-[14px] font-black text-orange-600 uppercase tracking-widest">
                  Módulo em fase de desenvolvimento
              </p>
            </div>

            {/* Sync Button Box - Now Visible on Desktop too, following the divider */}
            <div className="flex items-center justify-between w-full md:w-auto md:gap-8 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Último Check</span>
                <button onClick={handleSyncNow} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-tighter hover:bg-orange-600 transition-all shadow-md shadow-orange-500/10">
                   <RefreshCw size={12} className={syncing ? "animate-spin" : ""} /> Sincronizar
                </button>
            </div>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-12">
        {fontes.map((fonte) => (
          <div key={fonte.id} className="bg-white border-2 border-gray-100 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] hover:border-orange-500/30 transition-all group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100">
                <Link2 size={18} className="md:w-6 md:h-6" />
              </div>
              <div className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest">Ativo</div>
            </div>
            <h4 className="text-sm md:text-xl font-bold text-gray-900 mb-1 truncate">{fonte.nome}</h4>
            <p className="text-[8px] md:text-[10px] text-gray-400 font-black uppercase mb-4 md:mb-6 tracking-tighter">{fonte.tipo}</p>
            <button onClick={() => openEditModal(fonte)} className="mt-auto w-full py-2.5 md:py-3 bg-gray-50 text-gray-400 group-hover:bg-gray-900 group-hover:text-white rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              <Settings2 size={12} /> <span className="hidden md:inline">Editar Endpoint</span><span className="md:hidden">Ajustar</span>
            </button>
          </div>
        ))}
      </div>

      {/* DIVIDER & CONTEXT */}
      <div className="mt-12 mb-8">
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-4 w-full">
          Tempo Real <div className="h-px bg-gray-200 flex-1"></div>
        </h3>
        <p className="text-gray-500 text-[13px] font-medium leading-relaxed max-w-3xl">
          Abaixo você encontra a auditoria de logs. Cada integração é processada pelo Núcleo IA para garantir a normalização dos dados antes da inserção no banco.
        </p>
      </div>

      {/* LOGS / STATUS DO PROCESSADOR */}
      <div className="bg-gray-900 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-6 md:p-10 border-b border-white/5">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="bg-orange-500 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl shadow-orange-500/20">
              <Database size={20} className="text-white md:w-7 md:h-7" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg md:text-2xl tracking-tight">Status do Processador</h4>
              <p className="text-gray-400 text-[8px] md:text-xs font-medium uppercase tracking-widest">Logs de execução (V0)</p>
            </div>
          </div>
        </div>

        <div className="p-2 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2 px-4 md:px-8">
            <thead>
              <tr className="text-[9px] md:text-[10px] font-black uppercase text-gray-500 tracking-widest">
                <th className="pb-4 pl-4">Horário</th>
                <th className="pb-4">Ação</th>
                <th className="pb-4 text-right pr-4">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="bg-white/5 hover:bg-white/10 transition-colors">
                  <td className="py-4 md:py-5 pl-4 md:pl-6 rounded-l-xl md:rounded-l-2xl text-[10px] md:text-xs text-gray-400 font-mono">{log.horario.split(',')[1] || log.horario}</td>
                  <td className="py-4 md:py-5 text-xs md:text-sm font-bold text-gray-200">{log.acao}</td>
                  <td className={`py-4 md:py-5 text-right pr-4 md:pr-6 rounded-r-xl md:rounded-r-2xl text-[10px] md:text-sm font-black ${log.resultado === 'Falha' || log.resultado === 'Erro' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {log.resultado}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] md:rounded-[3rem] shadow-2xl p-8 md:p-10 animate-in zoom-in-95">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white"><Link2 size={20} /></div>
              <div>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Configurar Endpoint</h4>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{selectedFonte?.nome}</p>
              </div>
            </div>
            <input 
              type="text" 
              value={newUrl} 
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Cole o link da planilha aqui..."
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm mb-6 outline-none focus:border-orange-500 transition-all"
            />
            <div className="flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[9px] md:text-[10px] uppercase">Cancelar</button>
              <button onClick={handleSaveEndpoint} disabled={savingUrl} className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black text-[9px] md:text-[10px] uppercase hover:bg-black transition-all">
                {savingUrl ? "Salvando..." : "Salvar Configuração"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}