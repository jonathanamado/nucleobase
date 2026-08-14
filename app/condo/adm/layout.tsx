// app/condo/adm/layout.tsx
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, ShieldAlert } from "lucide-react";
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
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-[2.5rem] text-center space-y-4 shadow-sm">
                    <div className="mx-auto w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-2">
                        <ShieldAlert size={24} />
                    </div>
                    <h1 className="text-xl font-black text-zinc-900">Área Restrita</h1>
                    <p className="text-sm text-zinc-500">
                        Seu perfil possui acesso restrito ao painel de condômino / dashboard e não possui permissão para acessar o painel administrativo (`/adm`).
                    </p>
                    <div className="pt-2">
                        <Link href="/condo/dashboard" className="inline-block bg-zinc-900 hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                            Voltar ao Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}