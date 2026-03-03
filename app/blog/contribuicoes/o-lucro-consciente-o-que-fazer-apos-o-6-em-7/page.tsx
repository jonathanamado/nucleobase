"use client";
import React from "react";
import { 
  ArrowLeft, 
  Clock, 
  Trophy, 
  Gem, // Ícone padronizado conforme a Home (ID 3)
  LineChart, 
  Building2,
  ChevronRight,
  Sparkles 
} from "lucide-react";
import Link from "next/link";

export default function ArtigoLucroConsciente() {
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
            Mentalidade
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Clock size={12} /> 6 min de leitura
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
          O lucro consciente: O que fazer após bater o primeiro 6 em 7<span className="text-blue-600">.</span>
        </h1>

        {/* ÁREA DE IDENTIFICAÇÃO DO TEMA - SINCRONIZADA COM A HOME */}
        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 mb-12">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Gem size={28} />
          </div>
          <div>
            <p className="text-[12px] font-black text-gray-900 uppercase tracking-wider">Mercado de Infoprodutos</p>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Cultura de Reinvestimento</p>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <article className="max-w-3xl mx-auto px-6 text-gray-700 text-lg leading-[1.8]">
        <p className="mb-8 font-medium text-xl text-gray-900">
          Bater seis dígitos de faturamento em sete dias é o rito de passagem no mercado digital. Mas a verdadeira maestria não está em chegar lá, e sim no que você faz com o saldo que sobra após as luzes do lançamento se apagarem.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Trophy className="text-blue-600" /> A Armadilha da Recompensa Imediata
        </h2>
        <p className="mb-8">
          O erro mais comum do infoprodutor iniciante é confundir o caixa da empresa com a conta pessoal de ostentação. O primeiro "6 em 7" costuma vir acompanhado de uma vontade avassaladora de atualizar o padrão de vida. Porém, sem um controle consciente, esse lucro evapora em passivos, deixando a operação vulnerável para o próximo ciclo de tráfego pago.
        </p>

        <div className="bg-blue-50/50 border-l-4 border-blue-600 p-8 my-10 rounded-r-[2rem]">
          <p className="italic font-medium text-blue-900">
            "Faturamento é ego, lucro é sanidade, mas o reinvestimento estratégico é o que constrói um legado. O 6 em 7 deve servir ao seu negócio, não apenas aos seus desejos."
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Building2 className="text-blue-600" /> Estruturando o Reinvestimento
        </h2>
        <p className="mb-6">
          O lucro consciente exige uma divisão clara. Após separar os impostos e o seu pró-labore, o excedente deve ter três destinos obrigatórios para garantir a escala:
        </p>
        
        <ul className="space-y-6 mb-10">
          <li className="flex gap-4 items-start">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0"><LineChart size={20} /></div>
            <span><strong>Crescimento de Base:</strong> Reinvestir em tráfego de perpetuo para diminuir a dependência exclusiva dos lançamentos e manter o caixa girando.</span>
          </li>
          <li className="flex gap-4 items-start">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0"><Gem size={20} /></div>
            <span><strong>Melhoria de Produto:</strong> Contratar suporte de elite, design de experiência e tecnologia. Um aluno satisfeito é o seu CAC mais barato.</span>
          </li>
          <li className="flex gap-4 items-start">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0"><Sparkles size={20} /></div>
            <span><strong>Contingência e Reserva:</strong> O mercado digital é volátil. Ter 6 meses de custos fixos guardados permite que você tome decisões com calma, e não pelo desespero do próximo boleto.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          O Próximo Nível: Sair do Operacional
        </h2>
        <p className="mb-8">
          Gerir o lucro de forma estratégica permite que você compre o recurso mais caro de todos: o **tempo**. Com processos financeiros claros, você sai da planilha e volta para a estratégia. Você deixa de ser um "fazedor de posts" para se tornar o CEO de uma estrutura de infoprodução que trabalha para você.
        </p>

        <div className="p-10 bg-gray-900 rounded-[3rem] text-white my-12 relative overflow-hidden">
          <Gem className="absolute -right-10 -bottom-10 text-blue-500 opacity-20" size={200} />
          <h3 className="text-2xl font-bold mb-4 relative z-10">Domine seu ROI Real.</h3>
          <p className="text-gray-400 mb-8 relative z-10 font-medium">
            Não deixe que o sucesso do seu lançamento seja o fim da sua jornada. Organize seus ganhos e transforme um pico de vendas em uma montanha de patrimônio.
          </p>
          <Link href="/cadastro" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 relative z-10">
            Profissionalizar minha Gestão <ChevronRight size={14} />
          </Link>
        </div>

        <p className="mb-0 text-center font-bold text-gray-400 uppercase tracking-widest text-[11px]">
          Conhecer para decidir. Decidir para prosperar.
        </p>
      </article>

      {/* FOOTER DO ARTIGO */}
      <footer className="max-w-3xl mx-auto px-6 mt-16 pt-10 border-t border-gray-100 flex justify-between items-center">
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          © 2026 Blog Nucleobase - Mentalidade & Legado
        </div>
      </footer>
    </div>
  );
}