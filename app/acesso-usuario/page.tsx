"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; 
import { 
  UserCog, Rocket, ShieldCheck, ArrowRight, 
  CheckCircle2, LogOut, X, LifeBuoy, AtSign,
  Eye, EyeOff 
} from "lucide-react";

export default function AcessoUsuarioPage() {
  const [mounted, setMounted] = useState(false);
  const [slug, setSlug] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const MAIN_URL = "https://nucleobase.app";
  const DASHBOARD_URL = "https://dashboard.nucleobase.app";

  useEffect(() => {
    setMounted(true);
    
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchProfileName(session.user);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfileName(session.user);
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfileName = async (user: any) => {
    setIsLoggedIn(true);
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome_completo')
      .eq('id', user.id)
      .single();

    if (profile?.nome_completo) {
      setUserName(profile.nome_completo);
    } else {
      setUserName(user.user_metadata?.full_name || "Usuário");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const inputAcesso = slug.trim().toLowerCase();
    const isEmail = inputAcesso.includes("@");

    try {
      let emailParaLogin = inputAcesso;

      if (!isEmail) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('slug', inputAcesso)
          .maybeSingle();

        if (profileError || !profile?.email) {
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

      if (authError) {
        alert("Erro ao acessar: Senha incorreta ou problema na conta.");
      } else {
        window.location.href = `${DASHBOARD_URL}/lancamentos`;
      }
    } catch (err) {
      alert("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/acesso-usuario"; 
  };

  // --- FUNÇÃO CORRIGIDA (ADICIONADA PARA O BUILD) ---
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${MAIN_URL}/reset-password`,
      });
      if (error) throw error;
      alert("Link de recuperação enviado! Verifique seu e-mail.");
      setShowForgotModal(false);
    } catch (error: any) {
      alert("Erro ao enviar e-mail: " + error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleExternalNav = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    window.location.href = url;
  };

  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="w-full min-h-screen animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32 relative px-4 md:px-0 md:pr-10">
      
      {/* Cabeçalho */}
      <div className="mb-6 mt-8 flex flex-col md:flex-row justify-between items-start gap-4 p-0 w-full">
        <div className="text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
            {isLoggedIn ? `Olá, ${userName.split(' ')[0]}!` : "Área do Usuário"}
            <span className="text-orange-500">.</span>
          </h1>
          <p className="text-base text-gray-600 mb-4">
            <span className="font-bold text-gray-900">Seja bem vindo(a)</span> ao seu painel de acesso.
          </p>
        </div>

        {isLoggedIn && (
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors bg-white shadow-sm border border-gray-100 px-4 py-2.5 rounded-xl">
            <LogOut size={16} /> Logoff
          </button>
        )}
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4 w-full">
        Navegação e Acessos <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-stretch">
        
        {/* CARD 1: ACESSO AO APP */}
        <div className="flex">
          {isLoggedIn ? (
            <a 
              href="/lancamentos"
              className="p-8 rounded-[2.5rem] shadow-lg transition-all border flex flex-col text-center bg-orange-500 border-orange-400 hover:bg-orange-600 group w-full"
            >
              <div className="p-4 rounded-2xl mb-4 w-fit mx-auto bg-white/20 text-white group-hover:scale-110 transition-transform">
                <Rocket size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Acessar APP</h3>
              <p className="text-orange-50 text-sm mb-6">Seu acesso está liberado. Vamos organizar suas finanças?</p>
              <div className="mt-auto flex items-center justify-center gap-2 bg-white text-orange-500 h-[56px] rounded-2xl font-bold shadow-md text-sm">
                Entrar Agora <ArrowRight size={18} />
              </div>
            </a>
          ) : (
            <div className="group p-8 rounded-[2.5rem] shadow-sm transition-all border flex flex-col text-center bg-white border-gray-100 w-full hover:shadow-xl hover:border-orange-100">
              <div className="bg-orange-50 p-4 rounded-2xl mb-4 w-fit mx-auto text-orange-500 group-hover:bg-orange-100 transition-all duration-300">
                <AtSign size={32} />
              </div>
              <form onSubmit={handleLogin} className="flex flex-col flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Acesso Rápido</h3>
                <div className="space-y-3 mb-3">
                  <input 
                    type="text" 
                    placeholder="Seu ID ou E-mail" 
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold"
                  />
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Senha" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <button type="button" onClick={() => setShowForgotModal(true)} className="text-[11px] text-gray-400 font-bold hover:text-orange-500 mb-6 transition-colors">
                  Esqueceu a senha?
                </button>

                <button disabled={loading} className="mt-auto w-full bg-orange-500 text-white h-[56px] rounded-2xl font-bold hover:bg-orange-600 transition shadow-lg text-sm disabled:opacity-50">
                  {loading ? "Verificando..." : "Entrar no APP"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* CARD 2: MEU PERFIL */}
        <div className="flex">
          <a 
            href={`${MAIN_URL}/minha-conta`} 
            rel="external"
            onClick={(e) => handleExternalNav(e, isLoggedIn ? `${MAIN_URL}/minha-conta` : `${MAIN_URL}/cadastro`)}
            className="group bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col items-center text-center w-full hover:border-blue-100"
          >
            <div className="bg-orange-50 p-4 rounded-2xl mb-4 text-orange-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
              <UserCog size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Meu Perfil</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">Gerencie seus dados pessoais e preferências.</p>
            <div className={`mt-auto w-full flex items-center justify-center gap-2 h-[56px] rounded-2xl font-bold text-xs ${isLoggedIn ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
              <CheckCircle2 size={16} /> 
              {isLoggedIn ? "Configurações" : "Criar Conta"}
            </div>
          </a>
        </div>

        {/* CARD 3: PLANOS */}
        <div className="flex">
          <a 
            href={`${MAIN_URL}/planos`} 
            rel="external"
            onClick={(e) => handleExternalNav(e, `${MAIN_URL}/planos`)}
            className="group bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col items-center text-center w-full hover:border-blue-100"
          >
            <div className="bg-orange-50 p-4 rounded-2xl mb-4 text-orange-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Planos</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Veja detalhes da sua assinatura e benefícios.</p>
            <div className="mt-auto w-full bg-gray-50 px-5 h-[56px] rounded-2xl flex flex-col justify-center space-y-2 border border-gray-100">
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>Status</span>
                <span className={isLoggedIn ? "text-orange-500" : ""}>{isLoggedIn ? "Premium" : "Visitante"}</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full bg-orange-500 transition-all duration-1000 ${isLoggedIn ? 'w-full' : 'w-0'}`}></div>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* MODAL DE RECUPERAÇÃO */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowForgotModal(false)} className="absolute right-8 top-8 text-gray-400 hover:text-gray-900">
              <X size={24} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-50 p-5 rounded-3xl text-blue-600 mb-6"><LifeBuoy size={40} /></div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">Recuperar Acesso</h2>
              <form onSubmit={handleForgotPassword} className="w-full space-y-5">
                <input 
                  type="email" required placeholder="seu@email.com"
                  value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                />
                <button disabled={resetLoading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  {resetLoading ? "Enviando..." : "Enviar Link"} <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}