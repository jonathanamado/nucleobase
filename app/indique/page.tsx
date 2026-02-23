"use client";
import React, { useState, useEffect } from "react";
import { 
  Share2, Gift, Users, Trophy, Copy, Check, Megaphone, 
  Stars, Rocket, ShieldCheck, Heart, ArrowUpRight, 
  Mail, Send, MessageCircle, Zap
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 
import AuthModal from "@/components/AuthModal"; 

export default function IndiquePage() {
  const [copiado, setCopiado] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [userSlug, setUserSlug] = useState<string>(""); // Novo estado para o link amigável
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
      
      // BUSCA O SLUG NO PERFIL (Aquele que criamos no SQL e no Cadastro)
      const { data: profile } = await supabase
        .from('profiles')
        .select('slug, nome_completo')
        .eq('id', user.id)
        .single();

      if (profile?.slug) {
        setUserSlug(profile.slug);
      } else {
        // Fallback caso o usuário antigo ainda não tenha slug no banco
        setUserSlug(user.id); 
      }

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

  // AJUSTE: Agora o link usa o userSlug em vez do userId
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
    const saudacao = emailInvite.split('@')[0];
    const subject = encodeURIComponent(`${userName} convidou você para a Nucleobase`);
    const body = encodeURIComponent(
      `Olá ${saudacao},\n\n` +
      `Seu contato ${userName} está utilizando a Nucleobase para controlar o orçamento doméstico e acredita que essa ferramenta será útil para você.\n\n` +
      `Acesse pelo link:\n${linkIndicacao}\n\n` +
      `Equipe Nucleobase.`
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailInvite}&su=${subject}&body=${body}`;
    const mailtoUrl = `mailto:${emailInvite}?subject=${subject}&body=${body}`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) { window.location.href = mailtoUrl; } else { window.open(gmailUrl, '_blank'); }
    setInviteEnviado(true);
    setTimeout(() => { setInviteEnviado(false); setEmailInvite(""); }, 4000);
  };

  const handleWhatsAppInvite = () => {
    const text = encodeURIComponent(
        `Olá! Estou usando a Nucleobase para organizar minha vida financeira e acho que você vai curtir também: ${linkIndicacao}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

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
      <div className="mb-8 mt-0">
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
        <div className="mt-4 flex items-center gap-3">
            <div className="h-px w-8 bg-blue-600"></div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                Gere seu link, convide contatos e desbloqueie recompensas exclusivas
            </h2>
        </div>
      </div>

      {userId ? (
        <div className="space-y-12 mb-20">
          {/* BLOCO COMBINADO: LINK (75%) E CONTAGEM (25%) */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch bg-white border border-gray-100 rounded-[2rem] p-2 shadow-sm overflow-hidden">
            <div className="lg:w-[75%] p-4 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <Share2 size={16} className="text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Seu Link de Convite</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                <code className="flex-1 text-[11px] font-mono text-gray-500 px-4 truncate">
                  {linkIndicacao}
                </code>
                <button 
                  onClick={handleCopy} 
                  className={`px-6 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-2 ${copiado ? "bg-emerald-500 text-white" : "bg-gray-900 text-white hover:bg-black"}`}
                >
                  {copiado ? <Check size={14} /> : <Copy size={14} />}
                  {copiado ? "Copiado" : "Copiar"}
                </button>
              </div>
            </div>

            <div className="lg:w-[25%] bg-blue-600 rounded-2xl p-4 text-white flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-2 relative overflow-hidden">
                <Users size={40} className="absolute -right-2 -bottom-2 opacity-10 rotate-12" />
                <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Ativados</span>
                <span className="text-4xl font-black leading-none">{contagem.toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* SEÇÃO CONTEXTUAL DE CONVITES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch px-2">
            <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Mail size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Convite via e-mail</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-grow">
                    Ideal para enviar a colegas de trabalho ou contatos profissionais. Insira o e-mail abaixo e personalize a mensagem que criamos, destacando a segurança e eficiência da Nucleobase.
                </p>
                <div className="h-12 flex items-center">
                    <form onSubmit={handleSendInvite} className="relative w-full max-w-sm">
                      <input 
                        type="email" 
                        required
                        value={emailInvite}
                        onChange={(e) => setEmailInvite(e.target.value)}
                        placeholder="E-mail do convidado..."
                        className="w-full bg-transparent border-b-2 border-gray-100 py-3 pr-12 text-sm focus:border-blue-600 outline-none transition-all"
                      />
                      <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-600 hover:scale-110 transition-transform">
                        {inviteEnviado ? <Check className="text-emerald-500" /> : <Send size={20} />}
                      </button>
                    </form>
                </div>
            </div>

            <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <MessageCircle size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Compartilhamento WhatsApp</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-grow">
                    A forma mais rápida de espalhar a palavra. Compartilhe diretamente no seu círculo de amigos ou grupos de família para um crescimento viral e conquiste as recompensas mais rápido.
                </p>
                <div className="h-12 flex items-center justify-center w-full max-w-sm">
                    <button 
                      onClick={handleWhatsAppInvite}
                      className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      Enviar para o WhatsApp 
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:translate-x-2 transition-transform shadow-lg shadow-emerald-200">
                        <ArrowUpRight size={14} />
                      </div>
                    </button>
                </div>            </div>
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

      {/* RECOMPENSAS E FOOTER MANTIDOS IGUAIS... */}
      {/* (Código de recompensas ocultado para brevidade, mantenha o original) */}
    </div>
  );
}