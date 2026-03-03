"use client";
import React from "react";
import { 
  ArrowLeft, 
  Clock, 
  BarChart3, // Ícone padronizado conforme a Home (ID 5)
  PieChart, 
  ArrowUpRight, 
  Activity,
  ChevronRight,
  Target
} from "lucide-react";
import Link from "next/link";

export default function ArtigoKPIsFinanceiros() {
  return (
    <div className="w-full bg-white min-h-screen pb-20 animate-in fade-in duration-700">
      {/* HEADER DO ARTIGO */}
      <header className="max-w-4xl mx-auto pt-12 px-6">
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8 hover:gap-4 transition-all"
        >
          <ArrowLeft size={14} /> Voltar ao Blog
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
            Escala
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Clock size={12} /> 7 min de leitura
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
          KPIs que realmente importam: Pare de olhar apenas para o faturamento<span className="text-blue-600">.</span>
        </h1>

        {/* ÁREA DE IDENTIFICAÇÃO DO TEMA - SINCRONIZADA COM A HOME (CARD 5) */}
        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 mb-12">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <BarChart3 size={28} />
          </div>
          <div>
            <p className="text-[12px] font-black text-gray-900 uppercase tracking-wider">Controladoria Digital</p>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Métricas de Sobrevivência</p>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <article className="max-w-3xl mx-auto px-6 text-gray-700 text-lg leading-[1.8]">
        <p className="mb-8 font-medium text-xl text-gray-900">
          No mercado digital, é fácil se embriagar com os prints de "milhões faturados". Mas, como costumamos dizer no mundo das finanças corporativas: faturamento é vaidade, lucro é sanidade e caixa é rei.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Target className="text-blue-600" /> O perigo das Métricas de Vaidade
        </h2>
        <p className="mb-8">
           Muitos experts acreditam que o negócio vai bem porque o volume de vendas cresceu. No entanto, se o seu custo de aquisição (CAC) subiu na mesma proporção ou se sua estrutura fixa inchou sem controle, você pode estar faturando mais e lucrando menos. Para escalar com segurança, você precisa dominar os indicadores de performance (KPIs) reais.
        </p>

        <div className="bg-blue-50/50 border-l-4 border-blue-600 p-8 my-10 rounded-r-[2rem]">
          <p className="italic font-medium text-blue-900">
            "Se você não pode medir, você não pode gerenciar. A diferença entre um 'lançador' e um empresário é a capacidade de ler o que os números estão gritando entre as linhas do balanço."
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Activity className="text-blue-600" /> Os 3 Indicadores de Sobrevivência
        </h2>
        <p className="mb-6">
          Esqueça o gráfico de vendas por um momento. Foque nestes três pilares que definem se o seu negócio é sustentável:
        </p>
        
        <ul className="space-y-6 mb-10">
          <li className="flex gap-4 items-start">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0"><PieChart size={20} /></div>
            <span><strong>Margem Líquida Real:</strong> O que sobra depois de pagar tráfego, impostos, taxas de plataforma, equipe e custos fixos. Se sua margem está abaixo de 20% em um negócio digital, sua operação está em risco.</span>
          </li>
          <li className="flex gap-4 items-start">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0"><ArrowUpRight size={20} /></div>
            <span><strong>LTV (Lifetime Value):</strong> Quanto um cliente deixa no seu bolso ao longo de toda a jornada com você. O lucro real muitas vezes não está na primeira venda, mas no upsell.</span>
          </li>
          <li className="flex gap-4 items-start">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0"><BarChart3 size={20} /></div>
            <span><strong>ROI sobre a Operação (ROO):</strong> Não olhe apenas o ROAS do Facebook. Olhe o retorno sobre cada centavo gasto na estrutura da empresa.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">A Ciência de Decidir com Dados</h2>
        <p className="mb-8">
          A maioria dos erros de gestão manual acontece porque o empreendedor olha para o passado. O CFO olha para o futuro. Quando você organiza seus dados financeiros, esses KPIs tornam-se uma bússola. Eles dizem quando é hora de pisar no acelerador e, mais importante, quando é hora de segurar o investimento para ajustar a rota.
        </p>

        <div className="p-10 bg-gray-900 rounded-[3rem] text-white my-12 relative overflow-hidden">
          <BarChart3 className="absolute -right-10 -bottom-10 text-blue-500 opacity-20" size={200} />
          <h3 className="text-2xl font-bold mb-4 relative z-10">Sua gestão no próximo nível.</h3>
          <p className="text-gray-400 mb-8 relative z-10 font-medium">
            KPIs complexos tornam-se simples quando você tem a ferramenta certa. Pare de adivinhar e comece a analisar a saúde real do seu patrimônio digital.
          </p>
          <Link href="/cadastro" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 relative z-10">
            Analisar meus Indicadores <ChevronRight size={14} />
          </Link>
        </div>

        <p className="text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
          Faturamento é vaidade. Lucro é clareza. Nucleobase é estratégia.
        </p>
      </article>

      {/* FOOTER DO ARTIGO */}
      <footer className="max-w-3xl mx-auto px-6 mt-16 pt-10 border-t border-gray-100 flex justify-between items-center">
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          © 2026 Blog Nucleobase - Controladoria Digital
        </div>
      </footer>
    </div>
  );
}