// app/condo/dashboard/reserva-de-espacos/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    Building2,
    Loader2,
    ArrowLeft,
    Instagram,
    ShieldAlert,
    Calendar as CalendarIcon,
    CheckCircle2,
    X,
    Trash2,
    Sparkles,
    AlertCircle,
    Lock,
    PlusCircle
} from "lucide-react";

interface UserMemberData {
    id: string;
    role: string;
    condominio_id: string;
    acesso_app: boolean;
    condominio: {
        id: string;
        nome: string;
    } | null;
}

interface Reserva {
    id: string;
    condominio_id: string;
    user_id: string;
    data_reserva: string;
    status: string;
    responsavel_nome?: string;
    unidade?: string;
    criado_em?: string;
}

export default function ReservaEspacosPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [memberData, setMemberData] = useState<UserMemberData | null>(null);
    const [isApenasMoradorBloqueado, setIsApenasMoradorBloqueado] = useState(false);

    // Controle de Reservas e Datas
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Modal de Confirmação de Reserva
    const [showReservaModal, setShowReservaModal] = useState(false);
    const [dataSelecionada, setDataSelecionada] = useState<string>("");

    // Modal de Cancelamento
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [reservaParaCancelar, setReservaParaCancelar] = useState<Reserva | null>(null);

    // Modal de Reserva Personalizada (Data Futura)
    const [customDate, setCustomDate] = useState("");

    const isMountedRef = useRef(true);

    const loadReservas = async (condoId: string) => {
        try {
            const { data, error } = await supabase
                .from("condominio_reservas")
                .select("*")
                .eq("condominio_id", condoId)
                .eq("status", "ativa")
                .order("data_reserva", { ascending: true });

            if (error) {
                const errStr = error.message || JSON.stringify(error);
                if (
                    !errStr.includes("AbortError") &&
                    !errStr.includes("does not exist") &&
                    !errStr.includes("Could not find the table")
                ) {
                    console.error("Erro ao carregar reservas:", errStr);
                }
            } else if (data && isMountedRef.current) {
                setReservas(data);
            }
        } catch (e) {
            // Ignora silenciosamente se a tabela ainda não estiver criada
        }
    };

    const verifyAccessAndLoadData = async (currentSession: any, retries = 2) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setMemberData(null);
                    setIsApenasMoradorBloqueado(false);
                    setLoading(false);
                }
                return;
            }

            if (isMountedRef.current) {
                setSession(currentSession);
            }
            const userId = currentSession.user.id;

            let membroDataList = null;
            let membroError = null;

            for (let i = 0; i <= retries; i++) {
                const res = await supabase
                    .from("condominio_membros")
                    .select(`
                        id,
                        role,
                        acesso_app,
                        condominio_id,
                        unidade,
                        condominio:condominios ( id, nome ),
                        profile:profiles ( nome_completo )
                    `)
                    .eq("user_id", userId);

                membroDataList = res.data;
                membroError = res.error;

                if (membroError) {
                    const errorMsg = membroError.message || JSON.stringify(membroError);
                    if (!errorMsg.includes("AbortError") && !errorMsg.includes("Lock broken")) {
                        console.error("Erro na consulta Supabase:", errorMsg);
                    }
                }

                if (membroDataList && membroDataList.length > 0) {
                    break;
                }

                if (i < retries) {
                    await new Promise((resolve) => setTimeout(resolve, 300));
                }
            }

            if (!membroDataList || membroDataList.length === 0) {
                if (isMountedRef.current) {
                    setIsApenasMoradorBloqueado(true);
                    setMemberData(null);
                    setLoading(false);
                }
                return;
            }

            const vinculoValido = membroDataList.find((m: any) => m.acesso_app === true);

            if (!vinculoValido) {
                if (isMountedRef.current) {
                    setIsApenasMoradorBloqueado(true);
                    setMemberData(null);
                    setLoading(false);
                }
                return;
            }

            if (isMountedRef.current) {
                setIsApenasMoradorBloqueado(false);
                const formattedMember: UserMemberData = {
                    id: vinculoValido.id,
                    role: vinculoValido.role,
                    condominio_id: vinculoValido.condominio_id,
                    acesso_app: vinculoValido.acesso_app,
                    condominio: Array.isArray(vinculoValido.condominio) ? vinculoValido.condominio[0] : vinculoValido.condominio
                };
                setMemberData(formattedMember);
                if (formattedMember.condominio_id) {
                    await loadReservas(formattedMember.condominio_id);
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
                    await verifyAccessAndLoadData(currentSession);
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
                    await verifyAccessAndLoadData(currentSession);
                }
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setMemberData(null);
                setIsApenasMoradorBloqueado(false);
                setLoading(false);
            }
        });

        return () => {
            isMountedRef.current = false;
            subscription.unsubscribe();
        };
    }, []);

    // Função de Logout blindada contra sessões fantasmas/residuais
    const handleLogout = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut({ scope: 'global' });
        } catch (e) {
            console.error("Erro ao deslogar no servidor:", e);
        }

        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('nucleo'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            localStorage.clear();
            sessionStorage.clear();
        } catch (e) {
            console.error("Erro ao limpar storages locais:", e);
        }

        setSession(null);
        setMemberData(null);
        setIsApenasMoradorBloqueado(false);
        setLoading(false);
        window.dispatchEvent(new Event("storage"));
    };

    const gerarDiasCalendario = () => {
        const dias = [];
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const dataInicio = new Date(hoje);
        dataInicio.setDate(hoje.getDate() + 1);

        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth();
        const dataFim = new Date(anoAtual, mesAtual + 2, 0);

        let atual = new Date(dataInicio);
        while (atual <= dataFim) {
            const ano = atual.getFullYear();
            const mes = String(atual.getMonth() + 1).padStart(2, '0');
            const dia = String(atual.getDate()).padStart(2, '0');
            const dataIso = `${ano}-${mes}-${dia}`;

            const reservaExistente = reservas.find(r => r.data_reserva === dataIso);

            dias.push({
                dataObj: new Date(atual),
                dataIso,
                diaFormatado: atual.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                diaSemana: atual.toLocaleDateString('pt-BR', { weekday: 'short' }),
                mesNome: atual.toLocaleDateString('pt-BR', { month: 'short' }),
                reservado: !!reservaExistente,
                reservaDetalhes: reservaExistente || null
            });

            atual.setDate(atual.getDate() + 1);
        }
        return dias;
    };

    const handleReservarClick = (dataIso: string) => {
        setDataSelecionada(dataIso);
        setShowReservaModal(true);
    };

    const confirmarReserva = async () => {
        if (!memberData || !memberData.condominio_id || !session?.user) return;

        setActionLoading(true);
        setFeedbackMessage(null);

        try {
            const { data: checkData } = await supabase
                .from("condominio_reservas")
                .select("id")
                .eq("condominio_id", memberData.condominio_id)
                .eq("data_reserva", dataSelecionada)
                .eq("status", "ativa")
                .maybeSingle();

            if (checkData) {
                setFeedbackMessage({ type: 'error', text: 'Esta data já foi reservada por outro morador.' });
                setActionLoading(false);
                setShowReservaModal(false);
                await loadReservas(memberData.condominio_id);
                return;
            }

            const { data: membroInfo } = await supabase
                .from("condominio_membros")
                .select(`
                    unidade,
                    profile:profiles ( nome_completo )
                `)
                .eq("condominio_id", memberData.condominio_id)
                .eq("user_id", session.user.id)
                .maybeSingle();

            const profileObj: any = Array.isArray(membroInfo?.profile) ? membroInfo?.profile[0] : membroInfo?.profile;
            const nomeResponsavel = profileObj?.nome_completo || session.user.user_metadata?.nome_completo || "Condômino";
            const unidadeMorador = membroInfo?.unidade || "N/A";

            const { error } = await supabase
                .from("condominio_reservas")
                .insert([
                    {
                        condominio_id: memberData.condominio_id,
                        user_id: session.user.id,
                        data_reserva: dataSelecionada,
                        status: 'ativa',
                        responsavel_nome: nomeResponsavel,
                        unidade: unidadeMorador
                    }
                ]);

            if (error) throw error;

            setFeedbackMessage({ type: 'success', text: 'Salão de festas reservado com sucesso!' });
            setShowReservaModal(false);
            setCustomDate("");
            await loadReservas(memberData.condominio_id);
        } catch (err: any) {
            console.error("Erro ao realizar reserva:", err);
            setFeedbackMessage({ type: 'error', text: err?.message || 'Erro ao processar reserva.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleCustomReservaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customDate) return;

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const [ano, mes, dia] = customDate.split('-').map(Number);
        const dataEscolhida = new Date(ano, mes - 1, dia);

        if (dataEscolhida <= hoje) {
            setFeedbackMessage({ type: 'error', text: 'A data personalizada deve ser posterior ao dia de hoje.' });
            return;
        }

        setDataSelecionada(customDate);
        setShowReservaModal(true);
    };

    const handleCancelarClick = (reserva: Reserva) => {
        setReservaParaCancelar(reserva);
        setShowCancelModal(true);
    };

    const confirmarCancelamento = async () => {
        if (!reservaParaCancelar || !memberData?.condominio_id) return;

        setActionLoading(true);
        setFeedbackMessage(null);

        try {
            const { error } = await supabase
                .from("condominio_reservas")
                .update({ status: 'cancelada' })
                .eq("id", reservaParaCancelar.id);

            if (error) throw error;

            setFeedbackMessage({ type: 'success', text: 'Reserva cancelada com sucesso. A data já está disponível para outros moradores.' });
            setShowCancelModal(false);
            setReservaParaCancelar(null);
            await loadReservas(memberData.condominio_id);
        } catch (err: any) {
            console.error("Erro ao cancelar reserva:", err);
            setFeedbackMessage({ type: 'error', text: err?.message || 'Erro ao cancelar reserva.' });
        } finally {
            setActionLoading(false);
        }
    };

    const calcularAntecedenciaDias = (dataReservaStr: string) => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const [ano, mes, dia] = dataReservaStr.split('-').map(Number);
        const dataRes = new Date(ano, mes - 1, dia);
        const diffTime = dataRes.getTime() - hoje.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando calendário...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-[2.5rem] text-center space-y-4 shadow-sm">
                    <h1 className="text-xl font-black text-zinc-900">Acesso restrito</h1>
                    <p className="text-sm text-zinc-500">Faça login na plataforma para visualizar o módulo de reservas.</p>
                    <Link href="/condo/dashboard" className="inline-block bg-zinc-900 hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                        Ir para Login
                    </Link>
                </div>
            </div>
        );
    }

    if (session && isApenasMoradorBloqueado) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                        <Lock size={30} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-xl font-black tracking-tight">Acesso restrito</h1>
                        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                            Olá! O seu perfil possui acesso restrito ou não possui permissão ativa (Acesso APP) para visualizar este módulo.
                        </p>
                    </div>

                    <div className="pt-2 space-y-3">
                        <button
                            onClick={() => window.history.back()}
                            className="w-full bg-zinc-900 hover:bg-black text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md shadow-zinc-900/10 cursor-pointer hidden md:flex"
                        >
                            <ArrowLeft size={14} /> Voltar à página anterior
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                        >
                            Entrar com outra conta
                        </button>
                    </div>
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
                    <h1 className="text-xl font-black text-zinc-900">Acesso restrito</h1>
                    <p className="text-sm text-zinc-500">
                        Seu perfil não possui acesso liberado neste condomínio no momento.
                    </p>
                    <div className="pt-2 flex flex-col gap-2">
                        <Link href="/condo/dashboard" className="inline-block bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                            Voltar ao Início
                        </Link>
                        <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:underline py-2 cursor-pointer">
                            Sair / Trocar Conta
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const diasCalendario = gerarDiasCalendario();
    const minhasReservas = reservas.filter(r => r.user_id === session?.user?.id);

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 pt-6 px-6 md:px-10 flex flex-col justify-between">
            <div>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                        Reserva Área Comum
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1 text-zinc-900">
                                    {memberData?.condominio?.nome || "Módulo Condominial"}
                                </h1>
                            </div>
                        </div>

                        {/* Botão de Voltar Minimalista Premium (Oculto em Mobile) */}
                        <button
                            onClick={() => window.history.back()}
                            className="group relative hidden md:flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 overflow-hidden cursor-pointer"
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

                {/* Feedback Messages */}
                {feedbackMessage && (
                    <div className={`mb-6 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border ${feedbackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {feedbackMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span>{feedbackMessage.text}</span>
                    </div>
                )}

                {/* Minhas Reservas Ativas */}
                {minhasReservas.length > 0 && (
                    <div className="bg-white border border-zinc-200 p-6 rounded-[2.5rem] shadow-sm mb-8">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
                            <div className="flex items-center gap-3">
                                <Sparkles className="text-blue-600" size={20} />
                                <h2 className="font-bold text-base text-zinc-900">Suas Reservas Confirmadas</h2>
                            </div>
                            <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                                {minhasReservas.length} Ativa(s)
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {minhasReservas.map((reserva) => {
                                const [ano, mes, dia] = reserva.data_reserva.split('-');
                                const dataFormatada = `${dia}/${mes}/${ano}`;
                                const diasRestantes = calcularAntecedenciaDias(reserva.data_reserva);
                                const recomendavelCancelar = diasRestantes >= 2;

                                return (
                                    <div key={reserva.id} className="bg-zinc-50 border border-zinc-200/80 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Salão de Festas</span>
                                                <span className="text-[10px] font-bold text-zinc-400">Em {diasRestantes} dia(s)</span>
                                            </div>
                                            <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                                                <CalendarIcon size={18} className="text-blue-600" /> {dataFormatada}
                                            </h3>
                                        </div>

                                        <div className="space-y-2">
                                            {!recomendavelCancelar && (
                                                <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200/60 p-2 rounded-xl leading-tight">
                                                    ⚠️ Menos de 2 dias de antecedência. O cancelamento imediato libera o dia, mas evite imprevistos de última hora.
                                                </p>
                                            )}
                                            <button
                                                onClick={() => handleCancelarClick(reserva)}
                                                className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                            >
                                                <Trash2 size={14} /> Cancelar Reserva
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Calendário de Disponibilidade */}
                <div className="bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 pb-4 mb-6 gap-2">
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="text-blue-600" size={24} />
                            <div>
                                <h2 className="font-bold text-lg text-zinc-900">Agenda reserva</h2>
                                <p className="text-xs text-zinc-400">Agende sua data desejada no calendário, conforme disponibilidade</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center md:justify-end gap-6 w-full md:w-auto text-[10px] font-bold uppercase tracking-wider text-zinc-500 my-4 md:my-0">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Disponível
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-zinc-300 inline-block"></span> Reservado
                            </div>
                        </div>
                    </div>

                    {/* Versão Desktop: Grid padrão */}
                    <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-3">
                        {diasCalendario.map((dia) => {
                            return (
                                <div
                                    key={dia.dataIso}
                                    className={`p-4 rounded-2xl border flex flex-col justify-between items-center text-center transition-all ${dia.reservado
                                        ? 'bg-zinc-100/70 border-zinc-200 text-zinc-400 opacity-80'
                                        : 'bg-white border-zinc-200 hover:border-blue-400 hover:shadow-md cursor-pointer group'
                                        }`}
                                >
                                    <div className="space-y-0.5">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                                            {dia.diaSemana} - {dia.mesNome}
                                        </span>
                                        <span className="text-lg font-black text-zinc-900 block">
                                            {dia.diaFormatado}
                                        </span>
                                    </div>

                                    <div className="mt-4 w-full">
                                        {dia.reservado ? (
                                            <div className="space-y-1">
                                                <span className="inline-block text-[9px] font-black uppercase bg-zinc-200 text-zinc-600 px-2.5 py-1 rounded-full w-full">
                                                    Reservado
                                                </span>
                                                <p className="text-[9px] text-zinc-500 font-medium truncate">
                                                    {dia.reservaDetalhes?.unidade ? `Apto ${dia.reservaDetalhes.unidade}` : (dia.reservaDetalhes?.responsavel_nome || 'Condômino')}
                                                </p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleReservarClick(dia.dataIso)}
                                                className="w-full bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                                            >
                                                Reservar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Versão Mobile: Cards menores adaptados */}
                    <div className="grid md:hidden grid-cols-3 gap-2">
                        {diasCalendario.map((dia) => {
                            return (
                                <div
                                    key={dia.dataIso}
                                    className={`p-2.5 rounded-xl border flex flex-col justify-between items-center text-center transition-all ${dia.reservado
                                        ? 'bg-zinc-100/70 border-zinc-200 text-zinc-400 opacity-80'
                                        : 'bg-white border-zinc-200 active:border-blue-400'
                                        }`}
                                >
                                    <div className="space-y-0">
                                        <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block">
                                            {dia.diaSemana}
                                        </span>
                                        <span className="text-xs font-black text-zinc-900 block">
                                            {dia.diaFormatado}
                                        </span>
                                    </div>

                                    <div className="mt-2 w-full">
                                        {dia.reservado ? (
                                            <span className="inline-block text-[7px] font-black uppercase bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded-md w-full truncate">
                                                {dia.reservaDetalhes?.unidade ? `Ap ${dia.reservaDetalhes.unidade}` : 'Ocupado'}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleReservarClick(dia.dataIso)}
                                                className="w-full bg-blue-50 text-blue-600 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider cursor-pointer"
                                            >
                                                Reservar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <hr className="my-8 border-zinc-200" />

                    {/* Opção de Sinalizar Data Futura */}
                    <div className="bg-zinc-50 border border-zinc-200 p-5 md:p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="space-y-1 text-left w-full">
                            <div className="flex items-center gap-2">
                                <PlusCircle size={18} className="text-blue-600" />
                                <h3 className="font-bold text-sm md:text-base text-zinc-900">Data futura personalizada</h3>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Precisa agendar com antecedência estendida além dos próximos meses? Selecione uma data futura específica.
                            </p>
                        </div>

                        <form onSubmit={handleCustomReservaSubmit} className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto shrink-0">
                            <input
                                type="date"
                                required
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                                className="px-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium outline-none focus:border-blue-400 w-full md:w-auto"
                            />
                            <button
                                type="submit"
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-sm whitespace-nowrap cursor-pointer"
                            >
                                Solicitar Data
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* MODAL DE CONFIRMAÇÃO DE RESERVA */}
            {showReservaModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 md:p-8 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowReservaModal(false)}
                            className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 mb-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                <CalendarIcon size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-base text-zinc-900">Confirmar Reserva</h2>
                                <p className="text-[11px] text-zinc-500">Salão de Festas do Condomínio</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-zinc-600 leading-relaxed">
                                Deseja confirmar a reserva do salão de festas para a data selecionada: <strong className="text-zinc-900">{dataSelecionada.split('-').reverse().join('/')}</strong>?
                            </p>

                            <div className="bg-blue-50/60 border border-blue-100 p-3.5 rounded-2xl space-y-1">
                                <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Regra de Cancelamento</span>
                                <p className="text-[11px] text-blue-900 leading-relaxed">
                                    Recomendamos que eventuais cancelamentos sejam feitos com até <strong>2 dias de antecedência</strong>, garantindo que outro morador possa aproveitar a data.
                                </p>
                            </div>

                            <button
                                onClick={confirmarReserva}
                                disabled={actionLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition shadow-md shadow-blue-100 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                            >
                                {actionLoading ? "Processando..." : "Confirmar Reserva"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO DE CANCELAMENTO */}
            {showCancelModal && reservaParaCancelar && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 md:p-8 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => {
                                setShowCancelModal(false);
                                setReservaParaCancelar(null);
                            }}
                            className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 mb-4">
                            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-base text-zinc-900">Cancelar Reserva</h2>
                                <p className="text-[11px] text-zinc-500">Liberação de data no calendário</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-zinc-600 leading-relaxed">
                                Tem certeza de que deseja cancelar sua reserva do dia <strong className="text-zinc-900">{reservaParaCancelar.data_reserva.split('-').reverse().join('/')}</strong>?
                            </p>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                                O dia voltará a ficar disponível imediatamente para que outro morador possa aproveitar a data.
                            </p>

                            <button
                                onClick={confirmarCancelamento}
                                disabled={actionLoading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition shadow-md shadow-red-100 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                            >
                                {actionLoading ? "Cancelando..." : "Sim, Cancelar Reserva"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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