// app/condo/dashboard/boletos-segunda-via/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
    Loader2,
    ArrowLeft,
    Instagram,
    ShieldAlert,
    FileText,
    Calendar,
    Send,
    CheckCircle2,
    Edit3
} from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: 'nucleo_condo_auth_session', // Chave isolada para blindagem contra lock broken
        },
    }
);

interface UserMemberData {
    role: string;
    condominio: {
        nome: string;
    } | null;
}

export default function BoletosSegundaViaPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [memberData, setMemberData] = useState<UserMemberData | null>(null);

    // Estado para o mês selecionado
    const [mesSelecionado, setMesSelecionado] = useState<string>("");

    // Estado para controlar se o usuário selecionou a opção de personalizar
    const [modoPersonalizado, setModoPersonalizado] = useState(false);

    // Estados para seleção fixa tipo calendário (Mês e Ano)
    const [mesEscolhidoCustom, setMesEscolhidoCustom] = useState<string>("Janeiro");
    const [anoEscolhidoCustom, setAnoEscolhidoCustom] = useState<string>("2026");

    const isMountedRef = useRef(true);

    const mesesDisponiveis = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const anosDisponiveis = ["2024", "2025", "2026", "2027"];

    // Últimos 6 meses no formato "Mês Abreviado/Ano" (Ex: Fev/26 até Jul/26)
    const ultimosSeisMeses = [
        "Fev/26",
        "Mar/26",
        "Abr/26",
        "Mai/26",
        "Jun/26",
        "Jul/26"
    ];

    // Verificação robusta de sessão padronizada com o modelo de moradores e retentativa contra race conditions
    const loadDadosCondominio = async (currentSession: any, retries = 2) => {
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
                    await loadDadosCondominio(currentSession);
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
                    await loadDadosCondominio(currentSession);
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

    const handleSolicitarWhatsApp = (e: React.MouseEvent) => {
        e.preventDefault();

        const mesAlvo = modoPersonalizado ? `${mesEscolhidoCustom} de ${anoEscolhidoCustom}` : mesSelecionado;
        if (!mesAlvo) return;

        const nomeCondominio = memberData?.condominio?.nome || "Condomínio";
        let mensagem = `Olá, Administração do *${nomeCondominio}*!\n\n`;
        mensagem += `Estou entrando em contato para solicitar a emissão da 2ª via do boleto referente ao mês de *${mesAlvo}*.\n\n`;
        mensagem += `Aguardo orientações. Obrigado(a)!`;

        const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
        const newWindow = window.open(urlWhatsApp, '_blank');
        if (newWindow) newWindow.opener = null;
    };

    // --- RENDERS DE AUTENTICAÇÃO ---

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
                    <p className="text-sm text-zinc-500">Faça login na plataforma para visualizar o módulo de boletos.</p>
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

    // --- RENDER PRINCIPAL (AUTORIZADO) ---

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-6 md:p-10 flex flex-col justify-between">
            <div className="max-w-4xl mx-auto w-full space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <FileText size={24} />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Boletos (2ª via)</span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1 text-zinc-900">
                                {memberData?.condominio?.nome || "Meu Condomínio"}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => window.history.back()}
                        className="group relative hidden md:flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 self-start md:self-auto overflow-hidden cursor-pointer"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                        <ArrowLeft
                            size={12}
                            className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out"
                        />
                        <span>Voltar</span>
                    </button>
                </div>

                <div>
                    <p className="text-xs md:text-sm text-zinc-500 font-medium">
                        Selecione o mês em que precisa da reemissão do boleto para solicitar a 2ª via diretamente à administração.
                    </p>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Período de Referência</span>
                            <h3 className="text-xs md:text-sm font-black text-zinc-800">Selecione um mês abaixo ou personalize o pedido</h3>
                        </div>

                        <div className="flex justify-end shrink-0">
                            <button
                                onClick={() => setModoPersonalizado(!modoPersonalizado)}
                                className={`px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${modoPersonalizado
                                        ? "bg-blue-50 border-blue-500 text-blue-900 shadow-sm"
                                        : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                    }`}
                            >
                                <Edit3 size={15} className={modoPersonalizado ? "text-blue-600" : "text-zinc-400"} />
                                <span>{modoPersonalizado ? "Usar Recentes" : "Outro Mês"}</span>
                            </button>
                        </div>
                    </div>

                    {modoPersonalizado ? (
                        <div className="bg-zinc-50/80 border border-zinc-200 rounded-3xl p-6 space-y-4 animate-in fade-in duration-200">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Seleção de Mês e Ano (Calendário)</span>
                                <p className="text-xs text-zinc-500 font-medium ml-1">Escolha abaixo o mês e o ano correspondente ao boleto desejado.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Mês</label>
                                    <select
                                        value={mesEscolhidoCustom}
                                        onChange={(e) => setMesEscolhidoCustom(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:border-blue-500 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
                                    >
                                        {mesesDisponiveis.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Ano</label>
                                    <select
                                        value={anoEscolhidoCustom}
                                        onChange={(e) => setAnoEscolhidoCustom(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:border-blue-500 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
                                    >
                                        {anosDisponiveis.map((a) => (
                                            <option key={a} value={a}>{a}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {ultimosSeisMeses.map((mes) => {
                                const selecionado = mesSelecionado === mes;
                                return (
                                    <button
                                        key={mes}
                                        onClick={() => setMesSelecionado(mes)}
                                        className={`p-3.5 md:p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center items-center justify-between cursor-pointer text-center md:text-left ${selecionado
                                                ? "bg-blue-50/80 border-blue-500 text-blue-900 shadow-sm ring-1 ring-blue-500/20"
                                                : "bg-zinc-50/60 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300"
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center items-center gap-2 md:gap-3 min-w-0 w-full">
                                            <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selecionado ? "bg-blue-600 text-white" : "bg-white text-zinc-400 border border-zinc-200"
                                                }`}>
                                                <Calendar size={15} />
                                            </div>
                                            <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider truncate w-full text-center md:text-left">{mes}</span>
                                        </div>
                                        {selecionado && <CheckCircle2 size={16} className="text-blue-600 shrink-0 hidden md:block ml-2" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-zinc-500 text-center sm:text-left">
                            {modoPersonalizado ? (
                                <span>Mês personalizado: <strong className="text-zinc-900">{mesEscolhidoCustom} de {anoEscolhidoCustom}</strong></span>
                            ) : mesSelecionado ? (
                                <span>Mês selecionado: <strong className="text-zinc-900">{mesSelecionado}</strong></span>
                            ) : (
                                <span className="text-amber-600 font-medium">Nenhum mês selecionado no momento.</span>
                            )}
                        </div>

                        <button
                            onClick={handleSolicitarWhatsApp}
                            disabled={modoPersonalizado ? false : !mesSelecionado}
                            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                            <Send size={14} /> Solicitar via WhatsApp
                        </button>
                    </div>
                </div>

                <div className="mt-24 flex items-center gap-4 mb-12">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <div className="flex flex-col items-center text-center pb-6">
                    <div className="max-w-3xl mb-12">
                        <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
                            Fique por dentro <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
                        </h4>
                        <p className="text-gray-500 font-medium text-sm md:text-base">
                            Dicas de gestão inteligente, novidades do sistema e conteúdos exclusivos no nosso Instagram.
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