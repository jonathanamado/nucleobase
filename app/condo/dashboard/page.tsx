// app/condo/dashboard/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    FileText,
    CalendarDays,
    Vote,
    Wallet,
    Eye,
    EyeOff,
    ShieldAlert,
    Loader2,
    Users,
    MessageSquarePlus,
    Building2,
    LifeBuoy,
    Mail,
    X,
    ArrowRight,
    AtSign,
    Key,
    KeyRound,
    UserCheck,
    CheckCircle2,
    Instagram
} from "lucide-react";

interface UserMemberData {
    role: string;
    unidade: string;
    acesso_app: boolean;
    condominio: {
        nome: string;
    } | null;
}

export default function CondoDashboard() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    const [emailOrSlug, setEmailOrSlug] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");

    // Modal de Recuperação de Senha ("Esqueceu a senha")
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    // Modal de Primeiro Acesso com ID/Slug
    const [showFirstAccessModal, setShowFirstAccessModal] = useState(false);
    const [firstAccessSlug, setFirstAccessSlug] = useState("");
    const [firstAccessLoading, setFirstAccessLoading] = useState(false);

    const [memberData, setMemberData] = useState<UserMemberData | null>(null);

    const isMountedRef = useRef(true);

    // Substitua a função fetchMemberPermissionsAndSession por esta:
    const fetchMemberPermissionsAndSession = async (currentSession: any, retries = 2) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setMemberData(null);
                    setLoading(false);
                }
                return;
            }

            if (isMountedRef.current) {
                setSession(currentSession);
            }
            const userId = currentSession.user.id;

            let condoData = null;

            for (let i = 0; i <= retries; i++) {
                const { data, error } = await supabase.rpc('get_user_condo_context', {
                    p_user_id: userId
                });

                if (!error && data) {
                    condoData = data;
                    break;
                }

                if (i < retries) {
                    await new Promise((resolve) => setTimeout(resolve, 300));
                }
            }

            if (isMountedRef.current) {
                if (condoData && condoData.role) {
                    setMemberData({
                        role: condoData.role,
                        unidade: condoData.unidade || "N/A",
                        acesso_app: condoData.acesso_app,
                        condominio: {
                            nome: condoData.condominio_nome
                        }
                    });
                } else {
                    setMemberData(null);
                }
            }
        } catch (e: any) {
            const errString = e?.message || JSON.stringify(e);
            if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                console.error("Erro ao carregar permissões condominiais via RPC:", errString);
            }
            if (isMountedRef.current) {
                setMemberData(null);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        isMountedRef.current = true;

        const initAuth = async () => {
            try {
                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError && !currentSession) throw sessionError;

                if (isMountedRef.current) {
                    await fetchMemberPermissionsAndSession(currentSession);
                }
            } catch (err: any) {
                const errString = err?.message || JSON.stringify(err);
                if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                    console.error("Erro ao recuperar sessão inicial:", errString);
                }
                if (isMountedRef.current) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!isMountedRef.current) return;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                if (currentSession) {
                    await fetchMemberPermissionsAndSession(currentSession);
                }
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setMemberData(null);
                setLoading(false);
            }
        });

        return () => {
            isMountedRef.current = false;
            subscription.unsubscribe();
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
                    setLoginError("ID de usuário ou e-mail não foi localizado.");
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
                setLoginError("Credenciais inválidas. Verifique seu ID de usuário/e-mail e senha.");
                setAuthLoading(false);
                return;
            }

            if (data.session) {
                window.dispatchEvent(new Event("storage"));
                await fetchMemberPermissionsAndSession(data.session);
            }
        } catch (err) {
            setLoginError("Ocorreu um erro inesperado ao realizar login.");
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
                `Para acessar pela primeira vez, utilize o seu ID (${profileData.slug}) na tela de login e a senha temporária fornecida pelo síndico.\n\n` +
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
            localStorage.removeItem('nucleo_condo_auth_session');
            localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
            window.dispatchEvent(new Event("storage"));
        } catch (e) {
            console.error("Erro ao limpar storages:", e);
        }
        await supabase.auth.signOut();
        setSession(null);
        setMemberData(null);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50/50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sincronizando acessos...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-zinc-50/50 text-zinc-900 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Acesso restrito</span>
                        <h1 className="text-2xl font-black tracking-tight">Painel do Condomínio</h1>
                        <p className="text-xs text-zinc-500">Insira suas credenciais cadastradas pelo seu síndico para acessar.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">E-mail ou ID de Usuário</label>
                            <div className="relative group">
                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Exemplo: joao-silva"
                                    required
                                    className="w-full pl-11 pr-5 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-sm font-medium"
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
                                    className="w-full pl-11 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-sm font-medium"
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
                            {authLoading ? "Acessando..." : "Entrar no Painel"}
                        </button>
                    </form>
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
                                    Insira a chave/slug gerada pelo síndico para validar seu cadastro e realizar o login com sua senha temporária.
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

    if (session && !memberData) {
        return (
            <div className="min-h-screen bg-zinc-50/50 text-zinc-900 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                        <ShieldAlert size={32} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-xl font-black tracking-tight">Sem vínculo ativo</h1>
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            O e-mail <span className="font-bold text-zinc-800">{session.user.email}</span> está logado na Nucleobase, mas ainda não foi autorizado em nenhum condomínio.
                        </p>
                    </div>
                    <div className="pt-4 border-t border-zinc-100 flex gap-4">
                        <button onClick={handleLogout} className="w-full px-4 py-3 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-600 font-bold text-xs transition-colors cursor-pointer">
                            Sair / Trocar Conta
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const modulos = [
        {
            title: "Prestação de Contas",
            desc: "Balancetes mensais e gráficos de receitas vs. despesas.",
            shortDesc: "Balancetes e relatórios financeiros.",
            icon: <Wallet className="text-emerald-500" size={24} />,
            badge: "Financeiro",
            path: "/condo/dashboard/prestacao-de-contas"
        },
        {
            title: "Consulta de Moradores",
            desc: "Controle simplificado da lista de residentes autorizados.",
            shortDesc: "Gestão de residentes autorizados.",
            icon: <Users className="text-indigo-500" size={24} />,
            badge: "Adm",
            path: "/condo/dashboard/cadastro-moradores"
        },
        {
            title: "2ª via de Boletos",
            desc: "Emissão de taxas condominiais, fundos de reserva e taxas extras.",
            shortDesc: "Suporte em emissão e 2ª via de boletos.",
            icon: <FileText className="text-blue-500" size={24} />,
            badge: "Cobranças",
            path: "/condo/dashboard/boletos-segunda-via"
        },
        {
            title: "Reservas Área Gourmet",
            desc: "Agendamento de salão de festas, churrasqueira e espaço gourmet.",
            shortDesc: "Agendamento de áreas comuns.",
            icon: <CalendarDays className="text-purple-500" size={24} />,
            badge: "Operacional",
            path: "/condo/dashboard/reserva-de-espacos"
        },
        {
            title: "Enquetes e Decisões",
            desc: "Assembleias virtuais e votações rápidas de melhorias.",
            shortDesc: "Assembleias e votações rápidas.",
            icon: <Vote className="text-amber-500" size={24} />,
            badge: "Comunidade",
            path: "/condo/dashboard/enquetes-e-decisoes"
        },
        {
            title: "Ocorrências e Sugestões",
            desc: "Livro digital para registrar elogios, críticas ou solicitações.",
            shortDesc: "Livro de ocorrências digital.",
            icon: <MessageSquarePlus className="text-rose-500" size={24} />,
            badge: "Ouvidoria",
            path: "/condo/dashboard/ocorrencias-e-sugestoes"
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Painel APP</span>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1 text-zinc-900">Nucleo Condo</h1>
                    </div>
                </div>
            </div>

            <p className="text-xs md:text-sm text-zinc-500 font-medium mb-10">
                Seja bem-vindo(a) ao <span className="font-bold text-zinc-800">{memberData?.condominio?.nome || "Condomínio"}</span>! Explore ferramentas integradas ao seu condomínio.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6 max-w-6xl">
                {modulos.map((modulo, idx) => (
                    <Link
                        key={idx}
                        href={modulo.path}
                        className="bg-white border border-zinc-200 p-3 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3 md:mb-6">
                                <div className="p-1.5 md:p-3 bg-zinc-50 rounded-xl md:rounded-2xl group-hover:bg-zinc-900/5 transition-colors">
                                    {React.cloneElement(modulo.icon, {
                                        className: `${modulo.icon.props.className} w-5 h-5 md:w-6 md:h-6`
                                    })}
                                </div>
                                <div className="w-full flex justify-end md:justify-end">
                                    <span className="text-[7.5px] md:text-[10px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-100 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-full text-center truncate max-w-[75px] md:max-w-none">
                                        {modulo.badge}
                                    </span>
                                </div>
                            </div>
                            <h3 className="font-bold text-sm md:text-lg text-zinc-900 mb-1 md:mb-2 group-hover:text-blue-600 transition-colors">
                                {modulo.title}
                            </h3>
                            <p className="text-xs md:text-sm text-zinc-500 leading-relaxed block md:hidden">
                                {modulo.shortDesc}
                            </p>
                            <p className="text-xs md:text-sm text-zinc-500 leading-relaxed hidden md:block">
                                {modulo.desc}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-zinc-100 flex items-center text-[10px] md:text-xs font-bold text-blue-600">
                            Acessar ferramenta →
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-24 flex items-center gap-4 mb-12">
                <div className="h-px bg-gray-200 flex-1"></div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
                <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <div className="flex flex-col items-center text-center">
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
    );
}