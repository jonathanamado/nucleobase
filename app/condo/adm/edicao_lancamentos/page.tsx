// app/condo/dashboard/adm/edicao_lancamentos/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    Building2,
    Loader2,
    ArrowLeft,
    Instagram,
    FileSpreadsheet,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Edit3,
    X,
    Filter
} from "lucide-react";

interface ContaItem {
    id: string;
    condominio_id: string;
    tipo: 'receita' | 'despesa';
    categoria: string;
    descricao: string;
    valor_previsto: number;
    valor_realizado: number;
    data_competencia: string;
    status: string;
}

export default function EdicaoLancamentosPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [lancamentos, setLancamentos] = useState<ContaItem[]>([]);
    const [filtroTipo, setFiltroTipo] = useState<string>('todos');

    // Estados de Edição
    const [itemEditando, setItemEditando] = useState<ContaItem | null>(null);
    const [categoriaInput, setCategoriaInput] = useState("");
    const [descricaoInput, setDescricaoInput] = useState("");
    const [valorRealizadoInput, setValorRealizadoInput] = useState("");
    const [msgSucesso, setMsgSucesso] = useState("");
    const [msgErro, setMsgErro] = useState("");

    const isMountedRef = useRef(true);

    const loadLancamentos = async (condoId: string) => {
        const { data, error } = await supabase
            .from("condominio_contas")
            .select("*")
            .eq("condominio_id", condoId)
            .order("data_competencia", { ascending: false });

        if (!error && data && isMountedRef.current) {
            setLancamentos(data as ContaItem[]);
        }
    };

    const verifyAndLoad = async (currentSession: any) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setCondominio(null);
                    setLancamentos([]);
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
                    console.error("Erro na consulta Supabase (membros):", errorMsg);
                }
            }

            if (!membroDataList || membroDataList.length === 0) {
                if (isMountedRef.current) {
                    setCondominio(null);
                    setLancamentos([]);
                    setLoading(false);
                }
                return;
            }

            const vinculoAdm = membroDataList.find(
                (m: any) => m.role === 'sindico'
            ) || membroDataList[0];

            let nomeCondominioOficial = vinculoAdm.condominio_nome || "Condomínio";
            if (vinculoAdm.condominio_id) {
                const { data: condoDataReal } = await supabase
                    .from("condominios")
                    .select("nome")
                    .eq("id", vinculoAdm.condominio_id)
                    .maybeSingle();

                if (condoDataReal && condoDataReal.nome) {
                    nomeCondominioOficial = condoDataReal.nome;
                }
            }

            if (isMountedRef.current) {
                setCondominio({
                    id: vinculoAdm.condominio_id,
                    nome: nomeCondominioOficial
                });
                await loadLancamentos(vinculoAdm.condominio_id);
            }
        } catch (e: any) {
            const errString = e?.message || JSON.stringify(e);
            if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                console.warn("Exceção tratada em verifyAndLoad:", errString);
            }
            if (isMountedRef.current) {
                setCondominio(null);
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
                    await verifyAndLoad(currentSession);
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
                    await verifyAndLoad(currentSession);
                }
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setCondominio(null);
                setLancamentos([]);
                setLoading(false);
            }
        });
        authSub = subscription;

        return () => {
            isMountedRef.current = false;
            if (authSub) authSub.unsubscribe();
        };
    }, []);

    // Função de Logout blindada e completa
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
        setCondominio(null);
        setLancamentos([]);
        setLoading(false);
        window.dispatchEvent(new Event("storage"));
    };

    const abrirEdicao = (item: ContaItem) => {
        setItemEditando(item);
        setCategoriaInput(item.categoria);
        setDescricaoInput(item.descricao);
        setValorRealizadoInput(item.valor_realizado.toString());
        setMsgSucesso("");
        setMsgErro("");
    };

    const handleSalvarEdicao = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemEditando || !condominio) return;

        setActionLoading(true);
        setMsgErro("");
        setMsgSucesso("");

        try {
            const { error } = await supabase
                .from("condominio_contas")
                .update({
                    categoria: categoriaInput.trim(),
                    descricao: descricaoInput.trim(),
                    valor_realizado: parseFloat(valorRealizadoInput) || 0
                })
                .eq("id", itemEditando.id);

            if (error) throw error;

            setMsgSucesso("Lançamento atualizado com sucesso!");
            await loadLancamentos(condominio.id);
            setTimeout(() => {
                setItemEditando(null);
                setMsgSucesso("");
            }, 1000);
        } catch (err: any) {
            setMsgErro(err?.message || "Erro ao atualizar lançamento.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleExcluir = async (id: string) => {
        if (!confirm("Deseja realmente excluir este lançamento financeiro?")) return;

        setActionLoading(true);
        const { error } = await supabase
            .from("condominio_contas")
            .delete()
            .eq("id", id);

        if (!error && condominio) {
            await loadLancamentos(condominio.id);
        }
        setActionLoading(false);
    };

    const lancamentosFiltrados = lancamentos.filter(l => {
        if (filtroTipo === 'todos') return true;
        return l.tipo === filtroTipo;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando lançamentos...</p>
            </div>
        );
    }

    if (!session || !condominio) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-[2.5rem] text-center space-y-4 shadow-sm">
                    <h1 className="text-xl font-black text-zinc-900">Acesso restrito</h1>
                    <p className="text-sm text-zinc-500">Faça login como síndico para acessar esta página.</p>
                    <div className="pt-2 flex flex-col gap-2">
                        <Link href="/condo/dashboard/adm" className="inline-block bg-zinc-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                            Voltar ao Painel
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
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-6 md:p-10 flex flex-col justify-between">
            <div>
                {/* Header com botões de navegação e botão Voltar funcional */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-auto h-auto bg-blue-600 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0 self-stretch">
                                <FileSpreadsheet size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Prestação de Contas</span>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5 text-zinc-900">{condominio.nome}</h1>
                            </div>
                        </div>

                        <button
                            onClick={() => window.history.back()}
                            className="group relative hidden md:flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 overflow-hidden shrink-0 cursor-pointer"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                            <ArrowLeft size={12} className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out" />
                            <span>Voltar</span>
                        </button>
                    </div>
                </div>

                {/* Filtros e Quantidade */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <p className="text-xs md:text-sm text-zinc-500 font-medium">
                        Visualize, edite ou exclua os lançamentos de receitas e despesas registradas.
                    </p>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white border border-zinc-200 px-3 py-2 rounded-xl shadow-sm">
                            <Filter size={14} className="text-zinc-400" />
                            <select
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                className="bg-transparent text-xs font-bold uppercase tracking-wider text-zinc-700 outline-none cursor-pointer"
                            >
                                <option value="todos">Todos os Tipos</option>
                                <option value="receita">Receitas</option>
                                <option value="despesa">Despesas</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabela de Lançamentos com coluna de Ações Fixa à Direita */}
                <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm mb-12">
                    {lancamentosFiltrados.length === 0 ? (
                        <div className="text-center py-12 space-y-2">
                            <AlertCircle className="mx-auto text-zinc-300" size={36} />
                            <p className="text-zinc-400 text-sm font-medium">Nenhum lançamento financeiro encontrado.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[450px]">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="sticky top-0 bg-white z-20 border-b border-zinc-100">
                                    <tr>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Categoria</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Descrição</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Competência</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Realizado</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right sticky right-0 bg-white z-30 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] pr-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {lancamentosFiltrados.map((item) => {
                                        const corTextoNatureza = item.tipo === 'receita' ? 'text-blue-600' : 'text-red-600';
                                        return (
                                            <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors group">
                                                <td className={`py-3.5 pr-3 text-xs font-bold ${corTextoNatureza}`}>
                                                    {item.categoria}
                                                </td>
                                                <td className={`py-3.5 pr-3 text-xs font-bold ${corTextoNatureza}`}>
                                                    {item.descricao || '-'}
                                                </td>
                                                <td className={`py-3.5 pr-3 text-xs font-bold ${corTextoNatureza}`}>
                                                    {item.data_competencia ? new Date(item.data_competencia).toLocaleDateString('pt-BR', { timeZone: 'UTC', month: '2-digit', year: 'numeric' }) : '-'}
                                                </td>
                                                <td className={`py-3.5 pr-3 text-xs font-bold ${corTextoNatureza}`}>
                                                    R$ {Number(item.valor_realizado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-3.5 text-right sticky right-0 bg-white group-hover:bg-zinc-50 transition-colors z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] pr-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => abrirEdicao(item)}
                                                            className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                                                            title="Editar Lançamento"
                                                        >
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleExcluir(item.id)}
                                                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                                            title="Excluir Lançamento"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DE EDIÇÃO DE LANÇAMENTO */}
            {itemEditando && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 md:p-8 relative border border-zinc-100 animate-in zoom-in-95 duration-200 my-auto">
                        <button
                            onClick={() => setItemEditando(null)}
                            className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 mb-4">
                            <Edit3 className="text-indigo-600" size={20} />
                            <h2 className="font-bold text-base">Editar Lançamento</h2>
                        </div>

                        <form onSubmit={handleSalvarEdicao} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Categoria</label>
                                <input
                                    type="text"
                                    required
                                    value={categoriaInput}
                                    onChange={(e) => setCategoriaInput(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    value={descricaoInput}
                                    onChange={(e) => setDescricaoInput(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Realizado (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={valorRealizadoInput}
                                    onChange={(e) => setValorRealizadoInput(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium"
                                />
                            </div>

                            {msgErro && <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl">{msgErro}</p>}
                            {msgSucesso && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl flex items-center gap-2"><CheckCircle2 size={14} /> {msgSucesso}</p>}

                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {actionLoading ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* BLOCO INSTAGRAM */}
            <div className="mt-24">
                <div className="flex items-center gap-4 mb-12">
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