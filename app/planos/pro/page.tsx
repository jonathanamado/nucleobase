// app/planos/pro/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Gem, CheckCircle2, QrCode, X, Copy, Check,
  MessageCircle, Instagram, Gift, Star, RefreshCw,
  BarChart3, Headphones, Globe, Rocket, AtSign, Key, User, ArrowRight
} from "lucide-react";

export default function PaginaPlanoPro() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string, price: string, qrCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

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
  const [pendingAction, setPendingAction] = useState<{ lookupKey?: string } | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const PIX_KEY = "contato@nucleobase.app";
  const WHATSAPP_LINK_ID = "q46hkm";

  useEffect(() => {
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

  const openPixModal = (name: string, price: string, qrCode: string) => {
    setSelectedPlan({ name, price, qrCode });
    setIsModalOpen(true);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendProof = () => {
    const message = encodeURIComponent(`Olá! Realizei o pagamento via PIX do plano PRO (${selectedPlan?.price}). Quero liberar meu acesso total.`);
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
          subject: "🚀 Novo Cadastro na Nucleobase (Plano Pro)!",
          message: `O usuário ${nomeNovo || "Anônimo"} se cadastrou na página do Plano Pro.\nE-mail: ${emailNovo}`
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
      if (pendingAction?.lookupKey) {
        await processStripeCheckout(pendingAction.lookupKey);
      }
      setPendingAction(null);

    } catch (err: any) {
      setAuthError(err.message || "Erro de autenticação. Verifique os dados.");
    } finally {
      setAuthLoading(false);
    }
  };

  const CheckoutForm = ({ lookupKey, label, className, description, discount }: { lookupKey: string, label: string, className?: string, description: string, discount?: string }) => {
    const isCurrentlyLoading = loadingPlan === lookupKey;

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (!isLoggedIn) {
        setPendingAction({ lookupKey });
        setAuthMode('register');
        setShowAuthModal(true);
        return;
      }

      await processStripeCheckout(lookupKey);
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isCurrentlyLoading}
        title={description}
        className={`${className} cursor-pointer transition-transform active:scale-[0.98] flex items-center justify-center gap-2 w-full disabled:opacity-50`}
      >
        {isCurrentlyLoading ? "Aguarde..." : label}
        {discount && !isCurrentlyLoading && (
          <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md text-[10px] font-black">
            {discount}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full px-4 md:px-12 lg:px-16 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative bg-white">

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
              <div className="bg-amber-50 w-16 h-16 rounded-2xl text-amber-600 mb-6 flex items-center justify-center shadow-inner">
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
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={16} />
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm font-medium"
                    />
                  </div>
                )}

                <div className="relative group">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={16} />
                  <input
                    type="email"
                    placeholder="E-mail de acesso"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm font-medium"
                  />
                </div>

                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={16} />
                  <input
                    type="password"
                    placeholder="Sua senha segura"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm font-medium"
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
                  className="w-full bg-amber-500 text-white py-4 rounded-xl font-black hover:bg-amber-600 transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-4 flex justify-center items-center gap-2 cursor-pointer"
                >
                  {authLoading ? "Aguarde..." : (authMode === 'register' ? "Validar e Continuar" : "Entrar e Continuar")}
                  {!authLoading && <ArrowRight size={16} />}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                  className="text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  {authMode === 'register' ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER PADRONIZADO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Gestão <span className="text-amber-500 font-black">Inteligente</span>.</span>
            <Gem size={32} className="text-amber-500 opacity-65 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium max-w-3xl leading-relaxed mt-0">
            O Plano Pro foi criado para quem valoriza tempo e precisão.
          </h2>
        </div>
      </div>

      {/* LINHA DIVISÓRIA "EXPERIÊNCIA PREMIUM" */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-amber-600 mb-10 flex items-center gap-4">
        Experiência Premium <div className="h-px bg-gray-200 flex-1"></div>
      </h3>

      {/* SEÇÃO PRINCIPAL - Ocupa toda a largura disponível de forma fluida e balanceada */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* CONTAINER ESQUERDO: TEXTO + BENEFÍCIOS + EXPLICAÇÃO DESKTOP */}
          <div className="flex flex-col justify-between w-full py-2">
            <div className="flex flex-col gap-8">
              {/* TEXTO INICIAL */}
              <div className="space-y-4">
                <p className="text-sm md:text-base text-gray-600 leading-relaxed font-light">
                  Unindo automação funcional com suporte exclusivo, o <span className="text-gray-900 font-medium">Plano Pro</span> permite foco total no que importa enquanto nós cuidamos da <span className="bg-amber-500 text-white px-2 py-0.5 rounded-lg text-[10px] md:text-xs font-bold shadow-sm inline-block mx-1 leading-none">consistência dos seus dados.</span>
                </p>
              </div>

              {/* CARD EXIBIDO NO MOBILE */}
              <div className="block lg:hidden w-full">
                <CardPrecoPro
                  openPixModal={openPixModal}
                  CheckoutForm={CheckoutForm}
                />
              </div>

              {/* GRID DE BENEFÍCIOS PRO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: <RefreshCw size={18} />, title: "Sincronização D-1", desc: "Transações automáticas." },
                  { icon: <BarChart3 size={18} />, title: "Relatórios Avançados", desc: "Patrimônio e Projeções." },
                  { icon: <Headphones size={18} />, title: "Suporte Prioritário", desc: "Fila exclusiva WhatsApp." },
                  { icon: <Globe size={18} />, title: "Multi-Cartões", desc: "Diferentes entradas e saídas." }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col p-4 border border-gray-100 rounded-2xl bg-slate-50/50">
                    <div className="text-amber-600 mb-2">{item.icon}</div>
                    <span className="text-gray-900 text-xs font-bold uppercase tracking-tighter">{item.title}</span>
                    <span className="text-gray-500 text-[11px] leading-tight mt-1">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TEXTO EXPLICATIVO (APENAS DESKTOP) */}
            <div className="hidden lg:block mt-12 pt-8 border-t border-gray-300">
              <div className="flex items-center gap-2 mb-3">
                <Star className="text-amber-400 fill-amber-400" size={14} />
                <span className="text-[11px] font-black uppercase text-gray-900 tracking-widest">Upgrade Pro</span>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed font-light ">
                Tudo do Plano Essencial, mais: Conexão online com seus arquivos, atualização da fonte de dados em "1 clique", painel de resultados realtime com customizações e acesso antecipado a novas funções.
              </p>
            </div>
          </div>

          {/* CONTAINER DIREITO: CARD (DESKTOP) - Centralizado e dimensionado perfeitamente na segunda coluna */}
          <div className="hidden lg:flex w-full justify-center items-center">
            <div className="w-full max-w-[420px]">
              <CardPrecoPro
                openPixModal={openPixModal}
                CheckoutForm={CheckoutForm}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PIX PADRONIZADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative border border-amber-100">
            <div className="p-8 flex flex-col items-center text-center">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={24} />
              </button>
              <div className="bg-amber-50 p-4 rounded-full text-amber-600 mb-6">
                <Gem size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pagamento via PIX</h3>
              <p className="text-gray-500 mb-6 text-sm">Escaneie o código para o plano <span className="font-bold text-amber-600 uppercase">{selectedPlan?.name}</span></p>

              <div className="bg-white p-4 rounded-3xl mb-6 shadow-inner border border-gray-100 flex items-center justify-center">
                <img src={`/${selectedPlan?.qrCode}`} alt="QR Code" className="w-48 h-48 object-contain" />
              </div>

              <div className="w-full space-y-3">
                <button onClick={handleCopyPix} className="w-full py-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl font-mono text-sm flex items-center justify-center gap-3 hover:border-amber-400 transition-all cursor-pointer">
                  {PIX_KEY}
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-gray-400" />}
                </button>
                <button onClick={handleSendProof} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all cursor-pointer">
                  <MessageCircle size={20} /> Enviar Comprovante
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONECTE-SE CENTRALIZADO */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="max-w-3xl mb-12">
          <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
            Fique por dentro <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
          </h4>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            Insights, novidades e bastidores da Nucleobase diretamente no seu feed.
          </p>
        </div>

        <a href="https://www.instagram.com/nucleobase.app/" target="_blank" rel="noopener noreferrer" className="group relative flex flex-col items-center gap-6">
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

{/* SUBCOMPONENTE CARD PRO PADRONIZADO */ }
function CardPrecoPro({ openPixModal, CheckoutForm }: any) {
  return (
    <div className="bg-white border-2 border-amber-500 rounded-[2rem] p-8 shadow-2xl shadow-amber-100 transition-all duration-500 w-full h-full flex flex-col justify-center relative overflow-hidden mx-auto">
      <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-1 rounded-bl-xl font-black text-[8px] uppercase tracking-tighter">
        Melhor Escolha
      </div>

      <div className="flex justify-between items-start mb-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Premium Pro</p>
          <h4 className="text-4xl font-light text-gray-900 tracking-tighter">
            R$ 19,90 <span className="text-base text-gray-500 font-medium">/ mês</span>
          </h4>
        </div>
        <Gift size={20} className="text-amber-500" />
      </div>

      <div className="mb-4 bg-amber-50 p-3 rounded-xl border border-amber-100">
        <p className="text-[11px] text-center text-amber-900 leading-tight font-medium">
          Aproveite <strong>45 dias de degustação</strong> antes da assinatura.
        </p>
      </div>

      <div className="space-y-3">
        <CheckoutForm
          lookupKey="pro_mensal"
          label="Assinar Plano Pro"
          description="Plano Pro Mensal"
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-sm"
        />

        <div className="grid grid-cols-1 gap-2 pt-2">
          <CheckoutForm lookupKey="pro_trimestral" label="Trimestral - R$ 54,90" description="Trimestral" discount="-12%" className="py-2.5 bg-gray-50 text-gray-500 rounded-lg font-bold text-[9px] hover:bg-gray-100 transition-colors uppercase border border-gray-100" />
          <CheckoutForm lookupKey="pro_semestral" label="Semestral - R$ 99,90" description="Semestral" discount="-18%" className="py-2.5 bg-gray-50 text-gray-500 rounded-lg font-bold text-[9px] hover:bg-gray-100 transition-colors uppercase border border-gray-100" />
          <CheckoutForm lookupKey="pro_anual" label="Anual - R$ 189,90" description="Anual" discount="-25%" className="py-2.5 bg-amber-50 text-amber-600 rounded-lg font-bold text-[9px] hover:bg-amber-100 transition-colors uppercase border border-gray-100" />
        </div>

        <div className="flex items-center gap-3 py-4">
          <div className="h-px bg-gray-100 flex-1"></div>
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">OPÇÃO SEM CARTÃO</span>
          <div className="h-px bg-gray-100 flex-1"></div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openPixModal("Pro Mensal", "R$ 19,90", "nucleo-qr-pro.png");
          }}
          className="w-full py-3 border border-amber-200 rounded-xl flex items-center justify-center gap-2 group hover:bg-amber-50 transition-all cursor-pointer relative z-20"
        >
          <QrCode size={14} className="text-amber-500" />
          <span className="text-[10px] font-black text-gray-700 group-hover:text-gray-900 uppercase tracking-widest transition-colors">Assinar via PIX</span>
        </button>
      </div>
    </div>
  );
}