// app/condo/adm/registros-contas/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    CheckCircle2,
    Edit3,
    Loader2
} from "lucide-react";

export default function RegistrosContasPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadingContas, setLoadingContas] = useState(false);
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);

    // Histórico para Autocomplete de Detalhamento e Descrição
    const [historicoDescDet, setHistoricoDescDet] = useState<{ descricao: string, detalhamento: string }[]>([]);

    // Estados para Lançamentos de Prestação de Contas
    const [tipoConta, setTipoConta] = useState<'receita' | 'despesa'>('receita');
    const [categoriaConta, setCategoriaConta] = useState('Receita Condomínio');
    const [descricaoConta, setDescricaoConta] = useState('Pagamento Condomínio');
    const [detalhamentoConta, setDetalhamentoConta] = useState('');
    const [valorPrevistoConta, setValorPrevistoConta] = useState('0,00');
    const [valorRealizadoConta, setValorRealizadoConta] = useState('0,00');
    const [dataCompetenciaConta, setDataCompetenciaConta] = useState(new Date().toISOString().slice(0, 7) + '-01');

    const [contasError, setContasError] = useState('');
    const [contasSuccess, setContasSuccess] = useState('');

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

    const handleTipoContaChange = (novoTipo: 'receita' | 'despesa') => {
        setTipoConta(novoTipo);
        if (novoTipo === 'receita') {
            setCategoriaConta('Receita Condomínio');
            setDescricaoConta('Pagamento Condomínio');
        } else {
            setCategoriaConta('Despesa Condomínio');
            setDescricaoConta('Manutenção Geral');
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

            const { data: membroDataList, error: membroError } = await supabase
                .from("condominio_membros")
                .select("condominio_id, role, condominio_nome")
                .eq("user_id", userId);

            if (membroError && !membroError.message.includes("AbortError")) {
                console.error("Erro na consulta Supabase (membros):", membroError);
            }

            if (!membroDataList || membroDataList.length === 0) {
                if (isMountedRef.current) setLoading(false);
                return;
            }

            const vinculoAdm = membroDataList.find((m: any) => m.role === 'sindico') || membroDataList[0];

            if (!vinculoAdm || vinculoAdm.role !== 'sindico') {
                if (isMountedRef.current) setLoading(false);
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
                setCondominio({ id: vinculoAdm.condominio_id, nome: nomeCondominioOficial });

                const { data: histData } = await supabase
                    .from('condominio_contas')
                    .select('descricao, detalhamento')
                    .eq('condominio_id', vinculoAdm.condominio_id);

                if (histData) {
                    setHistoricoDescDet(histData.map((item: any) => ({
                        descricao: item.descricao || "",
                        detalhamento: item.detalhamento || ""
                    })));
                }
            }
        } catch (e: any) {
            console.warn("Exceção tratada em verifySindicoAndLoadData:", e);
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
                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError && !currentSession) throw sessionError;

                if (isMountedRef.current) {
                    await verifySindicoAndLoadData(currentSession);
                }
            } catch (err: any) {
                console.error("Erro ao recuperar sessão inicial:", err);
                if (isMountedRef.current) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!isMountedRef.current) return;
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                if (currentSession) await verifySindicoAndLoadData(currentSession);
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setCondominio(null);
                setLoading(false);
            }
        });
        authSub = subscription;

        return () => {
            isMountedRef.current = false;
            if (authSub) authSub.unsubscribe();
        };
    }, []);

    const handleSaveContas = async () => {
        if (!condominio) {
            setContasError("Condomínio não identificado. Atualize a página e tente novamente.");
            return;
        }

        if (!categoriaConta.trim() || !descricaoConta.trim() || !dataCompetenciaConta) {
            setContasError("Preencha os campos obrigatórios (Categoria, Descrição e Data).");
            return;
        }

        setLoadingContas(true);
        setContasError("");
        setContasSuccess("");

        try {
            const saveExecution = async () => {
                const { data: userData, error: userError } = await supabase.auth.getUser();

                let userId = userData?.user?.id;
                if (!userId && session?.user?.id) {
                    userId = session.user.id;
                }

                if (userError || !userId) {
                    throw new Error("Sessão expirada após alternar de aba. Atualize a página e faça login novamente.");
                }

                const previstoNum = converterParaFloat(valorPrevistoConta);
                const realizadoNum = converterParaFloat(valorRealizadoConta);

                const { error } = await supabase
                    .from("condominio_contas")
                    .insert([
                        {
                            condominio_id: condominio.id,
                            tipo: tipoConta,
                            categoria: categoriaConta.trim(),
                            descricao: descricaoConta.trim(),
                            detalhamento: detalhamentoConta.trim() || null,
                            valor_previsto: previstoNum,
                            valor_realizado: realizadoNum > 0 ? realizadoNum : previstoNum,
                            data_competencia: dataCompetenciaConta,
                            data_vencimento: null,
                            status: tipoConta === 'receita' ? 'recebido' : 'pago',
                            criado_por: userId
                        }
                    ]);

                if (error) throw error;
                return true;
            };

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Falha de conexão: O servidor demorou a responder após a retomada da aba. Atualize a página e tente novamente.")), 5000)
            );

            await Promise.race([saveExecution(), timeoutPromise]);

            if (isMountedRef.current) {
                setContasSuccess("Lançamento financeiro registrado com sucesso!");

                setHistoricoDescDet(prev => [...prev, {
                    descricao: descricaoConta.trim(),
                    detalhamento: detalhamentoConta.trim()
                }]);

                setValorPrevistoConta("0,00");
                setValorRealizadoConta("0,00");
                setDetalhamentoConta("");
                setTimeout(() => {
                    if (isMountedRef.current) setContasSuccess("");
                }, 2000);
            }
        } catch (err: any) {
            if (isMountedRef.current) {
                setContasError(err?.message || "Erro ao registrar lançamento financeiro. Tente novamente.");
            }
        } finally {
            if (isMountedRef.current) {
                setLoadingContas(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6 min-h-[300px]">
                <div className="animate-spin text-emerald-600">
                    <Loader2 size={32} />
                </div>
            </div>
        );
    }

    if (!session || !condominio) {
        return (
            <div className="flex items-center justify-center p-6 min-h-[300px] text-zinc-500 text-sm font-medium">
                Acesso restrito. Faça login como síndico para visualizar.
            </div>
        );
    }

    let sugestoesDescricao: string[] = [];
    let sugestoesDetalhamento: string[] = [];

    sugestoesDescricao = Array.from(
        new Set(
            historicoDescDet
                .map(item => item.descricao.trim())
                .filter(desc => desc !== "")
        )
    );

    sugestoesDetalhamento = Array.from(
        new Set(
            historicoDescDet
                .filter(item => item.descricao.trim().toLowerCase() === descricaoConta.trim().toLowerCase())
                .map(item => item.detalhamento.trim())
                .filter(det => det !== "")
        )
    );

    if (sugestoesDetalhamento.length === 0) {
        sugestoesDetalhamento = Array.from(
            new Set(
                historicoDescDet
                    .map(item => item.detalhamento.trim())
                    .filter(det => det !== "")
            )
        );
    }

    return (
        <div className="w-full bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm">
            <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => handleTipoContaChange('receita')}
                        className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${tipoConta === 'receita' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}
                    >
                        Receita
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTipoContaChange('despesa')}
                        className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${tipoConta === 'despesa' ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20' : 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}
                    >
                        Despesa
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Categoria</label>
                        <input
                            type="text"
                            required
                            value={categoriaConta}
                            onChange={(e) => setCategoriaConta(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Descrição</label>
                        <input
                            type="text"
                            list="sugestoes-descricao"
                            placeholder="Ex: Pagamento Condomínio"
                            required
                            value={descricaoConta}
                            onChange={(e) => setDescricaoConta(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900"
                        />
                        <datalist id="sugestoes-descricao">
                            {sugestoesDescricao.map((sugestao, idx) => (
                                <option key={idx} value={sugestao} />
                            ))}
                        </datalist>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Mês de Competência</label>
                        <input
                            type="date"
                            required
                            value={dataCompetenciaConta}
                            onChange={(e) => setDataCompetenciaConta(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Detalhamento</label>
                    <input
                        type="text"
                        list="sugestoes-detalhamento"
                        placeholder="Ex: Detalhes adicionais do lançamento..."
                        value={detalhamentoConta}
                        onChange={(e) => setDetalhamentoConta(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900"
                    />
                    <datalist id="sugestoes-detalhamento">
                        {sugestoesDetalhamento.map((sugestao, idx) => (
                            <option key={idx} value={sugestao} />
                        ))}
                    </datalist>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Planejado (R$)</label>
                        <input
                            type="text"
                            placeholder="0,00"
                            required
                            value={valorPrevistoConta}
                            onChange={(e) => setValorPrevistoConta(e.target.value)}
                            onBlur={(e) => setValorPrevistoConta(formatarValorExibicao(e.target.value))}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Realizado (R$)</label>
                        <input
                            type="text"
                            placeholder="0,00"
                            required
                            value={valorRealizadoConta}
                            onChange={(e) => setValorRealizadoConta(e.target.value)}
                            onBlur={(e) => setValorRealizadoConta(formatarValorExibicao(e.target.value))}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900"
                        />
                    </div>
                </div>

                {contasError && <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">{contasError}</p>}
                {contasSuccess && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2"><CheckCircle2 size={14} /> {contasSuccess}</p>}

                <div className="pt-2 flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={handleSaveContas}
                        disabled={loadingContas}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {loadingContas ? "Registrando..." : "Salvar Lançamento"}
                    </button>

                    <Link
                        href="/condo/adm/edicao_lancamentos"
                        target="_top"
                        className="w-full bg-zinc-900 hover:bg-black text-white py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-zinc-900/10 flex items-center justify-center gap-2 cursor-pointer text-center"
                    >
                        <Edit3 size={14} /> Editar lançamentos
                    </Link>
                </div>
            </div>
        </div>
    );
}