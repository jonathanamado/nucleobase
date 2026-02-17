"use client";
import React, { useState } from "react";
import { 
  Newspaper, 
  ArrowRight, 
  Clock, 
  User, 
  PenTool, 
  Mail, 
  Plus, 
  X, 
  CheckCircle2, 
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 

export default function BlogDaNucleo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const posts = [
    { id: 1, tag: "Gestão", titulo: "A ciência por trás da separação de contas (PF e PJ).", preview: "Por que misturar seus gastos pessoais com os do lançamento é o erro número 1 que destrói o ROI.", autor: "Mauro Sérgio", cargo: "Estrategista", tempo: "5 min" },
    { id: 2, tag: "Estratégia", titulo: "Flux de caixa: Como prever o fôlego financeiro.", preview: "Entenda como a antecipação de recebíveis impacta sua saúde patrimonial no carrinho aberto.", autor: "Ana Rocha", cargo: "Gestora de Tráfego", tempo: "8 min" },
    { id: 3, tag: "Mentalidade", titulo: "O lucro consciente: O que fazer após o 6 em 7.", preview: "Bateu a meta? Saiba como reinvestir inteligentemente na estrutura da sua empresa.", autor: "Almeida Santos", cargo: "Infoprodutor", tempo: "6 min" },
    { id: 4, tag: "Tributário", titulo: "Holdings no Mercado Digital: Vale a pena?", preview: "A estrutura societária correta pode economizar milhares de reais em impostos no longo prazo.", autor: "Lu Andrade", cargo: "Advogada Tributarista", tempo: "10 min" },
    { id: 5, tag: "Escala", titulo: "KPIs que realmente importam para o seu Financeiro.", preview: "Pare de olhar apenas para o faturamento bruto e comece a analisar sua margem líquida real.", autor: "Felipe Sales", cargo: "CFO as a Service", tempo: "7 min" },
    { id: 6, tag: "Lançamento", titulo: "Custo por Lead vs. Lucratividade Final.", preview: "Como equilibrar o investimento em captação sem comprometer o caixa da operação.", autor: "Ju Mendes", cargo: "Copywriter & Estrategista", tempo: "5 min" }
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
      alert("Erro ao processar assinatura.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 relative">
      
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Newsletter</h3>
                <p className="text-gray-500 mb-8 font-medium">Insights financeiros e estratégicos toda semana.</p>
                
                <div className="space-y-4">
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <input required type="email" name="email" placeholder="Seu melhor e-mail" className="w-full bg-gray-50 border-transparent rounded-2xl py-4 px-6 text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                    
                    {/* BOTÃO ASSINAR */}
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

                  {/* BOTÃO ESCREVER ARTIGO - IDÊNTICO AO ASSINAR */}
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

      {/* HEADER DA PÁGINA - PADRONIZADO COM A PÁGINA SOBRE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-2">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center">
            <span>Blog Digital<span className="text-blue-600">.</span></span>
            <Newspaper size={45} className="text-blue-600 opacity-20 ml-4" strokeWidth={1.5} />
          </h1>
          
          <h2 className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed mt-2">
            Educação e estratégia em âmbito pessoal.
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
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

      {/* LINHA DIVISÓRIA MIGRADA */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Gestão do Conhecimento <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* GRID DE POSTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24">
        {posts.map((post) => (
          <div key={post.id} className="group bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl hover:shadow-blue-50/50 transition-all flex flex-col">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[12px] font-black text-gray-900 uppercase tracking-wider">{post.autor}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{post.cargo}</p>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-[10px] font-black text-blue-600/40 uppercase tracking-widest pt-1">
                <Clock size={12} /> {post.tempo}
              </div>
            </div>
            <div className="mb-4">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50/50 px-3 py-1 rounded-md">{post.tag}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-5 group-hover:text-blue-600 transition-colors leading-tight">{post.titulo}</h3>
            <p className="text-gray-500 text-base leading-relaxed mb-10 font-medium italic">"{post.preview}"</p>
            <div className="mt-auto flex items-center text-gray-900 text-[11px] font-black uppercase tracking-widest gap-2 group-hover:gap-4 transition-all cursor-pointer">
              Ler artigo completo <ArrowRight size={16} className="text-blue-600" />
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER CTA */}
      <div className="bg-gray-50 rounded-[3rem] p-12 text-center border border-gray-100 relative overflow-hidden">
        <PenTool size={100} className="absolute -top-5 -left-5 text-blue-100 opacity-50 -rotate-12" />
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Sua expertise na Nucleobase.</h3>
        <p className="text-gray-500 mb-8 max-w-xl mx-auto font-medium">
          Escreva e posicione-se como uma autoridade no mercado digital.
        </p>
        <a href="/blog/contribuir" className="inline-block px-10 py-4 bg-gray-900 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200">
          Criar artigo agora
        </a>
      </div>

    </div>
  );
}