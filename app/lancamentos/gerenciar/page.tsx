"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Filter, Edit3, Trash2, ArrowLeft, 
  Calendar, Tag, DollarSign, X, Save, 
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle2,
  Database, BarChart3, ArrowUpRight, RotateCcw
} from "lucide-react";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GerenciarLancamentosPage() {
  const [loading, setLoading] = useState(true);
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNatureza, setFilterNatureza] = useState("TODOS");
  const [filterMes, setFilterMes] = useState("");

  // Edição
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [msgFeedback, setMsgFeedback] = useState<{tipo: 'sucesso' | 'erro', texto: string} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const { data } = await supabase
          .from("lancamentos_financeiros")
          .select("*")
          .eq("user_id", session.user.id)
          .order("data_competencia", { ascending: false });
        
        if (data) setLancamentos(data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const lancamentosFiltrados = useMemo(() => {
    return lancamentos.filter(l => {
      const matchBusca = l.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         l.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const matchNatureza = filterNatureza === "TODOS" || l.natureza === filterNatureza;
      const matchMes = filterMes === "" || l.data_competencia.startsWith(filterMes);
      
      return matchBusca && matchNatureza && matchMes;
    });
  }, [searchTerm, filterNatureza, filterMes, lancamentos]);

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este registro?")) return;
    
    const { error } = await supabase.from("lancamentos_financeiros").delete().eq("id", id);
    if (error) alert("Erro ao excluir");
    else setLancamentos(lancamentos.filter(l => l.id !== id));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    const valorAjustado = editingItem.natureza === "Despesa" 
      ? -Math.abs(editingItem.valor) 
      : Math.abs(editingItem.valor);

    const { error } = await supabase
      .from("lancamentos_financeiros")
      .update({
        descricao: editingItem.descricao,
        valor: valorAjustado,
        data_competencia: editingItem.data_competencia,
        categoria: editingItem.categoria,
        origem: editingItem.origem
      })
      .eq("id", editingItem.id);

    if (error) {
      setMsgFeedback({tipo: 'erro', texto: "Erro ao atualizar registro."});
    } else {
      setLancamentos(lancamentos.map(l => l.id === editingItem.id ? {...editingItem, valor: valorAjustado} : l));
      setMsgFeedback({tipo: 'sucesso', texto: "Registro atualizado com sucesso!"});
      setTimeout(() => { setEditingItem(null); setMsgFeedback(null); }, 1500);
    }
    setSaveLoading(false);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Gerenciar Base<span className="text-blue-600">.</span></span>
            <Database size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-sm md:text-lg font-medium max-w-2xl leading-relaxed mt-0">
            Edite ou remova registros do seu <span className="text-blue-600 font-bold">"{searchTerm || "Banco de dados"}"</span>.
          </h2>
        </div>
      </div>

      <h3 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 md:mb-10 flex items-center gap-4">
        Controle de Lançamentos <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-8 items-stretch">
        
        {/* BLOCO DE FILTROS */}
        <section className="lg:col-span-8 bg-gray-50/50 border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-end">
            
            <div className="flex-1 w-full space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Busca livre</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder=""
                  className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Natureza</label>
              <select 
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold outline-none shadow-sm cursor-pointer"
                value={filterNatureza}
                onChange={(e) => setFilterNatureza(e.target.value)}
              >
                <option value="TODOS">Todos</option>
                <option value="Despesa">Despesas</option>
                <option value="Receita">Receitas</option>
              </select>
            </div>

            <div className="flex-1 w-full space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Mês / Ano</label>
              <div className="relative">
                <input 
                  type="month" 
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold outline-none shadow-sm cursor-pointer hover:border-blue-500 transition-all"
                  value={filterMes}
                  onChange={(e) => setFilterMes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-none w-full md:w-20 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 opacity-0 hidden md:block">Limpar</label>
              <button 
                onClick={() => {setSearchTerm(""); setFilterNatureza("TODOS"); setFilterMes("");}}
                className="w-full h-[46px] bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-all shadow-sm group"
                title="Limpar todos os filtros"
              >
                <RotateCcw size={18} className="group-hover:rotate-[-90deg] transition-transform duration-300" />
              </button>
            </div>
          </div>
        </section>

        <Link 
          href="/resultados" 
          className="hidden lg:flex lg:col-span-4 bg-gray-900 rounded-[2.5rem] p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-xl items-center"
        >
          <div className="absolute -right-4 -bottom-4 text-blue-600 opacity-10 group-hover:scale-110 transition-all duration-700">
            <BarChart3 size={100} strokeWidth={1} />
          </div>
          
          <div className="relative z-10 w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <BarChart3 size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold text-base leading-tight">Painel de Resultados</h4>
                <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Análise Estratégica</p>
              </div>
            </div>
            <ArrowUpRight size={20} className="text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* TABELA DE GERENCIAMENTO */}
      <div className="bg-white border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] shadow-sm overflow-hidden mb-20">
        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse min-w-[320px] md:min-w-[800px]">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="p-4 md:p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest hidden md:table-cell">Competência</th>
                <th className="p-4 md:p-6 text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest">Detalhes do Lançamento</th>
                <th className="p-4 md:p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest hidden md:table-cell">Categoria</th>
                <th className="p-4 md:p-6 text-[9px] md:text-[10px] font-black uppercase text-gray-400 text-right tracking-widest">Financeiro</th>
                <th className="sticky right-0 z-10 bg-gray-50/95 md:bg-gray-50/50 p-4 md:p-6 text-[9px] md:text-[10px] font-black uppercase text-gray-400 text-center tracking-widest border-l md:border-l-0 border-gray-100">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center text-gray-400 font-bold animate-pulse uppercase text-[10px] tracking-[0.2em]">Sincronizando base...</td></tr>
              ) : lancamentosFiltrados.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center text-gray-400 font-medium">Nenhum registro encontrado.</td></tr>
              ) : (
                lancamentosFiltrados.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="p-4 md:p-6 text-xs font-bold text-gray-900 hidden md:table-cell">
                      {new Date(l.data_competencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </td>
                    <td className="p-4 md:p-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] md:text-sm font-bold text-gray-900 block truncate max-w-[140px] md:max-w-none">{l.descricao}</span>
                        <span className="text-[9px] md:text-[10px] text-gray-400 uppercase font-black">{l.origem}</span>
                        <span className="md:hidden block text-[9px] text-blue-500/70 font-bold mt-0.5">
                          {new Date(l.data_competencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 md:p-6 hidden md:table-cell">
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[9px] font-black uppercase tracking-tighter">
                        {l.categoria}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="md:hidden inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[8px] font-black uppercase tracking-tighter mb-1">
                          {l.categoria}
                        </span>
                        <span className={`font-black text-[11px] md:text-sm ${l.valor < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(l.valor)}
                        </span>
                      </div>
                    </td>
                    <td className="sticky right-0 z-10 bg-white/95 md:bg-transparent p-4 md:p-6 border-l md:border-l-0 border-gray-100">
                      <div className="flex items-center justify-center gap-1 md:gap-2">
                        <button 
                          onClick={() => setEditingItem({...l, valor: Math.abs(l.valor)})}
                          className="p-1.5 md:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit3 size={16} className="md:w-[18px]" />
                        </button>
                        <button 
                          onClick={() => handleDelete(l.id)}
                          className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} className="md:w-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO - AJUSTADO PARA NÃO EXTRAPOLAR A TELA */}
      {editingItem && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            
            {/* Header Fixo */}
            <div className={`p-6 md:p-8 flex items-center justify-between text-white flex-shrink-0 ${editingItem.natureza === 'Receita' ? 'bg-emerald-600' : 'bg-orange-500'}`}>
              <div>
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight">Editar Registro</h3>
                <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">{editingItem.natureza}</p>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Formulário com Scroll Interno */}
            <form onSubmit={handleUpdate} className="p-6 md:p-8 space-y-4 md:space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {msgFeedback && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-tight animate-in fade-in ${msgFeedback.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {msgFeedback.tipo === 'sucesso' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {msgFeedback.texto}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Descrição</label>
                <input required type="text" value={editingItem.descricao}
                  className="w-full px-5 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-500 transition-all"
                  onChange={(e) => setEditingItem({...editingItem, descricao: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Valor (R$)</label>
                  <input required type="number" step="0.01" value={editingItem.valor}
                    className="w-full px-5 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-500 transition-all"
                    onChange={(e) => setEditingItem({...editingItem, valor: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Data</label>
                  <input required type="date" value={editingItem.data_competencia}
                    className="w-full px-5 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-500 transition-all"
                    onChange={(e) => setEditingItem({...editingItem, data_competencia: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Categoria</label>
                  <input required type="text" value={editingItem.categoria}
                    className="w-full px-5 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-500 transition-all"
                    onChange={(e) => setEditingItem({...editingItem, categoria: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Instituição</label>
                  <input required type="text" value={editingItem.origem}
                    className="w-full px-5 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-500 transition-all"
                    onChange={(e) => setEditingItem({...editingItem, origem: e.target.value})} />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saveLoading}
                className={`w-full py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-xl transition-all flex items-center justify-center gap-3 mt-4 flex-shrink-0 ${editingItem.natureza === 'Receita' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-500 hover:bg-orange-600'}`}
              >
                {saveLoading ? "Processando..." : <><Save size={18} /> Salvar Alterações</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}