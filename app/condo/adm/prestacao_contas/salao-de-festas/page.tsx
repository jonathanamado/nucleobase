"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, FileSpreadsheet, Lock, Calendar, PartyPopper, DollarSign, Trash2, PlusCircle, Instagram
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

    // Estados para Lançamento Avulso (Reserva Manual)
    const [novaReservaData, setNovaReservaData] = useState("");
    const [novaReservaUnidade, setNovaReservaUnidade] = useState("");
    const [novaReservaResponsavel, setNovaReservaResponsavel] = useState("");
    const [loadingNovaReserva, setLoadingNovaReserva] = useState(false);

    const isMountedRef = useRef(true);

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

    const handleAdicionarReservaManual = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!condominio || !session) return;
        if (!novaReservaData || !novaReservaUnidade || !novaReservaResponsavel) {
            alert("Preencha todos os campos.");
            return;
        }

        setLoadingNovaReserva(true);
        try {
            const { data: checkData } = await supabase
                .from("condominio_reservas")
                .select("id")
                .eq("condominio_id", condominio.id)
                .eq("data_reserva", novaReservaData)
                .eq("status", "ativa")
                .maybeSingle();

            if (checkData) {
                alert("Já existe uma reserva ativa para esta data. Verifique no calendário de reservas.");
                setLoadingNovaReserva(false);
                return;
            }

            const { error } = await supabase
                .from("condominio_reservas")
                .insert([
                    {
                        condominio_id: condominio.id,
                        user_id: session.user.id,
                        data_reserva: novaReservaData,
                        status: 'ativa',
                        responsavel_nome: novaReservaResponsavel,
                        unidade: novaReservaUnidade
                    }
                ]);

            if (error) throw error;

            alert("Lançamento avulso registrado com sucesso!");
            setNovaReservaData('');
            setNovaReservaUnidade('');
            setNovaReservaResponsavel('');
            await carregarDadosCompetencia(condominio.id, competenciaSelecionada);
        } catch (err: any) {
            alert("Erro ao registrar lançamento avulso: " + (err?.message || ""));
        } finally {
            setLoadingNovaReserva(false);
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
                        <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-600/25"><PartyPopper size={24} /></div>
                        <div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Prestação de Contas</span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5">Salão de Festas</h1>
                        </div>
                    </div>
                    <Link href="/condo/adm/prestacao_contas" className="hidden md:flex group items-center gap-1.5 bg-zinc-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"><ArrowLeft size={12} /> Voltar</Link>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-zinc-900">Locações e Agendamentos</h2>
                        <p className="text-xs text-zinc-500">
                            <span className="md:hidden">Geração de cobranças de locação em {competenciaSelecionada}</span>
                            <span className="hidden md:inline">Geração de cobranças de locação para o período de {competenciaSelecionada}</span>
                        </p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-3 rounded-2xl flex items-center gap-3 relative overflow-hidden">
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

                <div className="w-full bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">

                    {/* Painel de Lançamento Avulso (Síndico) */}
                    <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <PlusCircle size={18} className="text-emerald-600" />
                            <h3 className="font-bold text-sm text-zinc-900">Lançamento Avulso de Uso</h3>
                        </div>
                        <form onSubmit={handleAdicionarReservaManual} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Data do Uso</label>
                                <input type="date" required value={novaReservaData} onChange={(e) => setNovaReservaData(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-400" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Unidade</label>
                                <input type="text" placeholder="Ex: 101" required value={novaReservaUnidade} onChange={(e) => setNovaReservaUnidade(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-400" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Responsável solicitação</label>
                                <input type="text" placeholder="Nome do morador" required value={novaReservaResponsavel} onChange={(e) => setNovaReservaResponsavel(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-400" />
                            </div>
                            <button type="submit" disabled={loadingNovaReserva} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition disabled:opacity-50 h-[38px] flex items-center justify-center cursor-pointer">
                                {loadingNovaReserva ? "Salvando..." : "Adicionar Uso"}
                            </button>
                        </form>
                    </div>

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
                                                    <div><div>Apto {item.unidade}</div><div className="text-[10px] text-zinc-400 font-normal">{item.data_reserva.split('-').reverse().join('/')}</div></div>
                                                </td>
                                                <td className="p-3.5 text-xs font-medium text-zinc-700">{item.responsavel_nome}</td>
                                                <td className="p-3.5 text-xs font-bold text-zinc-700">R$ {item.taxa.toFixed(2).replace('.', ',')}</td>
                                                <td className="p-3.5 text-xs font-bold">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isAtivo ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : isCancelado ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}>{item.status_cobranca}</span>
                                                </td>
                                                <td className="p-3.5 pr-5 text-right space-x-2">
                                                    {(!isAtivo || isCancelado) && (
                                                        <button onClick={() => handleCobrarReserva(item.id, item.unidade, item.responsavel_nome, item.taxa, item.data_reserva)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all inline-flex items-center gap-1 cursor-pointer"><DollarSign size={13} /> Cobrar</button>
                                                    )}
                                                    {isAtivo && (
                                                        <button onClick={() => handleRemoveReservaSalao(item.id)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl transition-colors inline-flex cursor-pointer"><Trash2 size={15} /></button>
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

                {/* BLOCO CONECTE-SE ADICIONADO AQUI */}
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