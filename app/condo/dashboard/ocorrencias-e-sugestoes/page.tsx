// app/condo/dashboard/ocorrencias-e-sugestoes/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
    Building2,
    Loader2,
    ArrowLeft,
    Instagram,
    Wrench,
    Sparkles,
    ShieldAlert
} from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserMemberData {
    role: string;
    condominio: {
        nome: string;
    };
}

export default function OcorrenciasSugestoesPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [memberData, setMemberData] = useState<UserMemberData | null>(null);

    const verifyAccess = async () => {
        try {
            setLoading(true);

            const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !currentSession) {
                setSession(null);
                setMemberData(null);
                setLoading(false);
                return;
            }

            setSession(currentSession);
            const userId = currentSession.user.id;

            const { data, error } = await supabase
                .from("condominio_membros")
                .select(`
                    role,
                    acesso_app,
                    condominio:condominios ( nome )
                `)
                .eq("user_id", userId)
                .eq("acesso_app", true)
                .order("role", { ascending: false })
                .order("criado_em", { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                setMemberData(data[0] as unknown as UserMemberData);
            } else {
                setMemberData(null);
            }
        } catch (e) {
            console.error("Erro ao verificar acesso:", e);
            setMemberData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifyAccess();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                await verifyAccess();
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setMemberData(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando painel...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-[2.5rem] text-center space-y-4 shadow-sm">
                    <h1 className="text-xl font-black text-zinc-900">Acesso restrito</h1>
                    <p className="text-sm text-zinc-500">Faça login na plataforma para visualizar o módulo de ocorrências.</p>
                    <Link href="/condo/dashboard" className="inline-block bg-zinc-900 hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                        Ir para Login
                    </Link>
                </div>
            </div>
        );
    }

    if (session && !memberData) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-[2.5rem] text-center space-y-4 shadow-sm">
                    <div className="mx-auto w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-2">
                        <ShieldAlert size={24} />
                    </div>
                    <h1 className="text-xl font-black text-zinc-900">Sem vínculo ativo</h1>
                    <p className="text-sm text-zinc-500">
                        Seu perfil não possui acesso liberado neste condomínio no momento.
                    </p>
                    <Link href="/condo/dashboard" className="inline-block bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors mt-2">
                        Voltar ao Início
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 pt-6 px-6 md:px-10 flex flex-col justify-between">
            {/* Header */}
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                        {memberData?.condominio?.nome || "Módulo Condominial"}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">Ocorrências e Sugestões</h1>
                            </div>
                        </div>

                        {/* Botão de Voltar Minimalista Premium */}
                        <button
                            onClick={() => window.history.back()}
                            className="group relative flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 self-start md:self-auto overflow-hidden"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                            <ArrowLeft
                                size={12}
                                className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out"
                            />
                            <span>Voltar</span>
                        </button>
                    </div>
                </div>

                {/* Conteúdo Em Construção (Compacto para ajuste viewport principal) */}
                <div className="max-w-2xl mx-auto py-4 md:py-6 text-center">
                    <div className="bg-white border border-zinc-200 px-6 py-8 md:px-12 md:py-10 rounded-[2.5rem] shadow-sm space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10 opacity-60"></div>

                        <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <Wrench size={30} className="animate-pulse" />
                        </div>

                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.25em] bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                                <Sparkles size={10} /> Em desenvolvimento
                            </span>
                            <h2 className="text-xl md:text-3xl font-black tracking-tight text-zinc-950">Estamos em fase de construção</h2>
                            <p className="text-xs md:text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                                Esta seção da plataforma está sendo estruturada para trazer total transparência e controle financeiro integrado ao seu condomínio.
                            </p>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => window.history.back()}
                                className="bg-zinc-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md"
                            >
                                Retornar ao Painel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rodapé / Conecte-se */}
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <div className="flex flex-col items-center text-center pb-6">
                    <a
                        href="https://www.instagram.com/nucleobase.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex flex-col items-center gap-4"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500"></div>

                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[1.8rem] md:rounded-[2rem] flex items-center justify-center text-white shadow-xl relative z-10 group-hover:rotate-6 transition-all duration-500">
                                <Instagram className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-pink-500 transition-colors">@nucleobase.app</span>
                            <div className="h-1 w-0 bg-pink-500 mt-1.5 group-hover:w-full transition-all duration-500 rounded-full"></div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}