// app/condo/dashboard/ocorrencias-e-sugestoes/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    Building2,
    Loader2,
    Instagram,
    ShieldAlert,
    Plus,
    X,
    AlertCircle,
    Lightbulb,
    CheckCircle2,
    MessageCircle,
    Filter,
    Send,
    ArrowLeft
} from "lucide-react";

interface UserMemberData {
    role: string;
    condominio_id: string;
    condominio: {
        nome: string;
    } | null;
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

export default function OcorrenciasSugestoesPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [memberData, setMemberData] = useState<UserMemberData | null>(null);
    const [itens, setItens] = useState<ItemOcorrenciaSugestao[]>([]);

    // Estados dos Popups de Cadastro
    const [showModalOcorrencia, setShowModalOcorrencia] = useState(false);
    const [showModalSugestao, setShowModalSugestao] = useState(false);

    // Campos do Formulário Compartilhados / Comuns
    const [tituloInput, setTituloInput] = useState("");
    const [descricaoInput, setDescricaoInput] = useState("");
    const [solicitanteInput, setSolicitanteInput] = useState("");
    const [unidadeInput, setUnidadeInput] = useState("");
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");

    // Estados de Filtro por Card ('todos' | 'pendente' | 'em_andamento' | 'resolvido')
    const [filtroOcorrencia, setFiltroOcorrencia] = useState<string>('todos');
    const [filtroSugestao, setFiltroSugestao] = useState<string>('todos');

    // Estado do Popup de Envio para o WhatsApp
    const [showModalWhatsApp, setShowModalWhatsApp] = useState(false);
    const [whatsappItemIdSelecionado, setWhatsappItemIdSelecionado] = useState("");

    const isMountedRef = useRef(true);

    const formatarNomePrimeiroEUltimo = (nomeCompleto: string) => {
        if (!nomeCompleto) return "";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length <= 1) return partes[0] || "";
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    const loadOcorrenciasSugestoes = async (condoId: string) => {
        const { data, error } = await supabase
            .from("condominio_ocorrencias")
            .select("*")
            .eq("condominio_id", condoId)
            .order("criado_em", { ascending: false });

        if (!error && data && isMountedRef.current) {
            setItens(data as ItemOcorrenciaSugestao[]);
        }
    };

