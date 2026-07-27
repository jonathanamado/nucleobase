// app/condo/adm/analise_ocorrencias/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
    Building2,
    Loader2,
    Instagram,
    ShieldAlert,
    X,
    AlertCircle,
    Lightbulb,
    CheckCircle2,
    MessageCircle,
    Filter,
    Send,
    ArrowLeft,
    Trash2
} from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserMemberData {
    role: string;
    condominio_id: string;
    condominio: {
        nome: string;
    };
}

interface ItemOcorrenciaSugestao {
    id: string;
    condominio_id: string;
    tipo: 'ocorrencia' | 'sugestao';
    titulo: string;
    descricao: string;
    solicitante?: string;
    unidade?: string;
    status: 'pendente' | 'em_andamento' | 'resolvido';
    criado_em: string;
}

export default function AnaliseOcorrenciasAdmPage() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [memberData, setMemberData] = useState<UserMemberData | null>(null);
    const [itens, setItens] = useState<ItemOcorrenciaSugestao[]>([]);

    // Estados de Filtro por Card ('todos' | 'pendente' | 'em_andamento' | 'resolvido')
    const [filtroOcorrencia, setFiltroOcorrencia] = useState<string>('todos');
    const [filtroSugestao, setFiltroSugestao] = useState<string>('todos');

    // Estado do Popup de Envio de Devolutiva via WhatsApp para um item específico
    const [showModalWhatsApp, setShowModalWhatsApp] = useState(false);
    const [whatsappItemSelecionado, setWhatsappItemSelecionado] = useState<ItemOcorrenciaSugestao | null>(null);
    const [mensagemDevolutiva, setMensagemDevolutiva] = useState("");

    const [feedbackMessage, setFeedbackMessage] = useState("");

    // Função auxiliar para retornar apenas o primeiro e o último nome
    const formatarNomePrimeiroEUltimo = (nomeCompleto?: string) => {
        if (!nomeCompleto) return "";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length === 0) return "";
        if (partes.length === 1) return partes[0];
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    const verifyAccessAndLoadData = async () => {
        try {
            setLoading(true);

            const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !currentSession) {
                setSession(null);
                setMemberData(null);
                setItens([]);
                setLoading(false);
                return;
            }

            setSession(currentSession);
            const userId = currentSession.user.id;

            const { data, error } = await supabase
                .from("condominio_membros")
                .select(`
                    role,
                    condominio_id,
                    acesso_app,
                    condominio:condominios ( nome )
                `)
                .eq("user_id", userId)
                .eq("acesso_app", true)
                .order("role", { ascending: false })
                .order("criado_em", { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0 && data[0].condominio) {
                setMemberData(data[0] as unknown as UserMemberData);
                await loadOcorrenciasSugestoes(data[0].condominio_id);
            } else {
                setMemberData(null);
                setItens([]);
            }
        } catch (e) {
            console.error("Erro ao verificar acesso administrativo:", e);
            setMemberData(null);
            setItens([]);
        } finally {
            setLoading(false);
        }
    };

    const loadOcorrenciasSugestoes = async (condoId: string) => {
        const { data, error } = await supabase
            .from("condominio_ocorrencias")
            .select("*")
            .eq("condominio_id", condoId)
            .order("criado_em", { ascending: false });

        if (!error && data) {
            setItens(data as ItemOcorrenciaSugestao[]);
        }
    };

    useEffect(() => {
        verifyAccessAndLoadData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                await verifyAccessAndLoadData();
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setMemberData(null);
                setItens([]);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Função para o síndico alterar o status de um item diretamente na lista suspensa do card
    const handleAtualizarStatus = async (id: string, novoStatus: 'pendente' | 'em_andamento' | 'resolvido') => {
        if (!memberData) return;

        setActionLoading(true);
        setFeedbackMessage("");

        try {
            const { error } = await supabase
                .from("condominio_ocorrencias")
                .update({ status: novoStatus })
                .eq("id", id);

            if (error) throw error;

            setFeedbackMessage(`Status atualizado para "${novoStatus.replace('_', ' ')}" com sucesso!`);
            await loadOcorrenciasSugestoes(memberData.condominio_id);

            setTimeout(() => {
                setFeedbackMessage("");
            }, 3000);
        } catch (err: any) {
            console.error("Erro ao atualizar status:", err);
            alert("Erro ao atualizar status: " + (err?.message || "Erro desconhecido"));
        } finally {
            setActionLoading(false);
        }
    };

    // Função de Moderação: Excluir ocorrência ou sugestão com tratamento de políticas RLS do Supabase
    const handleExcluirItem = async (id: string) => {
        if (!confirm("Deseja realmente excluir este registro? Esta ação não poderá ser desfeita.")) return;
        if (!memberData) return;

        setActionLoading(true);
        setFeedbackMessage("");

        try {
            const { data, error } = await supabase
                .from("condominio_ocorrencias")
                .delete()
                .eq("id", id)
                .select();

            if (error) throw error;

            if (!data || data.length === 0) {
                alert("A exclusão foi bloqueada pelas políticas de segurança (RLS) do banco de dados para este registro. Verifique as permissões da tabela condominio_ocorrencias.");
                return;
            }

            setFeedbackMessage("Registro excluído com sucesso!");
            await loadOcorrenciasSugestoes(memberData.condominio_id);

            setTimeout(() => {
                setFeedbackMessage("");
            }, 3000);
        } catch (err: any) {
            console.error("Erro ao excluir item:", err);
            alert("Erro ao excluir item: " + (err?.message || "Erro desconhecido"));
        } finally {
            setActionLoading(false);
        }
    };

    // Função para abrir o popup de devolutiva para um item específico
    const abrirModalDevolutiva = (item: ItemOcorrenciaSugestao) => {
        setWhatsappItemSelecionado(item);
        setMensagemDevolutiva(`Olá! Passando para dar uma devolutiva sobre a sua ${item.tipo === 'ocorrencia' ? 'ocorrência' : 'sugestão'} "${item.titulo}": `);
        setShowModalWhatsApp(true);
    };

    const handleEnviarDevolutivaWhatsApp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!whatsappItemSelecionado) return;

        const tipoFormatado = whatsappItemSelecionado.tipo === 'ocorrencia' ? 'Ocorrência' : 'Sugestão';
        const statusFormatado = whatsappItemSelecionado.status.toUpperCase();

        let mensagem = `*Devolutiva Adm - ${memberData?.condominio?.nome || 'Condomínio'}*\n\n`;
        mensagem += `*${tipoFormatado}:* ${whatsappItemSelecionado.titulo}\n`;
        mensagem += `*Status Atual:* ${statusFormatado}\n\n`;
        mensagem += `*Mensagem da Administração:*\n${mensagemDevolutiva.trim()}`;

        const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

        window.open(urlWhatsApp, '_blank');
        setShowModalWhatsApp(false);
        setWhatsappItemSelecionado(null);
        setMensagemDevolutiva("");
    };

    const ocorrenciasFiltradas = itens.filter(i => {
        if (i.tipo !== 'ocorrencia') return false;
        if (filtroOcorrencia === 'todos') return true;
        return i.status === filtroOcorrencia;
    });

    const sugestoesFiltradas = itens.filter(i => {
        if (i.tipo !== 'sugestao') return false;
        if (filtroSugestao === 'todos') return true;
        return i.status === filtroSugestao;
    });

    const formatarTextoQuantidade = (qtd: number) => {
        if (qtd === 0) return "0 itens";
        if (qtd === 1) return "1 item";
        return `${qtd} itens`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando painel do síndico...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-[2.5rem] text-center space-y-4 shadow-sm">
                    <h1 className="text-xl font-black text-zinc-900">Acesso restrito</h1>
                    <p className="text-sm text-zinc-500">Faça login com sua conta administrativa para gerenciar as ocorrências.</p>
                    <Link href="/condo/dashboard/adm" className="inline-block bg-zinc-900 hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                        Ir para Login Administrativo
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
                        Seu perfil não possui privilégios administrativos ativos neste condomínio.
                    </p>
                    <Link href="/condo/dashboard/adm" className="inline-block bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors mt-2">
                        Voltar ao Painel
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 pt-6 px-4 md:px-10 flex flex-col justify-between overflow-x-hidden">
            {/* Header */}
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-auto h-auto bg-blue-600 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0 self-stretch">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Análise Ocorrências</span>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5 text-zinc-900">Apoio interno</h1>
                            </div>
                        </div>

                        <button
                            onClick={() => router.back()}
                            className="group relative hidden md:flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 overflow-hidden shrink-0 cursor-pointer"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                            <ArrowLeft size={12} className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out" />
                            <span>Voltar</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <p className="text-xs md:text-sm text-zinc-500 font-medium">
                        Gerencie o status, realize devolutivas e modere os chamados enviados pelos moradores.
                    </p>
                </div>

                {feedbackMessage && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} /> {feedbackMessage}
                    </div>
                )}

                {/* Grid Vertical: Ocorrências e Sugestões dispostas uma abaixo da outra */}
                <div className="flex flex-col gap-6 mb-12">
                    {/* Bloco de Ocorrências */}
                    <div className="bg-white border border-zinc-200 rounded-[2rem] p-4 md:p-6 shadow-sm flex flex-col justify-between max-w-full">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 mb-4 gap-3">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                                        <AlertCircle size={18} />
                                    </div>
                                    <h3 className="font-bold text-sm md:text-base text-zinc-800 truncate">Ocorrências do Condomínio</h3>
                                </div>

                                <div className="flex items-center justify-between md:justify-start gap-2 w-full sm:w-auto">
                                    <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
                                        <Filter size={12} className="text-zinc-400" />
                                        <select
                                            value={filtroOcorrencia}
                                            onChange={(e) => setFiltroOcorrencia(e.target.value)}
                                            className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-zinc-600 outline-none cursor-pointer"
                                        >
                                            <option value="todos">Todos Status</option>
                                            <option value="pendente">Pendentes</option>
                                            <option value="em_andamento">Em Andamento</option>
                                            <option value="resolvido">Resolvidos</option>
                                        </select>
                                    </div>

                                    <span className="hidden md:inline-block text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 px-3 py-1.5 rounded-xl shrink-0">
                                        {formatarTextoQuantidade(ocorrenciasFiltradas.length)}
                                    </span>
                                </div>
                            </div>

                            {ocorrenciasFiltradas.length === 0 ? (
                                <div className="text-center py-10 space-y-2">
                                    <AlertCircle className="mx-auto text-zinc-300" size={32} />
                                    <p className="text-zinc-400 text-xs font-medium">Nenhuma ocorrência encontrada com o filtro selecionado.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                    {ocorrenciasFiltradas.map((item) => (
                                        <div key={item.id} className="p-3.5 md:p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3 overflow-hidden">
                                            {/* Linha Superior: Status e Botões de Ação na Lateral Direita */}
                                            <div className="flex items-center justify-between gap-2">
                                                <select
                                                    value={item.status}
                                                    disabled={actionLoading}
                                                    onChange={(e) => handleAtualizarStatus(item.id, e.target.value as any)}
                                                    className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-xl outline-none cursor-pointer transition shadow-sm border ${item.status === 'resolvido'
                                                        ? 'bg-emerald-600 text-white border-emerald-600' :
                                                        item.status === 'em_andamento'
                                                            ? 'bg-amber-500 text-white border-amber-500' :
                                                            'bg-rose-500 text-white border-rose-500'
                                                        }`}
                                                >
                                                    <option value="pendente" className="bg-white text-zinc-900">Pendente</option>
                                                    <option value="em_andamento" className="bg-white text-zinc-900">Em andamento</option>
                                                    <option value="resolvido" className="bg-white text-zinc-900">Resolvido</option>
                                                </select>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                        onClick={() => abrirModalDevolutiva(item)}
                                                        className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all cursor-pointer"
                                                        title="Enviar Devolutiva via WhatsApp"
                                                    >
                                                        <MessageCircle size={15} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleExcluirItem(item.id)}
                                                        disabled={actionLoading}
                                                        className="p-1.5 bg-zinc-100 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                                        title="Excluir Registro"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Informações na Linha Abaixo */}
                                            <h4 className="font-bold text-xs text-zinc-900 pt-1 break-words">{item.titulo}</h4>

                                            <p className="text-xs text-zinc-500 leading-relaxed break-words">{item.descricao}</p>

                                            {(item.solicitante || item.unidade) && (
                                                <div className="flex flex-wrap gap-1 text-[10px] text-zinc-400 pt-1 border-t border-zinc-200/60">
                                                    <span className="break-words">
                                                        <strong className="text-zinc-900 font-bold">Solicitante:</strong> <span className="font-normal text-zinc-700">{formatarNomePrimeiroEUltimo(item.solicitante)}{item.unidade ? ` - ${item.unidade}` : ""}</span>
                                                    </span>
                                                </div>
                                            )}

                                            <div className="text-[10px] text-zinc-400 pt-2 border-t border-zinc-200/60">
                                                <strong className="text-zinc-900 font-bold">Data solicitação:</strong> <span className="font-normal text-zinc-700">{new Date(item.criado_em).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bloco de Sugestões */}
                    <div className="bg-white border border-zinc-200 rounded-[2rem] p-4 md:p-6 shadow-sm flex flex-col justify-between max-w-full">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 mb-4 gap-3">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Lightbulb size={18} />
                                    </div>
                                    <h3 className="font-bold text-sm md:text-base text-zinc-800 truncate">Sugestões Recebidas</h3>
                                </div>

                                <div className="flex items-center justify-between md:justify-start gap-2 w-full sm:w-auto">
                                    <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
                                        <Filter size={12} className="text-zinc-400" />
                                        <select
                                            value={filtroSugestao}
                                            onChange={(e) => setFiltroSugestao(e.target.value)}
                                            className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-zinc-600 outline-none cursor-pointer"
                                        >
                                            <option value="todos">Todos Status</option>
                                            <option value="pendente">Pendentes</option>
                                            <option value="em_andamento">Em Andamento</option>
                                            <option value="resolvido">Resolvidos</option>
                                        </select>
                                    </div>

                                    <span className="hidden md:inline-block text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 px-3 py-1.5 rounded-xl shrink-0">
                                        {formatarTextoQuantidade(sugestoesFiltradas.length)}
                                    </span>
                                </div>
                            </div>

                            {sugestoesFiltradas.length === 0 ? (
                                <div className="text-center py-10 space-y-2">
                                    <Lightbulb className="mx-auto text-zinc-300" size={32} />
                                    <p className="text-zinc-400 text-xs font-medium">Nenhuma sugestão encontrada com o filtro selecionado.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                    {sugestoesFiltradas.map((item) => (
                                        <div key={item.id} className="p-3.5 md:p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3 overflow-hidden">
                                            {/* Linha Superior: Status e Botões de Ação na Lateral Direita */}
                                            <div className="flex items-center justify-between gap-2">
                                                <select
                                                    value={item.status}
                                                    disabled={actionLoading}
                                                    onChange={(e) => handleAtualizarStatus(item.id, e.target.value as any)}
                                                    className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-xl outline-none cursor-pointer transition shadow-sm border ${item.status === 'resolvido'
                                                        ? 'bg-emerald-600 text-white border-emerald-600' :
                                                        item.status === 'em_andamento'
                                                            ? 'bg-amber-500 text-white border-amber-500' :
                                                            'bg-indigo-600 text-white border-indigo-600'
                                                        }`}
                                                >
                                                    <option value="pendente" className="bg-white text-zinc-900">Pendente</option>
                                                    <option value="em_andamento" className="bg-white text-zinc-900">Em andamento</option>
                                                    <option value="resolvido" className="bg-white text-zinc-900">Resolvido</option>
                                                </select>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                        onClick={() => abrirModalDevolutiva(item)}
                                                        className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all cursor-pointer"
                                                        title="Enviar Devolutiva via WhatsApp"
                                                    >
                                                        <MessageCircle size={15} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleExcluirItem(item.id)}
                                                        disabled={actionLoading}
                                                        className="p-1.5 bg-zinc-100 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                                        title="Excluir Registro"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Informações na Linha Abaixo */}
                                            <h4 className="font-bold text-xs text-zinc-900 pt-1 break-words">{item.titulo}</h4>

                                            <p className="text-xs text-zinc-500 leading-relaxed break-words">{item.descricao}</p>

                                            {(item.solicitante || item.unidade) && (
                                                <div className="flex flex-wrap gap-1 text-[10px] text-zinc-400 pt-1 border-t border-zinc-200/60">
                                                    <span className="break-words">
                                                        <strong className="text-zinc-900 font-bold">Solicitante:</strong> <span className="font-normal text-zinc-700">{formatarNomePrimeiroEUltimo(item.solicitante)}{item.unidade ? ` - ${item.unidade}` : ""}</span>
                                                    </span>
                                                </div>
                                            )}

                                            <div className="text-[10px] text-zinc-400 pt-2 border-t border-zinc-200/60">
                                                <strong className="text-zinc-900 font-bold">Data solicitação:</strong> <span className="font-normal text-zinc-700">{new Date(item.criado_em).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* POPUP: ENVIAR DEVOLUTIVA VIA WHATSAPP */}
            {showModalWhatsApp && whatsappItemSelecionado && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowModalWhatsApp(false)}
                            className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-zinc-900 tracking-tight">Encaminhar Devolutiva</h2>
                                    <p className="text-xs text-zinc-500">Enviar resposta via WhatsApp ao solicitante.</p>
                                </div>
                            </div>

                            <form onSubmit={handleEnviarDevolutivaWhatsApp} className="space-y-4 pt-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Mensagem de Devolutiva</label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={mensagemDevolutiva}
                                        onChange={(e) => setMensagemDevolutiva(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 text-xs font-medium resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition shadow-md shadow-emerald-100 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                                >
                                    <Send size={14} /> Enviar Mensagem no WhatsApp
                                </button>
                            </form>
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