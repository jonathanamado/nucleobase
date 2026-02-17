"use client";
import React, { useState, useEffect } from "react";
import { 
  Share2, Gift, Users, Trophy, Copy, Check, Megaphone, 
  Stars, Rocket, ShieldCheck, Heart, ArrowUpRight, 
  Mail, Send, Loader2, MessageCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 
import AuthModal from "@/components/AuthModal"; 

export default function IndiquePage() {
  const [copiado, setCopiado] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("Um amigo");
  const [contagem, setContagem] = useState(0); 
  const [baseUrl, setBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [emailInvite, setEmailInvite] = useState("");
  const [inviteEnviado, setInviteEnviado] = useState(false);

  const getDadosIndicacao = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUserId(user.id);
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "Um amigo");
      const { count } = await supabase
        .from("indicacoes")
        .select('*', { count: 'exact', head: true })
        .eq('indicador_id', user.id);
      
      setContagem(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
    getDadosIndicacao();
  }, []);

  useEffect(() => {
    if (userId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [userId]);

  const linkIndicacao = userId && baseUrl ? `${baseUrl}/indique/${userId}` : "";

  const handleCopy = () => {
    if (!linkIndicacao) return;
    navigator.clipboard.writeText(linkIndicacao);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // LÓGICA DE E-MAIL (mailto)
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInvite) return;

    // Extrai o nome antes do @ para a saudação (ex: "fulano@email.com" vira "fulano")
    const saudacao = emailInvite.split('@')[0];
    
    // Define a URL base (Mantive dinâmico, mas em produção será nucleobase.vercel.app)
    const linkFinal = linkIndicacao;

    const subject = encodeURIComponent(`${userName} convidou você para a Nucleobase`);
    
    // TEXTO AJUSTADO CONFORME SOLICITADO
    const body = encodeURIComponent(
      `Olá ${saudacao},\n\n` +
      `Seu contato ${userName} está utilizando a Nucleobase como plataforma digital para controlar seu orçamento doméstico e acredita que essa ferramenta também poderá ser útil para você.\n\n` +
      `Acesse a Nucleobase:\n` +
      `${linkFinal}\n\n` +
      `Esperamos por você!\n` +
      `Equipe Nucleobase.`
    );

    // Lógica de abertura: Gmail para Desktop, Mailto para Mobile
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailInvite}&su=${subject}&body=${body}`;
    const mailtoUrl = `mailto:${emailInvite}?subject=${subject}&body=${body}`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = mailtoUrl;
    } else {
      window.open(gmailUrl, '_blank');
    }
    
    setInviteEnviado(true);
    setTimeout(() => {
        setInviteEnviado(false);
        setEmailInvite("");
    }, 4000);
  };

  // LÓGICA DE WHATSAPP
  const handleWhatsAppInvite = () => {
    const text = encodeURIComponent(
        `Olá! Estou usando a Nucleobase para organizar minha vida financeira e acho que você vai curtir também. Se cadastrando pelo meu link você ganha benefícios: ${linkIndicacao}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const recompensas = [
    {
      meta: "1 Indicação",
      premio: "15 Dias Grátis",
      desc: "Ganhe meio mês de acesso premium por cada amigo ou familiar que se cadastrar.",
      icon: <Gift className="text-blue-500" />
    },
    {
      meta: "5 Indicações",
      premio: "Crachá 'Embaixador'",
      desc: "Libere templates exclusivos de gestão e suporte prioritário, habilitando parcerias conosco.",
      icon: <Trophy className="text-amber-500" />
    },
    {
      meta: "10 Indicações",
      premio: "Anuidade Isenta",
      desc: "Bata a meta de 10 amigos e ganhe 1 ano de Nucleobase na faixa e se torne parte da história.",
      icon: <Stars className="text-purple-500" />
    }
  ];

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-400 font-bold uppercase tracking-widest text-[10px]">Sincronizando...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-6">
      {/* HEADER */}
      <div className="mb-4 mt-0">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <Megaphone size={18} className="-rotate-12" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Indique e Ganhe</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">
          Sua gestão vale ouro<span className="text-blue-600">.</span> ✨
        </h1>
        <p className="text-gray-500 text-base max-w-xl leading-relaxed">
          Compartilhe a <strong>Nucleobase</strong> e ganhe benefícios por cada usuário ativado.
        </p>
      </div>

      {userId ? (
        <div className="space-y-6 mb-12">
          {/* LINK E CARD DE CONTAGEM - VERSÃO COMPACTA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
            <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 px-5 pt-3 pb-5 shadow-sm flex flex-col justify-start relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-4">
                  <Share2 className="text-blue-600" size={18} /> Link exclusivo
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 items-center bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                  <code className="flex-1 text-[10px] font-mono text-gray-400 px-2 py-1 break-all truncate">
                    {linkIndicacao}
                  </code>
                  <button onClick={handleCopy} className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${copiado ? "bg-emerald-500 text-white" : "bg-gray-900 text-white hover:bg-black"}`}>
                    {copiado ? <Check size={12} /> : <Copy size={12} />}
                    {copiado ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-gray-600 font-medium italic">* Ativação imediata pós-cadastro.</p>
              </div>
            </div>

            <div className="bg-blue-600 rounded-[2rem] p-5 text-white flex flex-row lg:flex-col justify-around lg:justify-center items-center text-center shadow-lg relative overflow-hidden">
              {/* Ícone de fundo sutil para preencher espaço no mobile */}
              <Users size={60} className="absolute -left-4 -bottom-4 opacity-10 lg:hidden" />
              
              <div className="flex flex-col items-center">
                <h4 className="text-[8px] font-black uppercase tracking-widest mb-0.5 opacity-70">Cadastros</h4>
                <span className="text-4xl font-black leading-none tracking-tighter">{contagem.toString().padStart(2, '0')}</span>
              </div>
              
              <div className="h-8 w-px bg-white/20 lg:h-px lg:w-12 lg:my-3"></div>
              
              <p className="text-[9px] font-bold text-blue-100 uppercase tracking-tighter max-w-[80px] lg:max-w-none">
                {contagem < 5 ? `Faltam ${5 - contagem} para o nível 2` : "Embaixador!"}
              </p>
            </div>
          </div>

          {/* CONVITE POR E-MAIL E WHATSAPP */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* E-MAIL */}
            <div className="bg-gray-50 rounded-[2.5rem] border border-gray-100 p-8 shadow-inner relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 text-gray-100 group-hover:text-blue-50 transition-colors">
                <Mail size={150} />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Mail className="text-blue-600" size={18} /> Indique via E-mail
                </h3>
                <p className="text-xs text-gray-500 mb-6 font-medium">Abriremos seu e-mail com o convite pronto.</p>
                <form onSubmit={handleSendInvite} className="flex flex-col gap-3">
                  <input 
                    type="email" 
                    required
                    value={emailInvite}
                    onChange={(e) => setEmailInvite(e.target.value)}
                    placeholder="E-mail do seu contato"
                    className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    className={`w-full py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm ${inviteEnviado ? "bg-emerald-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                  >
                    {inviteEnviado ? <Check size={16} /> : <Send size={16} />}
                    {inviteEnviado ? "Pronto!" : "Preparar Convite"}
                  </button>
                </form>
              </div>
            </div>

            {/* WHATSAPP - INOVAÇÃO VISUAL */}
            <div className="relative rounded-[2.5rem] p-8 overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] bg-white border border-emerald-300 flex flex-col justify-center min-h-[220px]">
              
              {/* Círculo de Luz de Fundo (Aura) */}
              <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
              
              {/* Ícone Flutuante em Perspectiva */}
              <div className="absolute -top-6 -right-6 text-emerald-500/5 opacity-[0.08] group-hover:opacity-20 group-hover:-rotate-12 group-hover:scale-110 transition-all duration-700">
                <MessageCircle size={180} strokeWidth={1} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-700 group-hover:rotate-12 transition-transform duration-300">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 leading-none">
                      Invite via <span className="text-emerald-600">Zap</span>
                    </h3>
                    <span className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest">Efeito Viral</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-6 leading-relaxed max-w-[200px]">
                  Compartilhe sua experiência e ajude sua rede a <strong className="text-gray-700">evoluir</strong>.
                </p>

                <button 
                  onClick={handleWhatsAppInvite}
                  className="relative w-full overflow-hidden py-4 bg-gray-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 hover:bg-emerald-600 hover:shadow-[0_10px_25px_rgba(16,185,129,0.3)] active:scale-95 group/btn"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Enviar Convite 
                    <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </span>
                  
                  {/* Brilho interno do botão no hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>

              {/* Tag de Destaque - Ponto na lateral e texto em duas linhas */}
              <div className="absolute top-6 right-8">
                <div className="flex items-center gap-2 bg-emerald-100/50 px-3 py-2 rounded-2xl border border-emerald-200/50">
                  
                  {/* Coluna 1: O ponto pulsante (centralizado verticalmente em relação ao bloco de texto) */}
                  <div className="flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping" />
                  </div>

                  {/* Coluna 2: Texto com quebra de linha */}
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-black text-emerald-700 uppercase leading-[1.1] text-center">
                      Convite<br />Instantâneo
                    </span>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LOGIN MODAL */
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12">
          <div className="p-10 bg-gray-50/50 border-b border-gray-100 text-center">
             <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Gere seu link para realizar indicações<span className="text-blue-600">.</span></h2>
             <p className="text-gray-500 text-sm mb-8 max-w-xl mx-auto">Entre com sua conta para liberar seu acesso e indicar a Nucleobase.</p>
             <div className="flex justify-center gap-8">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><Rocket size={14} className="text-blue-600"/> Instantâneo</div>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><ShieldCheck size={14} className="text-emerald-600"/> Seguro</div>
             </div>
          </div>
          <div className="p-10 flex flex-col items-center">
             <div className="w-full max-w-sm scale-110">
                <AuthModal onSucess={getDadosIndicacao} />
             </div>
          </div>
        </div>
      )}

      {/* RECOMPENSAS */}
      <div className="mb-20">
        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
          Níveis de Conquista <div className="h-px bg-gray-100 flex-1"></div>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recompensas.map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 p-8 rounded-3xl hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">{item.icon}</div>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-1">{item.meta}</span>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{item.premio}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER SECTION */}
      <section className="relative mt-24">
        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-12 flex items-center gap-4">
          Crescimento Coletivo <div className="h-px bg-gray-100 flex-1"></div>
        </h3>
        <div className="bg-gray-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Heart size={180} strokeWidth={1} />
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 mb-6">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Efeito Rede</span>
              </div>
              <h3 className="text-3xl font-bold mb-4 tracking-tight leading-tight">
                Crescemos quando você compartilha clareza.
              </h3>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Cada indicação fortalece nossa infraestrutura e garante que continuemos independentes e focados na sua privacidade.
              </p>
              <div className="flex items-center gap-4 text-sm font-bold text-blue-400 uppercase tracking-widest group cursor-default">
                Impulsionando o Amanhã <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                <span className="block text-2xl font-bold mb-1">92%</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Crescimento Orgânico</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                <span className="block text-2xl font-bold mb-1">0%</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Venda de Dados</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}