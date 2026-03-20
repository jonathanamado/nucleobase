"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { 
  Handshake, 
  Target, 
  Globe, 
  BarChart, 
  Rocket, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Zap,
  Instagram,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function ParceirosPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [cardAtivo, setCardAtivo] = useState(0);

  // Lógica para limpar o formulário ao carregar/voltar para a página
  useEffect(() => {
    if (formRef.current) {
      formRef.current.reset();
    }
  }, []);

  const frentes = [
    {
      title: "Afiliados Digitais",
      desc: "Divulgue a plataforma em seus canais e receba comissões recorrentes por cada nova assinatura convertida.",
      icon: <Target size={24} />,
      badge: "Performance",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      link: "/indique"
    },
    {
      title: "Consultores & Contadores",
      desc: "Ofereça a Nucleobase como a ferramenta oficial para seus clientes e tenha um dashboard de controle centralizado.",
      icon: <BarChart size={24} />,
      badge: "Em desenvolvimento",
      color: "text-gray-400",
      bg: "bg-gray-50",
      disabled: true
    },
    {
      title: "Integração & Tech",
      desc: "Conecte seu software à nossa API e crie uma solução financeira embarcada para seus próprios usuários.",
      icon: <Globe size={24} />,
      badge: "Em desenvolvimento",
      color: "text-gray-400",
      bg: "bg-gray-50",
      disabled: true
    }
  ];

  const proximoCard = () => {
    if (cardAtivo < frentes.length - 1) setCardAtivo(cardAtivo + 1);
  };

  const anteriorCard = () => {
    if (cardAtivo > 0) setCardAtivo(cardAtivo - 1);
  };

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* BADGE SUPERIOR */}
      <div className="inline-flex items-center gap-2 text-blue-600 mb-4">
        <Zap size={18} className="fill-blue-600" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Partnership Program 2026</span>
      </div>

      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div className="flex-1">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Cresça com a <span className="text-blue-600">Nucleo.</span></span>
            <Handshake 
              size={32} 
              className="text-blue-600 opacity-35 ml-3" 
              strokeWidth={2} 
            />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium leading-relaxed mt-0 w-full">
            Inteligência em controle financeiro para agregar valor à sua rotina.
          </h2>
        </div>

        {/* MÉTRICAS RÁPIDAS - CENTRALIZADAS NO MOBILE */}
        <div className="flex gap-3 mt-4 md:mt-0 justify-center md:justify-end">
          <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center min-w-[100px]">
            <h4 className="text-xl font-black text-gray-900 leading-tight">20%</h4>
            <p className="text-[7px] text-gray-400 font-black uppercase tracking-widest">Comissão</p>
          </div>
          <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center min-w-[100px]">
            <h4 className="text-xl font-black text-gray-900 leading-tight">24h</h4>
            <p className="text-[7px] text-gray-400 font-black uppercase tracking-widest">Setup</p>
          </div>
        </div>
      </div>

      {/* MODELOS DE COLABORAÇÃO - CARROSSEL NO MOBILE */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Modelos de Colaboração <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="relative flex items-center justify-center mb-24">
        {/* SETAS MOBILE */}
        {cardAtivo > 0 && (
          <button onClick={anteriorCard} className="md:hidden absolute left-0 z-20 bg-white shadow-lg border border-gray-100 text-blue-600 p-2 rounded-full active:scale-90 transition-all">
            <ChevronLeft size={24} />
          </button>
        )}

        <div className="w-full md:grid md:grid-cols-3 gap-8 flex items-stretch justify-center">
          {frentes.map((frente, idx) => (
            <div key={idx} className={`h-auto md:h-full flex-1 ${cardAtivo === idx ? 'flex animate-in fade-in zoom-in-95 duration-300' : 'hidden'} md:flex md:animate-none`}>
              {frente.link ? (
                <Link href={frente.link} className="block w-full group bg-white p-10 rounded-[3rem] border border-gray-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 relative overflow-hidden">
                  <div className={`mb-8 w-16 h-16 ${frente.bg} ${frente.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                    {frente.icon}
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 block">
                    {frente.badge}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight flex items-center gap-2">
                    {frente.title} <ArrowRight size={20} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                  </h3>
                  <p className="text-gray-500 text-base leading-relaxed mb-0 font-medium italic">
                    {frente.desc}
                  </p>
                </Link>
              ) : (
                <div className="w-full bg-white p-10 rounded-[3rem] border border-gray-100 opacity-80 relative overflow-hidden flex flex-col">
                  <div className={`mb-8 w-16 h-16 ${frente.bg} ${frente.color} rounded-2xl flex items-center justify-center shadow-sm grayscale`}>
                    {frente.icon}
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">
                    {frente.badge}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-400 mb-4 tracking-tight">{frente.title}</h3>
                  <p className="text-gray-400 text-base leading-relaxed mb-0 font-medium italic">
                    {frente.desc}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {cardAtivo < frentes.length - 1 && (
          <button onClick={proximoCard} className="md:hidden absolute right-0 z-20 bg-white shadow-lg border border-gray-100 text-blue-600 p-2 rounded-full active:scale-90 transition-all">
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* SEÇÃO CTA E FORMULÁRIO - DESMEMBRADOS NO MOBILE */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-stretch">
        
        {/* CARD CTA REDUZIDO NO MOBILE */}
        <div className="bg-gray-900 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 flex-1 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 blur-[120px] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-blue-600/20">
              <Sparkles size={24} className="md:size-[30px]" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 md:mb-8 tracking-tight leading-tight">Pronto para dar o<br/>próximo passo?</h2>
            <ul className="space-y-4 md:space-y-6 mb-8 md:mb-12">
              {[
                "Suporte dedicado de Key Account",
                "Material de marketing (White-label)",
                "Acesso antecipado a novas features"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 md:gap-4 text-gray-300 text-base md:text-lg font-medium">
                  <CheckCircle size={18} className="text-blue-500 flex-shrink-0 md:size-[22px]" /> {item}
                </li>
              ))}
            </ul>
            <div className="p-6 md:p-8 bg-white/5 rounded-2xl md:rounded-[2rem] border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-3">Visão Nucleo</p>
              <p className="text-gray-300 italic text-base md:text-lg leading-relaxed font-light">
                "Buscamos parceiros que buscam transformar a cultura financeira das pessoas."
              </p>
            </div>
          </div>
        </div>

        {/* FORMULÁRIO FORA DO CARD NO MOBILE */}
        <form 
          ref={formRef}
          action="https://api.web3forms.com/submit" 
          method="POST"
          className="flex-1 w-full bg-white p-8 md:p-14 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative z-10 border border-gray-100"
        >
          <input type="hidden" name="access_key" value="9ef5a274-150a-4664-a885-0b052efd06f7" />
          <input type="hidden" name="subject" value="Nova Candidatura de Parceiro - Nucleobase" />
          <input type="hidden" name="from_name" value="Nucleobase Parcerias" />
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome/Empresa</label>
                <input name="parceiro_nome" required type="text" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 text-sm transition-all font-medium" placeholder="Ex: Consultoria XYZ" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                <input name="parceiro_email" required type="email" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 text-sm transition-all font-medium" placeholder="parcerias@empresa.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Modelo de Parceria</label>
              <select name="modelo_parceria" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 text-sm transition-all font-medium appearance-none">
                <option>Consultoria Estratégica</option>
                <option>Afiliado / Indicação</option>
                <option>Integração de Software (API)</option>
                <option>Outro modelo</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sua Operação</label>
              <textarea name="parceiro_motivacao" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 text-sm transition-all h-32 resize-none font-medium" placeholder="Conte-nos brevemente como você pretende atuar..."></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-blue-100 text-[11px] uppercase tracking-[0.2em]">
              <Rocket size={18} /> Enviar Proposta de Parceria
            </button>
          </div>
        </form>
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

      <p className="text-center mt-12 text-gray-400 text-[10px] font-medium italic uppercase tracking-widest">
        Nucleobase Partnership Program — Transformando dados em alianças estratégicas.
      </p>
    </div>
  );
}