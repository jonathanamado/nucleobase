// app/condo/adm/layout.tsx
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, ShieldAlert, Lock, UserPlus, KeyRound, ArrowRight, Briefcase } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdmLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);
    const [autorizado, setAutorizado] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const checkAdminAccess = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                setSession(currentSession);

                if (!currentSession) {
                    setAutorizado(false);
                    setLoading(false);
                    return;
                }

                // Busca o cargo do usuário na tabela condominio_membros
                const { data: membro, error } = await supabase
                    .from("condominio_membros")
                    .select("role")
                    .eq("user_id", currentSession.user.id)
                    .maybeSingle();

                if (error || !membro) {
                    setAutorizado(false);
                    setLoading(false);
                    return;
                }

                const cargo = (membro.role || "").toLowerCase();

                // Regra: Apenas 'sindico' pode acessar a área administrativa (/adm)
                if (cargo === 'sindico') {
                    setAutorizado(true);
                } else {
                    setAutorizado(false);
                }
            } catch (err) {
                setAutorizado(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdminAccess();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-amber-600 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Verificando permissões de acesso...</p>
            </div>
        );
    }

    // REGRA 1: USUÁRIO DESLOGADO
    if (!session) {
        // Se estiver na raiz (/condo/adm), permite que o page.tsx renderize o próprio formulário de login
        if (pathname === '/condo/adm') {
            return <>{children}</>;
        }

        // Se tentar acessar subpáginas diretamente, bloqueia com as opções de Criar Conta e Login
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col justify-start items-center p-6 pt-8 md:pt-12">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 rounded-[2.5rem] text-center space-y-4 shadow-sm">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Lock size={12} className="text-blue-600" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Área restrita</span>
                    </div>
                    <br />
                    <p className="text-xs text-zinc-500">
                        Esta área administrativa é restrita aos gestores do condomínio. Faça login para continuar.
                    </p>

                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">Ambiente seguro</p>
                        <div className="flex flex-col gap-2">
                            <a href="/cadastro" className="flex items-center justify-center gap-2 bg-white text-gray-900 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border border-gray-200 shadow-sm hover:border-blue-200 hover:text-blue-600 transition-all">
                                <UserPlus size={14} className="text-blue-600" /> Criar conta
                            </a>
                            <a href="/condo/adm" className="flex items-center justify-center gap-2 bg-white text-gray-900 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border border-gray-200 shadow-sm hover:border-blue-200 hover:text-blue-600 transition-all">
                                <KeyRound size={14} className="text-blue-600" /> Realizar login
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // REGRA 2: USUÁRIO LOGADO E SEM ACESSO (NÃO SÍNDICO)
    if (!autorizado) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col justify-start items-center p-6 pt-8 md:pt-12">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Briefcase size={30} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-lg md:text-xl font-black tracking-tight text-zinc-900">Perfil Incompleto</h1>
                        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                            Identificamos que o seu cadastro na Nucleo ainda não possui o acesso autorizado como Administrador.
                        </p>
                    </div>

                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 text-left">
                        <p className="text-xs text-center text-zinc-600 font-medium">
                            Para liberar seu acesso, atualize seu perfil de Administrador na página Minha Conta, e solicite a conclusão do seu Cadastro Empresarial.
                        </p>
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                        <a href="/minha-conta" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer">
                            <ArrowRight size={14} /> Ir para Minha Conta
                        </a>
                        <Link href="/condo" className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer">
                            Voltar
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // REGRA 3: USUÁRIO LOGADO E AUTORIZADO
    return <>{children}</>;
}