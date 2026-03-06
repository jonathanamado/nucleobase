"use client";
import { useState, useEffect } from "react";
import { Cookie, ShieldCheck, X, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("nucleo-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    window.dataLayer?.push({ event: "cookie_consent_accepted" });
    localStorage.setItem("nucleo-consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-32 right-6 z-[70] animate-in fade-in zoom-in slide-in-from-right-10 duration-700">
      <div 
        className="relative group"
        onMouseEnter={() => setIsExpanded(true)}
      >
        
        {/* CONTEXTO EXPLICATIVO */}
        <div 
          className={`
            absolute bottom-full right-0 mb-4 w-72 p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl 
            transition-all duration-500 overflow-hidden
            ${isExpanded 
              ? "opacity-100 translate-y-0 pointer-events-auto" 
              : "opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto"
            }
          `}
        >
          {/* ÍCONE DE FUNDO (SHIELD) - DESIGN PREMIUM E MINIMALISTA */}
          <ShieldCheck 
            size={120} 
            className="absolute -right-4 -top-4 text-blue-100/100 -rotate-12 pointer-events-none" 
            strokeWidth={1}
          />

          <div className="flex flex-col items-center text-center relative z-10">
            <p className="text-[13px] font-bold text-gray-900 uppercase tracking-tight mb-3">
              Privacidade
            </p>
            
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium mb-2">
              Usamos apenas cookies essenciais para garantia da sua segurança na nossa Plataforma. Ao aceitá-los, você concorda com nossos termos, os quais estimulamos fortemente que sejam conhecidos por você.
            </p>

            {/* LINK PARA POLÍTICA */}
            <Link 
              href="/politica-de-cookies"
              className="group/link flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors border-t border-gray-50 pt-2 w-full justify-center"
            >
              Saiba mais sobre a Política de Cookies e Segurança
              <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* O BOTÃO EM SI */}
        <button
          onClick={handleAccept}
          className="
            w-24 h-24 md:w-28 md:h-28
            bg-gradient-to-br from-gray-800 to-black
            border-2 border-gray-700 hover:border-blue-600
            text-white rounded-[2.5rem]
            shadow-[0_20px_50px_rgba(0,0,0,0.3)]
            hover:scale-105 active:scale-95
            transition-all duration-500
            flex flex-col items-center justify-center gap-2
            relative overflow-hidden
          "
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <Cookie 
            size={32} 
            className="text-blue-400 group-hover:rotate-12 transition-transform duration-500 relative z-10" 
            strokeWidth={1.5}
          />
          
          <div className="flex flex-col items-center relative z-10">
            <span className="text-[14px] font-black uppercase tracking-[0.2em] leading-none">
              Cookies
            </span>
            <span className={`text-[12px] font-bold text-blue-400/80 uppercase tracking-widest mt-1.5 transition-opacity ${isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              Aceitar
            </span>
          </div>

          <div className="absolute -top-1 -right-1 bg-blue-600 p-1.5 rounded-full border-4 border-gray-50 shadow-lg">
            <X size={10} strokeWidth={4} className="text-white" />
          </div>
        </button>
      </div>
    </div>
  );
}