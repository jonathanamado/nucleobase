"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  ShieldCheck, 
  Zap, 
  Star, 
  CheckCircle2, 
  Globe, 
  Eye, 
  EyeOff, 
  UserCircle, 
  AlertTriangle, 
  Gift,
  Instagram,
  Clock
} from "lucide-react";

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
    <div className="min-h-screen w-full flex flex-col bg-white font-sans">
      <div className="flex flex-col-reverse lg:flex-row flex-1">
        {/* LADO: BRANDING E DEPOIMENTOS */}
        <div className="w-full lg:w-1/2 bg-gray-900 p-8 lg:p-12 flex flex-col justify-start relative border-r border-white/5">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <Globe size={400} className="absolute -bottom-20 -left-20 text-blue-500" />
          </div>

          <div className="relative z-10 w-full max-w-md mx-auto space-y-10 pt-4 lg:pt-0 pb-8">
            {/* BANNER DE OFERTA EXCLUSIVA (Desktop) */}
            <div className="hidden lg:flex bg-blue-500/10 border border-blue-500/20 rounded-[2rem] p-6 items-start gap-4 backdrop-blur-sm">
              <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md shrink-0">
                <Gift size={20} />
              </div>
              <div>
                <p className="text-[12px] font-black text-blue-400 uppercase tracking-widest mb-1">Oferta de Boas-vindas</p>
                <p className="text-xs text-white/90 font-semibold leading-relaxed">
                  Ganhe <strong>90 dias de acesso total + Suporte</strong>. Após este período, você mantém sua conta para lançamentos limitados, mas ainda com acesso vitalício à todas as visualizações, insights e segurança da Nucleo.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-blue-500 mb-6">
                <Zap fill="currentColor" size={24} />
                <span className="font-black uppercase tracking-[0.3em] text-xs">Nucleobase</span>
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight tracking-tighter mb-8">
                Sua jornada para a <span className="text-blue-500">clareza financeira</span> começa aqui.
              </h1>
              
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  {[
                      { icon: <Clock size={20} className="text-blue-400" />, text: "90 dias: Acesso irrestrito a todas as funções e suporte humanizado." },
                      { icon: <CheckCircle2 size={20} className="text-emerald-500" />, text: "Pós-90 dias: Sua conta continua ativa. Consulta, blog e métricas seguem livres." },
                      { icon: <ShieldCheck size={20} className="text-blue-500" />, text: "Segurança de dados e privacidade nível bancário em qualquer momento." }
                  ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4 text-white/80 font-medium text-sm">
                          <div className="p-2 bg-white/5 rounded-xl shrink-0">{item.icon}</div>
                          <span className="leading-snug">{item.text}</span>
                      </div>
                  ))}
                </div>
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

        {/* LADO: FORMULÁRIO */}
        <div className="flex-1 flex flex-col p-2 lg:px-16 justify-start bg-white">
          <div className="w-full max-w-md mx-auto pt-0 lg:pt-0 pb-12">
            
            {/* DIVISÃO INTELIGENTE MOBILE */}
            <div className="lg:hidden flex flex-col gap-4 mb-8 pt-4">
              <div className="bg-blue-600 rounded-2xl p-4 flex items-center gap-4 text-white shadow-lg shadow-blue-100">
                <Gift size={20} className="shrink-0" />
                <p className="text-[11px] font-bold leading-tight">
                  Degustação VIP: <span className="opacity-80">90 dias com acesso total e suporte. Após o prazo, sua conta permanece ativa para acompanhamento de resultados, limitando apenas multi lançamentos.</span>
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  Crie sua conta para realizar seu <span className="text-blue-600">controle financeiro.</span>
                </h2>
              </div>
            </div>

            {/* TÍTULO DESKTOP */}
            <div className="hidden lg:block mb-8 text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                Crie sua conta e inicie seu <span className="text-blue-600 font-black">controle financeiro pessoal ou profissional.</span>
              </h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Explore o poder da inteligência financeira.
              </p>
            </div>

            <form onSubmit={handleCadastro} className="space-y-4">
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

              <div className="group">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 mb-2 block">Nome Completo (Recomendado)</label>
                <input 
                  type="text" 
                  placeholder="Exemplo: João Andrade Silva" 
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none text-gray-900 focus:bg-white focus:border-blue-100 transition-all text-sm font-medium" 
                  onChange={(e) => setNome(e.target.value)} 
                />
              </div>
              
              <div className="group">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 mb-2 block">E-mail (Recomendado)</label>
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
              
              <div className="group">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 mb-2 block">Senha (Obrigatório)</label>
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
              
              <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-gray-900 text-white py-5 rounded-2xl hover:bg-black transition-all font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gray-200 disabled:bg-gray-400 mt-2 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <span className="animate-pulse">Sincronizando sua conta...</span>
                ) : (
                  <>
                    Finalizar cadastro gratuitamente 
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

      {/* RODAPÉ PADRONIZADO (CONECTE-SE E INSTAGRAM) */}
      <div className="bg-white pb-20 px-4 md:px-0">
        <div className="mt-24 flex items-center gap-4 mb-12 max-w-6xl mx-auto">
          <div className="h-px bg-gray-200 flex-1"></div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
            Conecte-se
          </h3>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

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
    </div>
  );
}