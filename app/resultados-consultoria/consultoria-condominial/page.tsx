// app/resultados-consultoria/consultoria-condominial/page.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
    TrendingUp, Target, Award, CalendarDays, Wallet,
    Building, CheckCircle2, Clock, Megaphone, Share2, MessageCircle,
    AtSign, Key, Eye, EyeOff, Instagram, BarChart3, Briefcase, Users, UserPlus, XCircle, Plus, X, Pencil
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLoginProtegido } from "@/hooks/useLoginProtegido";

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

    const [activeTab, setActiveTab] = useState<"dashboard" | "pipeline" | "manutencao">("dashboard");
    const [loadingData, setLoadingData] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const [userId, setUserId] = useState<string>("");
    const [userSlug, setUserSlug] = useState<string>("");
    const [userName, setUserName] = useState<string>("Consultor");
    const [baseUrl, setBaseUrl] = useState("");

    // Estado para armazenar as regras de comissionamento dinâmicas (Venda e Manutenção)
    const [regrasComissao, setRegrasComissao] = useState({
        comissaoBase: 0.30,
        metaBonus: 5,
        multiplicador: 1.5,
        comissaoManutencao: 0.10
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
    const [novoLead, setNovoLead] = useState({
        nome_condominio: "",
        nome_contato: "",
        telefone_contato: "",
        email_contato: "",
        unidades: 1,
        status: "prospeccao"
    });
    const [loadingSalvarLead, setLoadingSalvarLead] = useState(false);

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

            // =========================================================================
            // 1. LÓGICA DE REGRAS POR CONSULTOR E "ÉPOCAS"
            // =========================================================================
            // Busca apenas regras ativas. O .or busca globais (null) ou específicas do consultor
            const { data: regrasData } = await supabase
                .from('regras_comissao')
                .select('*')
                .eq('ativo', true)
                .or(`consultor_id.is.null,consultor_id.eq.${user.id}`)
                .in('plano_alvo', ['condo', 'condo_manutencao']);

            // Função para priorizar a regra do consultor sobre a regra global
            const getRegraPrioritaria = (tipoPlano: string) => {
                const regrasDoPlano = regrasData?.filter(r => r.plano_alvo === tipoPlano) || [];
                const especifica = regrasDoPlano.find(r => r.consultor_id === user.id);
                const global = regrasDoPlano.find(r => r.consultor_id === null);
                return especifica || global;
            };

            const regraVenda = getRegraPrioritaria('condo');
            const regraManutencao = getRegraPrioritaria('condo_manutencao');

            const taxaComissaoBase = regraVenda?.comissao_base_percentual ? Number(regraVenda.comissao_base_percentual) : 0.30;
            const metaBonus = regraVenda?.meta_leads_bonus ? Number(regraVenda.meta_leads_bonus) : 5;
            const multiplicadorBonus = regraVenda?.multiplicador_bonus ? Number(regraVenda.multiplicador_bonus) : 1.5;

            const taxaComissaoManutencao = regraManutencao?.comissao_base_percentual ? Number(regraManutencao.comissao_base_percentual) : 0.10;

            setRegrasComissao({
                comissaoBase: taxaComissaoBase,
                metaBonus,
                multiplicador: multiplicadorBonus,
                comissaoManutencao: taxaComissaoManutencao
            });

            // =========================================================================
            // PROFILE E DATAS
            // =========================================================================
            const { data: profile } = await supabase
                .from('profiles')
                .select('slug, nome_completo')
                .eq('id', user.id)
                .maybeSingle();

            setUserName(profile?.nome_completo || user.email?.split('@')[0] || "Consultor");
            setUserSlug(profile?.slug || user.id);

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

            // =========================================================================
            // BUSCA DE LEADS COM O SNAPSHOT DE COMISSÃO
            // =========================================================================
            const { data: leadsData } = await supabase
                .from('nucleo_leads')
                .select('*')
                .eq('consultor_id', user.id)
                .gte('created_at', primeiroDiaMes)
                .lte('created_at', ultimoDiaMes);

            const { data: indData } = await supabase
                .from('indicacoes')
                .select('*')
                .eq('indicador_id', user.id)
                .gte('created_at', primeiroDiaMes)
                .lte('created_at', ultimoDiaMes);

            const leads = (leadsData || []).map(item => ({
                id: item.id,
                titulo: item.nome_condominio || 'Lead CRM',
                status_crm: item.status,
                valor_projetado: Number(item.valor_projetado || 0),
                valor_fechado: Number(item.valor_fechado || 0),
                taxa_comissao_aplicada: item.taxa_comissao_aplicada ? Number(item.taxa_comissao_aplicada) : null, // Novo campo
                created_at: item.created_at,
                origem: 'crm',
                raw: item
            }));

            const indicacoes = (indData || []).map(item => ({
                id: item.id,
                titulo: item.email_indicado || 'Lead via Link',
                status_crm: item.status === 'efetivado' ? 'ganho' : 'prospeccao',
                valor_projetado: item.status === 'pendente' || !item.status ? 69.90 : 0,
                valor_fechado: item.status === 'efetivado' ? 69.90 : 0,
                taxa_comissao_aplicada: item.taxa_comissao_aplicada ? Number(item.taxa_comissao_aplicada) : null, // Novo campo
                created_at: item.created_at,
                origem: 'link',
                raw: item
            }));

            const todosRegistros = [...leads, ...indicacoes].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setVendasLote(todosRegistros);

            // =========================================================================
            // CÁLCULO FINANCEIRO SEGURO (MISTURANDO SNAPSHOT E FALLBACK)
            // =========================================================================
            const totalIndicados = todosRegistros.length;
            const ganhos = todosRegistros.filter(l => l.status_crm === 'ganho');
            const emNegociacao = todosRegistros.filter(l => l.status_crm === 'negociacao' || l.status_crm === 'apresentacao' || l.status_crm === 'prospeccao');

            const totalAtivos = ganhos.length;

            let comissaoValidadas = 0;
            ganhos.forEach(l => {
                // Tenta usar o snapshot do banco (leads novos). Se não tiver (leads antigos), usa a regra vigente do painel
                const taxaBaseDoLead = l.taxa_comissao_aplicada !== null ? l.taxa_comissao_aplicada : taxaComissaoBase;
                const taxaFinalParaCalculo = totalAtivos >= metaBonus ? taxaBaseDoLead * multiplicadorBonus : taxaBaseDoLead;
                comissaoValidadas += l.valor_fechado * taxaFinalParaCalculo;
            });

            let comissaoPendentes = 0;
            emNegociacao.forEach(l => {
                const taxaBaseDoLead = l.taxa_comissao_aplicada !== null ? l.taxa_comissao_aplicada : taxaComissaoBase;
                const taxaFinalParaCalculo = totalAtivos >= metaBonus ? taxaBaseDoLead * multiplicadorBonus : taxaBaseDoLead;
                comissaoPendentes += l.valor_projetado * taxaFinalParaCalculo;
            });

            const conversaoCalc = totalIndicados > 0 ? (totalAtivos / totalIndicados) * 100 : 0;

            setKpis({
                condominiosIndicados: totalIndicados,
                condominiosAtivos: totalAtivos,
                comissaoValidada: comissaoValidadas,
                comissaoPendente: comissaoPendentes,
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
    }, [fetchConsultorData, mesSelecionado]);

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

    const abrirModalNovoLead = () => {
        setEditingLeadId(null);
        setNovoLead({ nome_condominio: "", nome_contato: "", telefone_contato: "", email_contato: "", unidades: 1, status: "prospeccao" });
        setIsModalOpen(true);
    };

    const abrirModalEditarLead = (item: any) => {
        if (item.origem !== 'crm') return;
        setEditingLeadId(item.id);
        const r = item.raw || {};
        const unidadesEstimadas = r.valor_projetado > 0 ? Math.round(r.valor_projetado / 7.00) : (r.valor_fechado > 0 ? Math.round(r.valor_fechado / 7.00) : 1);
        setNovoLead({
            nome_condominio: r.nome_condominio || item.titulo || "",
            nome_contato: r.nome_contato || "",
            telefone_contato: r.telefone_contato || "",
            email_contato: r.email_contato || "",
            unidades: unidadesEstimadas > 0 ? unidadesEstimadas : 1,
            status: r.status || item.status_crm || "prospeccao"
        });
        setIsModalOpen(true);
    };

    const handleSalvarLeadManual = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setLoadingSalvarLead(true);

        try {
            const valorCalculado = Math.max(Number(novoLead.unidades) * 7.00, 69.90);
            const valorProjetadoFinal = novoLead.status === 'ganho' ? 0 : valorCalculado;
            const valorFechadoFinal = novoLead.status === 'ganho' ? valorCalculado : 0;

            if (editingLeadId) {
                // Atualização: Propósito de preservar o snapshot histórico, não alteramos a taxa congelada
                const { error } = await supabase.from('nucleo_leads').update({
                    nome_condominio: novoLead.nome_condominio,
                    nome_contato: novoLead.nome_contato,
                    telefone_contato: novoLead.telefone_contato,
                    email_contato: novoLead.email_contato,
                    status: novoLead.status,
                    valor_projetado: valorProjetadoFinal,
                    valor_fechado: valorFechadoFinal
                }).eq('id', editingLeadId);

                if (error) throw error;
            } else {
                // Inserção nova: AQUI É O PULO DO GATO! Salvamos a taxa de comissão VIGENTE congelando-a no lead
                const { error } = await supabase.from('nucleo_leads').insert([
                    {
                        consultor_id: userId,
                        nome_condominio: novoLead.nome_condominio,
                        nome_contato: novoLead.nome_contato,
                        telefone_contato: novoLead.telefone_contato,
                        email_contato: novoLead.email_contato,
                        status: novoLead.status,
                        valor_projetado: valorProjetadoFinal,
                        valor_fechado: valorFechadoFinal,
                        taxa_comissao_aplicada: regrasComissao.comissaoBase // Snapshot da regra!
                    }
                ]);

                if (error) throw error;
            }

            setIsModalOpen(false);
            setEditingLeadId(null);
            setNovoLead({ nome_condominio: "", nome_contato: "", telefone_contato: "", email_contato: "", unidades: 1, status: "prospeccao" });
            fetchConsultorData({ id: userId }, mesSelecionado);
        } catch (err: any) {
            console.error("Erro ao salvar lead:", err);
            alert("Erro ao salvar lead. Verifique os campos.");
        } finally {
            setLoadingSalvarLead(false);
        }
    };

    if (loadingData) return (
        <div className="w-full h-[60vh] flex items-center justify-center">
            <div className="animate-pulse text-gray-400 font-black uppercase tracking-widest text-[10px]">Carregando Dashboard...</div>
        </div>
    );

    return (
        <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-blue-900 mb-1 tracking-tight flex items-center">
                        <span className="md:inline hidden">Sua performance vale <span className="text-emerald-500">Ouro</span><span className="text-blue-900">.</span></span>
                        <span className="inline md:hidden">Sua performance é <span className="text-emerald-500">Ouro</span><span className="text-blue-900">.</span></span>
                        <Target size={32} className="text-emerald-500 opacity-85 ml-3" />
                    </h1>
                    <h2 className="text-gray-500 text-base md:text-lg font-medium leading-relaxed">
                        <span className="md:inline hidden">Painel do Consultor Condominial. Acompanhe suas metas e fechamentos.</span>
                        <span className="inline md:hidden">Painel Consultor. Acompanhe metas e fechamentos.</span>
                    </h2>
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

            <div className="flex items-center gap-4 mb-2 relative">
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
                    Acesso ao Dashboard
                </h3>
                <div className="h-px bg-gray-300 flex-1"></div>

                {userId && (
                    <div className="relative group flex items-center">
                        <button
                            onClick={abrirModalNovoLead}
                            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer"
                        >
                            <Plus size={16} strokeWidth={3} />
                        </button>
                        <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-20 pointer-events-none">
                            Inclua seus leads
                        </div>
                    </div>
                )}
            </div>

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
                <div className="mt-6 animate-in fade-in duration-500">

                    <div className="bg-gray-900 rounded-[2.5rem] p-6 md:p-10 mb-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="absolute -right-10 -bottom-10 opacity-10">
                            <TrendingUp size={200} />
                        </div>

                        <div className="relative z-10 md:w-1/2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2 block">Ação Rápida</span>
                            <h3 className="text-2xl font-bold text-white mb-2">Enviar proposta comercial</h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">
                                <span className="md:inline hidden">Use seu link exclusivo para garantir o trackeamento automático em novos fechamentos.</span>
                                <span className="inline md:hidden">Use seu link para trackeamento automático em novos fechamentos.</span>
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

                        <div className="relative z-10 w-full md:w-auto grid grid-cols-2 gap-3 md:gap-4">
                            <div className="bg-white/5 border border-white/10 p-3.5 md:p-5 rounded-2xl backdrop-blur-md">
                                <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 md:mb-2">Lote Faturado</span>
                                <div className="text-lg md:text-2xl font-black text-emerald-400 tracking-tighter">R$ {kpis.comissaoValidada.toFixed(2)}</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-3.5 md:p-5 rounded-2xl backdrop-blur-md">
                                <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 md:mb-2">Em Negociação</span>
                                <div className="text-lg md:text-2xl font-black text-white tracking-tighter">R$ {kpis.comissaoPendente.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-full w-fit">
                        <button onClick={() => setActiveTab("dashboard")} className={`px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "dashboard" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>
                            {mesSelecionado === 'acumulado' ? 'Resumo Acumulado' : 'Resumo Mensal'}
                        </button>
                        <button onClick={() => setActiveTab("manutencao")} className={`px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "manutencao" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500"}`}>
                            Manutenção
                        </button>
                        <button onClick={() => setActiveTab("pipeline")} className={`px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "pipeline" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>
                            Meu Pipeline
                        </button>
                    </div>

                    {activeTab === "dashboard" && (
                        <div className="space-y-8 mb-20 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Condomínios Convertidos</span>
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

                            <div className="bg-blue-50 border border-blue-100 p-8 rounded-[2.5rem] flex items-start gap-4">
                                <Award className="text-blue-600 shrink-0 mt-1" size={24} />
                                <div>
                                    <h4 className="text-sm font-bold text-blue-900 mb-2">Bônus de Volume Acelerado</h4>
                                    <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                        <span className="md:inline hidden">Atingindo {regrasComissao.metaBonus} condomínios validados neste lote, você desbloqueia o <strong>multiplicador de {regrasComissao.multiplicador}x</strong> nas comissões de todos os fechamentos do mês subsequente.</span>
                                        <span className="inline md:hidden">Atingindo {regrasComissao.metaBonus} condomínios validados neste lote, você desbloqueia o <strong>multiplicador de {regrasComissao.multiplicador}x</strong> em comissões.</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "manutencao" && (
                        <div className="space-y-8 mb-20 animate-in fade-in duration-500">
                            <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm p-8">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                                        <Award className="text-emerald-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Bônus de Manutenção (Receita Recorrente)</h3>
                                        <p className="text-sm text-gray-500 font-medium">Sua renda passiva garantida pelos clientes que você ajudou a fidelizar.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Clientes Ativos Elegíveis</span>
                                        <div className="text-3xl font-black text-gray-900 tracking-tighter">{kpis.condominiosAtivos}</div>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden">
                                        <div className="absolute -right-4 -top-4 opacity-5">
                                            <TrendingUp size={100} />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 relative z-10">Receita Recorrente Estimada</span>
                                        <div className="text-3xl font-black text-emerald-600 tracking-tighter relative z-10">
                                            R$ {((vendasLote.filter(l => l.status_crm === 'ganho').reduce((acc, l) => acc + l.valor_fechado, 0)) * regrasComissao.comissaoManutencao).toFixed(2)}
                                            <span className="text-sm text-gray-400 font-bold ml-1">/mês</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
                                    <Clock className="text-blue-600 shrink-0 mt-1" size={20} />
                                    <div>
                                        <h4 className="text-sm font-bold text-blue-900 mb-2">Como funciona a Manutenção?</h4>
                                        <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                            Acreditamos que o seu trabalho deve continuar gerando frutos a longo prazo. No primeiro mês da ativação, você recebe a comissão integral pela venda (que pode chegar a 45% com o acelerador). A partir do <strong>segundo mês em diante</strong>, você passa a receber <strong>{(regrasComissao.comissaoManutencao * 100).toFixed(0)}% todo mês</strong> sobre o valor do plano, enquanto o cliente estiver ativo na base da Nucleobase. O plano perfeito para manter você motivado e construindo um funil sólido!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "pipeline" && (
                        <div className="mb-20 animate-in fade-in duration-500">
                            <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Building size={18} className="text-blue-600" />
                                        <h3 className="text-sm font-black uppercase tracking-widest">Pipeline de Negociações</h3>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400">{vendasLote.length} registros</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left table-fixed min-w-[700px]">
                                        <thead className="bg-gray-50 text-[9px] font-black uppercase text-gray-400">
                                            <tr>
                                                <th className="px-8 py-5 w-[35%]">Condomínio / Lead</th>
                                                <th className="px-8 py-5 w-[20%]">Data Entrada</th>
                                                <th className="px-8 py-5 w-[20%]">Status CRM</th>
                                                <th className="px-8 py-5 w-[15%] text-right">Comissão R$</th>
                                                <th className="px-8 py-5 w-[10%] text-center">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {vendasLote.length > 0 ? vendasLote.map((item, i) => {
                                                const isGanho = item.status_crm === 'ganho';
                                                const isPerdido = item.status_crm === 'perdido';
                                                const isNegociacao = item.status_crm === 'negociacao' || item.status_crm === 'apresentacao' || item.status_crm === 'prospeccao';
                                                const isAdicionadoCrm = item.origem === 'crm';

                                                // Logica de cálculo usando snapshot (se existente)
                                                const baseLead = item.taxa_comissao_aplicada !== null ? item.taxa_comissao_aplicada : regrasComissao.comissaoBase;
                                                const taxaFinalParaTabela = kpis.condominiosAtivos >= regrasComissao.metaBonus ? baseLead * regrasComissao.multiplicador : baseLead;

                                                return (
                                                    <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-8 py-6">
                                                            <span className="text-sm font-bold text-gray-900 block truncate">{item.titulo}</span>
                                                            <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1.5 mt-1">
                                                                {item.origem === 'link' ? <Megaphone size={11} className="text-amber-500" /> : <Briefcase size={11} className="text-blue-500" />}
                                                                {item.origem === 'link' ? 'Via Link de Indicação' : 'Adicionado no CRM'}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6 text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString('pt-BR')}</td>
                                                        <td className="px-8 py-6">
                                                            <span className={`flex items-center gap-1.5 w-fit text-[9px] font-black uppercase px-3 py-1.5 rounded-full whitespace-nowrap 
                                                                ${isGanho ? 'bg-emerald-50 text-emerald-600' :
                                                                    isPerdido ? 'bg-red-50 text-red-600' :
                                                                        isNegociacao ? 'bg-amber-50 text-amber-600' :
                                                                            'bg-blue-50 text-blue-600'
                                                                }`}>

                                                                {isGanho ? <CheckCircle2 size={12} /> :
                                                                    isPerdido ? <XCircle size={12} /> :
                                                                        isNegociacao ? <Clock size={12} /> :
                                                                            <UserPlus size={12} />}

                                                                {isGanho ? 'Fechado/Ganho' :
                                                                    isPerdido ? 'Perdido' :
                                                                        isNegociacao ? 'Em Negociação' :
                                                                            'Prospecção'}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6 text-right font-black text-gray-900">
                                                            {isGanho ? (
                                                                <span className="text-emerald-600">R$ {(item.valor_fechado * taxaFinalParaTabela).toFixed(2)}</span>
                                                            ) : isNegociacao ? (
                                                                <span className="text-gray-400">R$ {(item.valor_projetado * taxaFinalParaTabela).toFixed(2)}</span>
                                                            ) : (
                                                                <span className="text-gray-300">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-6 text-center">
                                                            {isAdicionadoCrm ? (
                                                                <button
                                                                    onClick={() => abrirModalEditarLead(item)}
                                                                    className="w-8 h-8 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl inline-flex items-center justify-center transition-colors cursor-pointer"
                                                                    title="Editar lead"
                                                                >
                                                                    <Pencil size={14} />
                                                                </button>
                                                            ) : (
                                                                <span className="text-gray-300 text-xs">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr><td colSpan={5} className="px-10 py-16 text-center text-gray-400 italic">Nenhum registro neste lote ainda.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Popup / Modal para Inclusão ou Edição de Lead Manual na nucleo_leads */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative overflow-hidden">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-blue-900 mb-1">{editingLeadId ? "Editar Lead do CRM" : "Cadastrar Novo Lead"}</h3>
                        <p className="text-xs text-gray-500 font-medium mb-6">{editingLeadId ? "Atualize os dados do condomínio." : "Insira os dados do condomínio prospecção para o seu CRM."}</p>

                        <form onSubmit={handleSalvarLeadManual} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Nome do Condomínio *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Condomínio Edifício Bella Vista"
                                    value={novoLead.nome_condominio}
                                    onChange={(e) => setNovoLead({ ...novoLead, nome_condominio: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-xs font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Nome do Contato (Síndico)</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Carlos Silva"
                                        value={novoLead.nome_contato}
                                        onChange={(e) => setNovoLead({ ...novoLead, nome_contato: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-xs font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Telefone</label>
                                    <input
                                        type="text"
                                        placeholder="(31) 99999-9999"
                                        value={novoLead.telefone_contato}
                                        onChange={(e) => setNovoLead({ ...novoLead, telefone_contato: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-xs font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">E-mail</label>
                                    <input
                                        type="email"
                                        placeholder="contato@condominio.com"
                                        value={novoLead.email_contato}
                                        onChange={(e) => setNovoLead({ ...novoLead, email_contato: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-xs font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Nº de Unidades</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={novoLead.unidades}
                                        onChange={(e) => setNovoLead({ ...novoLead, unidades: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-xs font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Status Inicial no Funil</label>
                                <select
                                    value={novoLead.status}
                                    onChange={(e) => setNovoLead({ ...novoLead, status: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-xs font-bold"
                                >
                                    <option value="prospeccao">Prospecção</option>
                                    <option value="apresentacao">Apresentação</option>
                                    <option value="negociacao">Negociação</option>
                                    <option value="ganho">Fechado/Ganho</option>
                                    <option value="perdido">Perdido</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setEditingLeadId(null); }}
                                    className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loadingSalvarLead}
                                    className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition shadow-lg cursor-pointer disabled:opacity-50"
                                >
                                    {loadingSalvarLead ? "Salvando..." : editingLeadId ? "Atualizar Lead" : "Salvar Lead"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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