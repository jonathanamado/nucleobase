"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
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
  Instagram,
  UserPlus,
  UserCircle
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SobreNucleobase() {
  const [pilarAtivo, setPilarAtivo] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

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
    else setPilarAtivo(0);
  };

  const anteriorPilar = () => {
    if (pilarAtivo > 0) setPilarAtivo(pilarAtivo - 1);
    else setPilarAtivo(pilares.length - 1);
  };

  const BotaoAcessoDinamico = () => {
    if (isLoggedIn === null) return <div className="h-10 animate-pulse bg-white/5 rounded-xl mt-4" />;

    if (isLoggedIn) {
      return (
        <a 
          href="/minha-conta" 
          onClick={() => trackClick("Acessar Minha Conta", "/minha-conta")}
          className="flex items-center justify-between bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-xl transition-all group/btn mt-4 shadow-lg shadow-blue-600/20"
        >
          <div className="flex items-center gap-2">
            <UserCircle size={16} className="text-white" />
            <span className="text-white text-[10px] font-black uppercase tracking-widest">Minha conta</span>
          </div>
          <ArrowUpRight size={14} className="text-white/50 group-hover/btn:text-white transition-colors" />
        </a>
      );
    }

    return (
      <a 
        href="/cadastro" 
        onClick={() => trackClick("Ir para Cadastro", "/cadastro")}
        className="flex items-center justify-between bg-white/10 hover:bg-white/20 py-2 px-4 rounded-xl transition-all group/btn mt-4 border border-white/10"
      >
        <div className="flex items-center gap-2">
          <UserPlus size={16} className="text-blue-400" />
          <span className="text-white text-[10px] font-black uppercase tracking-widest">Criar cadastro</span>
        </div>
        <ArrowUpRight size={14} className="text-blue-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
      </a>
    );
  };

  const CardsDestaqueDesktop = () => (
    <div className="flex flex-col gap-6 h-full">
      <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 group relative overflow-hidden transition-all hover:scale-[1.01] flex flex-col justify-center flex-1">
        <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
          <Zap size={180} strokeWidth={1} className="text-blue-500" />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 shrink-0 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Star size={24} fill="white" />
            </div>
            <div>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Sua Jornada</p>
              <h4 className="font-bold text-white text-xl leading-tight">
                {isLoggedIn ? "Histórico de acesso" : "Uma nova era"}
              </h4>
            </div>
          </div>
          <BotaoAcessoDinamico />
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
        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Destaques</span>
        <div className="h-px bg-blue-100 flex-1"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 bg-gray-900 p-6 rounded-[2rem] relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10 mb-4">
            <div className="flex items-center gap-3">
               <Star size={20} className="text-blue-500" fill="currentColor" />
               <div>
                  <p className="text-blue-400 text-[8px] font-black uppercase tracking-widest">Sua Jornada</p>
                  <h4 className="font-bold text-white text-sm">Privacidade & Evolução</h4>
               </div>
            </div>
            <div className="flex gap-2">
               <button onClick={anteriorPilar} className="p-2 bg-white/5 rounded-full text-white active:bg-white/20"><ChevronLeft size={16}/></button>
               <button onClick={proximoPilar} className="p-2 bg-white/5 rounded-full text-white active:bg-white/20"><ChevronRight size={16}/></button>
            </div>
          </div>
          
          <div className="relative z-10 py-2 border-y border-white/5 mb-2">
            <p className="text-blue-100 text-[11px] font-medium italic opacity-80 leading-relaxed">
              "{pilares[pilarAtivo].fullDesc}"
            </p>
          </div>

          <BotaoAcessoDinamico />
        </div>

        {[
          { icon: <Target size={20} />, title: "Foco" },
          { icon: <Zap size={20} />, title: "Consistência" },
          { icon: <LockKeyhole size={20} />, title: "Sigilo" },
          { icon: <ShieldCheck size={20} />, title: "Segurança" }
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
          <a href="/parceria" className="inline-flex items-center justify-center gap-1 md:gap-2 px-3 md:px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all font-bold text-[9px] md:text-[10px] uppercase tracking-widest shadow-sm">
            <Users size={14} className="shrink-0" /> 
            <span className="md:inline hidden">Seja um parceiro</span>
          </a>
          <a href="/indique" className="inline-flex items-center justify-center gap-1 md:gap-2 px-3 md:px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-all font-bold text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg">
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
            <p className="mb-8 leading-relaxed text-gray-700 hidden md:block">
              A Nucleobase nasceu de uma necessidade real tendo sua implantação{" "}
              <span className="inline-flex items-center justify-center bg-blue-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider shadow-sm uppercase align-middle">
                Digital
              </span>{" "}
              no ano de 2025. O que começou antes disso como uma ferramenta de controle pessoal em uma planilha de excel, 
              lapidada pelo tempo e demanda deste nicho, evoluiu para uma plataforma robusta.
            </p>
            
            <p className="mb-6 text-sm leading-relaxed text-gray-600 md:hidden font-medium">
              A base da Nucleo é uma planilha de Excel, lapidada pelo tempo, evoluindo para uma plataforma robusta, transformando controles financeiros em experiência digital estratégica para usuários de diferentes níveis.
            </p>

            <div className="bg-blue-50/40 border-l-4 border-blue-600 p-6 md:p-10 my-12 rounded-2xl md:rounded-r-[3rem] relative overflow-hidden group transition-all hover:bg-blue-50/60">
              <ShieldCheck className="absolute -right-6 -bottom-6 text-blue-600 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700" size={180} />
              <p className="font-medium text-blue-900 italic text-xl md:text-2xl leading-relaxed relative z-10 tracking-tight">
                "Nossa missão é mitigar os riscos de interpretação e blindar a sua segurança através de padrões 
                rigorosos."
              </p>
            </div>

            <div className="block lg:hidden">
              <LayoutDestaqueMobile />
            </div>

            <p className="mb-8 text-gray-700 hidden md:block">
              Sabemos que cada pessoa possui um método único para gerir seu orçamento, mas o controle manual impõe limites ao crescimento. Na <span className="font-bold text-blue-600">nucleobase.app</span>, elevamos esse compromisso.
            </p>
          </div>
          <p className="text-gray-700 text-sm md:text-lg">
            Acreditamos no <span className="text-gray-900 font-bold underline decoration-blue-200 underline-offset-4 decoration-2">controle consciente</span> como o primeiro nível de conquista, por isso nossos pilares são fundamentados em tópicos que fazem parte da nossa essência: foco, consistência, sigilo e segurança. 
          </p>
        </div>

        <div className="hidden lg:block lg:col-span-5">
          <CardsDestaqueDesktop />
        </div>
      </div>

      <div className="mt-20 hidden md:block">
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-4">
          Nossos Pilares <div className="h-px bg-gray-300 flex-1"></div>
        </h3>
        <div className="grid grid-cols-3 gap-8">
          {pilares.map((pilar, i) => (
            <div key={i} className="p-10 bg-white border border-gray-100 rounded-[3rem] shadow-sm flex flex-col items-start transition-all hover:shadow-md">
              <div className="text-blue-600 mb-6 bg-blue-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center">
                {pilar.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{pilar.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {pilar.fullDesc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 md:mt-20 bg-blue-600 rounded-3xl md:rounded-[4rem] p-8 md:p-20 text-center relative overflow-hidden group w-full">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
            Pronto para dominar seu <br className="hidden md:block" /> fluxo financeiro?
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            <a href="/cadastro" className="bg-white text-blue-600 px-6 py-4 md:px-10 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-[10px] md:text-[12px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all w-full md:w-auto text-center">
              Começar agora
            </a>
            <a href="/planos" className="bg-blue-700 text-white border border-white/20 px-6 py-4 md:px-10 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-[10px] md:text-[12px] uppercase tracking-widest hover:bg-blue-800 transition-all w-full md:w-auto text-center">
              Conhecer Planos
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
  );
}