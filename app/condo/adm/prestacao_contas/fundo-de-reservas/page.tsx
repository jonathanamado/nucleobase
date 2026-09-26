"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    CheckCircle2, ArrowLeft, FileSpreadsheet, Lock, Key, AtSign, Eye, EyeOff,
    LifeBuoy, Mail, X, KeyRound, UserCheck, ArrowRight, Wallet, Calendar
} from "lucide-react";

export default function FundoReservasPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [loadingFundo, setLoadingFundo] = useState(false);

    // Auth states
    const [emailOrSlug, setEmailOrSlug] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const [showFirstAccessModal, setShowFirstAccessModal] = useState(false);
    const [firstAccessSlug, setFirstAccessSlug] = useState("");
    const [firstAccessLoading, setFirstAccessLoading] = useState(false);

    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [isApenasMorador, setIsApenasMorador] = useState(false);

    const [competenciaSelecionada, setCompetenciaSelecionada] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const [unidadesCondominio, setUnidadesCondominio] = useState<string[]>([]);
    const [valorFundoReserva, setValorFundoReserva] = useState('0,00');
    const [fundoReservaSuccess, setFundoReservaSuccess] = useState('');

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

    const carregarDadosCompetencia = async (condoId: string, competencia: string) => {
        try {
            const dataCompetenciaCompleta = `${competencia}-01`;

            const { data: membrosData } = await supabase
                .from("condominio_membros")
                .select("unidade")
                .eq("condominio_id", condoId);

            const unicas = Array.from(new Set((membrosData || []).map((m: any) => m.unidade?.trim()).filter(Boolean))).sort();
            setUnidadesCondominio(unicas);

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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setLoginError("");

        const inputAcesso = emailOrSlug.trim().toLowerCase();
        try {
            let emailParaLogin = inputAcesso;
            if (!inputAcesso.includes("@")) {
                const { data: profile } = await supabase.from('profiles').select('email_contato').eq('slug', inputAcesso).maybeSingle();
                if (!profile || !profile.email_contato) {
                    setLoginError("ID de Síndico ou E-mail não localizado.");
                    setAuthLoading(false);
                    return;
                }
                emailParaLogin = profile.email_contato;
            }

            const { data, error } = await supabase.auth.signInWithPassword({ email: emailParaLogin, password });
            if (error || !data.session) {
                setLoginError("Acesso negado. Credenciais incorretas.");
                setAuthLoading(false);
                return;
            }
            if (data.session) await verifySindicoAndLoadData(data.session);
        } catch (err) {
            setLoginError("Ocorreu um erro inesperado ao entrar.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSalvarFundoReserva = async () => {
        if (!condominio || !session) return;
        setLoadingFundo(true);
        setFundoReservaSuccess("");

        try {
            const dataCompetenciaCompleta = `${competenciaSelecionada}-01`;
            const valorFundoNum = converterParaFloat(valorFundoReserva);
            const unidadesFiltradas = unidadesCondominio.filter(u => u.toLowerCase() !== 'adm');

            for (const unidade of unidadesFiltradas) {
                const { data: fundoExistente } = await supabase
                    .from("condominio_contas_fundo_de_reservas")
                    .select("id")
                    .eq("condominio_id", condominio.id)
                    .eq("unidade", unidade)
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
                            condominio_id: condominio.id, unidade, valor: valorFundoNum,
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

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        setSession(null); setCondominio(null); setIsApenasMorador(false); setLoading(false);
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
                    <Link href="/condo/adm/prestacao_contas" className="group flex items-center gap-1.5 bg-zinc-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                        <ArrowLeft size={12} /> Voltar
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-zinc-900">Gestão do Fundo</h2>
                        <p className="text-xs text-zinc-500">Controle e aplicação da taxa de fundo de reservas para o período de {competenciaSelecionada}.</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-3 rounded-2xl flex items-center gap-3">
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl"><Calendar size={18} /></div>
                        <div>
                            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">Mês Referência</label>
                            <input type="month" value={competenciaSelecionada} onChange={(e) => setCompetenciaSelecionada(e.target.value)} className="text-xs font-bold outline-none cursor-pointer mt-0.5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="bg-emerald-50/60 border border-emerald-200/70 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-600 text-white p-2.5 rounded-xl"><Wallet size={20} /></div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900">Valor Aplicável ({competenciaSelecionada})</h3>
                                <p className="text-xs text-emerald-700">Ajustável para este mês.</p>
                            </div>
                        </div>
                        <div className="w-full sm:w-48 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                            <input type="text" value={valorFundoReserva} onChange={(e) => setValorFundoReserva(e.target.value)} onBlur={(e) => setValorFundoReserva(formatarValorExibicao(e.target.value))} className="w-full pl-9 pr-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-400" />
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-zinc-100 rounded-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                    <th className="p-3.5 pl-5">Mês / Ano</th>
                                    <th className="p-3.5">Unidade</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5 pr-5 text-right">Valor Definido</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {unidadesCondominio.filter(u => u.toLowerCase() !== 'adm').length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-8 text-xs text-zinc-400">Nenhuma unidade.</td></tr>
                                ) : (
                                    unidadesCondominio.filter(u => u.toLowerCase() !== 'adm').map((unidade) => {
                                        const valorNumerico = converterParaFloat(valorFundoReserva);
                                        return (
                                            <tr key={unidade} className="hover:bg-zinc-50/50">
                                                <td className="p-3.5 pl-5 text-xs font-bold text-emerald-600">{competenciaSelecionada}</td>
                                                <td className="p-3.5 text-xs font-bold">Apto {unidade}</td>
                                                <td className="p-3.5 text-xs font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14} /> Aplicável</td>
                                                <td className="p-3.5 pr-5 text-right text-xs font-black">R$ {valorNumerico.toFixed(2).replace('.', ',')}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {fundoReservaSuccess && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl flex items-center gap-2"><CheckCircle2 size={14} /> {fundoReservaSuccess}</p>}
                    <button onClick={handleSalvarFundoReserva} disabled={loadingFundo} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                        {loadingFundo ? "Salvando..." : "Salvar Fundo de Reservas"}
                    </button>
                </div>
            </div>
        </div>
    );
}