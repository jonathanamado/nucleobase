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
  Zap, Rocket, Crown
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Dados fictícios para o Planejamento
const fictitiousData = [
  { name: "Jan", gastos: 4000 },
  { name: "Fev", gastos: 3000 },
  { name: "Mar", gastos: 5500 },
  { name: "Abr", gastos: 4800 },
  { name: "Mai", gastos: 6000 },
  { name: "Jun", gastos: 5200 },
];

const categoryData = [
  { category: "Moradia", value: 2500, color: "#2563eb" },
  { category: "Alimentação", value: 1200, color: "#3b82f6" },
  { category: "Transporte", value: 800, color: "#60a5fa" },
  { category: "Lazer", value: 500, color: "#93c5fd" },
  { category: "Saúde", value: 300, color: "#bfdbfe" },
];

export default function DashboardResultados() {
  const [activeTab, setActiveTab] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [userName, setUserName] = useState("");
  const [viewMode, setViewMode] = useState<'REAL' | 'FICTICIO'>('REAL');
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalGeral: 0,
    count: 0,
    media: 0,
    projecao: 0
  });

  const [showAuthForm, setShowAuthForm] = useState<'login' | null>(null);
  const [slug, setSlug] = useState(""); 
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

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
      .select('valor, data_competencia, tipo_origem')
      .eq('user_id', user.id)
      .order('data_competencia', { ascending: true });

    if (!error && lancamentos && lancamentos.length > 0) {
      setHasData(true);
      processarDadosFinanceiros(lancamentos);
    } else {
      setHasData(false);
    }
  };

  const processarDadosFinanceiros = (dados: any[]) => {
    const total = dados.reduce((acc, item) => acc + Number(item.valor), 0);
    const mediaVal = total / dados.length;
    const mesesMap: { [key: string]: number } = {};
    const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    dados.forEach(item => {
      const data = new Date(item.data_competencia);
      const mesNome = nomesMeses[data.getUTCMonth()];
      mesesMap[mesNome] = (mesesMap[mesNome] || 0) + Number(item.valor);
    });

    const formatadoParaGrafico = Object.keys(mesesMap).map(mes => ({
      name: mes,
      gastos: mesesMap[mes]
    }));

    setChartData(formatadoParaGrafico);
    setStats({
      totalGeral: total,
      count: dados.length,
      media: mediaVal,
      projecao: total * 1.05 
    });
  };

  const checkStatus = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await fetchUserData(session.user);
    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchUserData(session.user);
      else { setIsLoggedIn(false); setHasData(false); setUserName(""); }
    });
    return () => subscription.unsubscribe();
  }, []);

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
      setShowAuthForm(null);
    } catch (err: any) { alert(err.message); } finally { setAuthLoading(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: "https://nucleobase.app/reset-password" });
    if (error) alert("Erro: " + error.message);
    else { alert("Link enviado!"); setShowForgotModal(false); }
    setResetLoading(false);
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
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-orange-50 p-6 rounded-[2.5rem] text-orange-500 mb-8"><Database size={48} strokeWidth={1.5} /></div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">O motor precisa de combustível.</h1>
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">Olá, <span className="text-gray-900 font-bold">{userName}</span>! Realize seu primeiro lançamento para ver os gráficos.</p>
      <a href="/lancamentos" className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-600 transition flex items-center gap-2">Realizar primeiro lançamento <PlusCircle size={18} /></a>
    </div>
  );

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      {/* HEADER */}
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

        <div className="flex flex-col items-end gap-3">
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors bg-gray-100 px-3 py-1.5 rounded-lg uppercase tracking-widest">
            <LogOut size={12} /> Encerrar Sessão
          </button>
          <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
            {["TODOS", "CONTA_CORRENTE", "CARTAO"].map((tipo) => (
              <button key={tipo} onClick={() => setActiveTab(tipo)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tipo ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}>{tipo.replace("_", " ")}</button>
            ))}
          </div>
        </div>
      </div>

      {/* SELETOR */}
      <div className="mb-6 flex gap-3">
        <button onClick={() => setViewMode('REAL')} className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${viewMode === 'REAL' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-gray-400 border-gray-100'}`}><Database size={14} /> Dados Reais</button>
        <button onClick={() => setViewMode('FICTICIO')} className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${viewMode === 'FICTICIO' ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-100' : 'bg-white text-gray-400 border-gray-100'}`}><Target size={14} /> Planejamento Fictício</button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard title={viewMode === 'REAL' ? "Gasto Acumulado" : "Planejamento Total"} value={`R$ ${(viewMode === 'REAL' ? stats.totalGeral : 28500).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} trend={viewMode === 'REAL' ? `${stats.count} registros` : "Meta simulada"} />
        <SummaryCard title="Projeção" value={`R$ ${(viewMode === 'REAL' ? stats.projecao : 30000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} trend="Base histórica" icon={<TrendingUp size={20}/>} />
        <SummaryCard title="Média por Item" value={`R$ ${(viewMode === 'REAL' ? stats.media : 4750).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} trend="Estabilidade" isPositive />
      </div>

      {/* GRÁFICO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <BarChart3 size={16} className={viewMode === 'REAL' ? "text-blue-600" : "text-purple-600"} /> 
              Evolução Mensal ({viewMode === 'REAL' ? 'Real' : 'Planejado'})
            </h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewMode === 'REAL' ? chartData : fictitiousData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  formatter={(value: any) => [value ? `R$ ${value.toLocaleString('pt-BR')}` : "R$ 0", 'Total']} 
                />
                <Area type="monotone" dataKey="gastos" stroke={viewMode === 'REAL' ? "#2563eb" : "#9333ea"} strokeWidth={4} fill={`url(#colorGastos${viewMode})`} animationDuration={1000} />
                <defs>
                  <linearGradient id={`colorGastos${viewMode}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={viewMode === 'REAL' ? "#2563eb" : "#9333ea"} stopOpacity={0.1}/><stop offset="95%" stopColor={viewMode === 'REAL' ? "#2563eb" : "#9333ea"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className={`${viewMode === 'REAL' ? 'bg-blue-600 border-blue-700' : 'bg-purple-600 border-purple-700'} border rounded-[2.5rem] p-8 text-white`}>
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md"><Sparkles size={24} /></div>
            <h4 className="font-bold text-xl mb-3">{viewMode === 'REAL' ? 'Inteligência Financeira' : 'Modo Planejamento'}</h4>
            <p className="text-blue-100 text-sm mb-8 leading-relaxed">Visualização estratégica de performance baseada no seu histórico de lançamentos.</p>
            <a href="/lancamentos" className={`w-full bg-white ${viewMode === 'REAL' ? 'text-blue-600' : 'text-purple-600'} h-[60px] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3`}>Novo Lançamento <ArrowRight size={18} /></a>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-6 flex-grow flex flex-col justify-center mt-6">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Status do Banco</h5>
            <p className="text-gray-600 text-xs flex items-center gap-2"><Database size={12} /> Conectado ao Supabase</p>
          </div>
        </div>
      </div>

      {/* LINHA DIVISÓRIA: PERFORMANCE */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Performance por Segmento <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><Layers size={24} /></div>
            <h4 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Distribuição Crítica</h4>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">Analise onde seu capital está sendo mais alocado para identificar oportunidades de economia real.</p>
          </div>
          <div className="lg:col-span-8 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#111827'}} width={100} />
                <Tooltip 
                  cursor={{fill: 'transparent'}} 
                  contentStyle={{ borderRadius: '12px', border: 'none' }} 
                  formatter={(value: any) => [value ? `R$ ${value.toLocaleString('pt-BR')}` : "R$ 0", 'Valor']}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={32}>
                  {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LINHA DIVISÓRIA: EVOLUÇÃO CONSTANTE */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Evolução Constante <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* CONTEXTUALIZAÇÃO E CONTATOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-2 rounded-lg text-white"><Rocket size={20} /></div>
            <h4 className="text-3xl font-bold text-gray-900 tracking-tight">O futuro é agora.</h4>
          </div>
          <p className="text-gray-500 text-lg leading-relaxed mb-6">
            Esta página é o coração pulsante da <span className="text-blue-600 font-bold">nucleobase.app</span>. Estamos em um ciclo de aprimoramento contínuo para transformar seus dados em decisões de alto impacto.
          </p>
          <div className="space-y-4 mb-8">
            {[
              { icon: <Zap size={16}/>, text: "Insights automatizados por Inteligência Artificial em breve." },
              { icon: <Crown size={16}/>, text: "Curadoria exclusiva de ofertas e benefícios financeiros." },
              { icon: <ArrowUpRight size={16}/>, text: "Novos modos de visualização e projeção de patrimônio." }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-medium text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                <span className="text-blue-600">{item.icon}</span> {item.text}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-gray-900 p-10 rounded-[3rem] text-white flex-1 flex flex-col justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-6">Conecte-se</h5>
              <p className="text-2xl font-bold leading-tight mb-8">Acompanhe nossa jornada e receba novidades em primeira mão.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 relative z-10">
              <a href="https://www.instagram.com/_u/nucleobase.app/" target="_blank" className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-5 rounded-2xl transition-all border border-white/5">
                <div className="flex items-center gap-4">
                  <Instagram size={24} />
                  <span className="font-bold text-sm">@nucleobase.app</span>
                </div>
                <ArrowUpRight size={18} className="opacity-40" />
              </a>
              <a href="mailto:contato@nucleobase.app" className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-5 rounded-2xl transition-all border border-white/5">
                <div className="flex items-center gap-4">
                  <Mail size={24} />
                  <span className="font-bold text-sm">Fale com a gente</span>
                </div>
                <ArrowUpRight size={18} className="opacity-40" />
              </a>
            </div>
            <Sparkles size={120} className="absolute -bottom-10 -right-10 text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
      
      <p className="text-center mt-12 text-gray-400 text-[10px] font-black uppercase tracking-widest">
        Versão 1.0.0 • Nucleobase Intelligence System
      </p>
    </div>
  );
}

function SummaryCard({ title, value, trend, isPositive, isNegative, icon }: any) {
  return (
    <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
        <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : isNegative ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
          {isPositive ? <ArrowUpRight size={12} /> : isNegative ? <ArrowDownRight size={12} /> : icon}
          {trend}
        </div>
      </div>
    </div>
  );
}