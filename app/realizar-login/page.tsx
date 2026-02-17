"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
// CORREÇÃO: Removida a linha que importava de "lucide-material"
import { 
  LogIn as LogInIcon, 
  Mail as MailIcon, 
  Lock as LockIcon, 
  ArrowRight as ArrowRightIcon, 
  CheckCircle2 as CheckCircleIcon, 
  ArrowLeft as ArrowLeftIcon 
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RealizarLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      window.location.href = "/minha-conta"; // Redireciona para a área logada
    }
    setLoading(false);
  };

  return (
    <div className="w-full bg-gray-50 flex flex-col items-center justify-center p-4">
      
      <div className="max-w-md w-full">
        {/* Link de Volta sutil */}
        <a href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-orange-600 transition mb-4 w-fit group font-bold uppercase tracking-wider">
          <ArrowLeftIcon size={14} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para o Início
        </a>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col">
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Acesse sua Conta</h2>
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-1">Bem-vindo à nucleobase.app</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-2xl text-orange-500">
              <LogInIcon size={24} />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 flex-1">
            {/* Campo E-mail */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">E-mail Cadastrado</label>
              <div className="relative">
                <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  placeholder="seu@email.com" 
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm text-gray-900 transition"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Sua Senha</label>
              <div className="relative">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm text-gray-900 transition"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black hover:bg-orange-600 transition shadow-lg text-sm flex items-center justify-center gap-2 mt-6 group disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Entrar na Plataforma"}
              <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* BLOCO INFERIOR */}
          <div className="mt-6 pt-6 border-t border-gray-50 flex flex-col items-center gap-3">
            <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${isSuccess ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'}`}>
              <CheckCircleIcon size={12} /> 
              {isSuccess ? "Acesso Autorizado!" : "Aguardando Login"}
            </div>
            
            <p className="text-gray-400 text-[11px] font-medium text-center leading-tight">
              Não tem uma conta?{" "}
              <a href="/cadastro" className="text-orange-500 font-black hover:underline underline-offset-4">
                Cadastre-se agora
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer minimalista sem Header/Sidebar conflito */}
      <footer className="mt-8 flex items-center gap-4 text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em] justify-center w-full">
        <p>© 2025 nucleobase.app</p>
        <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
        <p>Todos os direitos reservados</p>
      </footer>
    </div>
  );
}