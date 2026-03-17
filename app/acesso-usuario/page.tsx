"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  UserCog, Rocket, ArrowRight, 
  CheckCircle2, LogOut, X, Mail, LifeBuoy, AtSign,
  Eye, EyeOff, BarChart3, Sparkles, TrendingUp,
  Clock, Gem, ShieldCheck, Zap, Lock, Database, FileSpreadsheet,
  PlusCircle, Upload, Shield, Target, Fingerprint, Globe, LayoutDashboard,
  Instagram
} from "lucide-react";
import Link from "next/link";

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
    <div className="w-full pr-0 md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* Cabeçalho */}
      <div className="mb-6 mt-2 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        <div className="lg:col-span-12 text-left">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>
              Seja bem vindo <span className="text-orange-500">{isLoggedIn ? "(a)," : "(a)"}</span>
            </span>
          </h1>

          <div className="text-xl md:text-3xl text-gray-900 max-w-none leading-tight mb-4 flex items-center flex-wrap">
            <span className="font-bold tracking-tight">
              {isLoggedIn ? userName.split(" ")[0] : <>à Plataforma da <span className="text-orange-500">Nucleobase!</span></>}
            </span>
            
            {!isLoggedIn && (
              <Gem size={24} className="text-orange-500 md:hidden ml-2" strokeWidth={2.5} />
            )}

            {isLoggedIn && (
              <span className="text-orange-50 font-bold ml-2 flex items-center gap-2">
                <span className="text-orange-500">(Plano {userPlan}).</span>
                <Gem size={24} className="text-orange-500 md:hidden" strokeWidth={2.5} />
              </span>
            )}

            <Gem 
              size={40} 
              className="text-orange-500 skew-x-2 ml-6 hidden md:block" 
              strokeWidth={2.0}
            />
          </div>

          <p className="text-base text-gray-600 w-full font-bold leading-tight mb-4">
            {isLoggedIn ? (
              <>
                <span className="md:inline hidden">
                  Substitua controles manuais pela inteligência da Nucleo para obter total visibilidade 
                  de suas finanças.
                </span>
                <span className="md:hidden inline">Explore o APP para lançamentos e análise de resultados.</span>
              </>
            ) : (
              <span>
                Para prosseguir em sua conta, realize o login. Caso não possua uma conta ainda,{" "}
                <Link href="/cadastro" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                  <span className="bg-blue-600 text-white px-1.5 pt-1 pb-0.5 rounded-md shadow-sm inline-block leading-none ml-1 font-bold tracking-tight">
                    cadastre-se gratuitamente
                  </span>
                </Link>
                .
              </span>
            )}
          </p>

          {!isLoggedIn && (
            <div className="max-w-md mt-6">
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
            </div>
          )}
        </div>
      </div>

      {/* Seção Condicional */}
      <div className={!isLoggedIn ? "hidden md:block mt-14" : "block mt-8"}>
        
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3 flex items-center gap-4 w-full">
          Navegação e Acessos <div className="h-px bg-gray-300 flex-1"></div>
        </h3>

        <div className="mb-12">
          <p className="hidden md:block text-base text-gray-600 leading-relaxed">
            Através do{" "}
            <span className="inline-flex items-center justify-center bg-orange-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider shadow-sm uppercase align-middle">
              Acesso ao APP
            </span>{" "}
            você centraliza sua vida financeira com total liberdade, de registros cotidianos a custos parcelados de longo prazo. Na consulta dos seus {" "}
            <span className="inline-flex items-center justify-center bg-blue-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider shadow-sm uppercase align-middle">
              Resultados
            </span>{" "}
            , transformamos dados em clareza estratégica, {" "}
            <span className="text-gray-900 underline decoration-2 decoration-orange-500/30 underline-offset-4 font-medium">
              permitindo seu entendimento sobre onde economizar e como acelerar objetivos.
            </span>{" "}
          </p>
          
          <p className="md:hidden text-sm text-gray-600 leading-relaxed">
            Acesse o <span className="font-bold text-orange-600">APP</span> para novos lançamentos ou o <span className="font-bold text-blue-600">Painel</span> para análise estratégica de seus resultados em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          <div className={`lg:col-span-12 grid gap-5 ${isLoggedIn ? "grid-cols-2 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2"}`}>
              
              <div className="md:min-h-[480px] min-h-[200px] flex">
                <a 
                  href="/lancamentos"
                  className={`p-6 md:p-8 rounded-[2.5rem] shadow-lg transition-all border flex flex-col text-center md:text-left bg-orange-500 border-orange-400 hover:bg-orange-600 group w-full h-full relative overflow-hidden ${!isLoggedIn && "pointer-events-none opacity-50"}`}
                >
                  <div className="p-3 rounded-2xl mb-4 w-fit bg-white/20 text-white group-hover:scale-110 transition-transform mx-auto md:mx-0">
                    <Rocket size={28} />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-3">
                    <span className="md:hidden">Acesso ao APP</span>
                    <span className="hidden md:block">Acesso <br /> ao APP</span>
                  </h3>
                  
                  <p className="text-orange-50 text-[14px] md:text-[16px] leading-relaxed mb-6 font-medium md:block hidden">
                    Realize lançamentos manuais em tela, importações via arquivo ou integrações em D-1:
                  </p>
                  
                  <div className="md:flex hidden flex-col gap-2 mb-6 text-left">
                    <div className="flex items-center gap-2 text-[14px] text-white font-bold opacity-90"><PlusCircle size={14} /> Lançamento manual</div>
                    <div className="flex items-center gap-2 text-[14px] text-white font-bold opacity-90"><Upload size={14} /> Importação XLS</div>
                    <div className="flex items-center gap-2 text-[14px] text-white font-bold opacity-90"><Database size={14} /> Integração D-1</div>
                  </div>

                  <div className="mt-auto flex items-center justify-center gap-3 bg-white text-orange-500 h-[48px] md:h-[56px] rounded-2xl font-black shadow-md text-[10px] uppercase tracking-widest group-hover:shadow-xl transition-all">
                    Acessar <span className="md:inline hidden">APP</span> 
                    <Zap size={16} className="fill-orange-500 group-hover:scale-125 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              </div>

              <div className="md:min-h-[480px] min-h-[200px] flex">
                <a 
                  href="/resultados" 
                  className="group bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all border border-gray-300 flex flex-col text-center md:text-left w-full h-full relative overflow-hidden"
                >
                  <div className="absolute top-6 right-6 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter animate-pulse text-center hidden md:block">
                    Visualização <br /> realtime 
                  </div>
                  <div className="bg-blue-50 p-3 rounded-2xl mb-4 w-fit text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm mx-auto md:mx-0">
                    <BarChart3 size={28} />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 tracking-tight">
                    <span className="md:hidden">Painel de Resultados</span>
                    <span className="hidden md:block">Painel de <br /> Resultados</span>
                  </h3>                  
                  <p className="text-gray-500 text-[14px] md:text-[16px] leading-relaxed font-medium mb-6 md:block hidden">
                    Acompanhe a evolução da sua saúde financeira com relatórios e insights poderosos:
                  </p>
                  
                  <div className="md:flex hidden flex-col gap-2 mb-6 text-left">
                      <div className="flex items-center gap-2 text-[14px] text-gray-400 font-bold group-hover:text-blue-600 transition-colors"><TrendingUp size={14} className="text-blue-500" /> Dashboards exclusivos</div>
                      <div className="flex items-center gap-2 text-[14px] text-gray-400 font-bold group-hover:text-blue-600 transition-colors"><Target size={14} className="text-blue-500" /> Metas e orçamentos</div>
                      <div className="flex items-center gap-2 text-[14px] text-gray-400 font-bold group-hover:text-blue-600 transition-colors"><Sparkles size={14} className="text-blue-500" /> Relatórios analíticos</div>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-center gap-3 w-full bg-gray-900 text-white h-[48px] md:h-[56px] rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-lg group-hover:scale-[1.02]">
                    Acessar <span className="md:inline hidden"> Dashboard</span> 
                    <LayoutDashboard size={16} className="text-blue-400 group-hover:rotate-6 transition-transform" />
                  </div>
                </a>
              </div>
          </div>
        </div>

        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4 w-full">
          Segurança e Identidade <div className="h-px bg-gray-300 flex-1"></div>
        </h3>

        <div className="mb-8">
          <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed">
            Sua privacidade é nossa prioridade absoluta. Atuamos com as camadas mais modernas de proteção para que seus dados financeiros permaneçam exclusivamente sob seu controle.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
          <div className="lg:col-span-12 min-h-[320px] flex">
              <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl w-full h-full flex flex-col md:flex-row gap-12 items-center">
                  <div className="relative z-10 flex-1 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10">
                          <Fingerprint size={14} className="text-orange-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Privacidade Blindada</span>
                      </div>
                      
                      <h4 className="text-2xl font-bold mb-3">Sua conta, suas regras.</h4>
                      <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-2xl font-medium">
                        Na Nucleo, a segurança dos seus dados é o pilar central. Utilizamos criptografia de ponta a ponta e Row Level Security (RLS) para garantir que apenas você tenha acesso às suas informações financeiras.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-0">
                          <ShieldCheck size={28} className="text-blue-400 row-span-2 self-start mt-1" />
                          <span className="text-white font-bold text-xs uppercase tracking-tighter">Criptografia</span>
                          <span className="text-[10px] text-gray-500 font-medium">Proteção total SSL/TLS 1.3</span>
                        </div>
                        
                        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-0">
                          <Lock size={28} className="text-blue-400 row-span-2 self-start mt-1" />
                          <span className="text-white font-bold text-xs uppercase tracking-tighter">Acesso Restrito</span>
                          <span className="text-[10px] text-gray-500 font-medium">Políticas RLS ativas</span>
                        </div>

                        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-0">
                          <Globe size={28} className="text-blue-400 row-span-2 self-start mt-1" />
                          <span className="text-white font-bold text-xs uppercase tracking-tighter">Backup em Nuvem</span>
                          <span className="text-[10px] text-gray-500 font-medium">Sincronização realtime</span>
                        </div>
                      </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 relative z-10 w-full md:w-auto">
                    <Link href="/minha-conta" className="bg-white text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all whitespace-nowrap text-center">
                      Configurações de Perfil
                    </Link>
                    <Link href="/seguranca_privacidade" className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all whitespace-nowrap text-center">
                      Segurança e Privacidade
                    </Link>
                  </div>
                  
                  <Database size={300} className="absolute -left-20 -bottom-20 text-white/[0.03] -rotate-12 pointer-events-none" />
              </div>
          </div>
        </div>
      </div>

      {/* NOVO BLOCO: CONECTE-SE (PADRÃO SOBRE) */}
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
              <Instagram className="w-12 h-12 md:w-14 md:h-14" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-pink-500 transition-colors">@nucleobase.app</span>
            <div className="h-1 w-0 bg-pink-500 mt-2 group-hover:w-full transition-all duration-500 rounded-full"></div>
          </div>
        </a>
      </div>

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