// app/condo/adm/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLoginProtegido } from "@/hooks/useLoginProtegido";
import {
    Users,
    UserPlus,
    ShieldAlert,
    Loader2,
    Building2,
    Smartphone,
    Pencil,
    ArrowLeft,
    Instagram,
    LifeBuoy,
    Mail,
    X,
    ArrowRight,
    FileSpreadsheet,
    Package,
    Lock,
    Key,
    KeyRound,
    UserCheck,
    AtSign,
    Eye,
    EyeOff,
    Vote,
    Wrench,
    FileText,
    BookOpen,
    Network,
    FileBarChart,
    Truck,
    BadgeAlert,
    MessageSquareWarning,
    PhoneCall,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

interface Morador {
    id: string;
    unidade: string;
    role: string;
    user_id: string;
    acesso_app: boolean;
    criado_em: string;
    data_inicio?: string;
    data_fim?: string;
    profile: {
        nome_completo: string;
        email_contato: string;
        slug: string;
    };
}

export default function CondoAdm() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Controle de Login via Hook de Segurança
    const {
        emailOrSlug,
        setEmailOrSlug,
        password,
        setPassword,
        authLoading,
        setAuthLoading,
        loginError,
        setLoginError,
        tempoBloqueio,
        tratarErroLogin,
        resetarBloqueio
    } = useLoginProtegido();

    const [showPassword, setShowPassword] = useState(false);

    // Modal de Recuperação de Senha ("Esqueceu a senha")
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    // Modal de Primeiro Acesso com ID/Slug
    const [showFirstAccessModal, setShowFirstAccessModal] = useState(false);
    const [firstAccessSlug, setFirstAccessSlug] = useState("");
    const [firstAccessLoading, setFirstAccessLoading] = useState(false);

    // Dados do Condomínio e Vínculo
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [moradores, setMoradores] = useState<Morador[]>([]);

    // Controle de acesso negado específico
    const [isApenasMorador, setIsApenasMorador] = useState(false);

    // Referência para o Carrossel de Cards na Visão Desktop
    const carouselRef = useRef<HTMLDivElement>(null);

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = 400;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const isMountedRef = useRef(true);

    const formatarNomePrimeiroEUltimo = (nomeCompleto: string) => {
        if (!nomeCompleto) return "";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length <= 1) return partes[0] || "";
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    const formatarDataBrasileira = (dataString: string | undefined) => {
        if (!dataString) return "-";
        try {
            const data = new Date(dataString);
            if (isNaN(data.getTime())) return dataString;
            return data.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
        } catch {
            return dataString;
        }
    };

    const obterNomeCondominioMobile = (nomeCompleto: string) => {
        if (!nomeCompleto) return "Condomínio";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length <= 1) return partes[0];
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    const loadMoradores = async (condoId: string) => {
        const { data, error } = await supabase
            .from("condominio_membros")
            .select(`
                id,
                unidade,
                role,
                user_id,
                acesso_app,
                criado_em,
                data_inicio,
                data_fim,
                profile:profiles ( nome_completo, email_contato, slug )
            `)
            .eq("condominio_id", condoId)
            .order("unidade", { ascending: true });

        if (!error && data && isMountedRef.current) {
            setMoradores(data as unknown as Morador[]);
        }
    };

    const verifySindicoAndLoadData = async (currentSession: any) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setCondominio(null);
                    setIsApenasMorador(false);
                    setMoradores([]);
                    setLoading(false);
                }
                return;
            }

            if (isMountedRef.current) {
                setSession(currentSession);
            }
            const userId = currentSession.user.id;

            const { data: condoData, error } = await supabase.rpc('get_user_condo_context', {
                p_user_id: userId
            });

            if (error || !condoData || condoData.role !== 'sindico') {
                if (isMountedRef.current) {
                    setIsApenasMorador(true);
                    setCondominio(null);
                    setMoradores([]);
                    setLoading(false);
                }
                return;
            }

            if (isMountedRef.current) {
                setIsApenasMorador(false);
                setCondominio({
                    id: condoData.condominio_id,
                    nome: condoData.condominio_nome
                });
            }

            await loadMoradores(condoData.condominio_id);
        } catch (e: any) {
            const errString = e?.message || JSON.stringify(e);
            if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                console.warn("Exceção tratada em verifySindicoAndLoadData:", errString);
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
                    await verifySindicoAndLoadData(currentSession);
                }
            } catch (err: any) {
                const errString = err?.message || JSON.stringify(err);
                if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                    console.error("Erro ao recuperar sessão inicial do síndico:", errString);
                }
                if (isMountedRef.current) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!isMountedRef.current) return;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (currentSession) {
                    await verifySindicoAndLoadData(currentSession);
                }
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setCondominio(null);
                setIsApenasMorador(false);
                setMoradores([]);
                setLoading(false);
            }
        });
        authSub = subscription;

        return () => {
            isMountedRef.current = false;
            if (authSub) authSub.unsubscribe();
        };
    }, []);

    const mascararEmail = (email: string) => {
        if (!email || !email.includes("@")) return email || "@user";
        if (email.startsWith("pendente.morador.")) return "E-mail não cadastrado";
        const [usuario, dominio] = email.split("@");
        if (usuario.length <= 1) return `*@${dominio}`;
        return `${usuario[0]}*****@${dominio}`;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (tempoBloqueio > 0) return;
        setAuthLoading(true);
        setLoginError("");

        try {
            const inputAcesso = emailOrSlug.trim().toLowerCase();
            let emailParaLogin = inputAcesso;

            if (!inputAcesso.includes("@")) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('email_contato')
                    .eq('slug', inputAcesso)
                    .maybeSingle();

                if (profileError) throw profileError;
                if (!profile?.email_contato) {
                    tratarErroLogin("ID de Síndico ou E-mail não localizado.");
                    return;
                }
                emailParaLogin = profile.email_contato;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailParaLogin,
                password
            });

            if (error || !data.session) {
                tratarErroLogin("Acesso negado. Credenciais incorretas.");
                return;
            }

            resetarBloqueio();
            if (data.session) {
                window.dispatchEvent(new Event("storage"));
                await verifySindicoAndLoadData(data.session);
            }
        } catch {
            tratarErroLogin("Ocorreu um erro inesperado ao entrar.");
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
                `Conta localizada com sucesso!\n\n` +
                `Para acessar pela primeira vez, utilize o seu ID (${profileData.slug}) na tela de login e a senha temporária fornecida.\n\n` +
                `Após entrar, recomendamos alterar sua senha nas configurações.`
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
        setMoradores([]);
        setLoading(false);
        window.dispatchEvent(new Event("storage"));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Autenticando painel de gestão...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-zinc-50/50 text-zinc-900 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-1.5 mb-3">
                            <Lock size={12} className="text-blue-600" />
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Área restrita</span>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight">Login do Síndico</h1>
                        <p className="text-xs text-zinc-500">Faça login com suas credenciais de síndico cadastradas.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">E-mail ou ID de Síndico</label>
                            <div className="relative group">
                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Exemplo: joao-sindico"
                                    required
                                    className="w-full pl-11 pr-5 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-sm font-normal"
                                    value={emailOrSlug}
                                    onChange={(e) => setEmailOrSlug(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Senha</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-sm font-normal"
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
                                className="text-[10px] text-zinc-400 font-bold hover:text-blue-600 transition-colors cursor-pointer"
                            >
                                Esqueceu a senha?
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowFirstAccessModal(true)}
                                className="text-[10px] text-blue-600 font-black hover:text-blue-700 transition-colors cursor-pointer"
                            >
                                Primeiro acesso com ID de usuário?
                            </button>
                        </div>

                        {tempoBloqueio > 0 && (
                            <div className="text-xs font-bold text-amber-600 bg-amber-50 p-3 rounded-xl text-center">
                                Muitas tentativas. Tente novamente em {tempoBloqueio}s.
                            </div>
                        )}

                        {loginError && tempoBloqueio === 0 && (
                            <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl text-center">
                                {loginError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={authLoading || tempoBloqueio > 0}
                            className="w-full bg-zinc-900 text-white py-4 rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {authLoading ? "Acessando..." : tempoBloqueio > 0 ? `Aguarde (${tempoBloqueio}s)` : "Entrar como Síndico"}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Ainda não se cadastrou ou quer gerenciar suas contas?</p>
                        <div className="flex flex-col gap-2.5">
                            <a href="/cadastro" className="flex items-center justify-center gap-3 bg-white text-gray-900 py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:text-blue-600 transition-all active:scale-95">
                                <UserPlus size={16} className="text-blue-600" /> Criar conta (/cadastro)
                            </a>
                            <a href="/acesso-usuario" className="flex items-center justify-center gap-3 bg-white text-gray-900 py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:text-blue-600 transition-all active:scale-95">
                                <KeyRound size={16} className="text-blue-600" /> Acessar com ID (/acesso-usuario)
                            </a>
                        </div>
                    </div>
                </div>

                {/* MODAL: RECOVERY PASSWORD */}
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
                                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 mb-4">
                                    <LifeBuoy size={32} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Recuperar Acesso</h2>
                                <p className="text-gray-500 text-xs mb-6">
                                    Informe seu e-mail cadastrado para receber um link de redefinição de senha.
                                </p>

                                <form onSubmit={handleForgotPassword} className="w-full space-y-4">
                                    <div className="relative group text-left">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                        <input
                                            type="email"
                                            required
                                            placeholder="seu@email.com"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                        />
                                    </div>
                                    <button
                                        disabled={resetLoading}
                                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {resetLoading ? "Enviando..." : "Enviar Link de Acesso"}
                                        <ArrowRight size={16} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: PRIMEIRO ACESSO VIA ID/SLUG */}
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
                                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 mb-4">
                                    <KeyRound size={32} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Primeiro Acesso</h2>
                                <p className="text-gray-500 text-xs mb-6">
                                    Insira a chave/slug gerada para validar seu cadastro e realizar o login com sua senha temporária.
                                </p>

                                <form onSubmit={handleFirstAccessSetup} className="w-full space-y-3">
                                    <div className="relative group text-left">
                                        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: condo-joao-xyz"
                                            value={firstAccessSlug}
                                            onChange={(e) => setFirstAccessSlug(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-xs font-mono font-bold text-gray-700 uppercase"
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
                        <h1 className="text-lg md:text-xl font-black tracking-tight">Área restrita</h1>
                        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                            Esta página é exclusiva para a gestão do administrador. Acesse a Nucleo com base no seu perfil de cadastro (<code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">/adm</code>).
                        </p>
                    </div>

                    <div className="pt-2 space-y-3">
                        <button
                            onClick={() => window.history.back()}
                            className="w-full bg-zinc-900 hover:bg-black text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md shadow-zinc-900/10 cursor-pointer"
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
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-auto h-auto bg-blue-600 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0 self-stretch">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                    <span className="md:hidden">Painel de Gestão</span>
                                    <span className="hidden md:inline">Painel de Gestão - Controles internos</span>
                                </span>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5">
                                    <span className="md:hidden text-black">{obterNomeCondominioMobile(condominio?.nome || "Condomínio")}</span>
                                    <span className="hidden md:inline">{condominio?.nome || "Condomínio"}</span>
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
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
                </div>

                <p className="text-xs md:text-sm text-zinc-500 font-medium mb-6">
                    <span className="md:hidden">Painel para gerenciamento e controle de ações do Condomínio.</span>
                    <span className="hidden md:inline">Painel para gerenciamento de acessos de moradores, registros de lançamentos contábeis e controle de ocorrências e sugestões.</span>
                </p>

                <div className="w-full max-w-none space-y-6">
                    {/* CONTAINER DE CARROSSEL DESKTOP / SEQUENCIAL MOBILE */}
                    <div className="relative group/carousel">
                        {/* Botão Esquerda Desktop */}
                        <button
                            onClick={() => scrollCarousel('left')}
                            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-zinc-200 text-zinc-700 rounded-full items-center justify-center shadow-lg hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100"
                            aria-label="Rolar para esquerda"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {/* Botão Direita Desktop */}
                        <button
                            onClick={() => scrollCarousel('right')}
                            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-zinc-200 text-zinc-700 rounded-full items-center justify-center shadow-lg hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100"
                            aria-label="Rolar para direita"
                        >
                            <ChevronRight size={20} />
                        </button>

                        {/* Lista de Cards com Carrossel Horizontal no Desktop (2 Linhas) e Sequencial no Mobile */}
                        {/* A ordem foi intercalada (Item 1 Superior, Item 1 Inferior, Item 2 Superior, etc.) para que no grid com 2 rows, as colunas formem visualmente a divisão esperada. */}
                        <div
                            ref={carouselRef}
                            className="grid grid-cols-2 md:grid-cols-none md:grid-flow-col md:grid-rows-2 md:overflow-x-auto md:scroll-smooth gap-3 md:gap-4 pb-2 md:pb-4 scrollbar-none"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {/* --- Bloco Superior 1: Controle de acesso --- */}
                            <Link
                                href="/condo/adm/cadastro_morador"
                                className="bg-white border border-zinc-200 hover:border-blue-400 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center group transition-all text-left cursor-pointer md:w-[280px] shrink-0"
                            >
                                <div className="flex items-center gap-2.5 md:gap-3.5 text-left min-w-0 w-full">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                        <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-xs md:text-sm text-zinc-800 leading-tight">Controle de acesso</h3>
                                        <p className="text-[10px] md:text-[11px] text-zinc-400 mt-0.5 leading-tight">Atualização de uso da Plataforma</p>
                                    </div>
                                </div>
                            </Link>

                            {/* --- Bloco Inferior 1: Prestação de contas --- */}
                            <Link
                                href="/condo/adm/prestacao_contas"
                                className="bg-white border border-zinc-200 hover:border-emerald-400 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center group transition-all text-left cursor-pointer md:w-[280px] shrink-0"
                            >
                                <div className="flex items-center gap-2.5 md:gap-3.5 text-left min-w-0 w-full">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                                        <FileSpreadsheet className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-xs md:text-sm text-zinc-800 leading-tight">Prestação de contas</h3>
                                        <p className="text-[10px] md:text-[11px] text-zinc-400 mt-0.5 leading-tight">Lançamentos financeiros</p>
                                    </div>
                                </div>
                            </Link>

                            {/* --- Bloco Superior 2: Controle de inadimplência --- */}
                            <Link
                                href="/condo/adm/prestacao_contas/cobranca"
                                className="bg-white border border-zinc-200 hover:border-rose-400 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center group transition-all text-left cursor-pointer md:w-[280px] shrink-0"
                            >
                                <div className="flex items-center gap-2.5 md:gap-3.5 text-left min-w-0 w-full">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all shrink-0">
                                        <BadgeAlert className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-xs md:text-sm text-zinc-800 leading-tight">Controle de inadimplência</h3>
                                        <p className="text-[10px] md:text-[11px] text-zinc-400 mt-0.5 leading-tight">Atualizações de pagamentos</p>
                                    </div>
                                </div>
                            </Link>

                            {/* --- Bloco Inferior 2: Análise de demandas --- */}
                            <Link
                                href="/condo/adm/analise_ocorrencias"
                                className="bg-white border border-zinc-200 hover:border-amber-400 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center group transition-all text-left cursor-pointer md:w-[280px] shrink-0"
                            >
                                <div className="flex items-center gap-2.5 md:gap-3.5 text-left min-w-0 w-full">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shrink-0">
                                        <ShieldAlert className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-xs md:text-sm text-zinc-800 leading-tight">Análise de demandas</h3>
                                        <p className="text-[10px] md:text-[11px] text-zinc-400 mt-0.5 leading-tight">Ocorrências e sugestões</p>
                                    </div>
                                </div>
                            </Link>

                            {/* --- Bloco Superior 3: Enquetes e decisões --- */}
                            <Link
                                href="/condo/adm/enquetes"
                                className="bg-white border border-zinc-200 hover:border-sky-400 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center group transition-all text-left cursor-pointer md:w-[280px] shrink-0"
                            >
                                <div className="flex items-center gap-2.5 md:gap-3.5 text-left min-w-0 w-full">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all shrink-0">
                                        <Vote className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-xs md:text-sm text-zinc-800 leading-tight">Enquetes e decisões</h3>
                                        <p className="text-[10px] md:text-[11px] text-zinc-400 mt-0.5 leading-tight">Votações comunitárias</p>
                                    </div>
                                </div>
                            </Link>

                            {/* --- Bloco Inferior 3: Obras e melhorias --- */}
                            <Link
                                href="/condo/adm/controle_conservacao"
                                className="bg-white border border-zinc-200 hover:border-zinc-400 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center group transition-all text-left cursor-pointer md:w-[280px] shrink-0"
                            >
                                <div className="flex items-center gap-2.5 md:gap-3.5 text-left min-w-0 w-full">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-100 text-zinc-600 rounded-xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all shrink-0">
                                        <Wrench className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-xs md:text-sm text-zinc-800 leading-tight">Obras e melhorias</h3>
                                        <p className="text-[10px] md:text-[11px] text-zinc-400 mt-0.5 leading-tight">Conservação áreas comuns</p>
                                    </div>
                                </div>
                            </Link>

                            {/* --- Bloco Superior 4: Controle de bens --- */}
                            <Link
                                href="/condo/adm/gestao_ativos"
                                className="bg-white border border-zinc-200 hover:border-indigo-400 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center group transition-all text-left cursor-pointer md:w-[280px] shrink-0"
                            >
                                <div className="flex items-center gap-2.5 md:gap-3.5 text-left min-w-0 w-full">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                        <Package className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-xs md:text-sm text-zinc-800 leading-tight">Controle de bens</h3>
                                        <p className="text-[10px] md:text-[11px] text-zinc-400 mt-0.5 leading-tight">Gestão de ativos</p>
                                    </div>
                                </div>
                            </Link>

                            {/* --- Bloco Inferior 4: Regras internas --- */}
                            <Link
                                href="/condo/adm/regras_internas"
                                className="bg-white border border-zinc-200 hover:border-zinc-400 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center group transition-all text-left cursor-pointer md:w-[280px] shrink-0"
                            >
                                <div className="flex items-center gap-2.5 md:gap-3.5 text-left min-w-0 w-full">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-100 text-zinc-600 rounded-xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all shrink-0">
                                        <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-xs md:text-sm text-zinc-800 leading-tight">Regras internas</h3>
                                        <p className="text-[10px] md:text-[11px] text-zinc-400 mt-0.5 leading-tight">Convenção e regimento</p>
                                    </div>
                                </div>
                            </Link>

                            {/* --- Bloco Superior 5: Obrigações fiscais --- */}
                            <Link
                                href="/condo/adm/obrigacoes"
                                className="bg-white border border-zinc-200 hover:border-blue-400 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center group transition-all text-left cursor-pointer md:w-[280px] shrink-0"
                            >
                                <div className="flex items-center gap-2.5 md:gap-3.5 text-left min-w-0 w-full">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                        <FileText className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-xs md:text-sm text-zinc-800 leading-tight">Obrigações fiscais</h3>
                                        <p className="text-[10px] md:text-[11px] text-zinc-400 mt-0.5 leading-tight">Gestão de tributos</p>
                                    </div>
                                </div>
                            </Link>

                            {/* --- Bloco Inferior 5: Relatórios internos --- */}
                            <Link
                                href="/condo/adm/rateio_condominio"
                                className="bg-white border border-zinc-200 hover:border-cyan-400 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center group transition-all text-left cursor-pointer md:w-[280px] shrink-0"
                            >
                                <div className="flex items-center gap-2.5 md:gap-3.5 text-left min-w-0 w-full">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all shrink-0">
                                        <FileBarChart className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-xs md:text-sm text-zinc-800 leading-tight">Relatórios internos</h3>
                                        <p className="text-[10px] md:text-[11px] text-zinc-400 mt-0.5 leading-tight">Rateios, receitas, despesas, etc.</p>
                                    </div>
                                </div>
                            </Link>

                            {/* --- Bloco Superior 6: Fornecedores cadastrados --- */}
                            <div className="bg-white border border-zinc-200 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center group transition-all text-left md:w-[280px] shrink-0 opacity-80 select-none">
                                <div className="flex items-center gap-2.5 md:gap-3.5 text-left min-w-0 w-full">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Truck className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-xs md:text-sm text-zinc-800 leading-tight">Fornecedores cadastrados</h3>
                                            <span className="text-[9px] text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded">Em dev</span>
                                        </div>
                                        <p className="text-[10px] md:text-[11px] text-zinc-400 mt-0.5 leading-tight">Contratos e prestadores de serviços</p>
                                    </div>
                                </div>
                            </div>

                            {/* --- Bloco Inferior 6: Projeto Integração Condo --- */}
                            <div className="bg-white border border-zinc-200 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center group transition-all text-left md:w-[280px] shrink-0 opacity-80 select-none">
                                <div className="flex items-center gap-2.5 md:gap-3.5 text-left min-w-0 w-full">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Network className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-xs md:text-sm text-zinc-800 leading-tight">Projeto Integração Condo</h3>
                                            <span className="text-[9px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded">Em dev</span>
                                        </div>
                                        <p className="text-[10px] md:text-[11px] text-zinc-400 mt-0.5 leading-tight">Integração de sistemas e de pessoas</p>
                                    </div>
                                </div>
                            </div>

                            {/* --- Bloco Superior 7: Controle de Notificações --- */}
                            <div className="bg-white border border-zinc-200 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center group transition-all text-left md:w-[280px] shrink-0 opacity-80 select-none">
                                <div className="flex items-center gap-2.5 md:gap-3.5 text-left min-w-0 w-full">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center shrink-0">
                                        <MessageSquareWarning className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-xs md:text-sm text-zinc-800 leading-tight">Controle de notificações</h3>
                                            <span className="text-[9px] text-yellow-600 font-bold bg-yellow-50 px-1.5 py-0.5 rounded">Em dev</span>
                                        </div>
                                        <p className="text-[10px] md:text-[11px] text-zinc-400 mt-0.5 leading-tight">Reclamando ocorrências</p>
                                    </div>
                                </div>
                            </div>

                            {/* --- Bloco Inferior 7: Telefones importantes --- */}
                            <div className="bg-white border border-zinc-200 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center group transition-all text-left md:w-[280px] shrink-0 opacity-80 select-none">
                                <div className="flex items-center gap-2.5 md:gap-3.5 text-left min-w-0 w-full">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                                        <PhoneCall className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-xs md:text-sm text-zinc-800 leading-tight">Telefones importantes</h3>
                                            <span className="text-[9px] text-teal-600 font-bold bg-teal-50 px-1.5 py-0.5 rounded">Em dev</span>
                                        </div>
                                        <p className="text-[10px] md:text-[11px] text-zinc-400 mt-0.5 leading-tight">Contato de apoio e utilidade pública</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <p className="hidden md:block text-xs text-zinc-400 font-medium px-1">
                        Abaixo encontra-se a relação atualizada de todos os cadastros e moradores vinculados ao condomínio.
                    </p>

                    <div className="hidden md:block bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm text-left mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-4 mb-4 gap-4">
                            <div className="flex items-center gap-3">
                                <Users className="text-blue-600" size={24} />
                                <h2 className="font-bold text-lg text-zinc-900">Cadastro</h2>
                            </div>
                            <div className="flex items-center gap-3 self-end sm:self-auto">
                                <span className="hidden md:inline-block text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 px-3 py-1.5 rounded-full">
                                    {moradores.length} Registros
                                </span>
                                <Link
                                    href="/condo/adm/cadastro_morador"
                                    className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-colors shadow-sm"
                                >
                                    <Pencil size={14} /> Editar cadastros
                                </Link>
                            </div>
                        </div>

                        {moradores.length === 0 ? (
                            <div className="text-center py-12 space-y-2">
                                <p className="text-zinc-400 text-sm font-medium">Nenhum condômino cadastrado ainda.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-[300px]">
                                <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
                                    <thead className="sticky top-0 bg-white z-10">
                                        <tr className="border-b border-zinc-100">
                                            <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider bg-white align-top w-[15%] pr-2">Apto</th>
                                            <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider bg-white align-top w-[35%] pl-2">Nome</th>
                                            <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider bg-white align-top w-[20%]">Data Início</th>
                                            <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider bg-white align-top w-[20%]">Data Fim</th>
                                            <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider bg-white align-top w-[10%] text-right pr-2">App</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {moradores.map((morador) => {
                                            const isSemEmail = morador.profile?.email_contato?.startsWith("pendente.morador.");
                                            const nomeExibicaoOriginal = morador.profile?.nome_completo || "Sem Nome";
                                            const unidadeOriginal = morador.unidade || "";
                                            const isAdm = unidadeOriginal.trim().toLowerCase() === "administração" || unidadeOriginal.trim().toLowerCase() === "adm";
                                            const nomeExibicaoFinal = formatarNomePrimeiroEUltimo(nomeExibicaoOriginal);
                                            // Utiliza data_inicio se existir; senão cai pro criado_em para fallback
                                            const dataInicio = formatarDataBrasileira(morador.data_inicio || morador.criado_em);
                                            const dataFim = formatarDataBrasileira(morador.data_fim);

                                            return (
                                                <tr key={morador.id} className="group transition-colors hover:bg-zinc-50/50">
                                                    <td className="py-3 text-sm font-bold text-zinc-900 align-top truncate pr-2">
                                                        {isAdm ? "Adm" : unidadeOriginal}
                                                    </td>
                                                    <td className="py-3 align-top truncate pl-2 pr-2">
                                                        <div className="text-sm font-bold text-zinc-800 leading-tight truncate">
                                                            {nomeExibicaoFinal}
                                                        </div>
                                                        <div className="mt-1 truncate">
                                                            {isSemEmail ? (
                                                                <div className="text-[9px] text-zinc-400 font-semibold tracking-wide truncate">
                                                                    ID: {morador.profile?.slug}
                                                                </div>
                                                            ) : (
                                                                <div className="text-[9px] text-zinc-400 font-semibold tracking-wide truncate">
                                                                    {mascararEmail(morador.profile?.email_contato)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 align-top text-xs font-medium text-zinc-600">
                                                        {dataInicio}
                                                    </td>
                                                    <td className="py-3 align-top text-xs font-medium text-zinc-600">
                                                        {dataFim}
                                                    </td>
                                                    <td className="py-3 align-top text-right pr-2">
                                                        {morador.acesso_app ? (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">
                                                                <Smartphone size={10} /> Ativo
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-md">
                                                                <Smartphone size={10} className="opacity-50" /> Inativo
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
                </div>
            </div>

            <div>
                <div className="mt-24 flex items-center gap-4 mb-12">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <div className="flex flex-col items-center text-center pb-6">
                    <div className="max-w-3xl mb-12">
                        <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
                            Fique por dentro <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
                        </h4>
                        <p className="text-gray-500 font-medium text-sm md:text-base">
                            Dicas de gestão inteligente, novidades do sistema e conteúdos exclusivos no nosso Instagram.
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