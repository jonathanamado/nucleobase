"use client";
import React, { useState, useEffect } from "react";
import { 
  Play, 
  MonitorPlay, 
  Dna, 
  LayoutDashboard, 
  ArrowRight,
  MousePointerClick,
  FileSpreadsheet,
  LineChart,
  Clock,
  Settings2,
  LockKeyhole,
  CheckCircle2
} from "lucide-react";

export default function DemonstracaoPlataforma() {
  const [progresso, setProgresso] = useState("0%");

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgresso("65%"); 
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const passos = [
    {
      step: "01",
      title: "Configuração do DNA",
      desc: "Você define suas categorias personalizadas e limites de gastos de forma intuitiva.",
      icon: <Settings2 size={24} />,
    },
    {
      step: "02",
      title: "Lançamento Express",
      desc: "Registros feitos em segundos, sem burocracia, focado na mobilidade do dia a dia.",
      icon: <MousePointerClick size={24} />,
    },
    {
      step: "03",
      title: "Visão de Resultados",
      desc: "Gráficos automáticos que mostram para onde seu dinheiro está indo em tempo real.",
      icon: <LineChart size={24} />,
    }
  ];

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Demonstração<span className="text-blue-600">.</span></span>
            <MonitorPlay size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-0">
            Veja como a Nucleobase transforma sua gestão financeira.
          </h2>
        </div>

        <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-blue-200 flex items-center justify-center text-[10px] font-bold text-blue-600">
                U{i}
              </div>
            ))}
          </div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Acesso Beta Ativo</span>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Tour pela Interface <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* ÁREA DO VÍDEO / PLACEHOLDER */}
        <div className="lg:col-span-8">
          <div className="relative aspect-video bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white">
            {/* Overlay de "Em desenvolvimento" */}
            <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center text-center p-6 backdrop-blur-[2px]">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-blue-600/40 group-hover:scale-110 transition-transform duration-500">
                <Play size={32} fill="white" className="text-white ml-1" />
              </div>
              <h4 className="text-white text-2xl font-bold mb-2">Vídeo demonstrativo em produção</h4>
              <p className="text-blue-200 text-sm max-w-sm font-medium">
                Estamos preparando um guia completo em alta definição para você dominar cada recurso da plataforma.
              </p>
              
              <div className="mt-8 flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Disponível em breve</span>
              </div>
            </div>

            {/* Simulação de Interface ao Fundo */}
            <div className="absolute inset-0 opacity-30 grayscale pointer-events-none">
                <div className="p-8 space-y-4">
                    <div className="h-8 w-48 bg-gray-700 rounded-lg" />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-32 bg-gray-700 rounded-2xl" />
                        <div className="h-32 bg-gray-700 rounded-2xl" />
                        <div className="h-32 bg-gray-700 rounded-2xl" />
                    </div>
                    <div className="h-64 bg-gray-700 rounded-[2rem]" />
                </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
              <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-blue-600" />
                O que você vai aprender
              </h5>
              <ul className="text-sm text-blue-800/70 space-y-2 font-medium">
                <li>• Como importar dados de planilhas antigas.</li>
                <li>• Criar centros de custo inteligentes.</li>
                <li>• Analisar o gráfico de "Poder de Compra".</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                Tempo de tour
              </h5>
              <p className="text-sm text-gray-500 font-medium">
                O vídeo terá aproximadamente 4 minutos, cobrindo desde o primeiro acesso até o fechamento mensal.
              </p>
            </div>
          </div>
        </div>

        {/* SIDEBAR - PASSO A PASSO */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Metodologia</p>
                <div className="space-y-8">
                {passos.map((item, idx) => (
                    <div key={idx} className="flex gap-5 group">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 shrink-0 bg-gray-900 text-white rounded-xl flex items-center justify-center text-xs font-black group-hover:bg-blue-600 transition-colors">
                                {item.step}
                            </div>
                            {idx !== passos.length - 1 && <div className="w-0.5 h-full bg-gray-100 my-2" />}
                        </div>
                        <div className="pb-2">
                            <h4 className="font-bold text-gray-900 text-base mb-1">{item.title}</h4>
                            <p className="text-[13px] text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                    </div>
                ))}
                </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-600/20">
            <Dna size={40} className="mb-4 opacity-50" />
            <h4 className="text-xl font-bold mb-2 leading-tight">Pronto para testar na prática?</h4>
            <p className="text-blue-100 text-xs leading-relaxed mb-6 font-medium">
              A melhor forma de entender é lançando seu primeiro movimento.
            </p>
            <a href="/cadastro" className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
              Criar minha conta <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* SEÇÃO "EM BREVE" */}
      <div className="mt-24">
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
          Próximos Guias <div className="h-px bg-gray-300 flex-1"></div>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { title: "Gestão de Ativos", desc: "Como monitorar investimentos." },
                { title: "Metas e Sonhos", desc: "Planejando grandes aquisições." },
                { title: "Segurança de Dados", desc: "Nossos protocolos de proteção." }
            ].map((card, i) => (
                <div key={i} className="group p-8 bg-white border border-gray-100 rounded-[2rem] hover:border-blue-200 transition-all opacity-60">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-400 group-hover:text-blue-600 transition-colors">
                        <LockKeyhole size={20} />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{card.title}</h4>
                    <p className="text-[12px] text-gray-500 font-medium">{card.desc}</p>
                </div>
            ))}
        </div>
      </div>

      {/* CTA FINAL */}
      <div className="mt-20 bg-gray-900 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Inicie sua evolução digital hoje.</h2>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a href="/cadastro" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all">
              Começar agora gratuitamente
            </a>
            <a href="/sobre" className="bg-white/5 text-white border border-white/10 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all">
              Conhecer nossa história
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}