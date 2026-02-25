"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  UserCog, Rocket, ShieldCheck, ArrowRight, 
  CheckCircle2, LogOut, X, Mail, LifeBuoy, AtSign,
  Eye, EyeOff 
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
  const [showPassword, setShowPassword] = useState(false);
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // URLs de Base para evitar que tudo fique preso no subdomínio dashboard
  const MAIN_URL = "https://nucleobase.app";
  const DASHBOARD_URL = "https://dashboard.nucleobase.app";

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchProfileName(session.user);
      } else {
        setIsLoggedIn(false);
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

    if (profile?.nome_completo && profile.nome_completo.trim() !== "") {
      setUserName(profile.nome_completo);
    } 
    else if (user.user_metadata?.full_name) {
      setUserName(user.user_metadata.full_name);
    }
    else {
      setUserName("Anônimo");
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
      redirectTo: `${MAIN_URL}/reset-password`,
    });

    if (error) alert("Erro: " + error.message);
    else {
      alert("Link de recuperação enviado com sucesso!");
      setShowForgotModal(false);
    }
    setResetLoading(false);
  };

  return (
    <div className="w-full min-h-screen overflow-y-auto animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32 relative px-4 md:px-0 md:pr-10">
      
      {/* Cabeçalho */}
      <div className="mb-6 mt-8 flex flex-col md:flex-row justify-between items-start gap-4 p-0 w-full">
        <div className="text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
            {isLoggedIn ? `Olá, ${userName}!` : "Área do Usuário"}
            <span className="text-orange-500">.</span>
          </h1>

          <p className="text-base text-gray-600 max-w-none leading-tight mb-4">
            <span className="font-bold text-gray-900">Seja bem vindo(a)</span> 
            {" "}ao Painel para acesso à Plataforma e ao seu Perfil cadastrado.
          </p>

          <p className="text-base text-gray-600 max-w-none font-bold leading-tight">
            {isLoggedIn ? (
              <>
                <a href={DASHBOARD_URL} className="text-orange-500 hover:text-orange-600 transition underline decoration-2 underline-offset-4">Clique aqui</a>
                {" para acessar o APP e gerenciar seus lançamentos."}
              </>
            ) : (
              "Use seu ID de usuário para acessar o APP e gerenciar seus dados."
            )}
          </p>
        </div>

        {isLoggedIn && (
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors bg-white shadow-sm border border-gray-100 px-4 py-2.5 rounded-xl">
            <LogOut size={16} /> Logoff
          </button>
        )}
      </div>

      {/* Linha Divisória */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4 w-full">
        Navegação e Acessos <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-stretch">
        
        {/* CARD 1: ACESSO OU LOGIN (DIRECIONA PARA O SUBDOMÍNIO DASHBOARD) */}
        <div className="flex">
          {isLoggedIn ? (
            <a 
              href={DASHBOARD_URL}
              className="p-8 rounded-[2.5rem] shadow-lg transition-all border flex flex-col text-center bg-orange-500 border-orange-400 hover:bg-orange-600 group w-full"
            >
              <div className="p-4 rounded-2xl mb-4 w-fit mx-auto bg-white/20 text-white group-hover:scale-110 transition-transform">
                <Rocket size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Acessar APP</h3>
              <p className="text-orange-50 text-sm mb-6">Acesso liberado. Clique aqui para atualizar o seu Controle Financeiro.</p>
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
                    placeholder="ID de Usuário ou E-mail" 
                    required
                    value={slug}
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm text-gray-900 font-bold"
                    onChange={(e) => setSlug(e.target.value)}
                  />
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Senha" 
                      required
                      value={password}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm text-gray-900 pr-12"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <button 
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-gray-400 font-bold hover:text-orange-500 mb-6 transition-colors"
                >
                  Esqueceu a senha?
                </button>

                <button 
                  disabled={loading}
                  className="mt-auto w-full bg-orange-500 text-white h-[56px] rounded-2xl font-bold hover:bg-orange-600 transition shadow-lg text-sm disabled:opacity-50"
                >
                  {loading ? "Verificando..." : "Acessar Plataforma"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* CARD 2: MEU PERFIL (DIRECIONA PARA O DOMÍNIO PRINCIPAL) */}
        <div className="flex">
          <a 
            href={isLoggedIn ? `${MAIN_URL}/minha-conta` : `${MAIN_URL}/cadastro`} 
            className="group bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col items-center text-center w-full hover:border-blue-100"
          >
            <div className="bg-orange-50 p-4 rounded-2xl mb-4 text-orange-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
              <UserCog size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Meu Perfil</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">Mantenha seu cadastro atualizado e explore as ferramentas e insights.</p>
            
            <div className={`mt-auto w-full flex items-center justify-center gap-2 h-[56px] rounded-2xl font-bold text-xs transition-colors ${isLoggedIn ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400'}`}>
              <CheckCircle2 size={16} /> 
              {isLoggedIn ? "Perfil Ativo" : "Criar Nova Conta"}
            </div>
          </a>
        </div>

        {/* CARD 3: PLANOS (DIRECIONA PARA O DOMÍNIO PRINCIPAL) */}
        <div className="flex">
          <a 
            href={`${MAIN_URL}/planos`} 
            className="group bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col items-center text-center w-full hover:border-blue-100"
          >
            <div className="bg-orange-50 p-4 rounded-2xl mb-4 text-orange-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Planos</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Entenda seu plano e veja as melhores opções adaptadas ao seu estilo.</p>
            
            <div className="mt-auto w-full bg-gray-50 px-5 h-[56px] rounded-2xl flex flex-col justify-center space-y-2 border border-gray-100">
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>Status de Uso</span>
                <span className={isLoggedIn ? "text-orange-500" : ""}>{isLoggedIn ? "Plano Grátis" : "Indisponível"}</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full bg-orange-500 transition-all duration-1000 ${isLoggedIn ? 'w-[15%]' : 'w-0'}`}></div>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* MODAL DE RECUPERAÇÃO */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute right-8 top-8 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-50 p-5 rounded-3xl text-blue-600 mb-6">
                <LifeBuoy size={40} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-3">Recuperar Acesso</h2>
              <p className="text-gray-500 text-sm mb-8">
                Informe seu e-mail cadastrado para receber um link de redefinição de senha.
              </p>

              <form onSubmit={handleForgotPassword} className="w-full space-y-5">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                  />
                </div>
                <button 
                  disabled={resetLoading}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resetLoading ? "Enviando..." : "Enviar Link de Acesso"}
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}