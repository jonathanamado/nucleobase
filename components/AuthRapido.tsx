"use client";
import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { AtSign, Lock, Eye, EyeOff, Loader2, Unlock, LifeBuoy, X, Mail, ArrowRight } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthRapido() {
  const [authLoading, setAuthLoading] = useState(false);
  const [slug, setSlug] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleAuth = async () => {
    if (!slug || !senha) return alert("Preencha os campos para liberar.");
    setAuthLoading(true);
    try {
      const input = slug.trim().toLowerCase();
      let emailParaAuth = input;

      if (!input.includes("@")) {
        const { data: p } = await supabase.from('profiles').select('email').eq('slug', input).maybeSingle();
        if (!p) throw new Error("Usuário não encontrado. Use seu e-mail.");
        emailParaAuth = p.email;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: emailParaAuth, password: senha 
      });

      if (loginError && nome.trim() !== "") {
        const { data: auth } = await supabase.auth.signUp({
          email: emailParaAuth, password: senha, options: { data: { full_name: nome } }
        });
        if (auth.user) {
          await supabase.from('profiles').upsert({ id: auth.user.id, email: emailParaAuth, nome_completo: nome, plan_type: 'free' });
        }
      } else if (loginError) {
        alert("Senha incorreta ou usuário novo sem nome preenchido.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=/v3/perfil`,
      });
      if (error) throw error;
      alert("Link enviado!");
      setShowForgotModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] border border-gray-100 p-8 md:p-12 shadow-2xl shadow-blue-900/5 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-orange-50 p-3 rounded-2xl text-orange-500"><AtSign size={28} /></div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Acesso Rápido</h3>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Identifique-se para liberar</p>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600" size={16} />
            <input type="text" placeholder="ID ou E-mail" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600" size={16} />
            <input type={showPassword ? "text" : "password"} placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full pl-11 pr-12 py-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <input type="text" placeholder="Nome Completo (Novos autores)" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 font-medium" />
      </div>

      <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] text-gray-400 font-bold hover:text-blue-600 mb-6 block w-fit">Esqueceu a senha?</button>

      <button onClick={handleAuth} disabled={authLoading} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg shadow-gray-200">
        {authLoading ? <Loader2 className="animate-spin" size={18} /> : <Unlock size={18} />}
        {authLoading ? "Verificando..." : "Liberar Envio"}
      </button>

      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 relative text-center">
            <button onClick={() => setShowForgotModal(false)} className="absolute right-6 top-6 text-gray-400"><X size={20} /></button>
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 mb-4 w-fit mx-auto"><LifeBuoy size={32} /></div>
            <h2 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Recuperar Acesso</h2>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input type="email" required placeholder="seu@email.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium" />
              <button disabled={resetLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                {resetLoading ? "Enviando..." : "Enviar Link"} <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}