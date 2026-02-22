// app/suporte/page.tsx
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
  Lock // Adicionado para o novo card
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
      link: "#",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    }
  ];

  return (
    <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* HEADER DA PÁGINA */}
      <div className="mb-12 mt-2">
        <div className="flex items-center gap-3 text-blue-600 mb-4">
          <LifeBuoy className="animate-spin-slow" size={32} />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Central de Sucesso</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Como podemos ajudar hoje<span className="text-blue-600">?</span> 👋👋👋
        </h1>
        <p className="text-gray-500 text-lg max-w-4xl leading-relaxed">
          Sua jornada na <strong>Núcleo</strong> deve ser fluida. Escolha um dos canais abaixo para resolver sua dúvida ou otimizar sua gestão de uma maneira simples e efetiva. Incentivamos o contato de uma maneira humana, esteja ciente que é da mesma forma que retornaremos o contato para melhorar sua experiência na Núcleo.
        </p>
      </div>

      {/* GRIDS DE ATALHOS - AJUSTADO PARA 4 COLUNAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {centrais.map((item, i) => (
          <a 
            key={i} 
            href={item.link}
            className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className={`${item.bg} ${item.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">
              {item.desc}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600">
              Acessar agora <ArrowRight size={14} />
            </div>
          </a>
        ))}
      </div>

      {/* SEÇÃO DE SUPORTE CRÍTICO / DIRETO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CARD WHATSAPP (Suporte Real-time) */}
        <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-3xl font-bold mb-4 tracking-tight">Suporte via<br/>WhatsApp</h3>
            <p className="text-emerald-100 mb-8 text-sm leading-relaxed max-w-[280px]">
              Fale com um consultor humano para questões técnicas ou comerciais.
            </p>
            <a 
              href={whatsappLink}
              target="_blank"
              className="inline-flex items-center gap-3 bg-white text-emerald-600 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-lg"
            >
              Iniciar Chat Agora
            </a>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
        </div>

        {/* CARD REPORTAR BUG (Focado em Melhoria) */}
        <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <FileWarning size={24} className="text-amber-400" />
            </div>
            <h3 className="text-3xl font-bold mb-4 tracking-tight">Reportar um<br/>Problema</h3>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed max-w-[280px]">
              Encontrou algo errado? Nos avise para que possamos corrigir imediatamente.
            </p>
            <a 
              href="/contato"
              className="inline-flex items-center gap-3 bg-gray-800 text-white border border-gray-700 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-700 transition-all"
            >
              Abrir Ticket
            </a>
          </div>
        </div>

      </div>

      {/* FOOTER DE SEGURANÇA */}
      <div className="mt-16 flex flex-col md:flex-row items-center justify-between p-8 border border-dashed border-gray-200 rounded-[2rem] gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-gray-50 p-3 rounded-full text-gray-400">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Privacidade e Segurança</h4>
            <p className="text-xs text-gray-500">Seus dados são protegidos por criptografia RSA 2048 bits.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <span className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full">Status: Operacional</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}