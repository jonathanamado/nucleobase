"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, FileSpreadsheet, Lock, Calendar, Users, CheckCircle2, UserCheck, DollarSign
} from "lucide-react";

export default function TaxaBasePage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadingTaxaBase, setLoadingTaxaBase] = useState(false);
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [isApenasMorador, setIsApenasMorador] = useState(false);

    const [competenciaSelecionada, setCompetenciaSelecionada] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const [valorTaxaBase, setValorTaxaBase] = useState('0,00');
    const [taxaBaseSuccess, setTaxaBaseSuccess] = useState('');

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

    // Funções auxiliares para formatação de mês e ano com primeira letra maiúscula
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

    const carregarDadosCompetencia = async (condoId: string, competencia: string) => {
        try {
            const dataCompetenciaCompleta = `${competencia}-01`;
            const { data: taxaBaseData } = await supabase
                .from("condominio_contas_taxa_base")
                .select("valor")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta)
                .maybeSingle();

            if (taxaBaseData) {
                setValorTaxaBase(formatarValorExibicao(taxaBaseData.valor));
            } else {
                setValorTaxaBase('0,00');
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

    const handleSalvarTaxaBase = async () => {
        if (!condominio || !session) return;
        setLoadingTaxaBase(true);
        setTaxaBaseSuccess("");

        try {
            const valorNum = converterParaFloat(valorTaxaBase);

            const payload = {
                condominio_id: condominio.id,
                data_competencia: `${competenciaSelecionada}-01`,
                valor: valorNum,
                atualizado_em: new Date().toISOString()
            };

            const { error } = await supabase
                .from("condominio_contas_taxa_base")
                .upsert([payload], { onConflict: 'condominio_id,data_competencia' });

            if (error) throw error;

            setTaxaBaseSuccess("Valor da Taxa Base gravado com sucesso!");
            await carregarDadosCompetencia(condominio.id, competenciaSelecionada);
            setTimeout(() => setTaxaBaseSuccess(""), 3000);
        } catch (err: any) {
            alert("Erro ao gravar taxa base: " + (err?.message || ""));
        } finally {
            setLoadingTaxaBase(false);
        }
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
                        <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-600/25"><DollarSign size={24} /></div>
                        <div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Prestação de Contas</span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5">Taxa Base (Assembleia)</h1>
                        </div>
                    </div>
                    <Link href="/condo/adm/prestacao_contas" className="hidden md:flex group items-center gap-1.5 bg-zinc-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black"><ArrowLeft size={12} /> Voltar</Link>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-zinc-900">
                            <span className="md:hidden">Taxa Base</span>
                            <span className="hidden md:inline">Configuração da Taxa Base</span>
                        </h2>
                        <p className="text-xs text-zinc-500">
                            <span className="md:hidden">Valor da taxa base para o período de {competenciaSelecionada}.</span>
                            <span className="hidden md:inline">Definição do valor da taxa base de assembleia para o período de {competenciaSelecionada}.</span>
                        </p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-3 rounded-2xl flex items-center gap-3 relative overflow-hidden">
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl"><Calendar size={18} /></div>
                        <div>
                            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">Mês Referência</label>
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

                <div className="w-full bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Valor da Taxa Base (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                                <input type="text" value={valorTaxaBase} onChange={(e) => setValorTaxaBase(e.target.value)} onBlur={(e) => setValorTaxaBase(formatarValorExibicao(e.target.value))} className="w-full pl-9 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:border-emerald-400 outline-none" />
                            </div>
                        </div>
                    </div>

                    {taxaBaseSuccess && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2"><CheckCircle2 size={14} /> {taxaBaseSuccess}</p>}
                    <button onClick={handleSalvarTaxaBase} disabled={loadingTaxaBase} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer">
                        {loadingTaxaBase ? "Gravando..." : "Gravar Taxa Base"}
                    </button>
                </div>
            </div>
        </div>
    );
}