// app/condo/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { supabase } from "@/lib/supabase";
import {
    ShieldCheck,
    Target,
    Zap,
    Dna,
    LockKeyhole,
    Users,
    ArrowUpRight,
    Star,
    ChevronLeft,
    ChevronRight,
    Instagram,
    UserPlus,
    UserCircle,
    FileText,
    CalendarDays,
    Vote,
    Building2,
    X,
    MessageSquarePlus,
    Sparkles,
    Layers
} from "lucide-react";

export default function NucleobaseCondo() {
    const [pilarAtivo, setPilarAtivo] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado para controlar o índice do carrossel vivo (apenas um card visível por vez)
    const [cardAtivoIndex, setCardAtivoIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Estados do Formulário de Solicitação de Entrada
    const [solicitanteNome, setSolicitanteNome] = useState("");
    const [solicitanteEmail, setSolicitanteEmail] = useState("");
    const [solicitanteUnidade, setSolicitanteUnidade] = useState("");
    const [solicitanteCondo, setSolicitanteCondo] = useState("");

    // Telefone de suporte oficial da Administração Nucleo formatado
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

    // Efeito de carrossel vivo: muda a cada 3 segundos, pausando se o mouse estiver em cima
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setCardAtivoIndex((prev) => (prev + 1) % recursosDestaque.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [isPaused, recursosDestaque.length]);

    const trackClick = (label: string, destination: string) => {
        window.dataLayer?.push({
            event: "click_conversion_button",
            button_label: label,
            destination_url: destination,
            page_location: "/condo"
        });
    };

    const proximoPilar = () => {
        if (pilarAtivo < pilares.length - 1) setPilarAtivo(pilarAtivo + 1);
        else setPilarAtivo(0);
    };

    const anteriorPilar = () => {
        if (pilarAtivo > 0) setPilarAtivo(pilarAtivo - 1);
        else setPilarAtivo(pilares.length - 1);
    };

    const handleEnviarSolicitacao = (e: React.FormEvent) => {
        e.preventDefault();
        const textoMensagem = `Olá! Gostaria de solicitar meu cadastro para Acesso ao APP da Nucleo como Morador, utilizando o módulo de Gestão de Condomínio. Segue abaixo dados para liberação:\n\n` +
            `• *Nome:* ${solicitanteNome}\n` +
            `• *E-mail:* ${solicitanteEmail}\n` +
            `• *Condomínio:* ${solicitanteCondo}\n` +
            `• *Unidade:* ${solicitanteUnidade}`;

        const urlCompleta = `https://api.whatsapp.com/send?phone=${whatsappAdminPhone}&text=${encodeURIComponent(textoMensagem)}`;
        window.open(urlCompleta, "_blank");

        setSolicitanteNome("");
        setSolicitanteEmail("");
        setSolicitanteUnidade("");
        setSolicitanteCondo("");
        setIsModalOpen(false);
    };

    const BotaoAcessoDinamico = ({ isInsideLink = false }: { isInsideLink?: boolean }) => {
        if (isLoggedIn === null) {
            return (
                <div className="flex items-center justify-between bg-blue-600 py-2 px-4 rounded-xl mt-4 opacity-0 transition-opacity duration-300">
                    <div className="flex items-center gap-2">
                        <UserCircle size={16} className="text-white" />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Minha conta</span>
                    </div>
                    <ArrowUpRight size={14} className="text-white/50" />
                </div>
            );
        }

        const content = (
            <div className={`flex items-center justify-between py-2 px-4 rounded-xl transition-all group/btn mt-4 shadow-lg ${isLoggedIn ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : 'bg-white/10 hover:bg-white/20 border border-white/10'}`}>
                <div className="flex items-center gap-2">
                    {isLoggedIn ? (
                        <UserCircle size={16} className="text-white" />
                    ) : (
                        <Users size={16} className="text-blue-400" />
                    )}
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">
                        {isLoggedIn ? "Minha conta" : "Acessar Dashboard"}
                    </span>
                </div>
                <ArrowUpRight size={14} className={isLoggedIn ? "text-white/50 group-hover/btn:text-white transition-colors" : "text-blue-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"} />
            </div>
        );

        if (isInsideLink) {
            return content;
        }

        return (
            <a
                href="/condo/dashboard"
                onClick={() => trackClick(isLoggedIn ? "Acessar Dashboard" : "Ir para Cadastro", "/condo/dashboard")}
            >
                {content}
            </a>
        );
    };

    const CardsDestaqueDesktop = () => {
        return (
            <div className="flex flex-col gap-6 h-full justify-between">
                {/* CARD 1: ÁREA DO CONDOMÍNIO */}
                <Link
                    href="/condo/dashboard"
                    onClick={() => trackClick("O Futuro do seu Prédio", "/condo/dashboard")}
                    className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 group relative overflow-hidden transition-all hover:scale-[1.01] flex flex-col justify-center cursor-pointer block"
                >
                    <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                        <Zap size={180} strokeWidth={1} className="text-blue-500" />
                    </div>
                    <div className="relative z-10 w-full">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-14 h-14 shrink-0 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:bg-white group-hover:text-blue-600 transition-all duration-500">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.2em]">O Futuro do seu Prédio</p>
                                <h4 className="font-bold text-white text-xl leading-tight">
                                    {isLoggedIn ? "Área do condomínio" : "Gestão inteligente"}
                                </h4>
                            </div>
                        </div>
                        <BotaoAcessoDinamico isInsideLink={true} />
                    </div>
                </Link>

                {/* CARD 2: CONTABILIDADE (Subido para próximo do card Gestão Inteligente / Área do Condomínio) */}
                <Link
                    href="/condo/contabilidade"
                    onClick={() => trackClick("Acessar Contabilidade", "/condo/contabilidade")}
                    className="bg-white border border-gray-300 p-8 rounded-[2.5rem] shadow-lg shadow-gray-200/50 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-center cursor-pointer block"
                >
                    <div className="relative z-10 w-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 shrink-0 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                <LockKeyhole size={24} />
                            </div>
                            <div>
                                <p className="text-emerald-600 text-[9px] font-black uppercase tracking-[0.2em]">Empresa parceira</p>
                                <h4 className="font-bold text-gray-900 text-xl leading-tight">
                                    Contabilidade
                                </h4>
                            </div>
                        </div>
                        <div className="flex items-center justify-between bg-emerald-600 hover:bg-emerald-700 py-3 px-4 rounded-xl transition-all group/btn shadow-lg shadow-emerald-600/20">
                            <div className="flex items-center gap-2">
                                <UserCircle size={16} className="text-white" />
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">Acesso Restrito</span>
                            </div>
                            <ArrowUpRight size={14} className="text-white/70 group-hover/btn:text-white transition-colors" />
                        </div>
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
                    className={`p-5 rounded-[2.2rem] transition-all duration-500 animate-in fade-in zoom-in-95 flex items-start gap-4 h-auto min-h-[110px] block cursor-pointer ${itemAtual.highlight
                        ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/25 border-2 border-blue-400 hover:opacity-95"
                        : "bg-white border-2 border-gray-200 shadow-lg hover:border-blue-300"
                        }`}
                >
                    <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm mt-0.5 ${itemAtual.highlight
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
            <div className="flex items-center gap-3 mb-6">
                <div className="h-px bg-blue-100 flex-1"></div>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Destaques</span>
                <div className="h-px bg-blue-100 flex-1"></div>
            </div>

            <p className="text-gray-700 text-sm font-medium mb-5 text-center leading-relaxed">
                Acreditamos que a <span className="text-gray-900 font-bold underline decoration-blue-200 underline-offset-4 decoration-2">gestão democrática</span> é o caminho para valorizar seu patrimônio.
            </p>

            <div className="grid grid-cols-2 gap-3">
                {/* CARD 1 MOBILE: ÁREA DO CONDOMÍNIO */}
                <Link href="/condo/dashboard" className="col-span-2 bg-gray-900 p-6 rounded-[2rem] relative overflow-hidden block">
                    <div className="flex items-center justify-between relative z-10 mb-4">
                        <div className="flex items-center gap-3">
                            <Users size={20} className="text-blue-500" />
                            <div>
                                <p className="text-blue-400 text-[8px] font-black uppercase tracking-widest">Modernização</p>
                                <h4 className="font-bold text-white text-sm">Praticidade e Segurança</h4>
                            </div>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                            <button onClick={anteriorPilar} className="p-2 bg-white/5 rounded-full text-white active:bg-white/20 cursor-pointer"><ChevronLeft size={16} /></button>
                            <button onClick={proximoPilar} className="p-2 bg-white/5 rounded-full text-white active:bg-white/20 cursor-pointer"><ChevronRight size={16} /></button>
                        </div>
                    </div>

                    <div className="relative z-10 py-2 border-y border-white/5 mb-2">
                        <p className="text-blue-100 text-[11px] font-medium italic opacity-80 leading-relaxed">
                            "{pilares[pilarAtivo].fullDesc}"
                        </p>
                    </div>

                    <BotaoAcessoDinamico isInsideLink={true} />
                </Link>

                {/* CARD 2 MOBILE: CONTABILIDADE (Colocado logo abaixo do texto "A Nucleo é a melhor opção..." na visão mobile) */}
                <Link href="/condo/contabilidade" className="col-span-2 bg-white border border-gray-300 p-6 rounded-[2rem] shadow-md relative overflow-hidden block">
                    <div className="flex items-center justify-between relative z-10 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <LockKeyhole size={18} />
                            </div>
                            <div>
                                <p className="text-emerald-600 text-[8px] font-black uppercase tracking-widest">Parceiros</p>
                                <h4 className="font-bold text-gray-900 text-sm">Contabilidade</h4>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 py-2 border-y border-gray-100 mb-4">
                        <p className="text-gray-500 text-[11px] font-medium italic leading-relaxed">
                            "Acesso restrito para gestão e auditoria financeira do condomínio."
                        </p>
                    </div>

                    <div className="flex items-center justify-between bg-emerald-600 hover:bg-emerald-700 py-2.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-600/20">
                        <div className="flex items-center gap-2">
                            <UserCircle size={14} className="text-white" />
                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Acesso Restrito</span>
                        </div>
                        <ArrowUpRight size={14} className="text-white/70" />
                    </div>
                </Link>

                {/* Linha divisória com o texto "Funcionalidades" antes das ferramentas integradas */}
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
                        className={`bg-white border border-gray-100 p-4 rounded-[1.5rem] flex flex-col items-center text-center gap-2 block ${idx === 0 ? "col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-400 shadow-md" : ""}`}
                    >
                        <div className={`${idx === 0 ? "bg-white/15 text-white" : "text-blue-600 bg-blue-50"} p-2.5 rounded-xl`}>{item.icon}</div>
                        <h4 className={`font-bold text-[10px] leading-tight uppercase tracking-tight ${idx === 0 ? "text-white" : "text-gray-900"}`}>{item.title}</h4>
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
                        <span className="md:hidden">Convivência integrada e funcional</span>
                        <span className="hidden md:block">Gestão financeira e de convivência de forma descomplicada.</span>
                    </h2>
                </div>

                <div className="hidden md:flex flex-row gap-3 w-full md:max-w-[340px] shrink-0">
                    <a
                        href="/condo/adm"
                        onClick={() => trackClick("Acessar Área do Síndico", "/condo/adm")}
                        className="flex items-center justify-between flex-1 bg-gray-900 text-white py-3.5 px-4 rounded-2xl hover:bg-black transition-all group font-black text-[10px] uppercase tracking-widest shadow-lg cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <Building2 size={15} className="text-blue-500 shrink-0" />
                            <span className="whitespace-nowrap">Área do Síndico</span>
                        </div>
                    </a>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-between flex-1 bg-white border border-gray-200 text-gray-700 py-3.5 px-4 rounded-2xl hover:border-blue-600 hover:text-blue-600 transition-all group font-black text-[10px] uppercase tracking-widest shadow-sm cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquarePlus size={15} className="text-blue-600 shrink-0" />
                            <span className="whitespace-nowrap">Solicitar Acesso</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full mb-6 mt-3 md:hidden">
                <a href="/condo/adm" className="flex items-center justify-between flex-1 bg-gray-900 text-white py-3.5 px-5 rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-md">
                    <div className="flex items-center gap-2"><Building2 size={14} className="text-blue-500" /> Área do Síndico</div>
                    <ArrowUpRight size={14} />
                </a>
                <a href="/condo/dashboard" onClick={() => trackClick("Acessar Dashboard", "/condo/dashboard")} className="flex items-center justify-between flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md">
                    <div className="flex items-center gap-2"><Users size={14} className="text-white" /> Acessar Dashboard</div>
                    <ArrowUpRight size={14} />
                </a>
            </div>

            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
                Gestão Ativa <div className="h-px bg-gray-300 flex-1"></div>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
                <div className="lg:col-span-7 text-gray-700 text-lg leading-[1.8] pr-0 lg:pr-10 flex flex-col justify-between">
                    <div className="flex flex-col justify-between h-full">
                        <p className="mb-8 leading-relaxed text-gray-700 hidden md:block">
                            A Nucleo Condo nasceu para permitir clareza aos fluxos, e agora trazemos o mesmo rigor para a{" "}
                            <span className="inline-flex items-center justify-center bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider shadow-sm uppercase align-middle">
                                Administração
                            </span>{" "}
                            de condomínios. Sabendo que o principal calcanhar de Aquiles neste segmento é a dificuldade de transparência, unimos tecnologia e clareza para a rotina de síndicos e condôminos, unificando e facilitando decisões.
                        </p>

                        <div className="mb-6 md:hidden">
                            <p className="text-sm leading-relaxed text-gray-600 font-medium mb-6">
                                Revolucione a administração do seu condomínio com automação inteligente e processos que simplificam sua rotina.
                            </p>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-blue-600 text-blue-600 py-4 px-6 rounded-2xl hover:bg-blue-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm cursor-pointer"
                            >
                                <MessageSquarePlus size={16} /> Solicitar Acesso
                            </button>
                        </div>

                        {/* Card diminuído na visão desktop, mantendo conteúdo */}
                        <div className="bg-blue-50/40 border-l-4 border-blue-600 p-4 md:p-6 my-0 rounded-2xl relative overflow-hidden group transition-all hover:bg-blue-50/60 flex flex-col justify-center">
                            <ShieldCheck className="absolute -right-6 -bottom-6 text-blue-600 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700" size={140} />
                            <p className="font-medium text-blue-900 text-base md:text-lg leading-relaxed relative z-10 tracking-tight">
                                "Nosso objetivo é transformar rotinas vistas como complexas em processos visuais e simples, garantindo harmonia e integração entre administração e moradores."<br /><br />
                                <Link href="/cadastro" className="text-blue-600 font-bold underline hover:text-blue-800 transition-colors text-xs md:text-sm">Não possui uma conta? Clique aqui</Link>
                            </p>
                        </div>

                        <div className="block lg:hidden">
                            <LayoutDestaqueMobile />
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block lg:col-span-5 h-full">
                    <CardsDestaqueDesktop />
                </div>
            </div>

            <div className="mt-20 hidden md:block">
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-4">
                    Nossos Pilares <div className="h-px bg-gray-300 flex-1"></div>
                </h3>

                {/* Seção com coluna lateral direita para o carrossel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-6">
                    <div className="lg:col-span-8">
                        <p className="text-gray-700 text-lg leading-[1.8]">
                            Do planejamento orçamentário anual à reserva instantânea do salão de festas — oferecemos ao síndico a profissionalizaçao desejada e o poder de uma gestão ágil, eficiente, moderna e orientada a dados, enquanto o morador ganha a conveniência de acompanhar tudo de onde estiver.
                        </p>
                    </div>
                    <div className="lg:col-span-4">
                        <CarrosselRecursosDesktop />
                    </div>
                </div>

                {/* Texto transferido para a linha debaixo, ocupando a área inteira da tela */}
                <div className="mb-12 w-full">
                    <p className="text-gray-700 text-lg leading-[1.8]">
                        Acreditamos que a <span className="text-gray-900 font-bold underline decoration-blue-200 underline-offset-4 decoration-2">gestão democrática</span> é o caminho ideal para valorizar o seu patrimônio. Nossos pilares trazem a estrutura perfeita que resolve as burocracias de convivência de forma ágil, segura e inteligente.
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

            {/* Card final minimalista e inovador */}
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
                        <a href="/contato" className="bg-white text-blue-900 px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-50 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto text-center">
                            Entrar em Contato
                        </a>
                        <button onClick={() => setIsModalOpen(true)} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all w-full sm:w-auto text-center cursor-pointer">
                            Solicitar Entrada
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-6 animate-in fade-in duration-250">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-250">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-6 top-6 p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-8 space-y-2">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <Users size={20} />
                                </div>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Gestão Condominial</span>
                            </div>
                            <h2 className="text-xl font-black tracking-tight text-gray-900">Solicitar Inclusão</h2>
                            <p className="text-xs text-gray-500 max-w-xs mx-auto">
                                Insira seus dados para enviar a solicitação diretamente para o suporte e administração do seu condomínio.
                            </p>
                        </div>

                        <form onSubmit={handleEnviarSolicitacao} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: João Silva"
                                    value={solicitanteNome}
                                    onChange={(e) => setSolicitanteNome(e.target.value)}
                                    className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">E-mail Cadastrado</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="Ex: joao@dominio.com"
                                    value={solicitanteEmail}
                                    onChange={(e) => setSolicitanteEmail(e.target.value)}
                                    className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Condomínio</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ed. G. Rosa"
                                        value={solicitanteCondo}
                                        onChange={(e) => setSolicitanteCondo(e.target.value)}
                                        className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium placeholder:text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Unidade</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Apto 302"
                                        value={solicitanteUnidade}
                                        onChange={(e) => setSolicitanteUnidade(e.target.value)}
                                        className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium placeholder:text-xs"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-13 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mt-6 shadow-lg shadow-blue-600/10 cursor-pointer"
                            >
                                Enviar Solicitação via WhatsApp
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}