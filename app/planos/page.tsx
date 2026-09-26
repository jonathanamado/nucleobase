// app/planos/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Zap, ShieldCheck, BarChart3, ShoppingCart,
  CheckCircle2, Star, Gem,
  QrCode, X, Copy, Check, MessageCircle, Instagram,
  ChevronLeft, ChevronRight, Headphones, RefreshCcw, Rocket,
  AtSign, Key, User, ArrowRight
} from "lucide-react";

export default function PaginaDePlanos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string, price: string, qrCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [currentCardMobile, setCurrentCardMobile] = useState(0);
  const [currentCardDesktop, setCurrentCardDesktop] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Estados de Autenticação In-Page
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Armazena a ação que o usuário tentou fazer antes de logar
  const [pendingAction, setPendingAction] = useState<{ lookupKey?: string, href?: string } | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const PIX_KEY = "contato@nucleobase.app";
  const WHATSAPP_LINK_ID = "q46hkm";

  useEffect(() => {
    window.dataLayer?.push({
      event: "view_page_content",
      content_category: "comercial",
      content_name: "planos_e_assinaturas"
    });

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const trackClick = (label: string, destination: string) => {
    window.dataLayer?.push({
      event: "click_conversion_button",
      button_label: label,
      destination_url: destination,
      page_location: "/planos"
    });
  };

  const diferenciais = [
    { icon: <ShieldCheck size={32} />, title: "Criptografia Base", desc: "Privacidade total dos seus dados." },
    { icon: <BarChart3 size={32} />, title: "Gestão Estratégica", desc: "Análise real de patrimônio." },
    { icon: <CheckCircle2 size={32} />, title: "Fidelidade Zero", desc: "Cancele quando desejar." },
    { icon: <Headphones size={32} />, title: "Suporte Premium", desc: "Atendimento humano e ágil." },
    { icon: <RefreshCcw size={32} />, title: "Update Contínuo", desc: "Novas funções mensalmente." }
  ];

  const nextCardMobile = () => setCurrentCardMobile((prev) => (prev === diferenciais.length - 1 ? 0 : prev + 1));
  const prevCardMobile = () => setCurrentCardMobile((prev) => (prev === 0 ? diferenciais.length - 1 : prev - 1));
  const nextCardDesktop = () => setCurrentCardDesktop((prev) => (prev >= diferenciais.length - 2 ? 0 : prev + 2));
  const prevCardDesktop = () => setCurrentCardDesktop((prev) => (prev <= 0 ? diferenciais.length - 2 : prev - 2));

  const openPixModal = (name: string, price: string, qrCode: string) => {
    setSelectedPlan({ name, price, qrCode });
    setIsModalOpen(true);
    trackClick(`Abrir Modal PIX - ${name}`, "modal_pix");
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendProof = () => {
    const message = encodeURIComponent(`Olá! Realizei o pagamento via PIX do plano ${selectedPlan?.name} (${selectedPlan?.price}). Segue o comprovante em anexo.`);
    window.open(`https://wa.link/${WHATSAPP_LINK_ID}?text=${message}`, '_blank');
  };

  // Funções Auxiliares de Cadastro
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
          subject: "🚀 Novo Cadastro na Nucleobase (Planos)!",
          message: `O usuário ${nomeNovo || "Anônimo"} se cadastrou na página de planos.\nE-mail: ${emailNovo}`
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

  // Processa o Checkout no Stripe com Interceptação de Erro
  const processStripeCheckout = async (lookupKey: string) => {
    setLoadingPlan(lookupKey);
    trackClick(`Processando Stripe (${lookupKey})`, "/api/stripe");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Interceptação 1: Sessão local não encontrada
      if (!token) {
        setIsLoggedIn(false);
        setPendingAction({ lookupKey });
        setAuthMode('register');
        setShowAuthModal(true);
        setLoadingPlan(null);
        return;
      }

      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ lookup_key: lookupKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Interceptação 2: API rejeitou o token/acesso (Erro 401 ou mensagem explícita)
        if (response.status === 401 || (data.error && data.error.includes("Usuário não autenticado"))) {
          setIsLoggedIn(false);
          setPendingAction({ lookupKey });
          setAuthMode('login');
          setShowAuthModal(true);
          setLoadingPlan(null);
          return;
        }

        alert(data.error || "Erro ao processar assinatura.");
        setLoadingPlan(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("URL de checkout não retornada.");
        setLoadingPlan(null);
      }
    } catch (error) {
      console.error("Erro na comunicação com a Stripe:", error);
      alert("Erro de conexão com o servidor. Tente novamente.");
      setLoadingPlan(null);
    }
  };

  // Submissão do Modal de Autenticação In-Page
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      if (authMode === 'register') {
        const nomeFinal = authName.trim() || "Anônimo";
        const emailFinal = authEmail.trim();
        const baseSlug = formatarSlug(emailFinal.split('@')[0]);
        const slugFinal = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: emailFinal,
          password: authPassword,
          options: { data: { full_name: nomeFinal } }
        });

        if (signUpError) throw signUpError;

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
              email: emailFinal,
              email_contato: emailFinal,
              nome_completo: nomeFinal,
              plan_type: 'free',
              slug: slugFinal
            }
          ]);

          try {
            await supabase.from('usuarios').upsert([
              {
                id: authData.user.id,
                email: emailFinal,
                nome_completo: nomeFinal
              }
            ]);
          } catch (err) {
            console.warn("Aviso na tabela usuarios:", err);
          }

          await enviarNotificacaoAdm(nomeFinal, emailFinal);
          await enviarOnboardingUsuario(nomeFinal, emailFinal);

          const indicadorId = localStorage.getItem("nucleobase_referral_id");
          if (indicadorId && indicadorId !== authData.user.id) {
            await supabase.from("indicacoes").insert([
              { indicador_id: indicadorId, indicado_id: authData.user.id, status: 'pendente' }
            ]);
            localStorage.removeItem("nucleobase_referral_id");
          }

          if (typeof window !== "undefined") {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: "user_signed_up",
              method: "in_page_modal"
            });
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (signInError) throw signInError;
      }

      setIsLoggedIn(true);
      setShowAuthModal(false);

      // Retoma automaticamente a ação do usuário
      if (pendingAction?.href) {
        window.location.href = pendingAction.href;
      } else if (pendingAction?.lookupKey) {
        await processStripeCheckout(pendingAction.lookupKey);
      }
      setPendingAction(null);

    } catch (err: any) {
      setAuthError(err.message || "Erro de autenticação. Verifique os dados.");
    } finally {
      setAuthLoading(false);
    }
  };

  const CheckoutForm = ({
    lookupKey,
    label,
    className,
    description,
    href,
    discount
  }: {
    lookupKey: string,
    label: React.ReactNode,
    className?: string,
    description: string,
    href?: string,
    discount?: string
  }) => {
    const isCurrentlyLoading = loadingPlan === lookupKey;

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (!isLoggedIn) {
        setPendingAction({ lookupKey, href });
        setAuthMode('register');
        setShowAuthModal(true);
        trackClick(`Intercepção Auth - ${description}`, "auth_modal");
        return;
      }

      if (href) {
        trackClick(`Plano: ${description} (${lookupKey})`, href);
        window.location.href = href;
        return;
      }

      await processStripeCheckout(lookupKey);
    };

    return (
      <button
        onClick={handleClick}
        disabled={isCurrentlyLoading}
        title={description}
        className={`${className} cursor-pointer transition-transform active:scale-[0.98] flex items-center justify-center gap-2 w-full disabled:opacity-50`}
      >
        {isCurrentlyLoading ? "Aguarde..." : label}
        {discount && !isCurrentlyLoading && (
          <span className="bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded text-[8px] font-black">
            {discount}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">

      {/* MODAL DE AUTENTICAÇÃO IN-PAGE */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative border border-slate-100">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setPendingAction(null);
              }}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            <div className="p-8 md:p-10 flex flex-col items-center">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl text-blue-600 mb-6 flex items-center justify-center shadow-inner">
                <Rocket size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                {authMode === 'register' ? 'Crie sua conta' : 'Acesse sua conta'}
              </h3>
              <p className="text-slate-500 text-xs font-medium text-center mb-8 max-w-[260px] leading-relaxed">
                {authMode === 'register'
                  ? 'Cadastre-se rapidamente para prosseguir com a ativação do seu plano.'
                  : 'Insira suas credenciais para continuar com a assinatura.'}
              </p>

              <form onSubmit={handleAuthSubmit} className="w-full space-y-3">
                {authMode === 'register' && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                    />
                  </div>
                )}

                <div className="relative group">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input
                    type="email"
                    placeholder="E-mail de acesso"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                  />
                </div>

                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input
                    type="password"
                    placeholder="Sua senha segura"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                  />
                </div>

                {authError && (
                  <p className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 p-3 rounded-xl text-center mt-2">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-blue-600/20 disabled:opacity-50 mt-4 flex justify-center items-center gap-2 cursor-pointer"
                >
                  {authLoading ? "Aguarde..." : (authMode === 'register' ? "Validar e Continuar" : "Entrar e Continuar")}
                  {!authLoading && <ArrowRight size={16} />}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {authMode === 'register' ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PIX */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <div className="p-8 flex flex-col items-center text-center">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
              <div className="bg-blue-50 p-4 rounded-full text-blue-600 mb-6">
                <QrCode size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pagamento via PIX</h3>
              <p className="text-gray-500 mb-6">
                Plano <span className="font-bold text-blue-600">{selectedPlan?.name}</span> por <span className="font-bold text-gray-900">{selectedPlan?.price}</span>
              </p>
              <div className="bg-white p-4 rounded-3xl mb-6 shadow-inner border border-gray-100">
                <img src={`/${selectedPlan?.qrCode}`} alt="QR Code Pix" className="w-48 h-48 object-contain" />
              </div>
              <div className="w-full space-y-3">
                <div className="relative group">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Chave E-mail:</p>
                  <button onClick={handleCopyPix} className="w-full py-4 bg-gray-50 border-2 border-dashed border-gray-200 text-gray-700 rounded-2xl font-mono text-sm flex items-center justify-center gap-3 hover:border-blue-400 hover:bg-white transition-all active:scale-95 cursor-pointer">
                    {PIX_KEY}
                    {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-gray-400" />}
                  </button>
                </div>
                <button onClick={handleSendProof} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 active:scale-95 cursor-pointer">
                  <MessageCircle size={20} /> Enviar Comprovante
                </button>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest pt-2">A liberação ocorre após validação manual.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Planos e Assinaturas<span className="text-blue-600">.</span></span>
            <ShoppingCart size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-0">
            Escolha o nível de controle que sua jornada financeira precisa.
          </h2>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Níveis de Acesso <div className="h-px bg-gray-200 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">

        {/* CARD EXPERIÊNCIA / GRATUITO */}
        <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 flex flex-col transition-all hover:border-blue-200 relative group overflow-hidden">
          <div className="relative z-10 flex-grow">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">
              <Rocket size={18} className="text-blue-600" /> Uso pessoal
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">90 Dias de Experiência</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">Conheça e valide. Período de degustação completo para seu controle financeiro.</p>
            <ul className="space-y-4 mb-10">
              {["Registros ilimitados", "Lançamentos online", "Painel de Resultados"].map((v, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                  <CheckCircle2 size={16} className="text-blue-500" /> {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative z-10">
            <a
              href={isLoggedIn ? "/acesso-usuario" : "#"}
              onClick={(e) => {
                e.preventDefault();
                if (!isLoggedIn) {
                  setPendingAction({ href: "/acesso-usuario" });
                  setAuthMode('register');
                  setShowAuthModal(true);
                  trackClick("Intercepção Auth - Degustação", "auth_modal");
                } else {
                  trackClick("Começar Degustação", "/acesso-usuario");
                  window.location.href = "/acesso-usuario";
                }
              }}
              className="block w-full py-4 bg-white border border-slate-200 text-slate-900 text-center rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm cursor-pointer"
            >
              Começar Degustação
            </a>
          </div>
          <Zap className="absolute -bottom-10 -right-10 text-slate-200/50 w-40 h-40 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>

        {/* PLANO ESSENCIAL */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all flex flex-col border-b-4 border-b-transparent hover:border-b-blue-600">
          <div className="flex-grow">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">
              <Star size={18} className="fill-blue-600 text-blue-600 animate-pulse scale-110" /> Uso Pessoal
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Essencial</h3>
            <div className="flex flex-col mb-6">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">R$ 9,90</span>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">/mês</span>
            </div>

            <div className="mb-6 bg-blue-50 p-2.5 rounded-xl border border-blue-100">
              <p className="text-[10px] text-center text-blue-900 leading-tight font-medium">
                Aproveite <strong>90 dias de degustação</strong>.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-8">
              <CheckoutForm lookupKey="essencial_trimestral" label={<span className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1"><span>Trim.</span> <span>-9%</span></span>} description="Trimestral" className="w-full py-2 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-tighter hover:bg-white hover:border-slate-300 transition-all text-center leading-tight" />
              <CheckoutForm lookupKey="essencial_semestral" label={<span className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1"><span>Semest.</span> <span>-15%</span></span>} description="Semestral" className="w-full py-2 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-tighter hover:bg-white hover:border-slate-300 transition-all text-center leading-tight" />
              <CheckoutForm lookupKey="essencial_anual" label={<span className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1"><span>Anual</span> <span>-24%</span></span>} description="Anual" className="w-full py-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg text-[9px] font-bold uppercase tracking-tighter hover:bg-blue-600 hover:text-white transition-all text-center leading-tight" />
            </div>

            <ul className="space-y-4 mb-6">
              {["Fidelidade Zero", "Multi-dispositivos", "Suporte via Base"].map((v, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                  <CheckCircle2 size={16} className="text-emerald-500" /> {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto">
            <CheckoutForm lookupKey="essencial_mensal" label="Veja mais detalhes" href="/planos/essencial" description="Veja mais detalhes do Plano Essencial" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm" />
          </div>
        </div>

        {/* PLANO PRO */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl flex flex-col relative overflow-hidden group transition-all border-b-4 border-b-transparent hover:border-b-orange-500">
          <div className="relative z-10 flex-grow">
            <div className="flex items-center justify-center gap-3 w-full mb-8">
              <div className="px-3 py-1 text-center rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest">
                Acesso Empresarial
              </div>
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                <Zap size={12} className="fill-white" /> Recomendado
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Plano Pro</h3>
            <div className="flex flex-col mb-6">
              <span className="text-4xl font-black text-white tracking-tighter">R$ 19,90</span>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">/mês</span>
            </div>

            <div className="mb-6 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              <p className="text-[10px] text-center text-amber-300 leading-tight font-medium">
                Aproveite <strong>45 dias de degustação</strong>.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-8">
              <CheckoutForm lookupKey="pro_trimestral" label={<span className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1"><span>Trim.</span> <span>-12%</span></span>} description="Trimestral" className="w-full py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-[9px] font-bold uppercase tracking-tighter hover:bg-white/10 transition-all text-center leading-tight" />
              <CheckoutForm lookupKey="pro_semestral" label={<span className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1"><span>Semest.</span> <span>-18%</span></span>} description="Semestral" className="w-full py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-[9px] font-bold uppercase tracking-tighter hover:bg-white/10 transition-all text-center leading-tight" />
              <CheckoutForm lookupKey="pro_anual" label={<span className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1"><span>Anual</span> <span>-25%</span></span>} description="Anual" className="w-full py-2 bg-white text-slate-900 rounded-lg text-[9px] font-bold uppercase tracking-tighter hover:bg-blue-400 hover:text-white transition-all text-center leading-tight" />
            </div>

            <ul className="space-y-4 mb-6">
              {["Importação via arquivo", "Integração Contínua", "+ Módulos Empresas"].map((v, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                  <CheckCircle2 size={16} className="text-blue-400" /> {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative z-10 mt-auto">
            <CheckoutForm lookupKey="pro_mensal" label="Conheça todas as vantagens" href="/planos/pro" description="Conheça todas as vantagens de um Plano Pro" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40" />
          </div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-blue-600/20 transition-all duration-700"></div>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200 mt-20 mb-10"></div>

      <div className="mb-12">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Por que somos diferentes?</h4>
        <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-3xl">Conheça os pilares que sustentam a segurança e a transparência da nossa plataforma para transformar sua gestão financeira.</p>
      </div>

      <div className="hidden md:flex flex-row items-center gap-12">
        <div className="w-1/3">
          <h5 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Diferenciais Nucleobase</h5>
          <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">Desenvolvemos uma infraestrutura focada na sua privacidade e no crescimento do seu patrimônio, garantindo suporte e evolução constante.</p>
          <div className="flex gap-3">
            <button onClick={prevCardDesktop} className="p-3 bg-white shadow-md rounded-full text-gray-400 hover:text-blue-600 transition-all border border-gray-100 active:scale-90 cursor-pointer"><ChevronLeft size={24} /></button>
            <button onClick={nextCardDesktop} className="p-3 bg-white shadow-md rounded-full text-gray-400 hover:text-blue-600 transition-all border border-gray-100 active:scale-90 cursor-pointer"><ChevronRight size={24} /></button>
          </div>
        </div>

        <div className="w-2/3 overflow-hidden">
          <div className="flex transition-transform duration-700 ease-in-out gap-6" style={{ transform: `translateX(-${currentCardDesktop * (50 + 1.5)}%)` }}>
            {diferenciais.map((item, idx) => (
              <div key={idx} className="min-w-[calc(50%-12px)] flex flex-col items-start gap-4 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:bg-white hover:shadow-xl transition-all group">
                <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:text-blue-600 transition-colors shrink-0">{item.icon}</div>
                <div>
                  <h5 className="font-black text-gray-900 text-sm uppercase tracking-tight">{item.title}</h5>
                  <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="relative px-2">
          <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 w-full left-0 z-10 px-1">
            <button onClick={prevCardMobile} className="p-2 bg-white shadow-lg rounded-full text-gray-400 active:scale-90 transition-transform border border-gray-100 cursor-pointer"><ChevronLeft size={20} /></button>
            <button onClick={nextCardMobile} className="p-2 bg-white shadow-lg rounded-full text-gray-400 active:scale-90 transition-transform border border-gray-100 cursor-pointer"><ChevronRight size={20} /></button>
          </div>
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentCardMobile * 100}%)` }}>
              {diferenciais.map((item, idx) => (
                <div key={idx} className="min-w-full px-10">
                  <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                    <div className="bg-white p-4 rounded-2xl shadow-sm text-blue-600 mb-4">{item.icon}</div>
                    <h5 className="font-black text-gray-900 text-sm uppercase tracking-tight mb-1">{item.title}</h5>
                    <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-6">
            {diferenciais.map((_, idx) => (
              <div key={idx} className={`h-1 rounded-full transition-all ${idx === currentCardMobile ? "w-6 bg-blue-600" : "w-1.5 bg-gray-200"}`}></div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="max-w-3xl mb-12">
          <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">Fique por dentro <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span></h4>
          <p className="text-gray-500 font-medium text-sm md:text-base">Insights, novidades e bastidores da Nucleobase diretamente no seu feed.</p>
        </div>
        <a
          href="https://www.instagram.com/nucleobase.app/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick("Instagram - Planos", "https://www.instagram.com/nucleobase.app/")}
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
  );
}