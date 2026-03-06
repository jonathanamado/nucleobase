"use client";
import React, { useEffect } from "react";
import { 
  ShieldCheck, 
  Cookie, 
  Lock, 
  ArrowLeft,
  ShieldAlert,
  Fingerprint,
  Database
} from "lucide-react";

export default function CookiePolicy() {
  
  useEffect(() => {
    // 1. EVENTO DE VISUALIZAÇÃO DE CONTEXTO
    window.dataLayer?.push({
      event: "view_page_content",
      content_category: "institucional",
      content_name: "politica_cookies"
    });
  }, []);

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center">
            <span>Privacidade<span className="text-blue-600">.</span></span>
            <Cookie size={60} className="text-blue-600 skew-x-12 opacity-35 ml-4" strokeWidth={1.2} />
          </h1>
          
          <h2 className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed mt-0">
            Transparência total sobre nossos cookies funcionais.
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Nossas Diretrizes <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* NARRATIVA PRINCIPAL */}
        <div className="lg:col-span-7 text-gray-700 text-lg leading-[1.8] pr-0 lg:pr-10 flex flex-col justify-between">
          <div className="space-y-8">
            <p>
              Na <strong>Nucleobase</strong>, a sua segurança é o nosso alicerce. Ao contrário da maioria das plataformas de gestão, 
              <span className="text-blue-600 font-bold"> optamos por um ecossistema limpo</span>: não utilizamos cookies de terceiros para publicidade, remarketing ou rastreamento de comportamento fora do nosso domínio.
            </p>

            {/* MANIFESTO DE PRIVACIDADE */}
            <div 
              onMouseEnter={() => window.dataLayer?.push({ event: "reading_privacy_manifesto" })}
              className="bg-blue-50/40 border-l-4 border-blue-600 p-10 my-8 rounded-r-[3rem] relative overflow-hidden group transition-all hover:bg-blue-50/60"
            >
              <ShieldCheck className="absolute -right-6 -bottom-6 text-blue-600 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700" size={180} />
              <p className="font-medium text-blue-900 italic text-2xl leading-relaxed relative z-10 tracking-tight">
                "Não vendemos seus hábitos financeiros. Nossos cookies existem apenas para garantir que sua experiência seja fluida, segura e privada."
              </p>
            </div>

            <p>
              Entendemos que dados financeiros são sensíveis. Por isso, toda a inteligência de visualização de resultados e lançamentos é processada de forma <span className="text-gray-900 font-bold underline decoration-blue-200 underline-offset-4 decoration-2">nativa e interna</span>. Os cookies que emitimos são técnicos e fundamentais para a estabilidade da sua conta.
            </p>
          </div>
        </div>

        {/* SIDEBAR DE ATRIBUTOS TÉCNICOS - PADRONIZADA */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* CARD DE STATUS CRIPTOGRÁFICO */}
          <div className="flex-1 bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 group relative overflow-hidden transition-all hover:scale-[1.01] flex flex-col justify-center min-h-[160px]">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
              <Lock size={180} strokeWidth={1} className="text-blue-500" />
            </div>

            <div className="relative z-10 w-full">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 shrink-0 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Fingerprint size={20} />
                </div>
                <div>
                  <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.2em]">Segurança Base</p>
                  <h4 className="font-bold text-white text-lg leading-tight">Dados Blindados</h4>
                </div>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed font-medium">
                Cookies essenciais que protegem sua sessão contra acessos não autorizados.
              </p>
            </div>
          </div>

          {/* LISTA DE COOKIES NECESSÁRIOS */}
          {[
            { id: "auth_supabase", icon: <ShieldAlert size={20} />, color: "blue", title: "Autenticação", desc: "Mantém seu login seguro." },
            { id: "stripe_payment", icon: <Database size={20} />, color: "emerald", title: "Transacional", desc: "Integridade das assinaturas." },
            { id: "ui_preferences", icon: <Lock size={20} />, color: "purple", title: "Preferências", desc: "Retém suas escolhas de UI." }
          ].map((item, idx) => (
            <div 
              key={idx} 
              onMouseEnter={() => window.dataLayer?.push({ event: "hover_cookie_type", cookie_id: item.id })}
              className="flex-1 bg-white border border-gray-100 px-8 py-4 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group flex items-center gap-6 min-h-[90px]"
            >
              <div className={`w-12 h-12 shrink-0 bg-${item.color}-50 text-${item.color}-600 rounded-2xl flex items-center justify-center group-hover:bg-${item.color}-600 group-hover:text-white transition-all duration-500 shadow-sm`}>
                {item.icon}
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-base mb-0 tracking-tight">{item.title}</h4>
                <p className="text-[12px] text-gray-500 leading-tight font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}