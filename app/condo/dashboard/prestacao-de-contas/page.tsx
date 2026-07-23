// app/condo/dashboard/prestacao-de-contas/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
    Building2,
    Loader2,
    ArrowLeft,
    Instagram,
    PlusCircle,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Trash2,
    FileSpreadsheet,
    BarChart3,
    Filter,
    ShieldAlert
} from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ContaCondominio {
    id: string;
    condominio_id: string;
    tipo: 'receita' | 'despesa';
    categoria: string;
    descricao: string;
    valor_previsto: number;
    valor_realizado: number;
    data_competencia: string;
    data_vencimento: string;
    status: 'pendente' | 'pago' | 'recebido' | 'cancelado';
}

export default function PrestacaoContasPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [contas, setContas] = useState<ContaCondominio[]>([]);

    // Estados de Filtro de Período
    const mesVigentePadrao = new Date().toISOString().slice(0, 7);
    const [filtroPeriodo, setFiltroPeriodo] = useState<string>(mesVigentePadrao);

    // Estados do Formulário de Cadastro / Importação
    const [showModal, setShowModal] = useState(false);
    const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa');
    const [categoria, setCategoria] = useState('');
    const [descricao, setDescricao] = useState('');
    const [valorPrevisto, setValorPrevisto] = useState('');
    const [valorRealizado, setValorRealizado] = useState('');
    const [dataCompetencia, setDataCompetencia] = useState(new Date().toISOString().slice(0, 7) + '-01');
    const [dataVencimento, setDataVencimento] = useState('');
    const [status, setStatus] = useState<'pendente' | 'pago' | 'recebido'>('pendente');
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const verifyCondoAndLoadData = async () => {
        try {
            setLoading(true);

            const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !currentSession) {
                setSession(null);
                setCondominio(null);
                setContas([]);
                setLoading(false);
                return;
            }

            setSession(currentSession);
            const userId = currentSession.user.id;

            const { data, error } = await supabase
                .from("condominio_membros")
                .select(`
                    condominio_id,
                    role,
                    acesso_app,
                    condominio:condominios ( id, nome )
                `)
                .eq("user_id", userId)
                .eq("acesso_app", true)
                .order("role", { ascending: false })
                .order("criado_em", { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0 && data[0].condominio) {
                // @ts-ignore
                setCondominio(data[0].condominio);
                // @ts-ignore
                await loadContas(data[0].condominio_id);
            } else {
                setCondominio(null);
                setContas([]);
            }
        } catch (e: any) {
            console.error("Erro ao carregar dados do condomínio:", {
                message: e?.message,
                details: e?.details,
                code: e?.code,
                error: e
            });
            setCondominio(null);
            setContas([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifyCondoAndLoadData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                await verifyCondoAndLoadData();
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setCondominio(null);
                setContas([]);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadContas = async (condoId: string) => {
        const { data, error } = await supabase
            .from("condominio_contas")
            .select("*")
            .eq("condominio_id", condoId)
            .order("data_competencia", { ascending: false });

        if (!error && data) {
            setContas(data as ContaCondominio[]);
        }
    };

    const handleSaveConta = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!condominio || !session) return;

        setActionLoading(true);
        setFormError('');
        setFormSuccess('');

        try {
            const { error } = await supabase
                .from("condominio_contas")
                .insert([
                    {
                        condominio_id: condominio.id,
                        tipo,
                        categoria: categoria.trim(),
                        descricao: descricao.trim(),
                        valor_previsto: parseFloat(valorPrevisto) || 0,
                        valor_realizado: parseFloat(valorRealizado) || (parseFloat(valorPrevisto) || 0),
                        data_competencia: dataCompetencia,
                        data_vencimento: dataVencimento || null,
                        status: tipo === 'receita' ? (status === 'pago' ? 'recebido' : status) : status,
                        criado_por: session.user.id
                    }
                ]);

            if (error) throw error;

            setFormSuccess("Lançamento adicionado com sucesso!");
            setCategoria('');
            setDescricao('');
            setValorPrevisto('');
            setValorRealizado('');
            setDataVencimento('');
            setShowModal(false);
            await loadContas(condominio.id);
        } catch (err: any) {
            console.error("Erro ao salvar conta:", err);
            setFormError(err?.message || "Erro ao registrar lançamento.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteConta = async (id: string) => {
        if (!confirm("Deseja realmente excluir este lançamento financeiro?")) return;

        setActionLoading(true);
        const { error } = await supabase
            .from("condominio_contas")
            .delete()
            .eq("id", id);

        if (!error && condominio) {
            await loadContas(condominio.id);
        }
        setActionLoading(false);
    };

    const contasFiltradas = contas.filter(c => {
        if (filtroPeriodo === 'acumulado') return true;
        const compMes = c.data_competencia ? c.data_competencia.slice(0, 7) : '';
        return compMes === filtroPeriodo;
    });

    const totalPrevistoReceitas = contasFiltradas.filter(c => c.tipo === 'receita').reduce((acc, curr) => acc + Number(curr.valor_previsto), 0);
    const totalRealizadoReceitas = contasFiltradas.filter(c => c.tipo === 'receita').reduce((acc, curr) => acc + Number(curr.valor_realizado), 0);
    const totalPrevistoDespesas = contasFiltradas.filter(c => c.tipo === 'despesa').reduce((acc, curr) => acc + Number(curr.valor_previsto), 0);
    const totalRealizadoDespesas = contasFiltradas.filter(c => c.tipo === 'despesa').reduce((acc, curr) => acc + Number(curr.valor_realizado), 0);
    const saldoLiquido = totalRealizadoReceitas - totalRealizadoDespesas;

    const maiorValorGrafico = Math.max(totalRealizadoReceitas, totalRealizadoDespesas, 1);
    const larguraBarraReceita = Math.round((totalRealizadoReceitas / maiorValorGrafico) * 100);
    const larguraBarraDespesa = Math.round((totalRealizadoDespesas / maiorValorGrafico) * 100);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando painel financeiro...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-[2.5rem] text-center space-y-4 shadow-sm">
                    <h1 className="text-xl font-black text-zinc-900">Acesso restrito</h1>
                    <p className="text-sm text-zinc-500">Faça login na plataforma para visualizar a prestação de contas.</p>
                    <Link href="/condo/dashboard" className="inline-block bg-zinc-900 hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                        Ir para Login
                    </Link>
                </div>
            </div>
        );
    }

    if (session && !condominio) {
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

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 pt-6 px-6 md:px-10 flex flex-col justify-between">
            {/* Header */}
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{condominio?.nome || "Módulo Condominial"}</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">Prestação de Contas</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-blue-600/20"
                            >
                                <PlusCircle size={16} /> Novo Lançamento
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className="group relative flex items-center justify-center gap-1.5 h-9 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                            >
                                <ArrowLeft size={12} />
                                <span>Voltar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Barra de Filtro de Período alinhada à direita logo abaixo da linha divisória */}
                <div className="flex justify-end mb-5">
                    <div className="flex items-center gap-2 bg-white border border-zinc-200 px-3.5 py-1.5 rounded-full shadow-sm">
                        <Filter size={14} className="text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Período:</span>
                        <input
                            type="month"
                            value={filtroPeriodo === 'acumulado' ? '' : filtroPeriodo}
                            onChange={(e) => setFiltroPeriodo(e.target.value || mesVigentePadrao)}
                            className="text-xs font-bold text-zinc-800 bg-transparent outline-none cursor-pointer"
                            title="Filtrar por Mês"
                        />
                        <button
                            onClick={() => setFiltroPeriodo('acumulado')}
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full transition-all ${filtroPeriodo === 'acumulado' ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                        >
                            Acumulado
                        </button>
                    </div>
                </div>

                {/* Bloco de Contexto Inicial e Indicadores (Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border border-zinc-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Receitas (Real)</span>
                            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <TrendingUp size={16} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-xl font-black text-emerald-600">R$ {totalRealizadoReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Previsto: R$ {totalPrevistoReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Despesas (Real)</span>
                            <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                                <TrendingDown size={16} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-xl font-black text-rose-600">R$ {totalRealizadoDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Previsto: R$ {totalPrevistoDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Saldo Líquido</span>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${saldoLiquido >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                <DollarSign size={16} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className={`text-xl font-black ${saldoLiquido >= 0 ? 'text-zinc-900' : 'text-amber-600'}`}>
                                R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Balanço do período</p>
                        </div>
                    </div>

                    <div className="bg-zinc-900 text-white p-5 rounded-3xl shadow-md flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status Orçamentário</span>
                            <BarChart3 size={18} className="text-blue-400" />
                        </div>
                        <div className="mt-4 relative z-10">
                            <h3 className="text-sm font-bold text-blue-400">{contasFiltradas.length} Lançamentos</h3>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Filtro: {filtroPeriodo === 'acumulado' ? 'Acumulado Geral' : filtroPeriodo}</p>
                        </div>
                    </div>
                </div>

                {/* Tabela Analítica Detalhada */}
                <div className="bg-white border border-zinc-200 rounded-[2rem] shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
                        <h3 className="font-bold text-base text-zinc-800">Demonstrativo Analítico de Contas</h3>
                        <span className="text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full">
                            {contasFiltradas.length} Registro(s)
                        </span>
                    </div>

                    {contasFiltradas.length === 0 ? (
                        <div className="text-center py-12 space-y-2">
                            <FileSpreadsheet className="mx-auto text-zinc-300" size={36} />
                            <p className="text-zinc-400 text-sm font-medium">Nenhum lançamento financeiro para o período selecionado.</p>
                            <p className="text-xs text-zinc-400">Modifique o filtro de período acima ou adicione um novo lançamento.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[320px] scrollbar-thin">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="border-b border-zinc-100">
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Tipo</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Categoria / Descrição</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Competência</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right">Previsto</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right">Realizado</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-center">Status</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 text-sm">
                                    {contasFiltradas.map((conta) => (
                                        <tr key={conta.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="py-3">
                                                {conta.tipo === 'receita' ? (
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md">
                                                        <TrendingUp size={10} /> Receita
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-rose-50 text-rose-600 px-2.5 py-1 rounded-md">
                                                        <TrendingDown size={10} /> Despesa
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3">
                                                <div className="font-bold text-zinc-800">{conta.categoria}</div>
                                                <div className="text-xs text-zinc-400 truncate max-w-xs">{conta.descricao || "Sem observações"}</div>
                                            </td>
                                            <td className="py-3 text-xs font-semibold text-zinc-600">{conta.data_competencia?.slice(0, 7)}</td>
                                            <td className="py-3 text-right font-medium text-zinc-600">R$ {Number(conta.valor_previsto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                            <td className={`py-3 text-right font-bold ${conta.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                R$ {Number(conta.valor_realizado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${conta.status === 'pago' || conta.status === 'recebido' ? 'bg-emerald-100 text-emerald-800' :
                                                    conta.status === 'pendente' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-600'
                                                    }`}>
                                                    {conta.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <button
                                                    onClick={() => handleDeleteConta(conta.id)}
                                                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Excluir Lançamento"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Bloco de Gráfico Comparativo */}
                <div className="bg-white border border-zinc-200 rounded-[2rem] shadow-sm p-6 mb-10">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="text-blue-600" size={20} />
                            <h3 className="font-bold text-base text-zinc-800">Gráfico Demonstrativo: Receitas x Despesas</h3>
                        </div>
                        <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                            Visão Comparativa Real
                        </span>
                    </div>

                    <div className="space-y-6 max-w-4xl mx-auto py-2">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="flex items-center gap-1.5 text-emerald-600 uppercase tracking-wider">
                                    <TrendingUp size={14} /> Total Receitas Realizadas
                                </span>
                                <span className="text-emerald-600 font-black">
                                    R$ {totalRealizadoReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="w-full bg-zinc-100 h-4 rounded-full overflow-hidden p-0.5">
                                <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                                    style={{ width: `${Math.max(larguraBarraReceita, 3)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="flex items-center gap-1.5 text-rose-600 uppercase tracking-wider">
                                    <TrendingDown size={14} /> Total Despesas Realizadas
                                </span>
                                <span className="text-rose-600 font-black">
                                    R$ {totalRealizadoDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="w-full bg-zinc-100 h-4 rounded-full overflow-hidden p-0.5">
                                <div
                                    className="bg-rose-500 h-full rounded-full transition-all duration-700 ease-out"
                                    style={{ width: `${Math.max(larguraBarraDespesa, 3)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Novo Lançamento */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-zinc-200 w-full max-w-md p-6 md:p-8 rounded-[2.5rem] shadow-xl space-y-5 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                            <h3 className="font-black text-lg text-zinc-900">Novo Lançamento Financeiro</h3>
                            <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600 font-bold text-xs">✕</button>
                        </div>

                        <form onSubmit={handleSaveConta} className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTipo('despesa')}
                                    className={`py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${tipo === 'despesa' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' : 'bg-zinc-100 text-zinc-500'}`}
                                >
                                    Despesa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTipo('receita')}
                                    className={`py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${tipo === 'receita' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-zinc-100 text-zinc-500'}`}
                                >
                                    Receita
                                </button>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Categoria</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Manutenção, Água, Taxa Condominial"
                                    required
                                    value={categoria}
                                    onChange={(e) => setCategoria(e.target.value)}
                                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Descrição (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Detalhes adicionais"
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 text-sm font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Previsto (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        required
                                        value={valorPrevisto}
                                        onChange={(e) => setValorPrevisto(e.target.value)}
                                        className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Realizado (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={valorRealizado}
                                        onChange={(e) => setValorRealizado(e.target.value)}
                                        className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Competência (Mês)</label>
                                    <input
                                        type="date"
                                        required
                                        value={dataCompetencia}
                                        onChange={(e) => setDataCompetencia(e.target.value)}
                                        className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 text-xs font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as any)}
                                        className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 text-xs font-medium"
                                    >
                                        <option value="pendente">Pendente</option>
                                        <option value="pago">Pago / Recebido</option>
                                    </select>
                                </div>
                            </div>

                            {formError && <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded-xl text-center">{formError}</p>}
                            {formSuccess && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-xl text-center">{formSuccess}</p>}

                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md mt-2"
                            >
                                {actionLoading ? "Salvando..." : "Salvar Lançamento"}
                            </button>
                        </form>
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