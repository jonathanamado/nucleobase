"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    Building2,
    CheckCircle2,
    ArrowLeft,
    Instagram,
    FileSpreadsheet,
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
    AlertCircle,
    Clock,
    Search,
    Receipt,
    Plus,
    DollarSign,
    Calendar,
    MessageCircle,
    Activity,
    Trash2
} from "lucide-react";

export default function GestaoCobrancasPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    // Estados de loading, listagem e cache RPC
    const [loadingCobrancas, setLoadingCobrancas] = useState(false);
    const [listaCobrancas, setListaCobrancas] = useState<any[]>([]);
    const [resumoCards, setResumoCards] = useState({ arrecadado: 0, inadimplente: 0, taxa: "0.00" });

    // Filtros de busca e debounce
    const [filtroMesInicio, setFiltroMesInicio] = useState(new Date().toISOString().slice(0, 7));
    const [filtroMesFim, setFiltroMesFim] = useState(new Date().toISOString().slice(0, 7));
    const [buscaUnidade, setBuscaUnidade] = useState("");
    const [termoBuscaReal, setTermoBuscaReal] = useState("");

    // Estado do Modal de Cadastro Manual / Retroativo
    const [showModalNovoBoleto, setShowModalNovoBoleto] = useState(false);
    const [loadingNovoBoleto, setLoadingNovoBoleto] = useState(false);
    const [formUnidade, setFormUnidade] = useState("");
    const [formCompetencia, setFormCompetencia] = useState(new Date().toISOString().slice(0, 7) + '-01');
    const [formValor, setFormValor] = useState("0,00");
    const [formStatus, setFormStatus] = useState<'pendente' | 'pago'>('pendente');

    // Controle de Login
    const [emailOrSlug, setEmailOrSlug] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");

    // Dados do Condomínio
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [isApenasMorador, setIsApenasMorador] = useState(false);

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

    // Debounce da digitação (evita sobrecarregar o DB a cada tecla)
    useEffect(() => {
        const handler = setTimeout(() => {
            setTermoBuscaReal(buscaUnidade);
        }, 400); // 400ms de delay
        return () => clearTimeout(handler);
    }, [buscaUnidade]);

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

            const { data: membroDataList, error: membroError } = await supabase
                .from("condominio_membros")
                .select("condominio_id, role, unidade, acesso_app, condominio_nome")
                .eq("user_id", userId);

            if (membroError && !membroError.message.includes("AbortError")) {
                console.error("Erro na consulta Supabase (membros):", membroError);
            }

            if (!membroDataList || membroDataList.length === 0) {
                if (isMountedRef.current) {
                    setIsApenasMorador(true);
                    setCondominio(null);
                    setLoading(false);
                }
                return;
            }

            const vinculoAdm = membroDataList.find((m: any) => m.role === 'sindico') || membroDataList[0];

            if (!vinculoAdm || vinculoAdm.role !== 'sindico') {
                if (isMountedRef.current) {
                    setIsApenasMorador(true);
                    setCondominio(null);
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
                if (condoDataReal && condoDataReal.nome) {
                    nomeCondominioOficial = condoDataReal.nome;
                }
            }

            if (isMountedRef.current) {
                setIsApenasMorador(false);
                const condoObj = { id: vinculoAdm.condominio_id, nome: nomeCondominioOficial };
                setCondominio(condoObj);
                await carregarCobrancas(condoObj.id, filtroMesInicio, filtroMesFim, termoBuscaReal);
            }
        } catch (e: any) {
            console.warn("Exceção tratada em verifySindicoAndLoadData:", e);
            if (isMountedRef.current) setCondominio(null);
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    };

    const carregarCobrancas = async (condoId: string, mesInicio: string, mesFim: string, busca: string = "", isBackgroundRefresh: boolean = false) => {
        if (!isBackgroundRefresh) setLoadingCobrancas(true);

        try {
            const dataInicio = `${mesInicio}-01`;
            const [anoFimStr, mesFimStr] = mesFim.split('-');
            const anoFim = parseInt(anoFimStr, 10);
            const mesFimNum = parseInt(mesFimStr, 10);
            const ultimoDiaFim = new Date(anoFim, mesFimNum, 0).getDate();
            const dataFim = `${mesFim}-${ultimoDiaFim.toString().padStart(2, '0')}`;

            // 1. Busca a lista com paginação/limite direto no DB
            let queryLista = supabase
                .from("condominio_cobrancas")
                .select("*")
                .eq("condominio_id", condoId)
                .gte("data_competencia", dataInicio)
                .lte("data_competencia", dataFim)
                .order("unidade", { ascending: true });

            if (busca) queryLista = queryLista.ilike("unidade", `%${busca}%`);

            // 2. Aciona os cálculos pesados via RPC no DB
            const queryResumo = supabase.rpc("obter_resumo_cobrancas", {
                p_condominio_id: condoId,
                p_data_inicio: dataInicio,
                p_data_fim: dataFim,
                p_busca: busca
            });

            // Promisse.all para máxima velocidade (ambas correm juntas)
            const [resultLista, resultResumo] = await Promise.all([queryLista, queryResumo]);

            if (resultLista.error) {
                console.warn("Aviso ao carregar cobranças:", resultLista.error.message);
                setListaCobrancas([]);
            } else {
                setListaCobrancas(resultLista.data || []);
            }

            if (resultResumo.error) {
                console.warn("Erro ao carregar resumo RPC:", resultResumo.error.message);
                setResumoCards({ arrecadado: 0, inadimplente: 0, taxa: "0.00" });
            } else if (resultResumo.data && resultResumo.data.length > 0) {
                setResumoCards({
                    arrecadado: resultResumo.data[0].total_arrecadado || 0,
                    inadimplente: resultResumo.data[0].total_inadimplente || 0,
                    taxa: resultResumo.data[0].taxa_inadimplencia || "0.00"
                });
            } else {
                setResumoCards({ arrecadado: 0, inadimplente: 0, taxa: "0.00" });
            }

        } catch (err) {
            console.error("Erro geral na busca de dados:", err);
            setListaCobrancas([]);
            setResumoCards({ arrecadado: 0, inadimplente: 0, taxa: "0.00" });
        } finally {
            if (!isBackgroundRefresh) setLoadingCobrancas(false);
        }
    };

    // Monitora alterações nos filtros para buscar os dados novamente
    useEffect(() => {
        if (condominio?.id) {
            carregarCobrancas(condominio.id, filtroMesInicio, filtroMesFim, termoBuscaReal);
        }
    }, [filtroMesInicio, filtroMesFim, termoBuscaReal]);

    useEffect(() => {
        isMountedRef.current = true;
        let authSub: any = null;

        const initAuth = async () => {
            try {
                const timeoutId = setTimeout(() => {
                    if (isMountedRef.current && loading) setLoading(false);
                }, 5000);

                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
                clearTimeout(timeoutId);

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
                setIsApenasMorador(false);
                setLoading(false);
            }
        });
        authSub = subscription;

        return () => {
            isMountedRef.current = false;
            if (authSub) authSub.unsubscribe();
        };
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setLoginError("");

        const inputAcesso = emailOrSlug.trim().toLowerCase();
        const isEmail = inputAcesso.includes("@");

        try {
            let emailParaLogin = "";
            if (isEmail) {
                emailParaLogin = inputAcesso;
            } else {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('email_contato')
                    .eq('slug', inputAcesso)
                    .maybeSingle();

                if (profileError) throw profileError;
                if (!profile || !profile.email_contato) {
                    setLoginError("ID de Síndico ou E-mail não localizado.");
                    setAuthLoading(false);
                    return;
                }
                emailParaLogin = profile.email_contato;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailParaLogin,
                password
            });

            if (error || !data.session) {
                setLoginError("Acesso negado. Credenciais incorretas.");
                setAuthLoading(false);
                return;
            }

            if (data.session) {
                window.dispatchEvent(new Event("storage"));
                await verifySindicoAndLoadData(data.session);
            }
        } catch (err) {
            setLoginError("Ocorreu um erro inesperado ao entrar.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSalvarBoletoManual = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!condominio) return;

        setLoadingNovoBoleto(true);
        try {
            const valorNumerico = converterParaFloat(formValor);

            const { error } = await supabase
                .from("condominio_cobrancas")
                .insert([
                    {
                        condominio_id: condominio.id,
                        unidade: formUnidade.trim(),
                        data_competencia: formCompetencia,
                        valor_total: valorNumerico,
                        status_pagamento: formStatus
                    }
                ]);

            if (error) throw error;

            alert("Cobrança cadastrada com sucesso.");
            setShowModalNovoBoleto(false);
            setFormUnidade("");
            setFormValor("0,00");
            setFormStatus("pendente");

            const mesCompetenciaCadastrada = formCompetencia.slice(0, 7);
            if (mesCompetenciaCadastrada < filtroMesInicio || mesCompetenciaCadastrada > filtroMesFim) {
                setFiltroMesInicio(mesCompetenciaCadastrada);
                setFiltroMesFim(mesCompetenciaCadastrada);
            } else {
                await carregarCobrancas(condominio.id, filtroMesInicio, filtroMesFim, termoBuscaReal);
            }
        } catch (err: any) {
            alert("Erro ao cadastrar boleto: " + (err.message || "Erro desconhecido"));
        } finally {
            setLoadingNovoBoleto(false);
        }
    };

    const handleAlternarStatusPagamento = async (id: string, statusAtual: string) => {
        if (statusAtual !== 'pago') {
            const confirmacao = window.confirm("Deseja confirmar a baixa deste boleto?");
            if (!confirmacao) return;
        } else {
            const confirmacao = window.confirm("Deseja reabrir este boleto (marcar como Em Aberto)?");
            if (!confirmacao) return;
        }

        const novoStatus = statusAtual === 'pago' ? 'pendente' : 'pago';
        setListaCobrancas(prev => prev.map(item => item.id === id ? { ...item, status_pagamento: novoStatus } : item));

        try {
            const { error } = await supabase
                .from("condominio_cobrancas")
                .update({ status_pagamento: novoStatus })
                .eq("id", id);

            if (error) throw error;
            // Atualiza os totais de cards sem mostrar a tela de loading principal
            if (condominio?.id) carregarCobrancas(condominio.id, filtroMesInicio, filtroMesFim, termoBuscaReal, true);
        } catch (err: any) {
            console.error("Erro ao atualizar status:", err);
            alert("Erro ao atualizar status de pagamento: " + (err.message || 'Falha na requisição'));
            if (condominio?.id) carregarCobrancas(condominio.id, filtroMesInicio, filtroMesFim, termoBuscaReal, true);
        }
    };

    const handleExcluirCobranca = async (id: string) => {
        const confirmacao = window.confirm("Tem certeza que deseja excluir permanentemente esta cobrança? Esta ação não pode ser desfeita.");
        if (!confirmacao) return;

        try {
            const { data, error } = await supabase
                .from("condominio_cobrancas")
                .delete()
                .eq("id", id)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) {
                throw new Error("Não foi possível excluir o registro. Verifique se você tem permissão (RLS).");
            }

            setListaCobrancas(prev => prev.filter(item => item.id !== id));
            if (condominio?.id) carregarCobrancas(condominio.id, filtroMesInicio, filtroMesFim, termoBuscaReal, true);

        } catch (err: any) {
            console.error("Erro ao excluir cobrança:", err);
            alert("Erro ao excluir cobrança: " + (err.message || 'Falha na exclusão'));
            if (condominio?.id) carregarCobrancas(condominio.id, filtroMesInicio, filtroMesFim, termoBuscaReal, true);
        }
    };

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
        setIsApenasMorador(false);
        setLoading(false);
        window.dispatchEvent(new Event("storage"));
    };

    // Otimização de renderização no React (useMemo).
    // Garante que a formatação monetária (recurso mais pesado) só seja feita se o DB entregar números novos.
    const cardsMemoizados = useMemo(() => {
        return {
            arrecadado: formatarValorExibicao(resumoCards.arrecadado),
            inadimplente: formatarValorExibicao(resumoCards.inadimplente),
            taxa: String(resumoCards.taxa).replace('.', ',')
        };
    }, [resumoCards]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="animate-spin text-emerald-600 mb-4">
                    <FileSpreadsheet size={32} />
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando gestão de cobranças...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-zinc-50/50 text-zinc-900 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.25em]">Área da Administração</span>
                        <h1 className="text-2xl font-black tracking-tight">Login do Síndico</h1>
                        <p className="text-xs text-zinc-500">Faça login com suas credenciais de síndico cadastradas.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">E-mail ou ID de Síndico</label>
                            <div className="relative group">
                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Exemplo: joao-sindico"
                                    required
                                    className="w-full pl-11 pr-5 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all text-sm font-medium"
                                    value={emailOrSlug}
                                    onChange={(e) => setEmailOrSlug(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Senha</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all text-sm font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 p-1 hover:text-zinc-600 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {loginError && (
                            <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl text-center">
                                {loginError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full bg-zinc-900 text-white py-4 rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {authLoading ? "Acessando..." : "Entrar como Síndico"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (session && isApenasMorador) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                        <Lock size={30} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-xl font-black tracking-tight">Área Restrita</h1>
                        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                            Olá! O seu perfil possui acesso restrito. Esta página de administração é destinada apenas aos gestores com perfil de síndico autorizado.
                        </p>
                    </div>
                    <div className="pt-2 space-y-3">
                        <button
                            onClick={handleLogout}
                            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                        >
                            Entrar com outra conta
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-4 md:p-10 flex flex-col justify-between">
            <div className="space-y-8">
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-auto h-auto bg-emerald-600 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0 self-stretch">
                                    <Receipt size={24} />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                                        Gestão Financeira
                                    </span>
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5">
                                        {condominio?.nome || "Carregando..."}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowModalNovoBoleto(true)}
                                    className="group relative flex items-center justify-center gap-1.5 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm cursor-pointer"
                                >
                                    <Plus size={14} />
                                    <span className="hidden md:inline">Inserir Boleto / Histórico</span>
                                    <span className="md:hidden">Inserir</span>
                                </button>
                                <Link
                                    href="/condo/adm"
                                    className="group relative hidden md:flex items-center justify-center gap-1.5 h-10 px-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm cursor-pointer"
                                >
                                    <ArrowLeft size={14} />
                                    <span>Voltar</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* DASHBOARD SUMÁRIO COM CACHE DO REACT (USEMEMO) E RPC */}
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                        <div className="bg-white border border-zinc-200 p-3 md:p-5 rounded-2xl md:rounded-[2rem] shadow-sm flex flex-col relative overflow-hidden">
                            <div className="hidden md:flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                    <DollarSign size={20} />
                                </div>
                            </div>
                            <h3 className="text-zinc-500 text-[9px] md:text-xs font-bold uppercase tracking-wider truncate">
                                <span className="hidden md:inline">Total Arrecadado</span>
                                <span className="md:hidden">Arrecadado</span>
                            </h3>
                            <p className="text-xs md:text-2xl font-black text-zinc-900 mt-1 truncate" title={`R$ ${cardsMemoizados.arrecadado}`}>
                                R$ {cardsMemoizados.arrecadado}
                            </p>
                        </div>

                        <div className="bg-white border border-zinc-200 p-3 md:p-5 rounded-2xl md:rounded-[2rem] shadow-sm flex flex-col relative overflow-hidden">
                            <div className="hidden md:flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                                    <AlertCircle size={20} />
                                </div>
                            </div>
                            <h3 className="text-zinc-500 text-[9px] md:text-xs font-bold uppercase tracking-wider truncate">
                                <span className="hidden md:inline">Total Inadimplente</span>
                                <span className="md:hidden">Inadimplente</span>
                            </h3>
                            <p className="text-xs md:text-2xl font-black text-rose-600 mt-1 truncate" title={`R$ ${cardsMemoizados.inadimplente}`}>
                                R$ {cardsMemoizados.inadimplente}
                            </p>
                        </div>

                        <div className="bg-white border border-zinc-200 p-3 md:p-5 rounded-2xl md:rounded-[2rem] shadow-sm flex flex-col relative overflow-hidden">
                            <div className="hidden md:flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Activity size={20} />
                                </div>
                            </div>
                            <h3 className="text-zinc-500 text-[9px] md:text-xs font-bold uppercase tracking-wider truncate">
                                <span className="hidden md:inline">Taxa de Inadimplência</span>
                                <span className="md:hidden">Taxa</span>
                            </h3>
                            <p className="text-xs md:text-2xl font-black text-zinc-900 mt-1 truncate" title={`${cardsMemoizados.taxa}%`}>
                                {cardsMemoizados.taxa}%
                            </p>
                        </div>
                    </div>

                    {/* FILTROS E CONTROLES */}
                    <div className="bg-white border border-zinc-200 p-6 rounded-[2.5rem] shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-4">
                            <div className="w-full md:w-auto flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1 block">Período (Início)</label>
                                <input
                                    type="month"
                                    value={filtroMesInicio}
                                    onChange={(e) => setFiltroMesInicio(e.target.value)}
                                    className="w-full md:w-auto px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900 capitalize"
                                />
                            </div>
                            <div className="w-full md:w-auto flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1 block">Período (Fim)</label>
                                <input
                                    type="month"
                                    value={filtroMesFim}
                                    onChange={(e) => setFiltroMesFim(e.target.value)}
                                    className="w-full md:w-auto px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900 capitalize"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-72 space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Filtrar Unidade</label>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Ex: Apto 101..."
                                    value={buscaUnidade}
                                    onChange={(e) => setBuscaUnidade(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* LISTAGEM DE UNIDADES / COBRANÇAS */}
                    <div className="bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-zinc-100 flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight text-zinc-900">
                                Unidades e Status de Pagamento
                            </h3>
                            <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-xl">
                                Total: {listaCobrancas.length} registros
                            </span>
                        </div>

                        {loadingCobrancas ? (
                            <div className="p-12 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                Carregando dados da tabela...
                            </div>
                        ) : listaCobrancas.length === 0 ? (
                            <div className="p-12 text-center space-y-2">
                                <Clock size={32} className="mx-auto text-zinc-300" />
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nenhum registro de cobrança encontrado para este período.</p>
                                <p className="text-xs text-zinc-500">Utilize o botão acima para inserir boletos manuais ou retroativos.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-100 bg-zinc-50/50 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                            <th className="py-4 px-6">Unidade</th>
                                            <th className="py-4 px-6">Competência</th>
                                            <th className="py-4 px-6">Valor (R$)</th>
                                            <th className="py-4 px-6">Status de Pagamento</th>
                                            <th className="py-4 px-6 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 text-xs">
                                        {listaCobrancas.map((item) => {
                                            const status = item.status_pagamento || 'pendente';
                                            const isPago = status === 'pago';

                                            return (
                                                <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                                                    <td className="py-4 px-6 font-black text-zinc-900">
                                                        {item.unidade || "N/A"}
                                                    </td>
                                                    <td className="py-4 px-6 font-mono text-zinc-500">
                                                        {item.data_competencia ? item.data_competencia.slice(0, 10) : filtroMesInicio}
                                                    </td>
                                                    <td className="py-4 px-6 font-black font-mono text-zinc-900">
                                                        R$ {formatarValorExibicao(item.valor_total || 0)}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAlternarStatusPagamento(item.id, status)}
                                                            className={`px-3.5 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${isPago
                                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                                                }`}
                                                        >
                                                            {isPago ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                            {isPago ? 'Pago' : 'Em Aberto'}
                                                        </button>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {isPago ? (
                                                                <div
                                                                    className="group relative flex items-center justify-center gap-1.5 h-8 w-28 bg-zinc-100 text-zinc-400 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm cursor-not-allowed"
                                                                    title="Pago"
                                                                >
                                                                    <MessageCircle size={14} />
                                                                    <span>Pago</span>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        const mesTexto = item.data_competencia ? item.data_competencia.slice(0, 10) : filtroMesInicio;
                                                                        const valorTexto = formatarValorExibicao(item.valor_total || 0);
                                                                        const nomeCondominioTexto = condominio?.nome || 'nosso condomínio';

                                                                        const mensagem = `Olá! Aqui é da administração do condomínio ${nomeCondominioTexto}. Identificamos que a cota da unidade ${item.unidade} (Ref: ${mesTexto}), no valor de R$ ${valorTexto}, encontra-se em aberto. Caso já tenha efetuado o pagamento, por favor, desconsidere esta mensagem.`;

                                                                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`, '_blank');
                                                                    }}
                                                                    className="group relative flex items-center justify-center gap-1.5 h-8 w-28 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm cursor-pointer"
                                                                    title="Notificar cobrança via WhatsApp"
                                                                >
                                                                    <MessageCircle size={14} />
                                                                    <span>Notificar</span>
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => handleExcluirCobranca(item.id)}
                                                                className="group relative flex items-center justify-center h-8 w-8 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-full transition-all duration-300 shadow-sm cursor-pointer"
                                                                title="Excluir Cobrança"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL DE CADASTRO MANUAL / RETROATIVO DE BOLETO */}
            {showModalNovoBoleto && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowModalNovoBoleto(false)}
                            className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <Receipt size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Inserir Boleto / Histórico</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Cadastre faturas manuais, retroativas ou importadas de gestões anteriores.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSalvarBoletoManual} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Unidade / Apto *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: 101"
                                        value={formUnidade}
                                        onChange={(e) => setFormUnidade(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 text-xs font-medium text-zinc-900"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Mês de Competência *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formCompetencia}
                                        onChange={(e) => setFormCompetencia(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 text-xs font-medium text-zinc-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Valor Total (R$) *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="0,00"
                                        value={formValor}
                                        onChange={(e) => setFormValor(e.target.value)}
                                        onBlur={(e) => setFormValor(formatarValorExibicao(e.target.value))}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 text-xs font-medium text-zinc-900"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Status Inicial *</label>
                                    <select
                                        value={formStatus}
                                        onChange={(e) => setFormStatus(e.target.value as 'pendente' | 'pago')}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 text-xs font-medium text-zinc-900 cursor-pointer"
                                    >
                                        <option value="pendente">Em Aberto</option>
                                        <option value="pago">Pago</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loadingNovoBoleto}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {loadingNovoBoleto ? "Salvando Registro..." : "Salvar Cobrança Manual"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* RODAPÉ PADRONIZADO INSTAGRAM */}
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
    );
}