// app/condo/adm/prestacao_contas/fundo-de-reservas/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    CheckCircle2, ArrowLeft, FileSpreadsheet, Lock, Key, AtSign, Eye, EyeOff,
    LifeBuoy, Mail, X, KeyRound, UserCheck, ArrowRight, Wallet, Calendar, Instagram,
    TrendingUp, TrendingDown, Landmark, Gavel, User
} from "lucide-react";

interface UnidadeEnriquecida {
    unidade: string;
    nomes: string[];
}

export default function FundoReservasPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [loadingFundo, setLoadingFundo] = useState(false);

    // Auth states
    const [emailOrSlug, setEmailOrSlug] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [isApenasMorador, setIsApenasMorador] = useState(false);

    const [competenciaSelecionada, setCompetenciaSelecionada] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const [unidadesCondominio, setUnidadesCondominio] = useState<UnidadeEnriquecida[]>([]);
    const [valorFundoReserva, setValorFundoReserva] = useState('0,00');
    const [fundoReservaSuccess, setFundoReservaSuccess] = useState('');

    // Novos estados do Visor e Contexto
    const [totalArrecadado, setTotalArrecadado] = useState<number>(0);
    const [totalUtilizado, setTotalUtilizado] = useState<number>(0);
    const [dataAssembleia, setDataAssembleia] = useState("10/05/2026"); // Mantido no estado para uso futuro

    const isMountedRef = useRef(true);

    const formatarValorExibicao = (valor: any): string => {
        if (valor === null || valor === undefined || valor === '') return '0,00';
        const num = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(',', '.'));
        if (isNaN(num)) return '0,00';
        return num.toFixed(2).replace('.', ',');
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

    const carregarSaldos = async (condoId: string) => {
        try {
            // Busca arrecadação total
            const { data: arrecadadoData } = await supabase
                .from("condominio_contas_fundo_de_reservas")
                .select("valor")
                .eq("condominio_id", condoId);

            let sumArrecadado = 0;
            if (arrecadadoData) {
                sumArrecadado = arrecadadoData.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
            }

            // Busca utilização total (despesas)
            const { data: utilizadoData } = await supabase
                .from("condominio_despesas_fundo")
                .select("valor")
                .eq("condominio_id", condoId);

            let sumUtilizado = 0;
            if (utilizadoData) {
                sumUtilizado = utilizadoData.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
            }

            if (isMountedRef.current) {
                setTotalArrecadado(sumArrecadado);
                setTotalUtilizado(sumUtilizado);
            }
        } catch (err) {
            console.error("Erro ao carregar saldos consolidados:", err);
        }
    };

    const carregarDadosCompetencia = async (condoId: string, competencia: string) => {
        try {
            const dataCompetenciaCompleta = `${competencia}-01`;

            // Busca unidades e o nome do morador responsável via join, incluindo acesso_app
            const { data: membrosData } = await supabase
                .from("condominio_membros")
                .select(`
                    unidade,
                    acesso_app,
                    profile:profiles(nome_completo)
                `)
                .eq("condominio_id", condoId);

            // Filtra e deduplica unidades agrupando os nomes dos ativos
            const mapUnidades = new Map<string, UnidadeEnriquecida>();
            (membrosData || []).forEach((m: any) => {
                const uni = m.unidade?.trim();
                if (!uni || uni.toLowerCase() === 'adm') return;

                // Garante que a unidade exista no mapa
                if (!mapUnidades.has(uni)) {
                    mapUnidades.set(uni, {
                        unidade: uni,
                        nomes: []
                    });
                }

                // Se o usuário está ativo (diferente de estritamente false), adiciona à lista
                if (m.acesso_app !== false) {
                    const nome = m.profile?.nome_completo || "Não informado";
                    const existing = mapUnidades.get(uni)!;

                    if (!existing.nomes.includes(nome)) {
                        existing.nomes.push(nome);
                    }
                }
            });

            // Ordena alfabeticamente os moradores de cada unidade
            mapUnidades.forEach((unidadeInfo) => {
                unidadeInfo.nomes.sort((a, b) => a.localeCompare(b, 'pt-BR'));
            });

            // Ordena numericamente pelas unidades
            const unicas = Array.from(mapUnidades.values()).sort((a, b) => {
                const numA = parseInt(a.unidade.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.unidade.replace(/\D/g, '')) || 0;
                return numA - numB;
            });

            setUnidadesCondominio(unicas);

            // Carrega valor do fundo para a competência selecionada
            const { data: fundoData } = await supabase
                .from("condominio_contas_fundo_de_reservas")
                .select("valor")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta)
                .limit(1);

            if (fundoData && fundoData.length > 0) {
                setValorFundoReserva(formatarValorExibicao(fundoData[0].valor));
            } else {
                const { data: ultimoFundo } = await supabase
                    .from("condominio_contas_fundo_de_reservas")
                    .select("valor")
                    .eq("condominio_id", condoId)
                    .lte("data_competencia", dataCompetenciaCompleta)
                    .order("data_competencia", { ascending: false })
                    .limit(1);

                if (ultimoFundo && ultimoFundo.length > 0) {
                    setValorFundoReserva(formatarValorExibicao(ultimoFundo[0].valor));
                } else {
                    setValorFundoReserva('0,00');
                }
            }

            // Atualiza os saldos consolidados do Visor
            await carregarSaldos(condoId);

        } catch (err) {
            console.error("Erro em carregarDadosCompetencia:", err);
        }
    };

    const verifySindicoAndLoadData = async (currentSession: any) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setCondominio(null);
                    setIsApenasMorador(false);
                    setLoading(false);
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
                if (isMountedRef.current) { setIsApenasMorador(true); setLoading(false); }
                return;
            }

            const vinculoAdm = membroDataList.find((m: any) => m.role === 'sindico') || membroDataList[0];

            if (!vinculoAdm || vinculoAdm.role !== 'sindico') {
                if (isMountedRef.current) { setIsApenasMorador(true); setLoading(false); }
                return;
            }

            let nomeCondominioOficial = vinculoAdm.condominio_nome || "Condomínio";
            if (vinculoAdm.condominio_id) {
                const { data: condoDataReal } = await supabase
                    .from("condominios")
                    .select("nome")
                    .eq("id", vinculoAdm.condominio_id)
                    .maybeSingle();
                if (condoDataReal && condoDataReal.nome) nomeCondominioOficial = condoDataReal.nome;
            }

            if (isMountedRef.current) {
                setIsApenasMorador(false);
                setCondominio({ id: vinculoAdm.condominio_id, nome: nomeCondominioOficial });
                await carregarDadosCompetencia(vinculoAdm.condominio_id, competenciaSelecionada);
            }
        } catch (e: any) {
            if (isMountedRef.current) setCondominio(null);
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        let authSub: any = null;

        const initAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                if (isMountedRef.current && currentSession) await verifySindicoAndLoadData(currentSession);
                else if (isMountedRef.current) setLoading(false);
            } catch (err) {
                if (isMountedRef.current) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!isMountedRef.current) return;
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                if (currentSession) await verifySindicoAndLoadData(currentSession);
            } else if (event === 'SIGNED_OUT') {
                setSession(null); setCondominio(null); setIsApenasMorador(false); setLoading(false);
            }
        });
        authSub = subscription;

        return () => {
            isMountedRef.current = false;
            if (authSub) authSub.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (condominio && condominio.id) {
            carregarDadosCompetencia(condominio.id, competenciaSelecionada);
        }
    }, [competenciaSelecionada]);

    const handleSalvarFundoReserva = async () => {
        if (!condominio || !session) return;
        setLoadingFundo(true);
        setFundoReservaSuccess("");

        try {
            const dataCompetenciaCompleta = `${competenciaSelecionada}-01`;
            const valorFundoNum = converterParaFloat(valorFundoReserva);

            for (const item of unidadesCondominio) {
                const { data: fundoExistente } = await supabase
                    .from("condominio_contas_fundo_de_reservas")
                    .select("id")
                    .eq("condominio_id", condominio.id)
                    .eq("unidade", item.unidade)
                    .eq("data_competencia", dataCompetenciaCompleta)
                    .maybeSingle();

                if (fundoExistente) {
                    await supabase
                        .from("condominio_contas_fundo_de_reservas")
                        .update({ valor: valorFundoNum, atualizado_em: new Date().toISOString() })
                        .eq("id", fundoExistente.id);
                } else {
                    await supabase
                        .from("condominio_contas_fundo_de_reservas")
                        .insert([{
                            condominio_id: condominio.id, unidade: item.unidade, valor: valorFundoNum,
                            data_competencia: dataCompetenciaCompleta, criado_por: session.user.id,
                            atualizado_em: new Date().toISOString()
                        }]);
                }
            }
            setFundoReservaSuccess("Fundo de reservas salvo com sucesso para todas as unidades!");
            await carregarDadosCompetencia(condominio.id, competenciaSelecionada);
            setTimeout(() => setFundoReservaSuccess(""), 3000);
        } catch (err: any) {
            alert("Erro ao salvar fundo de reservas.");
        } finally {
            setLoadingFundo(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6"><div className="animate-spin text-emerald-600"><FileSpreadsheet size={32} /></div></div>;

    if (!session || isApenasMorador) return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white border border-zinc-200 p-8 rounded-[2.5rem] shadow-sm text-center">
                <Lock className="mx-auto mb-4 text-emerald-600" size={32} />
                <h1 className="text-xl font-black mb-2">{!session ? "Acesso Necessário" : "Área Restrita"}</h1>
                <p className="text-xs text-zinc-500 mb-6">{!session ? "Faça login para acessar esta página." : "Página destinada apenas a síndicos."}</p>
                <Link href="/condo/adm/prestacao_contas" className="bg-zinc-900 text-white py-3 px-6 rounded-xl text-xs font-bold w-full inline-block">Voltar</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-4 md:p-10 flex flex-col justify-between">
            <div className="space-y-8">
                {/* Cabeçalho */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-600/25">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Prestação de Contas</span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5">Fundo de Reservas</h1>
                        </div>
                    </div>
                    <Link href="/condo/adm/prestacao_contas" className="hidden md:flex group items-center gap-1.5 bg-zinc-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                        <ArrowLeft size={12} /> Voltar
                    </Link>
                </div>

                {/* Arrecadação Mensal + Botões (Valor Aplicável Desktop e Calendário) aproximado da linha divisória usando margem negativa */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 -mt-4 md:-mt-6">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-zinc-900">Arrecadação Mensal</h2>
                        <p className="text-xs text-zinc-500">
                            <span className="md:hidden">Controle de taxas aplicáveis em {competenciaSelecionada}</span>
                            <span className="hidden md:inline">Controle e aplicação da taxa de fundo de reservas por unidade para o período de {competenciaSelecionada}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">

                        {/* Botão de Valor Aplicável (APENAS DESKTOP) */}
                        <div className="hidden md:flex bg-white border border-zinc-200 p-3 rounded-2xl items-center gap-3 shadow-sm">
                            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl"><Wallet size={18} /></div>
                            <div>
                                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">Valor Aplicável</label>
                                <div className="flex items-center mt-0.5">
                                    <span className="text-xs font-bold text-zinc-900 mr-1">R$</span>
                                    <input
                                        type="text"
                                        value={valorFundoReserva}
                                        onChange={(e) => setValorFundoReserva(e.target.value)}
                                        onBlur={(e) => setValorFundoReserva(formatarValorExibicao(e.target.value))}
                                        className="w-20 bg-transparent text-xs font-bold text-zinc-900 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botão do Calendário */}
                        <div className="bg-white border border-zinc-200 p-3 rounded-2xl flex items-center gap-3 relative overflow-hidden shadow-sm w-full md:w-auto">
                            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl"><Calendar size={18} /></div>
                            <div>
                                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">Mês / Ano de referência</label>
                                <span className="text-xs font-bold text-zinc-900 hidden md:block pointer-events-none mt-0.5">
                                    {formatMesAnoDesktop(competenciaSelecionada)}
                                </span>
                                <span className="text-xs font-bold text-zinc-900 block md:hidden pointer-events-none mt-0.5">
                                    {formatMesAnoMobile(competenciaSelecionada)}
                                </span>
                                <input
                                    type="month"
                                    value={competenciaSelecionada}
                                    onChange={(e) => setCompetenciaSelecionada(e.target.value)}
                                    onClick={(e) => {
                                        try {
                                            (e.target as HTMLInputElement).showPicker?.();
                                        } catch (err) { }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visor de Saldos Minimalista e Responsivo */}
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div className="bg-white border border-zinc-200 p-2 md:p-5 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center gap-1 md:gap-4 shadow-sm text-center md:text-left">
                        <div className="bg-emerald-50 text-emerald-600 p-1.5 md:p-3 rounded-lg md:rounded-xl"><TrendingUp className="w-4 h-4 md:w-5 md:h-5" /></div>
                        <div>
                            <p className="text-[8px] md:text-[10px] font-black uppercase md:tracking-widest text-zinc-500 leading-tight mb-0.5 md:mb-0">
                                <span className="md:hidden">Arrecadado</span>
                                <span className="hidden md:inline">Total Arrecadado</span>
                            </p>
                            <p className="text-[10px] md:text-lg font-black text-zinc-900 tracking-tighter md:tracking-normal">R$ {totalArrecadado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 p-2 md:p-5 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center gap-1 md:gap-4 shadow-sm text-center md:text-left">
                        <div className="bg-red-50 text-red-600 p-1.5 md:p-3 rounded-lg md:rounded-xl"><TrendingDown className="w-4 h-4 md:w-5 md:h-5" /></div>
                        <div>
                            <p className="text-[8px] md:text-[10px] font-black uppercase md:tracking-widest text-zinc-500 leading-tight mb-0.5 md:mb-0">
                                <span className="md:hidden">Utilizado</span>
                                <span className="hidden md:inline">Total Utilizado (Obras)</span>
                            </p>
                            <p className="text-[10px] md:text-lg font-black text-zinc-900 tracking-tighter md:tracking-normal">R$ {totalUtilizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 p-2 md:p-5 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center gap-1 md:gap-4 shadow-sm text-center md:text-left">
                        <div className="bg-zinc-100 text-zinc-600 p-1.5 md:p-3 rounded-lg md:rounded-xl"><Landmark className="w-4 h-4 md:w-5 md:h-5" /></div>
                        <div>
                            <p className="text-[8px] md:text-[10px] font-black uppercase md:tracking-widest text-zinc-500 leading-tight mb-0.5 md:mb-0">
                                <span className="md:hidden">Saldo</span>
                                <span className="hidden md:inline">Saldo Atual Disponível</span>
                            </p>
                            <p className="text-[10px] md:text-lg font-black text-zinc-900 tracking-tighter md:tracking-normal">R$ {(totalArrecadado - totalUtilizado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>

                {/* Bloco da Tabela e Valores */}
                <div className="bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">

                    {/* Botão de Valor Aplicável (APENAS MOBILE) */}
                    <div className="flex md:hidden bg-emerald-50/60 border border-emerald-200/70 p-4 rounded-2xl flex-col items-start gap-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-600 text-white p-2.5 rounded-xl"><Wallet size={20} /></div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900">Valor Aplicável ({competenciaSelecionada})</h3>
                                <p className="text-[10px] text-emerald-700">Ajustável para todos deste mês.</p>
                            </div>
                        </div>
                        <div className="w-full relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                            <input
                                type="text"
                                value={valorFundoReserva}
                                onChange={(e) => setValorFundoReserva(e.target.value)}
                                onBlur={(e) => setValorFundoReserva(formatarValorExibicao(e.target.value))}
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-zinc-100 rounded-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                    <th className="p-4 pl-5">Mês / Ano</th>
                                    <th className="p-4">Unidade</th>
                                    <th className="p-4">Responsável</th>
                                    <th className="p-4">Status de Cobrança</th>
                                    <th className="p-4 pr-5 text-right">Valor Definido</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {unidadesCondominio.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-xs text-zinc-400">Nenhuma unidade encontrada.</td></tr>
                                ) : (
                                    unidadesCondominio.map((item) => {
                                        const valorNumerico = converterParaFloat(valorFundoReserva);
                                        return (
                                            <tr key={item.unidade} className="hover:bg-zinc-50/50 transition-colors">
                                                <td className="p-4 pl-5 text-xs font-bold text-emerald-600 align-top pt-5">{competenciaSelecionada}</td>
                                                <td className="p-4 text-xs font-black text-zinc-900 align-top pt-5">Apto {item.unidade}</td>
                                                <td className="p-4 text-xs font-medium text-zinc-500 align-top pt-4">
                                                    {item.nomes.length > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-zinc-100 p-1 rounded-full shrink-0">
                                                                <User size={12} className="text-zinc-400" />
                                                            </div>
                                                            <span className="leading-snug">{item.nomes.join(", ")}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-zinc-400 italic inline-block mt-1">Nenhum responsável ativo</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-xs font-medium text-emerald-600 align-top pt-5"><span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Aplicável</span></td>
                                                <td className="p-4 pr-5 text-right text-xs font-black text-zinc-900 align-top pt-5">R$ {valorNumerico.toFixed(2).replace('.', ',')}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {fundoReservaSuccess && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-4 rounded-xl flex items-center gap-2 border border-emerald-100"><CheckCircle2 size={16} /> {fundoReservaSuccess}</p>}
                    <button onClick={handleSalvarFundoReserva} disabled={loadingFundo} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:shadow-emerald-600/20 active:scale-[0.99]">
                        {loadingFundo ? "Salvando Alterações..." : "Salvar Fundo de Reservas Mensal"}
                    </button>
                </div>

                {/* BLOCO CONECTE-SE ADICIONADO ABAIXO DO CONTEÚDO PRINCIPAL */}
                <div>
                    <div className="mt-24 flex items-center gap-4 mb-12">
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
        </div>
    );
}