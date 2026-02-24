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
  Lightbulb, // Alterado: Lightbulb em vez de Handshake
  Sparkles
} from "lucide-react";

export default function SuportePage() {
  const whatsappLink = "https://wa.link/qbxg9f";

  const centrais = [
    {
      title: "Base de Conhecimento",
      desc: "Tutoriais detalhados sobre fluxos de caixa, conciliação e dashboards.",
      icon: <BookOpen size={24} />,
      link: "/blog",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Vídeos e Dicas",
      desc: "Aprenda visualmente como configurar sua conta em menos de 5 minutos.",
      icon: <Video size={24} />,
      link: "#",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Configurações da Conta",
      desc: "Dúvidas sobre acessos, senhas ou integração de equipe.",
      icon: <Settings size={24} />,
      link: "#",
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Segurança e Dados",
      desc: "Entenda como protegemos suas informações e conformidade LGPD.",
      icon: <Lock size={24} />,
      link: "/privacidade",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    }
  ];

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER DA PÁGINA - PADRÃO NUCLEOBASE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <LifeBuoy className="animate-spin-slow" size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Central de Sucesso</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center">
            <span>Como podemos ajudar hoje<span className="text-blue-600">?</span></span>
            {/* NOVO DESENHO: LIGHTBULB PARA INSIGHTS E SUPORTE INTELIGENTE */}
            <Lightbulb 
              size={64} 
              className="text-blue-600 opacity-30 ml-6 -rotate-12 transition-transform hover:rotate-0 duration-700" 
              strokeWidth={1.2} 
            />
          </h1>
          <h2 className="text-gray-500 text-xl font-medium max-w-4xl leading-relaxed mt-2">
            Escolha um dos canais abaixo. Incentivamos o contato de uma maneira humana, pois é assim que trabalhamos para melhorar sua experiência na Núcleo.
          </h2>
        </div>
      </div>

      {/* LINHA DIVISÓRIA DE SEÇÃO */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Canais de Autoatendimento <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* GRIDS DE ATALHOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {centrais.map((item, i) => (
          <a 
            key={i} 
            href={item.link}
            className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className={`${item.bg} ${item.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">
              {item.desc}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 group-hover:translate-x-1 transition-transform">
              Acessar agora <ArrowRight size={14} />
            </div>
          </a>
        ))}
      </div>

      {/* LINHA DIVISÓRIA SUPORTE DIRETO */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Suporte Especializado <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        
        {/* CARD WHATSAPP */}
        <div className="bg-emerald-600 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-emerald-900/10">
          <div className="relative z-10 flex flex-col h-full">
            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-4xl font-bold mb-4 tracking-tight">Suporte via<br/>WhatsApp</h3>
            <p className="text-emerald-100 mb-10 text-base leading-relaxed max-w-[320px] font-medium italic">
              Fale com um consultor humano para questões técnicas ou comerciais em tempo real.
            </p>
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-3 bg-white text-emerald-600 px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-xl w-fit"
            >
              Iniciar Chat Agora <ArrowRight size={16} />
            </a>
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-all duration-700"></div>
        </div>

        {/* CARD REPORTAR BUG */}
        <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-gray-900/20">
          <div className="relative z-10 flex flex-col h-full">
            <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <FileWarning size={28} className="text-amber-400" />
            </div>
            <h3 className="text-4xl font-bold mb-4 tracking-tight">Reportar um<br/>Problema</h3>
            <p className="text-gray-400 mb-10 text-base leading-relaxed max-w-[320px] font-medium italic">
              Encontrou algo errado? Nos avise para que nossa engenharia possa corrigir imediatamente.
            </p>
            <a 
              href="/contato"
              className="mt-auto inline-flex items-center justify-center gap-3 bg-gray-800 text-white border border-gray-700 px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-700 transition-all w-fit"
            >
              Abrir Chamado Técnico
            </a>
          </div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        </div>
      </div>

      {/* FOOTER DE SEGURANÇA PADRONIZADO */}
      <div className="flex flex-col md:flex-row items-center justify-between p-10 border border-dashed border-gray-200 rounded-[2.5rem] gap-8 bg-gray-50/30">
        <div className="flex items-center gap-6">
          <div className="bg-white p-4 rounded-2xl text-gray-400 shadow-sm border border-gray-100">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg tracking-tight">Privacidade e Segurança</h4>
            <p className="text-sm text-gray-500 font-medium italic">Seus dados financeiros são protegidos por criptografia de nível bancário.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Status: Operacional
           </div>
        </div>
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