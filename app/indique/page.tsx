"use client";
import React, { useState, useEffect } from "react";
import { Share2, Gift, Users, Trophy, Copy, Check, Megaphone, Stars, Rocket, ShieldCheck, Heart, ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase"; 
import AuthModal from "@/components/AuthModal"; 

export default function IndiquePage() {
  const [copiado, setCopiado] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [contagem, setContagem] = useState(0); 
  const [baseUrl, setBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const getDadosIndicacao = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUserId(user.id);
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

  // Melhoria 1: Scroll para o topo quando o userId é definido (pós-login)
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
      <div className="mb-10 mt-2">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <Megaphone size={18} className="-rotate-12" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Indique e Ganhe</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Sua gestão vale ouro<span className="text-blue-600">.</span> ✨
        </h1>
        <p className="text-gray-500 text-base max-w-xl leading-relaxed">
          Compartilhe a <strong>Nucleobase</strong> e ganhe benefícios por cada usuário ativado.
        </p>
      </div>

      {/* ÁREA DO LINK / LOGIN */}
      {userId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Share2 className="text-blue-600" size={20} /> Seu link exclusivo
              </h3>
              <div className="flex flex-col sm:flex-row gap-2 items-center bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <code className="flex-1 text-xs font-mono text-gray-500 px-3 py-2 break-all">
                  {linkIndicacao}
                </code>
                <button onClick={handleCopy} className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${copiado ? "bg-emerald-500 text-white" : "bg-gray-900 text-white hover:bg-black"}`}>
                  {copiado ? <Check size={14} /> : <Copy size={14} />}
                  {copiado ? "Copiado" : "Copiar Link"}
                </button>
              </div>
              <p className="mt-6 text-[11px] text-gray-400">* Benefícios contabilizados no ato do cadastro do indicado.</p>
            </div>
          </div>
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-center items-center text-center shadow-lg">
            <Users size={32} className="mb-3 opacity-40" />
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Cadastros</h4>
            <span className="text-5xl font-black mb-1 tracking-tighter">{contagem.toString().padStart(2, '0')}</span>
            <p className="text-[10px] font-medium text-blue-100 opacity-80">{contagem < 5 ? `Faltam ${5 - contagem} para o próximo nível` : "Nível Embaixador!"}</p>
          </div>
        </div>
      ) : (
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

      {/* Melhoria 2: Destaque de Crescimento Orgânico */}
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
                Diferente de grandes corporações, a <strong>Nucleobase</strong> foca em pessoas. Cada indicação fortalece nossa infraestrutura e garante que continuemos independentes e focados na sua privacidade.
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
              <div className="col-span-2 bg-blue-600/10 border border-blue-600/20 p-6 rounded-2xl">
                <p className="text-xs text-blue-200 leading-relaxed italic">
                  "O melhor marketing é feito por quem realmente utiliza e confia na ferramenta todos os dias."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}