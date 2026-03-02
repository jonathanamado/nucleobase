"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, TrendingUp, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, 
  PieChart as PieIcon, Info, Lock, 
  PlusCircle, LayoutDashboard, ArrowRight,
  Database, Eye, EyeOff, Mail, Key, UserPlus,
  X, LifeBuoy, LogOut, Sparkles, Target, 
  Layers, Instagram, MessageCircle, Send,
  Zap, Rocket, Crown, Timer, Cpu, Microscope,
  UserCheck
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend
} from 'recharts';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardResultados() {
  const [activeTab, setActiveTab] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [userName, setUserName] = useState("");
  const [chartType, setChartType] = useState<'MENSAL' | 'ACUMULADO'>('MENSAL');
  
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonthCategory, setSelectedMonthCategory] = useState<string>("GERAL");
  
  const [rawLancamentos, setRawLancamentos] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartDataAcumulado, setChartDataAcumulado] = useState<any[]>([]);
  
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableMonthsForYear, setAvailableMonthsForYear] = useState<string[]>([]);
  const [mesesCategoriasMap, setMesesCategoriasMap] = useState<any>({});
  const [anoCategoriasMap, setAnoCategoriasMap] = useState<any>({});
  
  const [stats, setStats] = useState({
    totalGeral: 0, 
    totalReceita: 0,
    totalDespesa: 0,
    count: 0,
    media: 0,
    projecao: 0
  });

  const [showAuthForm, setShowAuthForm] = useState<'login' | null>(null);
  const [slug, setSlug] = useState(""); 
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const fetchUserData = async (user: any) => {
    setIsLoggedIn(true);
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome_completo')
      .eq('id', user.id)
      .single();

    setUserName(profile?.nome_completo || user.user_metadata?.full_name || "Usuário");

    const { data: lancamentos, error } = await supabase
      .from('lancamentos_financeiros')
      .select('*')
      .eq('user_id', user.id)
      .order('data_competencia', { ascending: true });

    if (!error && lancamentos && lancamentos.length > 0) {
      setHasData(true);
      setRawLancamentos(lancamentos);
      processarDadosFinanceiros(lancamentos, "TODOS");
    } else {
      setHasData(false);
    }
  };

  const processarDadosFinanceiros = (dados: any[], filtro: string) => {
    let receitaTotal = 0;
    let despesaTotal = 0;
    
    const mesesMap: { [key: string]: { gastos: number, receita: number } } = {};
    const localMesesCategoriasMap: { [key: string]: { [key: string]: number } } = {};
    const localAnoCategoriasMap: { [key: string]: { [key: string]: number } } = {};
    const anosEncontrados = new Set<string>();
    const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    const dadosFiltrados = filtro === "TODOS" 
      ? dados 
      : dados.filter(item => item.tipo_origem === filtro);

    dadosFiltrados.forEach(item => {
      const valorNumerico = Number(item.valor);
      const valorAbsoluto = Math.abs(valorNumerico);
      const isReceita = valorNumerico > 0;
      const cat = item.categoria || "Outros";
      
      const data = new Date(item.data_competencia);
      const ano = data.getUTCFullYear().toString();
      const mesNome = nomesMeses[data.getUTCMonth()];
      const chaveMesAno = `${mesNome}/${ano}`;

      anosEncontrados.add(ano);

      if (isReceita) {
        receitaTotal += valorAbsoluto;
      } else {
        despesaTotal += valorAbsoluto;
        
        if (!localAnoCategoriasMap[ano]) localAnoCategoriasMap[ano] = {};
        if (!localAnoCategoriasMap[ano][cat]) localAnoCategoriasMap[ano][cat] = 0;
        localAnoCategoriasMap[ano][cat] += valorAbsoluto;

        if (!localMesesCategoriasMap[chaveMesAno]) localMesesCategoriasMap[chaveMesAno] = {};
        if (!localMesesCategoriasMap[chaveMesAno][cat]) localMesesCategoriasMap[chaveMesAno][cat] = 0;
        localMesesCategoriasMap[chaveMesAno][cat] += valorAbsoluto;
      }

      if (!mesesMap[mesNome]) mesesMap[mesNome] = { gastos: 0, receita: 0 };
      if (isReceita) mesesMap[mesNome].receita += valorAbsoluto;
      else mesesMap[mesNome].gastos += valorAbsoluto;
    });

    const anosOrdenados = Array.from(anosEncontrados).sort((a, b) => b.localeCompare(a));
    setAvailableYears(anosOrdenados);
    if (!selectedYear && anosOrdenados.length > 0) setSelectedYear(anosOrdenados[0]);

    const mesesDisponiveis = nomesMeses.filter(mes => mesesMap[mes]);
    const dadosMensais = mesesDisponiveis.map(mes => ({
      name: mes,
      gastos: mesesMap[mes].gastos,
      receita: mesesMap[mes].receita
    }));

    let receitaAcum = 0;
    let despesaAcum = 0;
    const dadosAcumulados = mesesDisponiveis.map(mes => {
      receitaAcum += mesesMap[mes].receita;
      despesaAcum += mesesMap[mes].gastos;
      return { name: mes, gastos: despesaAcum, receita: receitaAcum };
    });

    const formatarBarras = (map: any) => Object.keys(map)
      .map(cat => ({ category: cat, gastos: map[cat] }))
      .sort((a, b) => b.gastos - a.gastos)
      .slice(0, 5);

    setChartData(dadosMensais);
    setChartDataAcumulado(dadosAcumulados);
    
    const mesesFormatados: any = {};
    Object.keys(localMesesCategoriasMap).forEach(chave => {
      mesesFormatados[chave] = formatarBarras(localMesesCategoriasMap[chave]);
    });
    setMesesCategoriasMap(mesesFormatados);

    const anosFormatados: any = {};
    Object.keys(localAnoCategoriasMap).forEach(a => {
      anosFormatados[a] = formatarBarras(localAnoCategoriasMap[a]);
    });
    setAnoCategoriasMap(anosFormatados);

    setStats({
      totalGeral: receitaTotal - despesaTotal,
      totalReceita: receitaTotal,
      totalDespesa: despesaTotal,
      count: dadosFiltrados.length,
      media: despesaTotal / (dadosFiltrados.length || 1),
      projecao: (receitaTotal - despesaTotal) * 1.05 
    });
  };

  useEffect(() => {
    if (rawLancamentos.length > 0) processarDadosFinanceiros(rawLancamentos, activeTab);
  }, [activeTab, rawLancamentos]);

  useEffect(() => {
    const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const mesesDoAno = nomesMeses.filter(mes => mesesCategoriasMap[`${mes}/${selectedYear}`]);
    setAvailableMonthsForYear(mesesDoAno);
    setSelectedMonthCategory("GERAL");
  }, [selectedYear, mesesCategoriasMap]);

  const checkStatus = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await fetchUserData(session.user);
    setLoading(false);
  };

  useEffect(() => { checkStatus(); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const inputAcesso = slug.trim().toLowerCase();
    const isEmail = inputAcesso.includes("@");
    try {
      let emailParaLogin = "";
      if (isEmail) emailParaLogin = inputAcesso;
      else {
        const { data: profile } = await supabase.from('profiles').select('email').eq('slug', inputAcesso).maybeSingle();
        if (!profile?.email) { alert("ID de usuário não encontrado."); setAuthLoading(false); return; }
        emailParaLogin = profile.email;
      }
      const { error: authError } = await supabase.auth.signInWithPassword({ email: emailParaLogin, password });
      if (authError) throw new Error("Senha incorreta.");
      window.location.reload();
    } catch (err: any) { alert(err.message); } finally { setAuthLoading(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-blue-50 p-6 rounded-[2.5rem] text-blue-600 mb-8"><Lock size={48} strokeWidth={1.5} /></div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Privacidade em primeiro lugar.</h1>
        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">Para visualizar sua inteligência financeira, você precisa acessar sua conta.</p>
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button onClick={() => setShowAuthForm('login')} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold transition flex items-center gap-2">Entrar na conta <ArrowRight size={18} /></button>
          <a href="/cadastro" className="bg-white border border-gray-200 text-gray-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition flex items-center gap-2">Criar conta grátis</a>
        </div>
        {showAuthForm === 'login' && (
          <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-tight">Acesso Rápido</h3>
            <div className="space-y-4">
              <input type="text" placeholder="ID ou E-mail" required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold" onChange={(e) => setSlug(e.target.value)} />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Senha" required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold pr-10" onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <button disabled={authLoading} className="w-full bg-blue-600 text-white h-[52px] rounded-xl font-bold shadow-lg shadow-blue-100">{authLoading ? "Verificando..." : "Acessar Resultados"}</button>
            </div>
          </form>
        )}
      </div>
    );
  }

  if (!hasData) return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-orange-50 p-6 rounded-[2.5rem] text-orange-500 mb-8"><Database size={48} strokeWidth={1.5} /></div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">O motor precisa de combustível.</h1>
      <p className="text-gray-500 max-w-md mb-8">Olá, <span className="font-bold">{userName}</span>! Realize seu primeiro lançamento.</p>
      <a href="/lancamentos" className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2">Lançar agora <PlusCircle size={18} /></a>
    </div>
  );

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-4">
          <h3 className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></span>
            <LayoutDashboard size={14} /> Painel Exclusivo de {userName.split(' ')[0]}
          </h3>
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            Resultados<span className="text-blue-600">.</span>
            <Sparkles className="text-blue-500 animate-bounce" size={32} />
          </h1>
        </div>

        {/* BOTOES AJUSTADOS PARA LARGURA DO CARD (1/3 da linha no desktop) */}
        <div className="flex flex-col items-end gap-3 w-full md:w-1/3">
          <div className="flex gap-2 w-full">
            <a href="/lancamentos" className="flex-1 flex items-center justify-center gap-2 text-[10px] font-black text-white text-center hover:bg-orange-600 transition-colors bg-orange-500 px-3 py-3 rounded-xl uppercase tracking-widest shadow-sm shadow-orange-100">
              <PlusCircle size={12} /> Realizar lançamentos
            </a>
            <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors bg-gray-100 px-3 py-3 rounded-xl uppercase tracking-widest">
              <LogOut size={12} /> Encerrar Sessão
            </button>
          </div>
          <div className="flex bg-gray-100 p-1.5 rounded-xl w-full">
            {["TODOS", "CONTA_CORRENTE", "CARTAO"].map((tipo) => (
              <button key={tipo} onClick={() => setActiveTab(tipo)} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tipo ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}>{tipo.replace("_", " ")}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard title="Total Disponível (Saldo)" value={`R$ ${stats.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} trend="Receita - Despesa" isPositive={stats.totalGeral > 0} />
        <SummaryCard title="Total Receitas" value={`R$ ${stats.totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} trend="Entradas" icon={<ArrowUpRight size={20} className="text-emerald-500"/>} isPositive={true} />
        <SummaryCard title="Total Despesas" value={`R$ ${stats.totalDespesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} trend="Saídas" isNegative={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-600" /> 
              Comparativo Orçamentário (Real)
            </h3>

            <div className="flex bg-gray-50 p-1 rounded-xl self-end sm:self-auto">
              <button onClick={() => setChartType('MENSAL')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${chartType === 'MENSAL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>Mês a Mês</button>
              <button onClick={() => setChartType('ACUMULADO')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${chartType === 'ACUMULADO' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>Acumulado</button>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartType === 'MENSAL' ? chartData : chartDataAcumulado}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} tickFormatter={(val) => `R$ ${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(val: any) => `R$ ${Number(val).toLocaleString('pt-BR')}`} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
                <Area name="Receita" type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={3} fill="url(#colorReceita)" />
                <Area name="Despesa" type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={3} fill="url(#colorGastos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="bg-blue-600 border border-blue-700 rounded-[2.5rem] p-8 text-white">
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md"><Sparkles size={24} /></div>
            <h4 className="font-bold text-xl mb-3">{chartType === 'MENSAL' ? 'Visão Mensal' : 'Visão Estratégica'}</h4>
            <p className="text-blue-100 text-sm mb-8 leading-relaxed">
              {chartType === 'MENSAL' 
                ? 'Analise sua performance isolada de cada mês. Perfeito para o controle de boletos e metas imediatas.' 
                : 'Visualize o crescimento do seu patrimônio e gastos acumulados ao longo do ano.'}
            </p>
            <a href="/lancamentos" className="w-full bg-white text-blue-600 h-[60px] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">Novo Lançamento <ArrowRight size={18} /></a>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-6 flex-grow flex flex-col justify-center mt-6">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Status do Banco</h5>
            <p className="text-gray-600 text-xs flex items-center gap-2"><Database size={12} /> Conectado ao Supabase</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-10">
        <div className="flex items-center gap-4">
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
            Performance de Despesa x Segmento 
          </h3>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
            {availableYears.map(ano => (
              <button 
                key={ano} 
                onClick={() => {
                  setSelectedYear(ano);
                  setSelectedMonthCategory("GERAL");
                }} 
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedYear === ano ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}
              >
                {ano}
              </button>
            ))}
          </div>

          <div className="flex bg-gray-50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar max-w-full md:max-w-[500px]">
            <button 
              onClick={() => setSelectedMonthCategory("GERAL")} 
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedMonthCategory === "GERAL" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}
            >
              Geral do Ano
            </button>
            {availableMonthsForYear.map(mes => (
              <button 
                key={mes} 
                onClick={() => setSelectedMonthCategory(mes)} 
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedMonthCategory === mes ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}
              >
                {mes}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><Layers size={24} /></div>
            <h4 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Distribuição Crítica</h4>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              Análise focal de: <span className="text-blue-600 font-bold uppercase">{selectedMonthCategory === "GERAL" ? `Consolidado ${selectedYear}` : `${selectedMonthCategory} / ${selectedYear}`}</span>
            </p>
          </div>
          <div className="lg:col-span-8 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={selectedMonthCategory === "GERAL" 
                  ? (anoCategoriasMap[selectedYear] || [])
                  : (mesesCategoriasMap[`${selectedMonthCategory}/${selectedYear}`] || [])
                } 
                layout="vertical" 
                margin={{ left: 20, right: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} tickFormatter={(val) => `R$ ${val}`} />
                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#111827'}} width={100} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(val: any) => `R$ ${val.toLocaleString('pt-BR')}`} />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
                <Bar name="Despesa" dataKey="gastos" fill="#ef4444" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="relative py-12">
        <div className="flex items-center gap-6 mb-12">
          <div className="h-px bg-gradient-to-r from-transparent via-blue-100 to-blue-200 flex-1"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-blue-50 px-4 py-1.5 rounded-full flex items-center gap-2">
              <Sparkles size={14} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Horizonte de Inteligência</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">O que vem por aí?</h2>
          </div>
          <div className="h-px bg-gradient-to-l from-transparent via-blue-100 to-blue-200 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-dashed border-gray-200 p-8 rounded-[2.5rem] flex flex-col gap-4 opacity-60 grayscale hover:grayscale-0 transition-all">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Microscope size={20} /></div>
            <h5 className="font-bold text-gray-900 uppercase text-[11px] tracking-widest">Análise Preditiva</h5>
            <p className="text-xs text-gray-500 leading-relaxed">Algoritmos de IA que antecipam seus gastos fixos e alertam sobre desvios antes do fechamento do mês.</p>
          </div>
          <div className="bg-white border border-dashed border-gray-200 p-8 rounded-[2.5rem] flex flex-col gap-4 opacity-60 grayscale hover:grayscale-0 transition-all">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Target size={20} /></div>
            <h5 className="font-bold text-gray-900 uppercase text-[11px] tracking-widest">Metas Dinâmicas</h5>
            <p className="text-xs text-gray-500 leading-relaxed">Defina objetivos de economia e acompanhe em tempo real sua distância para a liberdade financeira.</p>
          </div>
          <div className="bg-white border border-dashed border-gray-200 p-8 rounded-[2.5rem] flex flex-col gap-4 opacity-60 grayscale hover:grayscale-0 transition-all">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Cpu size={20} /></div>
            <h5 className="font-bold text-gray-900 uppercase text-[11px] tracking-widest">Benchmarking</h5>
            <p className="text-xs text-gray-500 leading-relaxed">Compare sua eficiência de gastos com a média do mercado e descubra onde você está performando melhor.</p>
          </div>
          {/* CARD CONSULTORIA PRO */}
          <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-[2.5rem] flex flex-col gap-4 transition-all hover:shadow-xl hover:shadow-blue-100/50">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <UserCheck size={20} />
              </div>
              <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                <Crown size={10} /> PRO
              </span>
            </div>
            <h5 className="font-bold text-gray-900 uppercase text-[11px] tracking-widest">
              Consultoria
            </h5>
            <p className="text-xs text-blue-700/70 font-medium leading-relaxed">
              Análise técnica do seu relatório individual para oferecer uma visão profunda do seu perfil financeiro.
            </p>
            <a 
              href="/consultoria" 
              className="mt-2 w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-[0.98] text-center"
            >
              Solicitar Consultoria
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, trend, isPositive, isNegative, icon }: any) {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">{title}</p>
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">{value}</h3>
        <div className={`flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full w-fit ${isPositive ? 'bg-emerald-50 text-emerald-600' : isNegative ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
          {isPositive ? <ArrowUpRight size={10} /> : isNegative ? <ArrowDownRight size={10} /> : icon}
          {trend}
        </div>
      </div>
    </div>
  );
}