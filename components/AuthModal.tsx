"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Lock, Mail, User, Sparkles } from "lucide-react";

export default function AuthModal({ onSucess }: { onSucess: () => void }) {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else onSucess();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: nome } }
      });
      if (error) alert(error.message);
      else {
        // Lógica de indicação integrada aqui se quiser
        onSucess();
      }
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl max-w-md w-full animate-in zoom-in duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4">
          <Sparkles size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isLogin ? "Bem-vindo de volta" : "Comece sua jornada"}
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          {isLogin ? "Acesse seu painel de indicações" : "Crie sua conta para gerar seu link"}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input 
              type="text" placeholder="Nome Completo" required
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input 
            type="email" placeholder="E-mail" required
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input 
            type="password" placeholder="Senha" required
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : isLogin ? "Entrar agora" : "Criar minha conta"}
        </button>
      </form>

      <button 
        onClick={() => setIsLogin(!isLogin)}
        className="w-full mt-6 text-xs font-bold text-gray-400 hover:text-blue-600 transition uppercase tracking-widest"
      >
        {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
      </button>
    </div>
  );
}