"use client";
import React, { useState, useRef } from "react";
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
  Sparkles,
  Instagram,
  ArrowRight,
  Clock,
  Dna
} from "lucide-react";

export default function FAQ() {
  const [aberto, setAberto] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const whatsappLink = "https://wa.link/qbxg9f";

  // Função para limpar o formulário antes do redirecionamento do Web3Forms
  const handleSubmit = () => {
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.reset();
      }
    }, 100);
  };

  const perguntas = [
    {
      category: "Segurança",
      icon: <ShieldCheck size={20} />,
      pergunta: "Meus dados financeiros estão seguros na Nucleobase?",
      resposta: "Sim. Utilizamos criptografia de nível bancário e infraestrutura distribuída para garantir que suas informações estejam protegidas sob os mais rígidos padrões da LGPD. Seus dados são sua soberania."
    },
    {
      category: "Eficiência",
      icon: <Zap size={20} />,
      pergunta: "Como a Nucleobase acelera minha gestão?",
      resposta: "Eliminamos o 'caos das planilhas'. Centralizamos faturamento, custos e indicadores em uma interface ultra-rápida que gera relatórios automáticos, economizando horas de trabalho manual semanal."
    },
    {
      category: "Estratégia",
      icon: <BarChart3 size={20} />,
      pergunta: "Posso personalizar os indicadores do meu dashboard?",
      resposta: "Com certeza. O sistema é modular. Você define os KPIs (Indicadores Chave de Desempenho) vitais para seu modelo de negócio, garantindo uma visão cirúrgica da sua saúde financeira."
    },
    {
      category: "Colaboração",
      icon: <Users size={20} />,
      pergunta: "É possível integrar minha equipe no sistema?",
      resposta: "Sim. O plano permite múltiplos usuários com níveis de acesso granulares. Você controla exatamente quem pode visualizar ou editar cada setor da sua operação."
    },
    {
      category: "Parceria",
      icon: <HelpCircle size={20} />,
      pergunta: "Como funciona o suporte técnico?",
      resposta: "Não entregamos apenas software, entregamos parceria. Nosso suporte via chat e e-mail é composto por especialistas em gestão prontos para ajudar na sua organização financeira."
    }
  ];

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER - PADRONIZADO COM PÁGINA SOBRE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Perguntas Frequentes<span className="text-blue-600">.</span></span>
            <Sparkles size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium leading-relaxed mt-0">
            Esclareça suas dúvidas e entenda por que a Nucleobase é o próximo nível da sua gestão.
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
        
        {/* ACCORDION DE PERGUNTAS */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
            Dúvidas e Respostas <div className="h-px bg-gray-300 flex-1"></div>
          </h3>
          
          {perguntas.map((item, index) => (
            <div 
              key={index}
              className={`group border rounded-[2rem] transition-all duration-300 ${
                aberto === index 
                ? "border-blue-100 bg-white shadow-xl shadow-blue-900/5" 
                : "border-gray-100 bg-white hover:border-blue-100"
              }`}
            >
              <button
                onClick={() => setAberto(aberto === index ? null : index)}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left"
              >
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl transition-all duration-500 ${
                    aberto === index 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "bg-blue-50 text-blue-600"
                  }`}>
                    {item.icon}
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">
                      {item.category}
                    </span>
                    <span className="font-bold text-gray-900 text-base md:text-lg tracking-tight">
                      {item.pergunta}
                    </span>
                  </div>
                </div>
                <div className={`shrink-0 ml-4 p-2 rounded-full transition-all ${
                  aberto === index ? "bg-blue-50 text-blue-600 rotate-180" : "bg-gray-50 text-gray-400"
                }`}>
                  <ChevronDown size={20} />
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-500 ${
                aberto === index ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
              }`}>
                <div className="px-8 pb-8 pt-0 md:ml-[84px]">
                  <p className="text-gray-600 text-base leading-relaxed font-medium italic">
                    {item.resposta}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SIDEBAR DE SUPORTE */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-widest mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Suporte Online
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Dúvida rápida?</h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed font-medium italic">
                Nosso time operacional está pronto para te atender via WhatsApp agora.
              </p>
              <a 
                href={whatsappLink} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-white text-gray-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg"
              >
                Chamar no WhatsApp <ArrowRight size={14} />
              </a>
            </div>
            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full"></div>
          </div>

          <div className="bg-blue-50/40 border border-blue-100 p-8 rounded-[2.5rem]">
            <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
              <Mail size={18} className="text-blue-600" /> E-mail Oficial
            </h4>
            <p className="text-gray-500 text-sm mb-4 font-medium leading-relaxed">Para dúvidas adicionais ou sugestões:</p>
            <a href="mailto:contato@nucleobase.app" className="text-blue-600 font-bold hover:underline text-sm">contato@nucleobase.app</a>
          </div>
        </div>
      </div>

      {/* FORMULÁRIO DE CHAMADO - AJUSTADO PARA LARGURA TOTAL */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Abertura de Chamado <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="w-full mb-32">
        <form 
          ref={formRef}
          onSubmit={handleSubmit}
          action="https://api.web3forms.com/submit" 
          method="POST" 
          className="bg-white border border-gray-100 p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 relative w-full"
        >
          <input type="hidden" name="access_key" value="9ef5a274-150a-4664-a885-0b052efd06f7" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
              <input name="name" required type="text" className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="João Silva" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <input name="email" required type="email" className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="seu@email.com" />
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mensagem</label>
            <textarea name="message" required className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm min-h-[140px] resize-none" placeholder="Como podemos ajudar sua operação hoje?"></textarea>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-3 text-gray-400">
              <Clock size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Resposta em até 24h (úteis)</span>
            </div>
            <button type="submit" className="w-full md:w-auto px-12 py-5 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
              <Send size={16} /> Enviar para especialistas
            </button>
          </div>
        </form>
      </div>

      {/* FOOTER CONECTE-SE PADRONIZADO */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
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