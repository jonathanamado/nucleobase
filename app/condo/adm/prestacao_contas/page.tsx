// app/condo/dashboard/adm/edicao_lancamentos/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
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

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    const verifyAndLoad = async () => {
        try {
            setLoading(true);
            const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !currentSession) {
                setSession(null);
                setCondominio(null);
                setLancamentos([]);
                setLoading(false);
                return;
            }

            setSession(currentSession);
            const userId = currentSession.user.id;

            const { data: membroDataList, error: membroError } = await supabase
                .from("condominio_membros")
                .select(`
                    condominio_id,
                    condominio:condominios ( id, nome )
                `)
                .eq("user_id", userId)
                .order("role", { ascending: false })
                .limit(1);

            if (membroError) throw membroError;

            if (membroDataList && membroDataList.length > 0 && membroDataList[0].condominio) {
                const condoInfo = Array.isArray(membroDataList[0].condominio)
                    ? membroDataList[0].condominio[0]
                    : membroDataList[0].condominio;

                setCondominio(condoInfo);
                await loadLancamentos(membroDataList[0].condominio_id);
            }
        } catch (e) {
            console.error("Erro ao carregar dados:", e);
        } finally {
            setLoading(false);
        }
    };

    const loadLancamentos = async (condoId: string) => {
        const { data, error } = await supabase
            .from("condominio_contas")
            .select("*")
            .eq("condominio_id", condoId)
            .order("data_competencia", { ascending: false });

        if (!error && data) {
            setLancamentos(data as ContaItem[]);
        }
    };

    useEffect(() => {
        verifyAndLoad();
    }, []);

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
        if (!itemEditando) return;

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
            if (condominio) await loadLancamentos(condominio.id);
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
                    <Link href="/condo/dashboard/adm" className="inline-block bg-zinc-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                        Voltar ao Painel
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-6 md:p-10 flex flex-col justify-between">
            <div>
                {/* Header seguindo o mesmo padrão estrutural da página de Cadastro de Moradores */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-auto h-auto bg-blue-600 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0 self-stretch">
                                <FileSpreadsheet size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Prestação de Contas</span>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5 text-zinc-900">Editar Registros</h1>
                            </div>
                        </div>
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

                {/* Tabela de Lançamentos */}
                <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm mb-12">
                    {lancamentosFiltrados.length === 0 ? (
                        <div className="text-center py-12 space-y-2">
                            <AlertCircle className="mx-auto text-zinc-300" size={36} />
                            <p className="text-zinc-400 text-sm font-medium">Nenhum lançamento financeiro encontrado.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[450px]">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="sticky top-0 bg-white z-10 border-b border-zinc-100">
                                    <tr>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Tipo</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Categoria</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Competência</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Realizado</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {lancamentosFiltrados.map((item) => (
                                        <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="py-3.5 pr-3 text-xs font-bold text-zinc-800">
                                                {item.tipo === 'receita' ? 'Receita' : 'Despesa'}
                                            </td>
                                            <td className="py-3.5 pr-3 text-xs font-bold text-zinc-800">
                                                {item.categoria}
                                            </td>
                                            <td className="py-3.5 pr-3 text-xs font-bold text-zinc-800">
                                                {item.data_competencia ? new Date(item.data_competencia).toLocaleDateString('pt-BR', { timeZone: 'UTC', month: '2-digit', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="py-3.5 pr-3 text-xs font-bold text-zinc-800">
                                                R$ {Number(item.valor_realizado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => abrirEdicao(item)}
                                                        className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                        title="Editar Lançamento"
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleExcluir(item.id)}
                                                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Excluir Lançamento"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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
                            className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-900 transition-colors"
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
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
                            >
                                {actionLoading ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Rodapé */}
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
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[1.8rem] md:rounded-[2rem] flex items-center justify-center text-white shadow-xl relative z-10 group-hover:rotate-6 transition-all duration-500">
                            <Instagram className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                        </div>
                        <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-pink-500 transition-colors">@nucleobase.app</span>
                    </a>
                </div>
            </div>
        </div>
    );
}