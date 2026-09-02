// app/resultados-consultoria/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Wallet,
  Users,
  Instagram,
  Zap
} from "lucide-react";

export default function ResultadosGeraisPage() {
  const [cardAtivo, setCardAtivo] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const beneficiosModulos = [
    {
      title: "Consultoria Especializada",
      desc: "Benefício estratégico: conte com a experiência do nosso time para desenhar soluções sob medida, entendendo a dor do seu processo e otimizando resultados.",
      icon: <Users size={16} />,
      badgeDesktop: "Suporte Dedicado",
      badgeMobile: "Suporte",
      color: "text-purple-600",
      bg: "bg-purple-50",
      link: "/resultados-consultoria/consultoria-especializada",
      metric: "VIP",
      metricLabel: "Acompanhamento"
    },
    {
      title: "Gestão Financeira",
      desc: "Benefício direto para parceiros e usuários: ganhe clareza absoluta sobre fluxo de caixa, despesas e receitas com automações inteligentes e relatórios executivos.",
      icon: <Wallet size={16} />,
      badgeDesktop: "Performance & Controle",
      badgeMobile: "Controle",
      color: "text-blue-600",
      bg: "bg-blue-50",
      link: "/controle-financeiro",
      metric: "100%",
      metricLabel: "Visibilidade"
    },
    {
      title: "Gestão Condominial",
      desc: "Benefício para gestores e síndicos: simplifique a rotina de manutenções, canteiros, áreas comuns e prestação de contas com transparência total para os moradores.",
      icon: <Building2 size={16} />,
      badgeDesktop: "Eficiência Operacional",
      badgeMobile: "Eficiência",
      color: "text-amber-600",
      bg: "bg-amber-50",
      link: "/condo",
      metric: "24h",
      metricLabel: "Agilidade"
    }
  ];

  // Passar automaticamente de 6 em 6 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCardAtivo((prev) => (prev + 1) % beneficiosModulos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [beneficiosModulos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // sensibilidade do arrastar
    if (diff > threshold) {
      // Arrastou para a esquerda -> Próximo card
      setCardAtivo((prev) => (prev < beneficiosModulos.length - 1 ? prev + 1 : 0));
    } else if (diff < -threshold) {
      // Arrastou para a direita -> Card anterior
      setCardAtivo((prev) => (prev > 0 ? prev - 1 : beneficiosModulos.length - 1));
    }
  };

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0 text-xs md:text-sm">

      {/* BADGE SUPERIOR */}
      <div className="inline-flex items-center gap-2 text-blue-600 mb-3">
        <Zap size={16} className="fill-blue-600" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Nucleobase Intelligence 2026</span>
      </div>

      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 mt-0">
        <div className="flex-1">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>+ Resultados para <span className="text-blue-600">você.</span></span>
            <Sparkles size={24} className="text-blue-600 opacity-35 ml-2" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-xs md:text-sm font-medium leading-relaxed mt-0 w-full">
            <span className="md:hidden">Simplificamos processos para a sua rotina.</span>
            <span className="hidden md:inline">Nosso time entende a dor do processo e simplifica a rotina dos usuários com entregas modulares.</span>
          </h2>
        </div>

        {/* MÉTRICAS RÁPIDAS (OCULTAS NO MOBILE) */}
        <div className="hidden md:flex gap-2 mt-3 md:mt-0 justify-end">
          <div className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col items-center justify-center min-w-[80px]">
            <h4 className="text-base font-black text-gray-900 leading-tight">+ Modular</h4>
            <p className="text-[6px] text-gray-400 font-black uppercase tracking-widest">Soluções</p>
          </div>
          <div className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col items-center justify-center min-w-[80px]">
            <h4 className="text-base font-black text-gray-900 leading-tight">+ Simples</h4>
            <p className="text-[6px] text-gray-400 font-black uppercase tracking-widest">Processos</p>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE BENEFÍCIOS DOS MÓDULOS (CARROSSEL NO MOBILE) */}
      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-3">
        <span className="md:hidden">Benefícios</span>
        <span className="hidden md:inline">Benefícios por Módulo</span>
        <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div
        className="relative flex items-center justify-center mb-16 w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full md:grid md:grid-cols-3 gap-6 flex items-stretch justify-center">
          {beneficiosModulos.map((beneficio, idx) => (
            <div key={idx} className={`h-auto md:h-full w-full flex-1 ${cardAtivo === idx ? 'flex animate-in fade-in zoom-in-95 duration-300' : 'hidden'} md:flex md:animate-none`}>
              <Link
                href={beneficio.link}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                      event: "consulting_module_clicked",
                      module_title: beneficio.title,
                      module_badge: beneficio.badgeDesktop
                    });
                  }
                }}
                className="block w-full group bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* VISÃO DESKTOP: ÍCONE ISOLADO */}
                    <div className={`hidden md:flex w-9 h-9 ${beneficio.bg} ${beneficio.color} rounded-xl items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-sm`}>
                      {beneficio.icon}
                    </div>

                    {/* VISÃO MOBILE: ÍCONE + TEXTO NA LATERAL ESQUERDA */}
                    <div className="flex md:hidden items-center gap-2.5">
                      <div className={`w-8 h-8 ${beneficio.bg} ${beneficio.color} rounded-xl flex items-center justify-center shadow-sm`}>
                        {beneficio.icon}
                      </div>
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em]">
                        {beneficio.badgeMobile}
                      </span>
                    </div>

                    {/* BADGE DESKTOP (DIREITA) */}
                    <span className="hidden md:inline text-[9px] font-black text-blue-600 uppercase tracking-[0.15em] px-2.5 py-1 bg-blue-50/60 rounded-full">
                      {beneficio.badgeDesktop}
                    </span>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 tracking-tight flex items-center gap-2">
                    {beneficio.title} <ArrowRight size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                  </h3>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-6 font-medium italic">
                    {beneficio.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Acessar Módulo</span>
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* BLOCO DE DESTAQUE / VISÃO DO ECOSSISTEMA */}
      <div className="bg-gray-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 text-white relative overflow-hidden shadow-xl shadow-blue-900/10 mb-16">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <h2 className="text-xl md:text-3xl font-bold tracking-tight leading-tight m-0">
              <span className="md:hidden">Resultados reais.</span>
              <span className="hidden md:inline">Resultados reais para parceiros e usuários.</span>
            </h2>
          </div>
          <p className="text-gray-300 text-xs md:text-sm font-medium leading-relaxed mb-6">
            Seja indicando a plataforma ou integrando nossas soluções à sua operação, a Nucleobase entrega previsibilidade, robustez e suporte contínuo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/indique" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 text-center">
              Programa de Indicações <ArrowRight size={12} />
            </Link>
            <Link href="/parceiros" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center text-center">
              Seja um Parceiro Nucleobase
            </Link>
          </div>
        </div>
      </div>

      {/* LINHA DIVISÓRIA "CONECTE-SE" */}
      <div className="mt-16 flex items-center gap-3 mb-8">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM */}
      <div className="flex flex-col items-center text-center">
        <div className="max-w-2xl mb-8">
          <h4 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tighter mb-1.5">
            Fique por dentro <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
          </h4>
          <p className="text-gray-500 font-medium text-xs md:text-sm">
            Insights, novidades e bastidores da Nucleobase diretamente no seu feed.
          </p>
        </div>

        <a
          href="https://www.instagram.com/nucleobase.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[1.8rem] md:rounded-[2rem] flex items-center justify-center text-white shadow-lg relative z-10 group-hover:rotate-6 transition-all duration-500">
              <Instagram className="w-10 h-10 md:w-12 md:h-12" strokeWidth={1.5} />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-pink-500 transition-colors">@nucleobase.app</span>
            <div className="h-0.5 w-0 bg-pink-500 mt-1.5 group-hover:w-full transition-all duration-500 rounded-full"></div>
          </div>
        </a>
      </div>

      <p className="text-center mt-10 text-gray-400 text-[9px] font-medium italic uppercase tracking-widest">
        Nucleobase Results — Simplificando a rotina e potencializando o seu crescimento.
      </p>
    </div>
  );
}