"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  LogIn as LogInIcon, 
  Mail as MailIcon, 
  Lock as LockIcon, 
  ArrowRight as ArrowRightIcon, 
  CheckCircle2 as CheckCircleIcon, 
  ArrowLeft as ArrowLeftIcon,
  LifeBuoy as LifeBuoyIcon,
  Instagram as InstagramIcon
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RealizarLoginPage() {
  // Garantindo strings vazias para evitar o erro de "uncontrolled input"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [view, setView] = useState<"login" | "forgot">("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Erro ao acessar: " + error.message);
    } else {
      setIsSuccess(true);
      window.location.href = "/minha-conta";
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("Por favor, digite seu e-mail.");
    
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://nucleobase.app/reset-password",
    });

    if (error) {
      alert("Erro: " + error.message);
    } else {
      alert("Enviamos um link de recuperação para o seu e-mail!");
      setView("login");
    }
    setLoading(false);
  };

  return (
    <div className="w-full bg-gray-50 flex flex-col items-center justify-center p-4 min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900">
      
      <div className="max-w-md w-full mb-16">

        {/* HEADER PADRONIZADO COM A PÁGINA SOBRE */}
        <div className="mb-10 text-left w-full">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>{view === "login" ? "Entrar" : "Reset"}<span className="text-blue-600">.</span></span>
            <div className={`ml-3 opacity-35 transition-all duration-500 ${view === "login" ? "text-blue-600 rotate-0" : "text-orange-600 rotate-12"}`}>
              {view === "login" ? <LogInIcon size={32} strokeWidth={2} /> : <LifeBuoyIcon size={32} strokeWidth={2} />}
            </div>
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium w-full leading-relaxed mt-0 whitespace-nowrap">
            {view === "login" ? "Nucleobase.app." : "Recuperação de acesso."}
          </h2>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10 flex flex-col relative overflow-hidden">
          
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                {view === "login" ? "Identificação" : "Segurança"}
              </h3>
            </div>
          </div>

          {view === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">E-mail</label>
                <div className="relative group">
                  <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    placeholder="exemplo@email.com" 
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 outline-none text-sm text-gray-900 transition-all placeholder:text-gray-300"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Senha</label>
                  <button 
                    type="button" 
                    onClick={() => setView("forgot")}
                    className="text-[9px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                  >
                    Esqueceu?
                  </button>
                </div>
                <div className="relative group">
                  <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    placeholder="••••••••" 
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 outline-none text-sm text-gray-900 transition-all placeholder:text-gray-300"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-gray-200 text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 mt-8 group disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Autenticando..." : "Entrar"}
                <ArrowRightIcon size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">E-mail para Recuperação</label>
                <div className="relative group">
                  <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="seu@email.com" 
                    required
                    value={email}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 outline-none text-sm text-gray-900 transition-all placeholder:text-gray-300"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 mt-8 group disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Enviando..." : "Solicitar Link"}
                <MailIcon size={16} />
              </button>
              
              <button 
                type="button"
                onClick={() => setView("login")}
                className="w-full text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2 hover:text-gray-600 transition-colors"
              >
                Voltar para o login
              </button>
            </form>
          )}

          <div className="mt-10 pt-8 border-t border-gray-50 flex flex-col items-center gap-6">
            <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-500 ${isSuccess ? 'text-green-600 bg-green-50' : view === "login" ? 'text-blue-600 bg-blue-50' : 'text-blue-600 bg-blue-50'}`}>
              <CheckCircleIcon size={12} className={loading ? "animate-spin" : ""} /> 
              {isSuccess ? "Sucesso!" : view === "login" ? "Acesso Restrito" : "Recuperação Ativa"}
            </div>
            
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              Novo por aqui?{" "}
              <a href="/cadastro" className="text-blue-600 font-black hover:text-blue-700 transition-colors ml-1">
                Crie sua conta
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* LINHA DIVISÓRIA "CONECTE-SE" PADRONIZADA */}
      <div className="w-full max-w-md flex items-center gap-4 mb-10">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM CENTRALIZADO COM PADRÃO DA PÁGINA SOBRE */}
      <div className="flex flex-col items-center text-center">
        <div className="max-w-md mb-8 px-4">
          <h4 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tighter mb-2">
            Fique por dentro <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
          </h4>
          <p className="text-gray-500 font-medium text-xs md:text-sm">
            Insights e bastidores da Nucleobase no seu feed.
          </p>
        </div>
        
        <a 
          href="https://www.instagram.com/nucleobase.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-[1.8rem] md:rounded-[2.2rem] blur-xl opacity-10 group-hover:opacity-30 transition-all duration-500"></div>
            
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[1.8rem] md:rounded-[2.2rem] flex items-center justify-center text-white shadow-lg relative z-10 group-hover:rotate-6 transition-all duration-500">
              <InstagramIcon className="w-10 h-10 md:w-12 md:h-12" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-pink-500 transition-colors">@nucleobase.app</span>
            <div className="h-0.5 w-0 bg-pink-500 mt-1.5 group-hover:w-full transition-all duration-500 rounded-full"></div>
          </div>
        </a>
      </div>

    </div>
  );
}