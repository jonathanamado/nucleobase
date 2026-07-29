// app/condo/dashboard/prestacao-de-contas/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
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

    const isMountedRef = useRef(true);

    const formatarPeriodoExibicao = (valorPeriodo: string) => {
        if (valorPeriodo === 'acumulado') return 'Acumulado';
        if (!valorPeriodo) return '';
        const [ano, mes] = valorPeriodo.split('-');
        if (!ano || !mes) return valorPeriodo;

        const mesesAbreviados: { [key: string]: string } = {
            '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
            '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
            '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
        };

        const nomeMes = mesesAbreviados[mes] || mes;
        const anoDoisDigitos = ano.slice(-2);
        return `${nomeMes}/${anoDoisDigitos}`;
    };

    // Função para formatar o mês no formato "Mês de Ano" com inicial maiúscula (para Desktop)
    const formatarPeriodoDesktop = (valorPeriodo: string) => {
        if (valorPeriodo === 'acumulado') return 'Acumulado';
        if (!valorPeriodo) return '';
        const [ano, mes] = valorPeriodo.split('-');
        if (!ano || !mes) return valorPeriodo;

        const mesesCompletos: { [key: string]: string } = {
            '01': 'janeiro', '02': 'fevereiro', '03': 'março', '04': 'abril',
            '05': 'maio', '06': 'junho', '07': 'julho', '08': 'agosto',
            '09': 'setembro', '10': 'outubro', '11': 'novembro', '12': 'dezembro'
        };

        const nomeMes = mesesCompletos[mes] || mes;
        const nomeMesCapitalizado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
        return `${nomeMesCapitalizado} de ${ano}`;
    };

    // Função para abreviar o nome do condomínio mantendo apenas o primeiro e o último nome (para Mobile)
    const obterNomeCondominioMobile = (nomeCompleto: string) => {
        if (!nomeCompleto) return "Condomínio";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length <= 1) return partes[0];
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    const loadContas = async (condoId: string) => {
        const { data, error } = await supabase
            .from("condominio_contas")
            .select("*")
            .eq("condominio_id", condoId)
            .order("data_competencia", { ascending: false });

        if (!error && data && isMountedRef.current) {
            setContas(data as ContaCondominio[]);
        }
    };

    const verifyCondoAndLoadData = async (currentSession: any, retries = 2) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setCondominio(null);
                    setContas([]);
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
                    .select("condominio_id, role, unidade, acesso_app, condominio_nome")
                    .eq("user_id", userId);

                membroDataList = res.data;
                membroError = res.error;

                if (membroError) {
                    const errorMsg = membroError.message || JSON.stringify(membroError);
                    if (!errorMsg.includes("AbortError") && !errorMsg.includes("Lock broken")) {
                        console.error("Erro na consulta Supabase (membros):", errorMsg);
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
                    setCondominio(null);
                    setContas([]);
                    setLoading(false);
                }
                return;
            }

            const vinculo = membroDataList[0];

            let nomeCondominioOficial = vinculo.condominio_nome || "Condomínio";
            if (vinculo.condominio_id) {
                const { data: condoData } = await supabase
                    .from("condominios")
                    .select("nome")
                    .eq("id", vinculo.condominio_id)
                    .maybeSingle();

                if (condoData && condoData.nome) {
                    nomeCondominioOficial = condoData.nome;
                }
            }

            if (isMountedRef.current) {
                setCondominio({
                    id: vinculo.condominio_id,
                    nome: nomeCondominioOficial
                });
                await loadContas(vinculo.condominio_id);
            }
        } catch (e: any) {
            const errString = e?.message || JSON.stringify(e);
            if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                console.error("Erro ao carregar dados do condomínio:", errString);
            }
            if (isMountedRef.current) {
                setCondominio(null);
                setContas([]);
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
                    await verifyCondoAndLoadData(currentSession);
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
                    await verifyCondoAndLoadData(currentSession);
                }
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setCondominio(null);
                setContas([]);
                setLoading(false);
            }
        });

        return () => {
            isMountedRef.current = false;
            subscription.unsubscribe();
        };
    }, []);

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
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-4">
                    <div className="flex items-center gap-4 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Prestação de contas</span>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1 text-zinc-900">
                                    <span className="md:hidden text-black">{obterNomeCondominioMobile(condominio?.nome || "Condomínio")}</span>
                                    <span className="hidden md:inline">{condominio?.nome || "Condomínio"}</span>
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
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
                </div>

                <div className="flex justify-center md:justify-end mb-5">
                    <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 bg-white border border-zinc-200 px-3.5 py-1.5 rounded-full shadow-sm">
                        <div className="flex items-center gap-2 overflow-hidden relative">
                            <Filter size={14} className="text-zinc-800 shrink-0" />
                            <span className="text-[10px] font-bold text-zinc-800 uppercase whitespace-nowrap">Filtro:</span>

                            <span className="md:hidden text-xs font-bold text-zinc-800 whitespace-nowrap cursor-pointer">
                                {formatarPeriodoExibicao(filtroPeriodo)}
                            </span>

                            <span className="hidden md:inline text-xs font-bold text-zinc-800 whitespace-nowrap cursor-pointer">
                                {formatarPeriodoDesktop(filtroPeriodo)}
                            </span>

                            <input
                                type="month"
                                value={filtroPeriodo === 'acumulado' ? '' : filtroPeriodo}
                                onChange={(e) => setFiltroPeriodo(e.target.value || mesVigentePadrao)}
                                className={`text-xs font-bold text-zinc-800 bg-transparent outline-none cursor-pointer absolute inset-0 opacity-0`}
                                title="Filtrar por Mês"
                            />
                        </div>
                        <button
                            onClick={() => setFiltroPeriodo('acumulado')}
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full transition-all shrink-0 cursor-pointer ${filtroPeriodo === 'acumulado' ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                        >
                            Visão Acumulado
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <div className="bg-white border border-zinc-200 p-4 md:p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Receitas</span>
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                <TrendingUp size={14} />
                            </div>
                        </div>
                        <div className="mt-3 md:mt-4 whitespace-nowrap overflow-hidden">
                            <h3 className="text-xs sm:text-base md:text-xl font-black text-emerald-600 truncate">R$ {totalRealizadoReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 p-4 md:p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Despesas</span>
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                                <TrendingDown size={14} />
                            </div>
                        </div>
                        <div className="mt-3 md:mt-4 whitespace-nowrap overflow-hidden">
                            <h3 className="text-xs sm:text-base md:text-xl font-black text-rose-600 truncate">R$ {totalRealizadoDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 p-4 md:p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Saldo Líquido</span>
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center shrink-0 ${saldoLiquido >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                <DollarSign size={14} />
                            </div>
                        </div>
                        <div className="mt-3 md:mt-4 whitespace-nowrap overflow-hidden">
                            <h3 className={`text-xs sm:text-base md:text-xl font-black truncate ${saldoLiquido >= 0 ? 'text-zinc-900' : 'text-amber-600'}`}>
                                R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-zinc-900 text-white p-4 md:p-5 rounded-3xl shadow-md flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Registros financeiros</span>
                            <BarChart3 size={16} className="text-blue-400 shrink-0" />
                        </div>
                        <div className="mt-3 md:mt-4 relative z-10 whitespace-nowrap overflow-hidden">
                            <h3 className="text-xs md:text-sm font-bold text-blue-400 truncate">{contasFiltradas.length} Lançamento(s)</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[2rem] shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="text-blue-600" size={20} />
                            <h3 className="font-bold text-base text-zinc-800">Demonstrativo</h3>
                        </div>
                        <span className="hidden md:inline-block text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full">
                            {contasFiltradas.length} Registro(s)
                        </span>
                    </div>

                    {contasFiltradas.length === 0 ? (
                        <div className="text-center py-12 space-y-2">
                            <FileSpreadsheet className="mx-auto text-zinc-300" size={36} />
                            <p className="text-zinc-400 text-sm font-medium">Nenhum lançamento financeiro para o período selecionado.</p>
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

                    <div className="space-y-6 w-full py-2">
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