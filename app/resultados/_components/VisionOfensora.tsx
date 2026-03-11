"use client";

import React from "react";
import { Microscope, AlertTriangle, ArrowRight } from "lucide-react";

interface Props {
  data: any[];
  onViewHistory?: (category: string) => void;
}

export default function VisionOfensora({ data, onViewHistory }: Props) {
  // 1. Filtrar apenas despesas
  const despesas = data.filter((item) => Number(item.valor) < 0);

  // 2. Agrupar por Categoria
  const categoriasMap: { [key: string]: number } = {};
  despesas.forEach((item) => {
    const cat = item.categoria || "Outros";
    categoriasMap[cat] = (categoriasMap[cat] || 0) + Math.abs(Number(item.valor));
  });

  const categoriaOfensora = Object.entries(categoriasMap).sort((a, b) => b[1] - a[1])[0];

  if (!categoriaOfensora) return null;

  const [nomeOfensora, valorTotalOfensora] = categoriaOfensora;

  // 3. Drill-down de Subcategorias
  const subcategoriasMap: { [key: string]: number } = {};
  despesas
    .filter((item) => (item.categoria || "Outros") === nomeOfensora)
    .forEach((item) => {
      const sub = item.subcategoria || item.descricao || "Não identificado";
      subcategoriasMap[sub] = (subcategoriasMap[sub] || 0) + Math.abs(Number(item.valor));
    });

  const subcategoriasOrdenadas = Object.entries(subcategoriasMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <section className="w-full bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Microscope size={20} />
            </div>
            <h3 className="font-bold text-gray-800 uppercase text-[10px] tracking-[0.2em]">
              Análise de Detalhe (Drill-down)
            </h3>
          </div>
          <p className="text-gray-500 text-sm font-medium text-left leading-relaxed">
            Identificamos que <span className="text-red-600 font-bold underline decoration-red-100 underline-offset-4">{nomeOfensora}</span> é o seu maior gargalo atual.
          </p>
        </div>

        <div className="bg-gray-50/50 px-8 py-5 rounded-[2rem] border border-gray-100/50 backdrop-blur-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-left">Total da Categoria</p>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            R$ {valorTotalOfensora.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
        {/* Lado Esquerdo: Lista de Sub-itens */}
        <div className="space-y-7">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <AlertTriangle size={14} className="text-orange-500" /> Principais vilões em {nomeOfensora}
          </p>
          <div className="space-y-6">
            {subcategoriasOrdenadas.map(([nome, valor], idx) => {
              const percentual = (valor / valorTotalOfensora) * 100;
              return (
                <div key={idx} className="group cursor-default">
                  <div className="flex justify-between items-end mb-2.5">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
                      {nome}
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-black text-gray-900 block tracking-tight">
                        R$ {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">{percentual.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gray-900 h-full rounded-full transition-all duration-[1.5s] ease-out group-hover:bg-blue-600 group-hover:shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                      style={{ width: `${percentual}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lado Direito: Insight Visual */}
        <div className="bg-[#111827] rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-gray-200">
          <div className="relative z-10 text-left">
            <div className="mb-6 inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Sugestão Nucleobase</span>
            </div>
            
            <h4 className="text-2xl font-bold mb-5 leading-tight tracking-tight">
              Oportunidade de <br/> <span className="text-blue-400">Otimização</span>
            </h4>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                O item <span className="font-bold text-white italic">"{subcategoriasOrdenadas[0]?.[0]}"</span> representa a maior fatia desta categoria. 
                Reduzir apenas este ponto em 10% traria uma economia mensal de 
                <span className="font-black text-blue-400"> R$ {(subcategoriasOrdenadas[0]?.[1] * 0.1).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>.
            </p>

            <button 
              onClick={() => onViewHistory && onViewHistory(nomeOfensora)}
              className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.15em] bg-white text-gray-900 hover:bg-blue-500 hover:text-white py-4 px-8 rounded-2xl transition-all duration-300 w-full md:w-auto justify-center active:scale-95"
            >
                Ver histórico <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          {/* Elementos Decorativos de Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/5 rounded-full blur-[50px] -ml-16 -mb-16"></div>
        </div>
      </div>
    </section>
  );
}