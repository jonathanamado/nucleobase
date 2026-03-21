"use client";
import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Target, 
  Zap, 
  Dna, 
  LockKeyhole, 
  Users,
  ArrowUpRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Instagram
} from "lucide-react";

export default function SobreNucleobase() {
  const [progresso, setProgresso] = useState("0%");
  const [dnaStatus, setDnaStatus] = useState("DNA Iniciante");
  const [pilarAtivo, setPilarAtivo] = useState(0);

  const pilares = [
    {
      title: "Privacidade",
      desc: "Sigilo total dos dados.",
      fullDesc: "Seus dados financeiros não são produtos. Criptografia e sigilo total são a nossa base.",
      icon: <LockKeyhole size={28} />,
    },
    {
      title: "Performance",
      desc: "Interface ultra-rápida.",
      fullDesc: "Interface ultra-rápida projetada para que o registro não seja um fardo, mas um hábito.",
      icon: <Zap size={28} />,
    },
    {
      title: "Evolução",
      desc: "Melhoria contínua.",
      fullDesc: "Nascemos do Excel e evoluímos com você. A melhoria contínua está em nosso DNA.",
      icon: <Dna size={28} />,
    }
  ];

  useEffect(() => {
    window.dataLayer?.push({
      event: "view_page_content",
      content_category: "institucional",
      content_name: "sobre_nucleobase"
    });

    // Memória de Cálculo para Jornada e DNA
    // Regra: Perfil preenchido (50%) + Presença de Lançamentos (50%)
    const temPerfil = true; // Simulação de verificação
    const temLancamentos = true; // Simulação de verificação
    
    let valorProgresso = 0;
    if (temPerfil) valorProgresso += 50;
    if (temLancamentos) valorProgresso += 50;

    const timer = setTimeout(() => {
      setProgresso(`${valorProgresso}%`);
      
      // Contextualização da Barra de DNA conforme o cálculo
      if (valorProgresso === 100) {
        setDnaStatus("DNA Consistente");
      } else if (valorProgresso >= 50) {
        setDnaStatus("DNA em Evolução");
      } else {
        setDnaStatus("DNA Iniciante");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const trackClick = (label: string, destination: string) => {
    window.dataLayer?.push({
      event: "click_conversion_button",
      button_label: label,
      destination_url: destination,
      page_location: "/sobre"
    });
  };

  const proximoPilar = () => {
    if (pilarAtivo < pilares.length - 1) setPilarAtivo(pilarAtivo + 1);
  };

  const anteriorPilar = () => {
    if (pilarAtivo > 0) setPilarAtivo(pilarAtivo - 1);
  };

  // Layout Desktop Original (Sidebar)
  const CardsDestaqueDesktop = () => (
    <div className="flex flex-col gap-6 h-full">
      <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 group relative overflow-hidden transition-all hover:scale-[1.01] flex flex-col justify-center flex-1">
        <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
          <Zap size={180} strokeWidth={1} className="text-blue-500" />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-4 mb-1 mt-4">
            <div className="w-14 h-14 shrink-0 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Star size={24} fill="white" />
            </div>
            <div>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Sua Jornada</p>
              <h4 className="font-bold text-white text-xl leading-tight">Nível de Clareza</h4>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>{dnaStatus}</span>
              <span className="text-blue-400">Progresso Atual</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-1">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-[2500ms] ease-out relative" style={{ width: progresso }}>
                <div className="absolute right-0 top-0 h-full w-4 bg-white/20 blur-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {[
        { id: "foco_clareza", icon: <Target size={24} />, title: "Foco em Clareza" },
        { id: "fluxo_eficiente", icon: <Zap size={24} />, title: "Fluxo Eficiente" },
        { id: "sigilo_bancario", icon: <LockKeyhole size={24} />, title: "Sigilo Bancário" }
      ].map((item, idx) => (
        <div key={idx} className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group flex items-center gap-6 flex-1">
          <div className="w-14 h-14 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
            {item.icon}
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-lg mb-1 tracking-tight">{item.title}</h4>
            <p className="text-[13px] text-gray-500 leading-relaxed font-medium">Informação protegida e interface intuitiva.</p>
          </div>
        </div>
      ))}
    </div>
  );

  const LayoutDestaqueMobile = () => (
    <div className="my-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px bg-blue-100 flex-1"></div>
        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Destaques da Plataforma</span>
        <div className="h-px bg-blue-100 flex-1"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 bg-gray-900 p-6 rounded-[2rem] relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <Star size={20} className="text-blue-500" fill="currentColor" />
            <div>
              <p className="text-blue-400 text-[8px] font-black uppercase tracking-widest">Sua Jornada ({dnaStatus})</p>
              <h4 className="font-bold text-white text-sm">Progresso padrão Nucleo</h4>
            </div>
          </div>
          <div className="mt-4 h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-[2500ms]" style={{ width: progresso }}></div>
          </div>
        </div>

        {[
          { icon: <Target size={20} />, title: "Foco em Clareza" },
          { icon: <Zap size={20} />, title: "Fluxo Eficiente" },
          { icon: <LockKeyhole size={20} />, title: "Sigilo Bancário" },
          { icon: <ShieldCheck size={20} />, title: "Segurança DNA" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-gray-100 p-4 rounded-[1.5rem] flex flex-col items-center text-center gap-2">
            <div className="text-blue-600 bg-blue-50 p-3 rounded-xl">{item.icon}</div>
            <h4 className="font-bold text-gray-900 text-[10px] leading-tight uppercase tracking-tight">{item.title}</h4>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Sobre a gente<span className="text-blue-600">.</span></span>
            <Dna size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-0">
            Conheça nossa história.
          </h2>
        </div>

        <div className="hidden md:grid md:grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3">
          <a href="/parceria" onClick={() => trackClick("Seja um parceiro", "/parceria")} className="inline-flex items-center justify-center gap-1 md:gap-2 px-3 md:px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all font-bold text-[9px] md:text-[10px] uppercase tracking-tighter md:tracking-widest shadow-sm">
            <Users size={14} className="shrink-0" /> 
            <span className="md:inline hidden">Seja um parceiro</span>
          </a>
          <a href="/indique" onClick={() => trackClick("Indique nosso APP", "/indique")} className="inline-flex items-center justify-center gap-1 md:gap-2 px-3 md:px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-all font-bold text-[9px] md:text-[10px] uppercase tracking-tighter md:tracking-widest shadow-lg">
            <ArrowUpRight size={14} className="shrink-0" /> 
            <span className="md:inline hidden">Indique nosso APP</span>
          </a>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Manifesto e Visão <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        <div className="lg:col-span-7 text-gray-700 text-lg leading-[1.8] pr-0 lg:pr-10 flex flex-col justify-between">
          <div>
            <p className="mb-8 leading-relaxed text-gray-700">
              A Nucleobase nasceu de uma necessidade real tendo sua implantação{" "}
              <span className="inline-flex items-center justify-center bg-blue-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider shadow-sm uppercase align-middle">
                Digital
              </span>{" "}
              no ano de 2025. O que começou antes disso como uma ferramenta de controle pessoal em uma planilha de excel, 
              lapidada pelo tempo e demanda deste nicho, evoluiu para uma plataforma robusta, 
              focada em levar clareza e praticidade às pessoas.
            </p>

            <div className="bg-blue-50/40 border-l-4 border-blue-600 p-6 md:p-10 my-12 rounded-2xl md:rounded-r-[3rem] relative overflow-hidden group transition-all hover:bg-blue-50/60">
              <ShieldCheck className="absolute -right-6 -bottom-6 text-blue-600 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700" size={180} />
              <p className="font-medium text-blue-900 italic text-xl md:text-2xl leading-relaxed relative z-10 tracking-tight">
                "Nossa missão é mitigar os riscos de interpretação e blindar a sua segurança através de padrões 
                rigorosos, transformando números brutos em decisões inteligentes."
              </p>
            </div>

            <div className="block lg:hidden">
              <LayoutDestaqueMobile />
            </div>

            <p className="mb-8 text-gray-700">
              Sabemos que cada pessoa possui um método único para gerir seu orçamento, mas o controle manual impõe limites ao crescimento. Na <span className="font-bold text-blue-600">nucleobase.app</span>, elevamos esse compromisso, transformando a rotina financeira em um <span className="text-gray-900 font-bold italic">game de alta performance</span>: onde cada lançamento é um movimento estratégico para expandir seu real poder de compra e eliminar decisões equivocadas.
            </p>
          </div>
          <p className="text-gray-700">
            Acreditamos no <span className="text-gray-900 font-bold underline decoration-blue-200 underline-offset-4 decoration-2">controle consciente</span> como o primeiro nível de conquista para quem decidiu abandonar a incerteza e dominar o próprio destino com absoluta precisão e constância no dia a dia.
          </p>
        </div>

        <div className="hidden lg:block lg:col-span-5">
          <CardsDestaqueDesktop />
        </div>
      </div>

      {/* SEÇÃO PILARES */}
      <div className="mt-20">
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-4">
          Nossos Pilares <div className="h-px bg-gray-300 flex-1"></div>
        </h3>
        <p className="text-gray-500 text-sm md:text-base mb-10 font-medium">
          Fundamentos essenciais que guiam nossa tecnologia e garantem a excelência da sua experiência financeira.
        </p>

        <div className="relative flex items-center justify-center">
          {pilarAtivo > 0 && (
            <button onClick={anteriorPilar} className="md:hidden absolute left-0 z-20 bg-white shadow-lg border border-gray-100 text-blue-600 p-2 rounded-full active:scale-90 transition-all">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="w-full md:grid md:grid-cols-3 gap-8 flex items-center justify-center">
            {pilares.map((pilar, i) => (
              <div key={i} className={`p-10 bg-white border border-gray-100 rounded-[3rem] shadow-sm hover:border-blue-100 transition-all flex-1 ${pilarAtivo === i ? 'flex animate-in fade-in zoom-in-95 duration-300' : 'hidden'} md:flex md:animate-none`}>
                <div className="w-full flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="text-blue-600 mb-6 bg-blue-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center">
                    {pilar.icon}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{pilar.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed font-medium max-w-[240px] md:max-w-none">
                    <span className="hidden md:inline">{pilar.fullDesc}</span>
                    <span className="md:hidden inline">{pilar.desc}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          {pilarAtivo < pilares.length - 1 && (
            <button onClick={proximoPilar} className="md:hidden absolute right-0 z-20 bg-white shadow-lg border border-gray-100 text-blue-600 p-2 rounded-full active:scale-90 transition-all">
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 md:mt-20 bg-blue-600 rounded-3xl md:rounded-[4rem] p-8 md:p-20 text-center relative overflow-hidden group w-full">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
            Pronto para dominar seu <br className="hidden md:block" /> fluxo financeiro?
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            <a href="/cadastro" onClick={() => trackClick("Começar Agora - Sobre", "/cadastro")} className="bg-white text-blue-600 px-6 py-4 md:px-10 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-[10px] md:text-[12px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all w-full md:w-auto text-center">
              Começar agora
            </a>
            <a href="/planos" onClick={() => trackClick("Ver Planos - Sobre", "/planos")} className="bg-blue-700 text-white border border-white/20 px-6 py-4 md:px-10 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-[10px] md:text-[12px] uppercase tracking-widest hover:bg-blue-800 transition-all w-full md:w-auto text-center">
              Conhecer Planos
            </a>
          </div>
        </div>
      </div>

      {/* NOVA LINHA DIVISÓRIA "CONECTE-SE" CENTRALIZADA */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM CENTRALIZADO COM GRADIENTE E BRILHO */}
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
            {/* Efeito de brilho/glow ao fundo do ícone */}
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