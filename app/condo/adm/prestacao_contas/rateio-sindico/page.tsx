"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, FileSpreadsheet, Lock, Calendar, Users, CheckCircle2, UserCheck
} from "lucide-react";

export default function RateioSindicoPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadingRateioSindico, setLoadingRateioSindico] = useState(false);
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [isApenasMorador, setIsApenasMorador] = useState(false);

    const [competenciaSelecionada, setCompetenciaSelecionada] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const [valorRateioSindico, setValorRateioSindico] = useState('0,00');
    const [qtdAptosRateioSindico, setQtdAptosRateioSindico] = useState('');
    const [rateioSindicoSuccess, setRateioSindicoSuccess] = useState('');

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
        if (limpo.includes('.') && limpo.includes(',')) limpo = limpo.replace(/\./g, '').replace(',', '.');
        else if (limpo.includes(',')) limpo = limpo.replace(',', '.');
        else if ((limpo.match(/\./g) || []).length > 1) limpo = limpo.replace(/\./g, '');
        const num = parseFloat(limpo);
        return isNaN(num) ? 0 : num;
    };

    const carregarDadosCompetencia = async (condoId: string, competencia: string) => {
        try {
            const dataCompetenciaCompleta = `${competencia}-01`;
            const { data: sindicoPagamentoData } = await supabase
                .from("condominio_pagamento_sindico")
                .select("valor, quantidade_apartamentos")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta)
                .maybeSingle();

            if (sindicoPagamentoData) {
                setValorRateioSindico(formatarValorExibicao(sindicoPagamentoData.valor));
                setQtdAptosRateioSindico(sindicoPagamentoData.quantidade_apartamentos ? String(sindicoPagamentoData.quantidade_apartamentos) : '');
            } else {
                setValorRateioSindico('0,00');
                setQtdAptosRateioSindico('');
            }
        } catch (err) { console.error("Erro:", err); }
    };

    const verifySindicoAndLoadData = async (currentSession: any) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) { setSession(null); setCondominio(null); setIsApenasMorador(false); setLoading(false); }
                return;
            }
            if (isMountedRef.current) setSession(currentSession);

            const { data: membroDataList } = await supabase.from("condominio_membros").select("condominio_id, role").eq("user_id", currentSession.user.id);
            const vinculoAdm = membroDataList?.find((m: any) => m.role === 'sindico') || membroDataList?.[0];

            if (!vinculoAdm || vinculoAdm.role !== 'sindico') {
                if (isMountedRef.current) { setIsApenasMorador(true); setLoading(false); }
                return;
            }

            if (isMountedRef.current) {
                setIsApenasMorador(false);
                setCondominio({ id: vinculoAdm.condominio_id, nome: "Condomínio" });
                await carregarDadosCompetencia(vinculoAdm.condominio_id, competenciaSelecionada);
            }
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        supabase.auth.getSession().then(({ data: { session: curSession } }) => {
            if (isMountedRef.current && curSession) verifySindicoAndLoadData(curSession);
            else if (isMountedRef.current) setLoading(false);
        });
        return () => { isMountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (condominio && condominio.id) carregarDadosCompetencia(condominio.id, competenciaSelecionada);
    }, [competenciaSelecionada]);

    const handleSalvarRateioSindico = async () => {
        if (!condominio || !session) return;
        setLoadingRateioSindico(true);
        setRateioSindicoSuccess("");

        try {
            const valorNum = converterParaFloat(valorRateioSindico);
            const qtdNum = parseInt(qtdAptosRateioSindico) || 0;

            if (valorNum <= 0 || qtdNum <= 0) {
                alert("Informe um valor e a quantidade de apartamentos válidos.");
                setLoadingRateioSindico(false);
                return;
            }

            const payload = {
                condominio_id: condominio.id, data_competencia: `${competenciaSelecionada}-01`,
                valor: valorNum, quantidade_apartamentos: qtdNum, criado_por: session.user.id, atualizado_em: new Date().toISOString()
            };

            await supabase.from("condominio_pagamento_sindico").upsert([payload], { onConflict: 'condominio_id,data_competencia' });
            setRateioSindicoSuccess("Rateio do Síndico salvo com sucesso!");
            await carregarDadosCompetencia(condominio.id, competenciaSelecionada);
            setTimeout(() => setRateioSindicoSuccess(""), 3000);
        } catch (err: any) { alert("Erro ao salvar rateio do síndico."); }
        finally { setLoadingRateioSindico(false); }
    };

    if (loading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6"><div className="animate-spin text-emerald-600"><FileSpreadsheet size={32} /></div></div>;
    if (!session || isApenasMorador) return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6"><div className="w-full max-w-md bg-white border border-zinc-200 p-8 rounded-[2.5rem] shadow-sm text-center"><Lock className="mx-auto mb-4 text-emerald-600" size={32} /><h1 className="text-xl font-black mb-2">Área Restrita</h1><Link href="/condo/adm/prestacao_contas" className="bg-zinc-900 text-white py-3 px-6 rounded-xl text-xs font-bold w-full inline-block mt-4">Voltar</Link></div></div>
    );

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-4 md:p-10 flex flex-col justify-between">
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-600/25"><UserCheck size={24} /></div>
                        <div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Prestação de Contas</span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5">Rateio Síndico</h1>
                        </div>
                    </div>
                    <Link href="/condo/adm/prestacao_contas" className="group flex items-center gap-1.5 bg-zinc-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black"><ArrowLeft size={12} /> Voltar</Link>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-zinc-900">Configuração de Rateio</h2>
                        <p className="text-xs text-zinc-500">Custo de isenção da Taxa Base do Síndico para o período de {competenciaSelecionada}.</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-3 rounded-2xl flex items-center gap-3">
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl"><Calendar size={18} /></div>
                        <div>
                            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">Mês Referência</label>
                            <input type="month" value={competenciaSelecionada} onChange={(e) => setCompetenciaSelecionada(e.target.value)} className="text-xs font-bold outline-none cursor-pointer mt-0.5" />
                        </div>
                    </div>
                </div>

                <div className="w-full bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Valor do Rateio (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                                <input type="text" value={valorRateioSindico} onChange={(e) => setValorRateioSindico(e.target.value)} onBlur={(e) => setValorRateioSindico(formatarValorExibicao(e.target.value))} className="w-full pl-9 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:border-emerald-400 outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Qtd. de apartamentos</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><Users size={16} /></span>
                                <input type="number" value={qtdAptosRateioSindico} onChange={(e) => setQtdAptosRateioSindico(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:border-emerald-400 outline-none" />
                            </div>
                        </div>
                    </div>

                    {rateioSindicoSuccess && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2"><CheckCircle2 size={14} /> {rateioSindicoSuccess}</p>}
                    <button onClick={handleSalvarRateioSindico} disabled={loadingRateioSindico} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer">
                        {loadingRateioSindico ? "Salvando..." : "Salvar Lançamento"}
                    </button>
                </div>
            </div>
        </div>
    );
}