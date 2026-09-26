"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, FileSpreadsheet, Lock, Calendar, PartyPopper, DollarSign, Trash2
} from "lucide-react";

interface SalaoUsoItem {
    id: string;
    unidade: string;
    taxa: number;
    responsavel_nome: string;
    data_reserva: string;
    status: string;
    status_cobranca?: string;
}

export default function SalaoFestasPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [isApenasMorador, setIsApenasMorador] = useState(false);

    const [competenciaSelecionada, setCompetenciaSelecionada] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const [salaoUsos, setSalaoUsos] = useState<SalaoUsoItem[]>([]);
    const isMountedRef = useRef(true);

    const carregarDadosCompetencia = async (condoId: string, competencia: string) => {
        try {
            const dataCompetenciaCompleta = `${competencia}-01`;
            const [anoSel, mesSel] = competencia.split('-').map(Number);
            const primeiroDia = `${competencia}-01`;
            const ultimoDiaObj = new Date(anoSel, mesSel, 0);
            const ultimoDia = `${competencia}-${String(ultimoDiaObj.getDate()).padStart(2, '0')}`;

            const { data: reservasData } = await supabase
                .from("condominio_reservas")
                .select("*")
                .eq("condominio_id", condoId)
                .gte("data_reserva", primeiroDia)
                .lte("data_reserva", ultimoDia)
                .eq("status", "ativa");

            const { data: cobrancasData } = await supabase
                .from("condominio_reservas_cobrancas")
                .select("*")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta);

            const cobrancasMap = new Map((cobrancasData || []).map((c: any) => [c.reserva_id, c]));

            const usosMapeados: SalaoUsoItem[] = (reservasData || []).map((r: any) => {
                const cobrancaReg = cobrancasMap.get(r.id);
                const statusCob = cobrancaReg ? cobrancaReg.status : null;
                let statusExibicao = 'Pendente';
                if (statusCob === 'cobrado') statusExibicao = 'Cobrança ativa';
                else if (statusCob === 'cancelado' || statusCob === 'excluido') statusExibicao = 'Cobrança cancelada';

                return {
                    id: r.id, unidade: r.unidade || 'N/I', taxa: 100.00,
                    responsavel_nome: r.responsavel_nome || 'Morador',
                    data_reserva: r.data_reserva, status: r.status, status_cobranca: statusExibicao
                };
            });
            setSalaoUsos(usosMapeados);
        } catch (err) {
            console.error("Erro em carregarDadosCompetencia:", err);
        }
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

    const handleCobrarReserva = async (reservaId: string, unidade: string, responsavel: string, taxa: number, dataReserva: string) => {
        if (!condominio || !session) return;
        if (!confirm(`Deseja registrar a cobrança (R$ ${taxa.toFixed(2).replace('.', ',')}) para a unidade ${unidade}?`)) return;

        try {
            await supabase.from("condominio_reservas_cobrancas").upsert([{
                condominio_id: condominio.id, reserva_id: reservaId, unidade, responsavel_nome: responsavel,
                taxa, data_reserva: dataReserva, data_competencia: `${competenciaSelecionada}-01`,
                status: 'cobrado', criado_por: session.user.id, atualizado_em: new Date().toISOString()
            }], { onConflict: 'reserva_id' });

            alert(`Cobrança gerada com sucesso!`);
            await carregarDadosCompetencia(condominio.id, competenciaSelecionada);
        } catch (err: any) { alert("Erro ao gerar cobrança."); }
    };

    const handleRemoveReservaSalao = async (reservaId: string) => {
        if (!condominio || !session) return;
        if (!confirm("Deseja cancelar o lançamento deste agendamento?")) return;
        try {
            await supabase.from("condominio_reservas_cobrancas").update({ status: 'cancelado', atualizado_em: new Date().toISOString() }).eq('reserva_id', reservaId);
            await carregarDadosCompetencia(condominio.id, competenciaSelecionada);
            alert("Lançamento atualizado para cancelado!");
        } catch (err: any) { alert("Erro ao cancelar cobrança."); }
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
                        <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-600/25"><PartyPopper size={24} /></div>
                        <div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Prestação de Contas</span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5">Salão de Festas</h1>
                        </div>
                    </div>
                    <Link href="/condo/adm/prestacao_contas" className="group flex items-center gap-1.5 bg-zinc-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black"><ArrowLeft size={12} /> Voltar</Link>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-zinc-900">Locações e Agendamentos</h2>
                        <p className="text-xs text-zinc-500">Geração de cobranças de locação para o período de {competenciaSelecionada}.</p>
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
                    <div className="overflow-x-auto border border-zinc-100 rounded-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                    <th className="p-3.5 pl-5">Data / Unidade</th>
                                    <th className="p-3.5">Responsável</th>
                                    <th className="p-3.5">Taxa de Locação</th>
                                    <th className="p-3.5">Status Cobrança</th>
                                    <th className="p-3.5 pr-5 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {salaoUsos.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-xs text-zinc-400">Nenhum agendamento encontrado para este mês.</td></tr>
                                ) : (
                                    salaoUsos.map((item) => {
                                        const isAtivo = item.status_cobranca === 'Cobrança ativa';
                                        const isCancelado = item.status_cobranca === 'Cobrança cancelada';
                                        return (
                                            <tr key={item.id} className="hover:bg-zinc-50/50">
                                                <td className="p-3.5 pl-5 text-xs font-bold text-zinc-800 flex items-center gap-2">
                                                    <PartyPopper size={16} className="text-purple-600" />
                                                    <div><div>Apto {item.unidade}</div><div className="text-[10px] text-zinc-400 font-normal">{item.data_reserva}</div></div>
                                                </td>
                                                <td className="p-3.5 text-xs font-medium text-zinc-700">{item.responsavel_nome}</td>
                                                <td className="p-3.5 text-xs font-bold text-zinc-700">R$ {item.taxa.toFixed(2).replace('.', ',')}</td>
                                                <td className="p-3.5 text-xs font-bold">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isAtivo ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : isCancelado ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}>{item.status_cobranca}</span>
                                                </td>
                                                <td className="p-3.5 pr-5 text-right space-x-2">
                                                    {(!isAtivo || isCancelado) && (
                                                        <button onClick={() => handleCobrarReserva(item.id, item.unidade, item.responsavel_nome, item.taxa, item.data_reserva)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all inline-flex items-center gap-1"><DollarSign size={13} /> Cobrar</button>
                                                    )}
                                                    {isAtivo && (
                                                        <button onClick={() => handleRemoveReservaSalao(item.id)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl transition-colors inline-flex"><Trash2 size={15} /></button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}