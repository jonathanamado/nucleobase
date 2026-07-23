// app/condo/dashboard/adm/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
    Users,
    UserPlus,
    Trash2,
    ShieldAlert,
    Loader2,
    Building2,
    CheckCircle2,
    Smartphone,
    Pencil,
    XCircle,
    ArrowLeft,
    Instagram,
    KeyRound,
    Rocket
} from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Morador {
    id: string;
    unidade: string;
    role: string;
    user_id: string;
    acesso_app: boolean;
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
    const [authLoading, setAuthLoading] = useState(false);

    // Controle de Login
    const [emailOrSlug, setEmailOrSlug] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    // Dados do Condomínio e Vínculo
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [moradores, setMoradores] = useState<Morador[]>([]);

    // Estados para criação automática de gestão pelo próprio usuário autenticado
    const [criandoGestao, setCriandoGestao] = useState(false);
    const [novoCondoNomeInput, setNovoCondoNomeInput] = useState("");
    const [novoCondoCnpjInput, setNovoCondoCnpjInput] = useState("");
    const [novaUnidadeSindicoInput, setNovaUnidadeSindicoInput] = useState("Administração");

    // Formulário para Adicionar Morador
    const [novoMoradorNome, setNovoMoradorNome] = useState("");
    const [novoMoradorEmail, setNovoMoradorEmail] = useState("");
    const [novoMoradorUnidade, setNovoMoradorUnidade] = useState("");
    const [autorizadoApp, setAutorizadoApp] = useState(true);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");

    // Estado para Controle de Edição de Morador
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [editandoNome, setEditandoNome] = useState("");
    const [editandoSemEmail, setEditandoSemEmail] = useState(false);

    // Verificação robusta unificada: Prioriza síndico, mas aceita vínculo ativo para evitar bloqueio cruzado
    const verifySindicoAndLoadData = async () => {
        try {
            setLoading(true);

            const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !currentSession) {
                setSession(null);
                setCondominio(null);
                setMoradores([]);
                setLoading(false);
                return;
            }

            setSession(currentSession);
            const userId = currentSession.user.id;

            // Busca vínculos ordenando por privilégio (sindico primeiro) e acesso liberado
            const { data: membroDataList, error: membroError } = await supabase
                .from("condominio_membros")
                .select(`
                    condominio_id,
                    role,
                    acesso_app,
                    condominio:condominios ( id, nome )
                `)
                .eq("user_id", userId)
                .order("role", { ascending: false }) // 'sindico' tem precedência sobre 'morador'
                .order("criado_em", { ascending: false })
                .limit(1);

            if (membroError) throw membroError;

            if (membroDataList && membroDataList.length > 0) {
                const membroData = membroDataList[0];
                if (membroData.condominio) {
                    const condoInfo = Array.isArray(membroData.condominio)
                        ? membroData.condominio[0]
                        : membroData.condominio;

                    setCondominio(condoInfo);
                    await loadMoradores(membroData.condominio_id);
                } else {
                    setCondominio(null);
                }
            } else {
                setCondominio(null);
            }
        } catch (e: any) {
            console.error("Erro ao verificar credenciais administrativas:", e);
            setCondominio(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifySindicoAndLoadData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                await verifySindicoAndLoadData();
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setCondominio(null);
                setMoradores([]);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const mascararEmail = (email: string) => {
        if (!email || !email.includes("@")) return email || "@user";
        if (email.startsWith("pendente.morador.")) return "E-mail não cadastrado";
        const [usuario, dominio] = email.split("@");
        if (usuario.length <= 1) return `*@${dominio}`;
        return `${usuario[0]}*****@${dominio}`;
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
                profile:profiles ( nome_completo, email_contato, slug )
            `)
            .eq("condominio_id", condoId)
            .order("unidade", { ascending: true });

        if (!error && data) {
            setMoradores(data as unknown as Morador[]);
        }
    };

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
            setLoginError("Acesso negado. Credenciais incorretas.");
            setAuthLoading(false);
            return;
        }

        if (data.session) {
            await verifySindicoAndLoadData();
        }
        setAuthLoading(false);
    };

    const handleIniciarGestaoPropria = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session || !session.user) return;

        setCriandoGestao(true);
        try {
            const nomeCondo = novoCondoNomeInput.trim() || "Meu Condomínio";
            const cnpjCondo = novoCondoCnpjInput.trim() || null;
            const unidadeGestor = novaUnidadeSindicoInput.trim() || "Administração";

            const { data: novoCondo, error: condoError } = await supabase
                .from("condominios")
                .insert([{ nome: nomeCondo, cnpj: cnpjCondo }])
                .select("id, nome")
                .single();

            if (condoError) throw condoError;

            if (novoCondo) {
                const { error: membroError } = await supabase
                    .from("condominio_membros")
                    .insert([
                        {
                            condominio_id: novoCondo.id,
                            user_id: session.user.id,
                            role: "sindico",
                            unidade: unidadeGestor,
                            acesso_app: true
                        }
                    ]);

                if (membroError) throw membroError;

                setCondominio({ id: novoCondo.id, nome: novoCondo.nome });
                await loadMoradores(novoCondo.id);
            }
        } catch (err: any) {
            console.error("Erro ao iniciar gestão própria:", err);
            alert("Não foi possível iniciar sua gestão: " + (err?.message || "Erro desconhecido"));
        } finally {
            setCriandoGestao(false);
        }
    };

    const iniciarEdicao = (morador: Morador) => {
        setFormError("");
        setFormSuccess("");
        setEditandoId(morador.id);
        setEditandoNome(morador.profile?.nome_completo || "Condômino");
        setNovoMoradorNome(morador.profile?.nome_completo || "");

        const emailContato = morador.profile?.email_contato || "";
        const semEmail = emailContato.startsWith("pendente.morador.");

        setEditandoSemEmail(semEmail);
        setNovoMoradorEmail(semEmail ? "Cadastro sem e-mail" : emailContato);
        setNovoMoradorUnidade(morador.unidade);
        setAutorizadoApp(morador.acesso_app);
    };

    const cancelarEdicao = () => {
        setEditandoId(null);
        setEditandoNome("");
        setEditandoSemEmail(false);
        setNovoMoradorNome("");
        setNovoMoradorEmail("");
        setNovoMoradorUnidade("");
        setAutorizadoApp(true);
        setFormError("");
        setFormSuccess("");
    };

    const handleSaveForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!condominio) return;

        setActionLoading(true);
        setFormError("");
        setFormSuccess("");

        try {
            if (editandoId) {
                const { error: updateError } = await supabase
                    .from("condominio_membros")
                    .update({
                        unidade: novoMoradorUnidade.trim(),
                        acesso_app: autorizadoApp
                    })
                    .eq("id", editandoId);

                if (updateError) throw updateError;

                const moradorAtual = moradores.find(m => m.id === editandoId);
                if (moradorAtual?.user_id) {
                    const camposUpdate: any = { nome_completo: novoMoradorNome.trim() };
                    if (!editandoSemEmail && novoMoradorEmail.trim()) {
                        camposUpdate.email_contato = novoMoradorEmail.trim().toLowerCase();
                    }

                    await supabase
                        .from("profiles")
                        .update(camposUpdate)
                        .eq("id", moradorAtual.user_id);
                }

                setFormSuccess(`Sucesso! Os dados de ${editandoNome} foram atualizados.`);
                cancelarEdicao();
            } else {
                const nomeFormatado = novoMoradorNome.trim();
                let emailFormatado = novoMoradorEmail.trim().toLowerCase();
                let targetUserId = null;
                let generatedSlug = "";

                const primeiroNome = nomeFormatado.split(" ")[0]
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]/g, "");

                const uuidFalso = Math.random().toString(36).substring(2, 7);
                if (!emailFormatado) {
                    emailFormatado = `pendente.morador.${uuidFalso}@nucleobase.app`;
                    generatedSlug = `condo-${primeiroNome}-${uuidFalso}`;
                } else {
                    generatedSlug = `user-${Math.random().toString(36).substring(2, 10)}`;
                }

                if (!emailFormatado.startsWith("pendente.morador.")) {
                    const { data: existingProfile } = await supabase
                        .from("profiles")
                        .select("id")
                        .eq("email_contato", emailFormatado)
                        .maybeSingle();

                    if (existingProfile) {
                        targetUserId = existingProfile.id;
                    }
                }

                if (!targetUserId) {
                    const tempSupabase = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                        { auth: { persistSession: false, autoRefreshToken: false } }
                    );

                    const tempPassword = "Condo" + Math.random().toString(36).substring(2, 10) + "!";
                    const { data: signUpData, error: signUpError } = await tempSupabase.auth.signUp({
                        email: emailFormatado,
                        password: tempPassword,
                        options: { data: { nome_completo: nomeFormatado } }
                    });

                    if (signUpError) throw signUpError;
                    if (!signUpData.user) throw new Error("Erro ao registrar credenciais.");

                    targetUserId = signUpData.user.id;
                    if (novoMoradorEmail.trim()) {
                        generatedSlug = `user-${targetUserId.substring(0, 8)}`;
                    }

                    await tempSupabase
                        .from("profiles")
                        .upsert({
                            id: targetUserId,
                            nome_completo: nomeFormatado,
                            email_contato: emailFormatado,
                            slug: generatedSlug
                        });
                }

                const { error: insertError } = await supabase
                    .from("condominio_membros")
                    .insert([
                        {
                            condominio_id: condominio.id,
                            user_id: targetUserId,
                            role: "morador",
                            unidade: novoMoradorUnidade.trim(),
                            acesso_app: autorizadoApp
                        }
                    ]);

                if (insertError) {
                    if (insertError.code === "23505") {
                        setFormError("Este morador já está cadastrado nesta unidade.");
                    } else {
                        throw insertError;
                    }
                    setActionLoading(false);
                    return;
                }

                setFormSuccess(`Sucesso! ${nomeFormatado} foi registrado.`);
                setNovoMoradorNome("");
                setNovoMoradorEmail("");
                setNovoMoradorUnidade("");
                setAutorizadoApp(true);
            }

            await loadMoradores(condominio.id);
        } catch (err: any) {
            console.error("Erro no cadastro:", err);
            setFormError(err?.message || "Ocorreu um erro ao processar a operação.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveMorador = async (membroId: string) => {
        if (!confirm("Deseja realmente revogar o acesso deste condômino?")) return;

        setActionLoading(true);
        const { error } = await supabase
            .from("condominio_membros")
            .delete()
            .eq("id", membroId);

        if (!error && condominio) {
            if (editandoId === membroId) cancelarEdicao();
            await loadMoradores(condominio.id);
        }
        setActionLoading(false);
    };

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
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
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Área da Administração</span>
                        <h1 className="text-2xl font-black tracking-tight">Login do Síndico</h1>
                        <p className="text-xs text-zinc-500">Faça login com suas credenciais de síndico.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">E-mail ou ID de Síndico</label>
                            <input
                                type="text"
                                placeholder="Exemplo: joao-sindico"
                                required
                                className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-medium"
                                onChange={(e) => setEmailOrSlug(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Senha</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-medium"
                                onChange={(e) => setPassword(e.target.value)}
                            />
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
                            {authLoading ? "Acessando..." : "Entrar como Síndico"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (session && !condominio) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-lg bg-white border border-zinc-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Building2 size={32} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-xl font-black tracking-tight">Gestão de Condomínio</h1>
                        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                            O seu perfil <span className="font-bold text-zinc-800">{session.user.email}</span> ainda não está vinculado a uma administração ativa. Cadastre os dados abaixo para habilitar seu acesso como Síndico.
                        </p>
                    </div>

                    <form onSubmit={handleIniciarGestaoPropria} className="space-y-3 text-left">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Nome do Condomínio / Edifício</label>
                            <input
                                type="text"
                                placeholder="Ex: Residencial Bela Vista"
                                required
                                value={novoCondoNomeInput}
                                onChange={(e) => setNovoCondoNomeInput(e.target.value)}
                                className="w-full px-5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-medium"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">CNPJ do Condomínio (Opcional)</label>
                            <input
                                type="text"
                                placeholder="00.000.000/0000-00"
                                value={novoCondoCnpjInput}
                                onChange={(e) => setNovoCondoCnpjInput(e.target.value)}
                                className="w-full px-5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-medium"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Unidade / Identificação do Gestor</label>
                            <input
                                type="text"
                                placeholder="Ex: Administração ou Apto 101"
                                required
                                value={novaUnidadeSindicoInput}
                                onChange={(e) => setNovaUnidadeSindicoInput(e.target.value)}
                                className="w-full px-5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-medium"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={criandoGestao}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 transition-all"
                            >
                                {criandoGestao ? <Loader2 className="animate-spin" size={16} /> : <Rocket size={16} />}
                                {criandoGestao ? "Configurando Gestão..." : "Iniciar Gestão na Nucleobase"}
                            </button>
                        </div>
                    </form>

                    <div className="pt-4 border-t border-zinc-100 flex gap-4">
                        <button onClick={handleLogout} className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-3 rounded-xl font-bold text-xs transition-colors">
                            Trocar de Conta
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6 mb-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Painel do Síndico - Controle de cadastro e acesso</span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">{condominio?.nome}</h1>
                        </div>
                    </div>

                    <button
                        onClick={() => window.history.back()}
                        className="group relative flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 self-start md:self-auto overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                        <ArrowLeft size={12} className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out" />
                        <span>Voltar</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl items-start">
                <div className="bg-white border border-zinc-150 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between h-auto lg:h-[510px]">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                            <div className="flex items-center gap-3">
                                {editandoId ? <Pencil className="text-indigo-600 animate-pulse" size={24} /> : <UserPlus className="text-blue-600" size={24} />}
                                <h2 className="font-bold text-lg">{editandoId ? "Editar" : "Cadastro Morador"}</h2>
                            </div>
                            {editandoId && (
                                <button onClick={cancelarEdicao} className="text-zinc-400 hover:text-zinc-600 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider">
                                    <XCircle size={14} /> Cancelar
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSaveForm} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Nome Completo</label>
                                <input
                                    type="text"
                                    placeholder="Ex: João da Silva"
                                    required
                                    value={novoMoradorNome}
                                    onChange={(e) => setNovoMoradorNome(e.target.value)}
                                    className="w-full px-5 py-2 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">E-mail Login {editandoSemEmail ? "(Bloqueado)" : "(Opcional)"}</label>
                                <input
                                    type="text"
                                    placeholder="Ex: john@dominio.com"
                                    value={novoMoradorEmail}
                                    disabled={editandoSemEmail}
                                    onChange={(e) => setNovoMoradorEmail(e.target.value)}
                                    className={`w-full px-5 py-2 border rounded-2xl outline-none transition-all text-sm font-medium ${editandoSemEmail ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed select-none' : 'bg-zinc-50 border-zinc-200 focus:bg-white focus:border-blue-400'}`}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Unidade</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Apto 102"
                                    required
                                    value={novoMoradorUnidade}
                                    onChange={(e) => setNovoMoradorUnidade(e.target.value)}
                                    className="w-full px-5 py-2 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="flex items-center justify-between bg-zinc-50/50 border border-zinc-100 p-2.5 rounded-2xl transition-all">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-zinc-800 uppercase tracking-wide">Acesso APP</span>
                                    <span className="text-[9px] text-zinc-400 font-medium">Permissão digital do perfil</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAutorizadoApp(!autorizadoApp)}
                                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 outline-none ${autorizadoApp ? 'bg-blue-600 justify-end' : 'bg-zinc-200 justify-start'}`}
                                >
                                    <div className="bg-white w-4 h-4 rounded-full shadow-md transition-all"></div>
                                </button>
                            </div>

                            {formError && <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-2 rounded-xl">{formError}</p>}
                            {formSuccess && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2 rounded-xl flex items-center gap-2"><CheckCircle2 size={16} /> {formSuccess}</p>}
                        </form>
                    </div>

                    <div className="pt-3 lg:pt-0">
                        <button
                            onClick={handleSaveForm}
                            disabled={actionLoading}
                            className={`w-full py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:bg-zinc-300 text-white ${editandoId ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/10' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {actionLoading ? "Processando..." : editandoId ? "Salvar Alterações" : "Autorizar Acesso"}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white border border-zinc-150 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col h-auto lg:h-[510px]">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <Users className="text-blue-600" size={24} />
                            <h2 className="font-bold text-lg">Moradores Vinculados</h2>
                        </div>
                        <span className="text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full">
                            {moradores.length} Usuário(s)
                        </span>
                    </div>

                    {moradores.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-2">
                            <p className="text-zinc-400 text-sm font-medium">Nenhum condômino cadastrado ainda.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto mt-4 pr-2 scrollbar-thin">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-15">
                                    <tr className="border-b border-zinc-100 bg-white">
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider bg-white">Unidade</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider bg-white">Nome do Morador</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider hidden md:table-cell bg-white">App</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right bg-white">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {moradores.map((morador) => {
                                        const isSemEmail = morador.profile?.email_contato?.startsWith("pendente.morador.");
                                        return (
                                            <tr key={morador.id} className={`group transition-colors ${editandoId === morador.id ? 'bg-indigo-50/30' : ''}`}>
                                                <td className="py-3 text-sm font-bold text-zinc-900">{morador.unidade}</td>
                                                <td className="py-3">
                                                    <div className="text-sm font-bold text-zinc-800 leading-tight">
                                                        {morador.profile?.nome_completo || "Sem Nome"}
                                                    </div>
                                                    <div className="mt-1">
                                                        {isSemEmail ? (
                                                            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-md shadow-sm">
                                                                <KeyRound size={10} className="text-amber-500" />
                                                                Id: <span className="font-mono bg-amber-100/70 px-1 rounded select-all">{morador.profile?.slug}</span>
                                                            </span>
                                                        ) : (
                                                            <div className="text-[9px] text-zinc-400 font-semibold tracking-wide">
                                                                {mascararEmail(morador.profile?.email_contato)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 hidden md:table-cell">
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
                                                <td className="py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => iniciarEdicao(morador)}
                                                            disabled={actionLoading}
                                                            className={`p-2 rounded-xl transition-all ${editandoId === morador.id ? 'text-indigo-600 bg-indigo-50' : 'text-zinc-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                                            title="Editar Cadastro"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveMorador(morador.id)}
                                                            disabled={actionLoading}
                                                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Revogar Acesso"
                                                        >
                                                            <Trash2 size={15} />
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