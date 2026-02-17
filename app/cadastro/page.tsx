"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ShieldCheck, Zap, Star, CheckCircle2, Globe } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const enviarNotificacaoAdm = async (nomeNovo: string, emailNovo: string) => {
    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "9ef5a274-150a-4664-a885-0b052efd06f7",
          subject: "🚀 Nova Indicação Registrada!",
          message: `O usuário ${nomeNovo} (${emailNovo}) acabou de se cadastrar usando um link de indicação.`
        }),
      });
    } catch (e) { console.error("Erro ao enviar e-mail adm", e); }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nome } }
    });

    if (authError) {
      alert("Erro ao cadastrar: " + authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      await supabase.from('profiles').insert([
        { id: authData.user.id, email: email, nome_completo: nome, plan_type: 'free' }
      ]);

      const indicadorId = localStorage.getItem("nucleobase_referral_id");
      if (indicadorId && indicadorId !== authData.user.id) {
        const { error: indError } = await supabase.from("indicacoes").insert([
          { indicador_id: indicadorId, indicado_id: authData.user.id, status: 'pendente' }
        ]);
        if (!indError) {
          await enviarNotificacaoAdm(nome, email);
          localStorage.removeItem("nucleobase_referral_id");
        }
      }
      window.location.href = "/acesso-usuario";
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden">
      
      {/* LADO ESQUERDO: BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 p-12 flex-col justify-between relative overflow-hidden border-r border-white/5">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <Globe size={400} className="absolute -bottom-20 -left-20 text-blue-500" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-500 mb-8">
            <Zap fill="currentColor" size={24} />
            <span className="font-black uppercase tracking-[0.3em] text-xs">Nucleobase</span>
          </div>

          <h1 className="text-3xl font-bold text-white leading-tight tracking-tighter mb-6">
            Sua jornada para a <span className="text-blue-500">clareza financeira</span> começa aqui.
          </h1>
          
          <div className="space-y-5">
            {[
                { icon: <ShieldCheck size={20} className="text-emerald-500" />, text: "Segurança de dados nível bancário" },
                { icon: <Zap size={20} className="text-blue-500" />, text: "Interface ultra-rápida e intuitiva" },
                { icon: <CheckCircle2 size={20} className="text-blue-500" />, text: "Relatórios gerados em tempo real" }
            ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-white/80 font-medium text-sm">
                    <div className="p-2 bg-white/5 rounded-xl">{item.icon}</div>
                    {item.text}
                </div>
            ))}
          </div>
        </div>

        {/* Depoimento com a foto real alinhada com a lógica da página de depoimentos */}
        <div className="relative z-10 p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm max-w-sm mb-4">
            <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-blue-500 text-blue-500" />)}
            </div>
            <p className="text-white text-xs italic mb-5 leading-relaxed">
              "Finalmente encontrei uma plataforma que simplifica o que era complexo. A visualização clara dos meus rendimentos me trouxe uma paz de espírito que eu não tinha com planilhas manuais."
            </p>
            <div className="flex items-center gap-3">
                {/* Caminho da imagem atualizado para a estrutura de pastas do seu projeto */}
                <img 
                    src="/depoimentos/a-silva.png" 
                    alt="A. Silva"
                    className="w-10 h-10 rounded-full border-2 border-blue-500/30 object-cover shadow-sm"
                />
                <div className="flex flex-col">
                    <span className="text-[10px] text-white font-black uppercase tracking-widest">A. Silva</span>
                    <span className="text-[9px] text-gray-500 font-medium uppercase tracking-tighter">Empreendedor Digital</span>
                </div>
            </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO (Topo Alinhado) */}
      <div className="flex-1 flex flex-col p-8 lg:px-16 lg:pt-8 bg-white overflow-hidden">
        <div className="w-full max-w-md mx-auto">
          
          <div className="mb-8 pt-0 text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
              Criar sua conta<span className="text-blue-600">.</span>
            </h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Inicie sua gestão estratégica hoje
            </p>
          </div>

          <form onSubmit={handleCadastro} className="space-y-5">
            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">Nome Completo</label>
              <input 
                type="text" 
                placeholder="Ex: João Silva" 
                required 
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none text-gray-900 focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 transition-all text-sm font-medium" 
                onChange={(e) => setNome(e.target.value)} 
              />
            </div>
            
            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">E-mail</label>
              <input 
                type="email" 
                placeholder="nome@empresa.com" 
                required 
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none text-gray-900 focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 transition-all text-sm font-medium" 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            
            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">Senha</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none text-gray-900 focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 transition-all text-sm font-medium" 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            
            <button 
              disabled={loading} 
              type="submit" 
              className="w-full bg-gray-900 text-white py-5 rounded-2xl hover:bg-black transition-all font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gray-200 disabled:bg-gray-400 mt-4 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <span className="animate-pulse">Sincronizando...</span>
              ) : (
                <>
                  Finalizar Cadastro 
                  <CheckCircle2 size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            Já possui uma conta? <a href="/acesso-usuario" className="text-blue-600 font-bold hover:underline italic">Fazer login</a>
          </p>

          <div className="mt-6 pt-6 flex items-center justify-center gap-4 opacity-40 grayscale border-t border-gray-50">
             <span className="text-[9px] font-black uppercase tracking-widest text-gray-900">Nucleobase Secured System</span>
             <ShieldCheck size={14} className="text-gray-900" />
          </div>
        </div>
      </div>
    </div>
  );
}