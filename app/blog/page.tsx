"use client";
import React, { useState } from "react";
import { 
  Newspaper, 
  ArrowRight, 
  Clock, 
  PenTool, 
  Mail, 
  Plus, 
  X, 
  CheckCircle2, 
  Loader2,
  Instagram,
  Wallet,
  LineChart,
  Gem,
  Building2,
  BarChart3,
  Target
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 
import Link from "next/link";

export default function BlogDaNucleo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const posts = [
    { 
      id: 1, 
      tag: "Gestão", 
      titulo: "A ciência por trás da separação de contas (PF e PJ).", 
      preview: "Por que misturar seus gastos pessoais com os do lançamento é o erro número 1 que destrói o ROI.", 
      editoria: "Estratégia de Negócios", 
      foco: "Organização Patrimonial", 
      tempo: "5 min",
      slug: "a-ciencia-por-tras-da-separacao-de-contas",
      icon: <Wallet size={20} />
    },
    { 
      id: 2, 
      tag: "Estratégia", 
      titulo: "Fluxo de caixa: Como prever o fôlego financeiro.", 
      preview: "Entenda como a antecipação de recebíveis impacta sua saúde patrimonial no carrinho aberto.", 
      editoria: "Gestão de Tráfego", 
      foco: "Previsibilidade de Caixa", 
      tempo: "8 min",
      slug: "fluxo-de-caixa-como-prever-o-folego-financeiro",
      icon: <LineChart size={20} />
    },
    { 
      id: 3, 
      tag: "Mentalidade", 
      titulo: "O lucro consciente: O que fazer após o 6 em 7.", 
      preview: "Bateu a meta? Saiba como reinvestir inteligentemente na estrutura da sua empresa.", 
      editoria: "Mercado de Infoprodutos", 
      foco: "Cultura de Reinvestimento", 
      tempo: "6 min",
      slug: "o-lucro-consciente-o-que-fazer-apos-o-6-em-7",
      icon: <Gem size={20} />
    },
    { 
      id: 4, 
      tag: "Tributário", 
      titulo: "Holdings no Mercado Digital: Vale a pena?", 
      preview: "A estrutura societária correta pode economizar milhares de reais em impostos no longo prazo.", 
      editoria: "Direito Tributário", 
      foco: "Eficiência Fiscal", 
      tempo: "10 min",
      slug: "holdings-no-metcado-digital-vale-a-pena",
      icon: <Building2 size={20} />
    },
    { 
      id: 5, 
      tag: "Escala", 
      titulo: "KPIs que realmente importam para o seu Financeiro.", 
      preview: "Pare de olhar apenas para o faturamento bruto e comece a analisar sua margem líquida real.", 
      editoria: "Controladoria Digital", 
      foco: "Métricas de Sobrevivência", 
      tempo: "7 min",
      slug: "kpis-que-realmente-importam-para-o-seu-financeiro",
      icon: <BarChart3 size={20} />
    },
    { 
      id: 6, 
      tag: "Lançamento", 
      titulo: "Custo por Lead vs. Lucratividade Final.", 
      preview: "Como equilibrar o investimento em captação sem comprometer o caixa da operação.", 
      editoria: "Copy & Estratégia", 
      foco: "Análise de ROI Real", 
      tempo: "5 min",
      slug: "custo-por-lead-vs-lucratividade-final",
      icon: <Target size={20} />
    }
  ];

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    formData.append("access_key", "9ef5a274-150a-4664-a885-0b052efd06f7");
    formData.append("subject", "Nova Inscrição na Newsletter - Blog Núcleo");

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
    } catch (err) {
      console.error("Erro no processamento:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
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
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                    <Mail size={24} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Newsletter</h3>
                <p className="text-gray-500 mb-8 font-medium text-sm">Insights financeiros e estratégicos toda semana.</p>
                
                <div className="space-y-4">
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <input required type="email" name="email" placeholder="Seu melhor e-mail" className="w-full bg-gray-50 border-transparent rounded-2xl py-4 px-6 text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" />
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : "Assinar"}
                    </button>
                  </form>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                    <div className="relative flex justify-center text-[8px] uppercase tracking-widest font-bold"><span className="bg-white px-2 text-gray-400">ou</span></div>
                  </div>
                  <a 
                    href="/escrever" 
                    className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                  >
                    Escrever Artigo
                  </a>
                </div>
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

      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Blog Nucleobase<span className="text-blue-600">.</span></span>
            <Newspaper size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-0">
            Educação e estratégia em âmbito pessoal.
          </h2>
        </div>

        <div className="hidden md:flex flex-wrap gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm"
          >
            <Mail size={14} /> Assinar Newsletter
          </button>
          <a href="/blog/contribuir" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg">
            <Plus size={14} /> Escrever Artigo
          </a>
        </div>
      </div>

      {/* LINHA DIVISÓRIA INICIAL */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Acompanhe e participe <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* INTRODUÇÃO */}
      <div className="mb-10 text-left">
        <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
          Experiências que <span className="text-blue-600">transformam</span> resultados.
        </h3>
        <p className="text-gray-500 text-base md:text-lg font-medium leading-relaxed max-w-4xl">
          Conheça os pilares da inteligência financeira aplicados ao mercado digital e domine seus números:
        </p>
      </div>

      {/* GRID DE POSTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-20">
        {posts.map((post) => (
          <div key={post.id} className="group bg-white border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:shadow-blue-50/50 transition-all flex flex-col min-h-fit md:min-h-[420px]">
            <div className="flex items-start justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  {post.icon}
                </div>
                <div>
                  <p className="text-[10px] md:text-[12px] font-black text-gray-900 uppercase tracking-wider">{post.editoria}</p>
                  <p className="text-[8px] md:text-[10px] text-blue-600 font-bold uppercase tracking-tight">{post.foco}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black text-blue-600/40 uppercase tracking-widest pt-1">
                <Clock size={12} /> {post.tempo}
              </div>
            </div>
            <div className="mb-3 md:mb-4">
              <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50 px-2 md:px-3 py-1 rounded-md group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">{post.tag}</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 group-hover:text-blue-600 transition-colors leading-tight">{post.titulo}</h3>
            <p className="hidden md:block text-gray-500 text-sm leading-relaxed mb-8 font-medium italic">"{post.preview}"</p>
            
            <Link 
              href={`/blog/contribuicoes/${post.slug}`}
              className="mt-4 md:mt-auto flex items-center text-gray-900 text-[10px] md:text-[11px] font-black uppercase tracking-widest gap-2 group-hover:gap-4 transition-all cursor-pointer"
            >
              Ler artigo completo <ArrowRight size={16} className="text-blue-600" />
            </Link>
          </div>
        ))}
      </div>

      {/* NOVA LINHA DIVISÓRIA E CONTEXTO */}
      <div className="mb-10">
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
          Sua expertise <div className="h-px bg-gray-300 flex-1"></div>
        </h3>
        <p className="text-gray-500 text-base md:text-lg font-medium leading-relaxed w-full">
          Acreditamos que o conhecimento deve ser compartilhado. Caso você possua uma visão estratégica sobre o mercado financeiro digital, este espaço também é seu para contribuir e fortalecer nossa comunidade.
        </p>
      </div>

      {/* FOOTER CTA ESTILIZADO */}
      <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-center border-2 border-blue-600/20 shadow-[0_20px_50px_rgba(37,99,235,0.1)] relative overflow-hidden mb-12 group hover:border-blue-600 transition-all duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
        <PenTool size={140} className="absolute -top-10 -left-10 text-blue-600 opacity-[0.07] -rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-700" />
        
        <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 relative z-10 group-hover:text-blue-600 transition-colors">Sua expertise na Nucleobase.</h3>
        <p className="text-gray-500 mb-8 max-w-2xl mx-auto font-medium text-base md:text-lg relative z-10">
          Compartilhe conhecimento e posicione-se como uma autoridade no mercado digital.
        </p>
        <a href="/blog/contribuir" className="relative z-10 inline-block px-10 py-4 bg-blue-600 text-white rounded-full font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-blue-200">
          Criar artigo agora
        </a>
      </div>

      {/* BANNER INSTAGRAM */}
      <div className="mt-20 pt-12 border-t border-gray-100 flex flex-col items-center text-center">
        <div className="max-w-3xl">
          <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
            Fique por dentro <br className="md:hidden"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
          </h4>
          <p className="text-gray-500 font-medium text-sm md:text-base mb-8">
            Insights, novidades e bastidores da Nucleobase diretamente no seu feed.
          </p>
        </div>
        
        <a 
          href="https://www.instagram.com/nucleobase.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-4 md:gap-6 p-2 pr-6 md:pr-10 bg-white border border-gray-100 rounded-full hover:shadow-2xl hover:border-pink-100 transition-all duration-500 group"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-full flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
            <Instagram size={24} className="md:hidden" />
            <Instagram size={32} className="hidden md:block" />
          </div>
          <div className="text-left">
            <span className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-pink-500 transition-colors">Social Feed</span>
            <span className="block text-lg md:text-xl font-bold text-gray-900">@nucleobase.app</span>
          </div>
        </a>
      </div>

    </div>
  );
}