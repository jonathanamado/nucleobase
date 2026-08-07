// app/condo/contabilidade/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    Building2,
    CheckCircle2,
    ArrowLeft,
    Instagram,
    FileSpreadsheet,
    Lock,
    Calendar,
    Download,
    Users,
    FileText,
    ShieldCheck,
    Building,
    BadgeInfo,
    Clock,
    ArrowUpRight
} from "lucide-react";

interface LinhaRelatorioConsolidado {
    unidade: string;
    moradorNome: string;
    taxaBase: number;
    rateioReceitaDespesa: number;
    consumoGasValor: number;
    consumoGasMetros: number;
    fundoReserva: number;
    salaoFestas: number;
    rateioSindico: number;
    totalGeral: number;
    resumoBoleto: string;
}

export default function ContabilidadeCondoPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    // Controle de Login e Restrições para o perfil 'contabilidade'
    const [emailOrSlug, setEmailOrSlug] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isAcessoNegado, setIsAcessoNegado] = useState(false);
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);

    // Filtro de Mês/Ano para o rateio
    const [competenciaSelecionada, setCompetenciaSelecionada] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const [valorTaxaBase, setValorTaxaBase] = useState<number>(0);
    const [linhasRelatorio, setLinhasRelatorio] = useState<LinhaRelatorioConsolidado[]>([]);
    const [totalGeralCondominio, setTotalGeralCondominio] = useState(0);

    const isMountedRef = useRef(true);

    const formatarNomePrimeiroEUltimo = (nomeCompleto: string) => {
        if (!nomeCompleto) return "";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length <= 1) return partes[0] || "";
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    const formatarMoeda = (valor: number): string => {
        if (isNaN(valor)) return "R$ 0,00";
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    const carregarTaxaBase = async (condoId: string, competencia: string) => {
        try {
            const dataCompetenciaCompleta = `${competencia}-01`;
            const { data } = await supabase
                .from("condominio_contas_taxa_base")
                .select("valor")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta)
                .maybeSingle();

            if (data) {
                const val = Number(data.valor || 0);
                setValorTaxaBase(val);
                return val;
            } else {
                setValorTaxaBase(0);
                return 0;
            }
        } catch (err) {
            console.error("Erro ao carregar taxa base:", err);
            return 0;
        }
    };

    const carregarRelatorioConsolidado = async (condoId: string, competencia: string) => {
        try {
            const dataCompetenciaCompleta = `${competencia}-01`;
            const taxaBaseAtual = await carregarTaxaBase(condoId, competencia);

            const { data: membrosData } = await supabase
                .from("condominio_membros")
                .select("unidade, role, user_id, profiles(nome_completo)")
                .eq("condominio_id", condoId);

            const moradoresPorUnidade = new Map<string, string[]>();
            const unidadesSet = new Set<string>();
            const unidadesSindicoSet = new Set<string>();

            (membrosData || []).forEach((m: any) => {
                const u = m.unidade?.trim();
                if (u) {
                    unidadesSet.add(u);
                    const roleNormalizado = String(m.role || "").toLowerCase().trim();
                    if (roleNormalizado === 'sindico') {
                        unidadesSindicoSet.add(u);
                    } else if (roleNormalizado === 'morador') {
                        const nomeCompleto = m.profiles?.nome_completo || "";
                        const nomeFormatado = formatarNomePrimeiroEUltimo(nomeCompleto);
                        if (nomeFormatado) {
                            if (!moradoresPorUnidade.has(u)) {
                                moradoresPorUnidade.set(u, []);
                            }
                            const lista = moradoresPorUnidade.get(u)!;
                            if (!lista.includes(nomeFormatado)) {
                                lista.push(nomeFormatado);
                            }
                        }
                    }
                }
            });

            const unidadesUnicas = Array.from(unidadesSet).sort();
            const qtdUnidades = unidadesUnicas.length > 0 ? unidadesUnicas.length : 1;

            const { data: contasData } = await supabase
                .from("condominio_contas")
                .select("tipo, valor_realizado, valor_previsto")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta);

            let totalReceitasRealizado = 0;
            let totalDespesasRealizado = 0;

            (contasData || []).forEach((c: any) => {
                const val = parseFloat(c.valor_realizado ?? c.valor_previsto ?? 0);
                const tipoNormalizado = String(c.tipo || "").toLowerCase().trim();
                if (tipoNormalizado === 'receita') {
                    totalReceitasRealizado += val;
                } else if (tipoNormalizado === 'despesa') {
                    totalDespesasRealizado += val;
                }
            });

            const saldoLiquidoCondominio = totalReceitasRealizado - totalDespesasRealizado;
            const rateioBasePorUnidade = qtdUnidades > 0 ? (Math.abs(saldoLiquidoCondominio) / qtdUnidades) : 0;

            const { data: tarifaData } = await supabase
                .from("condominio_contas_gas_metro_cubico")
                .select("valor_metro_cubico")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta)
                .maybeSingle();

            const valorMetroCubico = Number(tarifaData?.valor_metro_cubico || 0);

            const { data: medicaoData } = await supabase
                .from("condominio_contas_gas_medicao")
                .select("unidade, consumo_calculado")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta);

            const consumoGasMap = new Map();
            (medicaoData || []).forEach((m: any) => {
                consumoGasMap.set(m.unidade?.trim(), Number(m.consumo_calculado || 0));
            });

            const { data: fundoData } = await supabase
                .from("condominio_contas_fundo_de_reservas")
                .select("unidade, valor")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta);

            const fundoMap = new Map();
            (fundoData || []).forEach((f: any) => {
                fundoMap.set(f.unidade?.trim(), Number(f.valor || 0));
            });

            const { data: salaoData } = await supabase
                .from("condominio_reservas_cobrancas")
                .select("unidade, taxa")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta)
                .eq("status", "cobrado");

            const salaoMap = new Map();
            (salaoData || []).forEach((s: any) => {
                const u = s.unidade?.trim();
                const atual = salaoMap.get(u) || 0;
                salaoMap.set(u, atual + Number(s.taxa || 0));
            });

            const { data: sindicoData } = await supabase
                .from("condominio_pagamento_sindico")
                .select("valor, quantidade_apartamentos")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta)
                .maybeSingle();

            let rateioSindicoUnitario = 0;
            if (sindicoData && Number(sindicoData.quantidade_apartamentos) > 0) {
                rateioSindicoUnitario = Number(sindicoData.valor || 0) / Number(sindicoData.quantidade_apartamentos);
            }

            let somaGeralConsolidada = 0;
            const linhas: LinhaRelatorioConsolidado[] = unidadesUnicas.map((unidade) => {
                const listaMoradores = moradoresPorUnidade.get(unidade) || [];
                const moradorNome = listaMoradores.length > 0 ? listaMoradores.join(", ") : "Não atribuído";
                const consumoM3 = consumoGasMap.get(unidade) || 0;
                const valorGas = consumoM3 * valorMetroCubico;
                const fundoReservaVal = fundoMap.get(unidade) || 0;
                const salaoVal = salaoMap.get(unidade) || 0;

                const possuiSindico = unidadesSindicoSet.has(unidade);
                const taxaBaseVal = possuiSindico ? 0 : taxaBaseAtual;
                const rateioSindicoVal = possuiSindico ? 0 : rateioSindicoUnitario;

                const totalUnidade = taxaBaseVal + rateioBasePorUnidade + valorGas + fundoReservaVal + salaoVal + rateioSindicoVal;
                somaGeralConsolidada += totalUnidade;

                const txtTX = formatarMoeda(taxaBaseVal);
                const txtFR = formatarMoeda(fundoReservaVal);
                const txtSF = formatarMoeda(salaoVal);
                const txtRat = formatarMoeda(rateioBasePorUnidade);
                const txtSin = formatarMoeda(rateioSindicoVal);
                const txtGas = `${consumoM3.toFixed(2)} m³ (${formatarMoeda(valorGas)})`;
                const txtTot = formatarMoeda(totalUnidade);

                const resumoBoleto = `TX: ${txtTX} + FR: ${txtFR} + SF: ${txtSF} + Rat: ${txtRat} + Sín: ${txtSin} + Gás: ${txtGas} = Tot: ${txtTot}`;

                return {
                    unidade,
                    moradorNome,
                    taxaBase: taxaBaseVal,
                    rateioReceitaDespesa: rateioBasePorUnidade,
                    consumoGasValor: valorGas,
                    consumoGasMetros: consumoM3,
                    fundoReserva: fundoReservaVal,
                    salaoFestas: salaoVal,
                    rateioSindico: rateioSindicoVal,
                    totalGeral: totalUnidade,
                    resumoBoleto
                };
            });

            setLinhasRelatorio(linhas);
            setTotalGeralCondominio(somaGeralConsolidada);
        } catch (err) {
            console.error("Erro ao carregar relatório consolidado:", err);
        }
    };

    const verifyContabilidadeAndLoadData = async (currentSession: any) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setCondominio(null);
                    setLoading(false);
                }
                return;
            }

            if (isMountedRef.current) setSession(currentSession);
            const userId = currentSession.user.id;

            const { data: membroDataList } = await supabase
                .from("condominio_membros")
                .select("condominio_id, role, condominio_nome")
                .eq("user_id", userId);

            if (!membroDataList || membroDataList.length === 0) {
                if (isMountedRef.current) {
                    setIsAcessoNegado(true);
                    setLoading(false);
                }
                return;
            }

            const vinculoContabilidade = membroDataList.find((m: any) => String(m.role || "").toLowerCase().trim() === 'contabilidade');
            if (!vinculoContabilidade) {
                if (isMountedRef.current) {
                    setIsAcessoNegado(true);
                    setLoading(false);
                }
                return;
            }

            let nomeCondominioOficial = vinculoContabilidade.condominio_nome || "Condomínio";
            if (vinculoContabilidade.condominio_id) {
                const { data: condoDataReal } = await supabase
                    .from("condominios")
                    .select("nome")
                    .eq("id", vinculoContabilidade.condominio_id)
                    .maybeSingle();

                if (condoDataReal?.nome) nomeCondominioOficial = condoDataReal.nome;
            }

            if (isMountedRef.current) {
                setIsAcessoNegado(false);
                setCondominio({ id: vinculoContabilidade.condominio_id, nome: nomeCondominioOficial });
                await carregarRelatorioConsolidado(vinculoContabilidade.condominio_id, competenciaSelecionada);
            }
        } catch (e) {
            if (isMountedRef.current) setCondominio(null);
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            if (isMountedRef.current) verifyContabilidadeAndLoadData(currentSession);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, currentSession) => {
            if (isMountedRef.current) verifyContabilidadeAndLoadData(currentSession);
        });

        return () => {
            isMountedRef.current = false;
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (condominio?.id) {
            carregarRelatorioConsolidado(condominio.id, competenciaSelecionada);
        }
    }, [competenciaSelecionada]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setLoginError("");
        try {
            const inputAcesso = emailOrSlug.trim().toLowerCase();
            let emailParaLogin = inputAcesso;

            if (!inputAcesso.includes("@")) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('email_contato')
                    .eq('slug', inputAcesso)
                    .maybeSingle();

                if (!profile?.email_contato) {
                    setLoginError("ID ou e-mail não localizado.");
                    setAuthLoading(false);
                    return;
                }
                emailParaLogin = profile.email_contato;
            }

            const { data, error } = await supabase.auth.signInWithPassword({ email: emailParaLogin, password });
            if (error || !data.session) {
                setLoginError("Credenciais incorretas.");
                setAuthLoading(false);
                return;
            }
            await verifyContabilidadeAndLoadData(data.session);
        } catch {
            setLoginError("Erro ao entrar.");
        } finally {
            setAuthLoading(false);
        }
    };

    const exportarCSV = () => {
        if (linhasRelatorio.length === 0) return alert("Sem dados para exportar.");

        // Adicionando o BOM (\uFEFF) para forçar o Excel a reconhecer a codificação UTF-8 corretamente
        let csvContent = "\uFEFFUnidade;Morador;Taxa Base;Fundo de Reservas;Salão de Festas;Receita - Despesa (Rateio);Rateio Síndico;Medição Gás (m³ / R$);Total a Pagar;Resumo Texto Boleto\n";

        linhasRelatorio.forEach(row => {
            csvContent += `Apto ${row.unidade};"${row.moradorNome}";${row.taxaBase.toFixed(2)};${row.fundoReserva.toFixed(2)};${row.salaoFestas.toFixed(2)};${row.rateioReceitaDespesa.toFixed(2)};${row.rateioSindico.toFixed(2)};${row.consumoGasMetros.toFixed(2)} m³ (${row.consumoGasValor.toFixed(2)});${row.totalGeral.toFixed(2)};"${row.resumoBoleto}"\n`;
        });

        const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_contabilidade_${competenciaSelecionada}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="animate-spin text-emerald-600 mb-4">
                    <FileSpreadsheet size={32} />
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando painel de contabilidade...</p>
            </div>
        );
    }

    if (!session || isAcessoNegado) {
        return (
            <div className="min-h-screen bg-zinc-50/50 text-zinc-900 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 rounded-[2.5rem] shadow-sm space-y-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Lock size={30} />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Acesso Restrito</span>
                        <h1 className="text-xl font-black tracking-tight">Portal da Contabilidade</h1>
                        <p className="text-xs text-zinc-500 font-medium">Insira as credenciais vinculadas ao papel de contabilidade para acessar as informações do condomínio.</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4 text-left">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">E-mail ou ID</label>
                            <input
                                type="text"
                                required
                                placeholder="exemplo@dominio.com"
                                className="w-full mt-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm outline-none focus:border-emerald-400 font-medium"
                                value={emailOrSlug}
                                onChange={(e) => setEmailOrSlug(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Senha</label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full mt-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm outline-none focus:border-emerald-400 font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {loginError && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl text-center">{loginError}</p>}
                        <button type="submit" disabled={authLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-emerald-600/20">
                            {authLoading ? "Acessando..." : "Entrar no Portal"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-4 md:p-10 flex flex-col justify-between">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-600/25">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Painel Contábil & Auditoria</span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5">{condominio?.nome}</h1>
                        </div>
                    </div>

                    <Link
                        href="/condo"
                        className="flex items-center gap-1.5 h-10 px-4 bg-zinc-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm cursor-pointer self-start md:self-auto"
                    >
                        <ArrowLeft size={14} /> Voltar ao Início
                    </Link>
                </div>

                {/* Cards Informativos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CARD 1: CADASTRO DE MORADORES (VINCULADO) */}
                    <div className="bg-white border border-zinc-200 p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-emerald-300 transition-all">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <Users size={22} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-zinc-900">Cadastro de Moradores</h3>
                                <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">
                                    Visualização detalhada dos registros e contatos de moradores vinculados às unidades para conferência fiscal e cadastral.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Módulo Ativo</span>
                            <Link
                                href="/condo/dashboard/cadastro-moradores"
                                className="flex items-center gap-1 text-xs font-black text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                Acessar <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* CARD 2: CNPJ (EM DESENVOLVIMENTO) */}
                    <div className="bg-white border border-zinc-200 p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-4 right-4 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Clock size={10} /> Em desenvolvimento
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <Building size={22} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-zinc-900">Informações sobre o CNPJ</h3>
                                <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">
                                    Dados cadastrais da pessoa jurídica do condomínio, situação fiscal, certidões e histórico contábil oficial.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status: Sincronizando</span>
                            <span className="text-xs font-black text-emerald-600">Consultar</span>
                        </div>
                    </div>

                    {/* CARD 3: AUDITORIA (EM DESENVOLVIMENTO) */}
                    <div className="bg-white border border-zinc-200 p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-4 right-4 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Clock size={10} /> Em desenvolvimento
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <BadgeInfo size={22} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-zinc-900">Auditoria de Contas</h3>
                                <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">
                                    Módulo dedicado à verificação de lançamentos contábeis, extratos bancários e balancetes automatizados.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status: Aguardando</span>
                            <span className="text-xs font-black text-emerald-600">Acessar</span>
                        </div>
                    </div>
                </div>

                {/* Controles de Filtro e Exportação para o Rateio */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                    <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                        <div className="bg-white border border-zinc-200 p-2.5 rounded-xl flex items-center gap-3 shadow-sm">
                            <Calendar size={16} className="text-emerald-600" />
                            <input
                                type="month"
                                value={competenciaSelecionada}
                                onChange={(e) => setCompetenciaSelecionada(e.target.value)}
                                className="text-xs font-bold text-zinc-900 bg-transparent outline-none cursor-pointer"
                            />
                        </div>
                        <button
                            onClick={exportarCSV}
                            className="flex items-center gap-1.5 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm cursor-pointer"
                        >
                            <Download size={14} /> Exportar CSV
                        </button>
                    </div>

                    <div className="bg-white border border-zinc-200 px-5 py-3.5 rounded-2xl shadow-sm flex items-center gap-3 w-full md:w-auto justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Taxa Base Vigente:</span>
                        <span className="text-sm font-black text-zinc-900">{formatarMoeda(valorTaxaBase)}</span>
                    </div>
                </div>

                {/* Tabela de Consulta do Rateio Condominial */}
                <div className="w-full bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-zinc-900">Consulta de Rateio do Condomínio</h2>
                            <p className="text-xs text-zinc-500 font-medium">Demonstrativo consolidado para fins de auditoria e conferência (Modo Exclusivo de Consulta).</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Consolidado Geral</span>
                            <span className="text-lg font-black text-emerald-600">{formatarMoeda(totalGeralCondominio)}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-zinc-100 rounded-2xl">
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                    <th className="p-3.5 pl-5 text-center">Unidade</th>
                                    <th className="p-3.5 text-center">Morador</th>
                                    <th className="p-3.5 text-center">Taxa Base</th>
                                    <th className="p-3.5 text-center">Fundo de Reservas</th>
                                    <th className="p-3.5 text-center">Salão de Festas</th>
                                    <th className="p-3.5 text-center">Receita - Despesa (Rateio)</th>
                                    <th className="p-3.5 text-center">Rateio Síndico</th>
                                    <th className="p-3.5 text-center">Medição Gás (m³ / R$)</th>
                                    <th className="p-3.5 text-center">Total a Pagar</th>
                                    <th className="p-3.5 pr-5 text-center">Resumo Texto Boleto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {linhasRelatorio.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-8 text-xs text-zinc-400">
                                            Nenhum dado consolidado encontrado para este período ou nenhuma unidade cadastrada.
                                        </td>
                                    </tr>
                                ) : (
                                    linhasRelatorio.map((linha) => (
                                        <tr key={linha.unidade} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="p-3.5 pl-5 text-xs font-bold text-zinc-800 text-center">Apto {linha.unidade}</td>
                                            <td className="p-3.5 text-xs font-medium text-zinc-600 text-center">{linha.moradorNome}</td>
                                            <td className="p-3.5 text-xs font-medium text-zinc-700 text-center">{formatarMoeda(linha.taxaBase)}</td>
                                            <td className="p-3.5 text-xs font-medium text-zinc-700 text-center">{formatarMoeda(linha.fundoReserva)}</td>
                                            <td className="p-3.5 text-xs font-medium text-zinc-700 text-center">{formatarMoeda(linha.salaoFestas)}</td>
                                            <td className="p-3.5 text-xs font-medium text-zinc-700 text-center">{formatarMoeda(linha.rateioReceitaDespesa)}</td>
                                            <td className="p-3.5 text-xs font-medium text-zinc-700 text-center">{formatarMoeda(linha.rateioSindico)}</td>
                                            <td className="p-3.5 text-xs font-medium text-zinc-700 text-center">
                                                {linha.consumoGasMetros.toFixed(2)} m³ <span className="text-[10px] text-zinc-400">({formatarMoeda(linha.consumoGasValor)})</span>
                                            </td>
                                            <td className="p-3.5 text-xs font-black text-emerald-600 text-center">{formatarMoeda(linha.totalGeral)}</td>
                                            <td className="p-3.5 pr-5 text-[10px] font-mono text-zinc-500 whitespace-nowrap text-center">{linha.resumoBoleto}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Rodapé institucional com o bloco Instagram atualizado */}
            <div className="mt-24">
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-px bg-zinc-200 flex-1"></div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-400 whitespace-nowrap">Conecte-se</h3>
                    <div className="h-px bg-zinc-200 flex-1"></div>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="max-w-3xl mb-12">
                        <h4 className="text-2xl md:text-4xl font-bold text-zinc-900 tracking-tighter mb-2">
                            Fique por dentro <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
                        </h4>
                        <p className="text-zinc-500 font-medium text-sm md:text-base">
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
                            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-zinc-400 group-hover:text-pink-500 transition-colors">@nucleobase.app</span>
                            <div className="h-1 w-0 bg-pink-500 mt-2 group-hover:w-full transition-all duration-500 rounded-full"></div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}