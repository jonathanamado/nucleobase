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
    TrendingUp,
    TrendingDown,
    DollarSign,
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

    const contasFiltradas = contas.filter(c => {
        if (filtroPeriodo === 'acumulado') return true;
        const compMes = c.data_competencia ? c.data_competencia.slice(0, 7) : '';
        return compMes === filtroPeriodo;
    });

    const totalRealizadoReceitas = contasFiltradas.filter(c => c.tipo === 'receita').reduce((acc, curr) => acc + Number(curr.valor_realizado), 0);
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
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 pt-6 px-6 md:px-10 flex flex-col justify-between relative">
            {/* Header */}
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl font-black tracking-tight">Prestação de contas</h1>
                                <h2 className="text-blue-600 text-base md:text-xl font-bold mt-0.5">{condominio?.nome || "Condomínio"}</h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => window.history.back()}
                                className="group relative hidden md:flex items-center justify-center gap-1.5 h-9 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                            >
                                <ArrowLeft size={12} />
                                <span>Voltar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contexto Inicial da Tela logo após a linha divisória */}
                <p className="text-xs md:text-sm text-zinc-500 font-medium mb-4">
                    Acompanhe abaixo o balanço financeiro da taxa base (receita), e das contas (despesas/rateio):
                </p>

                {/* Barra de Filtro de Período centralizada no mobile e alinhada à direita no desktop */}
                <div className="flex justify-center md:justify-end mb-5">
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

                {/* Bloco de Contexto Inicial e Indicadores (Cards) - 2 por linha no mobile */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <div className="bg-white border border-zinc-200 p-4 md:p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Receitas</span>
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <TrendingUp size={14} />
                            </div>
                        </div>
                        <div className="mt-3 md:mt-4">
                            <h3 className="text-base md:text-xl font-black text-emerald-600">R$ {totalRealizadoReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 p-4 md:p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Despesas</span>
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                                <TrendingDown size={14} />
                            </div>
                        </div>
                        <div className="mt-3 md:mt-4">
                            <h3 className="text-base md:text-xl font-black text-rose-600">R$ {totalRealizadoDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 p-4 md:p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Saldo Líquido</span>
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center ${saldoLiquido >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                <DollarSign size={14} />
                            </div>
                        </div>
                        <div className="mt-3 md:mt-4">
                            <h3 className={`text-base md:text-xl font-black ${saldoLiquido >= 0 ? 'text-zinc-900' : 'text-amber-600'}`}>
                                R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-zinc-900 text-white p-4 md:p-5 rounded-3xl shadow-md flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Registros</span>
                            <BarChart3 size={16} className="text-blue-400" />
                        </div>
                        <div className="mt-3 md:mt-4 relative z-10">
                            <h3 className="text-xs md:text-sm font-bold text-blue-400">{contasFiltradas.length} Lançamento(s)</h3>
                        </div>
                    </div>
                </div>

                {/* Tabela Analítica Detalhada */}
                <div className="bg-white border border-zinc-200 rounded-[2rem] shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="text-blue-600" size={20} />
                            <h3 className="font-bold text-base text-zinc-800">Demonstrativo Analítico</h3>
                        </div>
                        <span className="hidden md:inline-block text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full">
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
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="border-b border-zinc-100">
                                        <th className="pb-3 pr-6 text-[10px] font-black text-zinc-400 uppercase tracking-wider align-top text-left">Tipo</th>
                                        <th className="pb-3 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-wider align-top text-left">Descrição</th>
                                        <th className="pb-3 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-wider align-top text-left">Competência</th>
                                        <th className="pb-3 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-wider align-top text-left">Realizado</th>
                                        <th className="pb-3 pl-6 text-[10px] font-black text-zinc-400 uppercase tracking-wider align-top text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 text-sm">
                                    {contasFiltradas.map((conta) => (
                                        <tr key={conta.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="py-3 pr-6 text-xs font-semibold text-zinc-600 align-top text-left capitalize">
                                                {conta.tipo}
                                            </td>
                                            <td className="py-3 px-6 text-xs font-semibold text-zinc-600 align-top text-left">
                                                <div>{conta.descricao}</div>
                                                <div className="text-[10px] text-zinc-400 max-w-xs hidden md:block font-normal mt-0.5">{conta.descricao || "Sem observações"}</div>
                                            </td>
                                            <td className="py-3 px-6 text-xs font-semibold text-zinc-600 align-top text-left">
                                                {conta.data_competencia?.slice(0, 7)}
                                            </td>
                                            <td className="py-3 px-6 text-xs font-semibold text-zinc-600 align-top text-left">
                                                R$ {Number(conta.valor_realizado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3 pl-6 text-xs font-semibold text-zinc-600 align-top text-left capitalize">
                                                {conta.status}
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
                            <h3 className="font-bold text-base text-zinc-800">Gráfico Demonstrativo</h3>
                        </div>
                        <span className="hidden md:inline-block text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                            Visão Comparativa Real
                        </span>
                    </div>

                    <div className="space-y-6 max-w-4xl mx-auto py-2">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold whitespace-nowrap gap-4">
                                <span className="flex items-center gap-1.5 text-emerald-600 uppercase tracking-wider overflow-hidden text-ellipsis">
                                    <TrendingUp size={14} className="shrink-0" />
                                    <span className="truncate">Receitas</span>
                                </span>
                                <span className="text-emerald-600 font-black shrink-0">
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
                            <div className="flex justify-between items-center text-xs font-bold whitespace-nowrap gap-4">
                                <span className="flex items-center gap-1.5 text-rose-600 uppercase tracking-wider overflow-hidden text-ellipsis">
                                    <TrendingDown size={14} className="shrink-0" />
                                    <span className="truncate">Despesas</span>
                                </span>
                                <span className="text-rose-600 font-black shrink-0">
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