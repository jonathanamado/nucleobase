"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { UserCog, Rocket, ShieldCheck, ArrowRight, Lock, CheckCircle2, LogOut } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AcessoUsuarioPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleUserSession(session);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = (session: any) => {
    setIsLoggedIn(!!session);
    if (session?.user) {
      const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0];
      setUserName(name || "");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Erro ao acessar: " + error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    /* Mantendo a estrutura w-full, adicionando h-screen e overflow-hidden para travar a rolagem */
    <div className="w-full h-screen overflow-hidden">
      {/* Cabeçalho */}
      <div className="mb-6 mt-0 flex justify-between items-start">
        <div className="text-left">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            {isLoggedIn ? `Olá, ${userName}!` : "Área do Usuário"}
          </h1>

          <p className="text-base text-gray-600 max-w-2xl leading-tight mb-8">
            <span className="font-bold">Seja bem vindo(a) ao Painel do Usuário no "App da Núcleo Base".</span> 
            {" "}Acreditamos no lançamento consciente. Embora o input de dados mantenha a autonomia do usuário, 
            todo o ecossistema da nucleobase.app foi desenhado para eliminar a confusão e garantir 
            que você tenha controle total sobre o seu patrimônio, seja ele pessoal ou familiar.
          </p>

          <p className="text-base text-gray-600 max-w-2xl font-bold leading-tight">
            {isLoggedIn ? (
              <>
                <a href="https://nucleobase.streamlit.app" className="text-orange-500 hover:text-orange-600 transition underline decoration-2 underline-offset-4">Clique aqui</a>
                {" para acessar o APP e gerenciar seus lançamentos."}
              </>
            ) : (
              "Faça login para acessar sua plataforma e gerenciar seus dados financeiros."
            )}
          </p>
        </div>

        {isLoggedIn && (
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors bg-gray-50 px-3 py-2 rounded-xl">
            <LogOut size={16} /> Logoff
          </button>
        )}
      </div>

      {/* Grid com Altura Equalizada - Mantendo min-h-[280px] conforme original */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-6xl items-stretch">
        
        {/* CARD 1: ACESSO OU LOGIN */}
        <div className="min-h-[280px] flex">
          {isLoggedIn ? (
            <a 
              href="https://nucleobase.streamlit.app"
              className="p-6 rounded-3xl shadow-lg transition-all border flex flex-col text-center bg-orange-500 border-orange-400 hover:bg-orange-600 group w-full h-full"
            >
              <div className="p-3 rounded-2xl mb-3 w-fit mx-auto bg-white/20 text-white group-hover:scale-110 transition-transform">
                <Rocket size={28} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Acessar APP</h3>
              <p className="text-orange-50 text-xs mb-4">Acesso liberado. Clique para atualizar seu Controle Financeiro.</p>
              <div className="mt-auto flex items-center justify-center gap-2 bg-white text-orange-500 py-2.5 rounded-xl font-bold shadow-md text-sm">
                Entrar Agora <ArrowRight size={16} />
              </div>
            </a>
          ) : (
            <div className="group p-6 rounded-3xl shadow-md transition-all border flex flex-col text-center bg-white border-gray-100 w-full h-full">
              <div className="bg-orange-50 p-3 rounded-2xl mb-3 w-fit mx-auto text-orange-500 group-hover:bg-orange-100 transition-all duration-300">
                <Lock size={28} />
              </div>
              <form onSubmit={handleLogin} className="flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Acesso Rápido</h3>
                <div className="space-y-2 mb-4">
                  <input 
                    type="email" 
                    placeholder="E-mail" 
                    required
                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-xs text-gray-900"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input 
                    type="password" 
                    placeholder="Senha" 
                    required
                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-xs text-gray-900"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button 
                  disabled={loading}
                  className="mt-auto w-full bg-orange-500 text-white py-2.5 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg text-xs disabled:opacity-50"
                >
                  {loading ? "Entrando..." : "Acessar Plataforma"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* CARD 2: MEU PERFIL */}
        <div className="min-h-[280px] flex">
          <a 
            href={isLoggedIn ? "/minha-conta" : "/realizar-login"} 
            className="group bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center w-full h-full"
          >
            <div className="bg-orange-50 p-3 rounded-2xl mb-3 text-orange-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
              <UserCog size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Meu Perfil</h3>
            <p className="text-gray-500 text-xs mb-3 leading-relaxed">Mantenha seu cadastro atualizado e explore as ferramentas e insights da Núcleo.</p>
            
            <div className="mt-auto flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-[10px] font-semibold">
              <CheckCircle2 size={12} /> 
              {isLoggedIn ? "Perfil Ativo" : "Aguardando Login"}
            </div>
          </a>
        </div>

        {/* CARD 3: PLANOS */}
        <div className="min-h-[280px] flex">
          <a 
            href="/planos" 
            className="group bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center w-full h-full"
          >
            <div className="bg-orange-50 p-3 rounded-2xl mb-3 text-orange-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Planos</h3>
            <p className="text-gray-500 text-xs mb-4 leading-relaxed">Entenda seu plano e veja as melhores opções adaptadas ao seu estilo.</p>
            
            <div className="mt-auto w-full space-y-1.5">
              <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                <span>Uso</span>
                <span>{isLoggedIn ? "Grátis" : "---"}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full bg-orange-500 transition-all duration-1000 ${isLoggedIn ? 'w-[15%]' : 'w-0'}`}></div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}