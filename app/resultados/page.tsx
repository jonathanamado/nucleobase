"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, 
  Lock, PlusCircle, Database, Eye, EyeOff, 
  Sparkles, Layers, Target, Microscope, 
  Wallet, CreditCard, Calendar, Mail, Send,
  LineChart, Instagram,
  ChevronLeft, ChevronRight, Edit3, UserPlus,
  Clock, Receipt, BarChart, Activity
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { createClient } from "@supabase/supabase-js";
import VisionOfensora from "./_components/VisionOfensora";
import VisionYoY from "./_components/VisionYoY";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardResultados() {
  const [activeTab, setActiveTab] = useState("TODOS");
  const [viewMode, setViewMode] = useState<'COMPETENCIA' | 'CAIXA'>('CAIXA'); 
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
  const [geralCategoriasMap, setGeralCategoriasMap] = useState<any[]>([]);
  const [currentMonthData, setCurrentMonthData] = useState({ receita: 0, despesa: 0, saldo: 0, nome: "" });
  const [stats, setStats] = useState({ totalGeral: 0, totalReceita: 0, totalDespesa: 0, count: 0, media: 0, projecao: 0 });
  const [slug, setSlug] = useState(""); 
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [kpiIndex, setKpiIndex] = useState(0); 

  const fetchUserData = async (user: any) => {
    setIsLoggedIn(true);
    const { data: profile } = await supabase.from('profiles').select('nome_completo').eq('id', user.id).single();
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
    const localGeralCategorias: { [key: string]: number } = {};
    const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const mesesFullMap: any = { "Janeiro": "Jan", "Fevereiro": "Fev", "Março": "Mar", "Abril": "Abr", "Maio": "Mai", "Junho": "Jun", "Julho": "Jul", "Agosto": "Ago", "Setembro": "Set", "Outubro": "Out", "Novembro": "Nov", "Dezembro": "Dez" };
    
    const hoje = new Date();
    const mesAtualNome = nomesMeses[hoje.getUTCMonth()];
    const anoAtualStr = hoje.getUTCFullYear().toString();
    const chaveAtual = `${mesAtualNome}/${anoAtualStr}`;
    const anosEncontrados = new Set<string>();
    let recMes = 0, desMes = 0;

    const dadosFiltrados = filtro === "TODOS" ? dados : dados.filter(item => {
        const itemOrigem = item.tipo_origem?.toUpperCase();
        if (filtro === "CARTAO") return itemOrigem === "CARTAO" || itemOrigem === "CARTÃO DE CRÉDITO";
        if (filtro === "CONTA_CORRENTE") return itemOrigem === "CONTA_CORRENTE" || itemOrigem === "CONTA CORRENTE";
        return itemOrigem === filtro;
    });

    dadosFiltrados.forEach(item => {
      const valorAbsoluto = Math.abs(Number(item.valor));
      const isReceita = item.natureza === "Receita"; 
      const cat = (item.categoria || "Outros").toString().trim() || "Outros";
      
      let itemAno = "";
      let mesNome = "";

      if (viewMode === 'CAIXA' && item.fatura_mes && item.fatura_mes !== "") {
        if (item.fatura_mes.includes("/")) {
          const [mParte, anoParte] = item.fatura_mes.split("/");
          itemAno = anoParte;
          mesNome = mesesFullMap[mParte] || mParte.substring(0, 3);
        } else if (item.fatura_mes.includes("-")) {
          const [anoF, mesF] = item.fatura_mes.split("-");
          itemAno = anoF;
          mesNome = nomesMeses[parseInt(mesF) - 1];
        }
      } 
      
      if (!mesNome || !itemAno) {
        const dataStr = item.data_competencia.includes('T') ? item.data_competencia : `${item.data_competencia}T00:00:00`;
        const data = new Date(dataStr);
        itemAno = data.getUTCFullYear().toString();
        mesNome = nomesMeses[data.getUTCMonth()];
      }

      const chaveMesAno = `${mesNome}/${itemAno}`;
      anosEncontrados.add(itemAno);

      if (chaveMesAno === chaveAtual) {
        if (isReceita) recMes += valorAbsoluto; else desMes += valorAbsoluto;
      }

      if (isReceita) { 
        receitaTotal += valorAbsoluto; 
      } else {
        despesaTotal += valorAbsoluto;
        if (!localAnoCategoriasMap[itemAno]) localAnoCategoriasMap[itemAno] = {};
        if (!localAnoCategoriasMap[itemAno][cat]) localAnoCategoriasMap[itemAno][cat] = 0;
        localAnoCategoriasMap[itemAno][cat] += valorAbsoluto;

        if (!localMesesCategoriasMap[chaveMesAno]) localMesesCategoriasMap[chaveMesAno] = {};
        if (!localMesesCategoriasMap[chaveMesAno][cat]) localMesesCategoriasMap[chaveMesAno][cat] = 0;
        localMesesCategoriasMap[chaveMesAno][cat] += valorAbsoluto;

        if (!localGeralCategorias[cat]) localGeralCategorias[cat] = 0;
        localGeralCategorias[cat] += valorAbsoluto;
      }

      if (!mesesMap[chaveMesAno]) mesesMap[chaveMesAno] = { gastos: 0, receita: 0 };
      if (isReceita) mesesMap[chaveMesAno].receita += valorAbsoluto; else mesesMap[chaveMesAno].gastos += valorAbsoluto;
    });

    setCurrentMonthData({ receita: recMes, despesa: desMes, saldo: recMes - desMes, nome: mesAtualNome });
    
    const anosOrdenados = Array.from(anosEncontrados).sort((a, b) => a.localeCompare(b));
    setAvailableYears(anosOrdenados);
    if (!selectedYear && anosOrdenados.length > 0) setSelectedYear(anosOrdenados.includes(anoAtualStr) ? anoAtualStr : anosOrdenados[0]);

    const chavesOrdenadas = Object.keys(mesesMap).sort((a, b) => {
        const [mesA, anoA] = a.split('/');
        const [mesB, anoB] = b.split('/');
        return anoA !== anoB ? anoA.localeCompare(anoB) : nomesMeses.indexOf(mesA) - nomesMeses.indexOf(mesB);
    });

    setChartData(chavesOrdenadas.map(chave => ({ 
      name: chave, 
      receita: mesesMap[chave].receita,
      gastos: mesesMap[chave].gastos 
    })));
    
    let rA = 0;
    let dA = 0;
    const dadosAcumulados = chavesOrdenadas.map(chave => { 
      rA += mesesMap[chave].receita; 
      dA += mesesMap[chave].gastos; 
      return { name: chave, receita: rA, gastos: dA }; 
    });
    setChartDataAcumulado(dadosAcumulados);

    const formatarBarras = (map: any) => Object.keys(map).map(cat => ({ category: cat, gastos: map[cat] })).sort((a, b) => b.gastos - a.gastos).slice(0, 10);
    
    const mF: any = {}; 
    Object.keys(localMesesCategoriasMap).forEach(k => { mF[k] = formatarBarras(localMesesCategoriasMap[k]); }); 
    setMesesCategoriasMap(mF);

    const aF: any = {}; 
    Object.keys(localAnoCategoriasMap).forEach(a => { aF[a] = formatarBarras(localAnoCategoriasMap[a]); }); 
    setAnoCategoriasMap(aF);
    
    setGeralCategoriasMap(formatarBarras(localGeralCategorias));
    setStats({ 
      totalGeral: receitaTotal - despesaTotal, 
      totalReceita: receitaTotal, 
      totalDespesa: despesaTotal, 
      count: dadosFiltrados.length, 
      media: despesaTotal / (chavesOrdenadas.length || 1), 
      projecao: (receitaTotal - despesaTotal) * 1.05 
    });
  };

  useEffect(() => { if (rawLancamentos.length > 0) processarDadosFinanceiros(rawLancamentos, activeTab); }, [activeTab, rawLancamentos, viewMode]);
  
  useEffect(() => { 
    const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    setAvailableMonthsForYear(nomesMeses.filter(mes => mesesCategoriasMap[`${mes}/${selectedYear}`]));
    setSelectedMonthCategory("GERAL");
  }, [selectedYear, mesesCategoriasMap]);

  useEffect(() => { 
    const checkStatus = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await fetchUserData(session.user);
      setLoading(false);
    };
    checkStatus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true);
    const inputAcesso = slug.trim().toLowerCase();
    try {
      let emailParaLogin = inputAcesso.includes("@") ? inputAcesso : "";
      if (!emailParaLogin) {
        const { data: profile } = await supabase.from('profiles').select('email').eq('slug', inputAcesso).maybeSingle();
        if (!profile?.email) throw new Error("ID não encontrado.");
        emailParaLogin = profile.email;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: emailParaLogin, password });
      if (error) throw new Error("Senha incorreta.");
      window.location.reload();
    } catch (err: any) { alert(err.message); } finally { setAuthLoading(false); }
  };

  const nextKpi = () => setKpiIndex((prev) => (prev + 1) % 4);
  const prevKpi = () => setKpiIndex((prev) => (prev - 1 + 4) % 4);

  if (loading) return <div className="w-full h-screen flex items-center justify-center bg-[#FAFAFA]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  if (!isLoggedIn) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center bg-[#FAFAFA] px-4 pt-6 md:pt-10">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl max-w-md w-full text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600"><Lock size={24} /></div>
            <h1 className="text-2xl font-bold text-gray-900">Área Restrita</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="ID ou E-mail" required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" onChange={(e) => setSlug(e.target.value)} />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Senha" required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            <button disabled={authLoading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-transform active:scale-95 disabled:opacity-50">{authLoading ? "Verificando..." : "Entrar na Plataforma"}</button>
          </form>
          <div className="mt-8 pt-8 border-t border-gray-100">
            <a href="/cadastro" className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all">
              <UserPlus size={18} /> Criar conta gratuita agora
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#FAFAFA] text-center px-4">
        <div className="bg-orange-50 p-8 rounded-[3rem] text-orange-500 mb-6"><Database size={48} /></div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nenhum dado encontrado.</h1>
        <p className="text-gray-500 mb-8">Olá, {userName}! Realize seu primeiro lançamento.</p>
        <a href="/lancamentos" className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2">Lançar agora <PlusCircle size={20} /></a>
      </div>
    );
  }

  const CurrentMonthCard = () => (
    <div className="bg-gray-900 rounded-[2rem] p-5 text-white flex flex-col justify-center items-center relative overflow-hidden shadow-xl min-h-[140px] w-full text-center">
      <div className="absolute top-4 right-4 text-white opacity-40"><Calendar size={18} /></div>
      
      <div className="md:hidden">
        {kpiIndex > 0 && (
          <button onClick={prevKpi} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </button>
        )}
        <button onClick={nextKpi} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="flex flex-col items-center w-full">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Mês Atual ({currentMonthData.nome})</p>
        <h3 className="text-xl font-bold tracking-tight whitespace-nowrap">R$ {currentMonthData.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        <p className="text-[9px] uppercase font-bold opacity-40 mt-1 mb-3">Saldo líquido mensal</p>
        <div className="w-full pt-3 mt-1 border-t border-white/10 grid grid-cols-2 gap-4">
            <div className="text-center">
                <p className="text-[8px] uppercase opacity-40 font-black mb-0.5">Receitas</p>
                <p className="text-xs font-bold text-emerald-400">R$ {currentMonthData.receita.toLocaleString('pt-BR')}</p>
            </div>
            <div className="text-center">
                <p className="text-[8px] uppercase opacity-40 font-black mb-0.5">Despesas</p>
                <p className="text-xs font-bold text-red-400">R$ {currentMonthData.despesa.toLocaleString('pt-BR')}</p>
            </div>
        </div>
      </div>
    </div>
  );

  const kpiCards = [
    <CurrentMonthCard key="mes-atual" />,
    <KPICard key="despesas" title="Despesas" value={stats.totalDespesa} icon={<ArrowDownRight size={14}/>} color="red" onNext={nextKpi} onPrev={prevKpi} showArrows index={2} />,
    <KPICard key="receitas" title="Receitas" value={stats.totalReceita} icon={<ArrowUpRight size={14}/>} color="emerald" onNext={nextKpi} onPrev={prevKpi} showArrows index={1} />,
    <KPICard key="saldo" title="Saldo Líquido" value={stats.totalGeral} icon={<TrendingUp size={14}/>} color="blue" onNext={nextKpi} onPrev={prevKpi} showArrows index={3} />,
  ];

  const footerItems = [
    <FooterItem key="bench" icon={<LineChart size={20}/>} title="Benchmarking" desc="Sua performance" href="#" isLocked />,
    <FooterItem key="obj" icon={<Target size={20}/>} title="Objetivos" desc="Metas de economia" href="#" isLocked />,
    <FooterItem key="ia" icon={<Microscope size={20}/>} title="IA Predict" desc="Suas tendências" href="#" isLocked />,
    <a key="cons" href="/consultoria" className="flex items-center gap-4 group cursor-pointer w-full justify-center md:justify-start">
        <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 transition-all hover:scale-105"><Mail size={20}/></div>
        <div className="text-left">
            <p className="text-sm font-bold text-gray-900">Consultoria</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Falar com especialista</p>
        </div>
    </a>
  ];

  let displayCategories = [];
  if (selectedYear === "GERAL") {
    displayCategories = geralCategoriasMap;
  } else if (selectedMonthCategory === "GERAL") {
    displayCategories = anoCategoriasMap[selectedYear] || [];
  } else {
    displayCategories = mesesCategoriasMap[`${selectedMonthCategory}/${selectedYear}`] || [];
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-8">
      <header className="flex flex-col mb-4 pt-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Nucleobase Intelligence</span>
          </div>
          <div className="mb-4">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
              <span>Dashboard<span className="text-blue-600">.</span></span>
              <Sparkles size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
            </h1>
          </div>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 w-full">
               <div className="lg:col-span-8 flex flex-col gap-2">
                 <div className="flex items-center gap-3 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm">
                 {[
                    { id: "TODOS", label: "Base consolidada", icon: <Layers size={14}/> },
                    { id: "CONTA_CORRENTE", label: "Conta corrente", icon: <Wallet size={14}/> },
                    { id: "CARTAO", label: "Cartão de crédito", icon: <CreditCard size={14}/> }
                  ].map((tipo) => (
                    <button key={tipo.id} onClick={() => setActiveTab(tipo.id)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[11px] font-bold transition-all ${activeTab === tipo.id ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-gray-400 hover:bg-gray-50"}`}>
                      {tipo.icon} <span className="hidden sm:inline">{tipo.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
        </div>
      </header>

      <div className="mb-8 relative">
        <div className="hidden md:grid grid-cols-12 gap-8 items-stretch">
            <div className="col-span-8 grid grid-cols-3 gap-8">
                <KPICard title="Despesas" value={stats.totalDespesa} icon={<ArrowDownRight size={14}/>} color="red" />
                <KPICard title="Receitas" value={stats.totalReceita} icon={<ArrowUpRight size={14}/>} color="emerald" />
                <KPICard title="Saldo Líquido" value={stats.totalGeral} icon={<TrendingUp size={14}/>} color="blue" />
            </div>
            <div className="col-span-4"><CurrentMonthCard /></div>
        </div>
        <div className="md:hidden flex items-center justify-center">{kpiCards[kpiIndex]}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-stretch">
        <section className="lg:col-span-8 bg-white border border-gray-100 rounded-[3rem] p-6 md:p-10 shadow-sm relative overflow-hidden flex flex-col min-h-[400px]">
          
          {/* Cabeçalho Reestruturado: Título sempre na primeira linha */}
          <div className="w-full flex flex-col gap-6 mb-8 relative z-10">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 uppercase text-xs tracking-widest w-full">
              <BarChart3 size={18} className="text-blue-600" /> Fluxo de Caixa Comparativo
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 w-full justify-start md:justify-end">
              {/* Grupo 1: Visão (Caixa vs Competência) */}
              <div className="flex bg-gray-50 p-1.5 rounded-2xl flex-1 md:flex-none">
                <button 
                  onClick={() => setViewMode('CAIXA')} 
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'CAIXA' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                >
                  <Receipt size={12} /> <span className="whitespace-nowrap">Mês Fatura</span>
                </button>
                <button 
                  onClick={() => setViewMode('COMPETENCIA')} 
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'COMPETENCIA' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                >
                  <Clock size={12} /> <span className="whitespace-nowrap">Data Compra</span>
                </button>
              </div>

              {/* Grupo 2: Período (Mensal vs Acumulado) */}
              <div className="flex bg-gray-50 p-1.5 rounded-2xl flex-1 md:flex-none">
                <button 
                  onClick={() => setChartType('MENSAL')} 
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${chartType === 'MENSAL' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                >
                  <BarChart size={12} /> <span className="whitespace-nowrap">Mensal</span>
                </button>
                <button 
                  onClick={() => setChartType('ACUMULADO')} 
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${chartType === 'ACUMULADO' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                >
                  <Activity size={12} /> <span className="whitespace-nowrap">Acumulado</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 h-[300px] md:h-[400px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartType === 'MENSAL' ? chartData : chartDataAcumulado}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
                <Tooltip 
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }} 
                />
                <Legend 
                  iconType="circle" 
                  verticalAlign="bottom"
                  align="center"
                  height={36} 
                  wrapperStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', paddingTop: '20px'}} 
                />
                <Area name="Receita" type="monotone" dataKey="receita" stroke="#2563eb" strokeWidth={3} fillOpacity={0.1} fill="#2563eb" />
                <Area name="Despesa" type="monotone" dataKey="gastos" stroke="#F87171" strokeWidth={3} fillOpacity={0.05} fill="#F87171" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="lg:col-span-4 bg-white border border-gray-100 rounded-[3rem] p-6 md:p-10 shadow-sm flex flex-col justify-between">
          <div className="w-full">
            <div className="mb-8">
                <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <Layers size={18} className="text-blue-600" /> Distribuição
                </h3>
                <div className="flex flex-col gap-2 mt-4">
                    <select 
                      className="bg-gray-50 border-none rounded-xl px-4 py-2 text-[10px] font-bold uppercase text-gray-500 outline-none w-full"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="GERAL">Visão Consolidada</option>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    {selectedYear !== "GERAL" && (
                      <select 
                        className="bg-gray-50 border-none rounded-xl px-4 py-2 text-[10px] font-bold uppercase text-gray-500 outline-none w-full"
                        value={selectedMonthCategory}
                        onChange={(e) => setSelectedMonthCategory(e.target.value)}
                      >
                          <option value="GERAL">Ano Inteiro</option>
                          {availableMonthsForYear.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    )}
                </div>
            </div>
            
            <div className="space-y-4 w-full">
                {displayCategories.length > 0 ? displayCategories.map((item: any, idx: number) => (
                  <div key={idx} className={`group pb-4 w-full ${idx !== displayCategories.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex justify-between text-[11px] font-black uppercase mb-2 tracking-tight w-full">
                        <span className="text-gray-400 group-hover:text-blue-600 transition-colors">{item.category}</span>
                        <span className="text-gray-900">R$ {item.gastos.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${(item.gastos / (stats.totalDespesa || 1)) * 100}%` }} />
                      </div>
                  </div>
                )) : <p className="text-center text-xs text-gray-400 py-10">Sem dados para o filtro.</p>}
            </div>
          </div>
          
          <div className="flex flex-col gap-3 mt-8">
            <a href="/lancamentos" className="w-full py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all text-center flex items-center justify-center gap-2"><PlusCircle size={14} /> Lançar despesas</a>
            <a href="/lancamentos/gerenciar" className="w-full py-5 bg-transparent border-2 border-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all text-center flex items-center justify-center gap-2"><Edit3 size={14} /> Editar Registros</a>
          </div>
        </section>
      </div>

      <VisionYoY data={rawLancamentos} />
      <VisionOfensora data={rawLancamentos} />
      
      <div className="mt-16">
        <div className="flex items-center gap-6 mb-12">
            <div className="h-px bg-gray-100 flex-1"></div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 whitespace-nowrap">Ecossistema de Suporte</h3>
            <div className="h-px bg-gray-100 flex-1"></div>
        </div>
        
        <div className="mb-12"><footer className="grid grid-cols-1 md:grid-cols-4 gap-8">{footerItems}</footer></div>
        
        <div className="relative overflow-hidden bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-10 mb-20">
            <div className="max-w-xl text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Sua visão personalizada<span className="text-blue-600">.</span></h3>
                <p className="text-gray-500 leading-relaxed text-lg font-medium opacity-80">Transformamos seus padrões de uso em clareza estratégica.</p>
            </div>
            <div className="w-full md:w-96 flex flex-col gap-1 items-center md:items-start">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Canais Oficiais</p>
                <p className="text-sm font-bold text-gray-900 mb-4 tracking-tight">contato@nucleobase.app</p>
                <button className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-2xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg">
                  <Send size={16} /> Solicitar Melhoria
                </button>
            </div>
        </div>

        <div className="flex items-center gap-6 mb-12">
            <div className="h-px bg-gray-100 flex-1"></div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
            <div className="h-px bg-gray-100 flex-1"></div>
        </div>

        <div className="flex flex-col items-center text-center pb-20">
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
                <Instagram className="w-12 h-12 md:w-14 md:h-14" strokeWidth={1.5} />
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

function KPICard({ title, value, icon, color, onNext, onPrev, showArrows, index }: any) {
    const colorStyles: any = { 
      blue: "text-blue-600 bg-blue-50", 
      emerald: "text-emerald-600 bg-emerald-50", 
      red: "text-red-600 bg-red-50" 
    };
    return (
        <div className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm flex flex-col justify-center relative min-h-[140px] w-full items-center text-center">
            <div className={`absolute top-4 right-4 p-2 rounded-lg ${colorStyles[color]}`}>{icon}</div>
            
            {showArrows && (
              <div className="md:hidden">
                <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors">
                  <ChevronRight size={24} />
                </button>
              </div>
            )}

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-lg font-bold text-gray-900">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
    );
}

function FooterItem({ icon, title, desc, href, isLocked }: any) {
    return (
        <a href={href} className={`flex items-center gap-4 transition-all ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:translate-x-1'}`}>
            <div className="p-4 bg-gray-100 text-gray-500 rounded-2xl">{icon}</div>
            <div className="text-left">
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{desc}</p>
            </div>
        </a>
    );
}