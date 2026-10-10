"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
    TrendingUp, Target, Award, CalendarDays, Wallet,
    Building, CheckCircle2, Clock, Megaphone, Share2, MessageCircle,
    ArrowUpRight, AtSign, Key, Eye, EyeOff, ChevronLeft, ChevronRight,
    Instagram, BarChart3, Briefcase, Users, UserPlus
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLoginProtegido } from "@/hooks/useLoginProtegido";
import Link from "next/link";

export default function ConsultoriaCondominialPage() {
    const {
        emailOrSlug: slug,
        setEmailOrSlug: setSlug,
        password,
        setPassword,
        authLoading: loadingLogin,
        setAuthLoading: setLoadingLogin,
        loginError,
        setLoginError,
        tempoBloqueio,
        tratarErroLogin,
        resetarBloqueio
    } = useLoginProtegido();

    // --- ESTADOS DE UI E NAVEGAÇÃO ---
    const [activeTab, setActiveTab] = useState<"dashboard" | "pipeline">("dashboard");
    const [loadingData, setLoadingData] = useState(true);
    const [isRecovering, setIsRecovering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // --- DADOS DO CONSULTOR ---
    const [userId, setUserId] = useState<string>("");
    const [userSlug, setUserSlug] = useState<string>("");
    const [userName, setUserName] = useState<string>("Consultor");
    const [baseUrl, setBaseUrl] = useState("");

    // --- FILTRO MENSAL (LOTE) ---
    // Gera opção de Acumulado e os últimos 12 meses
    const gerarMeses = () => {
        const meses = [];
        meses.push({ valor: 'acumulado', nome: 'Acumulado (Últimos 12 meses)' });

        const hoje = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            const valor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const nome = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            meses.push({ valor, nome: nome.charAt(0).toUpperCase() + nome.slice(1) });
        }
        return meses;
    };

    const [opcoesMeses] = useState(gerarMeses());
    const [mesSelecionado, setMesSelecionado] = useState(opcoesMeses[0].valor);
    const [copiado, setCopiado] = useState(false);

    // --- DADOS REAIS ---
    const [vendasLote, setVendasLote] = useState<any[]>([]);
    const [kpis, setKpis] = useState({
        condominiosIndicados: 0,
        condominiosAtivos: 0,
        comissaoValidada: 0,
        comissaoPendente: 0,
        taxaConversao: 0
    });

    useEffect(() => {
        window.dataLayer?.push({
            event: "view_page_content",
            content_category: "comercial",
            content_name: "dashboard_consultor_condominial"
        });
    }, []);

    const trackClick = (label: string, destination: string) => {
        window.dataLayer?.push({
            event: "click_conversion_button",
            button_label: label,
            destination_url: destination,
            page_location: "/resultados-consultoria/consultoria-condominial"
        });
    };

    const fetchConsultorData = useCallback(async (user: any, mesFiltro: string) => {
        setLoadingData(true);
        try {
            setUserId(user.id);

            // Busca perfil com blindagem de erro (maybeSingle)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('slug, nome_completo')
                .eq('id', user.id)
                .maybeSingle();

            if (profileError) console.error("Erro ao buscar perfil:", profileError);

            setUserName(profile?.nome_completo || user.email?.split('@')[0] || "Consultor");
            setUserSlug(profile?.slug || user.id);

            // Processa o filtro de data (Acumulado de 12 meses ou Mês Específico)
            let primeiroDiaMes, ultimoDiaMes;

            if (mesFiltro === 'acumulado') {
                const hoje = new Date();
                primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() - 11, 1).toISOString();
                ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59).toISOString();
            } else {
                const [anoStr, mesStr] = mesFiltro.split('-');
                const ano = parseInt(anoStr);
                const mesNum = parseInt(mesStr) - 1;
                primeiroDiaMes = new Date(ano, mesNum, 1).toISOString();
                ultimoDiaMes = new Date(ano, mesNum + 1, 0, 23, 59, 59).toISOString();
            }

            // Busca Cadastros / Indicações (Leads)
            const { data: indicacoesData, error: indicacoesError } = await supabase
                .from('indicacoes')
                .select('*')
                .eq('indicador_id', user.id)
                .gte('created_at', primeiroDiaMes)
                .lte('created_at', ultimoDiaMes);

            if (indicacoesError) console.error("Erro ao buscar indicações:", indicacoesError);

            // Busca as vendas vinculadas
            const { data: vendasData, error: vendasError } = await supabase
                .from('afiliados_vendas')
                .select('*')
                .eq('consultor_id', user.id)
                .gte('created_at', primeiroDiaMes)
                .lte('created_at', ultimoDiaMes);

            if (vendasError) console.error("Erro ao buscar vendas do consultor:", vendasError);

            // FUNDIR LEADS (indicações) COM VENDAS (Pipeline unificado)
            const pipelineMap = new Map();

            if (indicacoesData) {
                for (const ind of indicacoesData) {
                    if (ind.indicado_id) {
                        pipelineMap.set(ind.indicado_id, {
                            indicado_id: ind.indicado_id,
                            data: ind.created_at,
                            status: 'cadastrado', // Status inicial default
                            valor_bruto: 0,
                            comissao: 0
                        });
                    }
                }
            }

            if (vendasData) {
                for (const v of vendasData) {
                    if (v.indicado_id) {
                        const existing = pipelineMap.get(v.indicado_id) || {
                            indicado_id: v.indicado_id,
                            data: v.created_at // Assume data da venda se não passou pela indicação direta
                        };
                        existing.status = v.status || 'pendente';
                        existing.valor_bruto = v.valor_bruto || (v.valor_comissao ? v.valor_comissao * 4 : 0);
                        existing.comissao = v.valor_comissao || 0;
                        pipelineMap.set(v.indicado_id, existing);
                    }
                }
            }

            const pipelineArray = Array.from(pipelineMap.values());

            // Enriquecer dados cruzando o ID do indicado com o nome na tabela profiles
            const pipelineEnriquecido = await Promise.all(pipelineArray.map(async (item) => {
                let nomeCondominio = "Condomínio / Lead";

                if (item.indicado_id) {
                    const { data: profileIndicado } = await supabase
                        .from('profiles')
                        .select('nome_completo')
                        .eq('id', item.indicado_id)
                        .maybeSingle();

                    if (profileIndicado?.nome_completo) {
                        nomeCondominio = profileIndicado.nome_completo;
                    }
                }

                return { ...item, condominio: nomeCondominio };
            }));

            // Ordena os leads do mais recente para o mais antigo
            pipelineEnriquecido.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

            setVendasLote(pipelineEnriquecido);

            // Cálculo Dinâmico dos KPIs
            const totalIndicados = indicacoesData ? indicacoesData.length : 0;
            const validadas = pipelineEnriquecido.filter(v => v.status === 'validado').reduce((acc, v) => acc + v.comissao, 0);
            const pendentes = pipelineEnriquecido.filter(v => v.status === 'pendente').reduce((acc, v) => acc + v.comissao, 0);
            const totalAtivos = pipelineEnriquecido.filter(v => v.status === 'validado').length;
            const conversaoCalc = totalIndicados > 0 ? (totalAtivos / totalIndicados) * 100 : 0;

            setKpis({
                condominiosIndicados: totalIndicados,
                condominiosAtivos: totalAtivos,
                comissaoValidada: validadas,
                comissaoPendente: pendentes,
                taxaConversao: Number(conversaoCalc.toFixed(1))
            });

        } catch (err) {
            console.error("Erro fatal ao sincronizar dados do consultor:", err);
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") setBaseUrl(window.location.origin);

        const checkUser = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (session) {
                    fetchConsultorData(session.user, mesSelecionado);
                } else {
                    setLoadingData(false);
                }
            } catch (err) {
                console.error("Erro de sessão Supabase:", err);
                setLoadingData(false);
            }
        };

        checkUser();
    }, [fetchConsultorData, mesSelecionado]); // Refaz a busca se mudar o mês selecionado

    // --- FUNÇÕES DE LOGIN (Mantidas do Indique) ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (tempoBloqueio > 0) return;
        setLoadingLogin(true);
        setLoginError("");
        const input = slug.trim().toLowerCase();
        const isEmail = input.includes("@");
        try {
            let email = isEmail ? input : "";
            if (!isEmail) {
                const { data: p } = await supabase.from('profiles').select('email').eq('slug', input).maybeSingle();
                if (!p?.email) {
                    tratarErroLogin("ID não encontrado.");
                    return;
                }
                email = p.email;
            }
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                tratarErroLogin("Credenciais incorretas.");
                return;
            }
            resetarBloqueio();
            window.dataLayer?.push({ event: "consultant_login_success", page_location: "/resultados-consultoria" });
            window.location.reload();
        } catch (err: any) {
            tratarErroLogin("Ocorreu um erro inesperado.");
        } finally { setLoadingLogin(false); }
    };

    // Monta o Link Real do Consultor apontando para a página de Indicação
    const linkIndicacao = userSlug && baseUrl ? `${baseUrl}/indique/${userSlug}` : "";

    const handleCopy = () => {
        navigator.clipboard.writeText(linkIndicacao);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
        trackClick("Copiar Link Indicação", linkIndicacao);
    };

    const handleWhatsAppLead = () => {
        const text = encodeURIComponent(`Olá! Sou ${userName.split(' ')[0]}, consultor parceiro da Nucleobase. Segue o material para revolucionar a gestão do seu condomínio: ${linkIndicacao}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        trackClick("Prospecção WhatsApp", "whatsapp");
    };

    if (loadingData) return (
        <div className="w-full h-[60vh] flex items-center justify-center">
            <div className="animate-pulse text-gray-400 font-black uppercase tracking-widest text-[10px]">Carregando Dashboard...</div>
        </div>
    );

    return (
        <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">

            {/* HEADER COMERCIAL */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-blue-900 mb-1 tracking-tight flex items-center">
                        <span>Sua performance vale <span className="text-emerald-500">Ouro</span><span className="text-blue-900">.</span></span>
                        <Target size={32} className="text-emerald-500 opacity-85 ml-3" />
                    </h1>
                    <h2 className="text-gray-500 text-base md:text-lg font-medium leading-relaxed">Painel do Consultor Condominial. Acompanhe suas metas e fechamentos.</h2>
                </div>
                {userId && (
                    <div className="bg-gray-100 px-4 py-2 rounded-xl flex items-center gap-2 w-fit cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                        <CalendarDays size={16} className="text-blue-600" />
                        <select
                            value={mesSelecionado}
                            onChange={(e) => setMesSelecionado(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-600 outline-none cursor-pointer appearance-none pr-4"
                        >
                            {opcoesMeses.map((op) => (
                                <option key={op.valor} value={op.valor}>
                                    {op.valor === 'acumulado' ? op.nome : `Lote: ${op.nome}`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2 flex items-center gap-4">
                Acesso ao Dashboard <div className="h-px bg-gray-300 flex-1"></div>
            </h3>

            {/* TELA DE LOGIN (Não Autenticado) */}
            {!userId ? (
                <div className="mt-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/10 overflow-hidden mb-12 max-w-md mx-auto animate-in zoom-in-95 duration-500">
                    <div className="p-10 flex flex-col items-center bg-white">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                            <Briefcase className="text-blue-600" size={28} />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-6 text-center tracking-tight">Acesso Exclusivo Consultores</h4>

                        <form onSubmit={handleLogin} className="w-full space-y-3">
                            <div className="relative">
                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="ID do Consultor ou E-mail"
                                    required
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-1 focus:ring-blue-600 outline-none text-xs font-bold"
                                />
                            </div>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Senha de Acesso"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-4 bg-gray-50 border-none rounded-2xl focus:ring-1 focus:ring-blue-600 outline-none text-xs font-bold"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {tempoBloqueio > 0 && (
                                <div className="text-xs font-bold text-amber-600 bg-amber-50 p-3 rounded-xl text-center mt-2">
                                    Muitas tentativas. Tente novamente em {tempoBloqueio}s.
                                </div>
                            )}
                            {loginError && tempoBloqueio === 0 && (
                                <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl text-center mt-2">{loginError}</p>
                            )}

                            <button disabled={loadingLogin || tempoBloqueio > 0} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg text-[10px] disabled:opacity-50 mt-4 cursor-pointer">
                                {loadingLogin ? "Autenticando..." : tempoBloqueio > 0 ? `Aguarde (${tempoBloqueio}s)` : "Entrar no Dashboard"}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                /* ÁREA AUTENTICADA DO CONSULTOR */
                <div className="mt-6 animate-in fade-in duration-500">

                    {/* FERRAMENTA DE VENDA RÁPIDA */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-10 mb-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="absolute -right-10 -bottom-10 opacity-10">
                            <TrendingUp size={200} />
                        </div>

                        <div className="relative z-10 md:w-1/2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2 block">Ação Rápida</span>
                            <h3 className="text-2xl font-bold text-white mb-2">Enviar proposta comercial</h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">
                                Use seu link exclusivo para garantir o trackeamento de comissão automático em novos fechamentos.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={handleWhatsAppLead} className="bg-emerald-500 hover:bg-emerald-400 text-gray-900 py-3.5 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20">
                                    <MessageCircle size={14} /> Abordar via WhatsApp
                                </button>
                                <button onClick={handleCopy} className="bg-white/10 hover:bg-white/20 text-white py-3.5 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer">
                                    <Share2 size={14} /> {copiado ? "Link Copiado!" : "Copiar Link"}
                                </button>
                            </div>
                        </div>

                        {/* KPIS TOTAIS - LADO DIREITO HEADER */}
                        <div className="relative z-10 w-full md:w-auto grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Lote a Receber</span>
                                <div className="text-2xl font-black text-emerald-400 tracking-tighter">R$ {kpis.comissaoValidada.toFixed(2)}</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Em Negociação</span>
                                <div className="text-2xl font-black text-white tracking-tighter">R$ {kpis.comissaoPendente.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>

                    {/* NAVEGAÇÃO DE ABAS */}
                    <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-full w-fit">
                        <button onClick={() => setActiveTab("dashboard")} className={`px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "dashboard" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>Resumo Mensal</button>
                        <button onClick={() => setActiveTab("pipeline")} className={`px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "pipeline" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>Meu Pipeline</button>
                    </div>

                    {activeTab === "dashboard" ? (
                        <div className="space-y-8 mb-20 animate-in fade-in duration-500">
                            {/* CARDS DE KPI INFERIORES */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                                {/* NOVO CARD: CADASTRADOS (LEADS) */}
                                <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6">
                                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0">
                                        <Users className="text-purple-600" size={24} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Cadastros (Leads)</span>
                                        <div className="text-3xl font-black text-gray-900 tracking-tighter">{kpis.condominiosIndicados}</div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                                        <Building className="text-blue-600" size={24} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Condomínios Fechados</span>
                                        <div className="text-3xl font-black text-gray-900 tracking-tighter">{kpis.condominiosAtivos}</div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6">
                                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                                        <BarChart3 className="text-amber-500" size={24} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Taxa de Conversão</span>
                                        <div className="text-3xl font-black text-gray-900 tracking-tighter">{kpis.taxaConversao}%</div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6">
                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                                        <Wallet className="text-emerald-500" size={24} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Próximo Acerto</span>
                                        <div className="text-lg font-black text-gray-900 tracking-tight">10/Nov</div>
                                    </div>
                                </div>
                            </div>

                            {/* CARD DE AVISO COMERCIAL */}
                            <div className="bg-blue-50 border border-blue-100 p-8 rounded-[2.5rem] flex items-start gap-4">
                                <Award className="text-blue-600 shrink-0 mt-1" size={24} />
                                <div>
                                    <h4 className="text-sm font-bold text-blue-900 mb-2">Bônus de Volume Acelerado</h4>
                                    <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                        Atingindo 5 condomínios validados neste lote, você desbloqueia o <strong>multiplicador de 1.5x</strong> nas comissões de todos os fechamentos do mês subsequente. Acelere seus fechamentos!
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-20 animate-in fade-in duration-500">
                            <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Building size={18} className="text-blue-600" />
                                        <h3 className="text-sm font-black uppercase tracking-widest">Contratos / Leads - Selecionado</h3>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400">{vendasLote.length} registros</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left table-fixed">
                                        <thead className="bg-gray-50 text-[9px] font-black uppercase text-gray-400">
                                            <tr>
                                                <th className="px-8 py-5 w-[40%]">Condomínio / Lead</th>
                                                <th className="px-8 py-5 w-[20%]">Data Inclusão</th>
                                                <th className="px-8 py-5 w-[20%]">Status CRM</th>
                                                <th className="px-8 py-5 w-[20%] text-right">Comissão R$</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {vendasLote.length > 0 ? vendasLote.map((item, i) => (
                                                <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <span className="text-sm font-bold text-gray-900 block truncate">{item.condominio}</span>
                                                        <span className="text-[10px] font-medium text-gray-400">
                                                            {item.valor_bruto > 0 ? `Vol. R$ ${item.valor_bruto.toFixed(2)}` : 'Aguardando Compra'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-xs text-gray-500">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                                                    <td className="px-8 py-6">
                                                        <span className={`flex items-center gap-1.5 w-fit text-[9px] font-black uppercase px-3 py-1.5 rounded-full whitespace-nowrap ${item.status === 'validado' ? 'bg-emerald-50 text-emerald-600' :
                                                            item.status === 'pendente' ? 'bg-amber-50 text-amber-600' :
                                                                'bg-blue-50 text-blue-600'
                                                            }`}>
                                                            {item.status === 'validado' ? <CheckCircle2 size={12} /> :
                                                                item.status === 'pendente' ? <Clock size={12} /> :
                                                                    <UserPlus size={12} />}

                                                            {item.status === 'validado' ? 'Fechado/Validado' :
                                                                item.status === 'pendente' ? 'Em Negociação' :
                                                                    'Apenas Cadastrado'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right font-black text-gray-900">
                                                        {item.status === 'validado' ? (
                                                            <span className="text-emerald-600">R$ {item.comissao.toFixed(2)}</span>
                                                        ) : item.status === 'pendente' ? (
                                                            <span className="text-gray-400">Proj: R$ {item.comissao.toFixed(2)}</span>
                                                        ) : (
                                                            <span className="text-gray-300">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={4} className="px-10 py-16 text-center text-gray-400 italic">Nenhum registro neste lote ainda.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* FOOTER: CONECTE-SE */}
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
                        Insights comerciais, novidades e bastidores da Nucleobase diretamente no seu feed.
                    </p>
                </div>

                <a
                    href="https://www.instagram.com/nucleobase.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick("Instagram - Consultoria", "https://www.instagram.com/nucleobase.app/")}
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
        </div>
    );
}