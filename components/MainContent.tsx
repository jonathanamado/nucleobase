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
    
    // Configurações do Web3Forms (Usando sua chave funcional do Blog)
    formData.append("access_key", "9ef5a274-150a-4664-a885-0b052efd06f7");
    formData.append("subject", "Nova Inscrição na Newsletter - Home Nucleobase");

    try {
      // 1. Salva no Supabase
      const { data: { user } } = await supabase.auth.getUser();
      const { error: dbError } = await supabase
        .from("newsletter")
        .insert([{ email: email, user_id: user?.id || null }]);

      // Se for erro de e-mail duplicado, não travamos o envio do e-mail de aviso
      if (dbError && dbError.code !== '23505') throw dbError;

      // 2. Envia notificação via Web3Forms
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        setEnviado(true);
      } else {
        throw new Error("Erro no serviço de e-mail");
      }
    } catch (err) {
      console.error("Erro no processamento:", err);
      alert("Erro ao processar assinatura. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
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
                  <input 
                    required 
                    type="email" 
                    name="email" // Importante para o Web3Forms
                    placeholder="Seu melhor e-mail" 
                    className="w-full bg-gray-50 border-transparent rounded-2xl py-4 px-6 text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                  />
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
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
          <Zap size={64} className="text-blue-600 opacity-30 ml-4" strokeWidth={1.5} />
        </h1>
        <h2 className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed -mt-0">
          Organização financeira com clareza e inteligência.
        </h2>
      </div>

      {/* LINHA 1: ALINHADA À ESQUERDA */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-12 flex items-center gap-4">
        Controle de Fluxo <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
        <div className="lg:col-span-7">
          <p className="text-gray-700 text-lg leading-[1.8] mb-8">
            A nucleobase.app é uma plataforma criada para ajudar pessoas na organização
            de orçamentos domésticos de forma <span className="text-gray-900 font-semibold">simples, clara e consciente.</span> Acesse a página que conta mais sobre a nossa história, 
            <Link href="/sobre" className="inline-flex items-center ml-2 group">
                <span className="bg-blue-600 text-white px-2 pt-1 pb-0.5 rounded-md text-[10px] font-bold shadow-sm hover:bg-blue-700 transition-colors uppercase tracking-wider">
                  Clicando aqui
                </span>
            </Link>.
          </p>
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-black mb-4">A ferramenta certa</p>
              <h4 className="text-xl font-bold mb-6">Você sabe o que fazer, agora só precisa do controle em seu dia a dia.</h4>
              <a href="/planos" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full transition-all font-bold text-sm">
                Conhecer Planos <ArrowRight size={18} />
              </a>
            </div>
            <ShieldCheck size={140} className="absolute -right-10 -bottom-10 text-white opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-2">
          <div className="bg-white border border-gray-100 p-4 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group">
            <Newspaper className="text-blue-600 mb-4" size={32} />
            <h4 className="font-bold text-gray-900 mb-2 text-lg">Blog da Núcleo</h4>
            <p className="text-sm text-gray-500 mb-6">Educação e estratégia lado a lado.</p>
            <a href="/blog" className="text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">Visitar Blog <ArrowRight size={14} /></a>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-[2.5rem]">
            <Mail className="text-blue-600 mb-4" size={32} />
            <h4 className="font-bold text-gray-900 mb-2 text-lg">Newsletter</h4>
            <p className="text-sm text-gray-600 mb-4">Insights estratégicos no seu e-mail.</p>
            <button onClick={() => setIsModalOpen(true)} className="w-full py-3 bg-white border border-blue-200 text-blue-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Assinar News</button>
          </div>
        </div>
      </div>

      <div className="space-y-24">
        
        {/* LINHA 2: ALINHADA À DIREITA */}
        <section>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
            <div className="h-px bg-gray-300 flex-1"></div> Painel de Resultados 
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-50/50">
              <BarChart3 className="text-blue-600 mb-6" size={40} />
              <p className="text-gray-600 text-lg leading-relaxed">Visualize sua saúde financeira através de gráficos intuitivos. O Dashboard da Nucleobase transforma lançamentos complexos em decisões baseadas em dados reais.</p>
            </div>
            <div className="text-left">
              <h4 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Sua visão 360º</h4>
              <p className="text-gray-500 text-xl italic font-medium mb-8">"Dados sem interpretação são apenas ruído. Na Nucleobase, entregamos clareza."</p>
              <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                Acesse o Painel de resultados 
                <Link href="/resultados" className="group">
                  <span className="bg-blue-600 text-white px-2 pt-1 pb-0.5 rounded-md text-[10px] font-bold shadow-sm hover:bg-blue-700 transition-colors uppercase tracking-wider">
                    clicando aqui.
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* LINHA 3: ALINHADA À ESQUERDA */}
        <section>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
            Segurança de Dados <div className="h-px bg-gray-300 flex-1"></div>
          </h3>
          <div className="bg-emerald-50/50 border border-emerald-100 p-10 rounded-[3rem] flex flex-col md:flex-row gap-8 items-center">
            <div className="w-20 h-20 bg-white text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-sm shrink-0">
              <Lock size={40} />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Sigilo Bancário Absoluto</h4>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">Mantemos a privacidade total. Diferente de outros apps, não conectamos sua conta diretamente. Você mantém a custódia total das informações sem expor senhas sensíveis.</p>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                Conheça mais sobre a Segurança da Núcleo 
                <Link href="/seguranca_privacidade" className="group">
                  <span className="bg-blue-600 text-white px-2 pt-1 pb-0.5 rounded-md text-[10px] font-bold shadow-sm hover:bg-blue-700 transition-colors uppercase tracking-wider">
                    clicando aqui.
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* LINHA 4: ALINHADA À DIREITA */}
        <section>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
             <div className="h-px bg-gray-300 flex-1"></div> Dúvidas Comuns (FAQ)
          </h3>
          <div className="bg-blue-50/30 border border-blue-100 p-10 rounded-[3rem] flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="w-20 h-20 bg-white text-blue-600 rounded-[2rem] flex items-center justify-center shadow-sm shrink-0">
              <HelpCircle size={40} />
            </div>
            <div className="md:text-right">
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Central de Ajuda</h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                Precisa de ajuda com o primeiro lançamento? Nossa central possui guias rápidos sobre gestão de custos e planejamento de receitas futuras.
                <Link href="/faq" className="inline-flex items-center ml-2 group">
                  <span className="bg-blue-600 text-white px-2 pt-1 pb-0.5 rounded-md text-[10px] font-bold shadow-sm hover:bg-blue-700 transition-colors uppercase tracking-wider">
                    Clique aqui e saiba mais.
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* LINHA 5: ALINHADA À ESQUERDA - DEPOIMENTOS EM DESTAQUE */}
        <section>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
            Depoimentos <div className="h-px bg-gray-300 flex-1"></div>
          </h3>
          <div className="bg-white border border-gray-100 shadow-2xl shadow-blue-50/50 rounded-[3rem] p-10 relative overflow-hidden max-w-4xl mx-auto">
            <Quote size={80} className="absolute -top-4 -right-4 text-blue-50 opacity-40" />
            <div className="relative z-10 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-100 overflow-hidden flex items-center justify-center shadow-sm">
                  <img 
                    src="/depoimentos/a-silva.png" 
                    alt="A. Silva" 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <p className="font-black text-gray-900 text-sm uppercase tracking-wider">A. Silva</p>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">Empreendedor Digital</p>
                </div>
                <div className="flex gap-0.5 md:ml-auto">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-orange-400 text-orange-400" />)}
                </div>
              </div>
              
              <p className="text-gray-700 text-2xl leading-relaxed font-medium italic mb-12">
                "Finalmente encontrei uma plataforma que simplifica o que era complexo. A visualização clara dos meus rendimentos me trouxe uma paz de espírito que eu não tinha com planilhas manuais. Prático e essencial."
              </p>

              <div className="space-y-10">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Sua voz é importante para nós melhorarmos a Plataforma.</h3>
                  <p className="text-gray-500 font-medium italic mt-1">Como a Nucleobase mudou sua rotina hoje?</p>
                </div>

                <div className="flex flex-col items-center md:items-start gap-8">
                  <a 
                    href="/publicacao_depoimentos" 
                    className="group relative inline-flex items-center justify-center gap-3 px-12 py-5 bg-gray-900 text-white rounded-full hover:bg-black transition-all font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-gray-400 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <Plus size={18} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" /> 
                    <span className="relative z-10">Deixar meu depoimento</span>
                  </a>
                  
                  <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                    Conheça as experiências dos nossos usuários. 
                    <Link href="/depoimentos" className="group">
                      <span className="bg-blue-600 text-white px-2 pt-1 pb-0.5 rounded-md text-[10px] font-bold shadow-sm hover:bg-blue-700 transition-colors uppercase tracking-wider">
                        Acesse aqui e inspire-se.
                      </span>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LINHA 6: ALINHADA À DIREITA */}
        <section>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
             <div className="h-px bg-gray-300 flex-1"></div> Suporte e Canais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <FileWarning size={24} className="text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">Suporte Técnico</h3>
                <p className="text-gray-400 mb-8 text-sm leading-relaxed max-w-[280px]">
                  Encontrou algo errado? Nos avise para que possamos corrigir imediatamente.
                </p>
                <a 
                  href="/suporte"
                  className="inline-flex items-center gap-3 bg-gray-800 text-white border border-gray-700 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-700 transition-all"
                >
                  Abrir Chamado
                </a>
              </div>
            </div>

            <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">Fale Conosco</h3>
                <p className="text-emerald-100 mb-8 text-sm leading-relaxed max-w-[280px]">
                  Sugestões ou dúvidas comerciais? Avalie a forma que mais gostar para fazer contato.
                </p>

                <a 
                  href="/contato"
                  className="inline-flex items-center gap-3 bg-white text-emerald-600 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-lg"
                >
                  Contactar-nos Agora
                </a>

              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
            </div>

          </div>
        </section>

        {/* PARCERIA E INDICAÇÃO */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-10 bg-blue-600 rounded-[3rem] text-white shadow-xl shadow-blue-100">
            <Gift size={32} className="mb-4" />
            <h4 className="text-xl font-bold mb-2">Indique o APP</h4>
            <p className="text-blue-100 mb-6">Compartilhe a Núcleo com inteligência.</p>
            <a href="/indique" className="inline-block px-8 py-3 bg-white text-blue-600 rounded-full font-bold text-[10px] uppercase tracking-widest">Crie seu Link e indique o APP</a>
          </div>
          <div className="p-10 bg-orange-500 rounded-[3rem] text-white shadow-xl shadow-orange-100">
            <Users size={32} className="mb-4" />
            <h4 className="text-xl font-bold mb-2">Seja nosso Parceiro</h4>
            <p className="text-orange-100 mb-6">Cresça junto com o ecossistema Nucleobase.</p>
            <a href="/parceria" className="inline-block px-8 py-3 bg-white text-orange-500 rounded-full font-bold text-[10px] uppercase tracking-widest">Amplie sua parceria com a Nucleo</a>
          </div>
        </section>
      </div>
    </div>
  );
}