"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  view?: "login" | "signup";
}

export default function AuthForm({ onSuccess, redirectTo, view = "login" }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState(view);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Verifique seu e-mail para confirmar o cadastro!");
      }

      if (onSuccess) onSuccess();
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
      
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-2">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900">
          {mode === "login" ? "Acesse sua Conta" : "Crie sua Conta"}
        </h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
          {mode === "login" ? "Bem-vindo de volta à Nucleo" : "Comece sua jornada agora"}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 text-[10px] font-black uppercase p-4 rounded-2xl border border-red-100 animate-shake">
            {error}
          </div>
        )}

        <div className="relative group">
          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input
            type="email"
            placeholder="E-MAIL"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-14 pl-14 pr-6 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all text-sm font-bold text-gray-900"
          />
        </div>

        <div className="relative group">
          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="SENHA"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-14 pl-14 pr-14 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all text-sm font-bold text-gray-900"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          disabled={loading}
          className="w-full bg-gray-900 hover:bg-black text-white h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:shadow-blue-900/10 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              {mode === "login" ? "Entrar na Plataforma" : "Finalizar Cadastro"}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 hover:text-blue-600 transition-colors"
        >
          {mode === "login" 
            ? "Não tem conta? Crie uma agora" 
            : "Já possui conta? Faça o login"}
        </button>
      </div>
    </div>
  );
}