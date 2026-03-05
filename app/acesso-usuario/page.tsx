"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  UserCog, Rocket, ArrowRight, 
  CheckCircle2, LogOut, X, Mail, LifeBuoy, AtSign,
  Eye, EyeOff, BarChart3, Sparkles, TrendingUp,
  Clock, Gem, ShieldCheck, Zap, Lock, Database, FileSpreadsheet,
  PlusCircle, Upload, Shield, Target
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AcessoUsuarioPage() {
  const [slug, setSlug] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(""); 
  const [userPlan, setUserPlan] = useState("Free");
  const [showPassword, setShowPassword] = useState(false);
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchProfileData(session.user);
      } else {
        setIsLoggedIn(false);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfileData(session.user);
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfileData = async (user: any) => {
    setIsLoggedIn(true);
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome_completo, plan_type')
      .eq('id', user.id)
      .single();

    if (profile?.nome_completo && profile.nome_completo.trim() !== "") {
      setUserName(profile.nome_completo);
    } 
    else if (user.user_metadata?.full_name) {
      setUserName(user.user_metadata.full_name);
    }
    else {
      setUserName("Anônimo");
    }

    if (profile?.plan_type) {
      setUserPlan(profile.plan_type.charAt(0).toUpperCase() + profile.plan_type.slice(1));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const inputAcesso = slug.trim().toLowerCase();
    const isEmail = inputAcesso.includes("@");

    try {
      let emailParaLogin = "";
      if (isEmail) {
        emailParaLogin = inputAcesso;
      } else {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('slug', inputAcesso)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profile || !profile.email) {
          alert("ID de usuário não encontrado.");
          setLoading(false);
          return;
        }
        emailParaLogin = profile.email;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({ 
        email: emailParaLogin, 
        password 
      });

      if (authError) alert("Erro ao acessar: Senha incorreta ou problema na conta.");
    } catch (err) {
      alert("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: "https://nucleobase.app/reset-password",
    });

    if (error) alert("Erro: " + error.message);
    else {
      alert("Link de recuperação enviado com sucesso!");
      setShowForgotModal(false);
    }
    setResetLoading(false);
  };

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* Cabeçalho Ajustado */}
      <div className="mb-10 mt-2 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        <div className="lg:col-span-8 text-left">
          <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tight flex items-center">
            <span>
              {isLoggedIn ? `Olá, ${userName}!` : "Área do Usuário"}
              <span className="text-orange-500">.</span>
            </span>
            <BarChart3 
              size={60} 
              className="text-blue-600 skew-x-12 opacity-35 ml-4" 
              strokeWidth={1.2} 
            />
          </h1>

          <p className="text-base text-gray-600 max-w-none leading-tight mb-8">
            <span className="font-bold text-gray-900">Seja bem vindo(a)</span> 
            {" "}ao Painel para acesso à Plataforma e ao seu Perfil cadastrado.
          </p>

          <p className="text-base text-gray-600 w-full font-bold leading-tight">
            {isLoggedIn ? (
              <>
                Seu plano atual é o <span className="text-blue-600 uppercase tracking-tighter">{userPlan}</span>. Substitua o controle manual pela inteligência da Nucleo para obter total visibilidade 
                e resultados fantásticos na gestão das suas finanças. Navegue pelo APP para lançar seus registros e visualizar seus resultados.
              </>
            ) : (
              "Nesta área você terá acesso livre para realizar lançamentos e também visualizar seus resultados, analisando grupos e classificações. Use seu ID de usuário para logar e gerenciar os seus dados de maneira exclusiva."
            )}
          </p>
        </div>

        <div className="lg:col-span-4 flex flex-col items-end">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors bg-gray-50 px-3 py-2 rounded-xl shrink-0">
              <LogOut size={16} /> Logoff
            </button>
          ) : (
            /* FORM DE LOGIN NA NOVA POSIÇÃO */
            <div className="w-full bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">
                  Realizar login<span className="text-orange-500">.</span>
                </h2>
                <form onSubmit={handleLogin} className="flex flex-col gap-2">
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        placeholder="ID de Usuário ou E-mail" 
                        required
                        value={slug}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-xs text-gray-900 font-bold"
                        onChange={(e) => setSlug(e.target.value)}
                      />
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Senha" 
                          required
                          value={password}
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-xs text-gray-900 pr-10"
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[10px] text-gray-400 font-bold hover:text-orange-500 transition-colors text-right pr-1"
                    >
                      Esqueceu a senha?
                    </button>

                    <button 
                      disabled={loading}
                      className="w-full bg-orange-500 text-white h-[48px] rounded-xl font-bold hover:bg-orange-600 transition shadow-lg text-xs disabled:opacity-50 mt-1"
                    >
                      {loading ? "Verificando..." : "Acessar Plataforma"}
                    </button>
                </form>
            </div>
          )}
        </div>
      </div>

      {/* Linha Divisória */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4 w-full">
        Navegação e Acessos <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* Grid de Cards Padronizados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
        
        {/* LADO ESQUERDO: DOIS CARDS (Acesso e Resultados) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CARD 1: ACESSO APP */}
            <div className="min-h-[480px] flex">
              {isLoggedIn ? (
                <a 
                  href="/lancamentos"
                  className="p-8 rounded-[2.5rem] shadow-lg transition-all border flex flex-col text-left bg-orange-500 border-orange-400 hover:bg-orange-600 group w-full h-full relative overflow-hidden"
                >
                  <div className="p-3 rounded-2xl mb-4 w-fit bg-white/20 text-white group-hover:scale-110 transition-transform">
                    <Rocket size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Acesso APP</h3>
                  <p className="text-orange-50 text-[16px] leading-relaxed mb-6 font-medium">
                    Realize lançamentos manuais, importações via arquivo ou integração D-1 de suas contas e cartões:
                  </p>
                  
                  <div className="flex flex-col gap-2 mb-6 text-left">
                    <div className="flex items-center gap-2 text-[14px] text-white font-bold opacity-90">
                        <Database size={14} /> Integração D-1
                    </div>
                    <div className="flex items-center gap-2 text-[14px] text-white font-bold opacity-90">
                        <PlusCircle size={14} /> Lançamento Manual
                    </div>
                    <div className="flex items-center gap-2 text-[14px] text-white font-bold opacity-90">
                        <Upload size={14} /> Importação XLS
                    </div>
                    <div className="flex items-center gap-2 text-[14px] text-white font-bold opacity-90">
                        <Lock size={14} /> 100% Privado
                    </div>
                    <div className="flex items-center gap-2 text-[14px] text-white font-bold opacity-90">
                        <Shield size={14} /> Segurança SSL
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-center gap-2 bg-white text-orange-500 h-[56px] rounded-2xl font-bold shadow-md text-sm group-hover:shadow-xl transition-all">
                    Entrar no Sistema <ArrowRight size={16} />
                  </div>
                </a>
              ) : (
                <div className="group p-8 rounded-[2.5rem] shadow-md transition-all border flex flex-col text-left bg-white border-gray-100 w-full h-full">
                  <div className="bg-orange-50 p-3 rounded-2xl mb-4 w-fit text-orange-500 group-hover:bg-orange-100 transition-all duration-300">
                    <Rocket size={28} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Acesso APP</h3>
                  <p className="text-gray-500 text-[15px] leading-relaxed mb-6 font-medium">
                    Realize lançamentos manuais, importações via arquivo ou integração D-1 de suas contas e cartões:
                  </p>

                  <div className="flex flex-col gap-2 mb-8 text-left">
                    <div className="flex items-center gap-2 text-[13px] text-gray-400 font-bold">
                        <Database size={14} className="text-orange-500" /> Integração D-1
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-gray-400 font-bold">
                        <PlusCircle size={14} className="text-orange-500" /> Lançamento Manual
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-gray-400 font-bold">
                        <Upload size={14} className="text-orange-500" /> Importação XLS
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-gray-400 font-bold">
                        <Lock size={14} className="text-orange-500" /> 100% Privado
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-gray-400 font-bold">
                        <Shield size={14} className="text-orange-500" /> Segurança SSL
                    </div>
                  </div>
                  
                  <div className="mt-auto bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-[11px] text-gray-400 font-bold text-center uppercase tracking-widest">Realize o Login pelo formulário acima para acessar o APP</p>
                  </div>
                </div>
              )}
            </div>

            {/* CARD 2: RESULTADOS (DASHBOARD) */}
            <div className="min-h-[480px] flex">
              <a 
                href="/resultados" 
                className="group bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all border border-gray-100 flex flex-col text-left w-full h-full relative overflow-hidden"
              >
                <div className="absolute top-6 right-6 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter animate-pulse text-center">
                  Visualização <br /> realtime 
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl mb-4 w-fit text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <BarChart3 size={32} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight flex items-center gap-2">
                  Resultados
                  <BarChart3 size={20} className="text-blue-600 skew-x-12 opacity-40" strokeWidth={1.5} />
                </h3>
                
                <p className="text-gray-500 text-[16px] leading-relaxed font-medium mb-6">
                  Acompanhe a evolução da sua saúde financeira com relatórios e insights poderosos.
                </p>

                <div className="flex flex-col gap-2 mb-6 text-left">
                    <div className="flex items-center gap-2 text-[14px] text-gray-400 font-bold group-hover:text-blue-600 transition-colors">
                        <TrendingUp size={14} className="text-blue-500" /> Dashboards Interativos
                    </div>
                    <div className="flex items-center gap-2 text-[14px] text-gray-400 font-bold group-hover:text-blue-600 transition-colors">
                        <Sparkles size={14} className="text-blue-500" /> Insights Nucleo IA
                    </div>
                    <div className="flex items-center gap-2 text-[14px] text-gray-400 font-bold group-hover:text-blue-600 transition-colors">
                        <FileSpreadsheet size={14} className="text-blue-500" /> Relatórios Analíticos
                    </div>
                    <div className="flex items-center gap-2 text-[14px] text-gray-400 font-bold group-hover:text-blue-600 transition-colors">
                        <Zap size={14} className="text-blue-500" /> Evolução Patrimonial
                    </div>
                    <div className="flex items-center gap-2 text-[14px] text-gray-400 font-bold group-hover:text-blue-600 transition-colors">
                        <Target size={14} className="text-blue-500" /> Metas e Orçamentos
                    </div>
                </div>
                
                <div className="mt-auto flex items-center justify-center w-full bg-gray-900 text-white h-[56px] rounded-2xl hover:bg-black transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg group-hover:scale-105">
                  Visualizar Dashboard
                </div>
              </a>
            </div>
        </div>

        {/* LADO DIREITO: BANNER 90 DIAS */}
        <div className="lg:col-span-4 min-h-[480px] flex">
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-100 w-full h-full flex flex-col">
                <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1.5 rounded-full">
                        <Clock size={14} className="text-blue-200" />
                        <span className="text-[10px] font-black uppercase tracking-widest">90 Dias de Experiência</span>
                    </div>
                    
                    <p className="text-blue-100 text-sm leading-relaxed mb-6 font-medium">
                      Domine suas finanças com tempo de sobra. Explore todas as funções livremente por 3 meses e decida seu plano depois:
                    </p>

                    <div className="space-y-4 mb-8">
                      <a href="/planos/essencial" className="block no-underline">
                          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 group hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] transition-all cursor-pointer">
                              <div className="bg-white/20 p-2 rounded-xl text-white group-hover:bg-blue-500 transition-colors">
                                  <ShieldCheck size={18} />
                              </div>
                              <div className="flex flex-col">
                                  <span className="text-[11px] font-black uppercase tracking-tight">Plano Essencial</span>
                                  <span className="text-xs text-blue-200">R$ 9,90/mês • Após o período livre</span>
                              </div>
                          </div>
                      </a>

                      <a href="/planos/pro" className="block no-underline">
                          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/20 border-l-4 border-l-amber-400 group hover:bg-white/20 hover:scale-[1.02] transition-all cursor-pointer">
                              <div className="bg-amber-400 p-2 rounded-xl text-blue-900 group-hover:bg-amber-300 transition-colors">
                                  <Gem size={18} />
                              </div>
                              <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-black uppercase tracking-tight text-white">Plano Pro</span>
                                      <span className="text-[8px] bg-white text-blue-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter">Top</span>
                                  </div>
                                  <span className="text-xs text-blue-100 font-bold">R$ 19,90/mês • Gestão Total</span>
                              </div>
                          </div>
                      </a>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/10">
                        <div className="flex items-start gap-2 mb-4">
                            <CheckCircle2 size={14} className="text-blue-300 shrink-0 mt-0.5" />
                            <p className="text-[12px] text-blue-100/80 font-medium">
                                Acesso sem compromisso. Explore seu "período de teste" com calma, organizando seus lançamentos.
                            </p>
                        </div>
                        <a href="/planos" className="block w-full py-4 bg-white text-blue-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-center hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20">
                            Saiba mais detalhes clicando aqui
                        </a>
                    </div>
                </div>
                <Sparkles size={200} className="absolute -right-20 -bottom-20 text-white/5 -rotate-12 pointer-events-none" />
            </div>
        </div>
      </div>

      {/* MODAL DE RECUPERAÇÃO */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 mb-4">
                <LifeBuoy size={32} />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Recuperar Acesso</h2>
              <p className="text-gray-500 text-xs mb-6">
                Informe seu e-mail cadastrado para receber um link de redefinição de senha.
              </p>

              <form onSubmit={handleForgotPassword} className="w-full space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input 
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                  />
                </div>
                <button 
                  disabled={resetLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resetLoading ? "Enviando..." : "Enviar Link de Acesso"}
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}