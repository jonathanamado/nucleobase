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
  Instagram,
  Clock,
  User,
  Mail
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
          subject: "🚀 Novo Cadastro na Nucleobase!",
          message: `O usuário ${nomeNovo || "Anônimo"} se cadastrou.\nE-mail: ${emailNovo}`
        }),
      });
    } catch (e) { console.error("Erro Web3Forms:", e); }
  };

  const enviarOnboardingUsuario = async (nomeUsuario: string, emailDestino: string) => {
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nomeUsuario || "Investidor(a)",
          email: emailDestino,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Erro na rota de e-mail:", errorData);
      }
    } catch (e) { 
      console.error("Erro ao conectar com a API interna:", e); 
    }
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
      if (authError.message === "User already registered") {
        alert("Este e-mail já possui uma conta vinculada. Redirecionando para o login...");
        window.location.href = "/acesso-usuario";
        return;
      }
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

      await enviarNotificacaoAdm(nome || "Anônimo", emailParaAuth);

      if (email.trim()) {
        await enviarOnboardingUsuario(nome, email.trim());
      }

      const indicadorId = localStorage.getItem("nucleobase_referral_id");
      if (indicadorId && indicadorId !== authData.user.id) {
        await supabase.from("indicacoes").insert([
          { indicador_id: indicadorId, indicado_id: authData.user.id, status: 'pendente' }
        ]);
        localStorage.removeItem("nucleobase_referral_id");
      }

      window.location.href = "/minha-conta";
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white font-sans">
      <div className="flex flex-col-reverse lg:flex-row flex-1">
        {/* LADO ESQUERDO: BRANDING */}
        <div className="w-full lg:w-1/2 bg-gray-900 p-8 lg:p-12 flex flex-col justify-start relative border-r border-white/5">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <Globe size={400} className="absolute -bottom-20 -left-20 text-blue-500" />
          </div>

          <div className="relative z-10 w-full max-w-md mx-auto space-y-10 pt-4 lg:pt-0 pb-8">
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
                    { icon: <CheckCircle2 size={20} className="text-emerald-500" />, text: "Pós-90 dias: Sua conta continua ativa. Consulta e métricas seguem livres." },
                    { icon: <ShieldCheck size={20} className="text-blue-500" />, text: "Segurança de dados e privacidade, garantindo personalizaçôes exclusivamente para o seu perfil." }
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
                <span className="text-[9px] font-black uppercase tracking-widest">A percepção de quem já usa</span>
              </div>
              <div className="relative p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-blue-500 text-blue-500" />)}
                </div>
                <p className="text-white text-xs italic mb-5 leading-relaxed">
                  "Finalmente encontrei uma plataforma que simplifica o que era complexo. A visualização clara dos meus rendimentos me trouxe paz."
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
        <div className="flex-1 flex flex-col p-2 lg:px-16 justify-start bg-white">
          <div className="w-full max-w-md mx-auto pt-0 lg:pt-0 pb-12">
            <div className="hidden lg:block mb-8 text-left mt-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                Crie sua conta e inicie seu <span className="text-blue-600 font-black">controle financeiro.</span>
              </h2>
            </div>

            <form onSubmit={handleCadastro} className="space-y-3">
              <div className="group">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 mb-1.5 block">ID de Usuário</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Exemplo: joao-silva" 
                    required 
                    className="w-full px-6 py-3 bg-blue-50/30 border-2 border-blue-50 rounded-2xl outline-none text-gray-900 focus:bg-white focus:border-blue-400 transition-all text-sm pr-12 font-medium" 
                    onChange={(e) => setSlugDesejado(e.target.value)} 
                  />
                  <UserCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 mb-1.5 block">Nome Completo</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="João Silva" 
                    className="w-full px-6 py-3 bg-gray-50 border-2 border-transparent rounded-2xl outline-none text-gray-900 focus:bg-white focus:border-blue-100 transition-all text-sm font-medium pr-12" 
                    onChange={(e) => setNome(e.target.value)} 
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                </div>
              </div>
              
              <div className="group">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 mb-1.5 block">E-mail</label>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="joao@exemplo.com" 
                    className="w-full px-6 py-3 bg-gray-50 border-2 border-transparent rounded-2xl outline-none text-gray-900 focus:bg-white focus:border-blue-100 transition-all text-sm font-medium pr-12" 
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (e.target.value.trim()) setShowWarning(false);
                    }} 
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                </div>
              </div>

              {showWarning && !email.trim() && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="text-orange-500 shrink-0" size={18} />
                    <div className="space-y-2">
                      <p className="text-[11px] text-orange-800 font-bold uppercase">Sem e-mail, você não poderá recuperar sua senha.</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded text-orange-600"
                          checked={cienteSemEmail}
                          onChange={(e) => setCienteSemEmail(e.target.checked)}
                        />
                        <span className="text-[10px] text-orange-700 font-bold">Estou ciente</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="group">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 mb-1.5 block">Senha</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required 
                    className="w-full px-6 py-3 bg-gray-50 border-2 border-transparent rounded-2xl outline-none text-gray-900 focus:bg-white focus:border-blue-100 transition-all text-sm font-medium pr-14" 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-gray-900 text-white py-4 rounded-2xl hover:bg-black transition-all font-bold text-[10px] uppercase tracking-[0.2em] mt-6 flex items-center justify-center gap-3 disabled:bg-gray-400"
              >
                {loading ? "Sincronizando..." : "Finalizar cadastro"}
              </button>
            </form>

            <p className="mt-6 text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
              Já possui uma conta? <a href="/acesso-usuario" className="text-blue-600 font-bold hover:underline">Fazer login</a>
            </p>
          </div>
        </div>
      </div>

      {/* RODAPÉ */}
      <div className="bg-white pb-20 text-center">
        <div className="mt-16 flex items-center gap-4 mb-12 max-w-6xl mx-auto px-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">Conecte-se</h3>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>
        <a href="https://www.instagram.com/nucleobase.app/" target="_blank" rel="noopener noreferrer" className="group inline-flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[2rem] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <Instagram size={40} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-pink-500">@nucleobase.app</span>
        </a>
      </div>
    </div>
  );
}