    const verifyAccessAndLoadData = async (currentSession: any, retries = 2) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setMemberData(null);
                    setItens([]);
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
                        condominio_id,
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
                if (data && data.length > 0 && data[0].condominio) {
                    setMemberData(data[0] as unknown as UserMemberData);
                    await loadOcorrenciasSugestoes(data[0].condominio_id);
                } else {
                    setMemberData(null);
                    setItens([]);
                }
            }
        } catch (e: any) {
            const errString = e?.message || JSON.stringify(e);
            if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                console.error("Erro ao verificar acesso:", errString);
            }
            if (isMountedRef.current) {
                setMemberData(null);
                setItens([]);
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
                setItens([]);
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
        setItens([]);
        setLoading(false);
        window.dispatchEvent(new Event("storage"));
    };

    const handleSaveItem = async (e: React.FormEvent, tipoItem: 'ocorrencia' | 'sugestao') => {
        e.preventDefault();
        if (!memberData || !session) return;

        setActionLoading(true);
        setFormError('');
        setFormSuccess('');

        try {
            const { error } = await supabase
                .from("condominio_ocorrencias")
                .insert([
                    {
                        condominio_id: memberData.condominio_id,
                        tipo: tipoItem,
                        titulo: tituloInput.trim(),
                        descricao: descricaoInput.trim(),
                        solicitante: solicitanteInput.trim() || null,
                        unidade: unidadeInput.trim() || null,
                        status: 'pendente',
                        criado_por: session.user.id
                    }
                ]);

            if (error) throw error;

            setFormSuccess(tipoItem === 'ocorrencia' ? "Ocorrência registrada com sucesso!" : "Sugestão enviada com sucesso!");
            setTituloInput('');
            setDescricaoInput('');
            setSolicitanteInput('');
            setUnidadeInput('');
            setShowModalOcorrencia(false);
            setShowModalSugestao(false);
            await loadOcorrenciasSugestoes(memberData.condominio_id);
        } catch (err: any) {
            console.error("Erro ao salvar registro:", err);
            setFormError(err?.message || "Erro ao registrar. Verifique se a tabela 'condominio_ocorrencias' existe no banco.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEnviarWhatsApp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!whatsappItemIdSelecionado) return;

        const itemEncontrado = itens.find(i => i.id === whatsappItemIdSelecionado);
        if (!itemEncontrado) return;

        const tipoFormatado = itemEncontrado.tipo === 'ocorrencia' ? 'Ocorrência' : 'Sugestão';
        const statusFormatado = itemEncontrado.status.toUpperCase();

        let mensagem = `*${tipoFormatado} - ${memberData?.condominio?.nome || 'Condomínio'}*\n\n`;
        mensagem += `*Título:* ${itemEncontrado.titulo}\n`;
        mensagem += `*Descrição:* ${itemEncontrado.descricao}\n`;
        if (itemEncontrado.solicitante || itemEncontrado.unidade) {
            mensagem += `*Solicitante:* ${itemEncontrado.solicitante || "Não informado"}${itemEncontrado.unidade ? ` - ${itemEncontrado.unidade}` : ''}\n`;
        }
        mensagem += `*Status:* ${statusFormatado}\n`;
        mensagem += `*Data solicitação:* ${new Date(itemEncontrado.criado_em).toLocaleDateString('pt-BR')}`;

        const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

        const newWindow = window.open(urlWhatsApp, '_blank');
        if (newWindow) newWindow.opener = null;

        setShowModalWhatsApp(false);
        setWhatsappItemIdSelecionado("");
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
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando livro digital...</p>
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
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Administração</span>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1 text-zinc-900">
                                    <span className="md:hidden text-black">{formatarNomePrimeiroEUltimo(memberData?.condominio?.nome || "")}</span>
                                    <span className="hidden md:inline">{memberData?.condominio?.nome || "Condomínio"}</span>
                                </h1>
                            </div>
                        </div>

                        <button
                            onClick={() => window.history.back()}
                            className="group relative hidden md:flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 self-start md:self-auto overflow-hidden cursor-pointer shrink-0"
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

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <p className="text-xs md:text-sm text-zinc-500 font-medium">
                        Livro digital integrado para registro transparente de ocorrências operacionais e envio de sugestões para a administração.
                    </p>

                    <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                        <button
                            onClick={() => { setShowModalOcorrencia(true); setFormError(''); setFormSuccess(''); }}
                            className="relative group overflow-hidden bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white p-3.5 md:px-5 md:py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-rose-600/20 active:scale-95 border border-rose-500/30 text-center leading-tight cursor-pointer"
                        >
                            <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                <Plus size={14} />
                            </div>
                            <span className="tracking-wider">
                                Nova<br />ocorrência
                            </span>
                        </button>

                        <button
                            onClick={() => { setShowModalSugestao(true); setFormError(''); setFormSuccess(''); }}
                            className="relative group overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white p-3.5 md:px-5 md:py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-indigo-600/20 active:scale-95 border border-indigo-500/30 text-center leading-tight cursor-pointer"
                        >
                            <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                <Plus size={14} />
                            </div>
                            <span className="tracking-wider">
                                Enviar<br />sugestão
                            </span>
                        </button>
                    </div>
                </div>

                {formSuccess && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} /> {formSuccess}
                    </div>
                )}

                <div className="flex flex-col gap-6 mb-12">
                    <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 mb-4 gap-3">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                                        <AlertCircle size={18} />
                                    </div>
                                    <h3 className="font-bold text-sm md:text-base text-zinc-800 truncate">Ocorrências Registradas</h3>
                                </div>

                                <div className="flex items-center justify-end md:justify-start gap-2 w-full sm:w-auto">
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
                                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                                    {ocorrenciasFiltradas.map((item) => (
                                        <div key={item.id} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-2">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-xs text-zinc-900">{item.titulo}</h4>
                                                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${item.status === 'resolvido' ? 'bg-emerald-50 text-emerald-600' :
                                                    item.status === 'em_andamento' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-rose-50 text-rose-600'
                                                    }`}>
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 leading-relaxed">{item.descricao}</p>

                                            {(item.solicitante || item.unidade) && (
                                                <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-200/60">
                                                    <span className="font-bold text-zinc-700">Solicitante:</span>{" "}
                                                    <span className="text-zinc-600">
                                                        {item.solicitante || "Não informado"}
                                                        {item.unidade ? ` - ${item.unidade}` : ""}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="text-[10px] text-zinc-400 pt-0.5">
                                                <span className="font-bold text-zinc-700">Data solicitação:</span>{" "}
                                                <span className="text-zinc-600">{new Date(item.criado_em).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 mb-4 gap-3">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Lightbulb size={18} />
                                    </div>
                                    <h3 className="font-bold text-sm md:text-base text-zinc-800 truncate">Sugestões Enviadas</h3>
                                </div>

                                <div className="flex items-center justify-end md:justify-start gap-2 w-full sm:w-auto">
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
                                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                                    {sugestoesFiltradas.map((item) => (
                                        <div key={item.id} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-2">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-xs text-zinc-900">{item.titulo}</h4>
                                                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${item.status === 'resolvido' ? 'bg-emerald-50 text-emerald-600' :
                                                    item.status === 'em_andamento' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-indigo-50 text-indigo-600'
                                                    }`}>
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 leading-relaxed">{item.descricao}</p>

                                            {(item.solicitante || item.unidade) && (
                                                <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-200/60">
                                                    <span className="font-bold text-zinc-700">Solicitante:</span>{" "}
                                                    <span className="text-zinc-600">
                                                        {item.solicitante || "Não informado"}
                                                        {item.unidade ? ` - ${item.unidade}` : ""}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="text-[10px] text-zinc-400 pt-0.5">
                                                <span className="font-bold text-zinc-700">Data solicitação:</span>{" "}
                                                <span className="text-zinc-600">{new Date(item.criado_em).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 md:p-8 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center md:text-left">
                        <h3 className="font-bold text-base text-zinc-900">
                            <span className="md:hidden">Encaminhar via WhatsApp</span>
                            <span className="hidden md:inline">Encaminhar Registro via WhatsApp</span>
                        </h3>
                        <p className="text-xs text-zinc-500 max-w-xl leading-relaxed">
                            <span className="md:hidden">Selecione a opção desejada e envie via whatsapp</span>
                            <span className="hidden md:inline">Selecione qualquer ocorrência ou sugestão registrada no livro digital e compartilhe os detalhes instantaneamente com a administração, portaria ou grupos de apoio do condomínio.</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModalWhatsApp(true)}
                        className="relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-emerald-600/20 active:scale-95 border border-emerald-500/30 shrink-0 w-full md:w-auto cursor-pointer"
                    >
                        <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <MessageCircle size={18} />
                        </div>
                        <span>Enviar via WhatsApp</span>
                    </button>
                </div>
            </div>

            {showModalOcorrencia && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowModalOcorrencia(false)}
                            className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-zinc-900 tracking-tight">Nova Ocorrência</h2>
                                    <p className="text-xs text-zinc-500">Reporte problemas ou incidentes operacionais.</p>
                                </div>
                            </div>

                            <form onSubmit={(e) => handleSaveItem(e, 'ocorrencia')} className="space-y-3.5 pt-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Título do Ocorrido</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Lâmpada queimada no corredor"
                                        value={tituloInput}
                                        onChange={(e) => setTituloInput(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-rose-400 text-xs font-medium"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Descrição Detalhada</label>
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Descreva o local e detalhes do ocorrido..."
                                        value={descricaoInput}
                                        onChange={(e) => setDescricaoInput(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-rose-400 text-xs font-medium resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Solicitante</label>
                                        <input
                                            type="text"
                                            placeholder="Nome (opcional)"
                                            value={solicitanteInput}
                                            onChange={(e) => setSolicitanteInput(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-rose-400 text-xs font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Unidade</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Apto 101"
                                            value={unidadeInput}
                                            onChange={(e) => setUnidadeInput(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-rose-400 text-xs font-medium"
                                        />
                                    </div>
                                </div>

                                {formError && (
                                    <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl text-center">
                                        {formError}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition shadow-md shadow-rose-100 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                                >
                                    {actionLoading ? "Registrando..." : "Confirmar Ocorrência"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showModalSugestao && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowModalSugestao(false)}
                            className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                    <Lightbulb size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-zinc-900 tracking-tight">Enviar Sugestão</h2>
                                    <p className="text-xs text-zinc-500">Compartilhe ideias de melhorias para o condomínio.</p>
                                </div>
                            </div>

                            <form onSubmit={(e) => handleSaveItem(e, 'sugestao')} className="space-y-3.5 pt-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Título da Sugestão</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Instalação de bicicletário"
                                        value={tituloInput}
                                        onChange={(e) => setTituloInput(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Detalhes da Sugestão</label>
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Explique os benefícios e detalhes da sua sugestão..."
                                        value={descricaoInput}
                                        onChange={(e) => setDescricaoInput(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Solicitante</label>
                                        <input
                                            type="text"
                                            placeholder="Nome (opcional)"
                                            value={solicitanteInput}
                                            onChange={(e) => setSolicitanteInput(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Unidade</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Apto 101"
                                            value={unidadeInput}
                                            onChange={(e) => setUnidadeInput(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium"
                                        />
                                    </div>
                                </div>

                                {formError && (
                                    <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl text-center">
                                        {formError}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                                >
                                    {actionLoading ? "Enviando..." : "Enviar Sugestão"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showModalWhatsApp && (
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
                                    <h2 className="text-lg font-black text-zinc-900 tracking-tight">Enviar via WhatsApp</h2>
                                    <p className="text-xs text-zinc-500">Selecione o registro e escolha o contato na sua agenda.</p>
                                </div>
                            </div>

                            <form onSubmit={handleEnviarWhatsApp} className="space-y-4 pt-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Selecionar Ocorrência / Sugestão</label>
                                    <select
                                        required
                                        value={whatsappItemIdSelecionado}
                                        onChange={(e) => setWhatsappItemIdSelecionado(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 text-xs font-medium cursor-pointer"
                                    >
                                        <option value="">-- Escolha um item da lista --</option>
                                        {itens.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                [{item.tipo === 'ocorrencia' ? 'Ocorrência' : 'Sugestão'}] {item.titulo} ({item.status})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <p className="text-[11px] text-zinc-500 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-100 leading-relaxed">
                                    Ao confirmar, o aplicativo do WhatsApp será aberto para você selecionar diretamente o destinatário da sua própria lista de contatos.
                                </p>

                                <button
                                    type="submit"
                                    disabled={!whatsappItemIdSelecionado}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition shadow-md shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                                >
                                    <Send size={14} /> Selecionar Contato no WhatsApp
                                </button>
                            </form>
                        </div>
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