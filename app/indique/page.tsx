"use client";
import React, { useState, useEffect, useCallback } from "react";
import { 
  Share2, Users, Check, Megaphone, 
  ArrowUpRight, Mail, Send, MessageCircle, 
  Trophy, Gift, Stars, Heart, Eye, EyeOff, AtSign,
  History, TrendingUp, ChevronLeft, ChevronRight,
  Instagram
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 

export default function IndiquePage() {
  // --- ESTADOS DE UI E NAVEGAÇÃO ---
  const [activeTab, setActiveTab] = useState<"comunidade" | "partner">("comunidade");
  const [loadingData, setLoadingData] = useState(true);
  const [cardAtivo, setCardAtivo] = useState(0);
  
  // --- ESTADOS DE AUTENTICAÇÃO ---
  const [slug, setSlug] = useState(""); 
  const [password, setPassword] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- DADOS DO USUÁRIO ---
  const [userId, setUserId] = useState<string>("");
  const [userSlug, setUserSlug] = useState<string>("");
  const [userName, setUserName] = useState<string>("Um amigo");
  const [baseUrl, setBaseUrl] = useState("");
  
  // --- MÉTRICAS DE INDICAÇÃO ---
  const [contagem, setContagem] = useState(0); 
  const [indicadosLista, setIndicadosLista] = useState<any[]>([]);
  const [copiado, setCopiado] = useState(false);
  const [emailInvite, setEmailInvite] = useState("");
  const [inviteEnviado, setInviteEnviado] = useState(false);

  // --- MÉTRICAS FINANCEIRAS ---
  const [vendas, setVendas] = useState<any[]>([]);
  const [saldoValidado, setSaldoValidado] = useState(0);
  const [saldoPendente, setSaldoPendente] = useState(0);
  const [pixKey, setPixKey] = useState("");
  const [solicitandoSaque, setSolicitandoSaque] = useState(false);

  const fetchAllUserData = useCallback(async (user: any) => {
    setLoadingData(true);
    try {
      setUserId(user.id);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('slug, nome_completo')
        .eq('id', user.id)
        .single();

      setUserName(profile?.nome_completo || user.user_metadata?.full_name || user.email?.split('@')[0] || "Um amigo");
      setUserSlug(profile?.slug || user.id);

      // Busca de indicações (Contagem)
      const { data: indData, error: indError, count } = await supabase
        .from("indicacoes")
        .select('id, created_at, status, indicado_id, email_indicado', { count: 'exact' })
        .eq('indicador_id', user.id)
        .order('created_at', { ascending: false });

      if (indError) console.error("Erro indicações:", indError);
      setContagem(count || 0);

      if (indData && indData.length > 0) {
        const enriquecidos = await Promise.all(indData.map(async (item) => {
          if (!item.indicado_id) return { ...item, cracha: "NUC-PROCESS", plano: 'free' };

          const { data: userData } = await supabase
            .from('usuarios')
            .select('num_cracha')
            .eq('id', item.indicado_id)
            .maybeSingle();

          const { data: profileData } = await supabase
            .from('profiles')
            .select('plan_type')
            .eq('id', item.indicado_id)
            .maybeSingle();

          return {
            ...item,
            cracha: userData?.num_cracha || "NUC-PROCESS",
            plano: profileData?.plan_type || 'free'
          };
        }));
        setIndicadosLista(enriquecidos);
      } else {
        setIndicadosLista([]);
      }

      // AJUSTE SEGURO PARA O ERRO 400: Busca simples sem join complexo primeiro
      const { data: vendasData, error: vendasError } = await supabase
        .from('afiliados_vendas')
        .select('*') 
        .eq('consultor_id', user.id)
        .order('created_at', { ascending: false });

      if (vendasError) {
        console.error("Erro na busca de vendas:", vendasError);
      } else if (vendasData) {
        // Enriquecemos os dados manualmente para evitar o erro de relação no banco
        const vendasEnriquecidas = await Promise.all(vendasData.map(async (venda) => {
          const { data: uData } = await supabase
            .from('usuarios')
            .select('num_cracha')
            .eq('id', venda.indicado_id) // Assume que indicado_id é a FK
            .maybeSingle();
          return { ...venda, usuarios: uData };
        }));

        setVendas(vendasEnriquecidas);
        setSaldoValidado(vendasData.filter(v => v.status === 'validado').reduce((acc, v) => acc + v.valor_comissao, 0));
        setSaldoPendente(vendasData.filter(v => v.status === 'pendente').reduce((acc, v) => acc + v.valor_comissao, 0));
      }

    } catch (err) {
      console.error("Erro crítico ao carregar dados:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") setBaseUrl(window.location.origin);
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchAllUserData(session.user);
      else setLoadingData(false);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchAllUserData(session.user);
      else {
        setUserId(""); setUserSlug(""); setUserName("Um amigo"); setLoadingData(false);
      }
    });
    checkUser();
    return () => subscription.unsubscribe();
  }, [fetchAllUserData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLogin(true);
    const inputAcesso = slug.trim().toLowerCase();
    const isEmail = inputAcesso.includes("@");
    try {
      let emailParaLogin = isEmail ? inputAcesso : "";
      if (!isEmail) {
        const { data: p } = await supabase.from('profiles').select('email').eq('slug', inputAcesso).maybeSingle();
        if (!p?.email) { alert("ID não encontrado."); setLoadingLogin(false); return; }
        emailParaLogin = p.email;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: emailParaLogin, password });
      if (error) alert("Erro ao acessar: Verifique seus dados.");
    } catch (err) { alert("Erro inesperado."); } finally { setLoadingLogin(false); }
  };

  const linkIndicacao = userSlug && baseUrl ? `${baseUrl}/indique/${userSlug}` : "";

  const handleCopy = () => {
    if (!linkIndicacao) return;
    navigator.clipboard.writeText(linkIndicacao);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInvite) return;
    const subject = encodeURIComponent(`${userName} convidou você para a Nucleobase`);
    const body = encodeURIComponent(`Olá,\n\nSeu contato ${userName} está utilizando a Nucleobase e indicou para você.\n\nAcesse: ${linkIndicacao}`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${emailInvite}&su=${subject}&body=${body}`, '_blank');
    setInviteEnviado(true);
    setTimeout(() => { setInviteEnviado(false); setEmailInvite(""); }, 4000);
  };

  const handleWhatsAppInvite = () => {
    const text = encodeURIComponent(`Olá! Estou usando a Nucleobase para organizar minha vida financeira e acho que você vai curtir também: ${linkIndicacao}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSaque = async () => {
    if (!pixKey || saldoValidado < 20) { alert("Mínimo R$ 20,00 e chave PIX obrigatória."); return; }
    setSolicitandoSaque(true);
    const { error } = await supabase.from('afiliados_saques').insert({
      consultor_id: userId, valor: saldoValidado, pix_qrcode_url: pixKey, status: 'solicitado'
    });
    if (!error) {
      alert("Pedido de saque enviado com sucesso!");
      setPixKey("");
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchAllUserData(session.user);
    }
    setSolicitandoSaque(false);
  };

  const cardsRecompensa = [
    { meta: "Meritocracia", premio: "Valor x Indicação", desc: "Receba o bônus de R$ 5,00 x Essencial | R$ 10,00 x Pro para cada conta ativada.", icon: <Gift className="text-blue-500" /> },
    { meta: "Benefícios extras", premio: "+ Troféu afiliado", desc: "Acima de 10 indicações, além do cash x ativação, libere templates exclusivos e suporte prioritário.", icon: <Trophy className="text-amber-500" /> },
    { meta: "Embaixador Master", premio: "+ Brindes únicos", desc: "Acima de 30 indicações, você se tornará parte desta história e ganhará brindes especiais.", icon: <Stars className="text-purple-500" /> },
    { meta: "Clareza", premio: "Crescemos Juntos", desc: "Cada indicação fortalece nossa rede e expande o poder de compra da nossa comunidade.", icon: <Heart className="text-red-500" /> }
  ];

  if (loadingData) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-400 font-black uppercase tracking-widest text-[10px]">Sincronizando Plataforma...</div>
      </div>
    );
  }

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER PADRONIZADO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Sua gestão vale <span className="text-amber-500">Ouro</span><span className="text-blue-600">.</span></span>
            <Megaphone size={32} className="text-amber-500 opacity-35 ml-3 -rotate-12" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium w-full leading-relaxed mt-0">
            Compartilhe clareza e seja recompensado por fortalecer nossa rede.
          </h2>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Regras do Motor <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {userId ? (
        <>
          <div className="w-full bg-blue-50/40 border-l-4 border-blue-600 p-6 mb-8 rounded-r-2xl transition-all">
            <p className="font-medium text-blue-900 italic text-base leading-relaxed hidden md:block">
              Olá, <span className="font-bold">{userName.split(' ')[0]}</span>! Sua influência transformará a gestão das pessoas, por isso você está no coração do nosso motor de crescimento. 
              Use a aba <strong className="text-blue-700">Comunidade</strong> para ajudar amigos e familiares a realizarem controles efetivos. Na aba <strong className="text-blue-700">Consultor Partner</strong> você poderá fazer seu acompanhamento de "Indicações", solicitando comissões e recebendo prêmios reais.
            </p>
            <p className="font-medium text-blue-900 italic text-sm leading-relaxed md:hidden">
              Olá, <span className="font-bold">{userName.split(' ')[0]}</span>! Você está no coração do nosso motor. Indique e acompanhe suas recompensas nas abas abaixo.
            </p>
          </div>

          <div className="flex gap-2 mb-10 bg-gray-100 p-1 rounded-full w-fit">
            <button 
              onClick={() => setActiveTab("comunidade")}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "comunidade" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Comunidade
            </button>
            <button 
              onClick={() => setActiveTab("partner")}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "partner" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Consultor Partner
            </button>
          </div>

          {activeTab === "comunidade" ? (
            <div className="space-y-12 mb-20 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-8 bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Share2 size={16} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Link de Cadastro Gratuito</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center bg-gray-50 rounded-3xl p-2 border border-gray-100 w-full">
                    <code className="flex-1 text-xs font-mono text-blue-600 px-6 py-4 truncate w-full">{linkIndicacao}</code>
                    <button onClick={handleCopy} className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg ${copiado ? "bg-emerald-500 text-white" : "bg-gray-900 text-white"}`}>
                      {copiado ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                </div>

                <div className="hidden lg:flex lg:col-span-4 bg-blue-600 rounded-[2.5rem] p-10 text-white flex-col items-center justify-center relative overflow-hidden shadow-2xl group">
                  <Users size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] mb-4 opacity-80 relative z-10">Cadastros indicados</span>
                  <span className="text-8xl font-black leading-none relative z-10 tabular-nums">{contagem.toString().padStart(2, '0')}</span>
                </div>
                
                <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-blue-50 rounded-3xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <Users size={20} className="text-blue-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-900">Cadastros indicados</span>
                    </div>
                    <span className="text-3xl font-black text-blue-600 tabular-nums">{contagem.toString().padStart(2, '0')}</span>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-blue-600" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Relação de Pessoas Indicadas</h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[9px] font-black uppercase text-gray-400">
                      <tr>
                        <th className="px-10 py-5">Código Membro Indicado</th>
                        <th className="px-10 py-5">Data do Cadastro</th>
                        <th className="px-10 py-5">Status Plano</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {indicadosLista.length > 0 ? indicadosLista.map((item, i) => {
                        const isActive = item.plano !== 'free';
                        return (
                          <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="px-10 py-6 text-sm font-mono font-bold text-blue-600">{item.cracha}</td>
                            <td className="px-10 py-6 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString('pt-BR')}</td>
                            <td className="px-10 py-6">
                              <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                {isActive ? 'Ativo' : 'Pendente/Free'}
                              </span>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={3} className="px-10 py-16 text-center text-gray-400 text-xs italic font-medium">Nenhum indicado encontrado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="w-full">
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-4">
                  Envio Direto <div className="h-px bg-gray-300 flex-1"></div>
                </h3>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8">
                <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-50 shadow-sm flex flex-col">
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-4 md:mb-6 text-center md:text-left">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Mail size={20} className="md:w-6 md:h-6" /></div>
                    <h3 className="font-bold text-gray-900 uppercase text-[10px] md:text-sm">E-mail</h3>
                  </div>
                  <form onSubmit={handleSendInvite} className="w-full space-y-3">
                    <input 
                      type="email" required value={emailInvite} 
                      onChange={(e) => setEmailInvite(e.target.value)} 
                      placeholder="...@site.com" 
                      className="w-full bg-gray-50 border-none rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 text-[11px] md:text-sm focus:ring-2 focus:ring-blue-600 outline-none" 
                    />
                    <button 
                      type="submit" 
                      className="w-full bg-blue-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md"
                    >
                      {inviteEnviado ? "Convite Enviado" : "Enviar Convite"} 
                      {inviteEnviado ? <Check size={14} /> : <Send size={14} />}
                    </button>
                  </form>
                </div>
                
                <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-50 shadow-sm flex flex-col">
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-4 md:mb-6 text-center md:text-left">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><MessageCircle size={20} className="md:w-6 md:h-6" /></div>
                    <h3 className="font-bold text-gray-900 uppercase text-[10px] md:text-sm">WhatsApp</h3>
                  </div>
                  <div className="w-full space-y-3">
                    <div className="w-full bg-gray-50 rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 text-[10px] md:text-xs text-gray-500 font-medium text-center">
                      Via wapp
                    </div>
                    <button 
                      onClick={handleWhatsAppInvite} 
                      className="w-full bg-emerald-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md"
                    >
                      Enviar agora <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ÁREA DO CONSULTOR */
            <div className="space-y-8 mb-20 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border-2 border-blue-600/10 p-10 rounded-[2.5rem] shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-blue-600" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo p/ Saque</span>
                  </div>
                  <div className="text-5xl font-black text-gray-900 tracking-tighter">R$ {saldoValidado.toFixed(2)}</div>
                </div>
                <div className="bg-gray-50 p-10 rounded-[2.5rem]">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Em Validação</span>
                  <div className="text-5xl font-black text-gray-400 tracking-tighter">R$ {saldoPendente.toFixed(2)}</div>
                </div>
                <div className="bg-gray-900 p-10 rounded-[2.5rem] text-white flex flex-col justify-center">
                  <h4 className="text-[10px] font-black uppercase mb-4 text-blue-400 tracking-widest">Solicitação Saque (PIX)</h4>
                  <div className="flex flex-col gap-3">
                    <input 
                      value={pixKey} 
                      onChange={(e) => setPixKey(e.target.value)} 
                      placeholder="Chave PIX" 
                      className="w-full bg-white/10 border-none rounded-xl px-4 py-4 text-[11px] placeholder:text-[10px] outline-none focus:ring-1 focus:ring-blue-500 text-white" 
                    />
                    <button 
                      onClick={handleSaque} 
                      disabled={solicitandoSaque || saldoValidado < 20}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-xl text-[10px] font-black uppercase transition-all"
                    >
                      {solicitandoSaque ? "..." : "Solicitar resgate"}
                    </button>
                  </div>
                  <span className="text-[12px] text-gray-500 mt-2 uppercase font-bold">Mínimo R$ 20,00</span>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History size={18} className="text-blue-600" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Extrato de Conversões</h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[9px] font-black uppercase text-gray-400">
                      <tr>
                        <th className="px-10 py-5">Código Membro Indicado</th>
                        <th className="px-10 py-5">Data do Cadastro</th>
                        <th className="px-10 py-5">Status Plano</th>
                        <th className="px-10 py-5">Pagamento Prêmio</th>
                        <th className="px-10 py-5 text-right">Status Comissão Núcleo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {vendas.length > 0 ? (
                        <>
                          {vendas.map((v, i) => (
                            <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                              <td className="px-10 py-6 text-sm font-mono font-bold text-blue-600">{v.usuarios?.num_cracha || "NUC-PROCESS"}</td>
                              <td className="px-10 py-6 text-sm text-gray-500">{new Date(v.created_at).toLocaleDateString('pt-BR')}</td>
                              <td className="px-10 py-6">
                                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${v.valor_comissao >= 10 ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                  {v.valor_comissao >= 10 ? 'Ativo (Pro)' : 'Ativo (Essencial)'}
                                </span>
                              </td>
                              <td className="px-10 py-6">
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    v.status_pagamento === 'pago' ? 'bg-emerald-500 animate-pulse' : 
                                    v.status_pagamento === 'liberado' ? 'bg-blue-500' : 'bg-gray-300'
                                  }`} />
                                  <span className={`text-[9px] font-black uppercase ${
                                    v.status_pagamento === 'pago' ? 'text-emerald-600' : 
                                    v.status_pagamento === 'liberado' ? 'text-blue-600' : 'text-gray-400'
                                  }`}>
                                    {v.status_pagamento === 'pago' ? 'Pago via PIX' : 
                                     v.status_pagamento === 'liberado' ? 'Disponível' : 'Em Processamento'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-10 py-6 text-right font-black text-gray-900 text-lg">R$ {v.valor_comissao.toFixed(2)}</td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50">
                            <td colSpan={4} className="px-10 py-6 text-right text-[10px] font-black uppercase text-gray-400">Total em Comissões:</td>
                            <td className="px-10 py-6 text-right font-black text-xl text-blue-600">
                              R$ {vendas.reduce((acc, current) => acc + current.valor_comissao, 0).toFixed(2)}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-10 py-20 text-center text-gray-400 text-xs font-medium italic">Nenhuma assinatura convertida ainda.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ÁREA DESLOGADA */
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-blue-900/5 overflow-hidden mb-12">
          <div className="p-12 bg-gray-50/50 border-b border-gray-100 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Entre para indicar<span className="text-blue-600">.</span></h2>
            <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto font-medium">Acesse sua conta para gerar seu link exclusivo.</p>
          </div>
          <div className="p-12 flex flex-col items-center bg-white">
            <form onSubmit={handleLogin} className="w-full max-sm space-y-4">
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" placeholder="ID ou E-mail" required value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold"
                />
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} placeholder="Sua senha" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button disabled={loadingLogin} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl text-sm disabled:opacity-50">
                {loadingLogin ? "Verificando..." : "Gerar meu Link de Indicação"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RECOMPENSAS COM CARROSSEL MOBILE */}
      <div className="mb-20">
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
          Níveis de Conquista <div className="h-px bg-gray-300 flex-1"></div>
        </h3>
        
        {/* Mobile Carousel */}
        <div className="relative flex items-center justify-center md:hidden">
          {cardAtivo > 0 && (
            <button onClick={() => setCardAtivo(cardAtivo - 1)} className="absolute left-0 z-20 bg-white shadow-lg border border-gray-100 text-blue-600 p-2 rounded-full active:scale-90 transition-all">
              <ChevronLeft size={24} />
            </button>
          )}
          
          <div className="w-full flex items-center justify-center">
            {cardsRecompensa.map((item, i) => (
              <div key={i} className={`bg-white border border-gray-100 p-10 rounded-[3rem] shadow-sm transition-all w-full ${cardAtivo === i ? 'flex animate-in fade-in zoom-in-95 duration-300 flex-col items-center text-center' : 'hidden'}`}>
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">{item.icon}</div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-2">{item.meta}</span>
                <h4 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{item.premio}</h4>
                <p className="text-sm text-gray-500 leading-relaxed font-medium italic">{item.desc}</p>
              </div>
            ))}
          </div>

          {cardAtivo < cardsRecompensa.length - 1 && (
            <button onClick={() => setCardAtivo(cardAtivo + 1)} className="absolute right-0 z-20 bg-white shadow-lg border border-gray-100 text-blue-600 p-2 rounded-full active:scale-90 transition-all">
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          {cardsRecompensa.slice(0, 3).map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 p-10 rounded-[2.5rem] hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">{item.icon}</div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-2">{item.meta}</span>
              <h4 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{item.premio}</h4>
              <p className="text-sm text-gray-500 leading-relaxed font-medium italic">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- SEÇÃO FINAL CONECTE-SE (PADRÃO SOBRE) --- */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="max-w-3xl mb-12">
          <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
            Fique por dentro <br className="md:hidden"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
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
  );
}