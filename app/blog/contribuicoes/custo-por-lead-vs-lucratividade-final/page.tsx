"use client";
import React from "react";
import { 
  ArrowLeft, 
  Clock, 
  Target,
  Filter, 
  MousePointerClick, 
  Wallet, 
  Calculator,
  ChevronRight,
  TrendingUp,
  Instagram
} from "lucide-react";

export default function ArtigoCustoPorLead() {
  return (
    <div className="w-full bg-white min-h-screen pb-20 animate-in fade-in duration-700">
      {/* HEADER DO ARTIGO */}
      <header className="max-w-4xl mx-auto pt-12 px-6">
        <a 
          href="/blog" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8 hover:gap-4 transition-all"
        >
          <ArrowLeft size={14} /> Voltar ao Blog
        </a>
        
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
            Lançamento
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Clock size={12} /> 5 min de leitura
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
          Custo por Lead vs. Lucratividade Final: Onde o seu dinheiro está sumindo<span className="text-blue-600">.</span>
        </h1>

        {/* ÁREA DE IDENTIFICAÇÃO DO TEMA */}
        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 mb-12">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Target size={28} />
          </div>
          <div>
            <p className="text-[12px] font-black text-gray-900 uppercase tracking-wider">Copy & Estratégia</p>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Análise de ROI Real</p>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <article className="max-w-3xl mx-auto px-6 text-gray-700 text-lg leading-[1.8]">
        <p className="mb-8 font-medium text-xl text-gray-900">
          No Gerenciador de Anúncios, o CPL (Custo por Lead) de R$ 1,00 parece um sonho. No seu extrato bancário, porém, esse sonho pode se tornar um pesadelo se a taxa de conversão não pagar a conta.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Filter className="text-blue-600" /> A Ilusão do Lead Barato
        </h2>
        <p className="mb-8">
          Muitos estrategistas focam obsessivamente em baixar o custo da captação. No entanto, leads "baratos" muitas vezes são leads desqualificados, atraídos por promessas vagas ou públicos muito amplos. O resultado? Um funil lotado de pessoas que nunca comprarão seu produto principal. O controle manual falha aqui por não cruzar a **origem do lead** com o **lucro real no bolso**.
        </p>

        <div className="bg-blue-50/50 border-l-4 border-blue-600 p-8 my-10 rounded-r-[2rem]">
          <p className="italic font-medium text-blue-900">
            "Não importa quanto custa o clique se o checkout não converte. A métrica soberana de um lançamento não é o CPL, é a margem líquida que sobra após o fechamento do carrinho."
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Calculator className="text-blue-600" /> Equilibrando o Investimento em Captação
        </h2>
        <p className="mb-6">
          Para garantir a saúde financeira da sua operação, você precisa analisar o investimento sob três óticas simultâneas:
        </p>
        
        <ul className="space-y-6 mb-10">
          <li className="flex gap-4 items-start">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0"><MousePointerClick size={20} /></div>
            <span><strong>Qualidade vs. Quantidade:</strong> Às vezes, pagar R$ 5,00 em um lead altamente qualificado gera um ROI 10x maior do que pagar R$ 0,50 em curiosos.</span>
          </li>
          <li className="flex gap-4 items-start">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0"><Wallet size={20} /></div>
            <span><strong>Custo de Operação Oculto:</strong> Muitos leads exigem uma equipe de suporte/vendas maior. Se o lead é barato mas o custo de conversão (vendedores) é alto, sua margem morre.</span>
          </li>
          <li className="flex gap-4 items-start">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0"><TrendingUp size={20} /></div>
            <span><strong>Ponto de Equilíbrio (Break-even):</strong> Saiba exatamente quantos leads você precisa converter para cobrir os custos fixos do lançamento antes mesmo de começar a lucrar.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Visão Sistêmica: O Segredo dos Grandes</h2>
        <p className="mb-8">
          Grandes players não olham para o tráfego isolado do financeiro. Eles tratam a captação como uma compra de ativos. Quando você tem um sistema de controle consciente, você para de ter medo do "lead caro" e passa a focar no que realmente expande seu patrimônio: a lucratividade final por cada real investido.
        </p>

        <div className="p-10 bg-gray-900 rounded-[3rem] text-white my-12 relative overflow-hidden">
          <Filter className="absolute -right-10 -bottom-10 text-blue-500 opacity-20" size={200} />
          <h3 className="text-2xl font-bold mb-4 relative z-10">Otimize seu ROI agora.</h3>
          <p className="text-gray-400 mb-8 relative z-10 font-medium">
            Leads, métricas e conversão só fazem sentido quando se transformam em lucro real e previsível. Assuma o controle estratégico do seu lançamento.
          </p>
          <a href="/cadastro" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 relative z-10">
            Maximizar meu Lucro <ChevronRight size={14} />
          </a>
        </div>

        <p className="text-center text-gray-400 font-bold uppercase tracking-widest text-[11px] mb-20">
          Copy atrai, estratégia vende, mas a gestão protege.
        </p>
      </article>

      {/* SEÇÃO CONECTE-SE PADRONIZADA */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="mt-12 flex items-center gap-4 mb-12">
          <div className="h-px bg-gray-200 flex-1"></div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
            Conecte-se
          </h3>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* BLOCO INSTAGRAM CENTRALIZADO (MESMO PADRÃO DA PÁGINA SOBRE) */}
        <div className="flex flex-col items-center text-center pb-20">
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
              {/* Glow effect */}
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
      </div>

      {/* FOOTER DO ARTIGO */}
      <footer className="max-w-3xl mx-auto px-6 pt-10 border-t border-gray-100 flex justify-between items-center">
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          © 2026 Blog Nucleobase - Estratégia & Conversão
        </div>
      </footer>
    </div>
  );
}