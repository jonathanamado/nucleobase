// app/condo/adm/prestacao_contas/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    Building2,
    CheckCircle2,
    Instagram,
    FileSpreadsheet,
    Edit3,
    Lock,
    Key,
    AtSign,
    Eye,
    EyeOff,
    LifeBuoy,
    Mail,
    X,
    KeyRound,
    UserCheck,
    ArrowRight,
    Calendar,
    Download,
    Save
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

export default function PrestacaoContasConsolidadoPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [salvandoRateio, setSalvandoRateio] = useState(false);

    // Controle de Login e Restrições
    const [emailOrSlug, setEmailOrSlug] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [isApenasMorador, setIsApenasMorador] = useState(false);
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);

    // Filtro de Mês/Ano e Status de Conclusão
    const [competenciaSelecionada, setCompetenciaSelecionada] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [isRateioSalvo, setIsRateioSalvo] = useState(false);

    // Dados Consolidados para a Tabela
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

    // Funções para formatar a visualização da competência (Desktop e Mobile)
    const formatMesAnoDesktop = (competencia: string) => {
        if (!competencia) return "";
        const [ano, mes] = competencia.split('-');
        const date = new Date(Number(ano), Number(mes) - 1, 15);
        const mesExtenso = date.toLocaleString('pt-BR', { month: 'long' });
        return `${mesExtenso.charAt(0).toUpperCase() + mesExtenso.slice(1)} de ${ano}`;
    };

    const formatMesAnoMobile = (competencia: string) => {
        if (!competencia) return "";
        const [ano, mes] = competencia.split('-');
        const date = new Date(Number(ano), Number(mes) - 1, 15);
        const mesCurto = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
        return `${mesCurto.charAt(0).toUpperCase() + mesCurto.slice(1)} / ${ano}`;
    };

    const carregarRelatorioConsolidado = async (condoId: string, competencia: string) => {
        try {
            const dataCompetenciaCompleta = `${competencia}-01`;

            // Buscar taxa base salva do banco
            const { data: taxaData } = await supabase
                .from("condominio_contas_taxa_base")
                .select("valor")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta)
                .maybeSingle();
            const taxaBaseAtual = Number(taxaData?.valor || 0);

            // 1. Verifica se já existe um rateio consolidado salvo (CONCLUÍDO)
            const { data: savedData, error: savedError } = await supabase
                .from("condominio_rateio_boletos")
                .select("*")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta);

            if (savedData && savedData.length > 0) {
                // Rateio já foi salvo. Carrega os dados fixos do banco para não sumirem da tela.
                setIsRateioSalvo(true);
                let somaGeralConsolidada = 0;

                const linhas: LinhaRelatorioConsolidado[] = savedData.map((s: any) => {
                    const total = Number(s.total_geral) || 0;
                    somaGeralConsolidada += total;
                    return {
                        unidade: s.unidade,
                        moradorNome: s.morador_nome,
                        taxaBase: Number(s.taxa_base) || 0,
                        rateioReceitaDespesa: Number(s.rateio_receita_despesa) || 0,
                        consumoGasValor: Number(s.consumo_gas_valor) || 0,
                        consumoGasMetros: Number(s.consumo_gas_metros) || 0,
                        fundoReserva: Number(s.fundo_reserva) || 0,
                        salaoFestas: Number(s.salao_festas) || 0,
                        rateioSindico: Number(s.rateio_sindico) || 0,
                        totalGeral: total,
                        resumoBoleto: s.resumo_boleto
                    };
                });

                // Ordenar por unidade
                linhas.sort((a, b) => {
                    const numA = parseInt(a.unidade);
                    const numB = parseInt(b.unidade);
                    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                    return a.unidade.localeCompare(b.unidade);
                });

                setLinhasRelatorio(linhas);
                setTotalGeralCondominio(somaGeralConsolidada);
                return; // Encerra aqui para exibir os dados exatos de como foram gravados
            }

            // SE NÃO FOI SALVO, marca como PENDENTE e realiza o cálculo em tempo real
            setIsRateioSalvo(false);

            // 1. Buscar membros, papéis (role) e fazer o join com profiles para pegar o nome completo
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
                    if (u.toLowerCase() !== "adm") {
                        unidadesSet.add(u);
                    }
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

            const unidadesUnicas = Array.from(unidadesSet).filter(u => u.toLowerCase() !== "adm").sort();
            const qtdUnidades = unidadesUnicas.length > 0 ? unidadesUnicas.length : 1;

            // 2. Buscar Contas (Receitas e Despesas)
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

            // 3. Buscar Tarifa de Gás
            const { data: tarifaData } = await supabase
                .from("condominio_contas_gas_metro_cubico")
                .select("valor_metro_cubico")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta)
                .maybeSingle();

            const valorMetroCubico = Number(tarifaData?.valor_metro_cubico || 0);

            // 4. Buscar Medições de Gás
            const { data: medicaoData } = await supabase
                .from("condominio_contas_gas_medicao")
                .select("unidade, consumo_calculado")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta);

            const consumoGasMap = new Map();
            (medicaoData || []).forEach((m: any) => {
                consumoGasMap.set(m.unidade?.trim(), Number(m.consumo_calculado || 0));
            });

            // 5. Buscar Fundo de Reservas
            const { data: fundoData } = await supabase
                .from("condominio_contas_fundo_de_reservas")
                .select("unidade, valor")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta);

            const fundoMap = new Map();
            (fundoData || []).forEach((f: any) => {
                fundoMap.set(f.unidade?.trim(), Number(f.valor || 0));
            });

            // 6. Buscar Cobranças do Salão de Festas
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

            // 7. Buscar Rateio do Síndico
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

            // 8. Consolidar linhas por unidade
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

                // Montagem do Resumo Texto Boleto com as siglas solicitadas e Total a Pagar
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

    const handleSalvarRateioBoletos = async () => {
        if (!condominio?.id || linhasRelatorio.length === 0) return;
        setSalvandoRateio(true);

        try {
            const dataCompetenciaCompleta = `${competenciaSelecionada}-01`;

            // Mapeando os dados forçando a tipagem numérica correta para evitar envios zerados
            const payload = linhasRelatorio.map((linha) => ({
                condominio_id: condominio.id,
                data_competencia: dataCompetenciaCompleta,
                unidade: linha.unidade,
                morador_nome: linha.moradorNome,
                taxa_base: Number(linha.taxaBase) || 0,
                fundo_reserva: Number(linha.fundoReserva) || 0,
                salao_festas: Number(linha.salaoFestas) || 0,
                rateio_receita_despesa: Number(linha.rateioReceitaDespesa) || 0,
                rateio_sindico: Number(linha.rateioSindico) || 0,
                consumo_gas_metros: Number(linha.consumoGasMetros) || 0,
                consumo_gas_valor: Number(linha.consumoGasValor) || 0,
                total_geral: Number(linha.totalGeral) || 0,
                resumo_boleto: linha.resumoBoleto,
                atualizado_em: new Date().toISOString()
            }));

            // Inserção em lote (Upsert para atualizar caso já exista)
            const { error } = await supabase
                .from("condominio_rateio_boletos")
                .upsert(payload, { onConflict: 'condominio_id, data_competencia, unidade' });

            if (error) {
                console.error("Erro detalhado do Supabase:", error);
                throw error;
            }

            setIsRateioSalvo(true); // Atualiza instantaneamente o status em tela
            alert("Rateio dos boletos salvo e atualizado com sucesso!");

        } catch (err) {
            console.error("Erro ao salvar rateio:", err);
            alert("Erro ao gravar rateio no banco de dados. Verifique o console.");
        } finally {
            setSalvandoRateio(false);
        }
    };

    const verifySindicoAndLoadData = async (currentSession: any) => {
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
                    setIsApenasMorador(true);
                    setLoading(false);
                }
                return;
            }

            const vinculoAdm = membroDataList.find((m: any) => m.role === 'sindico') || membroDataList[0];
            if (!vinculoAdm || vinculoAdm.role !== 'sindico') {
                if (isMountedRef.current) {
                    setIsApenasMorador(true);
                    setLoading(false);
                }
                return;
            }

            let nomeCondominioOficial = vinculoAdm.condominio_nome || "Condomínio";
            if (vinculoAdm.condominio_id) {
                const { data: condoDataReal } = await supabase
                    .from("condominios")
                    .select("nome")
                    .eq("id", vinculoAdm.condominio_id)
                    .maybeSingle();

                if (condoDataReal?.nome) nomeCondominioOficial = condoDataReal.nome;
            }

            if (isMountedRef.current) {
                setIsApenasMorador(false);
                setCondominio({ id: vinculoAdm.condominio_id, nome: nomeCondominioOficial });
                // O carregamento do relatório agora é gerido exclusivamente pelo useEffect que observa competenciaSelecionada
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
            if (isMountedRef.current) verifySindicoAndLoadData(currentSession);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, currentSession) => {
            if (isMountedRef.current) verifySindicoAndLoadData(currentSession);
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
    }, [competenciaSelecionada, condominio?.id]);

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
            await verifySindicoAndLoadData(data.session);
        } catch {
            setLoginError("Erro ao entrar.");
        } finally {
            setAuthLoading(false);
        }
    };

    const exportarCSV = () => {
        if (linhasRelatorio.length === 0) return alert("Sem dados para exportar.");

        let csvContent = "data:text/csv;charset=utf-8,Unidade;Morador;Taxa Base;Fundo de Reservas;Salão de Festas;Receita - Despesa (Rateio);Rateio Síndico;Medição Gás (m³ / R$);Total a Pagar;Resumo Texto Boleto\n";

        linhasRelatorio.forEach(row => {
            csvContent += `Apto ${row.unidade};"${row.moradorNome}";${row.taxaBase.toFixed(2)};${row.fundoReserva.toFixed(2)};${row.salaoFestas.toFixed(2)};${row.rateioReceitaDespesa.toFixed(2)};${row.rateioSindico.toFixed(2)};${row.consumoGasMetros.toFixed(2)} m³ (${row.consumoGasValor.toFixed(2)});${row.totalGeral.toFixed(2)};"${row.resumoBoleto}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_rateio_${competenciaSelecionada}.csv`);
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
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando relatório consolidado...</p>
            </div>
        );
    }

    if (!session || isApenasMorador) {
        return (
            <div className="min-h-screen bg-zinc-50/50 text-zinc-900 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 rounded-[2.5rem] shadow-sm space-y-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                        <Lock size={30} />
                    </div>
                    <h1 className="text-xl font-black tracking-tight">Área Restrita ao Síndico</h1>
                    <form onSubmit={handleLogin} className="space-y-4 text-left">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">E-mail ou ID</label>
                            <input
                                type="text"
                                required
                                className="w-full mt-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm outline-none focus:border-emerald-400"
                                value={emailOrSlug}
                                onChange={(e) => setEmailOrSlug(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Senha</label>
                            <input
                                type="password"
                                required
                                className="w-full mt-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm outline-none focus:border-emerald-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {loginError && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl text-center">{loginError}</p>}
                        <button type="submit" disabled={authLoading} className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer">
                            {authLoading ? "Acessando..." : "Entrar"}
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
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Relatório Consolidado</span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5">{condominio?.nome}</h1>
                        </div>
                    </div>
                </div>

                {/* Cards de Controles Alinhados lado a lado */}
                <div className="flex flex-col md:flex-row justify-end items-center gap-4 w-full">

                    {/* Agrupamento: Calendário e Status de Conclusão */}
                    <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                        {/* Container do Calendário */}
                        <div className="bg-white border border-zinc-200 p-2.5 rounded-xl flex items-center justify-center md:justify-start gap-3 shadow-sm relative overflow-hidden min-w-[120px] md:min-w-0">
                            <Calendar size={16} className="text-emerald-600 shrink-0" />

                            {/* Visualização customizada: Desktop */}
                            <span className="text-xs font-bold text-zinc-900 hidden md:block pointer-events-none">
                                {formatMesAnoDesktop(competenciaSelecionada)}
                            </span>

                            {/* Visualização customizada: Mobile */}
                            <span className="text-xs font-bold text-zinc-900 block md:hidden pointer-events-none">
                                {formatMesAnoMobile(competenciaSelecionada)}
                            </span>

                            <input
                                type="month"
                                value={competenciaSelecionada}
                                onChange={(e) => setCompetenciaSelecionada(e.target.value)}
                                onClick={(e) => {
                                    try {
                                        (e.target as HTMLInputElement).showPicker?.();
                                    } catch (err) {
                                        // Silencioso
                                    }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        {/* Status Indicator */}
                        {isRateioSalvo ? (
                            <div className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0" title="Rateio salvo e concluído">
                                <CheckCircle2 size={16} />
                                <span className="text-[10px] font-black uppercase tracking-wider hidden md:inline">Concluído</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 px-3 py-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shrink-0" title="Pendente de gravação">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-wider hidden md:inline">Pendente</span>
                            </div>
                        )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm flex items-center gap-2 w-full md:w-auto justify-end">
                        <button
                            onClick={exportarCSV}
                            className="flex items-center justify-center gap-1.5 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm cursor-pointer w-full md:w-auto"
                        >
                            <Download size={14} />
                            <span className="hidden md:inline">Exportar</span>
                            <span className="md:hidden">CSV</span>
                        </button>

                        <button
                            onClick={handleSalvarRateioBoletos}
                            disabled={salvandoRateio || linhasRelatorio.length === 0 || isRateioSalvo}
                            className="flex items-center justify-center gap-1.5 h-10 px-4 bg-zinc-900 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm cursor-pointer disabled:opacity-50 w-full md:w-auto"
                        >
                            <Save size={14} />
                            <span className="hidden md:inline">{salvandoRateio ? "Salvando..." : (isRateioSalvo ? "Salvo" : "Salvar Rateio")}</span>
                            <span className="md:hidden">{salvandoRateio ? "..." : (isRateioSalvo ? "Salvo" : "Salvar")}</span>
                        </button>
                    </div>

                </div>

                {/* Tabela de Relatório Consolidado */}
                <div className="w-full bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-zinc-900">
                                Demonstrativo<span className="hidden md:inline"> por Unidade</span>
                            </h2>
                            <p className="text-xs text-zinc-500 font-medium">Rateio consolidado referente à competência {competenciaSelecionada}.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                                Consolidado<span className="hidden md:inline"> Geral</span>
                            </span>
                            <span className="text-lg font-black text-emerald-600">{formatarMoeda(totalGeralCondominio)}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-zinc-100 rounded-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                    <th className="p-3.5 pl-5">Unidade</th>
                                    <th className="p-3.5">Morador</th>
                                    <th className="p-3.5 text-right">Taxa Base</th>
                                    <th className="p-3.5 text-right">Fundo de Reservas</th>
                                    <th className="p-3.5 text-right">Salão de Festas</th>
                                    <th className="p-3.5 text-right">Receita - Despesa (Rateio)</th>
                                    <th className="p-3.5 text-right">Rateio Síndico</th>
                                    <th className="p-3.5 text-right">Medição Gás (m³ / R$)</th>
                                    <th className="p-3.5 text-right">Total a Pagar</th>
                                    <th className="p-3.5 pr-5">Resumo Texto Boleto</th>
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
                                            <td className="p-3.5 pl-5 text-xs font-bold text-zinc-800">Apto {linha.unidade}</td>
                                            <td className="p-3.5 text-xs font-medium text-zinc-600">{linha.moradorNome}</td>
                                            <td className="p-3.5 text-right text-xs font-medium text-zinc-700">{formatarMoeda(linha.taxaBase)}</td>
                                            <td className="p-3.5 text-right text-xs font-medium text-zinc-700">{formatarMoeda(linha.fundoReserva)}</td>
                                            <td className="p-3.5 text-right text-xs font-medium text-zinc-700">{formatarMoeda(linha.salaoFestas)}</td>
                                            <td className="p-3.5 text-right text-xs font-medium text-zinc-700">{formatarMoeda(linha.rateioReceitaDespesa)}</td>
                                            <td className="p-3.5 text-right text-xs font-medium text-zinc-700">{formatarMoeda(linha.rateioSindico)}</td>
                                            <td className="p-3.5 text-right text-xs font-medium text-zinc-700">
                                                {linha.consumoGasMetros.toFixed(2)} m³ <span className="text-[10px] text-zinc-400">({formatarMoeda(linha.consumoGasValor)})</span>
                                            </td>
                                            <td className="p-3.5 text-right text-xs font-black text-emerald-600">{formatarMoeda(linha.totalGeral)}</td>
                                            <td className="p-3.5 pr-5 text-[10px] font-mono text-zinc-500 whitespace-nowrap">{linha.resumoBoleto}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Rodapé institucional */}
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