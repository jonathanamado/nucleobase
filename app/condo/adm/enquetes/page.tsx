// app/condo/adm/enquetes/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    Building2,
    Loader2,
    Instagram,
    ShieldAlert,
    X,
    Vote,
    CheckCircle2,
    Filter,
    ArrowLeft,
    Trash2,
    Plus,
    Sparkles,
    Check,
    Clock,
    FileText
} from "lucide-react";

interface UserMemberData {
    role: string;
    condominio_id: string;
    unidade: string;
    condominio: {
        nome: string;
    };
}

interface SugestaoEnquete {
    id: string;
    condominio_id: string;
    user_id: string;
    titulo: string;
    descricao: string;
    status: 'pendente' | 'em_andamento' | 'resolvido';
    criado_em: string;
}

interface EnqueteOficial {
    id: string;
    condominio_id: string;
    titulo: string;
    descricao: string;
    opcoes: any;
    votos: any;
    status: 'pendente' | 'ativa' | 'encerrada';
    criado_por: string;
    criado_em: string;
    aprovacao_sindico?: 'sim' | 'não' | string;
}

interface OpcaoEnquete {
    id: string;
    texto: string;
}

export default function AnaliseEnquetesAdmPage() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [memberData, setMemberData] = useState<UserMemberData | null>(null);

    // Listas do Banco
    const [sugestoes, setSugestoes] = useState<SugestaoEnquete[]>([]);
    const [enquetesOficiais, setEnquetesOficiais] = useState<EnqueteOficial[]>([]);

    // Estados de Filtro - Ajustado para 'todos' por padrão
    const [filtroSugestao, setFiltroSugestao] = useState<string>('todos');
    const [filtroEnquete, setFiltroEnquete] = useState<string>('todos');

    // Estado do Modal de Criação Direta de Enquete pelo Síndico (+)
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

    const [feedbackMessage, setFeedbackMessage] = useState("");
    const isMountedRef = useRef(true);

    const fecharPopupComConfirmacao = () => {
        const preenchido = detalheTitulo.trim() !== "" || detalheDescricao.trim() !== "" || detalheGanho.trim() !== "";
        if (preenchido) {
            const confirmar = window.confirm("Existem dados preenchidos. Deseja realmente fechar e descartar as alterações?");
            if (!confirmar) return;
        }
        setIsPopupOpen(false);
        setDetalheTitulo("");
        setDetalheDescricao("");
        setDetalheGanho("");
        setOpcoes([{ id: "1", texto: "Sim" }, { id: "2", texto: "Não" }]);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isPopupOpen) {
                fecharPopupComConfirmacao();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPopupOpen, detalheTitulo, detalheDescricao, detalheGanho]);

    // Função auxiliar para retornar apenas o primeiro e o último nome
    const formatarNomePrimeiroEUltimo = (nomeCompleto?: string) => {
        if (!nomeCompleto) return "";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length === 0) return "";
        if (partes.length === 1) return partes[0];
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    const loadDadosAdm = async (condoId: string) => {
        try {
            const { data: dataSugestao, error: errSugestao } = await supabase
                .from("condominio_sugestoes_enquetes")
                .select("*")
                .eq("condominio_id", condoId)
                .order("criado_em", { ascending: false });

            if (!errSugestao && dataSugestao && isMountedRef.current) {
                setSugestoes(dataSugestao as SugestaoEnquete[]);
            }

            const { data: dataEnquete, error: errEnquete } = await supabase
                .from("condominio_enquetes")
                .select("*")
                .eq("condominio_id", condoId)
                .order("criado_em", { ascending: false });

            if (!errEnquete && dataEnquete && isMountedRef.current) {
                setEnquetesOficiais(dataEnquete as EnqueteOficial[]);
            }
        } catch (err) {
            console.error("Erro ao carregar dados de enquetes adm:", err);
        }
    };

    const verifyAccessAndLoadData = async (currentSession: any) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setMemberData(null);
                    setSugestoes([]);
                    setEnquetesOficiais([]);
                    setLoading(false);
                }
                return;
            }

            if (isMountedRef.current) {
                setSession(currentSession);
            }
            const userId = currentSession.user.id;

            const { data: membroDataList, error: membroError } = await supabase
                .from("condominio_membros")
                .select("condominio_id, role, unidade, acesso_app, condominio_nome")
                .eq("user_id", userId);

            if (membroError) {
                const errorMsg = membroError.message || JSON.stringify(membroError);
                if (!errorMsg.includes("AbortError") && !errorMsg.includes("Lock broken")) {
                    console.error("Erro na consulta Supabase (membros adm):", errorMsg);
                }
            }

            if (!membroDataList || membroDataList.length === 0) {
                if (isMountedRef.current) {
                    setMemberData(null);
                    setLoading(false);
                }
                return;
            }

            const vinculoAdm = membroDataList.find(
                (m: any) => {
                    const r = (m.role || "").toLowerCase();
                    const u = (m.unidade || "").toLowerCase();
                    return r === 'sindico' || r === 'síndico' || r === 'adm' || r === 'administrador' || u === '106' || u === 'adm';
                }
            ) || membroDataList[0];

            if (!vinculoAdm) {
                if (isMountedRef.current) {
                    setMemberData(null);
                    setLoading(false);
                }
                return;
            }

            let nomeCondominioOficial = vinculoAdm.condominio_nome || "Condomínio";
            if (vinculoAdm.condominio_id) {
                const { data: condoData } = await supabase
                    .from("condominios")
                    .select("nome")
                    .eq("id", vinculoAdm.condominio_id)
                    .maybeSingle();

                if (condoData && condoData.nome) {
                    nomeCondominioOficial = condoData.nome;
                }
            }

            if (isMountedRef.current) {
                setMemberData({
                    role: vinculoAdm.role,
                    condominio_id: vinculoAdm.condominio_id,
                    unidade: vinculoAdm.unidade,
                    condominio: {
                        nome: nomeCondominioOficial
                    }
                });
                await loadDadosAdm(vinculoAdm.condominio_id);
            }
        } catch (e: any) {
            const errString = e?.message || JSON.stringify(e);
            if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                console.warn("Exceção tratada em verifyAccessAndLoadData:", errString);
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
        let authSub: any = null;

        const initAuth = async () => {
            try {
                const timeoutId = setTimeout(() => {
                    if (isMountedRef.current && loading) {
                        setLoading(false);
                    }
                }, 5000);

                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
                clearTimeout(timeoutId);

                if (sessionError && !currentSession) throw sessionError;

                if (isMountedRef.current) {
                    await verifyAccessAndLoadData(currentSession);
                }
            } catch (err: any) {
                const errString = err?.message || JSON.stringify(err);
                if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                    console.error("Erro ao recuperar sessão inicial adm:", errString);
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
                setLoading(false);
            }
        });
        authSub = subscription;

        return () => {
            isMountedRef.current = false;
            if (authSub) authSub.unsubscribe();
        };
    }, []);

    const handleAtualizarStatusSugestao = async (id: string, novoStatus: 'pendente' | 'em_andamento' | 'resolvido') => {
        if (!memberData) return;
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from("condominio_sugestoes_enquetes")
                .update({ status: novoStatus })
                .eq("id", id);

            if (error) throw error;
            setFeedbackMessage("Status da sugestão atualizado!");
            await loadDadosAdm(memberData.condominio_id);
            setTimeout(() => setFeedbackMessage(""), 3000);
        } catch (err: any) {
            alert("Erro ao atualizar status: " + (err?.message || "Erro desconhecido"));
        } finally {
            setActionLoading(false);
        }
    };

    const handleExcluirSugestao = async (id: string) => {
        if (!confirm("Deseja realmente excluir esta sugestão?")) return;
        if (!memberData) return;

        setActionLoading(true);
        try {
            const { error } = await supabase
                .from("condominio_sugestoes_enquetes")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setFeedbackMessage("Sugestão excluída com sucesso!");
            await loadDadosAdm(memberData.condominio_id);
            setTimeout(() => setFeedbackMessage(""), 3000);
        } catch (err: any) {
            alert("Erro ao excluir: " + (err?.message || "Erro desconhecido"));
        } finally {
            setActionLoading(false);
        }
    };

    const handleAtualizarStatusEnquete = async (id: string, novoStatus: 'pendente' | 'ativa' | 'encerrada', novaAprovacao: 'sim' | 'não') => {
        if (!memberData) return;
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from("condominio_enquetes")
                .update({
                    status: novoStatus,
                    aprovacao_sindico: novaAprovacao
                })
                .eq("id", id);

            if (error) throw error;
            setFeedbackMessage(`Enquete oficial atualizada (Aprovação: ${novaAprovacao.toUpperCase()})!`);
            await loadDadosAdm(memberData.condominio_id);
            setTimeout(() => setFeedbackMessage(""), 3000);
        } catch (err: any) {
            alert("Erro ao atualizar enquete: " + (err?.message || "Erro desconhecido"));
        } finally {
            setActionLoading(false);
        }
    };

    const handleExcluirEnqueteOficial = async (id: string) => {
        if (!confirm("Deseja realmente excluir esta enquete oficial?")) return;
        if (!memberData) return;

        setActionLoading(true);
        try {
            const { error } = await supabase
                .from("condominio_enquetes")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setFeedbackMessage("Enquete excluída com sucesso!");
            await loadDadosAdm(memberData.condominio_id);
            setTimeout(() => setFeedbackMessage(""), 3000);
        } catch (err: any) {
            alert("Erro ao excluir enquete: " + (err?.message || "Erro desconhecido"));
        } finally {
            setActionLoading(false);
        }
    };

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

    const handleCriarEnqueteAdm = async (e: React.FormEvent) => {
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
                        status: 'ativa',
                        aprovacao_sindico: 'sim',
                        criado_por: session.user.id
                    }
                ]);

            if (error) throw error;

            setDetalhadaSucesso("Enquete criada e publicada com sucesso!");
            await loadDadosAdm(memberData.condominio_id);

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
            console.error("Erro ao criar enquete adm:", err);
            alert("Erro ao salvar enquete: " + (err?.message || "Erro desconhecido"));
            setCriandoDetalhada(false);
        }
    };

    const sugestoesFiltradas = sugestoes.filter(s => {
        if (filtroSugestao === 'todos') return true;
        return s.status === filtroSugestao;
    });

    const enquetesFiltradas = enquetesOficiais.filter(e => {
        if (filtroEnquete === 'todos') return true;
        if (filtroEnquete === 'pendente') {
            return e.status === 'pendente' || (e.aprovacao_sindico || 'não').toLowerCase() === 'não';
        }
        return e.status === filtroEnquete;
    });

    const parseOpcoes = (opcoesData: any) => {
        if (!opcoesData) return [];
        if (Array.isArray(opcoesData)) return opcoesData;
        try {
            return JSON.parse(opcoesData);
        } catch {
            return [];
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando painel de enquetes adm...</p>
            </div>
        );
    }

    if (!session || !memberData) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-[2.5rem] text-center space-y-4 shadow-sm">
                    <div className="mx-auto w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-2">
                        <ShieldAlert size={24} />
                    </div>
                    <h1 className="text-xl font-black text-zinc-900">Acesso restrito</h1>
                    <p className="text-sm text-zinc-500">Seu perfil não possui privilégios administrativos para moderar enquetes.</p>
                    <Link href="/condo/adm" className="inline-block bg-zinc-900 hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                        Voltar ao Painel
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 pt-6 px-4 md:px-10 flex flex-col justify-between overflow-x-hidden">
            <div>
                {/* Header Superior */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-auto h-auto bg-blue-600 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0 self-stretch">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Moderação e Aprovação</span>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5 text-zinc-900">
                                    <span className="md:hidden text-black">{formatarNomePrimeiroEUltimo(memberData?.condominio?.nome)}</span>
                                    <span className="hidden md:inline">{memberData?.condominio?.nome || "Condomínio"}</span>
                                </h1>
                            </div>
                        </div>

                        {/* Botão Nova Enquete Oficial e Voltar */}
                        <div className="flex items-center justify-end gap-3 self-end md:self-auto w-full md:w-auto">
                            <button
                                onClick={() => setIsPopupOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0"
                            >
                                <Plus size={14} /> Nova Enquete Oficial
                            </button>

                            <button
                                onClick={() => router.back()}
                                className="group relative hidden md:flex items-center justify-center gap-1.5 h-9 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 overflow-hidden shrink-0 cursor-pointer"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                                <ArrowLeft size={12} className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out" />
                                <span>Voltar</span>
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-xs md:text-sm text-zinc-500 font-medium mb-8">
                    Valide e aprove as enquetes oficiais criadas pela comunidade (inicialmente definidas como &quot;Não&quot; até a validação do síndico). Acompanhe também as sugestões recebidas.
                </p>

                {feedbackMessage && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} /> {feedbackMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* COLUNA 1: APROVAÇÃO E MODERAÇÃO DE ENQUETES OFICIAIS */}
                    <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 mb-4 gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Vote size={18} />
                                    </div>
                                    <h3 className="font-bold text-sm md:text-base text-zinc-800">Aprovação Enquetes</h3>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl w-full sm:w-auto">
                                        <Filter size={12} className="text-zinc-400 shrink-0" />
                                        <select
                                            value={filtroEnquete}
                                            onChange={(e) => setFiltroEnquete(e.target.value)}
                                            className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-zinc-600 outline-none cursor-pointer w-full"
                                        >
                                            <option value="todos">Todos Status</option>
                                            <option value="pendente">Pendentes / Não Aprovadas</option>
                                            <option value="ativa">Ativas</option>
                                            <option value="encerrada">Encerradas</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {enquetesFiltradas.length === 0 ? (
                                <div className="text-center py-12 space-y-2">
                                    <FileText className="mx-auto text-zinc-300" size={32} />
                                    <p className="text-zinc-400 text-xs font-medium">Nenhuma enquete encontrada com o filtro selecionado.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                                    {enquetesFiltradas.map((e) => {
                                        const listaOpcoes = parseOpcoes(e.opcoes);
                                        const aprovada = (e.aprovacao_sindico || 'não').toLowerCase() === 'sim';
                                        return (
                                            <div key={e.id} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3">
                                                {/* Cabeçalho do Card: No mobile com o badge à esquerda e o botão V/X à direita */}
                                                <div className="flex flex-row md:items-center justify-between gap-2">
                                                    <div className="flex items-center">
                                                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${aprovada ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                            Aprovação: {aprovada ? 'Sim' : 'Não'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        {/* Versão Desktop (Mantida) */}
                                                        <div className="hidden md:flex items-center gap-1">
                                                            {!aprovada ? (
                                                                <button
                                                                    onClick={() => handleAtualizarStatusEnquete(e.id, 'ativa', 'sim')}
                                                                    disabled={actionLoading}
                                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                                                                >
                                                                    <Check size={12} /> Aprovar
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAtualizarStatusEnquete(e.id, 'pendente', 'não')}
                                                                    disabled={actionLoading}
                                                                    className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                                                >
                                                                    Desaprovar
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Versão Mobile (Botão V ou X correspondente) */}
                                                        <div className="flex md:hidden items-center">
                                                            {!aprovada ? (
                                                                <button
                                                                    onClick={() => handleAtualizarStatusEnquete(e.id, 'ativa', 'sim')}
                                                                    disabled={actionLoading}
                                                                    className="w-7 h-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer shadow-sm"
                                                                    title="Aprovar"
                                                                >
                                                                    ✓
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAtualizarStatusEnquete(e.id, 'pendente', 'não')}
                                                                    disabled={actionLoading}
                                                                    className="w-7 h-7 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer shadow-sm"
                                                                    title="Desaprovar"
                                                                >
                                                                    ✕
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <h4 className="font-bold text-xs text-zinc-900">{e.titulo}</h4>
                                                <p className="text-xs text-zinc-500 leading-relaxed whitespace-pre-line">{e.descricao}</p>

                                                {listaOpcoes.length > 0 && (
                                                    <div className="pt-2 flex flex-wrap gap-1.5">
                                                        {listaOpcoes.map((op: any, idx: number) => (
                                                            <span key={idx} className="bg-white border border-zinc-200 text-zinc-700 text-[10px] px-2.5 py-1 rounded-lg font-medium">
                                                                • {op.texto}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="text-[10px] text-zinc-400 pt-2 border-t border-zinc-200/60 flex justify-between items-center">
                                                    <span>Criada em: {new Date(e.criado_em).toLocaleDateString('pt-BR')}</span>
                                                    <span className="font-bold text-blue-600">{listaOpcoes.length} Opções</span>
                                                </div>

                                                {/* Lixeira com observação à frente (Centralizada ao meio no mobile) */}
                                                <div className="pt-2 flex items-center justify-center md:justify-start gap-2">
                                                    <button
                                                        onClick={() => handleExcluirEnqueteOficial(e.id)}
                                                        disabled={actionLoading}
                                                        className="p-1.5 bg-zinc-100 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                                                        title="Excluir Enquete"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                    <span className="text-[10px] font-medium text-zinc-500">Excluir registro</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUNA 2: SUGESTÕES DOS MORADORES */}
                    <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 mb-4 gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Clock size={18} />
                                    </div>
                                    <h3 className="font-bold text-sm md:text-base text-zinc-800">Sugestões moradores</h3>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl w-full sm:w-auto">
                                        <Filter size={12} className="text-zinc-400 shrink-0" />
                                        <select
                                            value={filtroSugestao}
                                            onChange={(e) => setFiltroSugestao(e.target.value)}
                                            className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-zinc-600 outline-none cursor-pointer w-full"
                                        >
                                            <option value="todos">Todos Status</option>
                                            <option value="pendente">Pendentes</option>
                                            <option value="em_andamento">Em Andamento</option>
                                            <option value="resolvido">Resolvidos</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {sugestoesFiltradas.length === 0 ? (
                                <div className="text-center py-12 space-y-2">
                                    <Vote className="mx-auto text-zinc-300" size={32} />
                                    <p className="text-zinc-400 text-xs font-medium">Nenhuma sugestão encontrada.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                                    {sugestoesFiltradas.map((s) => (
                                        <div key={s.id} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <select
                                                    value={s.status}
                                                    disabled={actionLoading}
                                                    onChange={(eVal) => handleAtualizarStatusSugestao(s.id, eVal.target.value as any)}
                                                    className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-xl outline-none cursor-pointer transition shadow-sm border ${s.status === 'resolvido' ? 'bg-emerald-600 text-white border-emerald-600' :
                                                            s.status === 'em_andamento' ? 'bg-amber-500 text-white border-amber-500' :
                                                                'bg-indigo-600 text-white border-indigo-600'
                                                        }`}
                                                >
                                                    <option value="pendente" className="bg-white text-zinc-900">Pendente</option>
                                                    <option value="em_andamento" className="bg-white text-zinc-900">Em andamento</option>
                                                    <option value="resolvido" className="bg-white text-zinc-900">Resolvido</option>
                                                </select>
                                            </div>

                                            <h4 className="font-bold text-xs text-zinc-900">{s.titulo}</h4>
                                            <p className="text-xs text-zinc-500 leading-relaxed">{s.descricao}</p>
                                            <div className="text-[10px] text-zinc-400 pt-2 border-t border-zinc-200/60">
                                                Enviado em: {new Date(s.criado_em).toLocaleDateString('pt-BR')}
                                            </div>

                                            {/* Lixeira com observação à frente (Centralizada ao meio no mobile) */}
                                            <div className="pt-2 flex items-center justify-center md:justify-start gap-2">
                                                <button
                                                    onClick={() => handleExcluirSugestao(s.id)}
                                                    disabled={actionLoading}
                                                    className="p-1.5 bg-zinc-100 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                                                    title="Excluir Sugestão"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                                <span className="text-[10px] font-medium text-zinc-500">Excluir registro</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE CRIAÇÃO DE NOVA ENQUETE PELO SÍNDICO (+) */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-250">
                    <div className="bg-white w-full max-w-xl rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-250 my-auto max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={fecharPopupComConfirmacao}
                            className="absolute right-5 top-5 p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-all cursor-pointer z-10"
                            title="Fechar"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-4 mt-1">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                <Sparkles size={22} />
                            </div>
                            <div className="pr-8">
                                <h2 className="text-lg sm:text-xl font-black tracking-tight text-gray-900">Nova Enquete Oficial</h2>
                                <p className="text-[11px] sm:text-xs text-zinc-500">
                                    Cadastre uma votação diretamente ativa para a comunidade.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleCriarEnqueteAdm} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Título da Enquete</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Instalação de nova portaria remota"
                                    value={detalheTitulo}
                                    onChange={(e) => setDetalheTitulo(e.target.value)}
                                    className="w-full px-3.5 py-2.5 sm:py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium text-zinc-900"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Descrição / Contexto</label>
                                <textarea
                                    required
                                    rows={2}
                                    placeholder="Explique os objetivos e detalhes da votação..."
                                    value={detalheDescricao}
                                    onChange={(e) => setDetalheDescricao(e.target.value)}
                                    className="w-full px-3.5 py-2.5 sm:py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium text-zinc-900 resize-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Ganho com a decisão a favor</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Maior segurança e redução de custos"
                                    value={detalheGanho}
                                    onChange={(e) => setDetalheGanho(e.target.value)}
                                    className="w-full px-3.5 py-2.5 sm:py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium text-zinc-900"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Opções de Votação</label>
                                <div className={`space-y-1.5 max-h-28 overflow-y-auto pr-1 ${opcoes.length === 2 && (opcoes[0].texto.toLowerCase() === 'sim' || opcoes[0].texto.toLowerCase() === 'não') && (opcoes[1].texto.toLowerCase() === 'sim' || opcoes[1].texto.toLowerCase() === 'não') ? 'flex space-y-0 gap-2 md:flex md:space-y-0 md:gap-2' : ''}`}>
                                    {opcoes.map((opcao) => (
                                        <div key={opcao.id} className={`flex items-center justify-between bg-zinc-50 border border-zinc-200 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-800 ${opcoes.length === 2 && (opcoes[0].texto.toLowerCase() === 'sim' || opcoes[0].texto.toLowerCase() === 'não') && (opcoes[1].texto.toLowerCase() === 'sim' || opcoes[1].texto.toLowerCase() === 'não') ? 'flex-1 md:flex-1' : ''}`}>
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

                                <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
                                    <input
                                        type="text"
                                        placeholder="Adicionar alternativa..."
                                        value={novoTextoOpcao}
                                        onChange={(e) => setNovoTextoOpcao(e.target.value)}
                                        className="w-full sm:flex-1 px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 text-xs font-medium text-zinc-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAdicionarOpcao}
                                        className="w-full sm:w-auto bg-zinc-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </div>

                            {detalhadaSucesso && (
                                <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center gap-2">
                                    <CheckCircle2 size={16} className="shrink-0" /> {detalhadaSucesso}
                                </p>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={criandoDetalhada}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {criandoDetalhada ? "Publicando Enquete..." : "Publicar Enquete Oficial"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div>
                <div className="mt-24 flex items-center gap-4 mb-12">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
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