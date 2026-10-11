// app/planos/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Zap, ShieldCheck, BarChart3, ShoppingCart,
  CheckCircle2, Star, Gem, X, Instagram, Gift,
  ChevronLeft, ChevronRight, Headphones, RefreshCcw, Rocket,
  AtSign, Key, User, ArrowRight, ArrowUpRight, Building2, SlidersHorizontal, Calculator
} from "lucide-react";

export default function PaginaDePlanos() {
  const [currentCardMobile, setCurrentCardMobile] = useState(0);
  const [currentCardDesktop, setCurrentCardDesktop] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Estados de Autenticação In-Page (Mantidos para o Banner de Degustação)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [pendingAction, setPendingAction] = useState<{ href?: string } | null>(null);

  // Estados do Slider de Condomínio - COMEÇA EM 12
  const [condoUnits, setCondoUnits] = useState<number>(12);

  // CORREÇÃO: Substituímos o wa.link pelo número direto para permitir texto dinâmico.
  // Coloque o número oficial da Nucleobase aqui (com 55, DDD e Número).
  const WHATSAPP_PHONE = "5531971078832";

  // Lógica de cálculo do condomínio: Piso de R$ 69,90 ou (Unidades * R$ 7,00)
  const condoPriceNumber = Math.max(69.90, condoUnits * 7);
  const condoPriceFormatted = condoPriceNumber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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

  // CORREÇÃO: Utilizando a API oficial wa.me para enviar a mensagem dinâmica
  const handleCondoContact = () => {
    const message = encodeURIComponent(`Olá! Tenho interesse no plano Nucleo Condo para ${condoUnits} unidades. Em sua página oficial, consta o investimento estimado de ${condoPriceFormatted}/mês. Gostaria de personalizar meu acesso. Aguardo seu retorno. Atenciosamente,`);
    trackClick(`WhatsApp Condo - ${condoUnits} Unidades`, "whatsapp");
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${message}`, '_blank');
  };

  // Funções Auxiliares de Cadastro
  const formatarSlug = (texto: string) => {
    return texto.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  };

  const enviarNotificacaoAdm = async (nomeNovo: string, emailNovo: string) => {
    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "9ef5a274-150a-4664-a885-0b052efd06f7",
          subject: "🚀 Novo Cadastro na Nucleobase (Planos - Degustação)!",
          message: `O usuário ${nomeNovo || "Anônimo"} se cadastrou na página de planos.\nE-mail: ${emailNovo}`
        }),
      });
    } catch (e) { console.error("Erro Web3Forms:", e); }
  };

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

          await supabase.from('profiles').upsert([{
            id: authData.user.id, email: emailFinal, email_contato: emailFinal, nome_completo: nomeFinal, plan_type: 'free', slug: slugFinal
          }]);

          try {
            await supabase.from('usuarios').upsert([{ id: authData.user.id, email: emailFinal, nome_completo: nomeFinal }]);
          } catch (err) { console.warn("Aviso na tabela usuarios:", err); }

          await enviarNotificacaoAdm(nomeFinal, emailFinal);
          const indicadorId = localStorage.getItem("nucleobase_referral_id");
          if (indicadorId && indicadorId !== authData.user.id) {
            await supabase.from("indicacoes").insert([{ indicador_id: indicadorId, indicado_id: authData.user.id, status: 'pendente' }]);
            localStorage.removeItem("nucleobase_referral_id");
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (signInError) throw signInError;
      }

      setIsLoggedIn(true);
      setShowAuthModal(false);

      if (pendingAction?.href) {
        window.location.href = pendingAction.href;
      }
      setPendingAction(null);

    } catch (err: any) {
      setAuthError(err.message || "Erro de autenticação. Verifique os dados.");
    } finally {
      setAuthLoading(false);
    }
  };

  // SVG WhatsApp Icon Inline
  const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c.003-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  );

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">

      {/* MODAL DE AUTENTICAÇÃO IN-PAGE (Usado para o Banner de Degustação) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative border border-slate-100">
            <button
              onClick={() => { setShowAuthModal(false); setPendingAction(null); }}
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
                  ? 'Cadastre-se rapidamente para iniciar seu período de degustação.'
                  : 'Insira suas credenciais para acessar seu painel.'}
              </p>

              <form onSubmit={handleAuthSubmit} className="w-full space-y-3">
                {authMode === 'register' && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input type="text" placeholder="Seu nome completo" required value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium" />
                  </div>
                )}
                <div className="relative group">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input type="email" placeholder="E-mail de acesso" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium" />
                </div>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input type="password" placeholder="Sua senha segura" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium" />
                </div>
                {authError && <p className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 p-3 rounded-xl text-center mt-2">{authError}</p>}

                <button type="submit" disabled={authLoading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-blue-600/20 disabled:opacity-50 mt-4 flex justify-center items-center gap-2 cursor-pointer">
                  {authLoading ? "Aguarde..." : (authMode === 'register' ? "Validar e Continuar" : "Entrar e Continuar")}
                  {!authLoading && <ArrowRight size={16} />}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button type="button" onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')} className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">
                  {authMode === 'register' ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
                </button>
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

      {/* BALÃO DE DEGUSTAÇÃO */}
      <div className="w-full bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-[2rem] p-6 md:p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-blue-700/50">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Zap size={180} />
        </div>
        <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-blue-200 shrink-0 border border-white/10 backdrop-blur-sm">
            <Gift size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">Boas vindas</span>
            </div>
            <h3 className="text-white font-bold text-lg leading-tight">Período de Degustação</h3>

            {/* Texto Condicional Desktop/Mobile */}
            <p className="hidden md:block text-blue-200 text-xs font-medium mt-1">Conheça e valide a plataforma com <strong className="text-white font-bold">45 dias gratuitos</strong> dependendo do plano escolhido.</p>
            <p className="md:hidden text-blue-200 text-xs font-medium mt-1">Para uso &apos;pessoal&apos;, conheça e valide a plataforma.</p>

          </div>
        </div>
        <div className="relative z-10 w-full md:w-auto shrink-0">
          <button
            onClick={() => {
              if (!isLoggedIn) {
                setPendingAction({ href: "/acesso-usuario" });
                setAuthMode('register');
                setShowAuthModal(true);
                trackClick("Intercepção Auth - Degustação Banner", "auth_modal");
              } else {
                trackClick("Começar Degustação Banner", "/acesso-usuario");
                window.location.href = "/acesso-usuario";
              }
            }}
            className="w-full md:w-auto px-8 py-4 bg-white text-blue-900 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            Começar Gratuitamente <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
        Níveis de Acesso <div className="h-px bg-gray-200 flex-1"></div>
      </h3>

      {/* 2 PILARES PRINCIPAIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-16">

        {/* PILAR 1: USO PESSOAL (Essencial & Pro) */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all flex flex-col border-b-4 border-b-transparent hover:border-b-blue-600 relative overflow-hidden">
          <div className="flex-grow relative z-10">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">
              <User size={18} className="text-blue-600" /> Uso Pessoal
            </div>

            {/* Título Modificado: Opções Essencial & Pro */}
            <h3 className="text-3xl font-bold text-slate-900 mb-3"><span className="text-gray-300 font-light">Opções</span> Essencial <span className="text-gray-300 font-light">&</span> Pro</h3>

            <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">Controle financeiro sob medida para pessoas físicas e famílias. Escolha a profundidade que sua gestão exige.</p>

            <div className="flex flex-col mb-8">
              <span className="text-3xl font-black text-slate-900 tracking-tighter">De R$ 9,90 a R$ 19,90</span>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">/mês (Descontos progressivos em planos de 3 a 12 meses)</span>
            </div>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">Essencial:</strong> Ideal para lançamentos manuais precisos, fidelidade zero e multi-dispositivos.</span>
              </li>
              <li className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                <Gem size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">Pro:</strong> Sincronização automática, suporte prioritário e conexão online com arquivos D-1.</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-auto relative z-10">
            <Link href="/planos/essencial" className="w-full py-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 hover:text-blue-600 transition-all text-center">
              Experimente o Plano Essencial
            </Link>
            <Link href="/planos/pro" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 text-center flex items-center justify-center gap-1.5">
              Avance mais com o Plano Pro <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-50 rounded-full blur-[80px] pointer-events-none"></div>
        </div>

        {/* PILAR 2: NUCLEO CONDO (Slider Dinâmico) */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl flex flex-col relative overflow-hidden group transition-all border-b-4 border-b-transparent hover:border-b-amber-500">
          <div className="absolute top-0 right-0 bg-amber-500 text-white px-5 py-1.5 rounded-bl-2xl font-black text-[9px] uppercase tracking-widest shadow-lg">
            Empresas
          </div>

          <div className="flex-grow relative z-10">
            <div className="flex items-center gap-2 text-amber-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">
              <Building2 size={18} /> Condomínios
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">Nucleo Condo</h3>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Gestão transparente e prestação de contas automatizada. O valor se adapta ao tamanho do seu condomínio.</p>

            {/* CALCULADORA / SLIDER */}
            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 mb-8 backdrop-blur-sm">
              <div className="flex justify-between items-end mb-4">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <SlidersHorizontal size={14} /> Unidades (Casas/Aptos)
                </span>
                <span className="text-3xl font-black text-white">{condoUnits}</span>
              </div>

              <div className="relative pt-2 pb-4">
                <input
                  type="range"
                  min="1"
                  max="300"
                  value={condoUnits}
                  onChange={(e) => setCondoUnits(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 transition-all"
                  style={{
                    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(condoUnits / 300) * 100}%, #334155 ${(condoUnits / 300) * 100}%, #334155 100%)`
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-700/50">
                <div className="flex flex-col">
                  <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Calculator size={10} /> Investimento Estimado
                  </span>
                  <span className="text-2xl font-black text-white tracking-tighter">
                    {condoPriceFormatted}
                  </span>
                </div>
                <div className="text-right flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Base de cálculo</span>
                  <span className="text-xs font-medium text-slate-400">R$ 7,00/unidade habitacional</span>
                </div>
              </div>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-2 mb-8">
              {["Painel de Síndico", "App para Moradores", "Módulo Inadimplência", "Rateio Automático"].map((v, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                  <CheckCircle2 size={14} className="text-amber-500 shrink-0" /> {v}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto relative z-10">
            {/* Botão Modificado com Ícone do WhatsApp */}
            <button
              onClick={handleCondoContact}
              className="w-full py-4 bg-amber-500 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Headphones size={16} /> Personalizar Plano <WhatsAppIcon />
            </button>
            <p className="text-center text-[10px] text-slate-500 font-medium mt-4">
              Fale com um consultor para fechar negócio e gerar nota fiscal.
            </p>
          </div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700"></div>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200 mt-10 mb-10"></div>

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