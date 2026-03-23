"use client";
import React from "react";
import { 
  LifeBuoy, 
  BookOpen, 
  Video, 
  MessageSquare, 
  FileWarning, 
  Settings, 
  ArrowRight,
  ShieldCheck,
  Lock,
  Lightbulb,
  Instagram
} from "lucide-react";

export default function SuportePage() {
  const whatsappLink = "https://wa.link/qbxg9f";

  const centrais = [
    {
      title: "Base de Conhecimento",
      desc: "Tutoriais detalhados sobre fluxos de caixa, conciliação e dashboards.",
      icon: <BookOpen />,
      link: "/blog",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Vídeos e Dicas",
      desc: "Aprenda na prática a configurar sua conta e dominar o NucleoBase em poucos minutos.",
      icon: <Video />,
      link: "https://www.youtube.com/@nucleobaseapp",
      color: "text-purple-600",
      bg: "bg-purple-50",
      external: true 
    },
    {
      title: "Configurações da Conta",
      desc: "Dúvidas sobre acessos, senhas ou integração de equipe.",
      icon: <Settings />,
      link: "/configuracoes",
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Segurança e Dados",
      desc: "Entenda como protegemos suas informações e conformidade LGPD.",
      icon: <Lock />,
      link: "/seguranca_privacidade",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    }
  ];

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Como podemos ajudar hoje<span className="text-blue-600">?</span></span>
            <Lightbulb 
              size={32} 
              className="text-blue-600 opacity-35 ml-3" 
              strokeWidth={2} 
            />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium leading-relaxed mt-0">
            Escolha um canal abaixo. Priorizamos o contato humano para melhorar sua experiência na Nucleo.
          </h2>
        </div>
      </div>

      {/* LINHA DIVISÓRIA DE SEÇÃO */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Canais de Autoatendimento <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* GRIDS DE ATALHOS - MOBILE 2X2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-16">
        {centrais.map((item, i) => (
          <a 
            key={i} 
            href={item.link}
            target={item.external ? "_blank" : "_self"}
            rel={item.external ? "noopener noreferrer" : ""}
            className="group bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className={`${item.bg} ${item.color} w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform`}>
              {/* Ajuste para evitar erro de compilação: usando wrapper div em vez de cloneElement */}
              <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                {item.icon}
              </div>
            </div>
            <h3 className="text-xs md:text-xl font-bold text-gray-900 mb-1 md:mb-2 leading-tight">{item.title}</h3>
            <p className="hidden md:block text-sm text-gray-500 leading-relaxed mb-6 flex-1">
              {item.desc}
            </p>
            <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-blue-600 group-hover:translate-x-1 transition-transform mt-auto">
              <span className="hidden md:inline">Acessar agora</span> <ArrowRight size={14} />
            </div>
          </a>
        ))}
      </div>

      {/* LINHA DIVISÓRIA SUPORTE DIRETO */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Suporte Especializado <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-16">
        {/* CARD WHATSAPP */}
        <div className="bg-emerald-600 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 text-white relative overflow-hidden group shadow-2xl shadow-emerald-900/10">
          <div className="relative z-10 flex flex-col h-full">
            <div className="bg-white/20 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
              <MessageSquare size={24} className="md:w-7 md:h-7" />
            </div>
            <h3 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 tracking-tight">Suporte via<br/>WhatsApp</h3>
            <p className="text-emerald-100 mb-6 md:mb-10 text-sm md:text-base leading-relaxed max-w-[320px] font-medium italic">
              Fale com um consultor humano para questões técnicas ou comerciais em tempo real.
            </p>
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-3 bg-white text-emerald-600 px-6 py-3 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-xl w-fit"
            >
              Iniciar Chat Agora <ArrowRight size={16} />
            </a>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-all duration-700"></div>
        </div>

        {/* CARD REPORTAR BUG */}
        <div className="bg-gray-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 text-white relative overflow-hidden group shadow-2xl shadow-gray-900/20">
          <div className="relative z-10 flex flex-col h-full">
            <div className="bg-white/10 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
              <FileWarning size={24} className="text-amber-400 md:w-7 md:h-7" />
            </div>
            <h3 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 tracking-tight">Reportar um<br/>Problema</h3>
            <p className="text-gray-400 mb-6 md:mb-10 text-sm md:text-base leading-relaxed max-w-[320px] font-medium italic">
              Encontrou algo errado? Nos avise para que nossa engenharia possa corrigir imediatamente.
            </p>
            <a 
              href="/contato"
              className="mt-auto inline-flex items-center justify-center gap-3 bg-gray-800 text-white border border-gray-700 px-6 py-3 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-gray-700 transition-all w-fit"
            >
              Abrir Chamado Técnico
            </a>
          </div>
          <div className="absolute -top-20 -right-20 w-48 h-48 md:w-64 md:h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        </div>
      </div>

      {/* FOOTER DE SEGURANÇA */}
      <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-10 border border-dashed border-gray-200 rounded-[2rem] md:rounded-[2.5rem] gap-6 md:gap-8 bg-gray-50/30">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl text-gray-400 shadow-sm border border-gray-100">
            <ShieldCheck size={24} className="md:w-7 md:h-7" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm md:text-lg tracking-tight">Privacidade e Segurança</h4>
            <p className="text-[10px] md:text-sm text-gray-500 font-medium italic">Seus dados financeiros são protegidos por criptografia de alto nível.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-emerald-50 text-emerald-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Status: Operacional
            </div>
        </div>
      </div>

      {/* LINHA DIVISÓRIA "CONECTE-SE" */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM */}
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

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
}