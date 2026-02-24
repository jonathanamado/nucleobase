"use client";
import React from "react";
import { 
  Handshake, 
  Target, 
  Globe, 
  BarChart, 
  Rocket, 
  CheckCircle, 
  ArrowRight, 
  Send,
  Sparkles,
  Zap
} from "lucide-react";

export default function ParceirosPage() {
  const frentes = [
    {
      title: "Consultores & Contadores",
      desc: "Ofereça a Nucleobase como a ferramenta oficial para seus clientes e tenha um dashboard de controle centralizado.",
      icon: <BarChart size={24} />,
      badge: "Estratégico",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Afiliados Digitais",
      desc: "Divulgue a plataforma em seus canais e receba comissões recorrentes por cada nova assinatura convertida.",
      icon: <Target size={24} />,
      badge: "Performance",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Integração & Tech",
      desc: "Conecte seu software à nossa API e crie uma solução financeira embarcada para seus próprios usuários.",
      icon: <Globe size={24} />,
      badge: "API First",
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* BADGE SUPERIOR - FORA DO ALINHAMENTO DOS CARDS */}
      <div className="inline-flex items-center gap-2 text-blue-600 mb-4">
        <Zap size={18} className="fill-blue-600" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Partnership Program 2026</span>
      </div>

      {/* HEADER PRINCIPAL - ALINHAMENTO MILIMÉTRICO */}
      <div className="flex flex-col md:flex-row md:items-stretch justify-between gap-8 mb-16 mt-0">
        
        {/* BLOCO DE TEXTO */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center flex-nowrap whitespace-nowrap">
            <span>Cresça com a <span className="text-blue-600">Núcleo.</span></span>
            <Handshake 
              size={64}
              className="text-blue-600 opacity-20 ml-6 -rotate-12" 
              strokeWidth={1.2} 
            />
          </h1>
          <p className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed mt-6">
            Unimos inteligência financeira com quem entende de mercado. Ressignifique suas fontes de receita e agregue valor real aos seus processos.
          </p>
        </div>

        {/* MÉTRICAS - AGORA ALINHADAS AO H1 */}
        <div className="grid grid-cols-1 gap-4 w-full md:w-64">
          <div className="px-8 py-4 bg-white border border-gray-100 rounded-[2.2rem] shadow-sm group hover:border-blue-200 transition-all flex flex-col items-center justify-center text-center">
            <h4 className="text-3xl font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">20%</h4>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-tight">Comissão<br/>Recorrente</p>
          </div>
          <div className="px-8 py-4 bg-white border border-gray-100 rounded-[2.2rem] shadow-sm group hover:border-blue-200 transition-all flex flex-col items-center justify-center text-center">
            <h4 className="text-3xl font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">24h</h4>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-tight">Setup de<br/>Parceiro</p>
          </div>
        </div>
      </div>

      {/* RESTANTE DA PÁGINA (SEM ALTERAÇÕES) */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Modelos de Colaboração <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {frentes.map((frente, idx) => (
          <div key={idx} className="group bg-white p-10 rounded-[3rem] border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 relative overflow-hidden">
            <div className={`mb-8 w-16 h-16 ${frente.bg} ${frente.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
              {frente.icon}
            </div>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 block">
              {frente.badge}
            </span>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{frente.title}</h3>
            <p className="text-gray-500 text-base leading-relaxed mb-0 font-medium italic">
              {frente.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-[3.5rem] p-10 lg:p-16 flex flex-col lg:flex-row gap-16 items-center shadow-2xl shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 blur-[120px] pointer-events-none"></div>
        <div className="flex-1 text-white relative z-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-600/20">
            <Sparkles size={30} />
          </div>
          <h2 className="text-5xl font-bold mb-8 tracking-tight leading-tight">Pronto para dar o<br/>próximo passo?</h2>
          <ul className="space-y-6 mb-12">
            {[
              "Suporte dedicado de Key Account",
              "Material de marketing (White-label disponível)",
              "Acesso antecipado a novas features"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-gray-300 text-lg font-medium">
                <CheckCircle size={22} className="text-blue-500 flex-shrink-0" /> {item}
              </li>
            ))}
          </ul>
          <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-3">Visão Nucleo</p>
            <p className="text-gray-300 italic text-lg leading-relaxed font-light">
              "Buscamos parceiros que buscam transformar a cultura financeira das pessoas, unindo tecnologia à consultoria de alto impacto."
            </p>
          </div>
        </div>

        <form 
          action="https://api.web3forms.com/submit" 
          method="POST"
          className="flex-1 w-full bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl relative z-10 border border-gray-100"
        >
          <input type="hidden" name="access_key" value="9ef5a274-150a-4664-a885-0b052efd06f7" />
          <input type="hidden" name="subject" value="Nova Candidatura de Parceiro - Nucleobase" />
          
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
              <textarea name="parceiro_motivacao" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 text-sm transition-all h-32 resize-none font-medium" placeholder="Conte-nos brevemente como você pretende atuar com a Nucleobase..."></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-blue-100 text-[11px] uppercase tracking-[0.2em]">
              <Rocket size={18} /> Enviar Proposta de Parceria
            </button>
          </div>
        </form>
      </div>

      <p className="text-center mt-12 text-gray-400 text-xs font-medium italic">
        Nucleobase Partnership Program — Transformando dados em alianças estratégicas.
      </p>
    </div>
  );
}