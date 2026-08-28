// app/consultoria/consultoria-especializada/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Building2,
  Wallet,
  Users,
  Zap,
  Lock,
  Headphones,
  Target,
  MessageCircle,
  Instagram,
  Dna
} from "lucide-react";

export default function ConsultoriaPage() {
  const whatsappLink = "https://wa.link/qbxg9f";

  // Dados dos serviços de consultoria simplificados
  const servicosConsultoria = [
    {
      tag: "Estratégia Premium",
      title: "Gestão Financeira Avançada",
      desc: "Consultoria individualizada e especializada para estruturação completa de fluxo de caixa, uso avançado e suporte dedicado à ferramenta e análise profunda do painel de resultados.",
      icon: <Wallet size={24} className="stroke-[1.5]" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      borderColor: "border-blue-100"
    },
    {
      tag: "Governança de Excelência",
      title: "Adm Profissional & Compliance",
      desc: "Assessoria de alto nível para gestão condominial, focada em transparência, legalidade, otimização de custos operacionais e valorização dos ativos imobiliários.",
      icon: <Building2 size={24} className="stroke-[1.5]" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      borderColor: "border-emerald-100"
    },
    {
      tag: "Onboarding Acelerado",
      title: "Suporte Especializado VIP",
      desc: "Linha direta com nossos especialistas sêniores para implantação rápida e customizada das soluções Nucleobase na sua operação, garantindo ROI imediato.",
      icon: <Users size={24} className="stroke-[1.5]" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
      borderColor: "border-purple-100"
    }
  ];

  return (
    <div className="w-full bg-white text-gray-900 min-h-screen">
      {/* --- CONTAINER PRINCIPAL COM ESPAÇAMENTO LATERAL PADRÃO --- */}
      <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0 text-xs md:text-sm">

        {/* --- CABEÇALHO PADRÃO DA PÁGINA --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
              <span>Consultoria Especializada<span className="text-blue-600">.</span></span>
              <Dna size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
            </h1>
            <h2 className="text-gray-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-0">
              Potencialize o uso da Nucleo, otimizando ainda mais seu dia a dia.
            </h2>
          </div>
        </div>

        {/* --- HERO SECTION DIFERENCIADA --- */}
        <section className="relative mb-12 bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          {/* Elemento gráfico de fundo */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-50 rounded-full opacity-40 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-blue-600 mb-4 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
                <Sparkles size={16} className="fill-blue-600" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Nucleobase Advisory</span>
              </div>

              <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
                Consultoria <span className="text-blue-600">Especializada</span> para Decisões Críticas.
              </h2>

              <p className="text-gray-500 text-xs md:text-sm font-medium leading-relaxed max-w-2xl mb-6">
                Transponha barreiras com a inteligência de dados da Nucleobase aliada à{" "}
                <span className="text-gray-900 font-semibold">expertise de consultores seniores</span> em finanças e gestão condominial.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 bg-gray-900 rounded-xl text-white w-fit">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <Lock size={16} />
                  <span>Exclusivo Assinantes Pro</span>
                </div>
                <span className="hidden sm:block text-gray-700">|</span>
                <Link
                  href="#contato"
                  className="group flex items-center gap-1.5 text-xs font-bold text-white hover:text-blue-400 transition-colors"
                >
                  Acione nossos especialistas <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Ícone de Alvo posicionado ao lado direito */}
            <div className="hidden md:flex items-center justify-center shrink-0">
              <div className="relative p-6 bg-white shadow-md rounded-2xl border border-gray-100 flex items-center justify-center">
                <Target size={48} strokeWidth={1.5} className="text-blue-600" />
              </div>
            </div>
          </div>
        </section>

        {/* --- GRADE DE SERVIÇOS (COMPACTOS E PADRONIZADOS) --- */}
        <section className="mb-16">
          <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-base md:text-xl font-bold tracking-tight text-gray-900">Nossas Frentes de Consultoria</h2>
            <div className="text-xs font-medium text-gray-500 px-0 md:px-4 py-0 md:py-2 bg-transparent md:bg-white rounded-none md:rounded-xl border-0 md:border border-gray-100 shadow-none md:shadow-sm">
              <span className="hidden md:inline-flex items-center gap-2">
                <Zap size={14} className="text-blue-500 shrink-0" />
                Resultados tangíveis e implantação assistida exclusiva para assinantes Pro
              </span>
              <span className="md:hidden">
                Resultados tangíveis e implantação assistida exclusiva para assinantes Pro
              </span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {servicosConsultoria.map((servico, idx) => (
              <div
                key={idx}
                className={`relative bg-white p-6 md:p-8 rounded-[2rem] border ${servico.borderColor} shadow-sm hover:border-blue-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  {/* Tag Superior */}
                  <span className={`inline-block mb-4 px-3 py-1 ${servico.bg} ${servico.color} rounded-full text-[9px] font-black uppercase tracking-wider border ${servico.borderColor}`}>
                    {servico.tag}
                  </span>

                  <div className="flex items-center gap-3.5 mb-3">
                    <div className={`p-3 ${servico.bg} ${servico.color} rounded-xl shadow-sm`}>
                      {servico.icon}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900 leading-snug tracking-tight">
                      {servico.title}
                    </h3>
                  </div>

                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-6 font-medium italic">
                    {servico.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Requer Plano Pro</span>
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Zap size={12} className="fill-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- BLOCO DE CHAMADA PARA AÇÃO / CONTATO (COMPACTO E COMPATÍVEL) --- */}
        <section id="contato" className="bg-gray-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/10 mb-16">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-blue-400 px-3 py-1 bg-white/5 rounded-full border border-white/10 w-fit">
                <Headphones size={14} />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Suporte Premium</span>
              </div>

              <h2 className="text-lg md:text-xl font-bold tracking-tight leading-tight max-w-lg">
                Pronto para <span className="text-blue-400">elevar o nível</span> da sua gestão?
              </h2>

              <p className="text-gray-300 text-xs md:text-sm font-medium leading-relaxed max-w-xl">
                Estamos preparados para direcionar você aos consultores especialistas. <span className="font-semibold text-white">Garanta seu acesso Pro e fale conosco.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/planos"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md text-center"
              >
                Verificar Acesso Pro <ArrowRight size={14} />
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 font-black text-[10px] uppercase tracking-widest text-center"
              >
                Contacte a Nucleo <MessageCircle size={14} className="text-blue-400" />
              </a>
            </div>
          </div>
        </section>

        {/* LINHA DIVISÓRIA "CONECTE-SE" CENTRALIZADA */}
        <div className="mt-24 flex items-center gap-4 mb-12">
          <div className="h-px bg-gray-200 flex-1"></div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
            Conecte-se
          </h3>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* BLOCO INSTAGRAM CENTRALIZADO PADRÃO NUCLEOBASE */}
        <div className="flex flex-col items-center text-center">
          <div className="max-w-3xl mb-12">
            <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
              Fique por dentro <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
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
    </div>
  );
}