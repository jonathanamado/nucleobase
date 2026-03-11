"use client";
import React from "react";
import { 
  ArrowLeft, 
  Clock, 
  Wallet, 
  ShieldAlert, 
  TrendingDown, 
  Scale, 
  Target,
  ChevronRight,
  Instagram
} from "lucide-react";

export default function ArtigoSeparacaoContas() {
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
            Gestão
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Clock size={12} /> 5 min de leitura
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
          A ciência por trás da separação de contas: Por que o amadorismo destrói o ROI<span className="text-blue-600">.</span>
        </h1>

        {/* ÁREA DE IDENTIFICAÇÃO DO TEMA */}
        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 mb-12">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-[12px] font-black text-gray-900 uppercase tracking-wider">Estratégia de Negócios</p>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Organização Patrimonial</p>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <article className="max-w-3xl mx-auto px-6 text-gray-700 text-lg leading-[1.8]">
        <p className="mb-8 font-medium text-xl text-gray-900">
          No calor de um lançamento ou na correria da operação digital, um erro silencioso costuma drenar a lucratividade antes mesmo do carrinho fechar: a simbiose financeira entre o indivíduo e a empresa.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <ShieldAlert className="text-blue-600" /> O Caos do Controle Manual
        </h2>
        <p className="mb-8">
          Para quem ainda gere o orçamento de forma manual — seja em cadernos, notas esparsas ou planilhas estáticas — a separação de contas parece um detalhe burocrático. Na prática, é a diferença entre ter um negócio ou ter um "puxadinho" digital. Quando você paga o boleto da luz de casa com o lucro do tráfego pago, você perde a métrica real de **Custo de Aquisição de Cliente (CAC)**.
        </p>

        <div className="bg-blue-50/50 border-l-4 border-blue-600 p-8 my-10 rounded-r-[2rem]">
          <p className="italic font-medium text-blue-900">
            "Misturar gastos pessoais com os do lançamento não é apenas um erro contábil; é um erro de inteligência estratégica. Sem fronteiras claras, o ROI torna-se uma ficção científica."
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <TrendingDown className="text-blue-600" /> Como a Mistura Destrói seu ROI
        </h2>
        <p className="mb-6">
          O Retorno sobre Investimento (ROI) exige dados puros. Ao injetar despesas de subsistência pessoal no fluxo de caixa da operação, três fenômenos ocorrem:
        </p>
        <ul className="space-y-4 mb-10">
          <li className="flex gap-4 items-start">
            <div className="mt-1.5"><ChevronRight size={18} className="text-blue-600 shrink-0" /></div>
            <span><strong>Cegueira Operacional:</strong> Você não sabe se o lançamento foi lucrativo ou se você apenas "sobreviveu" a ele.</span>
          </li>
          <li className="flex gap-4 items-start">
            <div className="mt-1.5"><ChevronRight size={18} className="text-blue-600 shrink-0" /></div>
            <span><strong>Dificuldade de Escala:</strong> Investidores e parceiros fogem de operações onde o caixa da empresa é o caixa eletrônico do sócio.</span>
          </li>
          <li className="flex gap-4 items-start">
            <div className="mt-1.5"><ChevronRight size={18} className="text-blue-600 shrink-0" /></div>
            <span><strong>Risco Tributário:</strong> A "confusão patrimonial" é o caminho mais curto para problemas com a malha fina.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Scale className="text-blue-600" /> A Solução: O Método Pró-Labore
        </h2>
        <p className="mb-8">
          A ciência da separação exige uma decisão consciente: o seu negócio paga um salário (Pró-Labore) para você. Se o lucro do mês foi de R$ 50 mil, mas seu custo de vida é R$ 10 mil, apenas os R$ 10 mil devem migrar para sua conta física. O restante pertence à empresa para reinvestimento em estrutura, escala e contingência.
        </p>

        <div className="p-10 bg-gray-900 rounded-[3rem] text-white my-12 relative overflow-hidden">
          <Target className="absolute -right-10 -bottom-10 text-blue-500 opacity-20" size={200} />
          <h3 className="text-2xl font-bold mb-4 relative z-10">Pronto para o próximo nível?</h3>
          <p className="text-gray-400 mb-8 relative z-10 font-medium">
            Sair do amadorismo manual requer ferramentas que entendam essa separação. O controle consciente é o que separa infoprodutores de empresários digitais.
          </p>
          <a href="/cadastro" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 relative z-10">
            Assumir o Controle Agora <ChevronRight size={14} />
          </a>
        </div>

        <p className="mb-0">
          Lembre-se: números não mentem, mas métodos manuais e desorganizados podem omitir verdades dolorosas. Separe suas contas, proteja seu ROI e trate seu lançamento como a empresa de alta performance que ela merece ser.
        </p>
      </article>

      {/* NOVA LINHA DIVISÓRIA "CONECTE-SE" CENTRALIZADA */}
      <div className="max-w-4xl mx-auto px-6 mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM CENTRALIZADO COM GRADIENTE E BRILHO */}
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
          © 2026 Blog Nucleobase - Conteúdo Estratégico
        </div>
      </footer>
    </div>
  );
}