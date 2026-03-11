"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Lock, CheckCircle2, ArrowRight, Instagram } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    if (newPassword.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      alert("Erro ao atualizar: " + error.message);
    } else {
      setSuccess(true);
      // Opcional: Redirecionar após 3 segundos
      setTimeout(() => {
        window.location.href = "/acesso-usuario";
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 pb-20">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12 mb-20">
        
        {!success ? (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="text-blue-600" size={24} />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
                Nova Senha<span className="text-blue-600">.</span>
              </h1>
              <p className="text-gray-500 text-xs mt-2">
                Escolha uma senha forte para proteger sua conta na Nucleobase.
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nova Senha</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Confirmar Senha</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl hover:bg-black transition-all font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-4"
              >
                {loading ? "Processando..." : "Redefinir Senha"}
                <ArrowRight size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-emerald-500" size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Senha Alterada!</h2>
            <p className="text-gray-500 text-sm">
              Sua conta já está segura. Redirecionando você para o painel...
            </p>
          </div>
        )}
      </div>

      {/* NOVA LINHA DIVISÓRIA "CONECTE-SE" CENTRALIZADA */}
      <div className="w-full max-w-4xl flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM CENTRALIZADO COM GRADIENTE E BRILHO */}
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
            {/* Efeito de brilho/glow ao fundo do ícone */}
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
  );
}