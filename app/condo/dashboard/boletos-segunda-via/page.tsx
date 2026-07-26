// app/condo/dashboard/boletos-segunda-via/page.tsx
"use client";
import React, { useState, useEffect } from "react";
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
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserMemberData {
    role: string;
    condominio: {
        nome: string;
    };
}

export default function BoletosSegundaViaPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [memberData, setMemberData] = useState<UserMemberData | null>(null);

    // Estado para o mês selecionado
    const [mesSelecionado, setMesSelecionado] = useState<string>("");

    // Estado para controlar se o usuário selecionou a opção de personalizar
    const [modoPersonalizado, setModoPersonalizado] = useState(false);
    const [mesCustomizadoInput, setMesCustomizadoInput] = useState("");

    // Últimos 6 meses no formato "Mês Abreviado/Ano" (Ex: Fev/26 até Jul/26)
    const ultimosSeisMeses = [
        "Fev/26",
        "Mar/26",
        "Abr/26",
        "Mai/26",
        "Jun/26",
        "Jul/26"
    ];

    // Verificação robusta de sessão padronizada com o modelo de moradores
    const loadDadosCondominio = async (currentSession: any) => {
        try {
            if (!currentSession) {
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
        let isMounted = true;

        const initAuth = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                if (isMounted) {
                    await loadDadosCondominio(initialSession);
                }
            } catch (err) {
                console.error("Erro ao recuperar sessão inicial:", err);
                if (isMounted) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (isMounted) {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                    await loadDadosCondominio(currentSession);
                } else if (event === 'SIGNED_OUT') {
                    setSession(null);
                    setMemberData(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleSolicitarWhatsApp = () => {
        const mesAlvo = modoPersonalizado ? mesCustomizadoInput.trim() : mesSelecionado;
        if (!mesAlvo) return;

        const nomeCondominio = memberData?.condominio?.nome || "Condomínio";
        let mensagem = `Olá, Administração do *${nomeCondominio}*!\n\n`;
        mensagem += `Estou entrando em contato para solicitar a emissão da 2ª via do boleto referente ao mês de *${mesAlvo}*.\n\n`;
        mensagem += `Aguardo orientações. Obrigado(a)!`;

        const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
        window.open(urlWhatsApp, '_blank');
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
            <div className="max-w-4xl mx-auto w-full space-y-8">
                {/* Header Integrado com o Padrão do Modelo */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <FileText size={24} />
                        </div>
                        <div>
                            {/* Linha 1: Título no modelo azul */}
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Boletos - Apoio emissão 2ª via</span>
                            {/* Linha 2: Nome do Condomínio na cor preta */}
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

                {/* Subtítulo descritivo e Botão "Outro mês" na linha abaixo, alinhado à direita */}
                <div className="space-y-3">
                    <p className="text-xs md:text-sm text-zinc-500 font-medium">
                        Selecione abaixo o mês em que precisa da reemissão do boleto (por atraso ou perda) para solicitar o documento diretamente à administração.
                    </p>

                    <div className="flex justify-end">
                        <button
                            onClick={() => setModoPersonalizado(true)}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${modoPersonalizado
                                    ? "bg-blue-50 border-blue-500 text-blue-900 shadow-sm"
                                    : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                }`}
                        >
                            <Edit3 size={15} className={modoPersonalizado ? "text-blue-600" : "text-zinc-400"} />
                            <span>Outro Mês</span>
                        </button>
                    </div>

                    {/* Campo de input exibido se o usuário clicar em "Outro Mês" */}
                    {modoPersonalizado && (
                        <div className="bg-white border border-zinc-200 rounded-[2rem] p-5 shadow-sm space-y-2 animate-in fade-in duration-200">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Digite o mês e ano desejado</label>
                            <input
                                type="text"
                                placeholder="Ex: Dezembro de 2025 ou 11/2025"
                                value={mesCustomizadoInput}
                                onChange={(e) => setMesCustomizadoInput(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 text-xs font-medium"
                            />
                        </div>
                    )}
                </div>

                {/* Layout Moderno e Minimalista para os Meses */}
                <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-6">
                    {/* Grid ajustado: 2 colunas no mobile (grid-cols-2) e 3 colunas no desktop (md:grid-cols-3) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {ultimosSeisMeses.map((mes) => {
                            const selecionado = !modoPersonalizado && mesSelecionado === mes;
                            return (
                                <button
                                    key={mes}
                                    onClick={() => {
                                        setModoPersonalizado(false);
                                        setMesSelecionado(mes);
                                    }}
                                    className={`p-3.5 md:p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center items-center justify-between cursor-pointer text-center md:text-left ${selecionado
                                            ? "bg-blue-50/80 border-blue-500 text-blue-900 shadow-sm ring-1 ring-blue-500/20"
                                            : "bg-zinc-50/60 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300"
                                        }`}
                                >
                                    {/* Versão Mobile: ícone em cima, texto em baixo centralizados. Versão Desktop: lado a lado */}
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

                    {/* Rodapé do Card de Seleção e Ação do WhatsApp */}
                    <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-zinc-500 text-center sm:text-left">
                            {modoPersonalizado ? (
                                mesCustomizadoInput.trim() ? (
                                    <span>Mês personalizado: <strong className="text-zinc-900">{mesCustomizadoInput}</strong></span>
                                ) : (
                                    <span className="text-amber-600 font-medium">Digite o mês desejado na opção acima.</span>
                                )
                            ) : mesSelecionado ? (
                                <span>Mês selecionado: <strong className="text-zinc-900">{mesSelecionado}</strong></span>
                            ) : (
                                <span className="text-amber-600 font-medium">Nenhum mês selecionado no momento.</span>
                            )}
                        </div>

                        <button
                            onClick={handleSolicitarWhatsApp}
                            disabled={modoPersonalizado ? !mesCustomizadoInput.trim() : !mesSelecionado}
                            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${(modoPersonalizado ? mesCustomizadoInput.trim() : mesSelecionado)
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 cursor-pointer active:scale-95"
                                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
                                }`}
                        >
                            <Send size={14} /> Solicitar via WhatsApp
                        </button>
                    </div>
                </div>

                {/* LINHA DIVISÓRIA CONECTE-SE */}
                <div className="mt-24 flex items-center gap-4 mb-12">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* BLOCO INSTAGRAM */}
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