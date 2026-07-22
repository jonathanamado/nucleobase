"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
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
    MessageSquarePlus
} from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NucleobaseCondo() {
    const [pilarAtivo, setPilarAtivo] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const BotaoAcessoDinamico = () => {
        if (isLoggedIn === null) return <div className="h-10 animate-pulse bg-white/5 rounded-xl mt-4" />;

        if (isLoggedIn) {
            return (
                <a
                    href="/condo/dashboard"
                    onClick={() => trackClick("Acessar Dashboard", "/condo/dashboard")}
                    className="flex items-center justify-between bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-xl transition-all group/btn mt-4 shadow-lg shadow-blue-600/20"
                >
                    <div className="flex items-center gap-2">
                        <UserCircle size={16} className="text-white" />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Minha conta</span>
                    </div>
                    <ArrowUpRight size={14} className="text-white/50 group-hover/btn:text-white transition-colors" />
                </a>
            );
        }

        return (
            <a
                href="/condo/dashboard"
                onClick={() => trackClick("Ir para Cadastro", "/condo/dashboard")}
                className="flex items-center justify-between bg-white/10 hover:bg-white/20 py-2 px-4 rounded-xl transition-all group/btn mt-4 border border-white/10"
            >
                <div className="flex items-center gap-2">
                    <UserPlus size={16} className="text-blue-400" />
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Acessar Dashboard</span>
                </div>
                <ArrowUpRight size={14} className="text-blue-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </a>
        );
    };

    const CardsDestaqueDesktop = () => (
        <div className="flex flex-col gap-6 h-full">
            <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 group relative overflow-hidden transition-all hover:scale-[1.01] flex flex-col justify-center flex-1">
                <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                    <Zap size={180} strokeWidth={1} className="text-blue-500" />
                </div>
                <div className="relative z-10 w-full">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-14 h-14 shrink-0 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Star size={24} fill="white" />
                        </div>
                        <div>
                            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">O Futuro do seu Prédio</p>
                            <h4 className="font-bold text-white text-xl leading-tight">
                                {isLoggedIn ? "Área do condomínio" : "Gestão inteligente"}
                            </h4>
                        </div>
                    </div>
                    <BotaoAcessoDinamico />
                </div>
            </div>
            {[
                { id: "prestacao_visual", icon: <FileText size={24} />, title: "Prestações Visuais", text: "Acabe com planilhas confusas e pastas físicas." },
                { id: "agendamento_comum", icon: <CalendarDays size={24} />, title: "Reservas de Espaços", text: "Salão de festas e áreas comuns sem complicação." },
                { id: "decisoes_coletivas", icon: <Vote size={24} />, title: "Enquetes e Decisões", text: "Votações e avisos na tela de cada morador." }
            ].map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group flex items-center gap-6 flex-1">
                    <div className="w-14 h-14 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                        {item.icon}
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 text-lg mb-1 tracking-tight">{item.title}</h4>
                        <p className="text-[13px] text-gray-500 leading-relaxed font-medium">{item.text}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const LayoutDestaqueMobile = () => (
        <div className="my-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-px bg-blue-100 flex-1"></div>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Destaques</span>
                <div className="h-px bg-blue-100 flex-1"></div>
            </div>

            {/* Texto de gestão democrática posicionado logo após a linha divisória do texto Destaques no mobile */}
            <p className="text-gray-700 text-sm font-medium mb-6 text-center leading-relaxed">
                Acreditamos que a <span className="text-gray-900 font-bold underline decoration-blue-200 underline-offset-4 decoration-2">gestão democrática</span> é o caminho para valorizar seu patrimônio.
            </p>

            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 bg-gray-900 p-6 rounded-[2rem] relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10 mb-4">
                        <div className="flex items-center gap-3">
                            <Star size={20} className="text-blue-500" fill="currentColor" />
                            <div>
                                <p className="text-blue-400 text-[8px] font-black uppercase tracking-widest font-black">Modernização</p>
                                <h4 className="font-bold text-white text-sm">Praticidade e Segurança</h4>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={anteriorPilar} className="p-2 bg-white/5 rounded-full text-white active:bg-white/20"><ChevronLeft size={16} /></button>
                            <button onClick={proximoPilar} className="p-2 bg-white/5 rounded-full text-white active:bg-white/20"><ChevronRight size={16} /></button>
                        </div>
                    </div>

                    <div className="relative z-10 py-2 border-y border-white/5 mb-2">
                        <p className="text-blue-100 text-[11px] font-medium italic opacity-80 leading-relaxed">
                            "{pilares[pilarAtivo].fullDesc}"
                        </p>
                    </div>

                    <BotaoAcessoDinamico />
                </div>

                {/* Contexto breve sobre as funcionalidades do módulo de Administração Condo */}
                <div className="col-span-2 bg-blue-50/60 border border-blue-100 p-4 rounded-2xl my-2 text-center">
                    <p className="text-xs text-blue-900 font-medium leading-relaxed">
                        Explore abaixo as ferramentas integradas do nosso módulo de Administração Condo, projetadas para otimizar a rotina de síndicos e condôminos com total agilidade.
                    </p>
                </div>

                {[
                    { icon: <FileText size={20} />, title: "Finanças" },
                    { icon: <CalendarDays size={20} />, title: "Reservas" },
                    { icon: <Vote size={20} />, title: "Enquetes" },
                    { icon: <ShieldCheck size={20} />, title: "Segurança" }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 p-4 rounded-[1.5rem] flex flex-col items-center text-center gap-2">
                        <div className="text-blue-600 bg-blue-50 p-3 rounded-xl">{item.icon}</div>
                        <h4 className="font-bold text-gray-900 text-[10px] leading-tight uppercase tracking-tight">{item.title}</h4>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">

            {/* Botões Prioritários Mobile */}
            <div className="flex flex-col sm:flex-row gap-3 w-full mb-8 mt-4 md:hidden">
                <a href="/condo/adm" className="flex items-center justify-between flex-1 bg-gray-900 text-white py-4 px-6 rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-lg">
                    <div className="flex items-center gap-2"><Building2 size={15} className="text-blue-500" /> Área do Síndico</div>
                    <ArrowUpRight size={15} />
                </a>
                <a href="/condo/dashboard" onClick={() => trackClick("Acessar Dashboard", "/condo/dashboard")} className="flex items-center justify-between flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg">
                    <div className="flex items-center gap-2"><UserPlus size={15} className="text-white" /> Acessar Dashboard</div>
                    <ArrowUpRight size={15} />
                </a>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
                        <span>Nucleo Condo<span className="text-blue-600">.</span></span>
                        <Dna size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
                    </h1>
                    <h2 className="text-gray-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-0">
                        <span className="md:hidden">Gestão de convivência descomplicada</span>
                        <span className="hidden md:block">A gestão financeira e de convivência do seu condomínio de forma descomplicada.</span>
                    </h2>
                </div>

                {/* BOTÕES DESKTOP */}
                <div className="hidden md:flex flex-row gap-3 w-full md:max-w-[340px] shrink-0">
                    <a
                        href="/condo/adm"
                        onClick={() => trackClick("Acessar Área do Síndico", "/condo/adm")}
                        className="flex items-center justify-between flex-1 bg-gray-900 text-white py-3.5 px-4 rounded-2xl hover:bg-black transition-all group font-black text-[10px] uppercase tracking-widest shadow-lg"
                    >
                        <div className="flex items-center gap-2">
                            <Building2 size={15} className="text-blue-500 shrink-0" />
                            <span className="whitespace-nowrap">Área do Síndico</span>
                        </div>
                    </a>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-between flex-1 bg-white border border-gray-200 text-gray-700 py-3.5 px-4 rounded-2xl hover:border-blue-600 hover:text-blue-600 transition-all group font-black text-[10px] uppercase tracking-widest shadow-sm"
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquarePlus size={15} className="text-blue-600 shrink-0" />
                            <span className="whitespace-nowrap">Solicitar Acesso</span>
                        </div>
                    </button>
                </div>
            </div>

            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
                Manifesto e Visão <div className="h-px bg-gray-300 flex-1"></div>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
                <div className="lg:col-span-7 text-gray-700 text-lg leading-[1.8] pr-0 lg:pr-10 flex flex-col justify-between">
                    <div>
                        <p className="mb-8 leading-relaxed text-gray-700 hidden md:block">
                            A Nucleobase nasceu para dar clareza aos fluxos financeiros pessoais, e agora trazemos o mesmo rigor tecnológico para a{" "}
                            <span className="inline-flex items-center justify-center bg-blue-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider shadow-sm uppercase align-middle">
                                Administração
                            </span>{" "}
                            do seu condomínio. Sabendo que o principal calcanhar de Aquiles das gestões residenciais é a falta de transparência financeira, nós unimos tecnologia e clareza para simplificar a rotina de síndicos e condôminos.
                        </p>

                        <div className="mb-6 md:hidden">
                            <p className="text-sm leading-relaxed text-gray-600 font-medium mb-6">
                                A Nucleobase Condo centraliza controles financeiros, apoio em boletos e processos internos de maneira prática e funcional.
                            </p>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-blue-600 text-blue-600 py-4 px-6 rounded-2xl hover:bg-blue-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                            >
                                <MessageSquarePlus size={16} /> Solicitar Acesso
                            </button>
                        </div>

                        <div className="bg-blue-50/40 border-l-4 border-blue-600 p-6 md:p-10 my-12 rounded-2xl md:rounded-r-[3rem] relative overflow-hidden group transition-all hover:bg-blue-50/60">
                            <ShieldCheck className="absolute -right-6 -bottom-6 text-blue-600 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700" size={180} />
                            <p className="font-medium text-blue-900 italic text-xl md:text-2xl leading-relaxed relative z-10 tracking-tight">
                                "Nosso objetivo é transformar a prestação de contas mensal em um processo visual simples, devolvendo a harmonia e o controle aos moradores."
                            </p>
                        </div>

                        <div className="block lg:hidden">
                            <LayoutDestaqueMobile />
                        </div>

                        <p className="mb-8 text-gray-700 hidden md:block">
                            Do planejamento orçamentário anual à reserva instantânea do salão de festas — oferecemos ao síndico o poder de uma gestão ágil e orientada a dados, enquanto o morador ganha a conveniência de acompanhar tudo de onde estiver.
                        </p>
                    </div>
                    <p className="text-gray-700 text-sm md:text-lg">
                        Acreditamos que a <span className="text-gray-900 font-bold underline decoration-blue-200 underline-offset-4 decoration-2">gestão democrática</span> é o caminho para valorizar seu patrimônio. Nossos pilares trazem a estrutura perfeita que resolve as burocracias de convivência de forma ágil e segura.
                    </p>
                </div>

                <div className="hidden lg:block lg:col-span-5">
                    <CardsDestaqueDesktop />
                </div>
            </div>

            <div className="mt-20 hidden md:block">
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-4">
                    Nossos Pilares <div className="h-px bg-gray-300 flex-1"></div>
                </h3>
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

            {/* Card Fale Conosco alterado para redirecionar para a página /contato */}
            <div className="mt-12 md:mt-20 bg-blue-600 rounded-3xl md:rounded-[4rem] p-8 md:p-20 text-center relative overflow-hidden group w-full">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                        Fale com nossa equipe e <br className="hidden md:block" /> leve inovação para seu condomínio.
                    </h2>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                        <a href="/contato" className="bg-white text-blue-600 px-6 py-4 md:px-10 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-[10px] md:text-[12px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all w-full md:w-auto text-center">
                            Entrar em Contato
                        </a>
                        <button onClick={() => setIsModalOpen(true)} className="bg-blue-700 text-white border border-white/20 px-6 py-4 md:px-10 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-[10px] md:text-[12px] uppercase tracking-widest hover:bg-blue-800 transition-all w-full md:w-auto text-center">
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
                            className="absolute right-6 top-6 p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-all"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-8 space-y-2">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-2">
                                <Users size={28} />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-gray-900">Solicitar Inclusão</h2>
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
                                        placeholder="Ex: Ed. Guimarães Rosa"
                                        value={solicitanteCondo}
                                        onChange={(e) => setSolicitanteCondo(e.target.value)}
                                        className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Unidade</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Apto 302"
                                        value={solicitanteUnidade}
                                        onChange={(e) => setSolicitanteUnidade(e.target.value)}
                                        className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-13 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mt-6 shadow-lg shadow-blue-600/10"
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