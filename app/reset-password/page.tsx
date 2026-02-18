"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Lock, CheckCircle2, ArrowRight } from "lucide-react";

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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12">
        
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
    </div>
  );
}