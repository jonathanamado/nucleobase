// app/faq/page.tsx
"use client";
import React, { useState } from "react";
import { 
  ChevronDown, 
  HelpCircle, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Users, 
  MessageCircle, 
  Send, 
  Mail, 
  Sparkles,
  Headphones
} from "lucide-react";

export default function FAQ() {
  const [aberto, setAberto] = useState<number | null>(null);
  const whatsappLink = "https://wa.link/qbxg9f";

  const perguntas = [
    {
      icon: <ShieldCheck className="text-blue-600" size={20} />,
      pergunta: "Meus dados financeiros estão seguros na Nucleobase?",
      resposta: "Sim. Utilizamos criptografia de ponta a ponta e infraestrutura bancária para garantir que suas informações estratégicas e financeiras estejam protegidas sob os mais rígidos padrões de segurança da LGPD."
    },
    {
      icon: <Zap className="text-amber-500" size={20} />,
      pergunta: "Como a Nucleobase acelera minha gestão?",
      resposta: "A Nucleobase elimina o trabalho manual de planilhas complexas, centralizando dados de faturamento, custos e indicadores em uma interface intuitiva que gera relatórios automáticos em tempo real."
    },
    {
      icon: <BarChart3 className="text-emerald-500" size={20} />,
      pergunta: "Posso personalizar os indicadores do meu dashboard?",
      resposta: "Com certeza. O sistema é modular, permitindo que você visualize os KPIs (Indicadores Chave de Desempenho) que mais importam para o seu modelo de negócio, seja ele focado em serviços, varejo ou tecnologia."
    },
    {
      icon: <Users className="text-purple-500" size={20} />,
      pergunta: "É possível integrar minha equipe no sistema?",
      resposta: "Sim. Você pode convidar membros da sua equipe e definir níveis de acesso personalizados, garantindo que cada colaborador veja apenas o que é necessário para sua função."
    },
    {
      icon: <HelpCircle className="text-blue-600" size={20} />,
      pergunta: "Como funciona o suporte técnico?",
      resposta: "Oferecemos suporte prioritário via chat e e-mail. Nossa equipe de especialistas em gestão está disponível para ajudar não apenas com o software, mas com as melhores práticas de organização financeira."
    }
  ];

  return (
    <div className="w-full max-w-4xl animate-in fade-in duration-700 pb-20">
      {/* TÍTULO */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-2 mt-2 tracking-tight">
          Perguntas Frequentes<span className="text-blue-600">.</span> 💡
        </h1>
        <h2 className="text-gray-500 text-lg font-bold">
          Tudo o que você precisa saber para dominar sua operação.
        </h2>
      </div>

      {/* LISTA DE FAQ */}
      <div className="space-y-4 mb-20">
        {perguntas.map((item, index) => (
          <div 
            key={index}
            className={`border rounded-2xl transition-all duration-300 ${
              aberto === index ? "border-blue-200 bg-blue-50/30 shadow-sm" : "border-gray-100 bg-white"
            }`}
          >
            <button
              onClick={() => setAberto(aberto === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${aberto === index ? "bg-white shadow-sm" : "bg-gray-50"}`}>
                  {item.icon}
                </div>
                <span className="font-bold text-gray-900 text-lg tracking-tight">
                  {item.pergunta}
                </span>
              </div>
              <ChevronDown 
                className={`text-gray-400 transition-transform duration-300 ${aberto === index ? "rotate-180 text-blue-600" : ""}`} 
                size={20} 
              />
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ${
                aberto === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-6 pt-0 ml-[52px]">
                <p className="text-gray-600 text-md leading-relaxed">
                  {item.resposta}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DIVISOR DE SEÇÃO (BARREIRA) */}
      <div className="relative mb-16 pt-8">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200"></div>
        </div>
      </div>

      {/* EXPLICAÇÃO DO CONTATO */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
          <Headphones size={14} /> Canais de Apoio
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Não encontrou o que precisava?
        </h3>
        <p className="text-gray-500 font-medium leading-relaxed">
          Nossa FAQ é projetada para cobrir as dúvidas mais recorrentes, mas sabemos que cada operação é única. Os canais abaixo são o nosso compromisso em não deixar você sem resposta para problemas ou cenários que não foram previstos aqui.
        </p>
      </div>

      {/* SEÇÃO DE FORMULÁRIO E E-MAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center group">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 mb-4 group-hover:bg-blue-100 transition">
                <Mail size={28} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-sm uppercase tracking-wider">E-mail</h3>
            <p className="text-xs text-gray-500 mb-4 tracking-tight leading-relaxed px-2">Para propostas, anexos ou questões complexas de gestão.</p>
            <a href="mailto:nucleobase.app@gmail.com" className="text-blue-600 text-[11px] font-black uppercase tracking-wider hover:underline">
                nucleobase.app@gmail.com
            </a>
        </div>

        <form 
          action="https://api.web3forms.com/submit" 
          method="POST"
          className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-4"
        >
          <input type="hidden" name="access_key" value="9ef5a274-150a-4664-a885-0b052efd06f7" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome</label>
              <input name="name" required type="text" className="px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 transition-all" placeholder="Seu nome" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
              <input name="email" required type="email" className="px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 transition-all" placeholder="seu@email.com" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mensagem</label>
            <textarea name="message" required className="flex-1 px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 resize-none min-h-[80px] transition-all" placeholder="Explique seu caso detalhadamente..."></textarea>
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg mt-2 text-[10px] uppercase tracking-[0.2em]">
            <Send size={14} /> Abrir Chamado
          </button>
        </form>
      </div>

      {/* SEÇÃO DE CONTATO RÁPIDO (WhatsApp) */}
      <div className="mt-8 p-10 bg-gray-900 rounded-[2rem] text-center text-white relative overflow-hidden shadow-xl shadow-blue-900/10 border border-white/5">
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
            <MessageCircle size={24} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Suporte em Tempo Real</h3>
          <p className="text-gray-400 mb-8 text-sm max-w-md">Para urgências operacionais ou dúvidas rápidas sobre a plataforma.</p>
          <a 
            href={whatsappLink} 
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 bg-white text-gray-900 px-12 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
          >
            Falar com Especialista <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
        {/* Efeito visual de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
      </div>
    </div>
  );
}

// Pequeno componente auxiliar para o ícone de seta no botão do WhatsApp
function ArrowRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );
}