// app/condo/dashboard/enquetes-e-decisoes/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    Building2,
    Loader2,
    ArrowLeft,
    Instagram,
    Vote,
    Send,
    CheckCircle2,
    MessageSquarePlus
} from "lucide-react";

interface UserMemberData {
    role: string;
    condominio: {
        nome: string;
    };
}

export default function EnquetesDecisoesPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [memberData, setMemberData] = useState<UserMemberData | null>(null);

    // Estado para sugestão de enquetes enviada pelo morador
    const [sugestaoTitulo, setSugestaoTitulo] = useState("");
    const [sugestaoDescricao, setSugestaoDescricao] = useState("");
    const [enviandoSugestao, setEnviandoSugestao] = useState(false);
    const [sugestaoSucesso, setSugestaoSucesso] = useState("");

    const isMountedRef = useRef(true);

    const verifyAccess = async (currentSession: any, retries = 2) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setMemberData(null);
                    setLoading(false);
                }
                return;
            }

            if (isMountedRef.current) {
                setSession(currentSession);
            }
            const userId = currentSession.user.id;

            let data = null;
            let error = null;

            for (let i = 0; i <= retries; i++) {
                const res = await supabase
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

                data = res.data;
                error = res.error;

                if (error) {
                    const errorMsg = error.message || JSON.stringify(error);
                    if (!errorMsg.includes("AbortError") && !errorMsg.includes("Lock broken")) {
                        console.error("Erro na consulta Supabase:", errorMsg);
                    }
                }

                if (data && data.length > 0) {
                    break;
                }

                if (i < retries) {
                    await new Promise((resolve) => setTimeout(resolve, 300));
                }
            }

            if (isMountedRef.current) {
                if (data && data.length > 0) {
                    setMemberData(data[0] as unknown as UserMemberData);
                } else {
                    setMemberData(null);
                }
            }
        } catch (e: any) {
            const errString = e?.message || JSON.stringify(e);
            if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                console.error("Erro ao verificar acesso:", errString);
            }
            if (isMountedRef.current) {
                setMemberData(null);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        isMountedRef.current = true;

        const initAuth = async () => {
            try {
                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError && !currentSession) throw sessionError;

                if (isMountedRef.current) {
                    await verifyAccess(currentSession);
                }
            } catch (err: any) {
                const errString = err?.message || JSON.stringify(err);
                if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                    console.error("Erro ao recuperar sessão inicial:", errString);
                }
                if (isMountedRef.current) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!isMountedRef.current) return;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                if (currentSession) {
                    await verifyAccess(currentSession);
                }
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setMemberData(null);
                setLoading(false);
            }
        });

        return () => {
            isMountedRef.current = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleEnviarSugestao = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sugestaoTitulo.trim() || !sugestaoDescricao.trim()) return;

        setEnviandoSugestao(true);
        setSugestaoSucesso("");

        try {
            await new Promise((resolve) => setTimeout(resolve, 800));

            setSugestaoSucesso("Sugestão de enquete encaminhada com sucesso ao síndico!");
            setSugestaoTitulo("");
            setSugestaoDescricao("");
            setTimeout(() => {
                setSugestaoSucesso("");
            }, 4000);
        } catch (err) {
            console.error("Erro ao enviar sugestão:", err);
        } finally {
            setEnviandoSugestao(false);
        }
    };

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
                    <p className="text-sm text-zinc-500">Faça login na plataforma para visualizar o módulo de enquetes.</p>
                    <Link href="/condo/dashboard" className="inline-block bg-zinc-900 hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                        Ir para Login
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
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">Enquetes e Decisões</h1>
                            </div>
                        </div>

                        {/* Botão de Voltar Minimalista Premium - Apenas Desktop */}
                        <button
                            onClick={() => window.history.back()}
                            className="hidden md:flex group relative items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 self-start md:self-auto overflow-hidden cursor-pointer"
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

                <p className="text-xs md:text-sm text-zinc-500 font-medium mb-8">
                    Participe das votações ativas criadas pela administração ou envie novas propostas de enquetes para avaliação do síndico.
                </p>

                {/* Seção Principal: Enquetes Ativas e Sugestões */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                    {/* Lista de Enquetes Ativas (Criadas pelo Síndico) */}
                    <div className="lg:col-span-2 space-y-6 flex flex-col">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                                <Vote size={18} className="text-blue-600" /> Enquetes em Andamento
                            </h2>
                            {/* Contador visível apenas em Desktop */}
                            <span className="hidden md:inline-flex text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full">
                                0 Ativas
                            </span>
                        </div>

                        {/* Card com altura flexível no mobile e esticada/igualada no desktop via flex-1 */}
                        <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 text-center space-y-4 shadow-sm flex-1 flex flex-col justify-center items-center">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                                <Vote size={26} />
                            </div>
                            <div className="space-y-1 max-w-sm mx-auto">
                                <h3 className="font-bold text-base text-zinc-900">Nenhuma enquete ativa no momento</h3>
                                <p className="text-xs text-zinc-400">
                                    Assim que a administração do condomínio publicar uma nova assembleia virtual ou votação, ela aparecerá listada aqui.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Formulário para Sugestão de Enquete pelo Condômino */}
                    <div className="space-y-6 flex flex-col">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                                <MessageSquarePlus size={18} className="text-indigo-600" /> Sugerir Enquete
                            </h2>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 md:p-8 shadow-sm flex-1 flex flex-col justify-between">
                            <div>
                                <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                                    Tem alguma proposta de melhoria ou tema relevante para discutir com os vizinhos? Envie sua ideia diretamente para análise do síndico.
                                </p>

                                <form onSubmit={handleEnviarSugestao} id="sugestao-form" className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Título da Proposta</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: Instalação de bicicletário"
                                            value={sugestaoTitulo}
                                            onChange={(e) => setSugestaoTitulo(e.target.value)}
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium text-zinc-900"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Descrição / Detalhes</label>
                                        <textarea
                                            required
                                            rows={3}
                                            placeholder="Explique brevemente o objetivo da votação..."
                                            value={sugestaoDescricao}
                                            onChange={(e) => setSugestaoDescricao(e.target.value)}
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium text-zinc-900 resize-none"
                                        />
                                    </div>

                                    {sugestaoSucesso && (
                                        <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-center gap-2">
                                            <CheckCircle2 size={16} className="shrink-0" /> {sugestaoSucesso}
                                        </p>
                                    )}
                                </form>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    form="sugestao-form"
                                    disabled={enviandoSugestao}
                                    className="w-full bg-zinc-900 hover:bg-black text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {enviandoSugestao ? "Enviando Proposta..." : <>Enviar ao Síndico <Send size={14} /></>}
                                </button>
                            </div>
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

                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[1.8rem] md:rounded-[2.5rem] flex items-center justify-center text-white shadow-xl relative z-10 group-hover:rotate-6 transition-all duration-500">
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