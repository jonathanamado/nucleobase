"use client";

import React, { useMemo, useState } from "react";
import { 
  CalendarDays, TrendingDown, TrendingUp, X, Info, 
  ArrowUpRight, ArrowDownRight, Scale 
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface Props {
  data: any[];
  filterCategory?: string | null;
  onClearFilter?: () => void;
}

export default function VisionYoY({ data, filterCategory, onClearFilter }: Props) {
  const [naturezaFiltro, setNaturezaFiltro] = useState<'Receita' | 'Despesa' | 'Saldo'>('Despesa');
  
  const hoje = new Date();
  const anoAtual = hoje.getUTCFullYear();
  const anoAnterior = anoAtual - 1;
  const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  const mesesMapPT: Record<string, number> = {
    "janeiro": 0, "fevereiro": 1, "março": 2, "abril": 3, "maio": 4, "junho": 5,
    "julho": 6, "agosto": 7, "setembro": 8, "outubro": 9, "novembro": 10, "dezembro": 11
  };

  const { dadosYoY, variacaoPercentual } = useMemo(() => {
    const mapa = nomesMeses.map(mes => ({
      name: mes,
      atual: 0,
      anterior: 0
    }));

    data.forEach(item => {
      // Se filtro for Receita ou Despesa, ignora o que não for compatível. 
      // Se for Saldo, processa ambos para calcular a diferença.
      if (naturezaFiltro !== 'Saldo' && item.natureza !== naturezaFiltro) return;
      
      const valorOriginal = Number(item.valor);
      const valorAbsoluto = Math.abs(valorOriginal);
      const pertenceACategoria = !filterCategory || item.categoria === filterCategory;
      if (!pertenceACategoria) return;

      let mesIndex = -1;
      let anoItem = -1;

      if (item.natureza === "Despesa" && item.fatura_mes) {
        if (item.fatura_mes.includes('-')) {
          const parts = item.fatura_mes.split('-');
          anoItem = parseInt(parts[0]);
          mesIndex = parseInt(parts[1]) - 1;
        } else if (item.fatura_mes.includes('/')) {
          const parts = item.fatura_mes.split('/');
          anoItem = parseInt(parts[1]);
          mesIndex = mesesMapPT[parts[0].toLowerCase().trim()];
        }
      } else {
        const dataStr = item.data_competencia || "";
        const dataComp = new Date(dataStr.includes('T') ? dataStr : `${dataStr}T00:00:00`);
        anoItem = dataComp.getUTCFullYear();
        mesIndex = dataComp.getUTCMonth();
      }

      if (mesIndex >= 0 && mesIndex <= 11) {
        // Lógica de Acúmulo: Se for Saldo, Receita soma e Despesa subtrai. 
        // Se for filtro específico, usamos o valor absoluto (Math.abs).
        const valorParaSomar = naturezaFiltro === 'Saldo' ? valorOriginal : valorAbsoluto;

        if (anoItem === anoAtual) {
          mapa[mesIndex].atual += valorParaSomar;
        } else if (anoItem === anoAnterior) {
          mapa[mesIndex].anterior += valorParaSomar;
        }
      }
    });

    const totalAnoAnterior = mapa.reduce((acc, curr) => acc + curr.anterior, 0);
    const totalAnoAtual = mapa.reduce((acc, curr) => acc + curr.atual, 0);

    let varPerc = 0;
    if (Math.abs(totalAnoAnterior) > 0) {
      varPerc = ((totalAnoAtual - totalAnoAnterior) / Math.abs(totalAnoAnterior)) * 100;
    } else if (totalAnoAnterior === 0 && totalAnoAtual !== 0) {
      varPerc = 100;
    }

    return { dadosYoY: mapa, variacaoPercentual: varPerc };
  }, [data, filterCategory, naturezaFiltro, anoAtual, anoAnterior]);

  return (
    <section id="grafico-yoy" className="w-full bg-white border border-gray-100 rounded-[3rem] p-6 md:p-12 shadow-sm mt-8 scroll-mt-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
        <div className="space-y-4 w-full lg:w-auto">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <CalendarDays size={22} />
            </div>
            <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-[0.3em]">
              Sazonalidade Comparativa
            </h3>
          </div>
          
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Performance <span className="text-blue-600">YoY.</span>
            </h2>

            <div className="flex bg-gray-50 p-1.5 rounded-2xl w-full sm:w-fit mx-auto sm:mx-0 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setNaturezaFiltro('Despesa')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${naturezaFiltro === 'Despesa' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
              >
                <ArrowDownRight size={12} /> Despesas
              </button>
              <button 
                onClick={() => setNaturezaFiltro('Receita')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${naturezaFiltro === 'Receita' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
              >
                <ArrowUpRight size={12} /> Receitas
              </button>
              <button 
                onClick={() => setNaturezaFiltro('Saldo')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${naturezaFiltro === 'Saldo' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
              >
                <Scale size={12} /> Saldo
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-gray-500 text-sm font-medium">
                {naturezaFiltro === 'Despesa' ? 'Ciclo de faturas:' : 'Ciclo de competência:'} <span className="font-bold text-gray-900">{anoAtual}</span> vs <span className="text-gray-400">{anoAnterior}</span>
              </p>
              {filterCategory && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-100 animate-in zoom-in duration-300">
                  <span className="text-[9px] font-black uppercase tracking-widest">Filtro: {filterCategory}</span>
                  <button onClick={onClearFilter} className="hover:bg-blue-700 rounded-full p-0.5 transition-colors">
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`flex flex-col items-center justify-center px-10 py-6 rounded-[2.5rem] border transition-all duration-500 min-w-[220px] w-full lg:w-auto ${
          (naturezaFiltro === 'Despesa' && variacaoPercentual > 0) || (naturezaFiltro !== 'Despesa' && variacaoPercentual < 0)
            ? 'bg-red-50/50 border-red-100 text-red-600' 
            : 'bg-emerald-50/50 border-emerald-100 text-emerald-600'
        }`}>
          <div className="flex items-center gap-2 mb-1">
             {variacaoPercentual > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
             <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Variação Anual</p>
          </div>
          <p className="text-2xl font-semibold tracking-tighter">
            {variacaoPercentual > 0 ? '+' : ''}{variacaoPercentual.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="h-[350px] md:h-[400px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosYoY} margin={{ left: -10, right: 10, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} 
              dy={15} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fontWeight: 500, fill: '#94A3B8'}} 
              tickFormatter={(v) => `R$${v >= 1000 ? v/1000 + 'k' : v}`} 
            />
            <Tooltip 
              cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }}
              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }}
              formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`]}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              wrapperStyle={{ paddingBottom: '30px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} 
            />
            
            <Line 
              name={`Ciclo Atual (${anoAtual})`}
              type="monotone" 
              dataKey="atual" 
              stroke="#2563eb" 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
              animationDuration={2000}
            />
            <Line 
              name={`Referência (${anoAnterior})`}
              type="monotone" 
              dataKey="anterior" 
              stroke="#CBD5E1" 
              strokeWidth={2} 
              strokeDasharray="8 8"
              dot={false}
              activeDot={{ r: 4, fill: '#94A3B8' }}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-12 p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600 shrink-0">
          <Info size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Análise de Inteligência</h4>
          <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-medium">
            {naturezaFiltro === 'Despesa' 
              ? "A linha tracejada estabelece o benchmark do seu consumo anterior. Manter a curva atual abaixo desta referência é o caminho para a liberdade financeira."
              : naturezaFiltro === 'Receita' 
              ? "Compare a evolução das suas receitas. O objetivo é manter a linha azul consistentemente acima da referência tracejada para garantir crescimento de patrimônio."
              : "Acompanhe o seu fôlego financeiro. O saldo positivo acumulado é o que define sua capacidade de investimento e segurança a longo prazo."}
          </p>
        </div>
      </div>
    </section>
  );
}