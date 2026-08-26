// app/condo/adm/layout.tsx
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, ShieldAlert, Lock, UserPlus, KeyRound, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdmLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [autorizado, setAutorizado] = useState(false);

    useEffect(() => {
        const checkAdminAccess = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setAutorizado(false);
                    setLoading(false);
                    return;
                }

                // Busca o cargo do usuário na tabela condominio_membros
                const { data: membro, error } = await supabase
                    .from("condominio_membros")
                    .select("role")
                    .eq("user_id", session.user.id)
                    .maybeSingle();

                if (error || !membro) {
                    setAutorizado(false);
                    setLoading(false);
                    return;
                }

                const cargo = (membro.role || "").toLowerCase();

                // Regra: Apenas 'sindico' pode acessar a área administrativa (/adm)
                // Moradores e contabilidade não possuem perfil para esta raiz
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

    if (!autorizado) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col justify-start items-center p-6 pt-12 md:pt-20">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 rounded-[2.5rem] text-center space-y-4 shadow-sm">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Lock size={12} className="text-blue-600" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Área restrita</span>
                    </div>
                    <br />
                    <p className="text-xs text-zinc-500">
                        Esta área administrativa é restrita aos gestores do condomínio.
                    </p>
                    <div className="pt-2">
                        <Link href="/condo" className="inline-block bg-zinc-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors">
                            Voltar
                        </Link>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">Ambiente seguro</p>
                        <div className="flex flex-col gap-2">
                            <a href="/cadastro" className="flex items-center justify-center gap-2 bg-white text-gray-900 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border border-gray-200 shadow-sm hover:border-blue-200 hover:text-blue-600 transition-all">
                                <UserPlus size={14} className="text-blue-600" /> Criar conta
                            </a>
                            <a href="/acesso-usuario" className="flex items-center justify-center gap-2 bg-white text-gray-900 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border border-gray-200 shadow-sm hover:border-blue-200 hover:text-blue-600 transition-all">
                                <KeyRound size={14} className="text-blue-600" /> Realizar login
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}