"use client";
import React, { useState, useEffect, useCallback } from "react";
import { 
  Share2, Users, Copy, Check, Megaphone, 
  Rocket, ShieldCheck, ArrowUpRight, 
  Mail, Send, MessageCircle, Sparkles, Trophy,
  Gift, Stars, Heart, Eye, EyeOff, AtSign,
  Wallet, History, Landmark, TrendingUp
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 

export default function IndiquePage() {
  // --- ESTADOS DE UI E NAVEGAÇÃO ---
  const [activeTab, setActiveTab] = useState<"comunidade" | "partner">("comunidade");
  const [loadingData, setLoadingData] = useState(true);
  
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

      const { count } = await supabase
        .from("indicacoes")
        .select('*', { count: 'exact', head: true })
        .eq('indicador_id', user.id);
      setContagem(count || 0);

      const { data: vendasData } = await supabase
        .from('afiliados_vendas')
        .select('*')
        .eq('consultor_id', user.id)
        .order('created_at', { ascending: false });

      if (vendasData) {
        setVendas(vendasData);
        setSaldoValidado(vendasData.filter(v => v.status === 'validado').reduce((acc, v) => acc + v.valor_comissao, 0));
        setSaldoPendente(vendasData.filter(v => v.status === 'pendente').reduce((acc, v) => acc + v.valor_comissao, 0));
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
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

  if (loadingData) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-400 font-black uppercase tracking-widest text-[10px]">Sincronizando Plataforma...</div>
      </div>
    );
  }

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-3">
            <Sparkles size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Partner Program</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center flex-nowrap whitespace-nowrap">
            <span>Sua gestão vale <span className="text-amber-500">Ouro</span><span className="text-blue-600">.</span></span>
            <Megaphone 
              size={64} 
              className="text-amber-500 opacity-20 ml-6 -rotate-12 transition-all hover:scale-110 duration-700" 
              strokeWidth={1.2}
            />  
          </h1>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Regras do Motor <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {userId ? (
        <>
          {/* TEXTO INICIAL - LARGURA TOTAL E ENRIQUECIDO */}
          <div className="w-full bg-blue-50/40 border-l-4 border-blue-600 p-6 mb-8 rounded-r-2xl transition-all">
            <p className="font-medium text-blue-900 italic text-base leading-relaxed">
              Olá, <span className="font-bold">{userName.split(' ')[0]}</span>! Sua influência transformará a gestão das pessoas, por isso você está no coração do nosso motor de crescimento. 
              Use a aba <strong className="text-blue-700">Comunidade</strong> para ajudar amigos e familiares a realizarem controles financeiros efetivos. Na aba <strong className="text-blue-700">Consultor Partner</strong> você poderá fazer seu acompanhamento de "Indicações", solicitando comissões e recebendo prêmios reais.
            </p>
          </div>

          {/* SELETOR DE ABAS COMPACTO */}
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
                <div className="lg:col-span-4 bg-blue-600 rounded-[2.5rem] p-10 text-white flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group">
                  <Users size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] mb-4 opacity-80 relative z-10">Cadastros indicados</span>
                  <span className="text-8xl font-black leading-none relative z-10 tabular-nums">{contagem.toString().padStart(2, '0')}</span>
                </div>
              </div>

              {/* NOVA LINHA DIVISÓRIA E CONTEXTUALIZAÇÃO */}
              <div className="w-full">
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-4">
                  Envio Direto <div className="h-px bg-gray-300 flex-1"></div>
                </h3>
                <p className="text-gray-500 text-lg font-medium w-full leading-relaxed mb-10">
                  Além do seu link exclusivo via "copy", você pode acelerar o crescimento da nossa rede utilizando nossos métodos facilitados de "disparo" aos seus contatos. Convide quem quiser através do <strong className="text-gray-900">e-mail direto</strong> ou via <strong className="text-gray-900">mensagem rápida no WhatsApp</strong>. Estas funções são infalíveis: funcionam de verdade e você é beneficiado pelo seu resultado de indicação.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Mail size={24} /></div>
                    <h3 className="font-bold text-gray-900 uppercase text-sm">Via E-mail</h3>
                  </div>
                  <form onSubmit={handleSendInvite} className="relative w-full">
                    <input type="email" required value={emailInvite} onChange={(e) => setEmailInvite(e.target.value)} placeholder="E-mail do convidado..." className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                      {inviteEnviado ? <Check size={18} /> : <Send size={18} />}
                    </button>
                  </form>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><MessageCircle size={24} /></div>
                    <h3 className="font-bold text-gray-900 uppercase text-sm">Via WhatsApp</h3>
                  </div>
                  <button onClick={handleWhatsAppInvite} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all">
                    Enviar para o WhatsApp <ArrowUpRight size={16} />
                  </button>
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
                      placeholder="Chave aleatória/Telefone/E-mail/CPF" 
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
                  <span className="text-[12px] text-gray-500 mt-2 uppercase font-bold">Mínimo R$ 30,00</span>
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
                        <th className="px-10 py-5">Data</th>
                        <th className="px-10 py-5">Status</th>
                        <th className="px-10 py-5 text-right">Sua Comissão</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {vendas.length > 0 ? vendas.map((v, i) => (
                        <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="px-10 py-6 text-sm font-medium text-gray-500">{new Date(v.created_at).toLocaleDateString('pt-BR')}</td>
                          <td className="px-10 py-6">
                            <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${v.status === 'validado' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right font-black text-gray-900 text-lg">R$ {v.valor_comissao.toFixed(2)}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-10 py-20 text-center text-gray-400 text-xs font-medium italic">Nenhuma assinatura convertida ainda.</td>
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
            <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto font-medium">Acesse sua conta para gerar seu link exclusivo e monitorar suas recompensas.</p>
            <div className="flex justify-center gap-10">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"><Rocket size={16} className="text-blue-600"/> Rápido</div>
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"><ShieldCheck size={16} className="text-emerald-600"/> Seguro</div>
            </div>
          </div>
          <div className="p-12 flex flex-col items-center bg-white">
            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
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

      {/* RECOMPENSAS */}
      <div className="mb-20">
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
          Níveis de Conquista <div className="h-px bg-gray-300 flex-1"></div>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { meta: "Meritrocacia", premio: "Valor x Indicação", desc: "Receba o bônus de R$ 5,00 x Essencial | R$ 10,00 x Pro para cada conta ativada.", icon: <Gift className="text-blue-500" /> },
            { meta: "Benefícios extras", premio: "+ Troféu afiliado", desc: "Acima de 10 indicações, além do cash x ativação, libere templates exclusivos e suporte prioritário.", icon: <Trophy className="text-amber-500" /> },
            { meta: "Embaixador Master", premio: "+ Brindes únicos", desc: "Acima de 30 indicações, você se tornará parte desta história e, além dos benefícios anteriores, ganhará brindes especiais.", icon: <Stars className="text-purple-500" /> }
          ].map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 p-10 rounded-[2.5rem] hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">{item.icon}</div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-2">{item.meta}</span>
              <h4 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{item.premio}</h4>
              <p className="text-sm text-gray-500 leading-relaxed font-medium italic">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <section className="relative mt-24">
        <div className="bg-gray-900 rounded-[3.5rem] p-12 md:p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10"><Heart size={240} strokeWidth={1} /></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-bold mb-6 tracking-tight leading-tight">Crescemos quando você compartilha clareza<span className="text-blue-500">.</span></h3>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium italic">Cada indicação fortalece nossa infraestrutura e garante que continuemos focados na sua privacidade.</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm">
                <span className="block text-4xl font-black mb-2 tracking-tighter">92%</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">Crescimento Orgânico</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm">
                <span className="block text-4xl font-black mb-2 tracking-tighter">0%</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">Venda de Dados</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}