// app/condo/adm/obrigacoes_fiscais/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    Building2,
    Loader2,
    ArrowLeft,
    Instagram,
    FileText,
    CheckCircle2,
    AlertCircle,
    Calendar,
    ShieldCheck,
    Check,
    X,
    Info,
    Plus
} from "lucide-react";

interface ObrigacaoItem {
    id: string;
    condominio_id: string;
    nome: string;
    tipo: 'mensal' | 'anual' | 'certidao';
    prazo_regra: string;
    observacao_asterisco?: string;
    status: string;
    data_atualizacao: string;
}

export default function ObrigacoesFiscaisPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [obrigacoes, setObrigacoes] = useState<ObrigacaoItem[]>([]);

    // Filtro de Ano/Mês dinâmico limitado até o mês corrente (Julho de 2026)
    const [competenciaSelecionada, setCompetenciaSelecionada] = useState<string>('2026-07');
    const [aplicavelMap, setAplicavelMap] = useState<Record<string, boolean>>({});
    const [quitadoMap, setQuitadoMap] = useState<Record<string, boolean>>({});

    const [competenciasExtras, setCompetenciasExtras] = useState<string[]>([]);
    const [isModalCompetenciaOpen, setIsModalCompetenciaOpen] = useState(false);
    const [novoAnoMesInput, setNovoAnoMesInput] = useState('');

    const isMountedRef = useRef(true);

    const formatarNomePrimeiroEUltimo = (nomeCompleto: string) => {
        if (!nomeCompleto) return "";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length <= 1) return partes[0] || "";
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    const gerarCompetenciasDisponiveis = () => {
        const anoAtual = 2026;
        const mesLimite = 7; // Julho de 2026
        const lista = [];

        // Ordem cronológica (calendário: Janeiro até o limite)
        for (let m = 1; m <= mesLimite; m++) {
            const mesStr = String(m).padStart(2, '0');
            const valor = `${anoAtual}-${mesStr}`;
            // Formato curto no mobile ("Jun/26") e completo ou adaptado conforme desejado
            const nomeMes = new Date(anoAtual, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            const nomeFormatado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1).replace('.', '');
            lista.push({ valor, label: nomeFormatado });
        }

        competenciasExtras.forEach(comp => {
            if (!lista.some(l => l.valor === comp)) {
                const [ano, mes] = comp.split('-');
                const nomeMes = new Date(parseInt(ano, 10), parseInt(mes, 10) - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
                const nomeFormatado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1).replace('.', '');
                lista.push({ valor: comp, label: nomeFormatado });
            }
        });

        return lista;
    };

    const competenciasDisponiveis = gerarCompetenciasDisponiveis();

    const calcularPrazoDinamico = (regra: string, competencia: string) => {
        const [anoStr, mesStr] = competencia.split('-');
        const ano = parseInt(anoStr, 10);
        const mes = parseInt(mesStr, 10);

        if (regra === 'dia_07') {
            let mesVenc = mes + 1;
            let anoVenc = ano;
            if (mesVenc > 12) {
                mesVenc = 1;
                anoVenc += 1;
            }
            return `07/${String(mesVenc).padStart(2, '0')}/${anoVenc}`;
        }
        if (regra === 'dia_20') {
            let mesVenc = mes + 1;
            let anoVenc = ano;
            if (mesVenc > 12) {
                mesVenc = 1;
                anoVenc += 1;
            }
            return `20/${String(mesVenc).padStart(2, '0')}/${anoVenc}`;
        }
        if (regra === 'prefeitura') {
            return '*';
        }
        if (regra === 'anual') {
            return `Fev/Mar de ${ano + 1}`;
        }
        if (regra === 'continua') {
            return '*';
        }
        return '*';
    };

    const loadDadosCompetencia = async (condoId: string, competencia: string) => {
        const { data, error } = await supabase
            .from("condominio_obrigacoes_status")
            .select("*")
            .eq("condominio_id", condoId)
            .eq("competencia", competencia);

        const novoAplicavel: Record<string, boolean> = {};
        const novoQuitado: Record<string, boolean> = {};

        obrigacoes.forEach(o => {
            novoAplicavel[o.id] = true;
            novoQuitado[o.id] = false;
        });

        if (!error && data && data.length > 0) {
            data.forEach((item: any) => {
                novoAplicavel[item.obrigacao_id] = item.aplicavel ?? true;
                novoQuitado[item.obrigacao_id] = item.quitado ?? false;
            });
        }

        if (isMountedRef.current) {
            setAplicavelMap(novoAplicavel);
            setQuitadoMap(novoQuitado);
        }
    };

    const loadObrigacoes = async (condoId: string) => {
        const listaPadrao: ObrigacaoItem[] = [
            {
                id: '2',
                condominio_id: condoId,
                nome: 'DARF / GPS (Impostos Retidos e Previdenciários)',
                tipo: 'mensal',
                prazo_regra: 'dia_20',
                status: 'Regular / Em dia',
                data_atualizacao: new Date().toISOString()
            },
            {
                id: '1',
                condominio_id: condoId,
                nome: 'DCTFWeb / eSocial (Folha e Pró-Labore)',
                tipo: 'mensal',
                prazo_regra: 'dia_07',
                status: 'Regular / Em dia',
                data_atualizacao: new Date().toISOString()
            },
            {
                id: '3',
                condominio_id: condoId,
                nome: 'ISS Municipal (Serviços Tomados)',
                tipo: 'mensal',
                prazo_regra: 'prefeitura',
                observacao_asterisco: 'ISS Municipal: Vencimento pela Prefeitura',
                status: 'Regular / Em dia',
                data_atualizacao: new Date().toISOString()
            },
            {
                id: '4',
                condominio_id: condoId,
                nome: 'DIRF (Declaração de IR Retido na Fonte)',
                tipo: 'anual',
                prazo_regra: 'anual',
                observacao_asterisco: 'DIRF: Entrega anual (Fev/Mar subsequente)',
                status: 'Entregue',
                data_atualizacao: new Date().toISOString()
            },
            {
                id: '5',
                condominio_id: condoId,
                nome: 'Certidão Negativa de Débitos Federais (CND)',
                tipo: 'certidao',
                prazo_regra: 'continua',
                observacao_asterisco: 'CND Federal: Renovação contínua conforme validade',
                status: 'Válida',
                data_atualizacao: new Date().toISOString()
            },
            {
                id: '6',
                condominio_id: condoId,
                nome: 'CRF do FGTS (Regularidade do Empregador)',
                tipo: 'certidao',
                prazo_regra: 'continua',
                observacao_asterisco: 'CRF FGTS: Renovação contínua (Caixa)',
                status: 'Válida',
                data_atualizacao: new Date().toISOString()
            }
        ];

        if (isMountedRef.current) {
            setObrigacoes(listaPadrao);
        }

        await loadDadosCompetencia(condoId, competenciaSelecionada);
    };

    const handleToggleAplicavel = async (obrigacaoId: string) => {
        if (!condominio) return;
        const novoValor = !aplicavelMap[obrigacaoId];
        setAplicavelMap(prev => ({ ...prev, [obrigacaoId]: novoValor }));

        await salvarStatusNoBanco(obrigacaoId, novoValor, quitadoMap[obrigacaoId] || false);
    };

    const handleToggleQuitado = async (obrigacaoId: string) => {
        if (!condominio) return;
        const novoValor = !quitadoMap[obrigacaoId];
        setQuitadoMap(prev => ({ ...prev, [obrigacaoId]: novoValor }));

        await salvarStatusNoBanco(obrigacaoId, aplicavelMap[obrigacaoId] ?? true, novoValor);
    };

    const salvarStatusNoBanco = async (obrigacaoId: string, aplicavel: boolean, quitado: boolean) => {
        if (!condominio) return;
        try {
            await supabase
                .from("condominio_obrigacoes_status")
                .upsert({
                    condominio_id: condominio.id,
                    obrigacao_id: obrigacaoId,
                    competencia: competenciaSelecionada,
                    aplicavel,
                    quitado,
                    atualizado_em: new Date().toISOString()
                }, { onConflict: 'condominio_id,obrigacao_id,competencia' });
        } catch (e) {
            console.error("Erro ao salvar status da obrigação fiscal:", e);
        }
    };

    const handleAdicionarCompetenciaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!novoAnoMesInput) return;
        if (!competenciasExtras.includes(novoAnoMesInput)) {
            setCompetenciasExtras(prev => [...prev, novoAnoMesInput]);
        }
        setCompetenciaSelecionada(novoAnoMesInput);
        setIsModalCompetenciaOpen(false);
        setNovoAnoMesInput('');
    };

    useEffect(() => {
        if (condominio && condominio.id) {
            loadDadosCompetencia(condominio.id, competenciaSelecionada);
        }
    }, [competenciaSelecionada]);

    const verifyAndLoad = async (currentSession: any) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setCondominio(null);
                    setObrigacoes([]);
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
                    setObrigacoes([]);
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
                await loadObrigacoes(vinculoAdm.condominio_id);
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
                setObrigacoes([]);
                setLoading(false);
            }
        });
        authSub = subscription;

        return () => {
            isMountedRef.current = false;
            if (authSub) authSub.unsubscribe();
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
        setObrigacoes([]);
        setLoading(false);
        window.dispatchEvent(new Event("storage"));
    };

    const observacoesComAsterisco = obrigacoes.filter(o => o.observacao_asterisco);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando obrigações fiscais...</p>
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
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-auto h-auto bg-blue-600 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0 self-stretch">
                                <FileText size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                    Obrigações Fiscais
                                </span>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5">
                                    <span className="md:hidden text-black">{formatarNomePrimeiroEUltimo(condominio?.nome || "")}</span>
                                    <span className="hidden md:inline">{condominio?.nome}</span>
                                </h1>
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

                {/* Descrição e Botão Adicionar Competência com largura padronizada */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <p className="text-xs md:text-sm text-zinc-500 font-medium md:max-w-xl">
                        <span className="md:hidden">Painel de obrigações fiscais e certidões.</span>
                        <span className="hidden md:inline">Painel informativo sobre obrigações fiscais, previdenciárias e certidões do condomínio.</span>
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsModalCompetenciaOpen(true)}
                            className="w-full sm:w-[220px] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                        >
                            <Plus size={16} /> Adicionar competência
                        </button>
                    </div>
                </div>

                {/* Banner Informativo / Gestão Fiscal e Filtro de Competência */}
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-[2rem] mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="bg-blue-600 text-white p-2 rounded-xl shrink-0 mt-0.5">
                            <ShieldCheck size={18} />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xs font-black uppercase tracking-wider text-blue-900">Gestão Fiscal</h2>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                <span className="md:hidden">Verifique e atualize a aplicabilidade e quitação das obrigações.</span>
                                <span className="hidden md:inline">Selecione a competência desejada abaixo para verificar e atualizar a aplicabilidade e a quitação de cada obrigação no período correspondente.</span>
                            </p>
                        </div>
                    </div>

                    {/* Filtro de Ano/Mês (Competência) com alinhamento interno ajustado */}
                    <div className="flex items-center justify-between sm:justify-start gap-2 bg-white border border-blue-200 px-4 py-2.5 rounded-2xl shadow-sm shrink-0 w-full sm:w-[220px]">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Competência:</span>
                        <select
                            value={competenciaSelecionada}
                            onChange={(e) => setCompetenciaSelecionada(e.target.value)}
                            className="bg-transparent text-xs font-black text-blue-900 outline-none cursor-pointer uppercase tracking-wider text-right sm:text-left pr-1"
                        >
                            {competenciasDisponiveis.map((comp) => (
                                <option key={comp.valor} value={comp.valor}>
                                    {comp.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tabela de Obrigações Otimizada */}
                <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm mb-4">
                    {obrigacoes.length === 0 ? (
                        <div className="text-center py-12 space-y-2">
                            <AlertCircle className="mx-auto text-zinc-300" size={36} />
                            <p className="text-zinc-400 text-sm font-medium">Nenhuma obrigação fiscal encontrada.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="sticky top-0 bg-white z-20 border-b border-zinc-100">
                                    <tr>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Obrigação / Documento</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Ciclo</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Vencimento</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-center">Aplicável</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-center">Quitação Realizada</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right pr-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {obrigacoes.map((item) => {
                                        const isAplicavel = aplicavelMap[item.id] ?? true;
                                        const isQuitado = quitadoMap[item.id] ?? false;
                                        const prazoExibicao = calcularPrazoDinamico(item.prazo_regra, competenciaSelecionada);

                                        return (
                                            <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors group">
                                                <td className="py-4 pr-3 text-xs font-normal text-zinc-800">
                                                    {item.nome}
                                                </td>
                                                <td className="py-4 pr-3 text-xs font-normal text-zinc-600 uppercase tracking-wider text-[11px]">
                                                    {item.tipo === 'mensal' ? 'Mensal' : item.tipo === 'anual' ? 'Anual' : 'Certidão'}
                                                </td>
                                                <td className="py-4 pr-3 text-xs font-normal text-zinc-700">
                                                    {prazoExibicao}
                                                </td>
                                                <td className="py-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleAplicavel(item.id)}
                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1 ${isAplicavel
                                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                                : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                                                            }`}
                                                    >
                                                        {isAplicavel ? <Check size={12} /> : <X size={12} />}
                                                        {isAplicavel ? 'Aplicável' : 'N/A'}
                                                    </button>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <button
                                                        type="button"
                                                        disabled={!isAplicavel}
                                                        onClick={() => handleToggleQuitado(item.id)}
                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1 ${!isAplicavel
                                                                ? 'opacity-40 cursor-not-allowed bg-zinc-100 text-zinc-400 border border-zinc-200'
                                                                : isQuitado
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer'
                                                                    : 'bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer'
                                                            }`}
                                                    >
                                                        {isAplicavel && (isQuitado ? <Check size={12} /> : <X size={12} />)}
                                                        {!isAplicavel ? 'N/A' : (isQuitado ? 'Quitado' : 'À Pagar')}
                                                    </button>
                                                </td>
                                                <td className="py-4 text-right pr-4">
                                                    {!isAplicavel ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-400 border border-zinc-200">
                                                            N/A
                                                        </span>
                                                    ) : isQuitado ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <CheckCircle2 size={12} /> Quitado / Regular
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                                                            <AlertCircle size={12} /> À Pagar
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Explicação dos asteriscos (*) fora do quadro */}
                {observacoesComAsterisco.length > 0 && (
                    <div className="mb-12 px-6 py-4 bg-zinc-100/70 border border-zinc-200/80 rounded-2xl space-y-1.5">
                        <div className="flex items-center gap-2 text-zinc-700 font-bold text-xs uppercase tracking-wider">
                            <Info size={14} className="text-blue-600" />
                            <span className="md:hidden">Observações (*):</span>
                            <span className="hidden md:inline">Observações sobre os vencimentos (*):</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-xs text-zinc-600">
                            {observacoesComAsterisco.map((item) => (
                                <li key={item.id}>
                                    <span className="md:hidden">{item.observacao_asterisco?.split(':')[0]}: {item.observacao_asterisco?.split(':')[1]?.trim()}</span>
                                    <span className="hidden md:inline">{item.observacao_asterisco}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* MODAL ADICIONAR COMPETÊNCIA */}
            {isModalCompetenciaOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-6 md:p-8 relative border border-zinc-100 animate-in zoom-in-95 duration-200 my-auto">
                        <button
                            onClick={() => setIsModalCompetenciaOpen(false)}
                            className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 mb-4">
                            <Calendar className="text-blue-600" size={20} />
                            <h2 className="font-bold text-base">Adicionar Competência</h2>
                        </div>

                        <form onSubmit={handleAdicionarCompetenciaSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Mês e Ano (AAAA-MM)</label>
                                <input
                                    type="month"
                                    required
                                    value={novoAnoMesInput}
                                    onChange={(e) => setNovoAnoMesInput(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 text-xs font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                Adicionar e Selecionar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Rodapé Padronizado */}
            <div>
                {/* LINHA DIVISÓRIA "CONECTE-SE" PADRONIZADA */}
                <div className="mt-24 flex items-center gap-4 mb-12">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
                        Conecte-se
                    </h3>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* BLOCO INSTAGRAM CENTRALIZADO COM GRADIENTE E BRILHO */}
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