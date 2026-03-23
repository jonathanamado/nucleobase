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
  const [recompensaAtiva, setRecompensaAtiva] = useState(0); 
  
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
  
  // --- MÉTRICAS ---
  const [contagem, setContagem] = useState(0); 
  const [indicadosLista, setIndicadosLista] = useState<any[]>([]);
  const [copiado, setCopiado] = useState(false);
  const [emailInvite, setEmailInvite] = useState("");
  const [inviteEnviado, setInviteEnviado] = useState(false);
  const [vendas, setVendas] = useState<any[]>([]);
  const [saldoValidado, setSaldoValidado] = useState(0);
  const [saldoPendente, setSaldoPendente] = useState(0);
  const [pixKey, setPixKey] = useState("");
  const [solicitandoSaque, setSolicitandoSaque] = useState(false);

  const fetchAllUserData = useCallback(async (user: any) => {
    setLoadingData(true);
    try {
      setUserId(user.id);
      const { data: profile } = await supabase.from('profiles').select('slug, nome_completo').eq('id', user.id).single();
      setUserName(profile?.nome_completo || user.email?.split('@')[0] || "Amigo");
      setUserSlug(profile?.slug || user.id);

      const { data: indData, count } = await supabase
        .from("indicacoes").select('id, created_at, status, indicado_id, email_indicado', { count: 'exact' })
        .eq('indicador_id', user.id).order('created_at', { ascending: false });

      setContagem(count || 0);

      if (indData) {
        const enriquecidos = await Promise.all(indData.map(async (item) => {
          if (!item.indicado_id) return { ...item, cracha: "NUC-PROCESS", plano: 'free' };
          const { data: userData } = await supabase.from('usuarios').select('num_cracha').eq('id', item.indicado_id).maybeSingle();
          const { data: profileData } = await supabase.from('profiles').select('plan_type').eq('id', item.indicado_id).maybeSingle();
          return { ...item, cracha: userData?.num_cracha || "NUC-PROCESS", plano: profileData?.plan_type || 'free' };
        }));
        setIndicadosLista(enriquecidos);
      }

      const { data: vData } = await supabase.from('afiliados_vendas').select('*').eq('consultor_id', user.id).order('created_at', { ascending: false });
      if (vData) {
        const vEnriquecidas = await Promise.all(vData.map(async (v) => {
          const { data: u } = await supabase.from('usuarios').select('num_cracha').eq('id', v.indicado_id).maybeSingle();
          return { ...v, usuarios: u };
        }));
        setVendas(vEnriquecidas);
        setSaldoValidado(vData.filter(v => v.status === 'validado').reduce((acc, v) => acc + v.valor_comissao, 0));
        setSaldoPendente(vData.filter(v => v.status === 'pendente').reduce((acc, v) => acc + v.valor_comissao, 0));
      }
    } finally { setLoadingData(false); }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") setBaseUrl(window.location.origin);
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchAllUserData(session.user);
      else setLoadingData(false);
    };
    checkUser();
  }, [fetchAllUserData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLogin(true);
    const input = slug.trim().toLowerCase();
    const isEmail = input.includes("@");
    try {
      let email = isEmail ? input : "";
      if (!isEmail) {
        const { data: p } = await supabase.from('profiles').select('email').eq('slug', input).maybeSingle();
        if (!p?.email) throw new Error("ID não encontrado.");
        email = p.email;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.reload();
    } catch (err: any) { alert(err.message); } finally { setLoadingLogin(false); }
  };

  const linkIndicacao = userSlug && baseUrl ? `${baseUrl}/indique/${userSlug}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(linkIndicacao);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleWhatsAppInvite = () => {
    const text = encodeURIComponent(`Olá! Estou usando a Nucleobase para organizar minha vida financeira e acho que você vai curtir: ${linkIndicacao}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`${userName} convidou você para a Nucleobase`);
    const body = encodeURIComponent(`Acesse: ${linkIndicacao}`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${emailInvite}&su=${subject}&body=${body}`, '_blank');
    setInviteEnviado(true);
    setTimeout(() => { setInviteEnviado(false); setEmailInvite(""); }, 4000);
  };

  const handleSaque = async () => {
    if (!pixKey || saldoValidado < 20) return alert("Mínimo R$ 20,00 e PIX obrigatório.");
    setSolicitandoSaque(true);
    const { error } = await supabase.from('afiliados_saques').insert({ consultor_id: userId, valor: saldoValidado, pix_qrcode_url: pixKey, status: 'solicitado' });
    if (!error) { alert("Sucesso!"); setPixKey(""); }
    setSolicitandoSaque(false);
  };

  const cardsRecompensa = [
    { meta: "Meritocracia", premio: "Valor x Indicação", desc: "Receba o bônus de R$ 5,00 x Essencial | R$ 10,00 x Pro para cada conta ativada.", icon: <Gift className="text-blue-500" /> },
    { meta: "Benefícios extras", premio: "+ Troféu afiliado", desc: "Acima de 3 indicações, libere suporte prioritário e templates exclusivos da Nucleo.", icon: <Trophy className="text-amber-500" /> },
    { meta: "Embaixador Master", premio: "+ Brindes únicos", desc: "Acima de 5 indicações, ganhe suporte, templates e brindes exclusivos da Nucleo.", icon: <Stars className="text-purple-500" /> },
    { meta: "Clareza", premio: "Crescemos Juntos", desc: "Cada indicação fortalece nossa rede e expande o poder de compra da comunidade.", icon: <Heart className="text-red-500" /> }
  ];

  if (loadingData) return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-gray-400 font-black uppercase tracking-widest text-[10px]">Sincronizando Plataforma...</div>
    </div>
  );

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-blue-900 mb-1 tracking-tight flex items-center">
            <span>Sua gestão vale <span className="text-amber-500">Ouro</span><span className="text-blue-900">.</span></span>
            <Megaphone size={32} className="text-amber-500 opacity-85 ml-3 -rotate-12" />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium leading-relaxed">Indique a Nucleo e resgate suas recompensas por ativações.</h2>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2 flex items-center gap-4">
        Regras do Motor <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {userId ? (
        <>
          <div className="block md:hidden mb-6">
            <p className="font-medium text-blue-900 text-base leading-relaxed"> 
              Olá <span className="font-bold text-blue-700">{userName.split(' ')[0]}</span>, compartilhe seu link e contribua com o nosso crescimento orgânico.
            </p>
          </div>

          <div className="mb-10 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="mb-6 hidden md:block">
              <p className="font-medium text-blue-900 text-base leading-relaxed">
                Olá <span className="font-bold text-blue-700">{userName.split(' ')[0]}</span>, compartilhando seu link pessoal, além de contribuir para o nosso crescimento orgânico, você ainda receberá recompensas para cada usuário ativo na Nucleo. Suas opções de compartilhamento são:
              </p>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* CARD WHATSAPP */}
                <div className={`bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between transition-all duration-300 min-h-[260px] ${cardAtivo === 0 ? "flex" : "hidden lg:flex"}`}>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><MessageCircle size={16} /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Compartilhar WhatsApp</span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium mb-4 leading-relaxed">Envie uma mensagem direta com seu link de indicação para seus contatos.</p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <button onClick={handleWhatsAppInvite} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg">
                      Enviar Agora <ArrowUpRight size={14} />
                    </button>
                    
                    <div className="flex md:hidden items-center justify-center gap-3 pt-2">
                      <button onClick={() => setCardAtivo(1)} className="bg-blue-600 text-white p-3 rounded-full shadow-xl shadow-blue-200 opacity-80 hover:opacity-100 transition-opacity">
                        <ChevronRight size={20} strokeWidth={3} />
                      </button>
                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter opacity-70">Opções de indicação (Link e E-mail)</span>
                    </div>
                  </div>
                </div>

                {/* CARD LINK */}
                <div className={`bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between transition-all duration-300 min-h-[260px] ${cardAtivo === 1 ? "flex" : "hidden lg:flex"}`}>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Share2 size={16} /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Código de indicação</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-2 overflow-hidden">
                      <code className="text-xs font-mono text-blue-600 block truncate">{linkIndicacao}</code>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button onClick={handleCopy} className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg ${copiado ? "bg-emerald-500 text-white" : "bg-gray-900 text-white"}`}>
                      {copiado ? "Copiado" : "Copiar Link"}
                    </button>

                    <div className="flex md:hidden justify-center gap-4 pt-2">
                      <button onClick={() => setCardAtivo(0)} className="bg-blue-600 text-white p-3 rounded-full shadow-xl shadow-blue-200 opacity-60 hover:opacity-100 transition-opacity">
                        <ChevronLeft size={20} strokeWidth={3} />
                      </button>
                      <button onClick={() => setCardAtivo(2)} className="bg-blue-600 text-white p-3 rounded-full shadow-xl shadow-blue-200 opacity-60 hover:opacity-100 transition-opacity">
                        <ChevronRight size={20} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* CARD EMAIL */}
                <div className={`bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between transition-all duration-300 min-h-[260px] ${cardAtivo === 2 ? "flex" : "hidden lg:flex"}`}>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Mail size={16} /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Enviar por E-mail</span>
                    </div>
                    <input 
                      type="email" 
                      value={emailInvite} 
                      onChange={(e) => setEmailInvite(e.target.value)} 
                      placeholder="E-mail do convidado..." 
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-sm outline-none focus:ring-1 focus:ring-blue-600 mb-2" 
                    />
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <button onClick={handleSendInvite} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg">
                      {inviteEnviado ? "Enviado" : "Convidar"} <Send size={14} />
                    </button>

                    <div className="flex md:hidden justify-center gap-4 pt-2">
                      <button onClick={() => setCardAtivo(1)} className="bg-blue-600 text-white p-3 rounded-full shadow-xl shadow-blue-200 opacity-60 hover:opacity-100 transition-opacity">
                        <ChevronLeft size={20} strokeWidth={3} />
                      </button>
                      <button onClick={() => setCardAtivo(0)} className="bg-blue-600 text-white p-3 rounded-full shadow-xl shadow-blue-200 opacity-60 hover:opacity-100 transition-opacity">
                        <ChevronRight size={20} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* INDICADORES (DOTS) PARA OS CARDS DE CONVITE NO MOBILE */}
              <div className="flex lg:hidden justify-center gap-2 mt-6">
                {[0, 1, 2].map((dot) => (
                  <button 
                    key={dot} 
                    onClick={() => setCardAtivo(dot)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${cardAtivo === dot ? "w-8 bg-blue-600" : "w-2 bg-gray-300"}`}
                  />
                ))}
              </div>
            </div>

            <div className="block md:hidden mt-10">
              <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-4">
                Indicações <div className="h-px bg-gray-300 flex-1"></div>
              </h3>
              <p className="text-sm font-medium text-blue-900 leading-relaxed">
                Na aba "Indicações", veja o histórico de convites efetivados. Em "Recompensas", faça seu resgate de bônus aplicáveis.
              </p>
            </div>
          </div>

          <div className="mb-6 hidden md:block">
            <p className="font-medium text-blue-900 text-base leading-relaxed">
              Além destas vantagens, é certo também que a sua influência transformará o controle financeiro de amigos e familiares. 
              Para o seu acompanhamento, veja que, na aba <strong className="text-blue-700">Indicações</strong>, consta o histórico de convites enviados. Em <strong className="text-blue-700">Recompensas</strong>, você solicita o resgate do bônus por suas "Indicações ativadas".
            </p>
          </div>

          <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-full w-fit">
            <button onClick={() => setActiveTab("comunidade")} className={`px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "comunidade" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>Indicações</button>
            <button onClick={() => setActiveTab("partner")} className={`px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "partner" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>Recompensas</button>
          </div>

          {activeTab === "comunidade" ? (
            <div className="space-y-12 mb-20 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-9 bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                  <div className="p-8 border-b border-gray-50 flex items-center gap-3">
                    <Users size={18} className="text-blue-600" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Relatório de indicações</h3>
                  </div>
                  <div className="w-full">
                    <table className="w-full text-left table-fixed">
                      <thead className="bg-gray-50 text-[8px] md:text-[9px] font-black uppercase text-gray-400">
                        <tr>
                          <th className="px-4 md:px-10 py-5 w-[35%] md:w-auto">Membro</th>
                          <th className="px-4 md:px-10 py-5 w-[30%] md:w-auto">Data</th>
                          <th className="px-4 md:px-10 py-5 w-[35%] md:w-auto">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {indicadosLista.length > 0 ? indicadosLista.map((item, i) => (
                          <tr key={i} className="group hover:bg-gray-50/50">
                            <td className="px-4 md:px-10 py-6 text-[10px] md:text-sm font-mono font-bold text-blue-600 truncate">{item.cracha}</td>
                            <td className="px-4 md:px-10 py-6 text-[10px] md:text-sm text-gray-500 truncate">{new Date(item.created_at).toLocaleDateString('pt-BR')}</td>
                            <td className="px-4 md:px-10 py-6">
                              <span className={`text-[7px] md:text-[9px] font-black uppercase px-2 md:px-3 py-1 rounded-full whitespace-nowrap ${item.plano !== 'free' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                {item.plano !== 'free' ? 'Ativo' : 'Free'}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={3} className="px-10 py-16 text-center text-gray-400 italic">Nenhum indicado.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="hidden lg:flex lg:col-span-3 bg-blue-600 rounded-[2.5rem] p-10 text-white flex-col items-center justify-center relative overflow-hidden shadow-2xl min-h-[300px]">
                  <Users size={80} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-80 z-10 text-center">Total de<br/>Cadastros</span>
                  <span className="text-7xl font-black z-10 tabular-nums">{contagem.toString().padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 mb-20">
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
                  <input value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="Informe aqui sua Chave PIX" className="w-full bg-white/10 border-none rounded-xl px-4 py-4 text-xs mb-3 outline-none text-white" />
                  <button onClick={handleSaque} disabled={solicitandoSaque || saldoValidado < 20} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-xl text-[10px] font-black uppercase">
                    {solicitandoSaque ? "Processando..." : "Solicitar resgate"}
                  </button>
                  <span className="text-[10px] text-gray-500 mt-2 uppercase font-bold text-center">Mínimo R$ 20,00</span>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-gray-50 flex items-center gap-3">
                  <History size={18} className="text-blue-600" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Extrato de Conversões</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[9px] font-black uppercase text-gray-400">
                      <tr>
                        <th className="px-10 py-5">Membro</th>
                        <th className="px-10 py-5">Data</th>
                        <th className="px-10 py-5">Comissão</th>
                        <th className="px-10 py-5 text-right">Valor Bruto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {vendas.length > 0 ? vendas.map((v, i) => (
                        <tr key={i} className="group hover:bg-gray-50/50">
                          <td className="px-10 py-6 text-sm font-mono font-bold text-blue-600">{v.usuarios?.num_cracha}</td>
                          <td className="px-10 py-6 text-sm text-gray-500">{new Date(v.created_at).toLocaleDateString('pt-BR')}</td>
                          <td className="px-10 py-6">
                            <span className="text-[9px] font-black uppercase px-3 py-1 bg-blue-50 text-blue-600 rounded-full">Liberada</span>
                          </td>
                          <td className="px-10 py-6 text-right font-black text-gray-900">R$ {v.valor_comissao.toFixed(2)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="px-10 py-16 text-center text-gray-400 italic">Sem vendas ainda.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/10 overflow-hidden mb-12 max-w-md mx-auto animate-in zoom-in-95 duration-500">
          <div className="p-10 bg-gray-50/50 border-b border-gray-100 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Entre para indicar<span className="text-blue-600">.</span></h2>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Acesse sua conta e gere seu link</p>
          </div>
          <div className="p-10 flex flex-col items-center bg-white">
            <form onSubmit={handleLogin} className="w-full space-y-3">
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" placeholder="ID ou E-mail" required value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-1 focus:ring-blue-600 outline-none text-xs font-bold" />
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Senha" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-1 focus:ring-blue-600 outline-none text-xs" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button disabled={loadingLogin} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg text-[10px] disabled:opacity-50">
                {loadingLogin ? "Autenticando..." : "Acessar Plataforma"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CARROSSEL DE NÍVEIS */}
      <div className="mb-20">
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
          Níveis de Conquista <div className="h-px bg-gray-300 flex-1"></div>
        </h3>
        
        <div className="relative md:hidden">
          <div className="w-full flex flex-col items-center justify-center">
            {cardsRecompensa.map((item, i) => (
              <div key={i} className={`bg-white border border-gray-100 p-10 rounded-[3rem] shadow-sm transition-all w-full flex-col items-center text-center min-h-[360px] ${recompensaAtiva === i ? 'flex animate-in fade-in zoom-in-95' : 'hidden'}`}>
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">{item.icon}</div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-2">{item.meta}</span>
                <h4 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{item.premio}</h4>
                <p className="text-sm text-gray-500 font-medium italic leading-relaxed mb-8">{item.desc}</p>
                
                <div className="flex justify-center gap-4 mt-auto">
                  {i > 0 && (
                    <button onClick={() => setRecompensaAtiva(i - 1)} className="bg-blue-600 text-white p-3 rounded-full shadow-xl shadow-blue-200 opacity-60 hover:opacity-100 transition-opacity">
                      <ChevronLeft size={20} strokeWidth={3} />
                    </button>
                  )}
                  {i < cardsRecompensa.length - 1 && (
                    <button onClick={() => setRecompensaAtiva(i + 1)} className="bg-blue-600 text-white p-3 rounded-full shadow-xl shadow-blue-200 opacity-60 hover:opacity-100 transition-opacity">
                      <ChevronRight size={20} strokeWidth={3} />
                    </button>
                  )}
                  {i === cardsRecompensa.length - 1 && (
                    <button onClick={() => setRecompensaAtiva(0)} className="bg-blue-600 text-white p-3 rounded-full shadow-xl shadow-blue-200 opacity-60 hover:opacity-100 transition-opacity">
                      <ChevronRight size={20} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* INDICADORES (DOTS) PARA O CARROSSEL DE RECOMPENSAS NO MOBILE */}
            <div className="flex justify-center gap-2 mt-6">
              {cardsRecompensa.map((_, dot) => (
                <button 
                  key={dot} 
                  onClick={() => setRecompensaAtiva(dot)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${recompensaAtiva === dot ? "w-8 bg-blue-600" : "w-2 bg-gray-300"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-3 gap-8">
          {cardsRecompensa.slice(0, 3).map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 p-10 rounded-[2.5rem] hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">{item.icon}</div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-2">{item.meta}</span>
              <h4 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{item.premio}</h4>
              <p className="text-sm text-gray-500 font-medium italic leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER INSTAGRAM */}
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