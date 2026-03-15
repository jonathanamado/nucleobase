"use client";

import React, { useState, useEffect } from "react";
import { 
  Save, CreditCard, Wallet, Calendar, 
  Tag, DollarSign, CheckCircle2, Layers, Repeat, 
  Rocket, Activity, Clock, AlertCircle, BarChart3, ArrowRight, LineChart, Zap, X, Instagram, Edit3
} from "lucide-react";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LancamentosPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [showAviso, setShowAviso] = useState(false);
  const [ultimosLancamentos, setUltimosLancamentos] = useState<any[]>([]);

  const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().split('T')[0];
  };

  const getNextMonth = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toISOString().slice(0, 7);
  };

  const getMaxRecurrenceDate = () => {
    const now = new Date();
    const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    return nextYear.toISOString().split('T')[0];
  };

  const maxDate = getMaxRecurrenceDate();

  const categoriasDespesa: { [key: string]: string[] } = {
    "Alimentação": ["Mercado", "Feira", "Padaria", "Suplementos", "Outros"],
    "Assinaturas & Serviços": ["Streaming", "Software/SaaS", "Internet", "Telefone"],
    "Compras": ["Roupas", "Eletrônicos", "Casa", "Beleza", "Pet Shop"],
    "Educação": ["Curso/Treinamento", "Faculdade", "Livros"],
    "Investimentos": ["Ações/FIIs", "Cripto", "Renda Fixa"],
    "Lazer": ["Viagem", "Hospedagem", "Cinema", "Bares/Festas"],
    "Moradia": ["Aluguel/Condomínio", "Energia", "Água", "Gás"],
    "Saúde": ["Farmácia", "Consulta", "Plano de Saúde"],
    "Transporte": ["Combustível", "Uber/99", "Manutenção"],
    "Outros": ["Imprevistos", "Taxas Bancárias"]
  };

  const categoriasReceita: { [key: string]: string[] } = {
    "Salário": ["Salário Base", "13º Salário", "Férias", "Bônus/PLR"],
    "Proventos": ["Dividendos", "Juros S/ Capital", "Rendimentos FII"],
    "Freelance": ["Projetos", "Consultoria"],
    "Vendas": ["Comissões", "Venda de Ativos"],
    "Reembolso": ["Empresa", "Saúde"],
    "Outros": ["Presentes", "Restituição IR", "Prêmios"]
  };

  const initialFormState = {
    tipo_origem: "CONTA_CORRENTE",
    origem: "",
    cartao_nome: "",
    descricao: "",
    valorTotal: 0,
    dataCompetencia: getLocalDate(),
    natureza: "Natureza",
    categoria: "",
    sub_categoria: "",
    projeto: "Pessoal",
    tipo_de_custo: "Variável",
    parcelado: false,
    parcelasTotais: 1,
    fatura_mes: getNextMonth(),
    fixo_ate: ""
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchUltimos = async (id: string) => {
    const { data } = await supabase
      .from("lancamentos_financeiros")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setUltimosLancamentos(data);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        fetchUltimos(session.user.id);
      }
    };
    getUser();

    const avisoVisto = localStorage.getItem("aviso-eficiencia-visto");
    
    if (!avisoVisto) {
      const timer = setTimeout(() => {
        setShowAviso(true);
        localStorage.setItem("aviso-eficiencia-visto", "true");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !userId) return;

    const valorBase = typeof formData.valorTotal === "string" ? parseFloat(formData.valorTotal) : formData.valorTotal;
    const valorFinal = formData.natureza === "Despesa" 
      ? -Math.abs(valorBase) 
      : Math.abs(valorBase);

    const payload = {
      ...formData,
      valorTotal: valorFinal,
      fatura_mes: formData.tipo_origem === "CONTA_CORRENTE" ? "" : formData.fatura_mes,
      user_id: userId
    };

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch("/api/lancamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        if (response.status === 409 || errorBody.message?.includes("duplicate") || errorBody.error?.includes("unique_constraint")) {
          throw new Error("Registro duplicado: Este lançamento já existe com a mesma descrição, valor, data e origem.");
        }
        throw new Error(errorBody.message || "Erro ao salvar");
      }
      
      setSucesso(true);
      setFormData(initialFormState);
      fetchUltimos(userId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSucesso(false), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isReceita = formData.natureza === "Receita";

  return (
    <div className="w-full min-h-screen animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative bg-white">
      
      {showAviso && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
              <Zap size={32} className="text-orange-500 fill-orange-500 animate-pulse" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-3 tracking-tight">Nota de Eficiência</h4>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
              A importação via "Upload arquivo" é a solução <span className="text-orange-600 font-bold">mais rápida</span> no seu processo de múltiplos lançamentos.
            </p>
            <button 
              onClick={() => setShowAviso(false)}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 items-end px-4 md:px-0">
        <div className="lg:col-span-7">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight flex items-center flex-wrap">
            <span>Gestão de Lançamentos<span className="text-orange-500">.</span></span>
            <Activity size={32} className="text-orange-500 skew-x-12 ml-4" strokeWidth={1.5} />
          </h1>
          <h2 className="text-base text-gray-600 w-full font-bold leading-tight mb-4 lg:mb-0">
            Realize lançamentos via tela ou importação (múltiplos registros).
          </h2>
        </div>

        <div className="lg:col-span-5">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/lancamentos/integrar" className="relative flex flex-col items-center text-center bg-gray-50 border border-gray-200 rounded-2xl py-4 px-2 hover:bg-emerald-50 hover:border-emerald-200 transition-all group shadow-sm"> 
              <div className="absolute -top-2 -right-1 bg-blue-600 text-white text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">Em desenvolvimento</div>
              <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] text-gray-400 mb-2 group-hover:text-emerald-500 transition-colors">Automação Cloud</span>
              <div className="flex items-center gap-1 sm:gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[8px] sm:text-[10px] font-bold text-gray-500">Integração em nuvem </span>
              </div>
            </Link>
            <Link href="/lancamentos/importar" className="relative flex flex-col items-center text-center bg-orange-50/30 border-2 border-orange-200 rounded-2xl py-4 px-2 hover:bg-orange-50 hover:border-orange-300 transition-all group shadow-sm"> 
              <div className="absolute -top-2 -right-1 bg-orange-500 text-white text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm animate-bounce">Recomendado</div>
              <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] text-orange-600 mb-2 transition-colors">Upload Arquivo</span>
              <div className="flex items-center gap-1 sm:gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                  <span className="text-[8px] sm:text-[10px] font-bold text-gray-500">Importação dinâmica</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0">
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-4">
          Formulário em 3 etapas <div className="h-px bg-gray-200 flex-1"></div>
        </h3>

        {sucesso && (
          <div className="mb-8 p-6 bg-emerald-500 text-white rounded-[2rem] flex items-center gap-4 animate-in fade-in slide-in-from-left-4 shadow-lg border-l-8 border-emerald-600">
            <CheckCircle2 size={24} />
            <div>
              <p className="font-bold text-sm uppercase">Sucesso no Processamento</p>
              <p className="text-xs opacity-90">O valor foi contabilizado corretamente na sua base.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-7 flex flex-col h-full space-y-10">
            <section className="flex-1 flex flex-col bg-white rounded-[2.5rem] p-8 border border-gray-100 border-t-4 border-t-blue-600 shadow-sm transition-all">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-gray-200"></span> 01. Origem dos Lançamentos
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, tipo_origem: "CONTA_CORRENTE", parcelado: false})}
                  className={`p-4 sm:p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col items-start ${formData.tipo_origem === "CONTA_CORRENTE" ? 'border-blue-600 bg-blue-50/30 shadow-md' : 'border-gray-100 bg-white'}`}
                >
                  <div className={`p-3 rounded-xl w-fit mb-4 ${formData.tipo_origem === "CONTA_CORRENTE" ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                    <Wallet size={20} />
                  </div>
                  <span className="block font-bold text-[10px] sm:text-sm text-gray-900 uppercase leading-tight">Conta Corrente</span>
                </button>

                <button
                  type="button"
                  disabled={isReceita}
                  onClick={() => setFormData({...formData, tipo_origem: "CARTAO"})}
                  className={`p-4 sm:p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col items-start ${formData.tipo_origem === "CARTAO" ? 'border-blue-600 bg-blue-50/30 shadow-md' : 'border-gray-100 bg-white'} disabled:opacity-40 disabled:grayscale`}
                >
                  <div className={`p-3 rounded-xl w-fit mb-4 ${formData.tipo_origem === "CARTAO" ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                    <CreditCard size={20} />
                  </div>
                  <span className="block font-bold text-[10px] sm:text-sm text-gray-900 uppercase leading-tight">Cartão de Crédito</span>
                </button>
              </div>
              <input required type="text" placeholder="Instituição (Ex: Nubank)" value={formData.origem}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm shadow-sm mt-auto"
                  onChange={(e) => setFormData({...formData, origem: e.target.value})} />
            </section>

            <section className="flex-1 flex flex-col bg-white rounded-[2.5rem] p-8 border border-gray-100 border-t-4 border-t-blue-600 shadow-sm transition-all">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-gray-200"></span> 02. Detalhes Financeiros
              </h3>
              <div className="space-y-4">
                <input required type="text" placeholder="Descrição do Lançamento" value={formData.descricao}
                  className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm shadow-sm"
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <DollarSign className={`absolute left-5 top-1/2 -translate-y-1/2 ${isReceita ? 'text-emerald-500' : 'text-red-500'}`} size={18} />
                    <input required type="number" step="0.01" placeholder="Valor Total (R$)" value={formData.valorTotal || ""}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm shadow-sm"
                      onChange={(e) => setFormData({...formData, valorTotal: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input required type="date" value={formData.dataCompetencia}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm shadow-sm text-gray-600"
                      onChange={(e) => setFormData({...formData, dataCompetencia: e.target.value})} />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 h-full">
            <div className={`rounded-[2.5rem] p-8 shadow-2xl transition-all duration-500 border-t-4 h-full flex flex-col ${isReceita ? 'bg-emerald-950 border-emerald-500' : 'bg-gray-900 border-orange-500'}`}>
              <div className="space-y-8 flex-1">
                <div>
                  <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 ${isReceita ? 'text-emerald-400' : 'text-orange-400'}`}>
                    <span className={`w-8 h-px ${isReceita ? 'bg-emerald-400/30' : 'bg-orange-400/30'}`}></span> 03. Classificação
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Natureza</label>
                      <select required className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500"
                        value={formData.natureza} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData, 
                            natureza: val,
                            tipo_de_custo: val === "Receita" ? "Fixo" : "Variável",
                            tipo_origem: val === "Receita" ? "CONTA_CORRENTE" : formData.tipo_origem,
                            categoria: "",
                            sub_categoria: "",
                            fixo_ate: "" 
                          });
                        }}>
                        <option value="Despesa" className="bg-gray-900">Despesa</option>
                        <option value="Receita" className="bg-gray-900">Receita</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Tipo de Custo</label>
                      <select required className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-xs text-white outline-none disabled:opacity-50"
                        value={isReceita ? "Fixo" : formData.tipo_de_custo} 
                        disabled={isReceita}
                        onChange={(e) => setFormData({...formData, tipo_de_custo: e.target.value})}>
                        {isReceita ? <option value="Fixo">Fixo (Receita)</option> : (
                          <>
                            <option value="Variável" className="bg-gray-900">Variável</option>
                            <option value="Fixo" className="bg-gray-900">Fixo</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Categoria</label>
                      <input list="cat-list" required placeholder="Escolha..."
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-xs text-white outline-none"
                        value={formData.categoria} 
                        onChange={(e) => setFormData({...formData, categoria: e.target.value, sub_categoria: ""})} />
                      <datalist id="cat-list">
                        {Object.keys(isReceita ? categoriasReceita : categoriasDespesa).map((c, i) => <option key={i} value={c} />)}
                      </datalist>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Sub-categoria</label>
                      <input list="sub-list" placeholder="Escolha..."
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-xs text-white outline-none"
                        value={formData.sub_categoria} 
                        onChange={(e) => setFormData({...formData, sub_categoria: e.target.value})} />
                      <datalist id="sub-list">
                        {(isReceita ? categoriasReceita : categoriasDespesa)[formData.categoria]?.map((s, i) => <option key={i} value={s} />)}
                      </datalist>
                    </div>
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-top-2">
                    {(formData.tipo_de_custo === "Fixo" || isReceita) && (
                     <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 mb-4">
                       <p className="text-[10px] text-blue-400 font-bold uppercase mb-2">Recorrência até:</p>
                       <input 
                          type="date" 
                          max={maxDate}
                          className="w-full bg-white/5 text-white text-xs p-2 rounded" 
                          value={formData.fixo_ate}
                          onChange={(e) => setFormData({...formData, fixo_ate: e.target.value})} 
                        />
                     </div>
                    )}
                    
                    {!isReceita && formData.tipo_origem === "CARTAO" && (
                     <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                       <div className="flex justify-between items-center mb-3">
                         <span className="text-[10px] text-orange-400 font-bold uppercase">Parcelamento ativo</span>
                         <input type="checkbox" checked={formData.parcelado} onChange={(e) => setFormData({...formData, parcelado: e.target.checked})} />
                       </div>
                       {formData.parcelado && (
                         <div className="flex gap-2">
                           <input type="number" placeholder="Qtd" className="w-1/2 bg-white/5 text-white p-2 rounded text-xs" onChange={(e) => setFormData({...formData, parcelasTotais: parseInt(e.target.value)})} />
                           <input type="month" value={formData.fatura_mes} className="w-1/2 bg-white/5 text-white p-2 rounded text-xs" onChange={(e) => setFormData({...formData, fatura_mes: e.target.value})} />
                         </div>
                       )}
                     </div>
                    )}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <button type="submit" disabled={loading}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl flex items-center justify-center gap-3 text-white ${isReceita ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-900/20'}`}>
                  {loading ? "Processando..." : <><Save size={18} /> {isReceita ? 'Confirmar Receita' : 'Salvar Despesa'}</>}
                </button>

                <Link 
                  href="/lancamentos/gerenciar"
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 text-amber-400 bg-amber-400/5 border border-amber-400/20 hover:bg-amber-400/10 hover:border-amber-400/40 hover:text-amber-300 shadow-lg shadow-black/20"
                >
                  <Edit3 size={16} className="animate-pulse" /> 
                  Editar lançamentos
                </Link>
              </div>
            </div>
          </div>
        </form>

        <div className="mt-20">
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-4">
            Histórico Recente <div className="h-px bg-gray-100 flex-1"></div>
          </h3>

          <p className="text-sm text-gray-500 font-medium mb-8">
            Confira abaixo o link rápido para seu Painel de BI e a listagem dos seus últimos registros processados.
          </p>

          <div className="mb-10 p-8 bg-blue-600 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-blue-900/10 group">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <BarChart3 className="text-white" size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-bold tracking-tight mb-1">Painel de Resultados</h4>
                  <p className="text-blue-100 text-sm font-medium opacity-90">
                    Seus lançamentos são processados em tempo real. Navegue e faça sua gestão online.
                  </p>
                </div>
              </div>
              
              <Link 
                href="/resultados" 
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all flex items-center gap-3 shadow-lg active:scale-95 whitespace-nowrap"
              >
                Acessar Painel <ArrowRight size={16} />
              </Link>
            </div>
            <Zap size={200} className="absolute -right-16 -bottom-16 text-white opacity-10 -rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-700" />
          </div>

          <div className="overflow-x-auto bg-white border border-gray-100 rounded-[2.5rem] shadow-sm mb-20">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Data</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Descrição</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Categoria</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 text-right tracking-widest">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ultimosLancamentos.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-6 text-xs font-bold text-gray-900">{new Date(l.data_competencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                    <td className="p-6">
                      <span className="text-sm font-bold text-gray-900 block">{l.descricao}</span>
                      <span className="text-[10px] text-gray-400 uppercase font-black">{l.origem}</span>
                    </td>
                    <td className="p-6 text-xs font-bold text-gray-500 uppercase">{l.categoria}</td>
                    <td className={`p-6 font-black text-sm text-right ${l.valor < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(l.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-24 flex items-center gap-4 mb-12">
          <div className="h-px bg-gray-200 flex-1"></div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
            Conecte-se
          </h3>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="max-w-3xl mb-12">
            <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
              Fique por dentro <br className="md:hidden"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
            </h4>
            <p className="text-gray-500 font-medium text-sm md:text-base">
              Insights, novidades e bastidores da Nucleobase diretamente no seu feed.
            </p>
          </div>
          
          <a 
            href="https://www.instagram.com/nucleobase.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
              
              <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[2.2rem] md:rounded-[2.5rem] flex items-center justify-center text-white shadow-xl relative z-10 group-hover:rotate-6 transition-all duration-500">
                <span className="flex items-center justify-center">
                   <Instagram className="w-12 h-12 md:w-14 md:h-14" strokeWidth={1.5} />
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-pink-500 transition-colors">@nucleobase.app</span>
              <div className="h-1 w-0 bg-pink-500 mt-2 group-hover:w-full transition-all duration-500 rounded-full"></div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}