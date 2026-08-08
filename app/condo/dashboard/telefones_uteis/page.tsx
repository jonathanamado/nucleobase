// app/condo/dashboard/telefones_uteis/page.tsx
"use client";
import React from "react";
import Link from "next/link";
import { PhoneCall, ArrowLeft, Instagram, Construction } from "lucide-react";

export default function TelefonesUteisPage() {
    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-6 md:p-10 flex flex-col justify-between">
            <div>
                {/* CABEÇALHO COM BOTÃO VOLTAR */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                            <PhoneCall size={24} />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Suporte e Emergência</span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1 text-zinc-900">Telefones úteis</h1>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <Link
                            href="/condo/dashboard"
                            className="flex items-center gap-2 h-10 px-4 bg-zinc-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm cursor-pointer"
                        >
                            <ArrowLeft size={14} /> Voltar ao Início
                        </Link>
                    </div>
                </div>

                {/* CONTEÚDO PRINCIPAL (EM DESENVOLVIMENTO) */}
                <div className="max-w-4xl mx-auto my-12 bg-white border border-zinc-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm text-center space-y-6">
                    <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                        <Construction size={32} />
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-sky-600 uppercase tracking-[0.3em]">Em fase de elaboração</span>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900">Estamos construindo este espaço para você</h2>
                        <p className="text-sm text-zinc-500 max-w-lg mx-auto leading-relaxed">
                            Em breve, os ramais da portaria, contatos de manutenção, prestadores autorizados e números de emergência estarão disponíveis aqui.
                        </p>
                    </div>

                    <div className="pt-4">
                        <Link
                            href="/condo/dashboard"
                            className="inline-flex items-center justify-center h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                        >
                            Retornar ao Painel
                        </Link>
                    </div>
                </div>
            </div>

            {/* RODAPÉ PADRÃO INSTAGRAM */}
            <div>
                <div className="mt-24 flex items-center gap-4 mb-12">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

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