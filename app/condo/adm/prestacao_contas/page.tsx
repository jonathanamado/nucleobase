// app/condo/adm/prestacao_contas/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    Building2,
    CheckCircle2,
    ArrowLeft,
    Instagram,
    FileSpreadsheet,
    Edit3,
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
    Flame,
    PartyPopper,
    Wallet,
    Users
} from "lucide-react";

export default function PrestacaoContasPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    // Estados de loading independentes por seção
    const [loadingContas, setLoadingContas] = useState(false);

    // Controle de Login
    const [emailOrSlug, setEmailOrSlug] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");

    // Modais de Recuperação e Primeiro Acesso
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    const [showFirstAccessModal, setShowFirstAccessModal] = useState(false);
    const [firstAccessSlug, setFirstAccessSlug] = useState("");
    const [firstAccessLoading, setFirstAccessLoading] = useState(false);

    // Dados do Condomínio
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [isApenasMorador, setIsApenasMorador] = useState(false);

    // Estados para Lançamentos de Prestação de Contas (Mantidos na página principal)
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

    const formatarNomePrimeiroEUltimo = (nomeCompleto: string) => {
        if (!nomeCompleto) return "";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length <= 1) return partes[0] || "";
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

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
                setCondominio({ id: vinculoAdm.condominio_id, nome: nomeCondominioOficial });
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

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: "https://nucleobase.app/reset-password",
        });

        if (error) alert("Erro: " + error.message);
        else {
            alert("Link de recuperação enviado com sucesso!");
            setShowForgotModal(false);
        }
        setResetLoading(false);
    };

    const handleFirstAccessSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setFirstAccessLoading(true);

        const inputSlug = firstAccessSlug.trim().toLowerCase();

        try {
            const { data: profileData, error: profileQueryError } = await supabase
                .from('profiles')
                .select('id, slug, email_contato')
                .ilike('slug', inputSlug)
                .maybeSingle();

            if (profileQueryError) throw profileQueryError;

            if (!profileData || !profileData.id) {
                alert("ID de Usuário (slug) não localizado no sistema. Verifique a chave informada.");
                setFirstAccessLoading(false);
                return;
            }

            alert(
                `Conta localizada com sucesso!\n\nPara acessar pela primeira vez, utilize o seu ID (${profileData.slug}) na tela de login e a senha temporária fornecida.\n\nApós entrar, recomendamos alterar sua senha nas configurações.`
            );

            setEmailOrSlug(profileData.slug);
            setShowFirstAccessModal(false);
            setFirstAccessSlug("");
        } catch (err: any) {
            console.error("Erro no primeiro acesso:", err);
            alert(err?.message || "Houve uma falha interna ao processar sua solicitação.");
        } finally {
            setFirstAccessLoading(false);
        }
    };

    const handleSaveContas = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!condominio || !session) return;

        setLoadingContas(true);
        setContasError("");
        setContasSuccess("");

        try {
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
                        criado_por: session.user.id
                    }
                ]);

            if (error) throw error;

            setContasSuccess("Lançamento financeiro registrado com sucesso!");
            setValorPrevistoConta("0,00");
            setValorRealizadoConta("0,00");
            setDetalhamentoConta("");
            setTimeout(() => setContasSuccess(""), 2000);
        } catch (err: any) {
            console.error("Erro ao salvar conta:", err);
            setContasError(err?.message || "Erro ao registrar lançamento financeiro.");
        } finally {
            setLoadingContas(false);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="animate-spin text-emerald-600 mb-4">
                    <FileSpreadsheet size={32} />
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando prestação de contas...</p>
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

                        <div className="flex flex-col items-end gap-1.5 mt-1 pr-1">
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="text-[10px] text-zinc-400 font-bold hover:text-emerald-600 transition-colors cursor-pointer"
                            >
                                Esqueceu a senha?
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowFirstAccessModal(true)}
                                className="text-[10px] text-emerald-600 font-black hover:text-emerald-700 transition-colors cursor-pointer"
                            >
                                Primeiro acesso com ID de usuário?
                            </button>
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

                {showForgotModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                            <button
                                onClick={() => setShowForgotModal(false)}
                                className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 mb-4">
                                    <LifeBuoy size={32} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Recuperar Acesso</h2>
                                <p className="text-gray-500 text-xs mb-6">
                                    Informe seu e-mail cadastrado para receber um link de redefinição de senha.
                                </p>

                                <form onSubmit={handleForgotPassword} className="w-full space-y-4">
                                    <div className="relative group text-left">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                        <input
                                            type="email"
                                            required
                                            placeholder="seu@email.com"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
                                        />
                                    </div>
                                    <button
                                        disabled={resetLoading}
                                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {resetLoading ? "Enviando..." : "Enviar Link de Acesso"}
                                        <ArrowRight size={16} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {showFirstAccessModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                            <button
                                onClick={() => setShowFirstAccessModal(false)}
                                className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 mb-4">
                                    <KeyRound size={32} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Primeiro Acesso</h2>
                                <p className="text-gray-500 text-xs mb-6">
                                    Insira a chave/slug gerada para validar seu cadastro e realizar o login com sua senha temporária.
                                </p>

                                <form onSubmit={handleFirstAccessSetup} className="w-full space-y-3">
                                    <div className="relative group text-left">
                                        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: condo-joao-xyz"
                                            value={firstAccessSlug}
                                            onChange={(e) => setFirstAccessSlug(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none text-xs font-mono font-bold text-gray-700 uppercase"
                                        />
                                    </div>

                                    <button
                                        disabled={firstAccessLoading}
                                        className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg text-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2 uppercase tracking-widest text-[10px] cursor-pointer"
                                    >
                                        {firstAccessLoading ? "Verificando Chave..." : "Validar e Acessar"}
                                        <ArrowRight size={14} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
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
                            onClick={() => window.history.back()}
                            className="w-full bg-zinc-900 hover:bg-black text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md shadow-zinc-900/10 cursor-pointer hidden md:flex"
                        >
                            <ArrowLeft size={14} /> Voltar à página anterior
                        </button>
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-auto h-auto bg-emerald-600 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0 self-stretch">
                                    <FileSpreadsheet size={24} />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                                        Prestação de Contas
                                    </span>
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5">
                                        <span className="md:hidden text-black">{formatarNomePrimeiroEUltimo(condominio?.nome || "")}</span>
                                        <span className="hidden md:inline">{condominio?.nome}</span>
                                    </h1>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center gap-3">
                                <Link
                                    href="/condo/adm"
                                    className="group relative flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 overflow-hidden shrink-0 cursor-pointer"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-600 to-teal-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                                    <ArrowLeft size={12} className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out" />
                                    <span>Voltar</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* CONTROLE DE CONTAS (PRINCIPAL) */}
                    <div className="pt-2 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 mb-1">
                                Controle de Contas
                            </h2>
                            <p className="text-xs md:text-sm text-zinc-500 font-medium">
                                Registre lançamentos financeiros de receitas e despesas para a prestação de contas do condomínio.
                            </p>
                        </div>
                    </div>

                    <div className="w-full bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm">
                        <form onSubmit={handleSaveContas} className="space-y-3.5">
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
                                        placeholder="Ex: Pagamento Condomínio"
                                        required
                                        value={descricaoConta}
                                        onChange={(e) => setDescricaoConta(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900"
                                    />
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
                                    placeholder="Ex: Detalhes adicionais do lançamento..."
                                    value={detalhamentoConta}
                                    onChange={(e) => setDetalhamentoConta(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900"
                                />
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
                                    type="submit"
                                    disabled={loadingContas}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loadingContas ? "Registrando..." : "Salvar Lançamento"}
                                </button>

                                <Link
                                    href="/condo/adm/edicao_lancamentos"
                                    className="w-full bg-zinc-900 hover:bg-black text-white py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-zinc-900/10 flex items-center justify-center gap-2 cursor-pointer text-center"
                                >
                                    <Edit3 size={14} /> Editar lançamentos
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                <hr className="border-zinc-200 my-8" />

                {/* PAINEL DE CONTROLES - LINKS PARA SUBPÁGINAS */}
                <div className="pt-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 mb-1">
                                Controles de Consumo e Taxas
                            </h2>
                            <p className="text-xs md:text-sm text-zinc-500 font-medium">
                                Acesse as áreas exclusivas para gerenciar medições, fundos e rateios.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* MEDIÇÃO DE GÁS */}
                        <Link
                            href="/condo/adm/prestacao_contas/medicao-de-gas"
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8 bg-white border border-zinc-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5 rounded-[2.5rem] transition-all duration-300 w-full"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                                    <Flame size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-zinc-900 group-hover:text-emerald-700 transition-colors">
                                        Medição de Gás
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-1 max-w-md">
                                        Gerencie a tarifa do gás, registre as leituras mensais de cada unidade e calcule o valor consumido.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-zinc-50 rounded-full text-zinc-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
                                <ArrowRight size={20} />
                            </div>
                        </Link>

                        {/* FUNDO DE RESERVAS */}
                        <Link
                            href="/condo/adm/prestacao_contas/fundo-de-reservas"
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8 bg-white border border-zinc-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5 rounded-[2.5rem] transition-all duration-300 w-full"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                                    <Wallet size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-zinc-900 group-hover:text-emerald-700 transition-colors">
                                        Fundo de Reservas
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-1 max-w-md">
                                        Controle e aplicação da taxa de fundo de reservas e fundo de obras para o condomínio.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-zinc-50 rounded-full text-zinc-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
                                <ArrowRight size={20} />
                            </div>
                        </Link>

                        {/* SALÃO DE FESTAS */}
                        <Link
                            href="/condo/adm/prestacao_contas/salao-de-festas"
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8 bg-white border border-zinc-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5 rounded-[2.5rem] transition-all duration-300 w-full"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                                    <PartyPopper size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-zinc-900 group-hover:text-emerald-700 transition-colors">
                                        Salão de Festas
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-1 max-w-md">
                                        Controle de locações, agendamentos e geração de cobranças.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-zinc-50 rounded-full text-zinc-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
                                <ArrowRight size={20} />
                            </div>
                        </Link>

                        {/* RATEIO SÍNDICO */}
                        <Link
                            href="/condo/adm/prestacao_contas/rateio-sindico"
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8 bg-white border border-zinc-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5 rounded-[2.5rem] transition-all duration-300 w-full"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                                    <Users size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-zinc-900 group-hover:text-emerald-700 transition-colors">
                                        Rateio Síndico
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-1 max-w-md">
                                        Custo de isenção da Taxa Base do Síndico que é pago pelos demais moradores.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-zinc-50 rounded-full text-zinc-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
                                <ArrowRight size={20} />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

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