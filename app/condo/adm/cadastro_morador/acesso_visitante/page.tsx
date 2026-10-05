// app/condo/adm/cadastro_morador/acesso_visitante/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
    Users,
    UserPlus,
    Trash2,
    ShieldAlert,
    Loader2,
    CheckCircle2,
    Pencil,
    ArrowLeft,
    Instagram,
    Lock,
    KeyRound,
    X,
    Key,
    AtSign,
    Eye,
    EyeOff,
    LifeBuoy,
    Mail,
    ArrowRight,
    CalendarClock,
    Clock
} from "lucide-react";

interface Visitante {
    id: string;
    unidade: string;
    placa?: string | null;
    tipo_morador?: string | null;
    role: string;
    user_id: string;
    acesso_app: boolean;
    data_inicio: string | null;
    data_fim: string | null;
    criado_em?: string;
    profile?: {
        nome_completo: string;
        email_contato: string;
        slug: string;
    } | null;
}

export default function AcessoVisitantePage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);

    // Controle de Login
    const [emailOrSlug, setEmailOrSlug] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");

    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    const [showFirstAccessModal, setShowFirstAccessModal] = useState(false);
    const [firstAccessSlug, setFirstAccessSlug] = useState("");
    const [firstAccessLoading, setFirstAccessLoading] = useState(false);

    // Dados
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [visitantes, setVisitantes] = useState<Visitante[]>([]);
    const [isApenasMorador, setIsApenasMorador] = useState(false);

    // Formulário
    const [novoNome, setNovoNome] = useState("");
    const [novoEmail, setNovoEmail] = useState("");
    const [novaUnidade, setNovaUnidade] = useState("");
    const [novaPlaca, setNovaPlaca] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [tipoVisitante, setTipoVisitante] = useState<string>("visitante"); // 'visitante', 'prestador_servico' ou 'outros'
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");

    const [slugCustomizado, setSlugCustomizado] = useState("");
    const [slugDisponivel, setSlugDisponivel] = useState<boolean | null>(null);
    const [verificandoSlug, setVerificandoSlug] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);

    const isMountedRef = useRef(true);

    const formatarNomePrimeiroEUltimo = (nomeCompleto: string) => {
        if (!nomeCompleto) return "";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length <= 1) return partes[0] || "";
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    const gerarSlugBase = (nome: string) => {
        const slugFormatado = nome.trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
        return slugFormatado;
    };

    useEffect(() => {
        if (editandoId) {
            setSlugDisponivel(true);
            return;
        }

        const base = gerarSlugBase(novoNome);
        if (!base) {
            setSlugCustomizado("");
            setSlugDisponivel(null);
            return;
        }

        const slugCompleto = base;
        setSlugCustomizado(slugCompleto);

        const verificarDisponibilidade = async () => {
            setVerificandoSlug(true);
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("slug")
                    .eq("slug", slugCompleto);

                if (error) throw error;
                setSlugDisponivel(!data || data.length === 0);
            } catch (err) {
                console.error("Erro ao validar slug:", err);
                setSlugDisponivel(true);
            } finally {
                setVerificandoSlug(false);
            }
        };

        const timer = setTimeout(() => {
            if (novoNome.trim().length > 0) {
                verificarDisponibilidade();
            } else {
                setSlugDisponivel(null);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [novoNome, editandoId]);

    const loadVisitantes = async (condoId: string) => {
        const { data, error } = await supabase
            .from("condominio_membros")
            .select(`
                id,
                unidade,
                placa,
                tipo_morador,
                role,
                user_id,
                acesso_app,
                data_inicio,
                data_fim,
                criado_em,
                profile:profiles ( nome_completo, email_contato, slug )
            `)
            .eq("condominio_id", condoId)
            .eq("role", "visitante") // Filtro exclusivo para listar apenas os visitantes
            .order("criado_em", { ascending: false }); // Ordenado por criado_em garante que novos fiquem no topo

        if (!error && data && isMountedRef.current) {
            setVisitantes(data as unknown as Visitante[]);
        }
    };

    const verifySindicoAndLoadData = async (currentSession: any) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null); setCondominio(null); setIsApenasMorador(false); setVisitantes([]); setLoading(false);
                }
                return;
            }

            if (isMountedRef.current) setSession(currentSession);
            const userId = currentSession.user.id;

            const { data: membroDataList } = await supabase
                .from("condominio_membros")
                .select("condominio_id, role, condominio_nome")
                .eq("user_id", userId);

            if (!membroDataList || membroDataList.length === 0) {
                if (isMountedRef.current) { setIsApenasMorador(true); setLoading(false); }
                return;
            }

            const vinculoAdm = membroDataList.find((m: any) => m.role === 'sindico' || m.role === 'portaria');

            if (!vinculoAdm) {
                if (isMountedRef.current) { setIsApenasMorador(true); setLoading(false); }
                return;
            }

            let nomeCondominioOficial = vinculoAdm.condominio_nome || "Condomínio";
            if (vinculoAdm.condominio_id) {
                const { data: condoDataReal } = await supabase.from("condominios").select("nome").eq("id", vinculoAdm.condominio_id).maybeSingle();
                if (condoDataReal && condoDataReal.nome) nomeCondominioOficial = condoDataReal.nome;
            }

            if (isMountedRef.current) {
                setIsApenasMorador(false);
                setCondominio({ id: vinculoAdm.condominio_id, nome: nomeCondominioOficial });
                await loadVisitantes(vinculoAdm.condominio_id);
            }
        } catch (e: any) {
            console.warn("Exceção tratada:", e?.message);
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        let authSub: any = null;

        const initAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                if (currentSession && isMountedRef.current) {
                    await verifySindicoAndLoadData(currentSession);
                } else {
                    setLoading(false);
                }
            } catch (err: any) {
                if (isMountedRef.current) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!isMountedRef.current) return;
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                if (currentSession) await verifySindicoAndLoadData(currentSession);
            } else if (event === 'SIGNED_OUT') {
                setSession(null); setCondominio(null); setIsApenasMorador(false); setVisitantes([]); setLoading(false);
            }
        });
        authSub = subscription;

        return () => { isMountedRef.current = false; if (authSub) authSub.unsubscribe(); };
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true); setLoginError("");
        const inputAcesso = emailOrSlug.trim().toLowerCase();
        try {
            let emailParaLogin = inputAcesso;
            if (!inputAcesso.includes("@")) {
                const { data: profile } = await supabase.from('profiles').select('email_contato, slug').eq('slug', inputAcesso).maybeSingle();
                if (!profile) { setLoginError("Credencial não localizada."); setAuthLoading(false); return; }
                emailParaLogin = profile.email_contato || `${profile.slug}@nucleobase.app`;
            }
            const { data, error } = await supabase.auth.signInWithPassword({ email: emailParaLogin, password });
            if (error || !data.session) { setLoginError("Acesso negado."); return; }
            await verifySindicoAndLoadData(data.session);
        } catch (err) { setLoginError("Erro inesperado."); } finally { setAuthLoading(false); }
    };

    const iniciarEdicao = (visitante: Visitante) => {
        setFormError(""); setFormSuccess("");
        setEditandoId(visitante.id);
        setNovoNome(visitante.profile?.nome_completo || "");

        const emailContato = visitante.profile?.email_contato || "";
        const isEmailFicticio = !emailContato || emailContato.endsWith("@nucleobase.app");
        setNovoEmail(isEmailFicticio ? "" : emailContato);

        setNovaUnidade(visitante.unidade);
        setNovaPlaca(visitante.placa || "");
        setDataInicio(visitante.data_inicio ? visitante.data_inicio.split("T")[0] : "");
        setDataFim(visitante.data_fim ? visitante.data_fim.split("T")[0] : "");
        setTipoVisitante(visitante.tipo_morador || "visitante");
        setSlugDisponivel(true);
    };

    const cancelarEdicao = () => {
        setEditandoId(null);
        setNovoNome(""); setNovoEmail(""); setNovaUnidade(""); setNovaPlaca("");
        setDataInicio(""); setDataFim(""); setTipoVisitante("visitante");
        setFormError(""); setFormSuccess(""); setSlugCustomizado(""); setSlugDisponivel(null);
    };

    const handleSaveForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!condominio) return;

        if (!dataInicio || !dataFim) {
            setFormError("Data de Início e Data Fim são obrigatórias para visitantes.");
            return;
        }

        if (new Date(dataFim) < new Date(dataInicio)) {
            setFormError("A Data Fim não pode ser anterior à Data de Início.");
            return;
        }

        if (!editandoId && slugDisponivel === false) {
            setFormError("O ID gerado já está em uso. Por favor, adicione um sobrenome.");
            return;
        }

        setActionLoading(true); setFormError(""); setFormSuccess("");

        try {
            const unidadeFinal = novaUnidade.trim();

            if (editandoId) {
                const { error: updateError } = await supabase
                    .from("condominio_membros")
                    .update({
                        unidade: unidadeFinal,
                        placa: novaPlaca.trim() || null,
                        tipo_morador: tipoVisitante,
                        data_inicio: dataInicio,
                        data_fim: dataFim
                    })
                    .eq("id", editandoId);

                if (updateError) throw updateError;

                const visitanteAtual = visitantes.find(v => v.id === editandoId);
                if (visitanteAtual?.user_id) {
                    const camposUpdate: any = { nome_completo: novoNome.trim() };
                    if (novoEmail.trim()) camposUpdate.email_contato = novoEmail.trim().toLowerCase();
                    await supabase.from("profiles").update(camposUpdate).eq("id", visitanteAtual.user_id);
                }

                setFormSuccess("Autorização atualizada com sucesso!");
                setTimeout(() => cancelarEdicao(), 1200);
            } else {
                const nomeFormatado = novoNome.trim();
                let emailFormatado = novoEmail.trim().toLowerCase();
                let generatedSlug = slugCustomizado || gerarSlugBase(nomeFormatado);

                if (!emailFormatado) emailFormatado = `${generatedSlug}@nucleobase.app`;

                const tempPassword = "Visitante123!";
                const isolatedSupabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
                );

                const { data: signUpData, error: signUpError } = await isolatedSupabase.auth.signUp({
                    email: emailFormatado,
                    password: tempPassword,
                    options: { data: { nome_completo: nomeFormatado } }
                });

                if (signUpError && !signUpError.message?.toLowerCase().includes("user already registered")) {
                    throw signUpError;
                }

                let targetUserId = signUpData.user?.id;

                // Fallback robusto para garantir que o ID foi gerado/localizado, prevenindo falha silenciosa
                if (!targetUserId) {
                    const profileRes = await supabase.from("profiles").select("id").eq("email_contato", emailFormatado).maybeSingle();
                    targetUserId = profileRes.data?.id;
                }

                if (!targetUserId) {
                    throw new Error("Não foi possível gerar ou localizar a credencial de acesso para este visitante.");
                }

                await supabase.rpc('admin_upsert_profile', {
                    p_user_id: targetUserId,
                    p_nome_completo: nomeFormatado,
                    p_email_contato: emailFormatado,
                    p_slug: generatedSlug,
                    p_plan_type: 'free'
                });

                const { error: insertError } = await supabase
                    .from("condominio_membros")
                    .insert([{
                        condominio_id: condominio.id,
                        condominio_nome: condominio.nome,
                        user_id: targetUserId,
                        role: 'visitante',
                        unidade: unidadeFinal,
                        placa: novaPlaca.trim() || null,
                        tipo_morador: tipoVisitante,
                        acesso_app: false,
                        data_inicio: dataInicio,
                        data_fim: dataFim
                    }]);

                if (insertError) throw insertError;

                setFormSuccess("Visitante autorizado com sucesso!");
                setTimeout(() => cancelarEdicao(), 1500);
            }

            await loadVisitantes(condominio.id);
        } catch (err: any) {
            setFormError(err?.message || "Ocorreu um erro ao processar a operação.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveVisitante = async (visitante: Visitante) => {
        if (!confirm(`Deseja realmente revogar e excluir a autorização de ${visitante.profile?.nome_completo || "selecionado"}?`)) return;
        setActionLoading(true);
        try {
            await supabase.from("condominio_membros").delete().eq("id", visitante.id);
            if (editandoId === visitante.id) cancelarEdicao();
            if (condominio) await loadVisitantes(condominio.id);
        } catch (err) {
            alert("Erro ao remover: " + err);
        } finally {
            setActionLoading(false);
        }
    };

    // Função auxiliar para formatação segura de data vinda do DB, prevenindo exibir "1970"
    const formatarData = (dataStr?: string | null) => {
        if (!dataStr) return '--';
        const partes = dataStr.split('T')[0].split('-');
        if (partes.length !== 3) return dataStr;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    };

    // Tratamento de Timezone rígido para evitar status falso no Brasil
    const getStatusAutorizacao = (inicio?: string | null, fim?: string | null) => {
        if (!inicio || !fim) return { label: "Indefinido", color: "bg-zinc-100 text-zinc-500" };

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const [anoIn, mesIn, diaIn] = inicio.split('T')[0].split('-').map(Number);
        const dataIn = new Date(anoIn, mesIn - 1, diaIn, 0, 0, 0);

        const [anoOut, mesOut, diaOut] = fim.split('T')[0].split('-').map(Number);
        const dataOut = new Date(anoOut, mesOut - 1, diaOut, 23, 59, 59, 999);

        if (hoje < dataIn) return { label: "Agendado", color: "bg-blue-50 text-blue-600 border-blue-100" };
        if (hoje > dataOut) return { label: "Expirado", color: "bg-red-50 text-red-600 border-red-100" };
        return { label: "Vigente", color: "bg-emerald-50 text-emerald-600 border-emerald-100" };
    };

    const handleLogout = async () => { /* ... Identico ... */ };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando portaria...</p>
            </div>
        );
    }

    if (!session || isApenasMorador) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <ShieldAlert size={40} className="text-red-500 mx-auto" />
                <h1 className="text-xl font-black">Acesso Restrito</h1>
                <p className="text-sm text-zinc-500 max-w-sm">Esta área exige credenciais de administração ou portaria.</p>
                <Link href="/condo/adm" className="bg-zinc-900 text-white px-6 py-3 rounded-xl text-xs font-bold mt-4">
                    Voltar para o Painel
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-4 md:p-10 flex flex-col justify-between">
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-auto h-auto bg-amber-500 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0 self-stretch">
                                <CalendarClock size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                                    Controle de Visitantes e Terceiros
                                </span>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5">
                                    <span className="md:hidden text-black">{formatarNomePrimeiroEUltimo(condominio?.nome || "")}</span>
                                    <span className="hidden md:inline">{condominio?.nome}</span>
                                </h1>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/condo/adm/cadastro_morador"
                                className="group relative flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 overflow-hidden shrink-0 cursor-pointer"
                            >
                                <ArrowLeft size={12} className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out" />
                                <span>Voltar a Moradores</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="text-xs md:text-sm text-zinc-500 font-medium mb-6 max-w-3xl">
                    Cadastre prestadores de serviço temporários, parentes ou visitantes rotineiros. Determine o período exato de liberação que a portaria irá visualizar para liberar a entrada.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    {/* FORMULÁRIO */}
                    <div className="bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 mb-4">
                                {editandoId ? <Pencil className="text-indigo-600" size={20} /> : <UserPlus className="text-amber-500" size={20} />}
                                <h2 className="font-bold text-base text-zinc-900">{editandoId ? "Editar Autorização" : "Nova Autorização"}</h2>
                            </div>

                            <form onSubmit={handleSaveForm} id="form-visitante" className="space-y-3.5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Carlos Silva"
                                        required
                                        value={novoNome}
                                        onChange={(e) => setNovoNome(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-amber-400 transition-all text-xs font-medium"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
                                        E-mail <span className="text-zinc-300 normal-case tracking-normal">(Opcional - Envio de Passe)</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Ex: carlos@email.com"
                                        value={novoEmail}
                                        onChange={(e) => setNovoEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-amber-400 transition-all text-xs font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Destino (Unidade)</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Apto 102"
                                            required
                                            value={novaUnidade}
                                            onChange={(e) => setNovaUnidade(e.target.value)}
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-amber-400 transition-all text-xs font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Veículo (Placa)</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: ABC-1234"
                                            value={novaPlaca}
                                            onChange={(e) => setNovaPlaca(e.target.value)}
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-amber-400 transition-all text-xs font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1 text-amber-600">Data Início *</label>
                                        <input
                                            type="date"
                                            required
                                            value={dataInicio}
                                            onChange={(e) => setDataInicio(e.target.value)}
                                            className="w-full px-3 py-3 bg-amber-50/30 border border-amber-200/50 rounded-xl outline-none focus:bg-white focus:border-amber-400 transition-all text-xs font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1 text-amber-600">Data Fim *</label>
                                        <input
                                            type="date"
                                            required
                                            value={dataFim}
                                            onChange={(e) => setDataFim(e.target.value)}
                                            className="w-full px-3 py-3 bg-amber-50/30 border border-amber-200/50 rounded-xl outline-none focus:bg-white focus:border-amber-400 transition-all text-xs font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Categoria</label>
                                    <select
                                        value={tipoVisitante}
                                        onChange={(e) => setTipoVisitante(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-amber-400 transition-all text-xs font-medium cursor-pointer"
                                    >
                                        <option value="visitante">Visitante / Parente</option>
                                        <option value="prestador_servico">Prestador de Serviço</option>
                                        <option value="outros">Outros</option>
                                    </select>
                                </div>

                                {/* O Visitor não tem Acesso ao APP, então removemos o Toggle visual para evitar confusões */}
                                <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl opacity-70">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Acesso APP</span>
                                        <span className="text-[10px] text-zinc-500 font-medium">Desabilitado para Visitantes</span>
                                    </div>
                                    <div className="w-11 h-6 flex items-center justify-start rounded-full p-1 bg-zinc-300">
                                        <div className="bg-white/80 w-4 h-4 rounded-full shadow-sm"></div>
                                    </div>
                                </div>

                                {formError && <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">{formError}</p>}
                                {formSuccess && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2"><CheckCircle2 size={14} /> {formSuccess}</p>}
                            </form>
                        </div>

                        <div className="pt-4 mt-4 border-t border-zinc-100 space-y-2">
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    form="form-visitante"
                                    disabled={actionLoading || (!editandoId && slugDisponivel === false)}
                                    className={`flex-1 py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 text-white cursor-pointer ${editandoId ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10' : 'bg-amber-500 hover:bg-amber-600'} disabled:opacity-50`}
                                >
                                    {actionLoading ? "Processando..." : editandoId ? "Salvar Alterações" : "Autorizar Acesso"}
                                </button>
                                {editandoId && (
                                    <button
                                        type="button"
                                        onClick={cancelarEdicao}
                                        className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-4 py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* LISTAGEM DE VISITANTES */}
                    <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <Users className="text-amber-500" size={24} />
                                    <h2 className="font-bold text-lg text-zinc-900">Autorizações Ativas e Agendadas</h2>
                                </div>
                                <span className="hidden md:inline-block text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full">
                                    {visitantes.length} Registros
                                </span>
                            </div>

                            {visitantes.length === 0 ? (
                                <div className="text-center py-12 space-y-2">
                                    <p className="text-zinc-400 text-sm font-medium">Nenhuma autorização temporária cadastrada.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto max-h-[500px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-white z-10">
                                            <tr className="border-b border-zinc-100">
                                                <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider bg-white">Destino / Placa</th>
                                                <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider bg-white">Nome do Visitante</th>
                                                <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider hidden md:table-cell bg-white text-center">Período Liberado</th>
                                                <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right bg-white">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                            {visitantes.map((visitante) => {
                                                const nomeExibicao = formatarNomePrimeiroEUltimo(visitante.profile?.nome_completo || "Sem Nome");
                                                const email = visitante.profile?.email_contato || "";
                                                const isSemEmail = !email || email.endsWith("@nucleobase.app");
                                                const status = getStatusAutorizacao(visitante.data_inicio, visitante.data_fim);

                                                return (
                                                    <tr key={visitante.id} className={`group transition-colors ${editandoId === visitante.id ? 'bg-indigo-50/30' : ''}`}>
                                                        <td className="py-3.5 align-top">
                                                            <div className="text-sm font-bold text-zinc-900">
                                                                {visitante.unidade}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-amber-600 mt-0.5">
                                                                {visitante.placa || "Sem Veículo"}
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 align-top">
                                                            <div className="text-sm font-bold text-zinc-800 leading-tight">
                                                                {nomeExibicao}
                                                            </div>
                                                            <div className="text-[10px] text-zinc-400 font-semibold tracking-wide mt-1">
                                                                {isSemEmail ? (visitante.tipo_morador === "prestador_servico" ? "Prestador de Serviço" : "Visitante") : email}
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 hidden md:table-cell align-top text-center">
                                                            <div className="flex flex-col items-center justify-center gap-1">
                                                                <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${status.color}`}>
                                                                    <Clock size={10} /> {status.label}
                                                                </span>
                                                                <div className="text-[9px] font-medium text-zinc-400 mt-0.5 tracking-wider">
                                                                    {formatarData(visitante.data_inicio)} até {formatarData(visitante.data_fim)}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 text-right align-top">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={() => iniciarEdicao(visitante)}
                                                                    disabled={actionLoading}
                                                                    className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                                                                    title="Editar Autorização"
                                                                >
                                                                    <Pencil size={15} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRemoveVisitante(visitante)}
                                                                    disabled={actionLoading}
                                                                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                                                    title="Revogar Autorização"
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
                </div>
            </div>

            {/* O footer "Conecte-se" foi mantido igual as demais páginas */}
            <div className="mt-24">
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <div className="flex flex-col items-center text-center pb-10">
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