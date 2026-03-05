"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ShieldCheck, Zap, Star, CheckCircle2, Globe, Eye, EyeOff, UserCircle, AlertTriangle, Gift } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [slugDesejado, setSlugDesejado] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [showWarning, setShowWarning] = useState(false);
  const [cienteSemEmail, setCienteSemEmail] = useState(false);

  const formatarSlug = (texto: string) => {
    return texto
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  };

  const enviarNotificacaoAdm = async (nomeNovo: string, emailNovo: string) => {
    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "9ef5a274-150a-4664-a885-0b052efd06f7",
          subject: "🚀 Nova Indicação Registrada!",
          message: `O usuário ${nomeNovo || "Anônimo"} (${emailNovo || "Sem e-mail"}) acabou de se cadastrar.`
        }),
      });
    } catch (e) { console.error("Erro ao enviar e-mail adm", e); }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      if (!showWarning) {
        setShowWarning(true);
        return;
      }
      if (!cienteSemEmail) {
        alert("Por favor, aceite os termos de ciência para prosseguir sem e-mail.");
        return;
      }
    }

    setLoading(true);
    const slugFinal = formatarSlug(slugDesejado);

    const { data: slugExistente } = await supabase
      .from('profiles')
      .select('slug')
      .eq('slug', slugFinal)
      .maybeSingle();

    if (slugExistente) {
      alert("Este ID de Usuário já está sendo utilizado. Por favor, escolha outro.");
      setLoading(false);
      return;
    }

    const emailParaAuth = email.trim() ? email.trim() : `${slugFinal}@nucleobase.app`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailParaAuth,
      password,
      options: { data: { full_name: nome || "Anônimo" } }
    });

    if (authError) {
      alert("Erro ao cadastrar: " + authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      await supabase.from('profiles').insert([
        { 
          id: authData.user.id, 
          email: emailParaAuth, 
          email_contato: email.trim() || null, 
          nome_completo: nome || "Anônimo", 
          plan_type: 'free',
          slug: slugFinal 
        }
      ]);

      const indicadorId = localStorage.getItem("nucleobase_referral_id");
      if (indicadorId && indicadorId !== authData.user.id) {
        const { error: indError } = await supabase.from("indicacoes").insert([
          { indicador_id: indicadorId, indicado_id: authData.user.id, status: 'pendente' }
        ]);
        if (!indError) {
          await enviarNotificacaoAdm(nome, emailParaAuth);
          localStorage.removeItem("nucleobase_referral_id");
        }
      }
      window.location.href = "/acesso-usuario";
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans">
      
      {/* LADO ESQUERDO: BRANDING */}
      <div className="w-full lg:w-1/2 bg-gray-900 p-8 lg:p-12 flex flex-col justify-start relative border-r border-white/5">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <Globe size={400} className="absolute -bottom-20 -left-20 text-blue-500" />
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto space-y-10 pt-4 lg:pt-12 pb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-500 mb-6">
              <Zap fill="currentColor" size={24} />
              <span className="font-black uppercase tracking-[0.3em] text-xs">Nucleobase</span>
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight tracking-tighter mb-8">
              Sua jornada para a <span className="text-blue-500">clareza financeira</span> começa aqui.
            </h1>
            <div className="space-y-4">
              {[
                  { icon: <ShieldCheck size={20} className="text-emerald-500" />, text: "Segurança de dados nível bancário" },
                  { icon: <Zap size={20} className="text-blue-500" />, text: "Interface ultra-rápida e intuitiva" },
                  { icon: <CheckCircle2 size={20} className="text-blue-500" />, text: "Degustação total por 90 dias" }
              ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-white/80 font-medium text-sm">
                      <div className="p-2 bg-white/5 rounded-xl">{item.icon}</div>
                      {item.text}
                  </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="h-px w-8 bg-gray-800"></div>
              <span className="text-[9px] font-black uppercase tracking-widest">A percepção de quem já organiza o lar</span>
            </div>
            <div className="relative p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-blue-500 text-blue-500" />)}
                </div>
                <p className="text-white text-xs italic mb-5 leading-relaxed">
                  "Finalmente encontrei uma plataforma que simplifica o que era complexo. A visualização clara dos meus rendimentos me trouxe uma paz de espírito que eu não tinha com planilhas manuais."
                </p>
                <div className="flex items-center gap-3">
                    <img src="/depoimentos/a-silva.png" alt="A. Silva" className="w-10 h-10 rounded-full border-2 border-blue-500/30 object-cover" />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white font-black uppercase tracking-widest">A. Silva</span>
                        <span className="text-[9px] text-gray-500 font-medium uppercase">Empreendedor Digital</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="flex-1 flex flex-col p-8 lg:px-16 justify-start bg-white">
        <div className="w-full max-w-md mx-auto pt-4 lg:pt-12 pb-12">
          
          {/* BANNER DE BOAS-VINDAS / TRIAL */}
          <div className="mb-10 bg-blue-50/50 border border-blue-100 rounded-[2rem] p-6 flex items-start gap-4 shadow-sm">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-100 shrink-0">
              <Gift size={20} />
            </div>
            <div>
              <p className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-1">Oferta Exclusiva</p>
              <p className="text-xs text-blue-900 font-semibold leading-relaxed">
                Você acaba de ganhar <strong>90 dias de acesso total</strong> para experimentar cada detalhe da nossa inteligência financeira. Sem compromisso inicial.
              </p>
            </div>
          </div>

          <div className="mb-8 text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
              Crie sua conta para iniciar o seu <span className="text-blue-600 font-black">controle financeiro pessoal ou profissional.</span>
            </h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Explore o poder da digitalização financeira hoje.
            </p>
          </div>

          <form onSubmit={handleCadastro} className="space-y-4">
            {/* ID DE USUÁRIO */}
            <div className="group">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 mb-2 block">
                ID de Usuário (Obrigatório)
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Exemplo: joao-silva" 
                  required 
                  className="w-full px-6 py-4 bg-blue-50/30 border-2 border-blue-50 rounded-2xl outline-none text-gray-900 focus:bg-white focus:border-blue-400 transition-all text-sm pr-12 font-medium" 
                  onChange={(e) => setSlugDesejado(e.target.value)} 
                />
                <UserCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
              </div>
            </div>

            {/* NOME COMPLETO */}
            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">Nome Completo (Opcional)</label>
              <input 
                type="text" 
                placeholder="Exemplo: João Andrade Silva" 
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none text-gray-900 focus:bg-white focus:border-blue-100 transition-all text-sm font-medium" 
                onChange={(e) => setNome(e.target.value)} 
              />
            </div>
            
            {/* E-MAIL RECOMENDADO */}
            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">E-mail (Recomendado)</label>
              <input 
                type="email" 
                placeholder="Exemplo: joao@seudominio.com" 
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none text-gray-900 focus:bg-white focus:border-blue-100 transition-all text-sm font-medium" 
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value.trim()) setShowWarning(false);
                }} 
              />
            </div>

            {/* ADVERTÊNCIA CONDICIONAL */}
            {showWarning && !email.trim() && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex gap-3">
                  <AlertTriangle className="text-orange-500 shrink-0" size={18} />
                  <div className="space-y-2">
                    <p className="text-[11px] text-orange-800 font-bold leading-tight uppercase tracking-tighter">
                      Atenção: Sem um e-mail real, você não poderá recuperar sua senha se esquecê-la.
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="rounded border-orange-300 text-orange-600 focus:ring-orange-500 h-3.5 w-3.5 transition-transform active:scale-90"
                        checked={cienteSemEmail}
                        onChange={(e) => setCienteSemEmail(e.target.checked)}
                      />
                      <span className="text-[10px] text-orange-700 font-bold uppercase tracking-tight">Estou ciente e desejo prosseguir</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* SENHA */}
            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">Senha (Obrigatório)</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none text-gray-900 focus:bg-white focus:border-blue-100 transition-all text-sm font-medium pr-14" 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {/* BOTÃO FINALIZAR */}
            <button 
              disabled={loading} 
              type="submit" 
              className="w-full bg-gray-900 text-white py-5 rounded-2xl hover:bg-black transition-all font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gray-200 disabled:bg-gray-400 mt-2 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <span className="animate-pulse">Sincronizando sua conta...</span>
              ) : (
                <>
                  Começar meu teste de 90 dias 
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