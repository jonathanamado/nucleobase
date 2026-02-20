"use client";
import React from "react";
import { 
  ShieldCheck, 
  Target, 
  Zap, 
  Dna, 
  LockKeyhole, 
  Gift, 
  UserPlus,
  Users,
  ArrowUpRight
} from "lucide-react";

export default function SobreNucleobase() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 relative animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* HEADER DA PÁGINA SOBRE - COM CORES SINCRONIZADAS À SIDEBAR */}
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

        {/* BOTÕES DE AÇÃO RÁPIDA - PADRÃO WHITE & BORDERED */}
        <div className="flex flex-wrap gap-3">
          <a 
            href="/parceria" 
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm"
          >
            <Users size={14} />
            Seja um parceiro
          </a>
          
          <a 
            href="/indique" 
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg"
          >
            <ArrowUpRight size={14} /> Indique nosso APP
          </a>

        </div>
      </div>

      {/* LINHA DIVISÓRIA MIGRADA */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Manifesto e Visão <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* GRID DE CONTEÚDO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* NARRATIVA PRINCIPAL */}
        <div className="lg:col-span-7 text-gray-700 text-lg leading-[1.8]">
          <p className="mb-8">
            A Nucleobase nasceu de uma necessidade real tendo sua implantação digital no ano de 2025. O que começou como uma ferramenta de controle pessoal, 
            lapidada pelo tempo e demanda deste nicho, evoluiu para uma plataforma robusta, 
            focada em levar clareza e praticidade às pessoas.
          </p>

          <p className="mb-8">
            Antes do sistema, a gestão era dependente de planilhas complexas, exaustivas 
            e altamente suscetíveis a erros de preenchimento. Mais que o trabalho manual, havia também uma 
            vulnerabilidade crítica na <strong className="text-gray-900">segurança de dados</strong> e na <strong className="text-gray-900">interpretação</strong> de resultados.
          </p>

          {/* BLOCKQUOTE DE MISSÃO */}
          <div className="bg-blue-50/50 border-l-4 border-blue-600 p-4 my-10 rounded-r-2xl relative overflow-hidden group">
            <ShieldCheck className="absolute -right-4 -bottom-4 text-blue-600 opacity-5 group-hover:scale-110 transition-transform" size={120} />
            <p className="font-medium text-blue-900 italic text-xl leading-relaxed relative z-10">
              "Nossa missão é mitigar os riscos de interpretação e blindar a sua segurança através de padrões 
              rigorosos, transformando números brutos em decisões inteligentes."
            </p>
          </div>

          <p className="mb-8">
            Acreditamos no controle consciente. Embora o input de dados mantenha a autonomia do usuário, 
            o ecossistema da <span className="font-semibold text-blue-600">nucleobase.app</span> foi desenhado para eliminar a confusão e garantir 
            gestão sobre suas finanças, seja pessoal ou familiar.
          </p>
        </div>

        {/* SIDEBAR DE DESTAQUES (CARDS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1 */}
          <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Target size={20} />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Foco em Clareza</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Interface intuitiva desenhada para que qualquer pessoa, independente do nível de gestão financeira, possa vir a entender sua saúde econômica de maneira simples e transparente.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Zap size={20} />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Fluxo Eficiente</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Substituímos o caos das planilhas por processos de trabalho validados, reduzindo erro humano e garantindo a integridade sobre os dados.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <LockKeyhole size={20} />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Sigilo Bancário</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Diferente de apps que conectam contas, aqui seus dados são privados. Você mantém a custódia das informações sem expor senhas pessoais.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}