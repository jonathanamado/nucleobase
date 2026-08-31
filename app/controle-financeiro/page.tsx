// app/controle-financeiro/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { supabase } from "@/lib/supabase";
import {
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Instagram,
  UserPlus,
  UserCircle,
  FileText,
  CalendarDays,
  Vote,
  X,
  MessageSquarePlus,
  Layers,
  Activity,
  Wallet,
  Briefcase,
  MessageCircle,
  LayoutDashboard,
  BarChart3
} from "lucide-react";

export default function ControleFinanceiroHome() {
  const [pilarAtivo, setPilarAtivo] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para controlar o índice do carrossel vivo (apenas um card visível por vez)
  const [cardAtivoIndex, setCardAtivoIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Estado para o carrossel manual interno do card mobile (Praticidade e Segurança)
  const [mobileCardIndex, setMobileCardIndex] = useState(0);

  // Estados do Formulário de Solicitação de Entrada
  const [solicitanteNome, setSolicitanteNome] = useState("");
  const [solicitanteEmail, setSolicitanteEmail] = useState("");
  const [solicitanteUnidade, setSolicitanteUnidade] = useState("");
  const [solicitanteCondo, setSolicitanteCondo] = useState("");

  // Telefone de suporte oficial da Administração Nucleo formatado
  const whatsappAdminPhone = "5531971078832";

  const pilares = [
    {
      title: "Clareza",
      desc: "Controle absoluto de gastos.",
      fullDesc: "Elimine planilhas manuais e veja suas finanças pessoais ou empresariais em painéis limpos, visuais e intuitivos.",
      icon: <FileText size={24} />,
    },
    {
      title: "Automação",
      desc: "Agilidade no dia a dia.",
      fullDesc: "Importe extratos via arquivo ou nuvem, cadastre lançamentos fixos e gerencie recorrências sem perder tempo.",
      icon: <Zap size={24} />,
    },
    {
      title: "Previsibilidade",
      desc: "Decisões orientadas a dados.",
      fullDesc: "Projeções de gastos futuros, controle de cartões de crédito e análises detalhadas para acelerar seus objetivos financeiros.",
      icon: <Wallet size={24} />,
    }
  ];

  // Recursos de destaque com os textos ajustados para terem exatamente a mesma quantidade de palavras do texto de referência:
  // Referência ("Elimine planilhas manuais e veja suas finanças pessoais ou empresariais em painéis limpos, visuais e intuitivos.") = 16 palavras.
  const recursosDestaque = [
    { id: "resultados_tempo_real", icon: <BarChart3 size={18} />, title: "Resultados & Indicadores", text: "Acompanhe todos os seus orçamentos detalhados e faturas abertas em tempo real.", link: "/controle-financeiro/resultados" },
    { id: "lancamentos_praticos", icon: <LayoutDashboard size={18} />, title: "Lançamentos Ágeis", text: "Registre facilmente despesas diárias e receitas importantes em poucos cliques seguros.", link: "/controle-financeiro/lancamentos" },
    { id: "amplitude_gestao", icon: <Briefcase size={18} />, title: "Consultoria", text: "Utilize diversas ferramentas analíticas avançadas para o seu dia a dia empresarial.", link: "/resultados-consultoria" },
    { id: "importar_arquivos", icon: <MessageCircle size={18} />, title: "Contato", text: "Processe com segurança múltiplos lançamentos de forma rápida e eficiente.", link: "/contato" }
  ];

  // Cards que serão passados manualmente no bloco mobile
  const mobileCards = [
    {
      title: "Praticidade e Agilidade",
      subtitle: "Modernização",
      type: "pilares",
      content: pilares
    },
    {
      title: "Resultados & Indicadores",
      subtitle: "Destaque",
      type: "recurso",
      icon: <BarChart3 size={18} />,
      text: "Acompanhe na palma da mão todos os seus orçamentos por contas bancárias de forma integrada.",
      link: "/controle-financeiro/resultados"
    },
    {
      title: "Lançamentos inteligentes",
      subtitle: "Destaque",
      type: "recurso",
      icon: <LayoutDashboard size={18} />,
      text: "Registre facilmente despesas diárias e receitas importantes em poucos cliques seguros.",
      link: "/controle-financeiro/lancamentos"
    },
    {
      title: "Consultoria especializada",
      subtitle: "Destaque",
      type: "recurso",
      icon: <Briefcase size={18} />,
      text: "Utilize diversas ferramentas analíticas avançadas para o seu dia a dia empresarial.",
      link: "/resultados-consultoria"
    },
    {
      title: "Contato simples e facilitado",
      subtitle: "Destaque",
      type: "recurso",
      icon: <MessageCircle size={18} />,
      text: "Processe com segurança múltiplos lançamentos financeiros de forma rápida, eficiente e garantida.",
      link: "/contato"
    }
  ];

  useEffect(() => {
    window.dataLayer?.push({
      event: "view_page_content",
      content_category: "institucional",
      content_name: "controle_financeiro"
    });

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Efeito de carrossel vivo para desktop
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCardAtivoIndex((prev) => (prev + 1) % recursosDestaque.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, recursosDestaque.length]);

  const trackClick = (label: string, destination: string) => {
    window.dataLayer?.push({
      event: "click_conversion_button",
      button_label: label,
      destination_url: destination,
      page_location: "/controle-financeiro"
    });
  };

  const nextMobileCard = () => {
    setMobileCardIndex((prev) => (prev + 1) % mobileCards.length);
  };

  const prevMobileCard = () => {
    setMobileCardIndex((prev) => (prev - 1 + mobileCards.length) % mobileCards.length);
  };

  const handleEnviarSolicitacao = (e: React.FormEvent) => {
    e.preventDefault();
    const textoMensagem = `Olá! Gostaria de solicitar meu cadastro para Acesso ao APP da Nucleo com foco em Controle Financeiro. Segue abaixo dados para liberação:\n\n` +
      `• *Nome:* ${solicitanteNome}\n` +
      `• *E-mail:* ${solicitanteEmail}\n` +
      `• *Projeto/Orçamento:* ${solicitanteCondo}\n` +
      `• *Detalhes:* ${solicitanteUnidade}`;

    const urlCompleta = `https://api.whatsapp.com/send?phone=${whatsappAdminPhone}&text=${encodeURIComponent(textoMensagem)}`;
    window.open(urlCompleta, "_blank");

    setSolicitanteNome("");
    setSolicitanteEmail("");
    setSolicitanteUnidade("");
    setSolicitanteCondo("");
    setIsModalOpen(false);
  };

  const BotaoAcessoDinamico = ({ isInsideLink = false }: { isInsideLink?: boolean }) => {
    if (isLoggedIn === null) {
      return (
        <div className="flex items-center justify-between bg-orange-500 py-1.5 px-3 rounded-xl mt-3 opacity-0 transition-opacity duration-300">
          <div className="flex items-center gap-2">
            <UserCircle size={14} className="text-white" />
            <span className="text-white text-[9px] font-black uppercase tracking-widest">Minha conta</span>
          </div>
          <ArrowUpRight size={12} className="text-white/50" />
        </div>
      );
    }

    const content = (
      <div className={`flex items-center justify-between py-1.5 px-3 rounded-xl transition-all group/btn mt-3 shadow-md ${isLoggedIn ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : 'bg-white/10 hover:bg-white/20 border border-white/10'}`}>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <UserCircle size={14} className="text-white" />
          ) : (
            <LayoutDashboard size={14} className="text-orange-400" />
          )}
          <span className="text-white text-[9px] font-black uppercase tracking-widest">
            {isLoggedIn ? "Minha conta" : "Acessar Dashboard"}
          </span>
        </div>
        <ArrowUpRight size={12} className={isLoggedIn ? "text-white/50 group-hover/btn:text-white transition-colors" : "text-orange-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"} />
      </div>
    );

    if (isInsideLink) {
      return content;
    }

    return (
      <a
        href="/controle-financeiro/lancamentos"
        onClick={() => trackClick(isLoggedIn ? "Acessar Dashboard" : "Ir para Lançamentos", "/controle-financeiro/lancamentos")}
      >
        {content}
      </a>
    );
  };

  const CardsDestaqueDesktop = () => {
    const itemAtual = recursosDestaque[cardAtivoIndex];

    return (
      <div className="flex flex-col gap-4 h-full justify-between">
        {/* CARD 1: ÁREA DE LANÇAMENTOS */}
        <Link
          href="/controle-financeiro/lancamentos"
          onClick={() => trackClick("O Futuro do seu Orçamento", "/controle-financeiro/lancamentos")}
          className="bg-gray-900 p-6 rounded-[2rem] shadow-xl shadow-orange-950/10 group relative overflow-hidden transition-all hover:scale-[1.01] flex flex-col justify-center cursor-pointer block"
        >
          <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
            <Zap size={140} strokeWidth={1} className="text-orange-500" />
          </div>
          <div className="relative z-10 w-full">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-11 h-11 shrink-0 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:bg-white group-hover:text-orange-500 transition-all duration-500">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <p className="text-orange-400 text-[9px] font-black uppercase tracking-[0.2em]">Controle Absoluto</p>
                <h4 className="font-bold text-white text-lg leading-tight">
                  {isLoggedIn ? "Área de lançamentos" : "Gestão inteligente"}
                </h4>
              </div>
            </div>
            <BotaoAcessoDinamico isInsideLink={true} />
          </div>
        </Link>

        {/* CARD 2 DESKTOP: RESULTADOS (Destaque de cores em azul na visão desktop) */}
        <Link
          href="/controle-financeiro/resultados"
          onClick={() => trackClick("Acessar Resultados", "/controle-financeiro/resultados")}
          className="bg-white border border-blue-200 p-6 rounded-[2rem] shadow-md shadow-blue-900/5 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-center cursor-pointer block"
        >
          <div className="relative z-10 w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-blue-600 text-[9px] font-black uppercase tracking-[0.2em]">Painel Analítico</p>
                <h4 className="font-bold text-gray-900 text-lg leading-tight">
                  Resultados
                </h4>
              </div>
            </div>
            <div className="flex items-center justify-between bg-blue-600 hover:bg-blue-700 py-2.5 px-3 rounded-xl transition-all group/btn shadow-md shadow-blue-500/20">
              <div className="flex items-center gap-2">
                <UserCircle size={14} className="text-white" />
                <span className="text-white text-[9px] font-black uppercase tracking-widest">Acessar Painel</span>
              </div>
              <ArrowUpRight size={12} className="text-white/70 group-hover/btn:text-white transition-colors" />
            </div>
          </div>
        </Link>

        {/* CARROSSEL VIVO DE RECURSOS (Desktop) */}
        <div
          className="relative flex flex-col justify-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Link
            href={itemAtual.link}
            key={cardAtivoIndex}
            onClick={() => trackClick(itemAtual.title, itemAtual.link)}
            className="p-5 rounded-[2rem] transition-all duration-500 animate-in fade-in zoom-in-95 flex items-start gap-3 h-auto min-h-[115px] block cursor-pointer bg-white border-2 border-gray-200 shadow-md hover:border-orange-300"
          >
            <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm mt-0.5 bg-orange-50 text-orange-600">
              {itemAtual.icon}
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <h4 className="font-black text-[14px] mb-1 tracking-tight leading-snug text-gray-900">
                {itemAtual.title}
              </h4>
              <p className="text-[12px] leading-relaxed font-medium text-gray-500">
                {itemAtual.text}
              </p>
            </div>
          </Link>

          {/* Indicadores / Paginação do Carrossel */}
          <div className="flex justify-center items-center gap-2 mt-3">
            {recursosDestaque.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCardAtivoIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === cardAtivoIndex ? "w-5 bg-orange-500" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                aria-label={`Ir para card ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const LayoutDestaqueMobile = () => {
    const currentMobileCard = mobileCards[mobileCardIndex];

    return (
      <div className="my-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-orange-100 flex-1"></div>
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Destaques</span>
          <div className="h-px bg-orange-100 flex-1"></div>
        </div>

        <p className="text-gray-700 text-sm font-medium mb-5 text-center leading-relaxed">
          Acreditamos que o <span className="text-gray-900 font-bold underline decoration-orange-200 underline-offset-4 decoration-2">controle rigoroso</span> é o caminho para acelerar sua estabilidade.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* BLOCO ÚNICO DE CARDS INTERATIVOS MOBILE */}
          <div className="col-span-2 bg-gray-900 p-5 rounded-[1.8rem] relative overflow-hidden block">
            <div className="flex items-center justify-between relative z-10 mb-3">
              <div className="flex items-center gap-2.5">
                <Star size={18} className="text-orange-500" fill="currentColor" />
                <div>
                  <p className="text-orange-400 text-[8px] font-black uppercase tracking-widest">{currentMobileCard.subtitle}</p>
                  <h4 className="font-bold text-white text-sm">{currentMobileCard.title}</h4>
                </div>
              </div>
              <div className="flex gap-1.5" onClick={(e) => e.preventDefault()}>
                <button onClick={prevMobileCard} className="p-1.5 bg-white/5 rounded-full text-white active:bg-white/20 cursor-pointer"><ChevronLeft size={14} /></button>
                <button onClick={nextMobileCard} className="p-1.5 bg-white/5 rounded-full text-white active:bg-white/20 cursor-pointer"><ChevronRight size={14} /></button>
              </div>
            </div>

            <div className="relative z-10 py-1.5 border-y border-white/5 mb-1">
              {currentMobileCard.type === "pilares" ? (
                <p className="text-orange-100 text-[11px] font-medium italic opacity-80 leading-relaxed">
                  "{currentMobileCard.content?.[pilarAtivo]?.fullDesc}"
                </p>
              ) : (
                <p className="text-orange-100 text-[11px] font-medium italic opacity-80 leading-relaxed">
                  "{currentMobileCard.text}"
                </p>
              )}
            </div>

            {/* Paginação manual dos cards mobile */}
            <div className="flex justify-center items-center gap-1.5 mt-3">
              {mobileCards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setMobileCardIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === mobileCardIndex ? "w-5 bg-orange-500" : "w-1.5 bg-white/30"}`}
                  aria-label={`Ir para card ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="col-span-2 bg-orange-50/60 border border-orange-100 p-3.5 rounded-2xl my-1 text-center">
            <p className="text-xs text-orange-950 font-medium leading-relaxed">
              Explore abaixo as ferramentas integradas do nosso módulo de Controle Financeiro, projetadas para otimizar orçamentos pessoais e empresariais.
            </p>
          </div>

          {[
            { icon: <BarChart3 size={16} />, title: "Resultados", link: "/controle-financeiro/resultados" },
            { icon: <LayoutDashboard size={16} />, title: "Lançamentos", link: "/controle-financeiro/lancamentos" },
            { icon: <Briefcase size={16} />, title: "Consultoria", link: "/resultados-consultoria" },
            { icon: <MessageCircle size={16} />, title: "Contato", link: "/contato" }
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.link}
              className="bg-white border border-gray-100 p-3.5 rounded-[1.2rem] flex flex-col items-center text-center gap-1.5 block"
            >
              <div className="text-orange-600 bg-orange-50 p-2 rounded-xl">{item.icon}</div>
              <h4 className="font-bold text-[10px] leading-tight uppercase tracking-tight text-gray-900">{item.title}</h4>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-16 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Gestão Fin<span className="text-orange-500">.</span></span>
            <Activity size={28} className="text-orange-500 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-sm md:text-base font-medium max-w-2xl leading-relaxed mt-0">
            <span className="md:hidden">Controle financeiro descomplicado</span>
            <span className="hidden md:block">Controle de orçamentos domésticos e empresariais de forma descomplicada.</span>
          </h2>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full mb-6 mt-3 md:hidden">
        <a href="/controle-financeiro/lancamentos" onClick={() => trackClick("Acessar Dashboard", "/controle-financeiro/lancamentos")} className="flex items-center justify-between flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3.5 px-5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md">
          <div className="flex items-center gap-2"><LayoutDashboard size={14} className="text-white" /> Acessar Dashboard</div>
          <ArrowUpRight size={14} />
        </a>
        <a href="/controle-financeiro/resultados" className="flex items-center justify-between flex-1 bg-gray-900 text-white py-3.5 px-5 rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-md">
          <div className="flex items-center gap-2"><BarChart3 size={14} className="text-orange-500" /> Painel de Resultados</div>
          <ArrowUpRight size={14} />
        </a>
      </div>

      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
        Gestão financeira <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 text-gray-700 text-base md:text-lg leading-[1.7] pr-0 lg:pr-8 flex flex-col justify-between">
          <div className="flex flex-col justify-between h-full">
            <p className="mb-6 leading-relaxed text-gray-700 hidden md:block">
              A Nucleo Financial nasceu para permitir clareza aos fluxos de caixa, unindo rigor tecnológico e inovação avançada para o{" "}
              <span className="inline-flex items-center justify-center bg-orange-500 text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider shadow-sm uppercase align-middle">
                Controle Financeiro
              </span>{" "}
              doméstico e corporativo.<br /><br />
              Sabendo que o principal obstáculo no gerenciamento diário e estratégico de despesas corporativas é a constante dispersão de dados financeiros importantes, centralizamos absolutamente tudo de forma inteligente e perfeitamente integrada em uma única plataforma moderna e ágil.
            </p>

            <div className="mb-6 md:hidden">
              <p className="text-sm leading-relaxed text-gray-600 font-medium mb-1">
                Transforme intencionalmente cada decisão em um salto de autonomia, unindo rigor, clareza, segurança e agilidade.
              </p>
            </div>

            <div className="bg-orange-50/40 border-l-4 border-orange-500 p-5 md:p-8 my-0 rounded-2xl md:rounded-r-[2.5rem] relative overflow-hidden group transition-all hover:bg-orange-50/60 flex flex-col justify-center">
              <ShieldCheck className="absolute -right-6 -bottom-6 text-orange-500 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700" size={150} />
              <p className="font-medium text-orange-950 text-base md:text-xl leading-relaxed relative z-10 tracking-tight">
                "Nosso objetivo é transformar números brutos em decisões práticas para sua rotina." <br />
                <Link href="/cadastro" className="text-orange-600 font-bold underline hover:text-orange-800 transition-colors text-xs md:text-sm">
                  <span className="inline md:hidden">Crie sua conta gratuitamente</span>
                </Link>
              </p>
            </div>

            <div className="block lg:hidden">
              <LayoutDestaqueMobile />
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-5 h-full">
          <CardsDestaqueDesktop />
        </div>
      </div>

      <div className="mt-14 hidden md:block">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3 flex items-center gap-4">
          Nossos Pilares <div className="h-px bg-gray-300 flex-1"></div>
        </h3>

        <div className="mb-8">
          <p className="mb-4 text-gray-700 text-base leading-[1.7]">
            Do lançamento diário de pequenas despesas à importação automatizada em lote de faturas e documentos complexos — oferecemos o poder absoluto de uma gestão ágil, eficiente e orientada a dados estratégicos.
          </p>
          <p className="text-gray-700 text-base leading-[1.7]">
            Acreditamos que o <span className="text-gray-900 font-bold underline decoration-orange-200 underline-offset-4 decoration-2">controle rigoroso</span> é o caminho definitivo para alcançar a liberdade financeira sustentável. Nossos pilares garantem a estrutura perfeita para organizar suas contas com total segurança e precisão.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {pilares.map((pilar, i) => (
            <div key={i} className="p-7 bg-white border border-gray-100 rounded-[2.2rem] shadow-sm flex flex-col items-start transition-all hover:shadow-md">
              <div className="text-orange-600 mb-4 bg-orange-50 w-12 h-12 rounded-[1.2rem] flex items-center justify-center">
                {pilar.icon}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{pilar.title}</h4>
              <p className="text-gray-500 text-xs leading-relaxed font-medium">
                {pilar.fullDesc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Card inferior bastante resumido, menor e sem o botão Solicitar Entrada */}
      <div className="mt-10 md:mt-16 bg-orange-500 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 text-center relative overflow-hidden group w-full">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-xl md:text-3xl font-bold text-white mb-3 tracking-tight">
            Fale com nossa equipe e profissionalize suas finanças.
          </h2>
          <div className="flex items-center justify-center">
            <a href="/contato" className="bg-white text-orange-600 px-6 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all text-center">
              Entrar em Contato
            </a>
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
          <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
            Fique por dentro <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
          </h4>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            Dicas de controle financeiro, novidades do sistema e conteúdos exclusivos no nosso Instagram.
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-6 animate-in fade-in duration-250">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-250">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8 space-y-2">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                  <Wallet size={20} />
                </div>
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Controle Financeiro</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-gray-900">Solicitar Inclusão</h2>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Insira seus dados para enviar a solicitação diretamente para o suporte e administração do módulo financeiro.
              </p>
            </div>

            <form onSubmit={handleEnviarSolicitacao} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  value={solicitanteNome}
                  onChange={(e) => setSolicitanteNome(e.target.value)}
                  className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-orange-400 transition-all text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">E-mail Cadastrado</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: joao@dominio.com"
                  value={solicitanteEmail}
                  onChange={(e) => setSolicitanteEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-orange-400 transition-all text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Orçamento</label>
                  <input
                    type="text"
                    required
                    placeholder="Pessoal / Empresa"
                    value={solicitanteCondo}
                    onChange={(e) => setSolicitanteCondo(e.target.value)}
                    className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-orange-400 transition-all text-xs font-medium placeholder:text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Detalhes</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Conta principal"
                    value={solicitanteUnidade}
                    onChange={(e) => setSolicitanteUnidade(e.target.value)}
                    className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-orange-400 transition-all text-xs font-medium placeholder:text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-13 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mt-6 shadow-lg shadow-orange-500/10 cursor-pointer"
              >
                Enviar Solicitação via WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}