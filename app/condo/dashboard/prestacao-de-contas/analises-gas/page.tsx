// app/condo/dashboard/prestacao-de-contas/analises/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    Building2,
    Loader2,
    ArrowLeft,
    Instagram,
    Flame,
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileSpreadsheet,
    BarChart3,
    Filter,
    ShieldAlert,
    ArrowUpDown,
    PlusCircle,
    CheckCircle2,
    AlertTriangle,
    Percent,
    Scale
} from "lucide-react";

interface MedicaoGas {
    id: string;
    condominio_id: string;
    unidade: string;
    leitura_anterior: number;
    leitura_atual: number;
    consumo_calculado: number;
    data_competencia: string;
    valor_calculado: number;
}

interface MetroCubicoGas {
    id: string;
    condominio_id: string;
    valor_metro_cubico: number;
    data_competencia: string;
}

interface CustoCilindroGas {
    id: string;
    condominio_id: string;
    data_aquisicao: string;
    quantidade_cilindros: number;
    valor_unitario: number;
    valor_total: number;
}

export default function AnaliseGasPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [medicoes, setMedicoes] = useState<MedicaoGas[]>([]);
    const [metroCubicoList, setMetroCubicoList] = useState<MetroCubicoGas[]>([]);
    const [custosCilindros, setCustosCilindros] = useState<CustoCilindroGas[]>([]);

    // Estados de Filtro de Período
    const mesVigentePadrao = new Date().toISOString().slice(0, 7);
    const [filtroPeriodo, setFiltroPeriodo] = useState<string>(mesVigentePadrao);
    const [ultimoMesSelecionado, setUltimoMesSelecionado] = useState<string>(mesVigentePadrao);

    // Estados de Ordenação da Tabela de Rentabilidade
    const [orderBy, setOrderBy] = useState<'unidade' | 'consumo_calculado'>('unidade');
    const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');

    // Estados do Formulário de Cadastro de Custo de Cilindro
    const [showModalCilindro, setShowModalCilindro] = useState(false);
    const [qtdCilindros, setQtdCilindros] = useState('');
    const [valorUnitCilindro, setValorUnitCilindro] = useState('');
    const [dataAquisicao, setDataAquisicao] = useState(new Date().toISOString().slice(0, 10));
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const isMountedRef = useRef(true);
    const inputMesRef = useRef<HTMLInputElement>(null);

    const formatarPeriodoExibicao = (valorPeriodo: string) => {
        if (valorPeriodo === 'acumulado') return '-';
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

    const formatarPeriodoDesktop = (valorPeriodo: string) => {
        if (valorPeriodo === 'acumulado') return '-';
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

    const obterNomeCondominioMobile = (nomeCompleto: string) => {
        if (!nomeCompleto) return "Condomínio";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length <= 1) return partes[0];
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    const loadGasData = async (condoId: string) => {
        const { data: dataMedicoes, error: errorMedicoes } = await supabase
            .from("condominio_contas_gas_medicao")
            .select("*")
            .eq("condominio_id", condoId)
            .order("data_competencia", { ascending: false });

        if (!errorMedicoes && dataMedicoes && isMountedRef.current) {
            setMedicoes(dataMedicoes as MedicaoGas[]);
        }

        const { data: dataMetroCubico, error: errorMetroCubico } = await supabase
            .from("condominio_contas_gas_metro_cubico")
            .select("*")
            .eq("condominio_id", condoId)
            .order("data_competencia", { ascending: false });

        if (!errorMetroCubico && dataMetroCubico && isMountedRef.current) {
            setMetroCubicoList(dataMetroCubico as MetroCubicoGas[]);
        }

        const { data: dataCilindros, error: errorCilindros } = await supabase
            .from("condominio_custo_cilindros_gas")
            .select("*")
            .eq("condominio_id", condoId)
            .order("data_aquisicao", { ascending: false });

        if (!errorCilindros && dataCilindros && isMountedRef.current) {
            setCustosCilindros(dataCilindros as CustoCilindroGas[]);
        }
    };

    const verifyCondoAndLoadData = async (currentSession: any, retries = 2) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setCondominio(null);
                    setMedicoes([]);
                    setMetroCubicoList([]);
                    setCustosCilindros([]);
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
                    setMedicoes([]);
                    setMetroCubicoList([]);
                    setCustosCilindros([]);
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
                await loadGasData(vinculo.condominio_id);
            }
        } catch (e: any) {
            const errString = e?.message || JSON.stringify(e);
            if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                console.error("Erro ao carregar dados do condomínio:", errString);
            }
            if (isMountedRef.current) {
                setCondominio(null);
                setMedicoes([]);
                setMetroCubicoList([]);
                setCustosCilindros([]);
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
                setMedicoes([]);
                setMetroCubicoList([]);
                setCustosCilindros([]);
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
        setCondominio(null);
        setMedicoes([]);
        setMetroCubicoList([]);
        setCustosCilindros([]);
        setLoading(false);
        window.dispatchEvent(new Event("storage"));
    };

    const handleSaveCustoCilindro = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!condominio || !session) return;

        setActionLoading(true);
        setFormError('');
        setFormSuccess('');

        try {
            const qtd = parseInt(qtdCilindros, 10) || 0;
            const valorUnit = parseFloat(valorUnitCilindro) || 0;
            const valorTotalCalculado = Number((qtd * valorUnit).toFixed(2));

            const payload = {
                condominio_id: condominio.id,
                data_aquisicao: dataAquisicao,
                quantidade_cilindros: qtd,
                valor_unitario: valorUnit,
                valor_total: valorTotalCalculado,
                criado_por: session.user.id
            };

            const { error } = await supabase
                .from("condominio_custo_cilindros_gas")
                .insert([payload]);

            if (error) throw error;

            setFormSuccess("Custo de cilindro registrado com sucesso!");
            setQtdCilindros('');
            setValorUnitCilindro('');
            setShowModalCilindro(false);
            await loadGasData(condominio.id);
        } catch (err: any) {
            console.error("Erro ao salvar custo de cilindro:", err);
            setFormError(err?.message || "Erro ao registrar custo de cilindro.");
        } finally {
            setActionLoading(false);
        }
    };

    // Filtragem de Medições
    const medicoesFiltradas = medicoes.filter(m => {
        if (filtroPeriodo === 'acumulado') return true;
        const compMes = m.data_competencia ? m.data_competencia.slice(0, 7) : '';
        return compMes === filtroPeriodo;
    });

    // Filtragem de Custos de Cilindros
    const custosCilindrosFiltrados = custosCilindros.filter(c => {
        if (filtroPeriodo === 'acumulado') return true;
        const compMes = c.data_aquisicao ? c.data_aquisicao.slice(0, 7) : '';
        return compMes === filtroPeriodo;
    });

    // Métricas de Mercado & Rentabilidade do Negócio
    const totalConsumoM3 = medicoesFiltradas.reduce((acc, curr) => acc + Number(curr.consumo_calculado), 0);
    const receitaTotalGas = medicoesFiltradas.reduce((acc, curr) => acc + Number(curr.valor_calculado), 0);
    const custoTotalAquisicao = custosCilindrosFiltrados.reduce((acc, curr) => acc + Number(curr.valor_total), 0);
    const totalCilindrosComprados = custosCilindrosFiltrados.reduce((acc, curr) => acc + Number(curr.quantidade_cilindros), 0);

    // Indicadores Chave (KPIs) de Viabilidade e Margem
    const margemBrutaReais = receitaTotalGas - custoTotalAquisicao;
    const margemPercentual = custoTotalAquisicao > 0
        ? ((receitaTotalGas - custoTotalAquisicao) / custoTotalAquisicao) * 100
        : (receitaTotalGas > 0 ? 100 : 0);

    // Custo Médio por m³ cobrado dos condôminos vs Custo Estimado Real por m³
    const precoMedioVendaM3 = totalConsumoM3 > 0 ? receitaTotalGas / totalConsumoM3 : 0;
    const custoEfetivoPorM3 = totalConsumoM3 > 0 ? custoTotalAquisicao / totalConsumoM3 : 0;

    // Status de Cobertura de Custo ("O Gás está se pagando?")
    const gasAutossustentavel = receitaTotalGas >= custoTotalAquisicao;
    const taxaCobertura = custoTotalAquisicao > 0 ? (receitaTotalGas / custoTotalAquisicao) * 100 : (receitaTotalGas > 0 ? 100 : 0);

    // Agrupamento e Consolidação por Unidade (caso esteja em modo 'acumulado' ou com múltiplos registros por unidade)
    const dadosAgrupadosPorUnidadeMap = medicoesFiltradas.reduce((acc: { [key: string]: { unidade: string; consumo_calculado: number; valor_calculado: number } }, curr) => {
        const un = curr.unidade;
        if (!acc[un]) {
            acc[un] = {
                unidade: un,
                consumo_calculado: 0,
                valor_calculado: 0
            };
        }
        acc[un].consumo_calculado += Number(curr.consumo_calculado) || 0;
        acc[un].valor_calculado += Number(curr.valor_calculado) || 0;
        return acc;
    }, {});

    const listaUnidadesConsolidadas = Object.values(dadosAgrupadosPorUnidadeMap);

    // Ordenação da Tabela de Rentabilidade por Unidade
    const unidadesOrdenadas = [...listaUnidadesConsolidadas].sort((a, b) => {
        let valA: any = a[orderBy] || '';
        let valB: any = b[orderBy] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return orderDirection === 'asc' ? -1 : 1;
        if (valA > valB) return orderDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const toggleSort = (coluna: 'unidade' | 'consumo_calculado') => {
        if (orderBy === coluna) {
            setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setOrderBy(coluna);
            setOrderDirection('asc');
        }
    };

    // Dados para Gráfico de Evolução de Margem Mensal
    const anoAtualStr = new Date().getFullYear().toString();
    const mesesDoAno = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const mesAtualIndex = new Date().getMonth();

    const dadosEvolucaoMensal = mesesDoAno.slice(0, mesAtualIndex + 1).map((mesNum) => {
        const chaveMes = `${anoAtualStr}-${mesNum}`;
        const medicoesMes = medicoes.filter(m => m.data_competencia && m.data_competencia.slice(0, 7) === chaveMes);
        const cilindrosMes = custosCilindros.filter(c => c.data_aquisicao && c.data_aquisicao.slice(0, 7) === chaveMes);

        const rec = medicoesMes.reduce((acc, curr) => acc + Number(curr.valor_calculado), 0);
        const cus = cilindrosMes.reduce((acc, curr) => acc + Number(curr.valor_total), 0);
        const margemMes = rec - cus;

        const nomesMesesCurto: { [key: string]: string } = {
            '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
            '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
            '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
        };

        return {
            mes: nomesMesesCurto[mesNum],
            receita: rec,
            custo: cus,
            margem: margemMes
        };
    });

    const maiorValorEvolucao = Math.max(...dadosEvolucaoMensal.map(d => Math.max(d.receita, d.custo)), 1);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-amber-600 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando inteligência de rentabilidade...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-[2.5rem] text-center space-y-4 shadow-sm">
                    <h1 className="text-xl font-black text-zinc-900">Acesso restrito</h1>
                    <p className="text-sm text-zinc-500">Faça login na plataforma para visualizar a análise de rentabilidade.</p>
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
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 pt-6 px-6 md:px-10 flex flex-col justify-between relative">
            <div>
                {/* CABEÇALHO */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-4">
                    <div className="flex items-center gap-4 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                                <Flame size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Inteligência Financeira • Gás</span>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1 text-zinc-900">
                                    <span className="md:hidden text-black">{obterNomeCondominioMobile(condominio?.nome || "Condomínio")}</span>
                                    <span className="hidden md:inline">{condominio?.nome || "Condomínio"}</span>
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowModalCilindro(true)}
                                className="group relative flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm cursor-pointer shrink-0"
                            >
                                <PlusCircle size={12} />
                                <span>Registrar Aquisição</span>
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className="group relative hidden md:flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 self-start md:self-auto overflow-hidden cursor-pointer shrink-0"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-600 to-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                                <ArrowLeft
                                    size={12}
                                    className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out"
                                />
                                <span>Voltar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* FILTRO DE PERÍODO */}
                <div className="flex flex-col md:flex-row justify-center md:justify-end mb-5 gap-2">
                    <div className="w-full md:w-[calc(25%-12px)] flex items-center justify-between gap-2 bg-white border border-zinc-200 px-3.5 py-1.5 rounded-full shadow-sm">
                        <div
                            className="flex items-center gap-2 overflow-hidden relative cursor-pointer w-full"
                            onClick={() => {
                                if (inputMesRef.current) {
                                    if (typeof inputMesRef.current.showPicker === 'function') {
                                        inputMesRef.current.showPicker();
                                    } else {
                                        inputMesRef.current.click();
                                    }
                                }
                            }}
                        >
                            <Filter size={12} className="text-zinc-800 shrink-0" />
                            <span className="text-xs font-bold text-zinc-800 uppercase whitespace-nowrap">Filtro:</span>

                            <span className="md:hidden text-xs font-normal text-zinc-800 whitespace-nowrap">
                                {formatarPeriodoExibicao(filtroPeriodo)}
                            </span>

                            <span className="hidden md:inline text-xs font-normal text-zinc-800 whitespace-nowrap">
                                {formatarPeriodoDesktop(filtroPeriodo)}
                            </span>

                            <input
                                ref={inputMesRef}
                                type="month"
                                value={filtroPeriodo === 'acumulado' ? '' : filtroPeriodo}
                                onChange={(e) => {
                                    const novoMes = e.target.value || mesVigentePadrao;
                                    setUltimoMesSelecionado(novoMes);
                                    setFiltroPeriodo(novoMes);
                                }}
                                className={`text-xs font-bold text-zinc-800 bg-transparent outline-none cursor-pointer absolute inset-0 opacity-0 pointer-events-none`}
                                title="Filtrar por Mês"
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (filtroPeriodo === 'acumulado') {
                                    setFiltroPeriodo(ultimoMesSelecionado);
                                } else {
                                    setUltimoMesSelecionado(filtroPeriodo);
                                    setFiltroPeriodo('acumulado');
                                }
                            }}
                            className={`md:hidden text-[9px] font-black uppercase px-2 py-0.5 rounded-full transition-all shrink-0 cursor-pointer ${filtroPeriodo === 'acumulado' ? 'bg-amber-600 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                        >
                            Acumulado
                        </button>
                    </div>
                    <div className="hidden md:flex w-full md:w-[calc(25%-12px)] justify-end">
                        <button
                            onClick={() => {
                                if (filtroPeriodo === 'acumulado') {
                                    setFiltroPeriodo(ultimoMesSelecionado);
                                } else {
                                    setUltimoMesSelecionado(filtroPeriodo);
                                    setFiltroPeriodo('acumulado');
                                }
                            }}
                            className={`w-full text-[9px] font-black uppercase px-3 py-1.5 rounded-full transition-all cursor-pointer text-center ${filtroPeriodo === 'acumulado' ? 'bg-amber-600 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                        >
                            Visão Acumulado (Meses totais)
                        </button>
                    </div>
                </div>

                {/* BANNER DE VALIDAÇÃO DE MERCADO: O GÁS ESTÁ SE PAGANDO? */}
                <div className={`border p-5 md:p-6 rounded-[2rem] shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors ${gasAutossustentavel
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50/60 border-amber-200 text-amber-900'
                    }`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${gasAutossustentavel ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                            {gasAutossustentavel ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-75">Validação de Sustentabilidade Operacional</span>
                            <h2 className="text-lg md:text-xl font-black mt-0.5">
                                {gasAutossustentavel
                                    ? "Excelente! O investimento em gás está totalmente coberto."
                                    : "Atenção: A receita cobrada está abaixo do custo de aquisição."}
                            </h2>
                            <p className="text-xs mt-1 opacity-90 font-medium">
                                A taxa de cobertura atual da operação é de <strong className="font-bold">{taxaCobertura.toFixed(1)}%</strong> sobre os custos de reposição de cilindros.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-black/5 shadow-xs">
                        <Scale size={16} className={gasAutossustentavel ? 'text-emerald-600' : 'text-amber-600'} />
                        <div className="text-right">
                            <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Margem Líquida</span>
                            <span className={`text-sm font-black ${margemBrutaReais >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                R$ {margemBrutaReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* CARDS DE KPIS DE RENTABILIDADE */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <div className="bg-white border border-zinc-200 p-4 md:p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Receita Faturamento</span>
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                <TrendingUp size={14} />
                            </div>
                        </div>
                        <div className="mt-3 md:mt-4 whitespace-nowrap overflow-hidden">
                            <h3 className="text-xs sm:text-base md:text-xl font-black text-emerald-600 truncate">R$ {receitaTotalGas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 p-4 md:p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Custo Reposição</span>
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                                <TrendingDown size={14} />
                            </div>
                        </div>
                        <div className="mt-3 md:mt-4 whitespace-nowrap overflow-hidden">
                            <h3 className="text-xs sm:text-base md:text-xl font-black text-rose-600 truncate">R$ {custoTotalAquisicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 p-4 md:p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Margem Percentual</span>
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                <Percent size={14} />
                            </div>
                        </div>
                        <div className="mt-3 md:mt-4 whitespace-nowrap overflow-hidden">
                            <h3 className={`text-xs sm:text-base md:text-xl font-black truncate ${margemPercentual >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                                {margemPercentual.toFixed(1)}%
                            </h3>
                        </div>
                    </div>

                    <div className="bg-zinc-900 text-white p-4 md:p-5 rounded-3xl shadow-md flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/20 rounded-full blur-2xl"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cilindros Adquiridos</span>
                            <Flame size={16} className="text-amber-400 shrink-0" />
                        </div>
                        <div className="mt-3 md:mt-4 relative z-10 whitespace-nowrap overflow-hidden">
                            <h3 className="text-xs sm:text-base md:text-xl font-black text-amber-400 truncate">
                                {totalCilindrosComprados} un.
                            </h3>
                        </div>
                    </div>
                </div>

                {/* ANÁLISE COMPARATIVA DE TARIFA (MERCADO) */}
                <div className="bg-white border border-zinc-200 rounded-[2rem] shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
                        <div className="flex items-center gap-2">
                            <Scale className="text-amber-600" size={20} />
                            <h3 className="font-bold text-base text-zinc-800">Eficiência de Preço por m³ (Unitário Médio)</h3>
                        </div>
                        <span className="hidden md:inline-block text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full">
                            Preço x Custo Efetivo
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="bg-zinc-50 border border-zinc-200/80 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">Preço Médio Cobrado (Condôminos)</span>
                                <h4 className="text-lg font-black text-zinc-900 mt-1">R$ {precoMedioVendaM3.toFixed(2)} <span className="text-xs font-normal text-zinc-500">/ m³</span></h4>
                            </div>
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-xs">
                                Venda
                            </div>
                        </div>

                        <div className="bg-zinc-50 border border-zinc-200/80 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">Custo Efetivo Real (Aquisição)</span>
                                <h4 className="text-lg font-black text-zinc-900 mt-1">R$ {custoEfetivoPorM3.toFixed(2)} <span className="text-xs font-normal text-zinc-500">/ m³</span></h4>
                            </div>
                            <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center font-bold text-xs">
                                Custo
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABELA DE RENTABILIDADE POR UNIDADE */}
                <div className="bg-white border border-zinc-200 rounded-[2rem] shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="text-amber-600" size={20} />
                            <h3 className="font-bold text-base text-zinc-800">Rentabilidade e Contribuição por Unidade</h3>
                        </div>
                        <span className="hidden md:inline-block text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full">
                            {unidadesOrdenadas.length} Unidade(s)
                        </span>
                    </div>

                    {unidadesOrdenadas.length === 0 ? (
                        <div className="text-center py-12 space-y-2">
                            <FileSpreadsheet className="mx-auto text-zinc-300" size={36} />
                            <p className="text-zinc-400 text-sm font-medium">Nenhum dado de medição disponível para o período selecionado.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[640px] scrollbar-thin">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="border-b border-zinc-100">
                                        <th className="pb-3 pr-6 text-[10px] font-black text-zinc-400 uppercase tracking-wider align-top text-left">
                                            <button onClick={() => toggleSort('unidade')} className="flex items-center gap-1 hover:text-zinc-700 cursor-pointer">
                                                Unidade <ArrowUpDown size={12} />
                                            </button>
                                        </th>
                                        <th className="pb-3 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-wider align-top text-left">
                                            <button onClick={() => toggleSort('consumo_calculado')} className="flex items-center gap-1 hover:text-zinc-700 cursor-pointer">
                                                Consumo (m³) <ArrowUpDown size={12} />
                                            </button>
                                        </th>
                                        <th className="pb-3 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-wider align-top text-left">Receita Gerada</th>
                                        <th className="pb-3 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-wider align-top text-left">% sobre Receita Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 text-sm">
                                    {unidadesOrdenadas.map((item, index) => {
                                        const valorRec = Number(item.valor_calculado) || 0;
                                        const participacao = receitaTotalGas > 0 ? (valorRec / receitaTotalGas) * 100 : 0;
                                        return (
                                            <tr key={item.unidade || index} className="hover:bg-zinc-50/50 transition-colors">
                                                <td className="py-3 pr-6 text-xs align-top text-left font-bold text-zinc-800">
                                                    {item.unidade}
                                                </td>
                                                <td className="py-3 px-6 text-xs align-top text-left font-bold text-amber-600">
                                                    {Number(item.consumo_calculado).toFixed(3)} m³
                                                </td>
                                                <td className="py-3 px-6 text-xs align-top text-left font-bold text-zinc-900">
                                                    R$ {valorRec.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-3 px-6 text-xs align-top text-left text-zinc-600 font-bold">
                                                    {participacao.toFixed(1)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* EVOLUÇÃO MENSAL DE MARGEM */}
                <div className="mt-16 mb-8 flex items-center gap-4">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Evolução da Margem</h3>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[2rem] shadow-sm p-6 mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-100 mb-6 gap-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="text-amber-600" size={20} />
                            <h3 className="font-bold text-base text-zinc-800">Desempenho Financeiro Mensal (Receita vs Custo de Cilindros)</h3>
                        </div>
                    </div>

                    <div className="pt-6 pb-2">
                        <div className="flex items-end justify-between gap-3 h-64 border-b border-zinc-200 pb-2 overflow-x-auto">
                            {dadosEvolucaoMensal.map((dado, i) => {
                                const altRec = Math.round((dado.receita / maiorValorEvolucao) * 100);
                                const altCus = Math.round((dado.custo / maiorValorEvolucao) * 100);

                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-[50px] relative">
                                        <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                                            <div
                                                className="w-1/2 bg-emerald-500 rounded-t-lg transition-all duration-500 relative flex flex-col items-center justify-start pt-1.5"
                                                style={{ height: `${Math.max(altRec, 18)}%` }}
                                                title={`Receita: R$ ${dado.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                            >
                                                <span className="text-[8px] font-black text-white whitespace-nowrap -rotate-90 md:rotate-0">
                                                    R$ {dado.receita.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                            <div
                                                className="w-1/2 bg-rose-500 rounded-t-lg transition-all duration-500 relative flex flex-col items-center justify-start pt-1.5"
                                                style={{ height: `${Math.max(altCus, 18)}%` }}
                                                title={`Custo: R$ ${dado.custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                            >
                                                <span className="text-[8px] font-black text-white whitespace-nowrap -rotate-90 md:rotate-0">
                                                    R$ {dado.custo.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center mt-2">
                                            <span className="text-[10px] font-bold text-zinc-700">{dado.mes}</span>
                                            <span className={`text-[9px] font-black ${dado.margem >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                R$ {dado.margem.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-3 border-t border-zinc-100 text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                                <span className="text-zinc-600">Receita de Gás</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-rose-500 rounded-sm"></div>
                                <span className="text-zinc-600">Custo de Aquisição</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
                                <span className="text-amber-600 font-black">Resultado Líquido</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE CADASTRO DE CUSTO DE CILINDRO */}
            {showModalCilindro && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-zinc-200 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                            <h3 className="font-bold text-lg text-zinc-900">Registrar Aquisição de Cilindros</h3>
                            <button onClick={() => setShowModalCilindro(false)} className="text-zinc-400 hover:text-zinc-700 text-sm font-bold">Fechar</button>
                        </div>

                        {formError && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold">{formError}</div>}
                        {formSuccess && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-bold">{formSuccess}</div>}

                        <form onSubmit={handleSaveCustoCilindro} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Data de Aquisição</label>
                                <input
                                    type="date"
                                    value={dataAquisicao}
                                    onChange={(e) => setDataAquisicao(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-800 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Quantidade de Cilindros</label>
                                <input
                                    type="number"
                                    value={qtdCilindros}
                                    onChange={(e) => setQtdCilindros(e.target.value)}
                                    placeholder="Ex: 4"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-800 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Valor Unitário por Cilindro (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={valorUnitCilindro}
                                    onChange={(e) => setValorUnitCilindro(e.target.value)}
                                    placeholder="Ex: 120.00"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-800 outline-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                            >
                                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                                Salvar Aquisição
                            </button>
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