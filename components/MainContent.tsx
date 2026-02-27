"use client";
import React, { useState } from "react";
import Link from 'next/link';
import { 
  Zap, ArrowRight, Mail, Newspaper, ShieldCheck, 
  BarChart3, MessageSquare, Lock, 
  Users, Gift, X, Loader2, CheckCircle2, FileWarning,
  LayoutDashboard
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 

export function MainContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    formData.append("access_key", "9ef5a274-150a-4664-a885-0b052efd06f7");
    formData.append("subject", "Nova Inscrição na Newsletter - Home Nucleobase");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: dbError } = await supabase
        .from("newsletter")
        .insert([{ email: email, user_id: user?.id || null }]);
      if (dbError && dbError.code !== '23505') throw dbError;
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) setEnviado(true);
      else throw new Error("Erro no serviço de e-mail");
    } catch (err) {
      console.error("Erro no processamento:", err);
      alert("Erro ao processar assinatura. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      
      {/* --- MODAL DE NEWSLETTER --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full relative shadow-2xl scale-in-center">
            <button 
              onClick={() => {setIsModalOpen(false); setEnviado(false);}} 
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={24} />
            </button>
            {!enviado ? (
              <>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Mail size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Assinar Newsletter</h3>
                <p className="text-gray-500 mb-8 font-medium">Insights financeiros e estratégicos toda semana.</p>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <input required type="email" name="email" placeholder="Seu melhor e-mail" className="w-full bg-gray-50 border-transparent rounded-2xl py-4 px-6 text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : "Inscrever-se agora"}
                  </button>
                </form>
              </>
            ) : (
              <div className="py-6 text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo à lista!</h3>
                <p className="text-gray-500 font-medium text-sm">Inscrição confirmada com sucesso.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          LAYOUT MOBILE (Recuperado e Otimizado)
          ============================================================ */}
      <div className="block lg:hidden px-4 pb-20 space-y-8 animate-in fade-in duration-700">
        <div className="mt-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Nucleobase<span className="text-blue-600">.APP</span>
              <Zap size={24} className="text-blue-600 opacity-40" />
            </h1>
            <p className="text-gray-500 text-base font-medium mt-1">Organização financeira inteligente.</p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700 text-[16px] leading-relaxed border-l-4 border-blue-600 pl-4">
              A <span className="font-bold text-gray-900">Nucleobase</span> é o seu centro de comando financeiro. 
              Diferente de planilhas complexas, traduzimos seu fluxo de caixa em inteligência estratégica.
            </p>
            
            <Link href="/acesso-usuario" className="flex items-center justify-between w-full p-4 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-lg group active:scale-[0.98] transition-all">
              <span>Acessar minha plataforma</span>
              <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-500 transition-colors">
                <LayoutDashboard size={18} />
              </div>
            </Link>
          </div>

          <div className="space-y-3">
            <p className="text-gray-600 text-[14px] leading-relaxed italic opacity-80">
              Acreditamos que a verdadeira inteligência financeira nasce da clareza de dados.
            </p>
            <Link href="/sobre" className="inline-flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-widest">
                Clique aqui e saiba mais <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
                <p className="text-blue-400 text-[10px] uppercase font-black tracking-widest mb-2">O seu controle</p>
                <h4 className="text-base font-bold mb-6">Pronto para o próximo nível?</h4>
                <Link href="/planos" className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 rounded-xl font-bold text-xs uppercase tracking-widest">
                    Conhecer Planos <ArrowRight size={16} />
                </Link>
            </div>
            <ShieldCheck size={120} className="absolute -right-8 -bottom-8 text-white opacity-5" />
        </div>

        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-4">
            Canais e Contato <div className="h-px bg-gray-300 flex-1"></div>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/suporte" className="bg-gray-50 p-6 rounded-3xl flex flex-col gap-2 border border-gray-100">
                <FileWarning size={20} className="text-amber-500" />
                <span className="font-bold text-[10px] uppercase text-gray-800">Suporte</span>
            </Link>
            <Link href="/contato" className="bg-emerald-50 p-6 rounded-3xl flex flex-col gap-2 border border-emerald-100">
                <MessageSquare size={20} className="text-emerald-600" />
                <span className="font-bold text-[10px] uppercase text-gray-800">Contato</span>
            </Link>
            <Link href="/indique" className="bg-blue-50 p-6 rounded-3xl flex flex-col gap-2 border border-blue-100">
                <Gift size={20} className="text-blue-600" />
                <span className="font-bold text-[10px] uppercase text-gray-800">Indicar</span>
            </Link>
            <Link href="/parceria" className="bg-orange-50 p-6 rounded-3xl flex flex-col gap-2 border border-orange-100">
                <Users size={20} className="text-orange-600" />
                <span className="font-bold text-[10px] uppercase text-gray-800">Parceria</span>
            </Link>
          </div>
        </section>
      </div>

      {/* ============================================================
          LAYOUT DESKTOP (Alinhado com a página Sobre - pr-10)
          ============================================================ */}
      <div className="hidden lg:block w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
        
        {/* HEADER PRINCIPAL */}
        <div className="mb-6 mt-0">
          <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center">
            <span>Nucleobase<span className="text-blue-600">.APP</span></span>
            <Zap size={58} className="text-blue-600 skew-x-[-15deg] opacity-30 ml-4" strokeWidth={1.5} />
          </h1>
          <h2 className="text-gray-500 text-xl font-medium leading-relaxed -mt-0">
            Organização financeira com clareza e inteligência.
          </h2>
        </div>

        {/* LINHA 1: CONTROLE DE FLUXO */}
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
          Controle de Fluxo <div className="h-px bg-gray-300 flex-1"></div>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          <div className="lg:col-span-6 flex items-up">
            <p className="text-gray-700 text-lg leading-[1.8] mb-0 pr-4">
              A nucleobase.app é uma plataforma digital criada para ajudar pessoas comuns na organização
              de orçamentos domésticos de forma <span className="text-gray-900 font-semibold">simples, clara e consciente.</span> Nosso objetivo é oferecer total autonomia ao usuário, de forma que as decisões financeiras deixem de ser um fardo e se tornem o alicerce para a realização de novos projetos baseados em informações relevantes e consistentes.
            </p>
          </div>

          <div className="lg:col-span-3 flex">
            <div className="bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center w-full">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 mb-4">
                <Newspaper size={24} />
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-1">Blog da Núcleo</h4>
              <p className="text-[11px] text-gray-500 leading-tight mb-4">Conteúdos profundos sobre gestão e mercado.</p>
              <a href="/blog" className="w-full mt-auto py-2.5 bg-blue-50/50 border border-blue-100 text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                Visitar <ArrowRight size={12} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-3 flex">
            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center w-full">
              <div className="bg-white p-3 rounded-2xl text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 mb-4">
                <Mail size={24} />
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-1">Newsletter</h4>
              <p className="text-[11px] text-gray-600 leading-tight mb-4">Insights direto no seu e-mail, toda semana.</p>
              <button onClick={() => setIsModalOpen(true)} className="w-full mt-auto py-2.5 bg-white border border-blue-200 text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center">
                Assinar News
              </button>
            </div>
          </div>
        </div>

        {/* MANIFESTO */}
        <div className="w-full mb-12">
          <p className="text-gray-700 text-lg leading-[1.8]">
            <span className="text-gray-900 font-semibold">Acreditamos que</span> a verdadeira inteligência financeira nasce da união entre clareza de dados e disciplina, transformando números isolados em um roteiro seguro. <span className="text-gray-900 font-semibold">Desenvolvemos uma tecnologia</span> que não apenas organiza números, mas traduz comportamentos. <span className="text-gray-900 font-semibold">Ao eliminar a complexidade técnica,</span> permitimos que você foque no que importa: a construção de um patrimônio sólido. 
            <Link href="/sobre" className="inline-flex items-center ml-2 group">
              <span className="bg-blue-600 text-white px-2 pt-1 pb-0.5 rounded-md text-[10px] font-bold shadow-sm hover:bg-blue-700 transition-colors uppercase tracking-wider">
                Saiba mais aqui.
              </span>
            </Link>
          </p>
        </div>

        {/* CARD: A FERRAMENTA CERTA */}
        <div className="w-full bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group mb-12">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <p className="text-blue-400 text-xs uppercase tracking-[0.3em] font-black mb-4">A ferramenta certa</p>
              <h4 className="text-2xl md:text-3xl font-bold leading-tight">
                Você já sabe o que fazer, só precisa do controle em seu dia a dia. Saiba mais sobre o APP da Nucleobase.
              </h4>
            </div>
            <a href="/planos" className="shrink-0 inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full transition-all font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-900/20 group-hover:scale-105">
              Conhecer Planos <ArrowRight size={20} />
            </a>
          </div>
          <ShieldCheck size={240} className="absolute -right-10 -bottom-20 text-white opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>

        {/* SEÇÕES ADICIONAIS */}
        <div className="space-y-12">
          <section>
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
              Segurança de Dados <div className="h-px bg-gray-300 flex-1"></div>
            </h3>
            <div className="bg-emerald-50/50 border border-emerald-100 p-10 rounded-[3rem] flex flex-col md:flex-row gap-8 items-center">
              <div className="w-20 h-20 bg-white text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-sm shrink-0">
                <Lock size={40} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Privacidade e Soberania</h4>
                <p className="text-gray-600 text-[16px] leading-relaxed mb-6">Custódia integral sob o princípio do Zero-Knowledge.</p>
                <Link href="/seguranca_privacidade" className="group w-fit">
                    <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md hover:bg-blue-700 transition-all uppercase tracking-widest flex items-center gap-2">
                      Acesse aqui <ArrowRight size={12} />
                    </span>
                </Link>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
              Painel de Resultados <div className="h-px bg-gray-300 flex-1"></div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
              <div className="md:col-span-7 text-left">
                <h4 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">Sua visão 360º diretamente no seu Painel</h4>
                <p className="text-gray-600 text-[16px] leading-relaxed mb-8">
                  Mais do que números, entregamos inteligência financeira. O Dashboard da Nucleobase processa seus dados para oferecer diagnósticos precisos.
                </p>
                <Link href="/resultados" className="group">
                  <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md hover:bg-blue-700 transition-all uppercase tracking-widest inline-flex items-center gap-2">
                    CLIQUE AQUI <ArrowRight size={12} />
                  </span>
                </Link>
              </div>
              <div className="md:col-span-5 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl group hover:border-blue-100 transition-all h-full flex flex-col justify-center">
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <BarChart3 size={32} />
                </div>
                <h5 className="font-bold text-gray-900 mb-2">Análise de Performance</h5>
                <p className="text-gray-500 text-sm leading-relaxed">Visualize tendências e identifique gargalos.</p>
              </div>
            </div>
          </section>
          
          <section className="pb-20">
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
              Canais e Oportunidades <div className="h-px bg-gray-300 flex-1"></div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { href: "/suporte", icon: <FileWarning size={28} className="text-amber-500" />, title: "Suporte Técnico", label: "Abrir Chamado", bg: "bg-gray-50", hover: "hover:bg-gray-900" },
                { href: "/contato", icon: <MessageSquare size={28} className="text-emerald-600" />, title: "Fale Conosco", label: "Contactar-nos", bg: "bg-emerald-50/50", hover: "hover:bg-emerald-600" },
                { href: "/indique", icon: <Gift size={28} className="text-blue-600" />, title: "Indique e Ganhe", label: "Gerar Link", bg: "bg-blue-50/50", hover: "hover:bg-blue-600" },
                { href: "/parceria", icon: <Users size={28} className="text-orange-600" />, title: "Seja Parceiro", label: "Amplie Parceria", bg: "bg-orange-50/50", hover: "hover:bg-orange-500" }
              ].map((item, idx) => (
                <div key={idx} className={`${item.bg} border border-gray-100 rounded-[2.5rem] p-8 h-[280px] flex flex-col justify-between group ${item.hover} transition-all duration-500`}>
                  <div>
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6">{item.icon}</div>
                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-white">{item.title}</h4>
                  </div>
                  <a href={item.href} className="w-fit bg-gray-900 text-white px-6 py-3 rounded-full font-bold text-[10px] uppercase group-hover:bg-white group-hover:text-gray-900 transition-all">{item.label}</a>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}