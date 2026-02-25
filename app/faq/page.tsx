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
  Headphones,
  Sparkles
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
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER - PADRÃO NUCLEOBASE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center">
            <span>Perguntas Frequentes<span className="text-blue-600">.</span></span>
            <Sparkles size={60} className="text-blue-600 opacity-35 ml-4 rotate-12" strokeWidth={1.2} />
          </h1>
          <h2 className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed mt-0">
            Tudo o que você precisa saber para dominar sua operação.
          </h2>
        </div>
      </div>

      {/* LINHA DIVISÓRIA DE SEÇÃO */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Dúvidas e Respostas <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
        
        {/* LADO ESQUERDO: LISTA DE FAQ (LARGURA OTIMIZADA) */}
        <div className="lg:col-span-7 space-y-4">
          {perguntas.map((item, index) => (
            <div 
              key={index}
              className={`border rounded-[2rem] transition-all duration-300 ${
                aberto === index ? "border-blue-100 bg-blue-50/20 shadow-sm" : "border-gray-100 bg-white hover:border-blue-100"
              }`}
            >
              <button
                onClick={() => setAberto(aberto === index ? null : index)}
                className="w-full flex items-center justify-between p-7 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-colors ${aberto === index ? "bg-white shadow-sm" : "bg-gray-50"}`}>
                    {item.icon}
                  </div>
                  <span className="font-bold text-gray-900 text-lg tracking-tight">
                    {item.pergunta}
                  </span>
                </div>
                <ChevronDown 
                  className={`text-gray-400 transition-transform duration-500 ${aberto === index ? "rotate-180 text-blue-600" : ""}`} 
                  size={20} 
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  aberto === index ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-7 pb-8 pt-0 ml-[68px]">
                  <p className="text-gray-600 text-lg leading-relaxed font-medium italic">
                    {item.resposta}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* LADO DIREITO: EXPLICAÇÃO E CANAL DE APOIO */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-gray-50/50 border border-gray-100 p-10 rounded-[3rem] relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/50 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-6">
              <Headphones size={14} /> Canais de Apoio
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
              Não encontrou o que precisava?
            </h3>
            <p className="text-gray-500 font-medium leading-[1.8] mb-8">
              Nossa FAQ cobre o essencial, mas cada operação é única. Se o seu cenário não está aqui, use os canais ao lado ou abaixo para uma análise personalizada.
            </p>
            
            <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="bg-blue-50 p-4 rounded-xl text-blue-600">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-sm uppercase tracking-wider">E-mail Direto</h4>
                <a href="mailto:contato@nucleobase.app" className="text-blue-600 text-xs font-bold hover:underline">
                  contato@nucleobase.app
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE FORMULÁRIO E CHAMADO (FULL WIDTH PADRÃO) */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Abertura de Chamado <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32">
        <div className="lg:col-span-8">
          <form 
            action="https://api.web3forms.com/submit" 
            method="POST"
            className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-100 flex flex-col gap-6"
          >
            <input type="hidden" name="access_key" value="9ef5a274-150a-4664-a885-0b052efd06f7" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seu Nome</label>
                <input name="name" required type="text" className="px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 transition-all" placeholder="Ex: João Silva" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                <input name="email" required type="email" className="px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 transition-all" placeholder="seu@email.com" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descreva seu cenário</label>
              <textarea name="message" required className="px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 resize-none min-h-[150px] transition-all" placeholder="Detalhe sua dúvida ou problema técnico..."></textarea>
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl text-[11px] uppercase tracking-[0.2em]">
              <Send size={16} /> Enviar para especialistas
            </button>
          </form>
        </div>

        {/* WHATSAPP CTA - PADRÃO DARK */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-gray-900 p-10 rounded-[3rem] h-full text-white relative overflow-hidden flex flex-col justify-center shadow-2xl shadow-blue-900/20">
            <div className="relative z-10">
              <div className="w-14 h-14 bg-green-500/20 text-green-500 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20">
                <MessageCircle size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Suporte em Tempo Real</h3>
              <p className="text-gray-400 mb-10 text-sm leading-relaxed font-medium italic">
                Para urgências operacionais ou dúvidas rápidas sobre a plataforma.
              </p>
              <a 
                href={whatsappLink} 
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full inline-flex items-center justify-center gap-3 bg-white text-gray-900 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all hover:bg-blue-50"
              >
                Falar Agora <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );
}