// app/seja-parceiro/page.tsx
"use client";
import React from "react";
import { Handshake, Target, Globe, BarChart, Rocket, CheckCircle, ArrowRight, Send } from "lucide-react";

export default function ParceirosPage() {
  const frentes = [
    {
      title: "Consultores & Contadores",
      desc: "Ofereça a Nucleobase como a ferramenta oficial para seus clientes e tenha um dashboard de controle centralizado.",
      icon: <BarChart className="text-blue-600" size={24} />,
      badge: "Estratégico"
    },
    {
      title: "Afiliados Digitais",
      desc: "Divulgue a plataforma em seus canais e receba comissões recorrentes por cada nova assinatura convertida.",
      icon: <Target className="text-emerald-600" size={24} />,
      badge: "Performance"
    },
    {
      title: "Integração & Tech",
      desc: "Conecte seu software à nossa API e crie uma solução financeira embarcada para seus próprios usuários.",
      icon: <Globe className="text-purple-600" size={24} />,
      badge: "API First"
    }
  ];

  return (
    <div className="w-full max-w-6xl animate-in fade-in duration-700 pb-20">
      {/* HERO SECTION */}
      <div className="mb-16 mt-2 flex flex-col lg:flex-row lg:items-center gap-10">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full mb-6">
            <Handshake size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Partnership Program 2026</span>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
            Cresça junto com a <br/>
            <span className="text-blue-600">Nucleobase.</span>
          </h1>
          <p className="text-gray-500 text-xl leading-relaxed max-w-xl">
            Unimos inteligência financeira com quem entende de mercado. Ressignifique suas fontes de receita e agregue valor à processos.
          </p>
        </div>
        <div className="hidden lg:block w-px h-40 bg-gray-100"></div>
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
            <h4 className="text-3xl font-bold text-gray-900 mb-1">20%</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Comissão Recorrente</p>
          </div>
          <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
            <h4 className="text-3xl font-bold text-gray-900 mb-1">24h</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Setup de Parceiro</p>
          </div>
        </div>
      </div>

      {/* FRENTES DE PARCERIA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {frentes.map((frente, idx) => (
          <div key={idx} className="group bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 relative overflow-hidden">
            <div className="mb-8 w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
              {frente.icon}
            </div>
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3 block">
              {frente.badge}
            </span>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{frente.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-0">
              {frente.desc}
            </p>
          </div>
        ))}
      </div>

      {/* SEÇÃO DO FORMULÁRIO DE APLICAÇÃO */}
      <div className="bg-gray-900 rounded-[3rem] p-8 lg:p-16 flex flex-col lg:flex-row gap-16 items-center">
        <div className="flex-1 text-white">
          <h2 className="text-4xl font-bold mb-6 tracking-tight">Pronto para dar o <br/>próximo passo?</h2>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-gray-400 text-sm">
              <CheckCircle size={18} className="text-blue-500" /> Suporte dedicado de Key Account
            </li>
            <li className="flex items-center gap-3 text-gray-400 text-sm">
              <CheckCircle size={18} className="text-blue-500" /> Material de marketing (White-label disponível)
            </li>
            <li className="flex items-center gap-3 text-gray-400 text-sm">
              <CheckCircle size={18} className="text-blue-500" /> Acesso antecipado a novas features
            </li>
          </ul>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">Visão Nucleo</p>
            <p className="text-gray-400 italic text-sm italic leading-relaxed">
              "Buscamos parceiros que não querem apenas vender uma plataforma ou dashboards de resultados, mas sim parceiros que buscam transformar a cultura financeira das pessoas."
            </p>
          </div>
        </div>

        <form 
          action="https://api.web3forms.com/submit" 
          method="POST"
          className="flex-1 w-full bg-white p-10 rounded-[2.5rem] shadow-2xl"
        >
          <input type="hidden" name="access_key" value="9ef5a274-150a-4664-a885-0b052efd06f7" />
          <input type="hidden" name="subject" value="Nova Candidatura de Parceiro - Nucleobase" />
          
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome/Empresa</label>
                <input name="parceiro_nome" required type="text" className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm transition-all" placeholder="Ex: Consultoria XYZ" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                <input name="parceiro_email" required type="email" className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm transition-all" placeholder="parcerias@empresa.com" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Modelo de Parceria</label>
              <select name="modelo_parceria" className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm transition-all">
                <option>Consultoria Estratégica</option>
                <option>Afiliado / Indicação</option>
                <option>Integração de Software (API)</option>
                <option>Outro modelo</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Por que quer ser parceiro?</label>
              <textarea name="parceiro_motivacao" required className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm transition-all h-24 resize-none" placeholder="Conte-nos brevemente sobre sua operação..."></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg text-[10px] uppercase tracking-[0.2em]">
              <Rocket size={16} /> Enviar Proposta de Parceria
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}