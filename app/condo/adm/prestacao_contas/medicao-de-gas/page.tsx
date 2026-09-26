// app/condo/adm/prestacao_contas/medicao-de-gas/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft,
    FileSpreadsheet,
    Lock,
    CheckCircle2,
    Save,
    Calendar,
    Flame
} from "lucide-react";

export default function MedicaoGasPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [isApenasMorador, setIsApenasMorador] = useState(false);

    // Estados da Página de Gás
    const [competenciaSelecionada, setCompetenciaSelecionada] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const [unidadesCondominio, setUnidadesCondominio] = useState<string[]>([]);
    const [gasConsumoMap, setGasConsumoMap] = useState<Record<string, { anterior: string; atual: string }>>({});
    const [valorMetroCubicoGas, setValorMetroCubicoGas] = useState('0,00');

    const [loadingTarifaGas, setLoadingTarifaGas] = useState(false);
    const [tarifaGasSuccess, setTarifaGasSuccess] = useState('');

    const [loadingMedicaoGas, setLoadingMedicaoGas] = useState(false);
    const [medicaoGasSuccess, setMedicaoGasSuccess] = useState('');

    const isMountedRef = useRef(true);

    const formatarValorExibicao = (valor: any): string => {
        if (valor === null || valor === undefined || valor === '') return '0,00';
        const num = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(',', '.'));
        if (isNaN(num)) return '0,00';
        return num.toFixed(2).replace('.', ',');
    };

    const formatarMedicaoGasExibicao = (valor: any): string => {
        if (valor === null || valor === undefined || valor === '') return '';
        const num = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(',', '.'));
        if (isNaN(num)) return '';
        return num.toFixed(3).replace('.', ',');
    };

    const converterParaFloat = (valorStr: string): number => {
        if (!valorStr) return 0;
        let limpo = String(valorStr).trim();
        if (limpo.includes('.') && limpo.includes(',')) {
            limpo = limpo.replace(/\./g, '').replace(',', '.');
        } else if (limpo.includes(',')) {
            limpo = limpo.replace(',', '.');
        } else if ((limpo.match(/\./g) || []).length > 1) {
            limpo = limpo.replace(/\./g, '');
        }
        const num = parseFloat(limpo);
        return isNaN(num) ? 0 : num;
    };

    const carregarDadosGas = async (condoId: string, competencia: string) => {
        try {
            const dataCompetenciaCompleta = `${competencia}-01`;

            // 1. Carrega as unidades
            const { data: membrosData } = await supabase
                .from("condominio_membros")
                .select("unidade")
                .eq("condominio_id", condoId);

            const unicas = Array.from(new Set((membrosData || []).map((m: any) => m.unidade?.trim()).filter(Boolean))).sort();
            setUnidadesCondominio(unicas);

            // 2. Carrega a tarifa do gás
            const { data: tarifaData } = await supabase
                .from("condominio_contas_gas_metro_cubico")
                .select("valor_metro_cubico")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta)
                .maybeSingle();

            if (tarifaData) {
                setValorMetroCubicoGas(formatarValorExibicao(tarifaData.valor_metro_cubico));
            } else {
                const { data: ultimaTarifa } = await supabase
                    .from("condominio_contas_gas_metro_cubico")
                    .select("valor_metro_cubico")
                    .eq("condominio_id", condoId)
                    .lte("data_competencia", dataCompetenciaCompleta)
                    .order("data_competencia", { ascending: false })
                    .limit(1);

                if (ultimaTarifa && ultimaTarifa.length > 0) {
                    setValorMetroCubicoGas(formatarValorExibicao(ultimaTarifa[0].valor_metro_cubico));
                } else {
                    setValorMetroCubicoGas('0,00');
                }
            }

            // 3. Carrega as medições (Antes e Depois)
            const { data: medicaoAtualData } = await supabase
                .from("condominio_contas_gas_medicao")
                .select("unidade, leitura_anterior, leitura_atual")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta);

            // Cálculo da competência anterior para puxar a "leitura atual" passada como "anterior" deste mês
            const [anoStr, mesStr] = competencia.split('-');
            let anoNum = parseInt(anoStr);
            let mesNum = parseInt(mesStr) - 1;
            if (mesNum === 0) {
                mesNum = 12;
                anoNum -= 1;
            }
            const competenciaAnterior = `${anoNum}-${String(mesNum).padStart(2, '0')}-01`;

            const { data: medicaoAnteriorData } = await supabase
                .from("condominio_contas_gas_medicao")
                .select("unidade, leitura_atual")
                .eq("condominio_id", condoId)
                .eq("data_competencia", competenciaAnterior);

            const mapaMedicao: Record<string, { anterior: string; atual: string }> = {};
            unicas.forEach(u => {
                const atualReg = (medicaoAtualData || []).find((m: any) => m.unidade === u);
                const anteriorRegDoMes = atualReg ? atualReg.leitura_anterior : null;
                const anteriorRegDoMesAnterior = (medicaoAnteriorData || []).find((m: any) => m.unidade === u)?.leitura_atual;

                const valAnt = anteriorRegDoMes !== null && anteriorRegDoMes !== undefined
                    ? anteriorRegDoMes
                    : (anteriorRegDoMesAnterior !== undefined ? anteriorRegDoMesAnterior : '');

                const valAtu = atualReg ? atualReg.leitura_atual : '';

                mapaMedicao[u] = {
                    anterior: formatarMedicaoGasExibicao(valAnt),
                    atual: formatarMedicaoGasExibicao(valAtu)
                };
            });
            setGasConsumoMap(mapaMedicao);

        } catch (err) {
            console.error("Erro em carregarDadosGas:", err);
        }
    };

    const verifySindicoAndLoadData = async (currentSession: any) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    window.location.href = '/condo/adm/prestacao_contas'; // Redireciona se não estiver logado
                }
                return;
            }

            if (isMountedRef.current) setSession(currentSession);
            const userId = currentSession.user.id;

            const { data: membroDataList } = await supabase
                .from("condominio_membros")
                .select("condominio_id, role, unidade, acesso_app, condominio_nome")
                .eq("user_id", userId);

            if (!membroDataList || membroDataList.length === 0) {
                if (isMountedRef.current) setIsApenasMorador(true);
                return;
            }

            const vinculoAdm = membroDataList.find((m: any) => m.role === 'sindico') || membroDataList[0];

            if (!vinculoAdm || vinculoAdm.role !== 'sindico') {
                if (isMountedRef.current) setIsApenasMorador(true);
                return;
            }

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
                setIsApenasMorador(false);
                setCondominio({ id: vinculoAdm.condominio_id, nome: nomeCondominioOficial });
                await carregarDadosGas(vinculoAdm.condominio_id, competenciaSelecionada);
            }
        } catch (e: any) {
            console.warn("Exceção tratada em verifySindicoAndLoadData:", e);
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        const initAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                await verifySindicoAndLoadData(currentSession);
            } catch (err) {
                console.error("Erro ao recuperar sessão inicial:", err);
                if (isMountedRef.current) setLoading(false);
            }
        };
        initAuth();

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (condominio && condominio.id) {
            carregarDadosGas(condominio.id, competenciaSelecionada);
        }
    }, [competenciaSelecionada]);

    const handleSalvarTarifaGas = async () => {
        if (!condominio || !session) return;
        setLoadingTarifaGas(true);
        setTarifaGasSuccess("");

        try {
            const dataCompetenciaCompleta = `${competenciaSelecionada}-01`;
            const valorGasNum = converterParaFloat(valorMetroCubicoGas);

            const { data: tarifaExistente } = await supabase
                .from("condominio_contas_gas_metro_cubico")
                .select("id")
                .eq("condominio_id", condominio.id)
                .eq("data_competencia", dataCompetenciaCompleta)
                .maybeSingle();

            if (tarifaExistente) {
                await supabase
                    .from("condominio_contas_gas_metro_cubico")
                    .update({ valor_metro_cubico: valorGasNum, atualizado_em: new Date().toISOString() })
                    .eq("id", tarifaExistente.id);
            } else {
                await supabase
                    .from("condominio_contas_gas_metro_cubico")
                    .insert([{
                        condominio_id: condominio.id,
                        valor_metro_cubico: valorGasNum,
                        data_competencia: dataCompetenciaCompleta,
                        criado_por: session.user.id,
                        atualizado_em: new Date().toISOString()
                    }]);
            }

            setTarifaGasSuccess("Tarifa do gás salva com sucesso!");
            await carregarDadosGas(condominio.id, competenciaSelecionada);
            setTimeout(() => setTarifaGasSuccess(""), 3000);
        } catch (err: any) {
            alert("Erro ao salvar tarifa: " + err?.message);
        } finally {
            setLoadingTarifaGas(false);
        }
    };

    const handleSalvarMedicaoGasLinha = async (unidade: string) => {
        if (!condominio || !session) return;

        try {
            const dataCompetenciaCompleta = `${competenciaSelecionada}-01`;
            const dadosUnidade = gasConsumoMap[unidade] || { anterior: '', atual: '' };
            const antNum = converterParaFloat(dadosUnidade.anterior);
            const atuNum = converterParaFloat(dadosUnidade.atual);
            const consumoCalc = Math.max(0, atuNum - antNum);
            const tarifaVal = converterParaFloat(valorMetroCubicoGas);
            const valorTotalGas = consumoCalc * tarifaVal;

            const payload = {
                condominio_id: condominio.id,
                unidade: unidade,
                leitura_anterior: antNum,
                leitura_atual: atuNum,
                consumo_calculado: consumoCalc,
                valor_calculado: valorTotalGas,
                data_competencia: dataCompetenciaCompleta,
                criado_por: session.user.id,
                atualizado_em: new Date().toISOString()
            };

            const { error: upsertErr } = await supabase
                .from("condominio_contas_gas_medicao")
                .upsert([payload], {
                    // Correção: passando as colunas da chave única em vez do nome da constraint
                    onConflict: 'condominio_id,unidade,data_competencia'
                });

            if (upsertErr) throw upsertErr;
            alert(`Medição da unidade ${unidade} salva com sucesso!`);
        } catch (err: any) {
            console.error(`Erro ao salvar medição da unidade ${unidade}:`, err);
            alert(`Erro ao salvar medição da unidade ${unidade}: ` + err?.message);
        }
    };

    const handleSalvarMedicaoGas = async () => {
        if (!condominio || !session) return;
        setLoadingMedicaoGas(true);
        setMedicaoGasSuccess("");

        try {
            const dataCompetenciaCompleta = `${competenciaSelecionada}-01`;
            const tarifaVal = converterParaFloat(valorMetroCubicoGas);

            const payloads = unidadesCondominio.filter(u => u.toLowerCase() !== 'adm').map((unidade) => {
                const dadosUnidade = gasConsumoMap[unidade] || { anterior: '', atual: '' };
                const antNum = converterParaFloat(dadosUnidade.anterior);
                const atuNum = converterParaFloat(dadosUnidade.atual);
                const consumoCalc = Math.max(0, atuNum - antNum);
                const valorTotalGas = consumoCalc * tarifaVal;

                return {
                    condominio_id: condominio.id,
                    unidade: unidade,
                    leitura_anterior: antNum,
                    leitura_atual: atuNum,
                    consumo_calculado: consumoCalc,
                    valor_calculado: valorTotalGas,
                    data_competencia: dataCompetenciaCompleta,
                    criado_por: session.user.id,
                    atualizado_em: new Date().toISOString()
                };
            });

            if (payloads.length > 0) {
                const { error: upsertErr } = await supabase
                    .from("condominio_contas_gas_medicao")
                    .upsert(payloads, {
                        // Correção: passando as colunas da chave única em vez do nome da constraint
                        onConflict: 'condominio_id,unidade,data_competencia'
                    });

                if (upsertErr) throw upsertErr;
            }

            setMedicaoGasSuccess("Todas as medições de gás foram salvas com sucesso!");
            await carregarDadosGas(condominio.id, competenciaSelecionada);
            setTimeout(() => setMedicaoGasSuccess(""), 3000);
        } catch (err: any) {
            console.error("Erro ao salvar medição em lote:", err);
            alert("Erro ao salvar medições: " + err?.message);
        } finally {
            setLoadingMedicaoGas(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="animate-spin text-emerald-600 mb-4">
                    <FileSpreadsheet size={32} />
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando medições...</p>
            </div>
        );
    }

    if (isApenasMorador) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                        <Lock size={30} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-xl font-black tracking-tight">Área Restrita</h1>
                        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                            Apenas gestores têm acesso a esta página.
                        </p>
                    </div>
                    <Link
                        href="/condo/adm"
                        className="w-full bg-zinc-900 hover:bg-black text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                        <ArrowLeft size={14} /> Voltar ao Início
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-4 md:p-10">
            <div className="space-y-8 max-w-5xl mx-auto">
                {/* CABEÇALHO */}
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-auto h-auto bg-emerald-600 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0 self-stretch">
                                    <Flame size={24} />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                                        Prestação de Contas
                                    </span>
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5">
                                        Medição de Gás
                                    </h1>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-3">
                                <Link
                                    href="/condo/adm/prestacao_contas"
                                    className="group relative flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 overflow-hidden shrink-0 cursor-pointer"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-600 to-teal-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                                    <ArrowLeft size={12} className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out" />
                                    <span>Voltar</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <p className="text-xs md:text-sm text-zinc-500 font-medium">
                                Gestão de consumo de gás por unidade para o período de {competenciaSelecionada}.
                            </p>
                        </div>

                        {/* Filtro do Mês/Ano */}
                        <div className="bg-white border border-zinc-200 p-3 rounded-2xl flex items-center gap-3 shadow-sm shrink-0">
                            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">Mês / Ano de Referência</label>
                                <input
                                    type="month"
                                    value={competenciaSelecionada}
                                    onChange={(e) => setCompetenciaSelecionada(e.target.value)}
                                    className="text-xs font-bold text-zinc-900 bg-transparent outline-none cursor-pointer mt-0.5"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* TARIFA DO GÁS */}
                <div className="w-full bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="space-y-4">
                        <div className="bg-amber-50/60 border border-amber-200/70 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-500 text-white p-2.5 rounded-xl">
                                    <Flame size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">Tarifa do Gás (Metro Cúbico) - {competenciaSelecionada}</h3>
                                    <p className="text-xs text-amber-700">Valor unitário aplicado no cálculo de consumo para este mês.</p>
                                </div>
                            </div>
                            <div className="w-full sm:w-48 shrink-0">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                                    <input
                                        type="text"
                                        placeholder="0,00"
                                        value={valorMetroCubicoGas}
                                        onChange={(e) => setValorMetroCubicoGas(e.target.value)}
                                        onBlur={(e) => setValorMetroCubicoGas(formatarValorExibicao(e.target.value))}
                                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {tarifaGasSuccess && (
                            <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2">
                                <CheckCircle2 size={14} /> {tarifaGasSuccess}
                            </p>
                        )}

                        <div>
                            <button
                                type="button"
                                onClick={handleSalvarTarifaGas}
                                disabled={loadingTarifaGas}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-amber-600/10 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loadingTarifaGas ? "Salvando Tarifa..." : "Salvar Tarifa do Gás"}
                            </button>
                        </div>
                    </div>

                    <hr className="border-zinc-100 my-4" />

                    {/* TABELA DE MEDIÇÃO */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                            Medição de Gás por Apartamento (Antes x Depois)
                        </h3>
                        <div className="overflow-x-auto border border-zinc-100 rounded-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                        <th className="p-3.5 pl-5">Mês / Ano</th>
                                        <th className="p-3.5">Unidade / Apartamento</th>
                                        <th className="p-3.5">Leitura Mês Passado (Antes)</th>
                                        <th className="p-3.5">Leitura Mês Atual (Depois)</th>
                                        <th className="p-3.5 pr-5 text-right">Consumo (m³) / Salvar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {unidadesCondominio.filter(u => u.toLowerCase() !== 'adm').length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-xs text-zinc-400">
                                                Nenhuma unidade cadastrada neste condomínio.
                                            </td>
                                        </tr>
                                    ) : (
                                        unidadesCondominio.filter(u => u.toLowerCase() !== 'adm').map((unidade) => {
                                            const ant = converterParaFloat(gasConsumoMap[unidade]?.anterior);
                                            const atu = converterParaFloat(gasConsumoMap[unidade]?.atual);
                                            const consumo = Math.max(0, atu - ant);
                                            const tarifaVal = converterParaFloat(valorMetroCubicoGas);
                                            const valorTotalGas = consumo * tarifaVal;

                                            return (
                                                <tr key={unidade} className="hover:bg-zinc-50/50 transition-colors">
                                                    <td className="p-3.5 pl-5 text-xs font-bold text-emerald-600 font-mono">
                                                        {competenciaSelecionada}
                                                    </td>
                                                    <td className="p-3.5 text-xs font-bold text-zinc-800">
                                                        Apto {unidade}
                                                    </td>
                                                    <td className="p-3.5">
                                                        <input
                                                            type="text"
                                                            placeholder="0,000"
                                                            value={gasConsumoMap[unidade]?.anterior || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setGasConsumoMap(prev => ({
                                                                    ...prev,
                                                                    [unidade]: { ...(prev[unidade] || { atual: '' }), anterior: val }
                                                                }));
                                                            }}
                                                            onBlur={() => {
                                                                setGasConsumoMap(prev => ({
                                                                    ...prev,
                                                                    [unidade]: {
                                                                        ...(prev[unidade] || { atual: '' }),
                                                                        anterior: formatarMedicaoGasExibicao(prev[unidade]?.anterior)
                                                                    }
                                                                }));
                                                            }}
                                                            className="w-full max-w-[140px] px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:bg-white focus:border-emerald-400"
                                                        />
                                                    </td>
                                                    <td className="p-3.5">
                                                        <input
                                                            type="text"
                                                            placeholder="0,000"
                                                            value={gasConsumoMap[unidade]?.atual || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setGasConsumoMap(prev => ({
                                                                    ...prev,
                                                                    [unidade]: { ...(prev[unidade] || { anterior: '' }), atual: val }
                                                                }));
                                                            }}
                                                            onBlur={() => {
                                                                setGasConsumoMap(prev => ({
                                                                    ...prev,
                                                                    [unidade]: {
                                                                        ...(prev[unidade] || { anterior: '' }),
                                                                        atual: formatarMedicaoGasExibicao(prev[unidade]?.atual)
                                                                    }
                                                                }));
                                                            }}
                                                            className="w-full max-w-[140px] px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:bg-white focus:border-emerald-400"
                                                        />
                                                    </td>
                                                    <td className="p-3.5 pr-5 flex items-center justify-end gap-3">
                                                        <div className="text-right text-xs font-black text-emerald-600">
                                                            {consumo.toFixed(3).replace('.', ',')} m³ <span className="text-[10px] text-zinc-400 font-normal">({valorTotalGas > 0 ? `R$ ${valorTotalGas.toFixed(2).replace('.', ',')}` : 'R$ 0,00'})</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSalvarMedicaoGasLinha(unidade)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center shrink-0"
                                                            title="Gravar Leitura (Salvar Linha)"
                                                        >
                                                            <Save size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {medicaoGasSuccess && (
                        <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2">
                            <CheckCircle2 size={14} /> {medicaoGasSuccess}
                        </p>
                    )}

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleSalvarMedicaoGas}
                            disabled={loadingMedicaoGas}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loadingMedicaoGas ? "Salvando Todas as Medições..." : "Salvar Todas as Medições de Gás"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}