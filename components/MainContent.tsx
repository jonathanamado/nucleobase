"use client";
import React, { useState } from "react";
import Link from 'next/link';
import { 
  Zap, ArrowRight, Mail, Newspaper, ShieldCheck, 
  BarChart3, MessageSquare, HelpCircle, Lock, 
  Users, Gift, X, Loader2, CheckCircle2, Star, Quote, Plus, FileWarning
} from "lucide-react"; // Corrigido para lucide-react
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

      {/* GRID PRINCIPAL: mb-4 para aproximar o próximo card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-4">
        <div className="lg:col-span-7">
          <div className="lg:col-span-7">
            <p className="text-gray-700 text-lg leading-[1.8] mb-0">
              A nucleobase.app é uma plataforma digital criada para ajudar pessoas comuns na organização
              de orçamentos domésticos de forma <span className="text-gray-900 font-semibold">simples, clara e consciente.</span> Nosso objetivo é oferecer total autonomia ao usuário, de forma que as <span className="text-gray-900 font-medium">decisões financeiras deixem de ser um fardo e se tornem o alicerce para a realização de novos projetos.</span>
              
              <br /><br />
              
              <span className="text-gray-900 font-semibold">Acreditamos que</span> a verdadeira inteligência financeira nasce da união entre clareza de dados e disciplina simplificada, transformando números isolados em um roteiro seguro. Acesse a página que conta mais da nossa história 
              <Link href="/sobre" className="inline-flex items-center ml-2 group">
                  <span className="bg-blue-600 text-white px-2 pt-1 pb-0.5 rounded-md text-[10px] font-bold shadow-sm hover:bg-blue-700 transition-colors uppercase tracking-wider">
                    Clicando aqui.
                  </span>
              </Link>
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-3 flex flex-col items-center lg:items-end justify-center">
          {/* BLOCO: BLOG DA NÚCLEO */}
          <div className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center w-full max-w-[280px] h-[180px]">
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">
                  <Newspaper size={22} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 text-base leading-tight">Blog da Núcleo</h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Educação e estratégia</p>
                </div>
              </div>
              <p className="text-[12px] text-gray-500 leading-tight px-2">
                Conteúdos profundos sobre gestão e mercado para sua evolução.
              </p>
            </div>
            
            <a 
              href="/blog" 
              className="w-full mt-auto py-2.5 bg-blue-50/50 border border-blue-100 text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
            >
              Visitar Blog <ArrowRight size={12} />
            </a>
          </div>

          {/* BLOCO: NEWSLETTER */}
          <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center w-full max-w-[280px] h-[180px]">
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white p-2 rounded-xl text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">
                  <Mail size={22} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 text-base leading-tight">Newsletter</h4>
                  <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">Direto no seu e-mail</p>
                </div>
              </div>
              <p className="text-[12px] text-gray-600 leading-tight px-2">
                Insights para você permanecer conectado conosco e com suas finanças.
              </p>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)} 
              className="w-full mt-auto py-2.5 bg-white border border-blue-200 text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
            >
              Assinar News
            </button>
          </div>
        </div>
      </div>

      {/* CARD: A FERRAMENTA CERTA - Margem negativa suave (-mt-2) e mb padronizado (mb-12) */}
      <div className="w-full bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group mb-12 -mt-0">
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

      {/* TODAS AS SEÇÕES ABAIXO PADRONIZADAS COM space-y-12 */}
      <div className="space-y-12">
        
        {/* LINHA 2: PAINEL DE RESULTADOS ENRIQUECIDO */}
        <section>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
            <div className="h-px bg-gray-300 flex-1"></div> Painel de Resultados 
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="text-left">
              {/* Título com a quebra forçada mantida */}
              <h4 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
                Sua visão 360º diretamente em <br /> seu Painel de Resultados
              </h4>
              <p className="text-gray-600 text-[16px] leading-relaxed mb-8">
                Mais do que números, entregamos <span className="font-semibold text-gray-900">inteligência financeira</span>. O Dashboard da Nucleobase processa seus dados para oferecer diagnósticos precisos sobre margem de segurança, fluxo de caixa e projeções futuras, permitindo que você tome decisões baseadas em <span className="text-blue-600 italic">evidências reais</span>, não em suposições.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">
                  Explore sua nova interface  
                </p>
                <Link href="/resultados" className="group">
                  <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md hover:bg-blue-700 transition-all uppercase tracking-widest flex items-center gap-2">
                    CLIQUE AQUI <ArrowRight size={12} />
                  </span>
                </Link>
              </div><br /><br /><br />
            </div>
            
            {/* CARD VISUAL À DIREITA */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-50/50 group hover:border-blue-100 transition-all">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <BarChart3 size={32} />
              </div>
              <h5 className="font-bold text-gray-900 mb-2">Análise de Performance</h5>
              <p className="text-gray-500 text-sm leading-relaxed">
                Transforme lançamentos isolados em uma narrativa financeira clara. Visualize tendências, identifique gargalos e otimize seus recursos com gráficos projetados para alta legibilidade.
              </p>
            </div>
          </div>
        </section>

        {/* LINHA 3: SEGURANÇA */}
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
                Diferente de plataformas que exigem acesso às suas credenciais bancárias, na <span className="font-semibold text-gray-900">Nucleobase</span> você mantém a custódia integral das suas informações. Operamos sob o princípio do <span className="italic text-blue-600">Zero-Knowledge</span>: não conectamos suas contas diretamente para garantir que o sigilo dos seus dados financeiros seja absoluto e inviolável.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">
                  Entenda nossos protocolos de segurança 
                </p>
                <Link href="/seguranca_privacidade" className="group">
                  <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md hover:bg-blue-700 transition-all uppercase tracking-widest flex items-center gap-2">
                    Acesse aqui <ArrowRight size={12} />
                  </span>
                </Link>
              </div>
            </div>
          </div><br /><br /><br />
        </section>

        {/* LINHA 4: FAQ (Simétrica à Segurança) */}
        <section>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
            <div className="h-px bg-gray-300 flex-1"></div> Suporte ao Conhecimento (FAQ)
          </h3>
          <div className="bg-blue-50/30 border border-blue-100 p-10 rounded-[3rem] flex flex-col md:flex-row-reverse gap-8 items-center">
            {/* Ícone espelhado à direita */}
            <div className="w-20 h-20 bg-white text-blue-600 rounded-[2rem] flex items-center justify-center shadow-sm shrink-0">
              <HelpCircle size={40} />
            </div>
            
            <div className="md:text-right">
              <h4 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Esclareça suas Dúvidas e Domine o APP</h4>
              <p className="text-gray-600 text-[16px] leading-relaxed mb-6">
                Da configuração inicial ao domínio de relatórios avançados: nossa <span className="font-semibold text-gray-900">Base de Conhecimento</span> foi estruturada para oferecer respostas rápidas e tutoriais intuitivos. Encontre guias práticos sobre gestão de ativos, categorização inteligente de despesas e como extrair o máximo potencial da sua conta.
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">
                  Precisa de uma orientação rápida?
                </p>
                <Link href="/faq" className="group">
                  <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md hover:bg-blue-700 transition-all uppercase tracking-widest flex items-center gap-2">
                    Consultar FAQ <ArrowRight size={12} />
                  </span>
                </Link>
              </div>
            </div>
          </div><br /><br /><br />
        </section>

        {/* LINHA 5: DEPOIMENTOS COM TEXTO LATERAL */}
        <section>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
            Depoimentos <div className="h-px bg-gray-300 flex-1"></div>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* CARD DO DEPOIMENTO (Lado Esquerdo no Desktop) */}
            <div className="lg:col-span-8 bg-white border border-gray-100 shadow-2xl shadow-blue-50/50 rounded-[3rem] p-8 md:p-10 relative overflow-hidden">
              <Quote size={80} className="absolute -top-4 -right-4 text-blue-50 opacity-40" />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-100 overflow-hidden flex items-center justify-center shadow-sm">
                    <img src="/depoimentos/a-silva.png" alt="A. Silva" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm uppercase tracking-wider">A. Silva</p>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">Empreendedor Digital</p>
                  </div>
                  <div className="flex gap-0.5 md:ml-auto">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-orange-400 text-orange-400" />)}
                  </div>
                </div>
                <p className="text-gray-700 text-base leading-relaxed font-medium italic mb-10">
                  "Finalmente encontrei uma plataforma que simplifica o que era complexo. A visualização clara dos meus rendimentos me trouxe uma paz de espírito que eu não tinha com planilhas manuais. Prático e essencial."
                </p>
                <div className="flex flex-col items-center md:items-start gap-8">
                  <a href="/publicacao_depoimentos" className="group relative inline-flex items-center justify-center gap-3 px-12 py-5 bg-gray-900 text-white rounded-full hover:bg-black transition-all font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-gray-400 overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <Plus size={28} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" /> 
                    <span className="relative z-10">Deixar meu depoimento</span>
                  </a>
                </div>
              </div>
            </div>

            {/* TEXTO DE INCENTIVO (Lado Direito no Desktop) */}
            <div className="lg:col-span-4 space-y-4 text-center lg:text-left px-4">
              <h4 className="text-xl font-bold text-gray-900 leading-tight">
                Sua experiência molda a nossa evolução.
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Explore outros relatos reais para inspirar-se ou compartilhe suas críticas e elogios sobre a plataforma.
              </p>
              <Link href="/depoimentos" className="inline-flex items-center group">
                <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-black shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest">
                  CLIQUE AQUI E SAIBA MAIS.
                </span>
              </Link>
            </div>
          </div><br /><br /><br />
        </section>

        {/* SEÇÃO FINAL: CANAIS E PARCERIAS (GRID 2x2) */}
        <section className="pb-20">
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
            Canais e Oportunidades <div className="h-px bg-gray-300 flex-1"></div>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. SUPORTE TÉCNICO - Dark Mode que acende */}
            <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-10 relative overflow-hidden group transition-all duration-500 hover:bg-gray-900 h-[320px] flex flex-col justify-between shadow-sm">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-amber-400 transition-colors duration-500">
                  <FileWarning size={28} className="text-amber-500 group-hover:text-gray-900" />
                </div>
                <h4 className="text-2xl font-bold mb-3 tracking-tight text-gray-900 group-hover:text-white transition-colors">Suporte Técnico</h4>
                <p className="text-gray-500 group-hover:text-gray-400 text-sm leading-relaxed max-w-[260px] transition-colors">
                  Encontrou algo fora do lugar? Nossa equipe está pronta para correções imediatas.
                </p>
              </div>
              <a href="/suporte" className="relative z-10 w-fit inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.15em] hover:bg-amber-400 hover:text-gray-900 group-hover:bg-white group-hover:text-gray-900 transition-all shadow-md">
                Abrir Chamado <ArrowRight size={14} />
              </a>
            </div>

            {/* 2. FALE CONOSCO - Emerald Effect */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] p-10 relative overflow-hidden group transition-all duration-500 hover:bg-emerald-600 h-[320px] flex flex-col justify-between shadow-sm">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-500">
                  <MessageSquare size={28} className="text-emerald-600" />
                </div>
                <h4 className="text-2xl font-bold mb-3 tracking-tight text-gray-900 group-hover:text-white transition-colors">Fale Conosco</h4>
                <p className="text-emerald-700/70 group-hover:text-emerald-50 text-sm leading-relaxed max-w-[260px] transition-colors">
                  Dúvidas comerciais ou sugestões estratégicas? Adoramos ouvir nossos usuários.
                </p>
              </div>
              <a href="/contato" className="relative z-10 w-fit inline-flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.15em] group-hover:bg-white group-hover:text-emerald-600 transition-all shadow-md">
                Contactar-nos <ArrowRight size={14} />
              </a>
            </div>

            {/* 3. INDIQUE O APP - Blue Effect */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-[2.5rem] p-10 relative overflow-hidden group transition-all duration-500 hover:bg-blue-600 h-[320px] flex flex-col justify-between shadow-sm">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:rotate-12 transition-transform duration-500">
                  <Gift size={28} className="text-blue-600" />
                </div>
                <h4 className="text-2xl font-bold mb-3 tracking-tight text-gray-900 group-hover:text-white transition-colors">Indique e Ganhe</h4>
                <p className="text-blue-700/70 group-hover:text-blue-50 text-sm leading-relaxed max-w-[260px] transition-colors">
                  Compartilhe a Nucleobase com sua rede e ajude mais pessoas a ter clareza financeira.
                </p>
              </div>
              <a href="/indique" className="relative z-10 w-fit inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.15em] group-hover:bg-white group-hover:text-blue-600 transition-all shadow-md">
                Gerar meu Link <ArrowRight size={14} />
              </a>
            </div>

            {/* 4. SEJA PARCEIRO - Orange Effect */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-[2.5rem] p-10 relative overflow-hidden group transition-all duration-500 hover:bg-orange-500 h-[320px] flex flex-col justify-between shadow-sm">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Users size={28} className="text-orange-600" />
                </div>
                <h4 className="text-2xl font-bold mb-3 tracking-tight text-gray-900 group-hover:text-white transition-colors">Seja Parceiro</h4>
                <p className="text-orange-700/70 group-hover:text-orange-50 text-sm leading-relaxed max-w-[260px] transition-colors">
                  Construa o futuro da educação financeira conosco. Vamos crescer juntos.
                </p>
              </div>
              <a href="/parceria" className="relative z-10 w-fit inline-flex items-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.15em] group-hover:bg-white group-hover:text-orange-500 transition-all shadow-md">
                Amplie sua Parceria <ArrowRight size={14} />
              </a>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}