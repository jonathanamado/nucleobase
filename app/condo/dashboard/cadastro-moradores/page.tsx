// app/condo/dashboard/cadastro-moradores/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
    Users,
    Search,
    Loader2,
    ArrowLeft,
    ShieldCheck,
    Building2,
    UserCircle,
    Instagram
} from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Morador {
    id: string;
    unidade: string;
    role: string;
    profile: {
        nome_completo: string;
        email_contato: string;
        slug: string;
    };
}

export default function ListaMoradoresCondomino() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [condominioNome, setCondominioNome] = useState("Meu Condomínio");

    // Lista de moradores vinda do banco e controle de busca
    const [moradores, setMoradores] = useState<Morador[]>([]);
    const [filtroBusca, setFiltroBusca] = useState("");

    // Função Auxiliar: Formata nome completo para retornar apenas o primeiro e o último nome
    const formatarNomePrimeiroEUltimo = (nomeCompleto: string) => {
        if (!nomeCompleto) return "";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length <= 1) return partes[0] || "";
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    const loadDadosCondominio = async (currentSession: any) => {
        try {
            if (!currentSession) {
                setSession(null);
                setMoradores([]);
                setLoading(false);
                return;
            }

            setSession(currentSession);
            const userId = currentSession.user.id;

            // 1. Identifica o condomínio do usuário com tratamento unificado e flexível
            const { data: membroData, error: membroError } = await supabase
                .from("condominio_membros")
                .select("condominio_id, role, condominio:condominios(nome)")
                .eq("user_id", userId)
                .order("role", { ascending: false })
                .order("criado_em", { ascending: false })
                .limit(1);

            if (membroError) throw membroError;

            if (membroData && membroData.length > 0) {
                const registro = membroData[0];

                const condoRelacionamento = registro.condominio;
                const nomeCondo = Array.isArray(condoRelacionamento)
                    ? condoRelacionamento[0]?.nome
                    : (condoRelacionamento as any)?.nome;

                setCondominioNome(nomeCondo || "Meu Condomínio");

                // 2. Carrega membros do mesmo condomínio
                const { data: lista, error: listaError } = await supabase
                    .from("condominio_membros")
                    .select(`
                        id,
                        unidade,
                        role,
                        profile:profiles(nome_completo, email_contato, slug)
                    `)
                    .eq("condominio_id", registro.condominio_id);

                if (listaError) throw listaError;

                if (lista) {
                    setMoradores(lista as unknown as Morador[]);
                }
            } else {
                setMoradores([]);
            }
        } catch (e: any) {
            const erroFormatado = {
                mensagem: e?.message || "Erro desconhecido na requisição",
                detalhes: e?.details || null,
                codigo: e?.code || null,
                original: String(e)
            };
            console.error("Erro completo ao carregar dados dos condôminos:", erroFormatado);
            setMoradores([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                if (isMounted) {
                    await loadDadosCondominio(initialSession);
                }
            } catch (err) {
                console.error("Erro ao recuperar sessão inicial:", err);
                if (isMounted) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (isMounted) {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                    await loadDadosCondominio(currentSession);
                } else if (event === 'SIGNED_OUT') {
                    setSession(null);
                    setMoradores([]);
                    setLoading(false);
                }
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Função utilitária para limpar e padronizar o número da unidade para ordenação precisa
    const extrairNumeroUnidade = (unidadeStr: string) => {
        const limpo = unidadeStr.replace(/apto/i, "").trim();
        const numero = parseInt(limpo, 10);
        return isNaN(numero) ? limpo : numero;
    };

    // Filtra, normaliza a exibição e ordena de forma combinada (Unidade -> Nome)
    const moradoresProcessados = moradores
        .filter((morador) => {
            const termo = filtroBusca.toLowerCase().trim();
            if (!termo) return true;

            const nome = morador.profile?.nome_completo?.toLowerCase() || "";
            const unidade = morador.unidade?.toLowerCase() || "";

            return nome.includes(termo) || unidade.includes(termo);
        })
        .sort((a, b) => {
            const valA = extrairNumeroUnidade(a.unidade);
            const valB = extrairNumeroUnidade(b.unidade);

            if (valA !== valB) {
                if (typeof valA === "number" && typeof valB === "number") return valA - valB;
                return String(valA).localeCompare(String(valB));
            }

            const nomeA = a.profile?.nome_completo || "";
            const nomeB = b.profile?.nome_completo || "";
            return nomeA.localeCompare(nomeB);
        });

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando moradores...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-[2.5rem] text-center space-y-4">
                    <h1 className="text-xl font-black">Acesso restrito</h1>
                    <p className="text-sm text-zinc-500">Faça login na plataforma para visualizar a lista de moradores.</p>
                    <Link href="/condo/dashboard" className="inline-block bg-zinc-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                        Ir para Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Integrado com Botão Voltar Premium (Retirado no mobile via hidden md:flex) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <Users size={24} />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Residentes Autorizados</span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">{condominioNome}</h1>
                        </div>
                    </div>

                    <button
                        onClick={() => window.history.back()}
                        className="group relative hidden md:flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 self-start md:self-auto overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                        <ArrowLeft
                            size={12}
                            className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out"
                        />
                        <span>Voltar</span>
                    </button>
                </div>

                {/* Seção Totalizador + Contexto + Barra de Busca reposicionada abaixo */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <span className="text-xs text-zinc-500 font-medium">
                            Consulte abaixo a lista atualizada de condôminos e unidades vinculadas:
                        </span>
                    </div>

                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Buscar por nome ou unidade..."
                            value={filtroBusca}
                            onChange={(e) => setFiltroBusca(e.target.value)}
                            className="w-full h-12 pl-12 pr-6 bg-white border border-zinc-200 rounded-2xl outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-sm font-medium shadow-sm"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    </div>
                </div>

                {/* Grade de Vizinhos Ajustada (2 por linha) */}
                {moradoresProcessados.length === 0 ? (
                    <div className="bg-white border border-zinc-200 p-12 rounded-[2.5rem] text-center space-y-2">
                        <p className="text-zinc-400 font-bold text-sm">Nenhum morador encontrado</p>
                        <p className="text-xs text-zinc-400">Verifique os termos digitados ou contate a administração se houver inconsistências.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {moradoresProcessados.map((morador) => {
                            const roleLower = (morador.role || "").toLowerCase();
                            const isSindicoOuSubsindico = roleLower === "sindico" || roleLower === "subsindico";
                            const unidadeLimpa = morador.unidade.replace(/apto/i, "").trim();

                            const badgeTexto = isSindicoOuSubsindico
                                ? `Unidade ADM - ${unidadeLimpa}`
                                : `Unidade ${unidadeLimpa}`;

                            return (
                                <div
                                    key={morador.id}
                                    className="bg-white border border-zinc-150 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 px-2.5 py-1 rounded-full">
                                                {badgeTexto}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-100">
                                                <UserCircle size={24} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-zinc-900 truncate">
                                                    {formatarNomePrimeiroEUltimo(morador.profile?.nome_completo || "Sem Nome")}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

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