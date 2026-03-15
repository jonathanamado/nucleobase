"use client";

import React, { useMemo } from "react";
import { Microscope, AlertTriangle, ArrowRight, Target } from "lucide-react";

interface Props {
  data: any[];
  onViewHistory?: (category: string) => void;
}

export default function VisionOfensora({ data, onViewHistory }: Props) {
  // 1. Cálculos memorizados para performance
  const { nomeOfensora, valorTotalOfensora, subcategoriasOrdenadas } = useMemo(() => {
    const despesas = data.filter((item) => Number(item.valor) < 0);

    if (despesas.length === 0) {
      return { nomeOfensora: null, valorTotalOfensora: 0, subcategoriasOrdenadas: [] };
    }

    const categoriasMap: Record<string, number> = {};
    despesas.forEach((item) => {
      const cat = item.categoria || "Outros";
      categoriasMap[cat] = (categoriasMap[cat] || 0) + Math.abs(Number(item.valor));
    });

    const [nome, valor] = Object.entries(categoriasMap).sort((a, b) => b[1] - a[1])[0];

    const subMap: Record<string, number> = {};
    despesas
      .filter((item) => (item.categoria || "Outros") === nome)
      .forEach((item) => {
        const sub = item.subcategoria || item.descricao || "Não identificado";
        subMap[sub] = (subMap[sub] || 0) + Math.abs(Number(item.valor));
      });

    const subOrdenadas = Object.entries(subMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      nomeOfensora: nome,
      valorTotalOfensora: valor,
      subcategoriasOrdenadas: subOrdenadas,
    };
  }, [data]);

  if (!nomeOfensora) return null;

  return (
    <section className="w-full bg-white border border-gray-100 rounded-[3rem] p-6 md:p-12 shadow-sm mt-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* HEADER: GRID 65/35 */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-14">
        <div className="w-full lg:w-[65%] text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-2xl">
              <Microscope size={22} />
            </div>
            <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-[0.3em]">
              Diagnóstico de Escoamento
            </h3>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
            Análise crítica de <span className="text-red-600">{nomeOfensora}</span>.
          </h2>
          <p className="text-gray-500 text-sm md:text-base mt-2 font-medium">
            Sua maior saída financeira concentra-se aqui. Veja o detalhamento abaixo:
          </p>
        </div>

        <div className="w-full lg:w-[35%] bg-gray-50 px-8 py-6 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 whitespace-nowrap">Impacto na Categoria</p>
          <p className="text-2xl font-black text-gray-900 tracking-tighter whitespace-nowrap">
            R$ {valorTotalOfensora.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* CONTEÚDO: GRID 65/35 */}
      <div className="flex flex-col lg:flex-row gap-12 items-stretch">
        
        {/* LADO ESQUERDO: DETALHAMENTO (65%) */}
        <div className="w-full lg:w-[65%] space-y-8">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <AlertTriangle size={14} className="text-orange-500" /> Detalhamento de incidência
          </p>
          
          <div className="space-y-7">
            {subcategoriasOrdenadas.map(([nome, valor], idx) => {
              const percentual = (valor / valorTotalOfensora) * 100;
              return (
                <div key={idx} className="group cursor-default">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
                      {nome}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-black text-gray-900 block tracking-tight whitespace-nowrap">
                        R$ {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">{percentual.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gray-900 h-full rounded-full transition-all duration-[1.5s] ease-out group-hover:bg-blue-600"
                      style={{ width: `${percentual}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LADO DIREITO: PLANO DE AÇÃO (35%) */}
        <div className="w-full lg:w-[35%] flex">
          <div className="bg-[#111827] rounded-[3rem] p-8 text-white w-full relative overflow-hidden shadow-2xl flex flex-col items-center text-center justify-between">
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <Target size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Plano de Ação</span>
              </div>
              
              <h4 className="text-xl font-bold mb-6 leading-tight tracking-tight">
                Potencial de <br/> <span className="text-blue-400">Economia Real</span>
              </h4>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 w-full">
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  Reduzir <span className="text-white font-bold">"{subcategoriasOrdenadas[0]?.[0]}"</span> em 10% traria economia de:
                </p>
                <p className="text-xl font-black text-blue-400 mt-3 tracking-tighter whitespace-nowrap">
                  R$ {(subcategoriasOrdenadas[0]?.[1] * 0.1).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <a 
              href="/lancamentos/gerenciar"
              className="relative z-10 group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] bg-blue-600 text-white hover:bg-white hover:text-gray-900 py-4 px-6 rounded-2xl transition-all duration-500 w-full justify-center active:scale-95 shadow-lg shadow-blue-600/20"
            >
              Ver Histórico <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
            
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-600/20 rounded-full blur-[40px]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}