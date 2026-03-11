"use client";

import React from "react";
import { CalendarDays, TrendingDown, TrendingUp, Minus, X } from "lucide-react";
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
  const hoje = new Date();
  const anoAtual = hoje.getUTCFullYear();
  const anoAnterior = anoAtual - 1;
  const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  // 1. Processar dados para agrupar por Ano e Mês (com filtro opcional)
  const processarDadosYoY = () => {
    const mapa = nomesMeses.map(mes => ({
      name: mes,
      atual: 0,
      anterior: 0
    }));

    data.forEach(item => {
      const valor = Math.abs(Number(item.valor));
      const isDespesa = Number(item.valor) < 0;
      
      // Lógica de filtro: se houver categoria selecionada, ignora o resto
      const pertenceACategoria = !filterCategory || item.categoria === filterCategory;

      if (isDespesa && pertenceACategoria) {
        const dataItem = new Date(item.data_competencia.includes('T') ? item.data_competencia : `${item.data_competencia}T00:00:00`);
        const anoItem = dataItem.getUTCFullYear();
        const mesIndex = dataItem.getUTCMonth();

        if (anoItem === anoAtual) {
          mapa[mesIndex].atual += valor;
        } else if (anoItem === anoAnterior) {
          mapa[mesIndex].anterior += valor;
        }
      }
    });

    return mapa;
  };

  const dadosYoY = processarDadosYoY();
  
  // 2. Cálculos de Performance
  const totalAtual = dadosYoY.reduce((acc, curr) => acc + curr.atual, 0);
  const totalAnterior = dadosYoY.reduce((acc, curr) => acc + curr.anterior, 0);
  const variacaoPercentual = totalAnterior > 0 ? ((totalAtual - totalAnterior) / totalAnterior) * 100 : 0;

  return (
    <section id="grafico-yoy" className="w-full bg-white border border-gray-100 rounded-[3rem] p-6 md:p-10 shadow-sm mt-8 scroll-mt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <CalendarDays size={20} />
            </div>
            <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest">
              Comparativo Year over Year
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-gray-500 text-sm font-medium">
              Despesas: <span className="font-bold text-gray-900">{anoAtual}</span> vs <span className="text-gray-400">{anoAnterior}</span>
            </p>
            {filterCategory && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full animate-in zoom-in duration-300">
                <span className="text-[10px] font-black uppercase tracking-tighter">Histórico: {filterCategory}</span>
                <button 
                  onClick={onClearFilter}
                  className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-colors duration-500 ${variacaoPercentual > 0 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
          {variacaoPercentual > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Variação no Período</p>
            <p className="text-lg font-bold">{variacaoPercentual > 0 ? '+' : ''}{variacaoPercentual.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosYoY} margin={{ left: -20, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 11, fontWeight: 700, fill: '#94A3B8'}} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 11, fill: '#94A3B8'}} 
              tickFormatter={(v) => `R$${v >= 1000 ? v/1000 + 'k' : v}`} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', zIndex: 50 }}
              formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, '']}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
            
            <Line 
              name={`Ano Atual (${anoAtual})`}
              type="monotone" 
              dataKey="atual" 
              stroke="#2563eb" 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
            <Line 
              name={`Ano Anterior (${anoAnterior})`}
              type="monotone" 
              dataKey="anterior" 
              stroke="#E2E8F0" 
              strokeWidth={3} 
              strokeDasharray="5 5"
              dot={false}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-start gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600 shrink-0">
          <Minus size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-1 text-left">Interpretando a dinâmica</h4>
          <p className="text-xs text-gray-500 leading-relaxed text-left">
            {filterCategory 
              ? `Você está analisando especificamente o comportamento de "${filterCategory}". Observe se os picos de gasto coincidem com os mesmos meses do ano passado.`
              : "A linha tracejada representa sua média de gastos do ano passado. Use-a como teto para manter seu custo de vida estável ou em declínio."}
          </p>
        </div>
      </div>
    </section>
  );
}