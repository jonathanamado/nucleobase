// app/ecossistema/page.tsx
"use client";

import React, { useEffect } from "react";
import {
    Sparkles, Layers, Wallet, Building2, ShieldCheck, Cpu,
    ArrowRight, ArrowLeft, CheckCircle2, Globe, HeartHandshake
} from "lucide-react";

export default function EcossistemaNucleobase() {
    useEffect(() => {
        window.dataLayer?.push({
            event: "view_page_content",
            content_category: "ecossistema",
            content_name: "pagina_ecossistema"
        });
    }, []);

    const trackClick = (label: string, destination: string) => {
        window.dataLayer?.push({
            event: "click_conversion_button",
            button_label: label,
            destination_url: destination,
            page_location: "/ecossistema"
        });
    };

    const modulosExistentes = [
        {
            id: "orcamento-domestico",
            title: "Controle de Orçamento Doméstico",
            subtitle: "Lançamentos financeiros inteligentes",
            description: "Plataforma desenvolvida para transformar a gestão financeira pessoal e familiar em uma experiência automatizada, clara e estratégica. Controle despesas, receitas e fluxo de caixa com visão multicanal e previsibilidade em tempo real.",
            icon: <Wallet size={24} className="text-blue-600" />,
            tag: "Módulo Ativo",
            features: [
                "Visão consolidada e por fontes (conta corrente e cartão)",
                "Fluxo de caixa comparativo (Mês Fatura vs. Data Compra)",
                "Análise preditiva de tendências financeiras"
            ]
        },
        {
            id: "gestao-condominial",
            title: "Gestão Condominial",
            subtitle: "Digitalização de processos",
            description: "Solução voltada para a modernização e eficiência na administração de condomínios. Centraliza demandas operacionais, comunicação e controle de fluxos internos, garantindo agilidade e transparência para gestores e moradores.",
            icon: <Building2 size={24} className="text-blue-600" />,
            tag: "Módulo Ativo",
            features: [
                "Digitalização completa de rotinas e chamados",
                "Interface unificada para controle estrutural",
                "Paisagismo e otimização de áreas comuns"
            ]
        }
    ];

    const pilaresTecnologicos = [
        {
            title: "Organização começa pela base",
            desc: "Princípio fundamental de que a estruturação precede o crescimento escalável.",
            icon: <Layers size={20} className="text-blue-600" />
        },
        {
            title: "Inteligência Aplicada",
            desc: "Uso de tecnologia orientada a dados para simplificar tomadas de decisão.",
            icon: <Cpu size={20} className="text-blue-600" />
        },
        {
            title: "Segurança e Confiabilidade",
            desc: "Arquitetura robusta voltada para a proteção e privacidade de informações.",
            icon: <ShieldCheck size={20} className="text-blue-600" />
        }
    ];

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-8 bg-[#FAFAFA] min-h-screen">
            {/* Header da Página */}
            <header className="flex flex-col mb-8 pt-6 md:pt-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Nucleobase Intelligence</span>
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
                            <span>Ecossistema<span className="text-blue-600">.</span></span>
                            <Sparkles size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm md:text-base font-medium max-w-2xl">
                        Conheça a estrutura integrada de soluções desenvolvidas para trazer clareza estratégica, automação e eficiência para o seu dia a dia.
                    </p>
                </div>
            </header>

            {/* Seção Principal - Módulos Existentes */}
            <div className="mb-12">
                <div className="flex items-center gap-6 mb-8">
                    <div className="h-px bg-gray-100 flex-1"></div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 whitespace-nowrap">Módulos Existentes</h3>
                    <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {modulosExistentes.map((modulo) => (
                        <div
                            key={modulo.id}
                            className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-10 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-4 bg-blue-50 rounded-2xl shadow-inner">
                                        {modulo.icon}
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
                                        {modulo.tag}
                                    </span>
                                </div>

                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">{modulo.subtitle}</p>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">{modulo.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                                    {modulo.description}
                                </p>

                                <div className="space-y-2.5 pt-4 border-t border-gray-50">
                                    {modulo.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-xs text-gray-700 font-bold">
                                            <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span>Tecnologia Nucleobase</span>
                                <span className="text-blue-600 flex items-center gap-1">Integrado <Globe size={12} /></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Seção de Pilares */}
            <div className="mb-16">
                <div className="flex items-center gap-6 mb-8">
                    <div className="h-px bg-gray-100 flex-1"></div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 whitespace-nowrap">Nossos Pilares</h3>
                    <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {pilaresTecnologicos.map((pilar, index) => (
                        <div key={index} className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm flex flex-col justify-center text-center items-center">
                            <div className="p-3 bg-blue-50 rounded-xl mb-4">{pilar.icon}</div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-2">{pilar.title}</h4>
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">{pilar.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Banner de Contexto / Rodapé da página */}
            <div className="relative overflow-hidden bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="max-w-xl text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Organização começa pela base<span className="text-blue-600">.</span></h3>
                    <p className="text-gray-500 leading-relaxed text-sm md:text-base font-medium opacity-80">
                        Nosso ecossistema unifica ferramentas digitais de alto desempenho para simplificar operações complexas, unindo finanças e gestão em um único ambiente.
                    </p>
                </div>
                <div className="w-full md:w-auto flex flex-col gap-2 items-center md:items-end">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <HeartHandshake size={14} className="text-blue-600" /> Soluções integradas
                    </div>
                    <a
                        href="/cadastro"
                        onClick={() => trackClick("Criar Conta - Ecossistema", "/cadastro")}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg cursor-pointer"
                    >
                        Criar conta <ArrowRight size={16} />
                    </a>
                </div>
            </div>
        </div>
    );
}