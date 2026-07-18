// app/condo/dashboard/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
    FileText,
    CalendarDays,
    Vote,
    Wallet,
    LockKeyhole,
    Eye,
    EyeOff,
    ShieldAlert,
    Loader2,
    Users,
    MessageSquarePlus,
    ArrowLeft,
    Instagram
} from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserMemberData {
    role: string;
    unidade: string;
    condominio: {
        nome: string;
    };
}

export default function CondoDashboard() {
    // Estados de Autenticação e Carregamento
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    // Estados do Formulário de Login
    const [emailOrSlug, setEmailOrSlug] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");

    // Dados do Vínculo do Morador
    const [memberData, setMemberData] = useState<UserMemberData | null>(null);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
            setSession(currentSession);
            if (currentSession) {
                await fetchMemberPermissions(currentSession.user.id);
            } else {
                setMemberData(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Busca permissão do usuário na tabela vinculada do Condomínio
    const fetchMemberPermissions = async (userId: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("condominio_membros")
                .select(`
                  role,
                  unidade,
                  condominio:condominios ( nome )
                `)
                .eq("user_id", userId)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setMemberData(data as unknown as UserMemberData);
            } else {
                setMemberData(null);
            }
        } catch (e) {
            console.error("Erro ao carregar permissões condominiais:", e);
        } finally {
            setLoading(false);
        }
    };

    // Login suportando tanto E-mail real quanto Slug (ID do Usuário)
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setLoginError("");

        let emailParaAuth = emailOrSlug.trim();

        if (!emailParaAuth.includes("@")) {
            emailParaAuth = `${emailParaAuth.toLowerCase()}@nucleobase.app`;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailParaAuth,
            password
        });

        if (error) {
            setLoginError("Credenciais inválidas. Verifique seu ID de usuário/e-mail e senha.");
            setAuthLoading(false);
            return;
        }

        if (data.session) {
            await fetchMemberPermissions(data.session.user.id);
        }
        setAuthLoading(false);
    };

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
    };

    // --- RENDERS ---

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
                            <input
                                type="text"
                                placeholder="Exemplo: joao-silva"
                                required
                                className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-sm font-medium"
                                onChange={(e) => setEmailOrSlug(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Senha</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-sm font-medium pr-12"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 p-1 hover:text-zinc-600"
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
                            className="w-full bg-zinc-900 text-white py-4 rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            {authLoading ? "Acessando..." : "Entrar no Painel"}
                        </button>
                    </form>
                </div>
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
                        <p className="text-xs text-zinc-400">
                            Solicite à Administração que associe este ID de usuário ao sistema.
                        </p>
                    </div>
                    <div className="pt-4 border-t border-zinc-100 flex gap-4">
                        <a href="/minha-conta" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs transition-colors">
                            Ir para Finanças Pessoais
                        </a>
                        <button onClick={handleLogout} className="px-4 py-3 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-600 font-bold text-xs transition-colors">
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const modulos = [
        {
            title: "Prestação de Contas",
            desc: "Balancetes mensais, gráficos de receitas vs. despesas e relatórios acumulados.",
            icon: <Wallet className="text-emerald-500" size={24} />,
            badge: "Financeiro",
            path: "/condo/dashboard/prestacao-contas"
        },
        {
            title: "Cadastro de Moradores",
            desc: "Acesso e controle simplificado da lista de residentes autorizados no condomínio.",
            icon: <Users className="text-indigo-500" size={24} />,
            badge: "Administrativo",
            path: "/condo/dashboard/cadastro-moradores"
        },
        {
            title: "Boletos e 2ª Via",
            desc: "Suporte em Emissão de taxas condominiais ordinárias, fundos de reserva e taxas extras.",
            icon: <FileText className="text-blue-500" size={24} />,
            badge: "Cobranças",
            path: "/condo/dashboard/boletos"
        },
        {
            title: "Reserva de Espaços",
            desc: "Agendamento de salão de festas, churrasqueira e espaço gourmet sem conflitos.",
            icon: <CalendarDays className="text-purple-500" size={24} />,
            badge: "Operacional",
            path: "/condo/dashboard/reservas"
        },
        {
            title: "Enquetes e Decisões",
            desc: "Assembleias virtuais, votações rápidas de melhorias e decisões do conselho.",
            icon: <Vote className="text-amber-500" size={24} />,
            badge: "Comunidade",
            path: "/condo/dashboard/enquetes"
        },
        {
            title: "Ocorrências e Sugestões",
            desc: "Livro de ocorrência digital para registrar formalmente elogios, críticas ou solicitações de manutenção.",
            icon: <MessageSquarePlus className="text-rose-500" size={24} />,
            badge: "Ouvidoria",
            path: "/condo/dashboard/ocorrencias"
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-6 md:p-10">
            {/* Header do Dashboard */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6 mb-10">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Painel do Condomínio</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">{memberData?.condominio?.nome || "Condomínio"}</h1>
                </div>

                {/* Botão de Voltar Minimalista Premium */}
                <button
                    onClick={() => window.history.back()}
                    className="group relative flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 self-start md:self-auto overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                    <ArrowLeft
                        size={12}
                        className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out"
                    />
                    <span>Voltar</span>
                </button>
            </div>

            {/* Grid de Módulos (Produtos de Gestão) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
                {modulos.map((modulo, idx) => (
                    <Link
                        key={idx}
                        href={modulo.path}
                        className="bg-white border border-zinc-150 p-6 md:p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-zinc-50 rounded-2xl group-hover:bg-zinc-900/5 transition-colors">
                                    {modulo.icon}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">
                                    {modulo.badge}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-zinc-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {modulo.title}
                            </h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                {modulo.desc}
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center text-xs font-bold text-blue-600">
                            Acessar ferramenta →
                        </div>
                    </Link>
                ))}
            </div>

            {/* LINHA DIVISÓRIA CONECTE-SE */}
            <div className="mt-24 flex items-center gap-4 mb-12">
                <div className="h-px bg-gray-200 flex-1"></div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
                <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            {/* BLOCO INSTAGRAM */}
            <div className="flex flex-col items-center text-center">
                <div className="max-w-3xl mb-12">
                    <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
                        Fique por dentro <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
                    </h4>
                    <p className="text-gray-500 font-medium text-sm md:text-base">
                        Dicas de gestão inteligente, novidades do systema e conteúdos exclusivos no nosso Instagram.
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
    );
}