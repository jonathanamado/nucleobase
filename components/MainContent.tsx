"use client";
import React, { useState } from "react";
import Link from 'next/link';
import { 
  Zap, ArrowRight, Mail, Newspaper, ShieldCheck, 
  BarChart3, MessageSquare, HelpCircle, Lock, 
  Users, Gift, X, Loader2, CheckCircle2, Star, Quote, Plus, FileWarning
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
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* MODAL DE NEWSLETTER */}
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

      {/* HEADER PRINCIPAL */}
      <div className="mb-6 mt-0">
        <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center">
          <span>Nucleobase<span className="text-blue-600">.APP</span></span>
          <Zap size={58} className="text-blue-600 skew-x-[-15deg] opacity-30 ml-4" strokeWidth={1.5} />
        </h1>
        <h2 className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed -mt-0">
          Organização financeira com clareza e inteligência.
        </h2>
      </div>

      {/* LINHA 1: CONTROLE DE FLUXO */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
        Controle de Fluxo <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* NOVA ESTRUTURA: BLOCO INSTITUCIONAL + CARDS EM 3 COLUNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-4">
        {/* Coluna 1: Texto Institucional */}
        <div className="lg:col-span-6 flex items-up">
          <p className="text-gray-700 text-lg leading-[1.8] mb-0">
            A nucleobase.app é uma plataforma digital criada para ajudar pessoas comuns na organização
            de orçamentos domésticos de forma <span className="text-gray-900 font-semibold">simples, clara e consciente.</span> Nosso objetivo é oferecer total autonomia ao usuário, de forma que as decisões financeiras deixem de ser um fardo e se tornem o alicerce para a realização de novos projetos baseados em informações relevantes e consistentes.
          </p>
        </div>

        {/* Coluna 2: Blog */}
        <div className="lg:col-span-3 flex">
          <div className="bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center w-full">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 mb-4">
              <Newspaper size={24} />
            </div>
            <h4 className="font-bold text-gray-900 text-base mb-1">Blog da Núcleo</h4>
            <p className="text-[11px] text-gray-500 leading-tight mb-4">
              Conteúdos profundos sobre gestão e mercado.
            </p>
            <a href="/blog" className="w-full mt-auto py-2.5 bg-blue-50/50 border border-blue-100 text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
              Visitar <ArrowRight size={12} />
            </a>
          </div>
        </div>

        {/* Coluna 3: Newsletter */}
        <div className="lg:col-span-3 flex">
          <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center w-full">
            <div className="bg-white p-3 rounded-2xl text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 mb-4">
              <Mail size={24} />
            </div>
            <h4 className="font-bold text-gray-900 text-base mb-1">Newsletter</h4>
            <p className="text-[11px] text-gray-600 leading-tight mb-4">
              Insights direto no seu e-mail toda semana.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="w-full mt-auto py-2.5 bg-white border border-blue-200 text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center">
              Assinar News
            </button>
          </div>
        </div>
      </div>

      {/* BLOCO MANIFESTO (LARGURA TOTAL) */}
      <div className="w-full mb-12">
        <p className="text-gray-700 text-lg leading-[1.8]">
          <span className="text-gray-900 font-semibold">Acreditamos que</span> a verdadeira inteligência financeira nasce da união entre clareza de dados e disciplina, transformando números isolados em um roteiro seguro. <span className="text-gray-900 font-semibold">Desenvolvemos uma tecnologia</span> que não apenas organiza números, mas traduz comportamentos. <span className="text-gray-900 font-semibold">Ao eliminar a complexidade técnica,</span> permitimos que você foque no que importa: a construção de um patrimônio sólido e a segurança da sua família, utilizando uma interface que respeita seu tempo e privacidade. Acesse a página que conta mais a nossa história:
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
          <div className="max-w-2xl">
            <p className="text-blue-400 text-xs uppercase tracking-[0.3em] font-black mb-4">A ferramenta certa</p>
            <h4 className="text-xl md:text-2xl font-bold leading-tight">
              Você já sabe o que fazer, só precisa do controle em seu dia a dia. Saiba mais sobre o APP da Nucleobase.
            </h4>
          </div>
          <a href="/planos" className="shrink-0 inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full transition-all font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-900/20 group-hover:scale-105">
            Conhecer Planos <ArrowRight size={20} />
          </a>
        </div>
        <ShieldCheck size={200} className="absolute -right-10 -bottom-20 text-white opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
      </div>

      {/* RESTANTE DAS SEÇÕES (PAINEL, SEGURANÇA, FAQ, ETC.) */}
      <div className="space-y-12">
        {/* Painel de Resultados */}
        <section>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
            <div className="h-px bg-gray-300 flex-1"></div> Painel de Resultados 
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="text-left">
              <h4 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
                Sua visão 360º diretamente em <br /> seu Painel de Resultados
              </h4>
              <p className="text-gray-600 text-[16px] leading-relaxed mb-8">
                Mais do que números, entregamos <span className="font-semibold text-gray-900">inteligência financeira</span>. O Dashboard da Nucleobase processa seus dados para oferecer diagnósticos precisos sobre margem de segurança, fluxo de caixa e projeções futuras.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Explore sua nova interface</p>
                <Link href="/resultados" className="group">
                  <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md hover:bg-blue-700 transition-all uppercase tracking-widest flex items-center gap-2">
                    CLIQUE AQUI <ArrowRight size={12} />
                  </span>
                </Link>
              </div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-50/50 group hover:border-blue-100 transition-all">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <BarChart3 size={32} />
              </div>
              <h5 className="font-bold text-gray-900 mb-2">Análise de Performance</h5>
              <p className="text-gray-500 text-sm leading-relaxed">
                Transforme lançamentos isolados em uma narrativa financeira clara. Visualize tendências e identifique gargalos.
              </p>
            </div>
          </div>
        </section>

        {/* Segurança */}
        <section>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
            Segurança de Dados <div className="h-px bg-gray-300 flex-1"></div>
          </h3>
          <div className="bg-emerald-50/50 border border-emerald-100 p-10 rounded-[3rem] flex flex-col md:flex-row gap-8 items-center">
            <div className="w-20 h-20 bg-white text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-sm shrink-0">
              <Lock size={40} />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Privacidade e Soberania de Dados</h4>
              <p className="text-gray-600 text-[16px] leading-relaxed mb-6">
                Na <span className="font-semibold text-gray-900">Nucleobase</span> você mantém a custódia integral das suas informações sob o princípio do <span className="italic text-blue-600">Zero-Knowledge</span>.
              </p>
              <Link href="/seguranca_privacidade" className="group">
                <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md hover:bg-blue-700 transition-all uppercase tracking-widest flex items-center gap-2">
                  Acesse aqui <ArrowRight size={12} />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Canais e Oportunidades (Grid 2x2) */}
        <section className="pb-20">
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
            Canais e Oportunidades <div className="h-px bg-gray-300 flex-1"></div>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-10 h-[300px] flex flex-col justify-between group hover:bg-gray-900 transition-all duration-500">
              <div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-400 transition-colors">
                  <FileWarning size={28} className="text-amber-500 group-hover:text-gray-900" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 group-hover:text-white">Suporte Técnico</h4>
                <p className="text-gray-500 group-hover:text-gray-400 text-sm">Correções imediatas para você.</p>
              </div>
              <a href="/suporte" className="w-fit bg-gray-900 text-white px-8 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest group-hover:bg-white group-hover:text-gray-900 transition-all">
                Abrir Chamado
              </a>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] p-10 h-[300px] flex flex-col justify-between group hover:bg-emerald-600 transition-all duration-500">
              <div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare size={28} className="text-emerald-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 group-hover:text-white">Fale Conosco</h4>
                <p className="text-emerald-700/70 group-hover:text-emerald-50 text-sm">Dúvidas comerciais ou sugestões.</p>
              </div>
              <a href="/contato" className="w-fit bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest group-hover:bg-white group-hover:text-emerald-600 transition-all">
                Contactar-nos
              </a>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-[2.5rem] p-10 h-[300px] flex flex-col justify-between group hover:bg-blue-600 transition-all duration-500">
              <div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6">
                  <Gift size={28} className="text-blue-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 group-hover:text-white">Indique e Ganhe</h4>
                <p className="text-blue-700/70 group-hover:text-blue-50 text-sm">Compartilhe e ajude mais pessoas.</p>
              </div>
              <a href="/indique" className="w-fit bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest group-hover:bg-white group-hover:text-blue-600 transition-all">
                Gerar Link
              </a>
            </div>

            <div className="bg-orange-50/50 border border-orange-100 rounded-[2.5rem] p-10 h-[300px] flex flex-col justify-between group hover:bg-orange-500 transition-all duration-500">
              <div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6">
                  <Users size={28} className="text-orange-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 group-hover:text-white">Seja Parceiro</h4>
                <p className="text-orange-700/70 group-hover:text-orange-50 text-sm">Construa o futuro conosco.</p>
              </div>
              <a href="/parceria" className="w-fit bg-orange-500 text-white px-8 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest group-hover:bg-white group-hover:text-orange-500 transition-all">
                Amplie Parceria
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}