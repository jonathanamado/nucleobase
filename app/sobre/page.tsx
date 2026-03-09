"use client";
import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Target, 
  Zap, 
  Dna, 
  LockKeyhole, 
  Gift, 
  UserPlus,
  Users,
  ArrowUpRight,
  Star 
} from "lucide-react";

export default function SobreNucleobase() {
  const [progresso, setProgresso] = useState("0%");

  useEffect(() => {
    // 1. EVENTO DE VISUALIZAÇÃO DE CONTEXTO
    window.dataLayer?.push({
      event: "view_page_content",
      content_category: "institucional",
      content_name: "sobre_nucleobase"
    });

    const timer = setTimeout(() => {
      setProgresso("33%"); 
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // FUNÇÃO PADRÃO DE CLIQUE
  const trackClick = (label: string, destination: string) => {
    window.dataLayer?.push({
      event: "click_conversion_button",
      button_label: label,
      destination_url: destination,
      page_location: "/sobre"
    });
  };

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER DA PÁGINA SOBRE - SINCRONIZADO COM MINHA CONTA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Sobre a gente<span className="text-blue-600">.</span></span>
            <Dna size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          
          <h2 className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed mt-0">
            Simplicidade em seu controle financeiro.
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <a 
            href="/parceria" 
            onClick={() => trackClick("Seja um parceiro", "/parceria")}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm"
          >
            <Users size={14} /> Seja um parceiro
          </a>
          <a 
            href="/indique" 
            onClick={() => trackClick("Indique nosso APP", "/indique")}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg"
          >
            <ArrowUpRight size={14} /> Indique nosso APP
          </a>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Manifesto e Visão <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* NARRATIVA PRINCIPAL */}
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

            <div 
              onMouseEnter={() => window.dataLayer?.push({ event: "reading_manifesto_section" })}
              className="bg-blue-50/40 border-l-4 border-blue-600 p-10 my-12 rounded-r-[3rem] relative overflow-hidden group transition-all hover:bg-blue-50/60"
            >
              <ShieldCheck className="absolute -right-6 -bottom-6 text-blue-600 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700" size={180} />
              <p className="font-medium text-blue-900 italic text-2xl leading-relaxed relative z-10 tracking-tight">
                "Nossa missão é mitigar os riscos de interpretação e blindar a sua segurança através de padrões 
                rigorosos, transformando números brutos em decisões inteligentes."
              </p>
            </div>

            <p className="mb-8 text-gray-700">
              Sabemos que cada pessoa possui um método único para gerir seu orçamento, mas o controle manual impõe limites ao crescimento. Na <span className="font-bold text-blue-600">nucleobase.app</span>, elevamos esse compromisso, transformando a rotina financeira em um <span className="text-gray-900 font-bold italic">game de alta performance</span>: onde cada lançamento é um movimento estratégico para expandir seu real poder de compra e eliminar decisões equivocadas.
            </p>
          </div>
          
          <p className="text-gray-700">
            Acreditamos no <span className="text-gray-900 font-bold underline decoration-blue-200 underline-offset-4 decoration-2">controle consciente</span> como o primeiro nível de conquista para quem decidiu abandonar a incerteza e dominar o próprio destino com absoluta precisão e constância no dia a dia.
          </p>
        </div>


        {/* SIDEBAR DE DESTAQUES */}
        <div className="lg:col-span-5 flex flex-col gap-6">
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
                  <span>DNA Iniciante</span>
                  <span className="text-blue-400">Progresso Atual</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-1">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-[2500ms] ease-out relative"
                    style={{ width: progresso }}
                  >
                    <div className="absolute right-0 top-0 h-full w-4 bg-white/20 blur-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {[
            { id: "foco_clareza", icon: <Target size={24} />, color: "blue", title: "Foco em Clareza" },
            { id: "fluxo_eficiente", icon: <Zap size={24} />, color: "emerald", title: "Fluxo Eficiente" },
            { id: "sigilo_bancario", icon: <LockKeyhole size={24} />, color: "purple", title: "Sigilo Bancário" }
          ].map((item, idx) => (
            <div 
              key={idx} 
              onMouseEnter={() => window.dataLayer?.push({ event: "hover_feature_card", feature_name: item.id })}
              className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group flex items-center gap-6 flex-1"
            >
               <div className={`w-14 h-14 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm`}>
                {item.icon}
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-lg mb-1 tracking-tight">{item.title}</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed font-medium">Informação protegida e interface intuitiva.</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO DE VALORES E PILARES - SUGESTÃO INTEGRADA */}
      <div className="mt-20">
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
          Nossos Pilares <div className="h-px bg-gray-300 flex-1"></div>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Privacidade",
              desc: "Seus dados financeiros não são produtos. Criptografia e sigilo total são a nossa base.",
              icon: <LockKeyhole size={28} />,
            },
            {
              title: "Performance",
              desc: "Interface ultra-rápida projetada para que o registro não seja um fardo, mas um hábito.",
              icon: <Zap size={28} />,
            },
            {
              title: "Evolução",
              desc: "Nascemos do Excel e evoluímos com você. A melhoria contínua está em nosso DNA.",
              icon: <Dna size={28} />,
            }
          ].map((pilar, i) => (
            <div key={i} className="p-10 bg-white border border-gray-100 rounded-[3rem] shadow-sm hover:border-blue-100 transition-all">
              <div className="text-blue-600 mb-6 bg-blue-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center">
                {pilar.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{pilar.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {pilar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA DE FECHAMENTO */}
      <div className="mt-20 bg-blue-600 rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Pronto para dominar seu <br className="hidden md:block" /> fluxo financeiro?
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto font-medium opacity-80">
            Junte-se a centenas de usuários que transformaram a gestão de gastos em uma vantagem estratégica.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a 
              href="/cadastro"
              onClick={() => trackClick("Começar Agora - Sobre", "/cadastro")}
              className="bg-white text-blue-600 px-10 py-6 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all w-full md:w-auto text-center"
            >
              Começar agora (Gratuitamente por 90 dias)
            </a>
            <a 
              href="/planos"
              onClick={() => trackClick("Ver Planos - Sobre", "/planos")}
              className="bg-blue-700 text-white border border-white/20 px-10 py-6 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.2em] hover:bg-blue-800 transition-all w-full md:w-auto text-center"
            >
              Conhecer Planos (Do curto ao longo prazo)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}