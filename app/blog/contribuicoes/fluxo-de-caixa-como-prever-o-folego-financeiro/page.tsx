"use client";
import React from "react";
import { 
  ArrowLeft, 
  Clock, 
  LineChart, 
  TrendingUp, 
  Calendar, 
  Zap, 
  BarChart3,
  ChevronRight,
  AlertCircle,
  Scale,
  Instagram
} from "lucide-react";
import Link from "next/link";

export default function ArtigoFluxoCaixa() {
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
            Estratégia
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Clock size={12} /> 8 min de leitura
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
          Fluxo de caixa: A ciência de prever o fôlego financeiro antes do próximo lançamento<span className="text-blue-600">.</span>
        </h1>

        {/* ÁREA DE IDENTIFICAÇÃO DO TEMA */}
        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 mb-12">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <LineChart size={28} />
          </div>
          <div>
            <p className="text-[12px] font-black text-gray-900 uppercase tracking-wider">Gestão de Tráfego</p>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Previsibilidade de Caixa</p>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <article className="max-w-3xl mx-auto px-6 text-gray-700 text-lg leading-[1.8]">
        <p className="mb-8 font-medium text-xl text-gray-900">
          Muitos infoprodutores e gestores celebram o faturamento bruto no Dashboard da plataforma de vendas, mas ignoram a pergunta vital: quanto desse dinheiro estará disponível em conta quando o boleto do tráfego vencer?
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Calendar className="text-blue-600" /> Lucro vs. Disponibilidade
        </h2>
        <p className="mb-8">
          Existe uma diferença abismal entre **ter lucro** e **ter caixa**. O lucro é uma visão contábil; o fluxo de caixa é a realidade operacional. No mercado digital, onde trabalhamos com parcelamentos e prazos de liberação das plataformas (D+15, D+30), a falta de previsão manual pode quebrar uma operação que, no papel, parece milionária.
        </p>

        <div className="bg-blue-50/50 border-l-4 border-blue-600 p-8 my-10 rounded-r-[2rem]">
          <p className="italic font-medium text-blue-900">
            "Antecipar recebíveis para cobrir furos de caixa é o imposto invisível que corrói sua margem. A verdadeira escala nasce da capacidade de prever o fôlego financeiro com 60 dias de antecedência."
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Zap className="text-blue-600" /> O Impacto da Antecipação no ROI
        </h2>
        <p className="mb-6">
          Quando o carrinho abre e as vendas caem, a euforia é imediata. Porém, se você não planejou o fluxo, pode cair na armadilha da antecipação forçada. Cada taxa de 2% ou 3% para liberar o dinheiro agora é um percentual direto que sai do seu lucro líquido. 
        </p>
        
        <h3 className="text-xl font-bold text-gray-900 mb-4">Como estruturar sua previsão:</h3>
        <ul className="space-y-4 mb-10">
          <li className="flex gap-4 items-start">
            <div className="mt-1.5"><BarChart3 size={18} className="text-blue-600 shrink-0" /></div>
            <span><strong>Mapeamento de Recebíveis:</strong> Projete as parcelas futuras mês a mês, considerando a taxa de churn (cancelamento) esperada.</span>
          </li>
          <li className="flex gap-4 items-start">
            <div className="mt-1.5"><AlertCircle size={18} className="text-blue-600 shrink-0" /></div>
            <span><strong>Reserva de Tráfego:</strong> Nunca use o caixa operacional do dia a dia para o investimento do próximo lançamento. Separe o "capital de guerra".</span>
          </li>
          <li className="flex gap-4 items-start">
            <div className="mt-1.5"><TrendingUp size={18} className="text-blue-600 shrink-0" /></div>
            <span><strong>Análise de Fôlego:</strong> Calcule quantos meses sua estrutura aguenta sem novas vendas (o famoso Burn Rate).</span>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Scale size={18} className="text-blue-600" /> Decisões de Escala
        </h2>
        <p className="mb-8">
          Com um fluxo de caixa previsível, você para de "apagar incêndios" e começa a negociar melhor com fornecedores, ferramentas e coproduções. O conhecimento do seu poder de compra permite que você invista em tráfego de forma agressiva, sabendo exatamente quando o retorno voltará para o bolso.
        </p>

        <div className="p-10 bg-gray-900 rounded-[3rem] text-white my-12 relative overflow-hidden">
          <TrendingUp className="absolute -right-10 -bottom-10 text-blue-500 opacity-20" size={200} />
          <h3 className="text-2xl font-bold mb-4 relative z-10">Sua operação está saudável?</h3>
          <p className="text-gray-400 mb-8 relative z-10 font-medium">
            O primeiro passo para a escala previsível é abandonar as planilhas de "ontem" e focar nos dados de "amanhã". Transforme sua gestão em estratégia pura.
          </p>
          <Link href="/cadastro" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 relative z-10">
            Começar Previsão Agora <ChevronRight size={14} />
          </Link>
        </div>

        <p className="mb-0 italic text-gray-500 text-center">
          "Números bem geridos são a base para o próximo nível de liberdade no mercado digital."
        </p>
      </article>

      {/* NOVA LINHA DIVISÓRIA "CONECTE-SE" PADRONIZADA */}
      <div className="max-w-4xl mx-auto mt-24 flex items-center gap-4 mb-12 px-6">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM CENTRALIZADO PADRÃO "SOBRE" */}
      <div className="flex flex-col items-center text-center px-6">
        <div className="max-w-3xl mb-12">
          <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
            Fique por dentro <br className="md:hidden"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
          </h4>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            Insights, novidades e bastidores da Nucleobase diretamente no seu feed.
          </p>
        </div>
        
        <a 
          href="https://www.instagram.com/nucleobase.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center gap-6"
        >
          <div className="relative">
            {/* Efeito de brilho/glow ao fundo do ícone */}
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
            
            <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[2.2rem] md:rounded-[2.5rem] flex items-center justify-center text-white shadow-xl relative z-10 group-hover:rotate-6 transition-all duration-500">
              <Instagram className="w-12 h-12 md:w-14 md:h-14" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-pink-500 transition-colors">@nucleobase.app</span>
            <div className="h-1 w-0 bg-pink-500 mt-2 group-hover:w-full transition-all duration-500 rounded-full"></div>
          </div>
        </a>
      </div>

      {/* FOOTER DO ARTIGO */}
      <footer className="max-w-3xl mx-auto px-6 mt-20 pt-10 border-t border-gray-100 flex justify-between items-center">
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          © 2026 Blog Nucleobase - Estratégia & Performance
        </div>
      </footer>
    </div>
  );
}