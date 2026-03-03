"use client";
import React from "react";
import { 
  ArrowLeft, 
  Clock, 
  Building2, // Ícone padronizado conforme a Home (ID 4)
  ShieldCheck, 
  Coins, 
  Briefcase,
  ChevronRight,
  Library,
  Gavel
} from "lucide-react";
import Link from "next/link";

export default function ArtigoHoldingsDigital() {
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
            Tributário
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Clock size={12} /> 10 min de leitura
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
          Holdings no Mercado Digital: Proteção patrimonial ou custo desnecessário?<span className="text-blue-600">.</span>
        </h1>

        {/* ÁREA DE IDENTIFICAÇÃO DO TEMA - SINCRONIZADA COM A HOME (CARD 4) */}
        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 mb-12">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Building2 size={28} />
          </div>
          <div>
            <p className="text-[12px] font-black text-gray-900 uppercase tracking-wider">Direito Tributário</p>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Eficiência Fiscal</p>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <article className="max-w-3xl mx-auto px-6 text-gray-700 text-lg leading-[1.8]">
        <p className="mb-8 font-medium text-xl text-gray-900">
          À medida que os lançamentos escalam e o faturamento deixa de ser uma promessa para se tornar uma realidade de sete ou oito dígitos, surge uma dúvida crucial: como proteger esse capital da alta carga tributária e de riscos operacionais?
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Library className="text-blue-600" /> O que é uma Holding no contexto digital?
        </h2>
        <p className="mb-8">
          Diferente do que muitos pensam, uma Holding não é exclusividade de grandes indústrias. No mercado de infoprodutos, ela atua como uma "empresa mãe" que detém as quotas das empresas operacionais (as que vendem os cursos ou mentorias). Sua principal função é centralizar o patrimônio, facilitando a gestão e, principalmente, a sucessão e proteção dos bens.
        </p>

        <div className="bg-blue-50/50 border-l-4 border-blue-600 p-8 my-10 rounded-r-[2rem]">
          <p className="italic font-medium text-blue-900">
            "A holding é o escudo que separa o risco do lançamento do seu patrimônio conquistado. No digital, onde a exposição é alta, a segurança jurídica deve ser proporcional ao sucesso."
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <ShieldCheck className="text-blue-600" /> Quando vale a pena investir nessa estrutura?
        </h2>
        <p className="mb-6">
          Não existe uma fórmula mágica, mas sim um momento de inflexão financeira. Investir em uma estrutura de Holding faz sentido quando:
        </p>
        
        <ul className="space-y-6 mb-10">
          <li className="flex gap-4 items-start">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0"><Coins size={20} /></div>
            <span><strong>Redução de Carga Tributária:</strong> O recebimento de lucros e dividendos através de uma holding pode abrir portas para um planejamento tributário muito mais agressivo e legal, otimizando o que fica no bolso.</span>
          </li>
          <li className="flex gap-4 items-start">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0"><Briefcase size={20} /></div>
            <span><strong>Blindagem Patrimonial:</strong> Isolar imóveis, investimentos e reservas financeiras das dívidas ou processos que a empresa operacional possa sofrer.</span>
          </li>
          <li className="flex gap-4 items-start">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0"><Gavel size={20} /></div>
            <span><strong>Planejamento Sucessório:</strong> Organizar a transferência de bens de forma simplificada, evitando inventários caros e demorados no futuro.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">A Ciência da Organização Antecipada</h2>
        <p className="mb-8">
           Muitos deixam para pensar nisso quando o problema bate à porta. No entanto, a organização financeira — aquela que começa no seu dashboard diário — é o que alimenta os dados para uma Holding eficiente. Sem uma gestão clara de receitas e despesas, nem a melhor estrutura jurídica do mundo consegue salvar o seu caixa.
        </p>

        <div className="p-10 bg-gray-900 rounded-[3rem] text-white my-12 relative overflow-hidden">
          <ShieldCheck className="absolute -right-10 -bottom-10 text-blue-500 opacity-20" size={200} />
          <h3 className="text-2xl font-bold mb-4 relative z-10">Segurança em primeiro lugar.</h3>
          <p className="text-gray-400 mb-8 relative z-10 font-medium">
            Estruturar o seu império digital exige ferramentas que deem suporte à clareza que o Direito exige. Comece organizando seus números hoje para blindar seu amanhã.
          </p>
          <Link href="/cadastro" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 relative z-10">
            Blindar meu Patrimônio <ChevronRight size={14} />
          </Link>
        </div>

        <p className="text-center text-gray-400 font-medium text-sm">
          Este artigo tem caráter informativo. Consulte sempre um advogado especialista para o seu caso.
        </p>
      </article>

      {/* FOOTER DO ARTIGO */}
      <footer className="max-w-3xl mx-auto px-6 mt-16 pt-10 border-t border-gray-100 flex justify-between items-center">
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          © 2026 Blog Nucleobase - Jurídico & Estratégia
        </div>
      </footer>
    </div>
  );
}