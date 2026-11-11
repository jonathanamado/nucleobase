// app/parceria/page.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Handshake,
  Target,
  Globe,
  Rocket,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Building2,
  Star
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Inicializa o Supabase Client diretamente com as variáveis de ambiente públicas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ParceirosPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [cardAtivo, setCardAtivo] = useState(2);
  const [modeloSelecionado, setModeloSelecionado] = useState("");

  useEffect(() => {
    window.dataLayer?.push({
      event: "view_page_content",
      content_category: "comercial",
      content_name: "pagina_parceria"
    });

    if (formRef.current) {
      formRef.current.reset();
    }
  }, []);

  const trackClick = (label: string, destination: string) => {
    window.dataLayer?.push({
      event: "click_conversion_button",
      button_label: label,
      destination_url: destination,
      page_location: "/parceria"
    });
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Não usamos e.preventDefault() para permitir que o form siga para o web3forms na nova aba target="_blank"

    window.dataLayer?.push({
      event: "partnership_proposal_submitted",
      form_name: "candidatura_parceiro"
    });

    const formData = new FormData(e.currentTarget);
    const email = formData.get("parceiro_email") as string;
    const nome = formData.get("parceiro_nome") as string;
    const wantsNewsletter = formData.get("newsletter") === "yes";

    // Se o parceiro aceitou a newsletter, enviamos os dados para a tabela correspondente no Supabase
    if (wantsNewsletter && email) {
      try {
        const { error } = await supabase.from("newsletter").insert([{
          email: email,
          nome: nome,
          status: "ativo"
        }]);

        if (error) {
          console.error("Erro ao inserir na newsletter:", error);
        }
      } catch (err) {
        console.error("Erro inesperado na gravação da newsletter:", err);
      }
    }
  };

  const frentes = [
    {
      title: "Afiliados Digitais",
      desc: "Divulgue a plataforma em seus canais e receba comissões recorrentes por cada nova assinatura convertida.",
      icon: <Target size={24} />,
      badgeDesktop: "Performance",
      badgeMobile: "Performance",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      link: "/indique",
      isDestaque: false
    },
    {
      title: "Integração & Tech",
      desc: "Conecte seu software à nossa API e crie uma solução financeira embarcada para seus próprios usuários.",
      icon: <Globe size={24} />,
      badgeDesktop: "Tecnologia",
      badgeMobile: "Tech",
      color: "text-blue-600",
      bg: "bg-blue-50",
      link: "/parceria/tecnologia",
      isDestaque: false
    },
    {
      title: "Consultoria Condominial",
      desc: "Oportunidade de Ouro: simplifique suas vendas com o nosso CRM. Acompanhe propostas, negociações e garanta comissões e receita recorrente com total previsibilidade.",
      icon: <Building2 size={24} />,
      badgeDesktop: "Produto Principal",
      badgeMobile: "Consultoria condominial",
      color: "text-amber-600",
      bg: "bg-amber-50",
      link: "/resultados-consultoria/consultoria-condominial",
      isDestaque: true
    }
  ];

  const proximoCard = () => {
    setCardAtivo(cardAtivo === frentes.length - 1 ? 0 : cardAtivo + 1);
  };

  const anteriorCard = () => {
    setCardAtivo(cardAtivo === 0 ? frentes.length - 1 : cardAtivo - 1);
  };

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">

      {/* BADGE SUPERIOR */}
      <div className="inline-flex items-center gap-2 text-blue-600 mb-4">
        <Zap size={18} className="fill-blue-600" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Partnership Program 2026</span>
      </div>

      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div className="flex-1">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Cresça com a <span className="text-blue-600">Nucleo.</span></span>
            <Handshake
              size={32}
              className="text-blue-600 opacity-35 ml-3"
              strokeWidth={2}
            />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium leading-relaxed mt-0 w-full">
            <span className="hidden md:inline">Inteligência em controle financeiro para agregar valor à sua rotina.</span>
            <span className="inline md:hidden">Inteligência para agregar valor à sua rotina.</span>
          </h2>
        </div>

        {/* MÉTRICAS RÁPIDAS - DESKTOP APENAS */}
        <div className="hidden md:flex gap-3 mt-4 md:mt-0 justify-end">
          <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center min-w-[100px]">
            <h4 className="text-xl font-black text-gray-900 leading-tight">30% +</h4>
            <p className="text-[7px] text-gray-400 font-black uppercase tracking-widest">Comissão</p>
          </div>
          <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center min-w-[100px]">
            <h4 className="text-xl font-black text-gray-900 leading-tight">Receita</h4>
            <p className="text-[7px] text-gray-400 font-black uppercase tracking-widest">Recorrente</p>
          </div>
          <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center min-w-[100px]">
            <h4 className="text-xl font-black text-gray-900 leading-tight">24h</h4>
            <p className="text-[7px] text-gray-400 font-black uppercase tracking-widest">Setup</p>
          </div>
        </div>
      </div>

      {/* MODELOS DE COLABORAÇÃO */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 md:mb-10 flex items-center gap-4">
        <span className="inline md:hidden">Parceria</span>
        <span className="hidden md:inline">Modelos de Colaboração</span>
        <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* MÉTRICAS RÁPIDAS - MOBILE APENAS (LOGO APÓS A LINHA "PARCERIA") */}
      <div className="flex md:hidden gap-3 mb-6 justify-center w-full">
        <div className="px-3 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center flex-1">
          <h4 className="text-lg font-black text-gray-900 leading-tight">30% +</h4>
          <p className="text-[7px] text-gray-400 font-black uppercase tracking-widest">Comissão</p>
        </div>
        <div className="px-3 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center flex-1">
          <h4 className="text-lg font-black text-gray-900 leading-tight">Receita</h4>
          <p className="text-[7px] text-gray-400 font-black uppercase tracking-widest">Recorrente</p>
        </div>
        <div className="px-3 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center flex-1">
          <h4 className="text-lg font-black text-gray-900 leading-tight">24h</h4>
          <p className="text-[7px] text-gray-400 font-black uppercase tracking-widest">Setup</p>
        </div>
      </div>

      {/* SEÇÃO CTA E FORMULÁRIO (FORMULÁRIO PRIMEIRO NO MOBILE) */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-stretch mb-24">

        {/* FORMULÁRIO COM TARGET _blank PARA ABRIR EM NOVA ABA (PRIMEIRO NO MOBILE, SEGUNDO NO DESKTOP VIA FLEX-COL-REVERSE / ORDEM NORMAL) */}
        <form
          ref={formRef}
          onSubmit={handleFormSubmit}
          action="https://api.web3forms.com/submit"
          method="POST"
          target="_blank"
          className="flex-1 w-full bg-white p-8 md:p-14 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative z-10 border border-gray-100 order-1 lg:order-2"
        >
          <input type="hidden" name="access_key" value="9ef5a274-150a-4664-a885-0b052efd06f7" />
          <input type="hidden" name="subject" value="Nova Candidatura de Parceiro - Nucleobase" />
          <input type="hidden" name="from_name" value="Nucleobase Parcerias" />

          {/* CONTEXTO DO FORMULÁRIO NO MOBILE & DESKTOP */}
          <div className="mb-8 text-center px-2">
            <p className="text-[13px] font-medium text-gray-500 leading-relaxed md:text-sm md:leading-loose">
              <span className="md:hidden">Preencha o formulário detalhando sua operação para iniciarmos nossa parceria.</span>
              <span className="hidden md:inline">Preencha o formulário abaixo detalhando sua operação para iniciarmos nossa parceria estratégica.</span>
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome/Empresa</label>
                <input name="parceiro_nome" required type="text" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 transition-all font-medium placeholder-gray-400" placeholder="Ex: Consultoria XYZ" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                <input name="parceiro_email" required type="email" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 transition-all font-medium placeholder-gray-400" placeholder="parcerias@empresa.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Modelo de Parceria</label>
              <select
                name="modelo_parceria"
                required
                value={modeloSelecionado}
                onChange={(e) => setModeloSelecionado(e.target.value)}
                className={`w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 text-sm transition-all font-medium appearance-none cursor-pointer ${modeloSelecionado ? "text-gray-900" : "text-gray-400"}`}
              >
                <option value="" disabled>Selecione a opção</option>
                <option value="Consultoria Estratégica" className="text-gray-900">Consultoria Estratégica</option>
                <option value="Afiliado / Indicação" className="text-gray-900">Afiliado / Indicação</option>
                <option value="Integração de Software (API)" className="text-gray-900">Integração de Software (API)</option>
                <option value="Outro modelo" className="text-gray-900">Outro modelo</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sua Operação</label>
              <textarea name="parceiro_motivacao" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 transition-all h-32 resize-none font-medium placeholder-gray-400" placeholder="Conte-nos brevemente como você propõe essa parceria com base em suas experiências..."></textarea>
            </div>

            <div className="flex items-center space-x-2 pt-2 pb-4">
              <input type="checkbox" id="newsletter" name="newsletter" value="yes" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="newsletter" className="text-[11px] font-medium text-gray-500 cursor-pointer">
                Desejo receber atualizações e novidades.
              </label>
            </div>

            <button type="submit" className="w-full relative bg-blue-600 text-white py-5 px-6 md:px-8 rounded-2xl font-black flex items-center justify-center md:gap-3 hover:bg-black transition-all shadow-xl shadow-blue-100 text-[11px] uppercase tracking-[0.2em] cursor-pointer">
              <Rocket size={18} className="hidden md:block shrink-0" />
              <span className="hidden md:inline">Enviar Proposta de Parceria</span>
              <span className="inline md:hidden">Enviar Proposta</span>
              <Rocket size={18} className="block md:hidden absolute right-6 shrink-0" />
            </button>
          </div>
        </form>

        {/* CARD CTA REDUZIDO (Oculto no mobile conforme solicitado) */}
        <div className="hidden lg:flex bg-gray-900 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 flex-1 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 order-2 lg:order-1 flex-col">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 blur-[120px] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-blue-600/20">
              <Sparkles size={24} className="md:size-[30px]" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 md:mb-8 tracking-tight leading-tight">Pronto para o<br />próximo passo?</h2>
            <ul className="space-y-4 md:space-y-6 mb-8 md:mb-12">
              {[
                { desktop: "Suporte dedicado de Key Account", mobile: "Suporte Account dedicado" },
                { desktop: "Material de marketing (White-label)", mobile: "Material de marketing" },
                { desktop: "Acesso antecipado a novas features", mobile: "Acesso antecipado a novidades" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 md:gap-4 text-gray-300 text-base md:text-lg font-medium">
                  <CheckCircle size={18} className="text-blue-500 flex-shrink-0 md:size-[22px]" />
                  <span className="hidden md:inline">{item.desktop}</span>
                  <span className="inline md:hidden">{item.mobile}</span>
                </li>
              ))}
            </ul>
            <div className="p-6 md:p-8 bg-white/5 rounded-2xl md:rounded-[2rem] border border-white/10 backdrop-blur-sm text-center md:text-left">
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-3">Visão Nucleo</p>
              <p className="text-gray-300 italic text-base md:text-lg leading-relaxed font-light">
                "Buscamos parceiros que buscam transformar processos e pessoas."
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* LINHA DIVISÓRIA E CONTEXTO "CONSULTORIA" (VISÍVEL APENAS NO MOBILE) */}
      <div className="md:hidden mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px bg-gray-300 flex-1"></div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
            Consultoria
          </h3>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>
        {/* Contexto breve antes dos cards no mobile */}
        <p className="text-center text-sm font-medium text-gray-500 px-4 leading-relaxed">
          Navegue pelas oportunidades e descubra como integrar suas soluções ou serviços com a plataforma.
        </p>
      </div>

      {/* LINHA DIVISÓRIA "OPORTUNIDADES" (VISÍVEL APENAS NO DESKTOP) */}
      <div className="hidden md:flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-300 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Oportunidades
        </h3>
        <div className="h-px bg-gray-300 flex-1"></div>
      </div>

      {/* CARDS DAS FRENTES ABAIXO DO FORMULÁRIO E DO CTA */}
      <div className="relative mb-24">

        <div className="w-full md:grid md:grid-cols-3 gap-8 flex items-stretch justify-center px-0 md:px-0">
          {frentes.map((frente, idx) => {
            const isDestaque = frente.isDestaque;

            return (
              <div key={idx} className={`w-full md:h-full flex-1 ${cardAtivo === idx ? 'flex animate-in fade-in zoom-in-95 duration-300' : 'hidden'} md:flex md:animate-none`}>
                <Link
                  href={frente.link}
                  onClick={() => trackClick(`Parceria - ${frente.title}`, frente.link)}
                  className={`block w-full group p-10 rounded-[3rem] transition-all duration-500 relative overflow-hidden cursor-pointer flex flex-col justify-between
                    ${isDestaque
                      ? "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl shadow-amber-500/20 md:-translate-y-2 md:scale-[1.02] border border-amber-400 z-10"
                      : "bg-white border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5 text-gray-900"
                    }
                  `}
                >
                  {/* Efeito luminoso de fundo para o destaque */}
                  {isDestaque && (
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none group-hover:bg-white/30 transition-all duration-700"></div>
                  )}

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      {/* ÍCONE (Oculto no destaque mobile) */}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm
                        ${isDestaque ? "bg-white/20 text-white backdrop-blur-sm hidden md:flex" : `${frente.bg} ${frente.color} flex`}
                      `}>
                        {isDestaque ? <Building2 size={24} /> : frente.icon}
                      </div>

                      {/* BADGE (Estilização difere no mobile para o destaque) */}
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full whitespace-nowrap
                        ${isDestaque ? "md:bg-white/20 md:text-white md:backdrop-blur-sm md:shadow-sm text-amber-500 bg-white" : "text-emerald-600 bg-emerald-50"}
                      `}>
                        {isDestaque && <Star size={10} className="fill-white shrink-0 hidden md:inline" />}
                        <span className="hidden md:inline">{frente.badgeDesktop}</span>
                        <span className="inline md:hidden">{frente.badgeMobile}</span>
                      </span>
                    </div>

                    <h3 className={`text-2xl font-bold mb-4 tracking-tight flex items-center gap-2
                      ${isDestaque ? "text-white" : "text-gray-900"}
                    `}>
                      {/* Título oculto no destaque mobile já que virou o badge, mantido nas outras frentes */}
                      <span className={isDestaque ? "hidden md:inline" : ""}>{frente.title}</span>
                      <ArrowRight size={20} className={`${isDestaque ? "text-amber-100" : "text-emerald-500"} opacity-0 group-hover:opacity-100 transition-all hidden md:block`} />
                    </h3>

                    <p className={`text-base leading-relaxed mb-0 font-medium italic
                      ${isDestaque ? "text-amber-50" : "text-gray-500"}
                    `}>
                      {frente.desc}
                    </p>
                  </div>

                  {/* Acessar frente oculto no desktop para limpar o visual */}
                  <div className={`md:hidden pt-6 mt-6 border-t relative z-10 flex items-center justify-between
                    ${isDestaque ? "border-amber-400/50" : "border-gray-50"}
                  `}>
                    <span className={`text-[11px] font-bold uppercase tracking-wider
                      ${isDestaque ? "text-white" : "text-gray-900"}
                    `}>
                      Acessar
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                      ${isDestaque
                        ? "bg-white/20 text-white group-hover:bg-white group-hover:text-amber-600"
                        : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                      }
                    `}>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* SETAS MOBILE POSICIONADAS ABAIXO DOS CARDS */}
        <div className="md:hidden flex justify-center items-center gap-6 mt-6">
          <button onClick={anteriorCard} className="bg-white shadow-lg border border-gray-100 text-blue-600 p-3 rounded-full active:scale-90 transition-all cursor-pointer">
            <ChevronLeft size={24} />
          </button>

          {/* Indicador visual de qual card está ativo */}
          <div className="flex gap-2">
            {frentes.map((_, idx) => (
              <div key={idx} className={`h-1.5 rounded-full transition-all ${cardAtivo === idx ? "w-6 bg-blue-600" : "w-2 bg-gray-200"}`} />
            ))}
          </div>

          <button onClick={proximoCard} className="bg-white shadow-lg border border-gray-100 text-blue-600 p-3 rounded-full active:scale-90 transition-all cursor-pointer">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* LINHA DIVISÓRIA "CONECTE-SE" */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM */}
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
          onClick={() => trackClick("Instagram - Parceria", "https://www.instagram.com/nucleobase.app/")}
          className="group relative flex flex-col items-center gap-6 cursor-pointer"
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

      <p className="text-center mt-12 text-gray-400 text-[10px] font-medium italic uppercase tracking-widest">
        Nucleobase Partnership Program — Transformando dados em alianças estratégicas.
      </p>
    </div>
  );
}