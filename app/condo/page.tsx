// app/condo/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLoginProtegido } from "@/hooks/useLoginProtegido";
import {
    ShieldCheck,
    Zap,
    LockKeyhole,
    Users,
    ArrowUpRight,
    Instagram,
    UserPlus,
    UserCircle,
    FileText,
    CalendarDays,
    Vote,
    Building2,
    X,
    Sparkles,
    Layers,
    AtSign,
    Key,
    Eye,
    EyeOff,
    Mail,
    MessageCircle
} from "lucide-react";

export default function NucleobaseCondo() {
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

    // Verificação síncrona otimista para eliminar delay de carregamento (Zero flash)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                let logged = false;
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith("sb-") && key.includes("-auth-token")) {
                        logged = true;
                        break;
                    }
                }
                setIsLoggedIn(logged);
            } catch {
                setIsLoggedIn(false);
            }
        }
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Método de contato escolhido no modal de demonstração
    const [metodoContato, setMetodoContato] = useState<"whatsapp" | "email">("whatsapp");
    const formRef = useRef<HTMLFormElement>(null);

    // Estado para controlar o índice do carrossel vivo
    const [cardAtivoIndex, setCardAtivoIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Estados do Formulário de Agendamento de Demonstração
    const [demoNome, setDemoNome] = useState("");
    const [demoEmail, setDemoEmail] = useState("");
    const [demoTelefone, setDemoTelefone] = useState("");
    const [demoCondo, setDemoCondo] = useState("");

    const whatsappAdminPhone = "5531971078832";

    const pilares = [
        {
            title: "Transparência",
            desc: "Contas claras para todos.",
            fullDesc: "Reduza os atritos e ruídos de comunicação. Prestação de contas mensal e acumulada de forma 100% digital e visual.",
            icon: <FileText size={28} />,
        },
        {
            title: "Eficiência",
            desc: "Automação do dia a dia.",
            fullDesc: "Emissão de boletos simplificada, agendamentos automáticos de áreas comuns e lembretes inteligentes de contas a pagar.",
            icon: <Zap size={28} />,
        },
        {
            title: "Colaboração",
            desc: "A comunidade integrada.",
            fullDesc: "Decisões conjuntas com enquetes ágeis, acesso fácil a atas, avisos instantâneos e segurança para a vivência dos moradores.",
            icon: <Users size={28} />,
        }
    ];

    const recursosDestaque = [
        { id: "criar_conta", icon: <UserPlus size={20} />, title: "Criação de Conta", text: "Configure sua gestão residencial com autonomia.", highlight: true, link: "/cadastro" },
        { id: "prestacao_visual", icon: <FileText size={20} />, title: "Prestações Visuais", text: "Entregue relatórios 100% digitais e transparentes.", highlight: false, link: "/cadastro" },
        { id: "amplitude_gestao", icon: <Layers size={20} />, title: "Gestão Inteligente", text: "Diversas funcionalidades para uma gestão inteligente.", highlight: false, link: "/cadastro" },
        { id: "agendamento_comum", icon: <CalendarDays size={20} />, title: "Reservas de Espaços", text: "Reserve área comum ou salão de festas de maneira digital.", highlight: false, link: "/cadastro" },
        { id: "decisoes_coletivas", icon: <Vote size={20} />, title: "Enquetes e Decisões", text: "Participe de votações e avisos importantes no dia a dia.", highlight: false, link: "/cadastro" }
    ];

    useEffect(() => {
        document.title = "Nucleo Condo | Gestão Condominial Digital e Inteligente — Nucleobase";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute(
                "content",
                "Gestão completa e livro digital para condomínios. Prestação de contas visual, boletos, reservas de espaços, ocorrências e enquetes para síndicos e condôminos."
            );
        }

        window.dataLayer?.push({
            event: "view_page_content",
            content_category: "institucional",
            content_name: "nucleobase_condo"
        });

        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (isPaused) return;
        const tempoAtual = cardAtivoIndex === 0 ? 15000 : 7000;
        const timer = setTimeout(() => {
            setCardAtivoIndex((prev) => (prev + 1) % recursosDestaque.length);
        }, tempoAtual);
        return () => clearTimeout(timer);
    }, [isPaused, cardAtivoIndex, recursosDestaque.length]);

    const trackClick = (label: string, destination: string) => {
        window.dataLayer?.push({
            event: "click_conversion_button",
            button_label: label,
            destination_url: destination,
            page_location: "/condo"
        });
    };

    const handleAreaCondominoClick = () => {
        if (isLoggedIn) {
            trackClick("Acessar Painel Morador", "/condo/dashboard");
            window.location.href = "/condo/dashboard";
        } else {
            trackClick("Abrir Login Área do Condômino", "modal_login_condomino");
            setIsLoginModalOpen(true);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (tempoBloqueio > 0) return;

        setAuthLoading(true);
        setLoginError("");
        const inputAcesso = emailOrSlug.trim().toLowerCase();
        const isEmail = inputAcesso.includes("@");

        try {
            let emailParaLogin = "";
            if (isEmail) {
                emailParaLogin = inputAcesso;
            } else {
                const { data: emailEncontrado, error: profileError } = await supabase
                    .rpc("get_email_by_slug", { p_slug: inputAcesso });

                if (profileError) throw profileError;
                if (!emailEncontrado) {
                    tratarErroLogin("ID de usuário (Slug) não foi localizado.");
                    return;
                }
                emailParaLogin = emailEncontrado;
            }

            const { error: authError } = await supabase.auth.signInWithPassword({
                email: emailParaLogin,
                password
            });

            if (authError) {
                tratarErroLogin("Erro ao acessar: Verifique suas credenciais de acesso.");
            } else {
                resetarBloqueio();
                window.dispatchEvent(new Event("storage"));
                window.dataLayer?.push({ event: "user_login_success", page_location: "/condo" });
                window.location.href = "/condo/dashboard";
            }
        } catch {
            tratarErroLogin("Ocorreu um erro inesperado.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleAgendarDemo = (e: React.FormEvent) => {
        if (metodoContato === "whatsapp") {
            e.preventDefault();
            trackClick("Enviar Solicitação Demonstração WhatsApp", "whatsapp_admin_demo");

            const textoMensagem = `Olá! Gostaria de solicitar maiores detalhamentos sobre o uso da plataforma Nucleo e agendar uma demonstração.\n\n` +
                `• *Nome:* ${demoNome}\n` +
                `• *E-mail:* ${demoEmail}\n` +
                `• *Condomínio:* ${demoCondo}\n` +
                `• *Telefone:* ${demoTelefone}`;

            const urlCompleta = `https://api.whatsapp.com/send?phone=${whatsappAdminPhone}&text=${encodeURIComponent(textoMensagem)}`;
            window.open(urlCompleta, "_blank");

            setDemoNome("");
            setDemoEmail("");
            setDemoTelefone("");
            setDemoCondo("");
            setIsModalOpen(false);
        } else {
            window.dataLayer?.push({
                event: "contact_form_submitted",
                form_name: "demo_condo_email"
            });

            setTimeout(() => {
                if (formRef.current) {
                    formRef.current.reset();
                }
            }, 100);
        }
    };

    const BadgeAdminCondo = () => (
        <span className="inline-flex items-center justify-center bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider shadow-sm uppercase align-middle">
            Administração de condomínios
        </span>
    );

    const CardAreaCondominoMinimalista = () => (
        <button
            type="button"
            onClick={handleAreaCondominoClick}
            className="w-full bg-white border border-gray-200 hover:border-blue-300 p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all group flex items-center justify-between gap-3 text-left cursor-pointer"
        >
            <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 shrink-0 bg-blue-50/80 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    {isLoggedIn ? <UserCircle size={20} /> : <Users size={20} />}
                </div>
                <div className="min-w-0">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        {isLoggedIn === null ? "Portal Residencial" : isLoggedIn ? "Sessão Ativa" : "Portal do Morador"}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm tracking-tight truncate group-hover:text-blue-600 transition-colors">
                        Área do condômino
                    </h4>
                </div>
            </div>

            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 group-hover:bg-blue-50 text-gray-600 group-hover:text-blue-600 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isLoggedIn ? "Painel" : "Entrar"}
                </span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
        </button>
    );

    const CardsDestaqueDesktop = () => {
        return (
            <div className="flex flex-col justify-start items-stretch w-full gap-3.5">
                {/* CARD 1: ÁREA DO CONDÔMINO (MINIMALISTA) */}
                <CardAreaCondominoMinimalista />

                {/* CARD 2: CONTABILIDADE */}
                <Link
                    href="/condo/contabilidade"
                    onClick={() => trackClick("Acessar Contabilidade", "/condo/contabilidade")}
                    className="w-full bg-white border border-gray-200 hover:border-emerald-300 p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all group flex items-center justify-between gap-3 cursor-pointer"
                >
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 shrink-0 bg-emerald-50/80 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                            <LockKeyhole size={20} />
                        </div>
                        <div className="min-w-0">
                            <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
                                Prestação Fiscal
                            </span>
                            <h4 className="font-bold text-gray-900 text-sm tracking-tight truncate group-hover:text-emerald-600 transition-colors">
                                Acesso Contabilidade
                            </h4>
                        </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 group-hover:bg-emerald-50 text-gray-600 group-hover:text-emerald-600 transition-colors">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Acessar</span>
                        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                </Link>
            </div>
        );
    };

    const CarrosselRecursosDesktop = () => {
        const itemAtual = recursosDestaque[cardAtivoIndex];

        return (
            <div
                className="relative flex flex-col justify-center h-full"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <Link
                    href={itemAtual.link}
                    key={cardAtivoIndex}
                    onClick={() => trackClick(`Carrossel Destaque: ${itemAtual.title}`, itemAtual.link)}
                    className={`p-5 rounded-[2.2rem] transition-all duration-300 flex items-start gap-4 h-auto min-h-[110px] block cursor-pointer ${itemAtual.highlight
                        ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/25 border-2 border-blue-400 hover:opacity-95"
                        : "bg-white border-2 border-gray-200 shadow-lg hover:border-blue-300"
                        }`}
                >
                    <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm mt-0.5 ${itemAtual.highlight
                        ? "bg-white/15 text-white"
                        : "bg-blue-50 text-blue-600"
                        }`}>
                        {itemAtual.icon}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <h4 className={`font-black text-[14px] mb-1 tracking-tight leading-snug ${itemAtual.highlight ? "text-white" : "text-gray-900"}`}>
                            {itemAtual.title}
                        </h4>
                        <p className={`text-[12px] leading-relaxed font-medium ${itemAtual.highlight ? "text-blue-100" : "text-gray-500"}`}>
                            {itemAtual.text}
                        </p>
                    </div>
                </Link>

                {/* Indicadores / Paginação do Carrossel */}
                <div className="flex justify-center items-center gap-2 mt-3">
                    {recursosDestaque.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCardAtivoIndex(idx)}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === cardAtivoIndex ? "w-6 bg-blue-600" : "w-2 bg-gray-300 hover:bg-gray-400"
                                }`}
                            aria-label={`Ir para card ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        );
    };

    const LayoutDestaqueMobile = () => (
        <div className="my-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-px bg-blue-100 flex-1"></div>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Vídeo Institucional</span>
                <div className="h-px bg-blue-100 flex-1"></div>
            </div>

            <p className="text-gray-600 text-xs font-medium mb-4 text-center leading-relaxed">
                Assista ao nosso vídeo institucional e veja como a <span className="text-gray-900 font-bold">Nucleo</span> simplifica sua administração.
            </p>

            <div className="relative aspect-video rounded-[2rem] overflow-hidden border-2 border-gray-100 shadow-lg mb-6">
                <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/47qCg8123cA"
                    title="Nucleobase Condo - Vídeo Institucional"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Linha divisória com o texto "Funcionalidades" */}
                <div className="col-span-2 flex items-center gap-3 my-4">
                    <div className="h-px bg-blue-100 flex-1"></div>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Funcionalidades</span>
                    <div className="h-px bg-blue-100 flex-1"></div>
                </div>

                <div className="col-span-2 p-0 my-0 text-center">
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        Explore abaixo as ferramentas integradas do nosso módulo de Administração Condo, projetadas para otimizar a rotina de síndicos e condôminos com total agilidade.
                    </p>
                </div>

                {[
                    { icon: <UserPlus size={18} />, title: "Criação de Conta" },
                    { icon: <FileText size={18} />, title: "Finanças" },
                    { icon: <Layers size={18} />, title: "Gestão Inteligente" },
                    { icon: <CalendarDays size={18} />, title: "Reservas" },
                    { icon: <Vote size={18} />, title: "Enquetes" }
                ].map((item, idx) => (
                    <Link
                        key={idx}
                        href="/cadastro"
                        onClick={() => trackClick(`Funcionalidade Mobile: ${item.title}`, "/cadastro")}
                        className={`bg-white border border-gray-100 p-4 rounded-[1.5rem] flex items-center gap-2 block ${idx === 0 ? "col-span-2 flex-row justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-400 shadow-md text-left" : "flex-col text-center"}`}
                    >
                        <div className={`${idx === 0 ? "bg-white/15 text-white" : "text-blue-600 bg-blue-50"} p-2.5 rounded-xl`}>{item.icon}</div>
                        <h4 className={`font-bold leading-tight uppercase tracking-tight ${idx === 0 ? "text-white text-[11px]" : "text-gray-900 text-[10px]"}`}>{item.title}</h4>
                    </Link>
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-16 relative px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 mt-0">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
                        <span>Nucleo Condo<span className="text-blue-600">.</span></span>
                        <Building2 size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
                    </h1>
                    <h2 className="text-gray-500 text-sm md:text-base font-medium max-w-2xl leading-relaxed mt-0">
                        <span className="md:hidden">Gestão condominial integrada e funcional</span>
                        <span className="hidden md:block">Gestão condominial, financeira e de convivência de forma descomplicada.</span>
                    </h2>
                </div>

                <div className="hidden md:flex flex-row gap-3 w-full md:max-w-[340px] shrink-0">
                    <a
                        href="/condo/adm"
                        onClick={() => trackClick("Área do Síndico", "/condo/adm")}
                        className="flex items-center justify-between flex-1 bg-gray-900 text-white py-3.5 px-4 rounded-2xl hover:bg-black transition-all group font-black text-[10px] uppercase tracking-widest shadow-lg cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <Building2 size={15} className="text-blue-500 shrink-0" />
                            <span className="whitespace-nowrap">Área do Síndico</span>
                        </div>
                    </a>

                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                            trackClick("Abrir Modal Agendar Demo", "modal_agendar_demo");
                        }}
                        className="flex items-center justify-between flex-1 bg-white border border-gray-200 text-gray-700 py-3.5 px-4 rounded-2xl hover:border-blue-600 hover:text-blue-600 transition-all group font-black text-[10px] uppercase tracking-widest shadow-sm cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <CalendarDays size={15} className="text-blue-600 shrink-0" />
                            <span className="whitespace-nowrap">Agendar Demo</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full mb-6 mt-3 md:hidden">
                <a href="/condo/adm" onClick={() => trackClick("Área do Síndico (Mobile)", "/condo/adm")} className="flex items-center justify-between flex-1 bg-gray-900 text-white py-3.5 px-5 rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-md">
                    <div className="flex items-center gap-2"><Building2 size={14} className="text-blue-500" /> Área do Síndico</div>
                    <ArrowUpRight size={14} />
                </a>
                <button
                    type="button"
                    onClick={handleAreaCondominoClick}
                    className="flex items-center justify-between flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md cursor-pointer"
                >
                    <div className="flex items-center gap-2"><Users size={14} className="text-white" /> Área do Condômino</div>
                    <ArrowUpRight size={14} />
                </button>
            </div>

            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
                Gestão profissional <div className="h-px bg-gray-300 flex-1"></div>
            </h3>

            {/* BLOCO PARALELO: TEXTO ADAPTADO POR LARGURA DE DESKTOP PARA ALINHAR COM A ALTURA DOS CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-6">
                <div className="lg:col-span-8 text-gray-700 text-lg leading-[1.7] min-w-0">
                    {/* Desktop compacto (md até xl) */}
                    <p className="text-gray-700 hidden md:block xl:hidden">
                        A Nucleo Condo foi desenvolvida para elevar o padrão da <BadgeAdminCondo />, entregando uma operação mais clara, digital e organizada. Unimos tecnologia intuitiva e dados estruturados para simplificar a rotina de síndicos, conselheiros e moradores, trazendo transparência e agilidade ao dia a dia.
                    </p>

                    {/* Telas desktop / menores - padrão notebook (xl até 2xl) */}
                    <p className="text-gray-700 hidden xl:block 2xl:hidden">
                        A Nucleo Condo foi desenvolvida para elevar o padrão da <BadgeAdminCondo />, entregando uma operação mais clara, digital e organizada. Sabendo que um dos maiores desafios desse segmento é a falta de transparência na prestação de contas e na comunicação diária, unimos tecnologia intuitiva e dados estruturados para simplificar a rotina de síndicos, conselheiros e moradores.
                    </p>

                    {/* Tela maior / segunda tela (2xl+) */}
                    <p className="text-gray-700 hidden 2xl:block">
                        A Nucleo Condo foi desenvolvida para elevar o padrão da <BadgeAdminCondo />, entregando uma operação mais clara, digital e organizada. Sabendo que um dos maiores desafios desse segmento é a falta de transparência na prestação de contas e na comunicação interna, unimos tecnologia intuitiva e dados estruturados para simplificar a rotina de síndicos, conselheiros e moradores. Assim, centralizamos reservas, enquetes, avisos, ocorrências e documentos em um só ambiente, garantindo mais segurança, autonomia e agilidade em cada etapa da gestão diária.
                    </p>

                    <div className="md:hidden">
                        <p className="text-sm leading-relaxed text-gray-600 font-medium mb-6">
                            Revolucione a administração do seu condomínio com automação inteligente e processos que simplificam sua rotina.
                        </p>

                        <button
                            onClick={() => {
                                setIsModalOpen(true);
                                trackClick("Abrir Modal Agendar Demo (Mobile)", "modal_agendar_demo");
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-blue-600 text-blue-600 py-4 px-6 rounded-2xl hover:bg-blue-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm cursor-pointer"
                        >
                            <CalendarDays size={16} /> Agendar Demonstração
                        </button>
                    </div>

                    <div className="block lg:hidden">
                        <LayoutDestaqueMobile />
                    </div>
                </div>

                <div className="hidden lg:block lg:col-span-4">
                    <CardsDestaqueDesktop />
                </div>
            </div>

            {/* CARD DE MISSÃO / OBJETIVO FORA DO ALINHAMENTO LATERAL */}
            <div className="bg-blue-50/40 border-l-4 border-blue-600 p-4 md:p-6 rounded-2xl relative overflow-hidden group transition-all hover:bg-blue-50/60 flex flex-col justify-center mb-6">
                <ShieldCheck className="absolute -right-6 -bottom-6 text-blue-600 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700" size={140} />
                <p className="font-medium text-blue-900 text-base md:text-lg leading-relaxed relative z-10 tracking-tight">
                    {/* Mobile */}
                    <span className="md:hidden">
                        "Nosso objetivo é transformar rotinas vistas anteriormente como complexas em processos visuais e simples, garantindo clareza, harmonia e integração entre administração e moradores."
                    </span>

                    {/* Telas desktop / menores (md até 2xl) */}
                    <span className="hidden md:inline 2xl:hidden">
                        "Nosso objetivo é transformar rotinas vistas anteriormente como complexas em processos visuais, ágeis e simples, garantindo total clareza, harmonia e integração entre a administração e os moradores."
                    </span>

                    {/* Tela maior / segunda tela (2xl+) */}
                    <span className="hidden 2xl:inline">
                        "Nosso objetivo é transformar rotinas vistas anteriormente como complexas em processos visuais e simples, garantindo clareza, harmonia e integração entre administração e moradores. Assim, reduzimos ruídos na comunicação, fortalecemos a confiança nas decisões coletivas e tornamos a convivência bem mais leve no dia a dia."
                    </span>

                    <br /><br />
                    <Link href="/cadastro" onClick={() => trackClick("Não possui conta - Clique Aqui", "/cadastro")} className="text-blue-600 font-bold underline hover:text-blue-800 transition-colors text-xs md:text-sm">Não possui uma conta? Clique aqui</Link>
                </p>
            </div>

            <div className="mt-20 hidden md:block">
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-4">
                    Nossos Pilares <div className="h-px bg-gray-300 flex-1"></div>
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-6">
                    <div className="lg:col-span-8">
                        <p className="text-gray-700 text-lg leading-[1.8]">
                            Do planejamento orçamentário anual à reserva instantânea do salão de festas — oferecemos ao síndico a profissionalização desejada e o poder de uma gestão ágil, eficiente, moderna e orientada a dados, enquanto o morador ganha a conveniência de acompanhar tudo de onde estiver.
                        </p>
                    </div>
                    <div className="lg:col-span-4">
                        <CarrosselRecursosDesktop />
                    </div>
                </div>

                <div className="mb-12 w-full">
                    <p className="text-gray-700 text-lg leading-[1.8]">
                        Acreditamos que a <span className="text-gray-900 font-bold underline decoration-blue-200 underline-offset-4 decoration-2">gestão democrática</span> é o caminho ideal para garantir resoluções e melhorias em sua administração. Nossos pilares sólidos trazem a estrutura perfeita, moderna e altamente completa que resolve definitivamente todas as burocracias do dia a dia de convivência de forma ágil, segura e transparente.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-8">
                    {pilares.map((pilar, i) => (
                        <div key={i} className="p-10 bg-white border border-gray-100 rounded-[3rem] shadow-sm flex flex-col items-start transition-all hover:shadow-md">
                            <div className="text-blue-600 mb-6 bg-blue-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center">
                                {pilar.icon}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">{pilar.title}</h4>
                            <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                {pilar.fullDesc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Card final minimalista */}
            <div className="mt-12 md:mt-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl md:rounded-[3rem] p-6 md:p-12 text-center relative overflow-hidden group w-full border border-blue-500/20 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    <Sparkles size={160} className="text-blue-400" />
                </div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <span className="inline-block bg-blue-500/10 text-blue-300 font-black text-[9px] uppercase tracking-[0.3em] px-3 py-1 rounded-full mb-3 border border-blue-400/20">
                        Inovação em Condomínios
                    </span>
                    <h2 className="text-xl md:text-3xl font-bold text-white mb-6 tracking-tight leading-snug">
                        Fale com nossa equipe e leve inovação para seu condomínio.
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a href="/contato" onClick={() => trackClick("Entrar em Contato - Footer Condo", "/contato")} className="bg-white text-blue-900 px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-50 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto text-center">
                            Entrar em Contato
                        </a>
                        <button onClick={() => { setIsModalOpen(true); trackClick("Agendar Demo - Footer Condo", "modal_agendar_demo"); }} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all w-full sm:w-auto text-center cursor-pointer">
                            Agendar Demonstração
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-24 flex items-center gap-4 mb-12">
                <div className="h-px bg-gray-200 flex-1"></div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
                <div className="h-px bg-gray-200 flex-1"></div>
            </div>

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
                    onClick={() => trackClick("Instagram - Condo", "https://www.instagram.com/nucleobase.app/")}
                    className="group relative flex flex-col items-center gap-6 cursor-pointer"
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

            {/* MODAL DISCRETO DE LOGIN DA ÁREA DO CONDÔMINO */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-7 shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-200">
                        <button
                            type="button"
                            onClick={() => setIsLoginModalOpen(false)}
                            className="absolute right-5 top-5 p-1.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-all cursor-pointer"
                            aria-label="Fechar"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                <Users size={18} />
                            </div>
                            <div>
                                <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600">
                                    Portal Residencial
                                </span>
                                <h3 className="text-base font-bold text-gray-900 leading-tight">
                                    Área do condômino
                                </h3>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-3">
                            <div className="relative group">
                                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" size={14} />
                                <input
                                    type="text"
                                    placeholder="ID de Usuário ou E-mail"
                                    required
                                    value={emailOrSlug}
                                    onChange={(e) => setEmailOrSlug(e.target.value)}
                                    className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-xs text-gray-900 placeholder:text-gray-400 transition-all"
                                />
                            </div>

                            <div className="relative group">
                                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" size={14} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Senha de acesso"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-9 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-xs text-gray-900 placeholder:text-gray-400 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>

                            {tempoBloqueio > 0 && (
                                <div className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-xl text-center">
                                    Muitas tentativas. Tente novamente em {tempoBloqueio}s.
                                </div>
                            )}

                            {loginError && tempoBloqueio === 0 && (
                                <p className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 p-2 rounded-xl text-center">
                                    {loginError}
                                </p>
                            )}

                            <button
                                disabled={authLoading || tempoBloqueio > 0}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl font-bold transition shadow-sm text-[10px] uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                            >
                                {authLoading ? "Verificando..." : tempoBloqueio > 0 ? `Aguarde (${tempoBloqueio}s)` : "Acessar Plataforma"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL AGENDAR DEMONSTRAÇÃO */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-6 animate-in fade-in duration-250">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-250">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-6 top-6 p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-6 space-y-2">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <CalendarDays size={20} />
                                </div>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Gestão Condominial</span>
                            </div>
                            <h2 className="text-xl font-black tracking-tight text-gray-900">Agendar Demonstração</h2>
                            <p className="text-xs text-gray-500 max-w-xs mx-auto">
                                Preencha os dados abaixo para solicitar maiores detalhes sobre o app e agendar uma demonstração com o nosso time de especialistas.
                            </p>
                        </div>

                        <div className="flex bg-zinc-100 p-1.5 rounded-2xl mb-6">
                            <button
                                type="button"
                                onClick={() => setMetodoContato("whatsapp")}
                                className={`flex-1 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${metodoContato === "whatsapp" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                <MessageCircle size={14} /> WhatsApp
                            </button>
                            <button
                                type="button"
                                onClick={() => setMetodoContato("email")}
                                className={`flex-1 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${metodoContato === "email" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                <Mail size={14} /> E-mail
                            </button>
                        </div>

                        <form
                            ref={formRef}
                            onSubmit={handleAgendarDemo}
                            action={metodoContato === "email" ? "https://api.web3forms.com/submit" : undefined}
                            method={metodoContato === "email" ? "POST" : undefined}
                            className="space-y-4"
                        >
                            {metodoContato === "email" && (
                                <>
                                    <input type="hidden" name="access_key" value="9ef5a274-150a-4664-a885-0b052efd06f7" />
                                    <input type="hidden" name="subject" value="Solicitação de Demonstração (Condo)" />
                                    <input type="hidden" name="from_name" value="Nucleo Condo - Portal" />
                                </>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Nome Completo</label>
                                <input
                                    type="text"
                                    name="Nome"
                                    required
                                    placeholder="Ex: João Silva"
                                    value={demoNome}
                                    onChange={(e) => setDemoNome(e.target.value)}
                                    className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">E-mail para Contato</label>
                                <input
                                    type="email"
                                    name="Email"
                                    required
                                    placeholder="Ex: joao@dominio.com"
                                    value={demoEmail}
                                    onChange={(e) => setDemoEmail(e.target.value)}
                                    className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Condomínio</label>
                                    <input
                                        type="text"
                                        name="Condominio"
                                        required
                                        placeholder="Ex: Edifício Rosa"
                                        value={demoCondo}
                                        onChange={(e) => setDemoCondo(e.target.value)}
                                        className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium placeholder:text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Telefone</label>
                                    <input
                                        type="tel"
                                        name="Telefone"
                                        required
                                        placeholder="(11) 90000-0000"
                                        value={demoTelefone}
                                        onChange={(e) => setDemoTelefone(e.target.value)}
                                        className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium placeholder:text-xs"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`w-full text-white h-13 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mt-6 shadow-lg cursor-pointer ${metodoContato === "whatsapp"
                                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/10"
                                    : "bg-gray-900 hover:bg-black shadow-gray-900/10"
                                    }`}
                            >
                                {metodoContato === "whatsapp" ? "Agendar via WhatsApp" : "Enviar Solicitação via E-mail"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}