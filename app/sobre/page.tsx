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
    // Informa ao GTM que o usuário está conhecendo a visão da empresa
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

  // FUNÇÃO PADRÃO DE CLIQUE (Reutilizável)
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
      
      {/* HEADER DA PÁGINA SOBRE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center">
            <span>Sobre a gente<span className="text-blue-600">.</span></span>
            <Dna size={60} className="text-blue-600 skew-x-12 opacity-35 ml-4" strokeWidth={1.2} />
          </h1>
          
          <h2 className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed mt-0">
            Simplicidade em seu orçamento doméstico.
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
            <p className="mb-8">
              A Nucleobase nasceu de uma necessidade real tendo sua implantação digital no ano de 2025. O que começou como uma ferramenta de controle pessoal, 
              lapidada pelo tempo e demanda deste nicho, evoluiu para uma plataforma robusta, 
              focada em levar clareza e praticidade às pessoas.
            </p>

            {/* EVENTO DE LEITURA (Observação de bloco importante) */}
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
              Cada pessoa possui um método único para gerir seu orçamento doméstico... Na <span className="font-bold text-blue-600">nucleobase.app</span>, transformamos essa rotina em um <span className="text-gray-900 font-bold italic">game de alta performance</span>. 
            </p>
          </div>
          
          <p className="text-gray-700">
            Acreditamos no <span className="text-gray-900 font-bold underline decoration-blue-200 underline-offset-4 decoration-2">controle consciente</span> como o primeiro nível de conquista.
          </p>
        </div>

        {/* SIDEBAR DE DESTAQUES */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Card de Nível */}
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

          {/* Mapeamento de Atributos */}
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
               {/* ... Conteúdo do Card (Mantido original) ... */}
               <div className={`w-14 h-14 shrink-0 bg-${item.color}-50 text-${item.color}-600 rounded-2xl flex items-center justify-center group-hover:bg-${item.color}-600 group-hover:text-white transition-all duration-500 shadow-sm`}>
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
    </div>
  );
}