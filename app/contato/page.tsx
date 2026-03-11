"use client";
import React, { useRef } from "react";
import { Mail, Instagram, Send, MessageCircle, MessageSquare, ArrowUpRight, Clock } from "lucide-react";

export default function ContatoPage() {
  const whatsappLink = "https://wa.link/qbxg9f";
  const formRef = useRef<HTMLFormElement>(null);

  // Função para limpar o formulário antes do redirecionamento do Web3Forms
  const handleSubmit = () => {
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.reset();
      }
    }, 100);
  };

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER - PADRONIZADO COM PÁGINA SOBRE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Conte com a gente<span className="text-blue-600">.</span></span>
            <MessageSquare size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium leading-relaxed mt-0">
            Dúvidas, sugestões ou feedbacks? Queremos te ouvir na nucleobase.app.
          </h2>
        </div>
      </div>

      {/* LINHA DIVISÓRIA DE SEÇÃO */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Canais de Conexão <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* CONTAINER PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* COLUNA DE LINKS RÁPIDOS */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          {[
            {
              href: "https://www.instagram.com/nucleobase.app/",
              icon: <Instagram size={24} />,
              color: "pink",
              title: "Instagram",
              desc: "Novidades e Direct",
              label: "@nucleobase.app"
            },
            {
              href: whatsappLink,
              icon: <MessageCircle size={24} />,
              color: "emerald",
              title: "WhatsApp",
              desc: "Atendimento ágil",
              label: "Chamar no Whats"
            },
            {
              href: "mailto:contato@nucleobase.app",
              icon: <Mail size={24} />,
              color: "blue",
              title: "E-mail",
              desc: "Respostas em até 24h",
              label: "contato@nucleobase.app"
            }
          ].map((link, idx) => (
            <a 
              key={idx}
              href={link.href}
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-xl hover:border-blue-100 transition-all group relative overflow-hidden flex-1"
            >
              <div className={`bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500`}>
                {link.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider">{link.title}</h3>
                <p className="text-[11px] text-gray-500 font-medium mb-1">{link.desc}</p>
                <span className={`text-blue-600 text-xs font-bold flex items-center gap-1`}>
                  {link.label} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* COLUNA DO FORMULÁRIO */}
        <div className="lg:col-span-8 flex flex-col">
          <form 
            ref={formRef}
            onSubmit={handleSubmit}
            action="https://api.web3forms.com/submit" 
            method="POST"
            className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-100 flex flex-col gap-6 h-full"
          >            
            <input type="hidden" name="access_key" value="9ef5a274-150a-4664-a885-0b052efd06f7" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seu Nome</label>
                <input name="name" required type="text" className="px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 transition-all placeholder:text-gray-300" placeholder="Como te chamamos?" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seu E-mail</label>
                <input name="email" required type="email" className="px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 transition-all placeholder:text-gray-300" placeholder="exemplo@email.com" />
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-grow">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sua Mensagem</label>
              <textarea name="message" required className="flex-grow px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 resize-none min-h-[180px] transition-all placeholder:text-gray-300" placeholder="No que podemos ajudar hoje?"></textarea>
            </div>

            <button type="submit" className="bg-gray-900 text-white py-5 rounded-[1.5rem] font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-200 text-[11px] uppercase tracking-[0.2em] group shrink-0">
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
              Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
      
      {/* RODAPÉ DO FORMULÁRIO */}
      <p className="text-center mt-8 text-gray-400 text-xs font-medium italic">
        Prometemos não enviar spam. Seus dados estão seguros sob nossa política de privacidade.
      </p>

      {/* NOVA LINHA DIVISÓRIA "CONECTE-SE" CENTRALIZADA */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM CENTRALIZADO PADRÃO NUCLEOBASE */}
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