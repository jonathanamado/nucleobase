// app/condo/adm/cadastro_morador/page.tsx
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
    Smartphone,
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
    ArrowRight
} from "lucide-react";

interface Morador {
    id: string;
    unidade: string;
    tipo_morador?: string;
    role: string;
    user_id: string;
    acesso_app: boolean;
    profile: {
        nome_completo: string;
        email_contato: string;
        slug: string;
    };
}

export default function CadastroMoradorPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);

    // Controle de Login
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

    // Modal de Confirmação de Exclusão de Conta de Síndico via WhatsApp
    const [showSindicoDeleteModal, setShowSindicoDeleteModal] = useState(false);
    const [moradorParaExcluir, setMoradorParaExcluir] = useState<Morador | null>(null);

    // Modal de Aviso de E-mail Já Cadastrado na Nucleo
    const [showEmailDuplicadoModal, setShowEmailDuplicadoModal] = useState(false);
    const [emailDuplicadoInfo, setEmailDuplicadoInfo] = useState({ email: "", nome: "" });

    // Dados do Condomínio e Vínculo
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [moradores, setMoradores] = useState<Morador[]>([]);

    // Controle de acesso negado específico
    const [isApenasMorador, setIsApenasMorador] = useState(false);

    // Formulário para Adicionar Morador
    const [novoMoradorNome, setNovoMoradorNome] = useState("");
    const [novoMoradorEmail, setNovoMoradorEmail] = useState("");
    const [novoMoradorUnidade, setNovoMoradorUnidade] = useState("");
    const [tipoMorador, setTipoMorador] = useState<string>("proprietario");
    const [roleMorador, setRoleMorador] = useState<string>("morador");
    const [autorizadoApp, setAutorizadoApp] = useState(true);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");

    // Estado para Validação em Tempo Real do Nome/Slug Personalizado
    const [slugCustomizado, setSlugCustomizado] = useState("");
    const [slugDisponivel, setSlugDisponivel] = useState<boolean | null>(null);
    const [verificandoSlug, setVerificandoSlug] = useState(false);

    // Estado para Controle de Edição de Morador
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [editandoSemEmail, setEditandoSemEmail] = useState(false);

    // Estado para Feedback de Reset de Senha pelo Síndico
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState("");
    const [resetPasswordError, setResetPasswordError] = useState("");

    const isMountedRef = useRef(true);

    const formatarNomePrimeiroEUltimo = (nomeCompleto: string) => {
        if (!nomeCompleto) return "";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length <= 1) return partes[0] || "";
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    // Função para gerar o slug baseado diretamente no nome completo informado (sem o prefixo obrigatório "condo-")
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

    // Efeito para verificar disponibilidade do slug em tempo real ao digitar o nome
    useEffect(() => {
        if (editandoId) {
            setSlugDisponivel(true);
            return;
        }

        const base = gerarSlugBase(novoMoradorNome);
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

                if (!data || data.length === 0) {
                    setSlugDisponivel(true);
                } else {
                    setSlugDisponivel(false);
                }
            } catch (err) {
                console.error("Erro ao validar slug:", err);
                setSlugDisponivel(true);
            } finally {
                setVerificandoSlug(false);
            }
        };

        const timer = setTimeout(() => {
            if (novoMoradorNome.trim().length > 0) {
                verificarDisponibilidade();
            } else {
                setSlugDisponivel(null);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [novoMoradorNome, editandoId]);

    const loadMoradores = async (condoId: string) => {
        const { data, error } = await supabase
            .from("condominio_membros")
            .select(`
                id,
                unidade,
                tipo_morador,
                role,
                user_id,
                acesso_app,
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

            const { data: membroDataList, error: membroError } = await supabase
                .from("condominio_membros")
                .select("condominio_id, role, unidade, tipo_morador, acesso_app, condominio_nome")
                .eq("user_id", userId);

            if (membroError) {
                const errorMsg = membroError.message || JSON.stringify(membroError);
                if (!errorMsg.includes("AbortError") && !errorMsg.includes("Lock broken")) {
                    console.error("Erro na consulta Supabase (membros):", errorMsg);
                }
            }

            if (!membroDataList || membroDataList.length === 0) {
                if (isMountedRef.current) {
                    setIsApenasMorador(true);
                    setCondominio(null);
                    setLoading(false);
                }
                return;
            }

            const vinculoAdm = membroDataList.find(
                (m: any) => m.role === 'sindico'
            );

            if (!vinculoAdm) {
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
                setCondominio({
                    id: vinculoAdm.condominio_id,
                    nome: nomeCondominioOficial
                });
                await loadMoradores(vinculoAdm.condominio_id);
            }
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

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
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
        const [usuario, dominio] = email.split("@");
        if (dominio === "nucleobase.app" && !novoMoradorEmail) return "E-mail não cadastrado";
        if (usuario.length <= 1) return `*@${dominio}`;
        return `${usuario[0]}*****@${dominio}`;
    };

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
                    .select('email_contato, slug')
                    .eq('slug', inputAcesso)
                    .maybeSingle();

                if (profileError) throw profileError;
                if (!profile) {
                    setLoginError("ID de Síndico ou E-mail não localizado.");
                    setAuthLoading(false);
                    return;
                }
                emailParaLogin = profile.email_contato || `${profile.slug}@nucleobase.app`;
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

    const iniciarEdicao = (morador: Morador) => {
        setFormError("");
        setFormSuccess("");
        setResetPasswordSuccess("");
        setResetPasswordError("");
        setEditandoId(morador.id);
        setNovoMoradorNome(morador.profile?.nome_completo || "");

        const emailContato = morador.profile?.email_contato || "";
        const slugPerfil = morador.profile?.slug || "";
        const semEmail = !emailContato || emailContato === `${slugPerfil}@nucleobase.app` || emailContato.startsWith("pendente.morador.");

        setEditandoSemEmail(semEmail);
        setNovoMoradorEmail(semEmail ? "" : emailContato);

        let unidadeTratada = morador.unidade;
        if (unidadeTratada.trim().toLowerCase() === "administração") {
            unidadeTratada = "Adm";
        }
        setNovoMoradorUnidade(unidadeTratada);
        setTipoMorador(morador.tipo_morador || "proprietario");
        setRoleMorador(morador.role || "morador");
        setAutorizadoApp(morador.acesso_app);
        setSlugDisponivel(true);
    };

    const cancelarEdicao = () => {
        setEditandoId(null);
        setEditandoSemEmail(false);
        setNovoMoradorNome("");
        setNovoMoradorEmail("");
        setNovoMoradorUnidade("");
        setTipoMorador("proprietario");
        setRoleMorador("morador");
        setAutorizadoApp(true);
        setFormError("");
        setFormSuccess("");
        setResetPasswordSuccess("");
        setResetPasswordError("");
        setSlugCustomizado("");
        setSlugDisponivel(null);
    };

    const handleResetPasswordByAdmin = () => {
        if (!editandoId) return;
        const moradorAtual = moradores.find(m => m.id === editandoId);
        if (!moradorAtual) return;

        const nomeMorador = moradorAtual.profile?.nome_completo || "Morador";
        const unidadeMorador = moradorAtual.unidade || "Unidade";
        const nomeCondominio = condominio?.nome || "Condomínio";

        const mensagem = `Olá! Gostaria de solicitar a redefinição de senha para o padrão original para o morador ${nomeMorador} (Unidade: ${unidadeMorador}), do condomínio ${nomeCondominio}.`;
        const whatsappUrl = `https://wa.link/qbxg9f?text=${encodeURIComponent(mensagem)}`;

        window.open(whatsappUrl, '_blank');
        setResetPasswordSuccess("Solicitação de redefinição encaminhada via WhatsApp!");
    };

    const handleSaveForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!condominio) return;

        if (!editandoId && slugDisponivel === false) {
            setFormError("O ID (slug) gerado por este nome já está em uso. Por favor, adicione um sobrenome para revisão do identificador.");
            return;
        }

        setActionLoading(true);
        setFormError("");
        setFormSuccess("");

        try {
            const unidadeFinal = novoMoradorUnidade.trim().toLowerCase() === "administração" ? "Adm" : novoMoradorUnidade.trim();

            if (editandoId) {
                const { error: updateError } = await supabase
                    .from("condominio_membros")
                    .update({
                        unidade: unidadeFinal,
                        tipo_morador: tipoMorador,
                        role: roleMorador,
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

                setFormSuccess(`Sucesso! Os dados de ${formatarNomePrimeiroEUltimo(novoMoradorNome)} foram atualizados.`);
                setTimeout(() => {
                    cancelarEdicao();
                }, 1200);
            } else {
                const nomeFormatado = novoMoradorNome.trim();
                let emailFormatado = novoMoradorEmail.trim().toLowerCase();
                let targetUserId = null;
                let generatedSlug = slugCustomizado || gerarSlugBase(nomeFormatado);

                if (!emailFormatado) {
                    emailFormatado = `${generatedSlug}@nucleobase.app`;
                }

                if (!emailFormatado.endsWith("@nucleobase.app")) {
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
                    const tempPassword = "Condo123!";

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

                    if (signUpError) {
                        if (signUpError.message?.toLowerCase().includes("user already registered")) {
                            setEmailDuplicadoInfo({ email: emailFormatado, nome: nomeFormatado });
                            setShowEmailDuplicadoModal(true);
                            setActionLoading(false);
                            return;
                        }
                        throw signUpError;
                    }
                    if (!signUpData.user) throw new Error("Erro ao registrar credenciais de acesso.");

                    targetUserId = signUpData.user.id;

                    await supabase
                        .from("profiles")
                        .upsert({
                            id: targetUserId,
                            nome_completo: nomeFormatado,
                            email_contato: emailFormatado,
                            slug: generatedSlug,
                            plan_type: 'free'
                        });
                }

                const { error: insertError } = await supabase
                    .from("condominio_membros")
                    .insert([
                        {
                            condominio_id: condominio.id,
                            condominio_nome: condominio.nome,
                            user_id: targetUserId,
                            role: roleMorador,
                            unidade: unidadeFinal,
                            tipo_morador: tipoMorador,
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

                setFormSuccess(`Sucesso! ${formatarNomePrimeiroEUltimo(nomeFormatado)} foi registrado.`);
                setNovoMoradorNome("");
                setNovoMoradorEmail("");
                setNovoMoradorUnidade("");
                setTipoMorador("proprietario");
                setRoleMorador("morador");
                setAutorizadoApp(true);
                setSlugCustomizado("");
                setSlugDisponivel(null);
                setTimeout(() => {
                    setFormSuccess("");
                }, 1500);
            }

            await loadMoradores(condominio.id);
        } catch (err: any) {
            console.error("Erro no cadastro:", err);
            const errMsg = err?.message || JSON.stringify(err);
            if (errMsg.toLowerCase().includes("user already registered")) {
                setEmailDuplicadoInfo({ email: novoMoradorEmail.trim().toLowerCase(), nome: novoMoradorNome.trim() });
                setShowEmailDuplicadoModal(true);
            } else {
                setFormError(errMsg || "Ocorreu um erro ao processar a operação.");
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleWhatsAppEmailDuplicado = () => {
        const nomeMorador = emailDuplicadoInfo.nome || "Morador";
        const emailMorador = emailDuplicadoInfo.email || "E-mail";
        const nomeCondominio = condominio?.nome || "Condomínio";

        const mensagem = `Olá! Tentei cadastrar o morador ${nomeMorador} (${emailMorador}) no condomínio ${nomeCondominio}, mas o sistema indicou que o e-mail já possui cadastro prévio na Nucleo. Gostaria de solicitar a revisão e regularização deste cadastro.`;
        const whatsappUrl = `https://wa.link/qbxg9f?text=${encodeURIComponent(mensagem)}`;

        window.open(whatsappUrl, '_blank');
        setShowEmailDuplicadoModal(false);
    };

    const handleRemoveMorador = async (morador: Morador) => {
        const isProprioSindico = morador.role === 'sindico' || morador.user_id === session?.user?.id;

        if (isProprioSindico) {
            setMoradorParaExcluir(morador);
            setShowSindicoDeleteModal(true);
            return;
        }

        if (!confirm(`Deseja realmente revogar o acesso do morador ${morador.profile?.nome_completo || "selecionado"}?`)) return;

        setActionLoading(true);
        try {
            const { error } = await supabase
                .from("condominio_membros")
                .delete()
                .eq("id", morador.id);

            if (error) throw error;

            if (editandoId === morador.id) {
                cancelarEdicao();
            }

            if (condominio) {
                await loadMoradores(condominio.id);
            }
        } catch (err: any) {
            console.error("Erro ao remover morador:", err);
            alert("Erro ao remover o morador: " + (err?.message || "Erro desconhecido"));
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmarExclusaoSindicoWhatsApp = () => {
        if (!moradorParaExcluir) return;

        const nomeMorador = moradorParaExcluir.profile?.nome_completo || "Síndico";
        const unidadeMorador = moradorParaExcluir.unidade || "Unidade";
        const nomeCondominio = condominio?.nome || "Condomínio";

        const mensagem = `Olá! Gostaria de solicitar a exclusão da conta de síndico para ${nomeMorador} (Unidade: ${unidadeMorador}), do condomínio ${nomeCondominio}.`;
        const whatsappUrl = `https://wa.link/qbxg9f?text=${encodeURIComponent(mensagem)}`;

        window.open(whatsappUrl, '_blank');
        setShowSindicoDeleteModal(false);
        setMoradorParaExcluir(null);
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
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando módulo de cadastro...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-zinc-50/50 text-zinc-900 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Área da Administração</span>
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
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: antonio-trevas"
                                            value={firstAccessSlug}
                                            onChange={(e) => setFirstAccessSlug(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-xs font-mono font-bold text-gray-700 lowercase"
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
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-auto h-auto bg-blue-600 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0 self-stretch">
                                <UserPlus size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                    Controle de Moradores
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
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                                <ArrowLeft size={12} className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out" />
                                <span>Voltar</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="text-xs md:text-sm text-zinc-500 font-medium mb-6">
                    <span className="md:hidden">Gerencie o cadastro de novos condôminos e configure suas permissões de acesso.</span>
                    <span className="hidden md:inline">Gerencie o cadastro de novos condôminos, configure permissões digitais de acesso ao aplicativo e atualize dados cadastrais em ambiente exclusivo.</span>
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    {/* FORMULÁRIO DE CADASTRO / EDIÇÃO */}
                    <div className="bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 mb-4">
                                {editandoId ? <Pencil className="text-indigo-600" size={20} /> : <UserPlus className="text-blue-600" size={20} />}
                                <h2 className="font-bold text-base text-zinc-900">{editandoId ? "Editar Morador" : "Novo Cadastro"}</h2>
                            </div>

                            <form onSubmit={handleSaveForm} id="form-cadastro-morador" className="space-y-3.5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: João Alberto"
                                        required
                                        value={novoMoradorNome}
                                        onChange={(e) => setNovoMoradorNome(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium"
                                    />
                                    {/* Feedback de disponibilidade do ID gerado pelo nome */}
                                    {!editandoId && novoMoradorNome.trim().length > 0 && (
                                        <div className="mt-1 px-1 flex items-center gap-1.5 text-[10px] font-bold">
                                            {verificandoSlug ? (
                                                <span className="text-zinc-400 flex items-center gap-1">Verificando ID de usuário...</span>
                                            ) : slugDisponivel ? (
                                                <span className="text-emerald-600 flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> ID de usuário gerado ({slugCustomizado}) disponível
                                                </span>
                                            ) : (
                                                <span className="text-amber-600 flex items-center gap-1">
                                                    <ShieldAlert size={12} /> ID ({slugCustomizado}) em uso. Necessária revisão com sobrenome.
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
                                        E-mail Login {editandoSemEmail ? "(Bloqueado)" : "(Opcional)"}
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Ex: john@dominio.com"
                                        value={novoMoradorEmail}
                                        disabled={editandoSemEmail}
                                        onChange={(e) => setNovoMoradorEmail(e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl outline-none transition-all text-xs font-medium ${editandoSemEmail ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed select-none' : 'bg-zinc-50 border-zinc-200 focus:bg-white focus:border-blue-400'}`}
                                    />
                                    <span className="text-[10px] text-zinc-400 block px-1">
                                        Se preenchido, deve ser um e-mail válido. Se deixado em branco, será gerado acesso automático baseado no ID de usuário.
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Unidade</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Apto 102"
                                        required
                                        value={novoMoradorUnidade}
                                        onChange={(e) => setNovoMoradorUnidade(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Perfil de Acesso</label>
                                    <select
                                        value={roleMorador}
                                        onChange={(e) => setRoleMorador(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium cursor-pointer"
                                    >
                                        <option value="morador">Morador</option>
                                        <option value="sindico">Síndico</option>
                                        <option value="conselho">Conselho</option>
                                        <option value="contabilidade">Contabilidade</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Vínculo Condomínio</label>
                                    <select
                                        value={tipoMorador}
                                        onChange={(e) => setTipoMorador(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium cursor-pointer"
                                    >
                                        <option value="proprietario">Proprietário</option>
                                        <option value="inquilino">Inquilino</option>
                                        <option value="prestador_servico">Prestador de Serviço</option>
                                        <option value="outros">Outros</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Acesso APP</span>
                                        <span className="text-[10px] text-zinc-400 font-medium">Permissão digital do perfil</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAutorizadoApp(!autorizadoApp)}
                                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 outline-none cursor-pointer ${autorizadoApp ? 'bg-blue-600 justify-end' : 'bg-zinc-300 justify-start'}`}
                                    >
                                        <div className="bg-white w-4 h-4 rounded-full shadow-md transition-all"></div>
                                    </button>
                                </div>

                                {formError && <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">{formError}</p>}
                                {formSuccess && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2"><CheckCircle2 size={14} /> {formSuccess}</p>}
                            </form>
                        </div>

                        <div className="pt-4 mt-4 border-t border-zinc-100 space-y-2">
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    form="form-cadastro-morador"
                                    disabled={actionLoading || (!editandoId && slugDisponivel === false)}
                                    className={`flex-1 py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 text-white cursor-pointer ${editandoId ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50`}
                                >
                                    {actionLoading ? "Processando..." : editandoId ? "Salvar Alterações" : "Cadastrar Morador"}
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

                            {editandoId && (
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={handleResetPasswordByAdmin}
                                        disabled={actionLoading}
                                        className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                                    >
                                        <KeyRound size={14} /> Solicitar redefinição de senha (WhatsApp)
                                    </button>
                                    {resetPasswordError && <p className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 p-2 rounded-xl text-center">{resetPasswordError}</p>}
                                    {resetPasswordSuccess && <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2 rounded-xl flex items-center justify-center gap-1.5"><CheckCircle2 size={14} /> {resetPasswordSuccess}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LISTAGEM DE MORADORES */}
                    <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <Users className="text-blue-600" size={24} />
                                    <h2 className="font-bold text-lg text-zinc-900">Relação de Condôminos</h2>
                                </div>
                                <span className="hidden md:inline-block text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full">
                                    {moradores.length} Registros
                                </span>
                            </div>

                            {moradores.length === 0 ? (
                                <div className="text-center py-12 space-y-2">
                                    <p className="text-zinc-400 text-sm font-medium">Nenhum condômino cadastrado ainda.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto max-h-[500px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-white z-10">
                                            <tr className="border-b border-zinc-100">
                                                <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider bg-white">Apto / Vínculo</th>
                                                <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider bg-white">Nome / Contato</th>
                                                <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider hidden md:table-cell bg-white">App</th>
                                                <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right bg-white">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                            {moradores.map((morador) => {
                                                const emailContato = morador.profile?.email_contato || "";
                                                const slugPerfil = morador.profile?.slug || "";
                                                const isSemEmail = !emailContato || emailContato === `${slugPerfil}@nucleobase.app` || emailContato.startsWith("pendente.morador.");
                                                const nomeExibicaoOriginal = morador.profile?.nome_completo || "Sem Nome";
                                                const unidadeOriginal = morador.unidade || "";
                                                const tipoMoradorOriginal = morador.tipo_morador || "proprietario";

                                                let tipoFormatado = tipoMoradorOriginal;
                                                if (tipoMoradorOriginal === 'prestador_servico') tipoFormatado = 'Prestador de Serviço';
                                                else if (tipoMoradorOriginal === 'inquilino') tipoFormatado = 'Inquilino';
                                                else if (tipoMoradorOriginal === 'proprietario') tipoFormatado = 'Proprietário';
                                                else if (tipoMoradorOriginal === 'outros') tipoFormatado = 'Outros';

                                                const isAdm = unidadeOriginal.trim().toLowerCase() === "administração" || unidadeOriginal.trim().toLowerCase() === "adm";
                                                const nomeExibicaoFinal = formatarNomePrimeiroEUltimo(nomeExibicaoOriginal);

                                                return (
                                                    <tr key={morador.id} className={`group transition-colors ${editandoId === morador.id ? 'bg-indigo-50/30' : ''}`}>
                                                        <td className="py-3.5 align-top">
                                                            <div className="text-sm font-bold text-zinc-900">
                                                                {isAdm ? "Adm" : unidadeOriginal}
                                                            </div>
                                                            <div className="text-[10px] font-medium text-zinc-400 capitalize mt-0.5">
                                                                {tipoFormatado}
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 align-top">
                                                            <div className="text-sm font-bold text-zinc-800 leading-tight">
                                                                {nomeExibicaoFinal}
                                                            </div>
                                                            <div className="mt-1">
                                                                {isSemEmail ? (
                                                                    <div className="text-[10px] text-zinc-400 font-semibold tracking-wide">
                                                                        ID: {morador.profile?.slug}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-[10px] text-zinc-400 font-semibold tracking-wide">
                                                                        {mascararEmail(morador.profile?.email_contato)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 hidden md:table-cell align-top">
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
                                                        <td className="py-3.5 text-right align-top">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={() => iniciarEdicao(morador)}
                                                                    disabled={actionLoading}
                                                                    className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                                                                    title="Editar Cadastro"
                                                                >
                                                                    <Pencil size={15} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRemoveMorador(morador)}
                                                                    disabled={actionLoading}
                                                                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
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
                </div>
            </div>

            {/* MODAL DE AVISO DE E-MAIL JÁ CADASTRADO NA NUCLEO */}
            {showEmailDuplicadoModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 md:p-8 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowEmailDuplicadoModal(false)}
                            className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 mb-4">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                                <ShieldAlert size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-base text-zinc-900">E-mail já cadastrado</h2>
                                <p className="text-[11px] text-zinc-500">Aviso de cadastro prévio na Nucleo</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-zinc-600 leading-relaxed">
                                O e-mail <strong>{emailDuplicadoInfo.email}</strong> já possui um registro ativo na base global da Nucleo.
                            </p>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                                Para vincular este morador de forma correta e segura, por favor, solicite à central da Nucleo a revisão e alinhamento deste cadastro.
                            </p>

                            <button
                                onClick={handleWhatsAppEmailDuplicado}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition shadow-md shadow-emerald-100 flex items-center justify-center gap-2 cursor-pointer mt-2"
                            >
                                <span className="text-sm">💬</span> Solicitar Revisão via WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE CONTA DE SÍNDICO */}
            {showSindicoDeleteModal && moradorParaExcluir && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 md:p-8 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => {
                                setShowSindicoDeleteModal(false);
                                setMoradorParaExcluir(null);
                            }}
                            className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 mb-4">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                                <ShieldAlert size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-base text-zinc-900">Ação Protegida</h2>
                                <p className="text-[11px] text-zinc-500">Exclusão de Conta Principal (Síndico)</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-zinc-600 leading-relaxed">
                                Para evitar erros operacionais críticos, a própria conta de <strong>síndico</strong> não pode ser excluída diretamente por esta tela.
                            </p>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                                Ao confirmar, você será direcionado ao WhatsApp da central da Nucleo para solicitar o suporte necessário com a equipe técnica.
                            </p>

                            <button
                                onClick={handleConfirmarExclusaoSindicoWhatsApp}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition shadow-md shadow-emerald-100 flex items-center justify-center gap-2 cursor-pointer mt-2"
                            >
                                <span className="text-sm">💬</span> Falar com a Central Nucleo (WhatsApp)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}