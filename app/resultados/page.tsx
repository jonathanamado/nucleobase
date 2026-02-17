"use client";
import React from "react";
import Link from 'next/link';
import { 
  Zap, ArrowLeft, Construction, Clock, 
  ShieldCheck, BarChart3, Dna 
} from "lucide-react";

export default function PaginaEmConstrucao() {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* HEADER: Ajustado com o ícone DNA moderno e sem o foguete */}
      <div className="mb-4 mt-0">
        <h1 className="text-5xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
          <span>Página em Construção<span className="text-blue-600">.</span></span>
          <Dna size={60} className="text-blue-600 opacity-35 ml-4" strokeWidth={1.2} />
        </h1>
        <h2 className="text-gray-500 text-lg">
          Expandindo sua clareza financeira e inteligência estratégica.
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LADO ESQUERDO: MENSAGEM PRINCIPAL */}
        <div className="lg:col-span-7">
          <div className="bg-gray-50 border border-gray-100 rounded-[3rem] p-10 relative overflow-hidden mb-8">
            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200 rotate-3">
                <Construction size={28} />
              </div>
              
              <p className="text-gray-700 text-xl leading-[1.8] mb-8 font-medium">
                Estamos trabalhando no desenvolvimento desta nova funcionalidade, visando a <span className="text-blue-600 font-bold">experiência intuitiva</span> que você já conhece.
              </p>

              <div className="flex items-center gap-6">
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 text-gray-900 font-black text-[10px] uppercase tracking-[0.2em] hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft size={16} /> Voltar ao Início
                </Link>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Clock size={12} className="animate-pulse" /> Disponível em breve
                </div>
              </div>
            </div>
            
            {/* Elemento Visual de Fundo: Zap mantido como marca d'água */}
            <Zap size={200} className="absolute -right-20 -bottom-20 text-blue-100 opacity-50 -rotate-12" />
          </div>
        </div>

        {/* LADO DIREITO: CARD DE DESTAQUE (SNEAK PEEK) */}
        <div className="lg:col-span-5">
          <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <span className="bg-blue-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-6 inline-block">
                Sneak Peek
              </span>
              <h3 className="text-2xl font-bold mb-6 leading-tight">
                O que vem por aí?
              </h3>
              
              <ul className="space-y-3 mb-5">
                <li className="flex items-start gap-4">
                  <div className="bg-white/10 p-2 rounded-lg"><BarChart3 size={18} className="text-blue-400" /></div>
                  <p className="text-sm text-gray-400 leading-snug">Visualizações gráficas de ponta.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-white/10 p-2 rounded-lg"><ShieldCheck size={18} className="text-emerald-400" /></div>
                  <p className="text-sm text-gray-400 leading-snug">Camadas extras de criptografia.</p>
                </li>
              </ul>

              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.1em] italic">
                  "O futuro da sua organização financeira está sendo refinado."
                </p>
              </div>
            </div>

            {/* Círculos Decorativos de Vidro */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
          </div>
        </div>

      </div>
    </div>
  );
}