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
    CheckCircle2,
    ShieldAlert,
    Plus,
    X,
    Sparkles,
    Trash2,
    Calendar,
    Check
} from "lucide-react";

interface UserMemberData {
    role: string;
    condominio_id: string;
    unidade?: string;
    condominio: {
        nome: string;
    };
}

interface EnqueteOficial {
    id: string;
    condominio_id: string;
    titulo: string;
    descricao: string;
    opcoes: any;
    votos: any;
    status: string;
    criado_por: string;
    criado_em: string;
    aprovacao_sindico?: string;
}

interface PropostaEnquete {
    id: string;
    titulo: string;
    descricao: string;
    status: string;
    criado_em: string;
    tipo: 'sugestao' | 'enquete';
}

interface OpcaoEnquete {
    id: string;
    texto: string;
}

export default function EnquetesDecisoesPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [memberData, setMemberData] = useState<UserMemberData | null>(null);

    // Listas do Dashboard
    const [enquetesAtivas, setEnquetesAtivas] = useState<EnqueteOficial[]>([]);
    const [votosMorador, setVotosMorador] = useState<Record<string, string>>({});
    const [feedbackVoto, setFeedbackVoto] = useState<string>("");

    // Lista unificada de propostas enviadas pelo morador
    const [propostasMorador, setPropostasMorador] = useState<PropostaEnquete[]>([]);

    const isMountedRef = useRef(true);

    // Estados do Popup de Criação de Enquete Detalhada (+) gravando direto em condominio_enquetes
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [detalheTitulo, setDetalheTitulo] = useState("");
    const [detalheDescricao, setDetalheDescricao] = useState("");
    const [detalheGanho, setDetalheGanho] = useState("");
    const [opcoes, setOpcoes] = useState<OpcaoEnquete[]>([
        { id: "1", texto: "Sim" },
        { id: "2", texto: "Não" }
    ]);
    const [novoTextoOpcao, setNovoTextoOpcao] = useState("");
    const [criandoDetalhada, setCriandoDetalhada] = useState(false);
    const [detalhadaSucesso, setDetalhadaSucesso] = useState("");

    const loadDadosDashboard = async (condoId: string, userId: string) => {
        try {
            // 1. Carregar todas as enquetes oficiais do condomínio
            const { data: enquetesData, error: errEnquetes } = await supabase
                .from("condominio_enquetes")
                .select("*")
                .eq("condominio_id", condoId)
                .order("criado_em", { ascending: false });

            if (!errEnquetes && enquetesData && isMountedRef.current) {
                // Filtrar apenas as aprovadas pelo síndico (aprovacao_sindico === 'sim') para exibir na tela ativa
                const aprovadas = enquetesData.filter((e: any) =>
                    (e.aprovacao_sindico || "").toLowerCase() === "sim"
                );
                setEnquetesAtivas(aprovadas as EnqueteOficial[]);

                // Mapear votos do usuário logado a partir do objeto JSON centralizado na coluna 'votos'
                const votosMap: Record<string, string> = {};
                enquetesData.forEach((e: any) => {
                    let objVotos = e.votos;
                    if (typeof objVotos === 'string') {
                        try { objVotos = JSON.parse(objVotos); } catch { objVotos = {}; }
                    }
                    if (objVotos && typeof objVotos === 'object') {
                        if (objVotos[userId]) {
                            votosMap[e.id] = objVotos[userId];
                        }
                    }
                });
                setVotosMorador(votosMap);

                // Mapear enquetes criadas pelo usuário para a tabela "Minhas sugestões/enquetes"
                const listaEnquetesUser: PropostaEnquete[] = enquetesData
                    .filter((item: any) => item.criado_por === userId)
                    .map((item: any) => ({
                        id: item.id,
                        titulo: item.titulo,
                        descricao: item.descricao,
                        criado_em: item.criado_em,
                        tipo: 'enquete' as const,
                        status: (item.aprovacao_sindico || "").toLowerCase() === 'sim' ? 'ativa' : 'pendente'
                    }));

                // 2. Carregar sugestões antigas caso existam na outra tabela
                const { data: sugestoesData } = await supabase
                    .from("condominio_sugestoes_enquetes")
                    .select("id, titulo, descricao, status, criado_em")
                    .eq("condominio_id", condoId)
                    .eq("user_id", userId);

                const listaSugestoes: PropostaEnquete[] = (sugestoesData || []).map(item => ({
                    ...item,
                    tipo: 'sugestao' as const
                }));

                const combinadas = [...listaSugestoes, ...listaEnquetesUser].sort((a, b) =>
                    new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
                );

                setPropostasMorador(combinadas);
            }
        } catch (err) {
            console.error("Erro ao carregar dados do dashboard de enquetes:", err);
        }
    };

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
                        condominio_id,
                        unidade,
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
                    const membro = data[0] as unknown as UserMemberData;
                    setMemberData(membro);
                    if (membro.condominio_id) {
                        await loadDadosDashboard(membro.condominio_id, userId);
                    }
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
        setLoading(false);
        window.dispatchEvent(new Event("storage"));
    };

    // Computar Voto do Morador atualizando diretamente o JSON na coluna centralizada 'votos'
    const handleVotarEnquete = async (enqueteId: string, opcaoTexto: string) => {
        if (!memberData || !session) return;
        setActionLoading(true);

        try {
            // Buscar enquete atual para atualizar o JSON de votos mantendo os demais condôminos
            const { data: enqueteAtual, error: fetchErr } = await supabase
                .from("condominio_enquetes")
                .select("votos")
                .eq("id", enqueteId)
                .single();

            if (fetchErr) throw fetchErr;

            let votosAtuais = enqueteAtual?.votos;
            if (typeof votosAtuais === 'string') {
                try { votosAtuais = JSON.parse(votosAtuais); } catch { votosAtuais = {}; }
            }
            if (!votosAtuais || typeof votosAtuais !== 'object') {
                votosAtuais = {};
            }

            const userId = session.user.id;
            const novosVotos = {
                ...votosAtuais,
                [userId]: opcaoTexto
            };

            const { error: updateErr } = await supabase
                .from("condominio_enquetes")
                .update({ votos: novosVotos })
                .eq("id", enqueteId);

            if (updateErr) throw updateErr;

            setVotosMorador(prev => ({ ...prev, [enqueteId]: opcaoTexto }));
            setFeedbackVoto("Voto computado com sucesso!");
            await loadDadosDashboard(memberData.condominio_id, userId);

            setTimeout(() => setFeedbackVoto(""), 3000);
        } catch (err: any) {
            alert("Erro ao registrar voto: " + (err?.message || "Erro desconhecido"));
        } finally {
            setActionLoading(false);
        }
    };

    // Adicionar opção no popup detalhado
    const handleAdicionarOpcao = () => {
        if (!novoTextoOpcao.trim()) return;
        setOpcoes([...opcoes, { id: String(Date.now()), texto: novoTextoOpcao.trim() }]);
        setNovoTextoOpcao("");
    };

    const handleRemoverOpcao = (id: string) => {
        if (opcoes.length <= 2) {
            alert("A enquete precisa ter pelo menos 2 opções de resposta.");
            return;
        }
        setOpcoes(opcoes.filter((o) => o.id !== id));
    };

    // Submissão da Enquete Detalhada (inicialmente não aprovada pelo síndico)
    const handleCriarEnqueteDetalhada = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!detalheTitulo.trim() || !detalheDescricao.trim() || !memberData || !session) return;

        setCriandoDetalhada(true);

        try {
            const descricaoCompleta = detalheGanho.trim()
                ? `${detalheDescricao.trim()}\n\n[Ganho com a decisão a favor: ${detalheGanho.trim()}]`
                : detalheDescricao.trim();

            const { error } = await supabase
                .from("condominio_enquetes")
                .insert([
                    {
                        condominio_id: memberData.condominio_id,
                        titulo: detalheTitulo.trim(),
                        descricao: descricaoCompleta,
                        opcoes: opcoes,
                        votos: {},
                        status: 'ativa', // Alterado de 'pendente' para 'ativa' (compatível com a regra atual do banco)
                        aprovacao_sindico: 'não', // O síndico continuará controlando a aprovação por esta coluna
                        criado_por: session.user.id
                    }
                ]);

            if (error) throw error;

            setDetalhadaSucesso("Enquete criada e enviada para validação do síndico!");
            await loadDadosDashboard(memberData.condominio_id, session.user.id);

            setTimeout(() => {
                setCriandoDetalhada(false);
                setDetalhadaSucesso("");
                setIsPopupOpen(false);
                setDetalheTitulo("");
                setDetalheDescricao("");
                setDetalheGanho("");
                setOpcoes([{ id: "1", texto: "Sim" }, { id: "2", texto: "Não" }]);
            }, 2000);
        } catch (err: any) {
            console.error("Erro ao criar enquete detalhada:", err);
            alert("Erro ao salvar enquete: " + (err?.message || "Erro desconhecido"));
            setCriandoDetalhada(false);
        }
    };

    const parseOpcoes = (opcoesData: any) => {
        if (!opcoesData) return [];
        if (Array.isArray(opcoesData)) return opcoesData;
        try {
            return JSON.parse(opcoesData);
        } catch {
            return [];
        }
    };

    const formatarData = (dataStr: string) => {
        if (!dataStr) return "";
        const data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 pt-6 px-6 md:px-10 flex flex-col justify-between">
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

                        <button
                            onClick={() => window.history.back()}
                            className="hidden md:flex group relative items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 self-start md:self-auto overflow-hidden cursor-pointer"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                            <ArrowLeft size={12} className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out" />
                            <span>Voltar</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <p className="text-xs md:text-sm text-zinc-500 font-medium">
                        Participe das votações ativas aprovadas pela administração. Toda enquete criada passa pela validação do síndico.
                    </p>

                    {/* Botão de Destaque para Criar Enquete na Lateral Direita */}
                    <button
                        onClick={() => setIsPopupOpen(true)}
                        className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer self-start md:self-auto shrink-0"
                    >
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                            <Plus size={18} className="text-white" />
                        </div>
                        <div className="text-left">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-100">Sua Proposta</span>
                            <span className="block text-xs font-black uppercase tracking-tight">Criar Nova Enquete</span>
                        </div>
                    </button>
                </div>

                {feedbackVoto && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} /> {feedbackVoto}
                    </div>
                )}

                {/* Seção Principal: Enquetes Ativas (Ocupando largura total) */}
                <div className="space-y-6 mb-12">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                            <Vote size={18} className="text-blue-600" /> Enquetes em Andamento
                        </h2>
                    </div>

                    {enquetesAtivas.length === 0 ? (
                        <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-12 text-center space-y-4 shadow-sm flex flex-col justify-center items-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                                <Vote size={30} />
                            </div>
                            <div className="space-y-1 max-w-md mx-auto">
                                <h3 className="font-bold text-lg text-zinc-900">Nenhuma enquete ativa no momento</h3>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Assim que a administração do condomínio aprovar e publicar uma nova assembleia virtual ou votação, ela aparecerá listada aqui.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {enquetesAtivas.map((eq) => {
                                const listaOpcoes = parseOpcoes(eq.opcoes);
                                const votoUsuario = votosMorador[eq.id];
                                return (
                                    <div key={eq.id} className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 w-fit">
                                                Enquete aberta
                                            </span>
                                            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 self-end sm:self-auto">
                                                <Calendar size={12} /> {formatarData(eq.criado_em)}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-base md:text-lg text-zinc-900">{eq.titulo}</h3>
                                        <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">{eq.descricao}</p>

                                        {/* Alternativas de Votação */}
                                        <div className="pt-2 space-y-2 border-t border-zinc-100">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Escolha sua alternativa:</span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {listaOpcoes.map((op: any, i: number) => {
                                                    const selecionado = votoUsuario === op.texto;
                                                    return (
                                                        <button
                                                            key={i}
                                                            disabled={actionLoading}
                                                            onClick={() => handleVotarEnquete(eq.id, op.texto)}
                                                            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${selecionado
                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                                                                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200'
                                                                }`}
                                                        >
                                                            <span>{op.texto}</span>
                                                            {selecionado && <Check size={14} className="shrink-0" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {votoUsuario && (
                                                <p className="text-[11px] text-emerald-600 font-bold pt-1 flex items-center gap-1">
                                                    <CheckCircle2 size={13} /> Seu voto registrado: &quot;{votoUsuario}&quot;
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Seção Inferior: Minhas sugestões/enquetes (Ocupando largura total) */}
                <div className="space-y-4 pb-12">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Minhas sugestões/enquetes</h3>
                    {propostasMorador.length === 0 ? (
                        <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 text-center shadow-sm space-y-2">
                            <p className="text-xs text-zinc-400">Você ainda não enviou nenhuma sugestão ou proposta de enquete.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {propostasMorador.map((item) => (
                                <div key={item.id} className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-md">
                                                {item.tipo === 'enquete' ? 'Enquete Detalhada' : 'Sugestão Rápida'}
                                            </span>
                                            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                                                <Calendar size={12} /> {formatarData(item.criado_em)}
                                            </span>
                                        </div>
                                        <h4 className="text-xs font-bold text-zinc-900 pt-1">{item.titulo}</h4>
                                        <p className="text-[11px] text-zinc-500 line-clamp-1">{item.descricao}</p>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full text-center shrink-0 ${item.status === 'ativa' || item.status === 'aprovada' || (item as any).aprovacao_sindico === 'sim' ? 'bg-emerald-50 text-emerald-600' : item.status === 'rejeitada' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {item.status === 'pendente' ? 'Aguardando Validação' : item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* POPUP DE CRIAÇÃO DE ENQUETE DETALHADA (+) */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-250">
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-250 my-8">
                        <button
                            onClick={() => setIsPopupOpen(false)}
                            className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-gray-900">Nova Enquete Detalhada</h2>
                                <p className="text-xs text-zinc-500">
                                    Estruture a votação com título, objetivos, benefícios esperados e alternativas.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleCriarEnqueteDetalhada} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Título da Enquete</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Reforma da fachada do bloco A"
                                    value={detalheTitulo}
                                    onChange={(e) => setDetalheTitulo(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium text-zinc-900"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Descrição / Contexto</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Explique os motivos e detalhes da votação..."
                                    value={detalheDescricao}
                                    onChange={(e) => setDetalheDescricao(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium text-zinc-900 resize-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Ganho com a decisão a favor</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Valorização do imóvel e melhoria estética"
                                    value={detalheGanho}
                                    onChange={(e) => setDetalheGanho(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium text-zinc-900"
                                />
                            </div>

                            {/* Opções de Resposta */}
                            <div className="space-y-2 pt-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Opções de Votação</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {opcoes.map((opcao) => (
                                        <div key={opcao.id} className="flex items-center justify-between bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-800">
                                            <span>{opcao.texto}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoverOpcao(opcao.id)}
                                                className="text-zinc-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <input
                                        type="text"
                                        placeholder="Adicionar nova alternativa..."
                                        value={novoTextoOpcao}
                                        onChange={(e) => setNovoTextoOpcao(e.target.value)}
                                        className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 text-xs font-medium text-zinc-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAdicionarOpcao}
                                        className="bg-zinc-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </div>

                            {detalhadaSucesso && (
                                <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-center gap-2">
                                    <CheckCircle2 size={16} className="shrink-0" /> {detalhadaSucesso}
                                </p>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={criandoDetalhada}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {criandoDetalhada ? "Salvando Enquete..." : "Enviar Enquete para Validação do Síndico"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bloco de Conexão com o Instagram */}
            <div>
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