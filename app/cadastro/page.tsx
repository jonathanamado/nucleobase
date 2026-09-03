// app/cadastro/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
  Mail,
  Sparkles,
  Users,
  ArrowUpRight,
  UserPlus
} from "lucide-react";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [slugDesejado, setSlugDesejado] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showWarning, setShowWarning] = useState(false);
  const [cienteSemEmail, setCienteSemEmail] = useState(false);

  useEffect(() => {
    window.dataLayer?.push({
      event: "view_page_content",
      content_category: "autenticacao",
      content_name: "pagina_cadastro"
    });
  }, []);

  const trackClick = (label: string, destination: string) => {
    window.dataLayer?.push({
      event: "click_conversion_button",
      button_label: label,
      destination_url: destination,
      page_location: "/cadastro"
    });
  };

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
    const nomeFinal = nome.trim() || "Anônimo";

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
      options: { data: { full_name: nomeFinal } }
    });

    if (authError) {
      if (authError.message === "User already registered") {
        alert("Este e-mail já possui uma conta vinculada. Redirecionando para o login...");
        trackClick("Redirecionamento Email Já Cadastrado", "/acesso-usuario");
        window.location.href = "/acesso-usuario";
        return;
      }
      alert("Erro ao cadastrar: " + authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      if (authData.session) {
        await supabase.auth.setSession({
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        });
      }

      await supabase.from('profiles').upsert([
        {
          id: authData.user.id,
          email: emailParaAuth,
          email_contato: email.trim() || null,
          nome_completo: nomeFinal,
          plan_type: 'free',
          slug: slugFinal
        }
      ]);

      try {
        await supabase.from('usuarios').upsert([
          {
            id: authData.user.id,
            email: emailParaAuth,
            nome_completo: nomeFinal
          }
        ]);
      } catch (err) {
        console.warn("Aviso na tabela usuarios:", err);
      }

      await enviarNotificacaoAdm(nomeFinal, emailParaAuth);

      if (email.trim()) {
        await enviarOnboardingUsuario(nomeFinal, email.trim());
      }

      const indicadorId = localStorage.getItem("nucleobase_referral_id");
      if (indicadorId && indicadorId !== authData.user.id) {
        await supabase.from("indicacoes").insert([
          { indicador_id: indicadorId, indicado_id: authData.user.id, status: 'pendente' }
        ]);
        localStorage.removeItem("nucleobase_referral_id");
      }

      // === RASTREAMENTO DE SUCESSO DE CADASTRO ===
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "user_signed_up",
          method: email.trim() ? "email" : "slug"
        });
        trackClick("Cadastro Concluído com Sucesso", "/minha-conta");
      }
      // ============================================

      setTimeout(() => {
        window.location.href = "/minha-conta";
      }, 300);
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
              <h1 className="text-2xl font-bold text-white leading-tight tracking-tighter mb-8">
                Sua jornada para uma <span className="text-blue-500">gestão eficiente</span> começa aqui.
              </h1>

              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  {[
                    { icon: <Clock size={20} className="text-blue-400" />, text: "Plano particular (Controle Financeiro): 90 dias com acesso irrestrito em todas as funções e suporte em dúvidas de uso." },
                    { icon: <Sparkles size={20} className="text-indigo-400" />, text: "Plano Empresarial (Condo): Experimente livremente com 45 dias de degustação, testando todo o potencial do APP." },
                    { icon: <CheckCircle2 size={20} className="text-emerald-500" />, text: "Pós-período: Sua conta continua ativa. Consulta e métricas seguem livres." },
                    { icon: <ShieldCheck size={20} className="text-blue-500" />, text: "Segurança de dados e privacidade, garantindo personalizações exclusivamente para o seu perfil." }
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0 lg:mt-8">
              <div className="order-2 md:order-1">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
                  <span>Cadastre-se<span className="text-blue-600">.</span></span>
                  <UserPlus size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
                </h1>
                <h2 className="text-gray-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-0">
                  Inicie sua história com a Nucleo.
                </h2>
              </div>
            </div>

            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
              Credenciais <div className="h-px bg-gray-300 flex-1"></div>
            </h3>

            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-6 text-center">
              <p className="text-xs text-blue-900 font-medium leading-relaxed block md:hidden">
                Automatize processos e gerencie dados com segurança e simplicidade. Crie sua conta.
              </p>
              <p className="text-xs text-blue-900 font-medium leading-relaxed hidden md:block">
                Ao criar sua conta, você avança rumo à digitalização e automação completa dos seus processos. Gerencie dados, garanta segurança de ponta e otimize sua rotina de forma simples e intuitiva.
              </p>
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
                    placeholder="joao@dominio.com"
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
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 cursor-pointer">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-gray-900 text-white py-4 rounded-2xl hover:bg-black transition-all font-bold text-[10px] uppercase tracking-[0.2em] mt-6 flex items-center justify-center gap-3 disabled:bg-gray-400 cursor-pointer"
              >
                {loading ? "Sincronizando..." : "Finalizar cadastro"}
              </button>
            </form>

            <p className="mt-6 text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
              Já possui uma conta? <a href="/acesso-usuario" onClick={() => trackClick("Fazer Login - Cadastro", "/acesso-usuario")} className="text-blue-600 font-bold hover:underline cursor-pointer">Fazer login</a>
            </p>

            {/* DIVISÓRIA EXCLUSIVA MOBILE */}
            <div className="mt-10 flex items-center gap-4 mb-0 md:hidden">
              <div className="h-px bg-gray-200 flex-1"></div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Orientações</h3>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
          </div>
        </div>
      </div>

      {/* RODAPÉ / BLOCO INSTAGRAM */}
      <div className="bg-white pb-20 text-center">
        <div className="mt-24 flex items-center gap-4 mb-12 max-w-6xl mx-auto px-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <div className="flex flex-col items-center text-center max-w-6xl mx-auto px-4">
          <div className="max-w-3xl mb-12">
            <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
              Fique por dentro <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
            </h4>
            <p className="text-gray-500 font-medium text-sm md:text-base">
              Insights, novidades e bastidores da Nucleobase diretamente no seu feed.
            </p>
          </div>

          <a
            href="https://www.instagram.com/nucleobase.app/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick("Instagram - Cadastro", "https://www.instagram.com/nucleobase.app/")}
            className="group relative flex flex-col items-center gap-6 cursor-pointer"
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