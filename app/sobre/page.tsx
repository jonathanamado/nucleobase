"use client";
import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Target, 
  Zap, 
  Dna, 
  LockKeyhole, 
  Gift, 
  UserPlus,
  Users,
  ArrowUpRight,
  Star 
} from "lucide-react";

export default function SobreNucleobase() {
  const [progresso, setProgresso] = useState("0%");

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgresso("33%"); 
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* HEADER DA PÁGINA SOBRE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center">
            <span>Sobre a gente<span className="text-blue-600">.</span></span>
            <Dna size={60} className="text-blue-600 skew-x-16 opacity-35 ml-4" strokeWidth={1.2} />
          </h1>
          
          <h2 className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed -mt-0">
            Simplicidade em seu orçamento doméstico.
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href="/parceria" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm">
            <Users size={14} /> Seja um parceiro
          </a>
          <a href="/indique" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg">
            <ArrowUpRight size={14} /> Indique nosso APP
          </a>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Manifesto e Visão <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* NARRATIVA PRINCIPAL */}
        <div className="lg:col-span-7 text-gray-700 text-lg leading-[1.8]">
          <p className="mb-8">
            A Nucleobase nasceu de uma necessidade real tendo sua implantação digital no ano de 2025. O que começou como uma ferramenta de controle pessoal, 
            lapidada pelo tempo e demanda deste nicho, evoluiu para uma plataforma robusta, 
            focada em levar clareza e praticidade às pessoas.
          </p>

          <p className="mb-8">
            Antes do sistema, a gestão do seu idealizador era dependente de planilhas complexas, exaustivas 
            e altamente suscetíveis a erros de preenchimento. Mais que o trabalho manual, havia também uma 
            vulnerabilidade crítica na <strong className="text-gray-900">segurança de dados</strong> e na <strong className="text-gray-900">interpretação</strong> de resultados.
            Além de todo este esforço, retrabalho e risco, ainda se tornava mais complexo ainda quando o orçamento pessoal precisava "conversar" com o orçamento familiar.
          </p>

          <div className="bg-blue-50/50 border-l-4 border-blue-600 p-8 my-10 rounded-r-[2.5rem] relative overflow-hidden group">
            <ShieldCheck className="absolute -right-4 -bottom-4 text-blue-600 opacity-5 group-hover:scale-110 transition-transform" size={140} />
            <p className="font-medium text-blue-900 italic text-xl leading-relaxed relative z-10">
              "Nossa missão é mitigar os riscos de interpretação e blindar a sua segurança através de padrões 
              rigorosos, transformando números brutos em decisões inteligentes."
            </p>
          </div>

          <p className="mb-8 text-gray-700 text-lg leading-[1.8]">
            Cada pessoa possui um método único para gerir seu orçamento doméstico — alguns preferem o detalhe minucioso, outros a visão macro. Na <span className="font-semibold text-blue-600">nucleobase.app</span>, transformamos essa rotina em um <span className="text-gray-900 font-semibold italic">game de alta performance</span>. 
            <br /><br />
            Acreditamos no <span className="text-gray-900 font-medium underline decoration-blue-200 underline-offset-4">controle consciente</span> como o primeiro nível de conquista. Aqui, cada input de dados é um <span className="text-blue-600 font-medium">checkpoint</span> rumo à sua liberdade. Nosso ecossistema foi desenhado para garantir gestão sobre suas finanças, seja pessoal ou familiar.
          </p>
        </div>

        {/* SIDEBAR DE DESTAQUES (PADRONIZADA POR ALTURA) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card 4 - Nível de Clareza (O Card Mestre) */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-7 rounded-[2rem] shadow-xl shadow-blue-900/20 group relative overflow-hidden transition-all hover:scale-[1.02] flex flex-col justify-between min-h-[175px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform pointer-events-none">
              <Zap size={100} strokeWidth={1} className="text-white" />
            </div>

            <div className="relative z-10 w-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 shrink-0 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center">
                  <Star size={22} fill="white" />
                </div>
                <div>
                  <p className="text-blue-100 text-[9px] font-black uppercase tracking-[0.2em]">Sua Jornada</p>
                  <h4 className="font-bold text-white text-base leading-tight">Nível de Clareza</h4>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[9px] font-bold text-blue-100 uppercase tracking-wider">
                  <span>DNA Iniciante</span>
                  <span>Mestre</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-[2000ms] ease-out relative"
                    style={{ width: progresso }}
                  >
                    <div className="absolute right-0 top-0 h-full w-2 bg-white blur-sm"></div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-blue-50 leading-relaxed opacity-90">
                Cada lançamento consciente aproxima você do <span className="font-bold text-white italic underline underline-offset-2">Próximo Nível</span>.
              </p>
            </div>
          </div>

          {/* Card 1 */}
          <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group flex items-start gap-5 min-h-[175px]">
            <div className="w-12 h-12 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Target size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base mb-2">Foco em Clareza</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Interface intuitiva desenhada para que qualquer pessoa, independente do nível de gestão financeira, possa vir a entender sua saúde econômica de maneira simples e transparente.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group flex items-start gap-5 min-h-[175px]">
            <div className="w-12 h-12 shrink-0 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <Zap size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base mb-2">Fluxo Eficiente</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Substituímos o caos das planilhas por processos de trabalho validados, reduzindo erro humano e garantindo a integridade sobre os dados em tempo real.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group flex items-start gap-5 min-h-[175px]">
            <div className="w-12 h-12 shrink-0 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <LockKeyhole size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base mb-2">Sigilo Bancário</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Diferente de apps que conectam contas, aqui seus dados são privados. Você mantém a custódia das informações sem expor senhas pessoais ou tokens sensíveis.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}