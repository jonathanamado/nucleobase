"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Save, CreditCard, Wallet, Calendar, 
  Tag, DollarSign, CheckCircle2, Layers, Repeat, 
  Rocket, Activity, Plus, FileUp, Zap, Clock, AlertCircle 
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
  const [erroValidacao, setErroValidacao] = useState(false);
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

  const categoriasConfig: { [key: string]: string[] } = {
    "Alimentação": ["Mercado", "Feira", "Padaria", "Suplementos", "Outros"],
    "Assinaturas & Serviços": ["Streaming (Netflix/Spotify)", "Software/SaaS", "Internet", "Telefone", "iCloud/Google Drive"],
    "Compras": ["Roupas", "Eletrônicos", "Casa/Decoração", "Beleza/Cosméticos", "Pet Shop"],
    "Educação": ["Curso/Treinamento", "Faculdade/Escola", "Livros", "Eventos/Congressos"],
    "Empréstimos": ["Parcela Empréstimo", "Juros", "Amortização"],
    "Impostos": ["IPTU", "IPVA", "Imposto de Renda", "Taxas Governamentais"],
    "Investimentos": ["Ações/FIIs", "Criptoativos", "Renda Fixa", "Previdência Privada"],
    "Lazer": ["Viagem", "Hospedagem", "Cinema/Teatro", "Hobbies", "Bares/Festas"],
    "Moradia": ["Aluguel/Condomínio", "Energia", "Água", "Gás", "Manutenção/Reforma"],
    "Presentes": ["Aniversário", "Datas Comemorativas", "Doações"],
    "Reserva de Emergência": ["Aporte Reserva"],
    "Restaurante": ["Restaurante", "Delivery/iFood", "Cafeteria", "Lanches"],
    "Saúde": ["Farmácia", "Consulta Médica", "Exames", "Plano de Saúde", "Dentista", "Terapia"],
    "Transporte": ["Combustível", "Uber/99", "Estacionamento", "Seguro Auto", "Manutenção Veículo", "Transporte Público"],
    "Viagem": ["Passagens", "Hospedagem", "Seguro Viagem", "Alimentação Viagem"],
    "Outros": ["Imprevistos", "Taxas Bancárias", "Saque Dinheiro"]
  };

  const categoriasSugeridas = Object.keys(categoriasConfig);
  
  const initialFormState = {
    tipo_origem: "CONTA_CORRENTE",
    origem: "",
    cartao_nome: "",
    descricao: "",
    valorTotal: 0,
    dataCompetencia: getLocalDate(),
    natureza: "Despesa",
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
    const { data, error } = await supabase
      .from("lancamentos_financeiros")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(5);
    
    if (data) setUltimosLancamentos(data);
    if (error) console.error("Erro ao buscar lançamentos:", error);
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (formData.tipo_de_custo === "Fixo" && formData.fixo_ate) {
      if (new Date(formData.fixo_ate) < new Date(formData.dataCompetencia)) {
        setErroValidacao(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setErroValidacao(false), 5000);
        return;
      }
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const response = await fetch("/api/lancamentos", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ ...formData, user_id: userId }),
      });
      if (!response.ok) throw new Error("Erro ao salvar");
      setSucesso(true);
      setFormData(initialFormState);
      fetchUltimos(userId);
      setTimeout(() => setSucesso(false), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 lg:px-8 pt-0 mt-0 max-w-[1600px] mx-auto">
      
      {/* HEADER SECTION ADJUSTED */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10 mt-0 pt-4">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center flex-wrap">
            <span>Lançamentos<span className="text-orange-500">.</span></span>
            <Activity size={40} className="text-orange-500 skew-x-12 opacity-20 ml-4 hidden sm:block" strokeWidth={1.5} />
          </h1>
          <h2 className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed mt-1">
            Alimente sua base de dados com precisão.
          </h2>
        </div>

        {/* FIX: Cards de Integração com grid responsivo e sem overflow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full xl:w-[45%]">
          <Link 
            href="/lancamentos/importar" 
            className="flex flex-col items-center text-center bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 hover:bg-gray-100 hover:border-orange-200 transition-all cursor-pointer group shadow-sm"
          > 
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 leading-none mb-2 group-hover:text-orange-500 transition-colors">
                Upload Arquivo XLS
            </span>
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shrink-0"></span>
                <span className="text-[10px] font-bold text-gray-500 leading-tight">
                Importação Dinâmica
                </span>
            </div>
          </Link>

          <Link 
            href="/lancamentos/integrar" 
            className="flex flex-col items-center text-center bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 hover:bg-gray-100 hover:border-emerald-200 transition-all cursor-pointer group shadow-sm"
          > 
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 leading-none mb-2 group-hover:text-emerald-500 transition-colors">
                Integração API
            </span>
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="text-[10px] font-bold text-gray-500 leading-tight">
                Automação Integrada
                </span>
            </div>
          </Link>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Formulário de Entrada <div className="h-px bg-gray-200 flex-1"></div>
        <Rocket size={20} className="text-orange-500 -rotate-45" />
      </h3>

      {/* ALERT MESSAGES... (código omitido para brevidade, mantido igual ao original) */}
      {sucesso && (
        <div className="mb-8 p-6 bg-orange-500 text-white rounded-[2rem] flex items-center gap-4 animate-in fade-in slide-in-from-left-4 shadow-lg shadow-orange-500/20 border-l-8 border-orange-600">
          <CheckCircle2 size={24} className="shrink-0 text-white" />
          <div>
            <p className="font-bold text-sm uppercase tracking-tight">Sucesso no Processamento</p>
            <p className="text-xs opacity-90 font-medium">Seus dados foram registrados com sucesso.</p>
          </div>
        </div>
      )}

      {erroValidacao && (
        <div className="mb-8 p-6 bg-red-600 text-white rounded-[2rem] flex items-center gap-4 animate-in fade-in slide-in-from-left-4 shadow-lg shadow-red-500/20 border-l-8 border-red-800">
          <AlertCircle size={24} className="shrink-0 text-white" />
          <div>
            <p className="font-bold text-sm uppercase tracking-tight">Revisar erros</p>
            <p className="text-xs opacity-90 font-medium">Data de recorrência inválida.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* LADO ESQUERDO: ORIGEM E DETALHES */}
        <div className="lg:col-span-7 space-y-10">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-gray-200"></span> 01. Origem dos Recursos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setFormData({...formData, tipo_origem: "CONTA_CORRENTE", parcelado: false, parcelasTotais: 1})}
                className={`p-6 rounded-[2rem] border-2 transition-all text-left group ${formData.tipo_origem === "CONTA_CORRENTE" ? 'border-orange-500 bg-orange-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
              >
                <div className={`p-3 rounded-xl w-fit mb-4 transition-colors ${formData.tipo_origem === "CONTA_CORRENTE" ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                   <Wallet size={20} />
                </div>
                <span className="block font-bold text-sm text-gray-900 uppercase tracking-tight">Conta Corrente</span>
                <span className="text-[10px] text-gray-400 font-medium">Débito direto ou Pix</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({...formData, tipo_origem: "CARTAO"})}
                className={`p-6 rounded-[2rem] border-2 transition-all text-left group ${formData.tipo_origem === "CARTAO" ? 'border-orange-500 bg-orange-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
              >
                <div className={`p-3 rounded-xl w-fit mb-4 transition-colors ${formData.tipo_origem === "CARTAO" ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                   <CreditCard size={20} />
                </div>
                <span className="block font-bold text-sm text-gray-900 uppercase tracking-tight">Cartão de Crédito</span>
                <span className="text-[10px] text-gray-400 font-medium">Gestão de faturas</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required type="text" placeholder="Instituição (Ex: Nubank)" value={formData.origem}
                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-sm shadow-sm transition-all"
                onChange={(e) => setFormData({...formData, origem: e.target.value})} />
              
              {formData.tipo_origem === "CARTAO" ? (
                <input required type="text" placeholder="Nome do Cartão (Ex: Black)" value={formData.cartao_nome}
                  className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-sm shadow-sm"
                  onChange={(e) => setFormData({...formData, cartao_nome: e.target.value})} />
              ) : <div className="hidden sm:block"></div>}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-gray-200"></span> 02. Detalhes Financeiros
            </h3>
            <div className="space-y-4">
              <input required type="text" placeholder="Descrição do Lançamento" value={formData.descricao}
                className="w-full px-6 py-5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-sm shadow-sm"
                onChange={(e) => setFormData({...formData, descricao: e.target.value})} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input required type="number" step="0.01" placeholder="Valor Total (R$)" value={formData.valorTotal || ""}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-sm shadow-sm"
                    onChange={(e) => setFormData({...formData, valorTotal: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="relative group">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input required type="date" value={formData.dataCompetencia}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-sm shadow-sm text-gray-600"
                    onChange={(e) => setFormData({...formData, dataCompetencia: e.target.value})} />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* LADO DIREITO: CLASSIFICAÇÃO (O CARD ESCURO) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-gray-200"></span> 03. Classificação
          </h3>
          
          <div className="bg-gray-900 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl flex flex-col justify-between h-full group relative overflow-hidden transition-all hover:scale-[1.01]">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
              <Activity size={180} strokeWidth={1} className="text-orange-500" />
            </div>

            <div className="relative z-10 space-y-8 h-full flex flex-col">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-6 flex items-center gap-2">
                  <Layers size={14} /> Inteligência e Filtros
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Natureza</label>
                    <select required className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-xs text-white outline-none focus:ring-2 focus:ring-orange-500"
                      value={formData.natureza} onChange={(e) => setFormData({...formData, natureza: e.target.value})}>
                      <option value="Despesa" className="bg-gray-900">Despesa</option>
                      <option value="Receita" className="bg-gray-900">Receita</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Tipo de Custo</label>
                    <select required className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-xs text-white outline-none focus:ring-2 focus:ring-orange-500"
                      value={formData.tipo_de_custo} 
                      onChange={(e) => {
                        const isFixo = e.target.value === "Fixo";
                        setFormData({...formData, tipo_de_custo: e.target.value, parcelado: isFixo ? false : formData.parcelado, parcelasTotais: isFixo ? 1 : formData.parcelasTotais});
                      }}>
                      <option value="Variável" className="bg-gray-900">Variável</option>
                      <option value="Fixo" className="bg-gray-900">Fixo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2 flex items-center gap-2">
                      Categoria <span className="text-[8px] text-gray-600">(Livre/Sugestão)</span>
                    </label>
                    <input 
                      list="categorias-list"
                      required 
                      placeholder="Escolha ou digite..."
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-xs text-white outline-none focus:ring-2 focus:ring-orange-500"
                      value={formData.categoria} 
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      onChange={(e) => setFormData({...formData, categoria: e.target.value, sub_categoria: ""})}
                    />
                    <datalist id="categorias-list">
                      {categoriasSugeridas.map((cat, idx) => (
                        <option key={idx} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2 flex items-center gap-2">
                      Sub-categoria <span className="text-[8px] text-gray-600">(Livre/Opcional)</span>
                    </label>
                    <input 
                      list="subcategorias-list"
                      placeholder="Escolha ou digite..."
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-xs text-white outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      value={formData.sub_categoria} 
                      disabled={!formData.categoria}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      onChange={(e) => setFormData({...formData, sub_categoria: e.target.value})} 
                    />
                    <datalist id="subcategorias-list">
                      {formData.categoria && categoriasConfig[formData.categoria]?.map((sub, idx) => (
                        <option key={idx} value={sub} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {formData.tipo_de_custo === "Fixo" && (
                    <div className="p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20 space-y-3 animate-in zoom-in-95">
                      <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px] uppercase tracking-wider">
                        <Repeat size={14} /> Recorrência Automática
                      </div>
                      <input required type="date" value={formData.fixo_ate}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none"
                        onChange={(e) => setFormData({...formData, fixo_ate: e.target.value})} />
                    </div>
                  )}

                  {formData.tipo_origem === "CARTAO" && formData.tipo_de_custo !== "Fixo" && (
                    <div className="p-5 bg-orange-500/10 rounded-2xl border border-orange-500/20 space-y-4 animate-in zoom-in-95">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-orange-400 font-bold text-[10px] uppercase tracking-wider">
                          <Layers size={14} /> Ativar Parcelamento
                        </div>
                        <input type="checkbox" checked={formData.parcelado} className="w-5 h-5 accent-orange-500 cursor-pointer"
                          onChange={(e) => setFormData({...formData, parcelado: e.target.checked, parcelasTotais: e.target.checked ? 2 : 1})} />
                      </div>
                      {formData.parcelado && (
                        <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2">
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-orange-500/60 ml-1">Parcelas</label>
                            <input required type="number" min="2" placeholder="Ex: 12" value={formData.parcelasTotais}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-orange-500/50"
                              onChange={(e) => setFormData({...formData, parcelasTotais: parseInt(e.target.value) || 1})} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-orange-500/60 ml-1">Mês Início</label>
                            <input required type="month" value={formData.fatura_mes}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-orange-500/50"
                              onChange={(e) => setFormData({...formData, fatura_mes: e.target.value})} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-6">
                <button type="submit" disabled={loading}
                  className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-xl disabled:bg-gray-700 flex items-center justify-center gap-3">
                  {loading ? "Processando..." : <><Save size={18} /> Salvar Lançamento</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* TABLE SECTION (WRAPPER FOR SCROLL) */}
      <div className="mt-20">
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
          Histórico Recente <div className="h-px bg-gray-100 flex-1"></div>
        </h3>
        <div className="overflow-x-auto bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Data e Hora</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Descrição / Origem</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Categoria</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Tipo de Custo</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 text-right tracking-widest">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ultimosLancamentos.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">
                        {new Date(l.data_competencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {new Date(l.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-bold text-gray-900 block group-hover:text-orange-500 transition-colors">{l.descricao}</span>
                    <div className="text-[10px] text-gray-400 uppercase font-black tracking-tight mt-1 flex items-center gap-2">
                       {l.origem} {l.parcelas_total > 1 ? `• ${l.parcela_atual}/${l.parcelas_total}` : ''}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                      <Tag size={12} className="text-orange-500" />
                      {l.categoria || 'Geral'}
                      {l.sub_categoria && <span className="text-[10px] opacity-60 ml-1">/ {l.sub_categoria}</span>}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                      <Zap size={12} className={l.tipo_de_custo === 'Fixo' ? 'text-blue-500' : 'text-gray-300'} />
                      {l.tipo_de_custo || 'Variável'}
                    </div>
                  </td>
                  <td className="p-6 font-black text-sm text-gray-900 text-right whitespace-nowrap">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(l.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}