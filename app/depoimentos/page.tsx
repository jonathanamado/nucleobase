"use client";
import React, { useEffect, useState } from "react";
import { Star, Quote, Loader2, User, Plus, MessageSquarePlus, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DepoimentosPage() {
  const [depoimentosReais, setDepoimentosReais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const depoimentosFixos = [
    {
      id: "fixo-1",
      rating: 5,
      content: "A nucleobase.app mudou completamente a forma como encaro meus lançamentos. Antes, a confusão patrimonial era constante; hoje, tenho clareza total sobre cada centavo. É, de fato, uma gestão inteligente.",
      nome: "Usuário Anônimo",
      cargo: "Investidor e Gestor",
      foto: "/depoimentos/usuario-beta.png"
    },
    {
      id: "fixo-2",
      rating: 5,
      content: "Finalmente encontrei uma plataforma que simplifica o que era complexo. A visualização clara dos meus rendimentos me trouxe uma paz de espírito que eu não tinha com planilhas manuais. Prático e essencial.",
      nome: "A. Silva",
      cargo: "Empreendedor Digital",
      foto: "/depoimentos/a-silva.png"
    }
  ];

  useEffect(() => {
    async function fetchDepoimentos() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("depoimentos")
          .select(`
            id,
            rating,
            content,
            status,
            user_id,
            profiles (
              nome_completo,
              profissao,
              avatar_url
            )
          `)
          .eq("status", "aprovado")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erro Supabase:", error.message);
        } else {
          setDepoimentosReais(data || []);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDepoimentos();
  }, []);

  const todosDepoimentos = [...depoimentosFixos, ...depoimentosReais];

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER - PADRÃO NUCLEOBASE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center">
            <span>Sua Experiência<span className="text-blue-600">.</span></span>
            <MessageCircle size={60} className="text-blue-600 opacity-35 ml-4 -rotate-12" strokeWidth={1.2} />
          </h1>
          
          <h2 className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed mt-0">
            O sentimento real de quem já transformou sua gestão financeira.
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <a 
            href="/publicacao_depoimentos" 
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white border border-gray-200 text-gray-900 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-[0.15em] shadow-sm"
          >
            <Plus size={14} /> Criar depoimento
          </a>
        </div>
      </div>

      {/* LINHA DIVISÓRIA DE SEÇÃO */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Vozes da Comunidade <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {loading && (
        <div className="flex flex-col items-center justify-center my-20 gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Sincronizando experiências...</p>
        </div>
      )}

      {/* GRID ASSIMÉTRICO DE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 items-start mb-32">
        {todosDepoimentos.map((item, index) => {
          const perfil = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
          const nomeExibicao = perfil?.nome_completo || item.nome || "Membro Nucleobase";
          const cargoExibicao = perfil?.profissao || item.cargo || "Usuário";
          const fotoExibicao = item.foto || perfil?.avatar_url;

          return (
            <div 
              key={item.id}
              className={`group bg-white border border-gray-100 shadow-2xl shadow-blue-900/5 rounded-[3rem] p-10 relative overflow-hidden transition-all hover:scale-[1.01] ${
                index % 2 !== 0 ? "md:mt-32" : ""
              }`}
            >
              <Quote size={80} className="absolute -top-4 -right-4 text-blue-600 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity" />
              
              <div className="relative z-10">
                {/* TOP CARD: Foto à esquerda, Estrelas à direita */}
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    {fotoExibicao ? (
                      <img 
                        src={fotoExibicao} 
                        alt={nomeExibicao} 
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-50 shadow-md" 
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        <User size={28} />
                      </div>
                    )}
                    <div>
                      <p className="font-black text-gray-900 text-sm uppercase tracking-[0.1em]">
                        {nomeExibicao}
                      </p>
                      <p className="text-[11px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">
                        {cargoExibicao}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-0.5 self-start pt-2">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} size={14} className="fill-blue-600 text-blue-600" />
                    ))}
                  </div>
                </div>

                {/* CONTEÚDO DO DEPOIMENTO */}
                <div className="relative min-h-[100px] flex items-center">
                  <p className="text-gray-700 text-2xl leading-relaxed font-medium italic tracking-tight">
                    "{item.content}"
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BANNER CTA FINAL - ESTILO NUCLEOBASE */}
      <div className="bg-gray-900 rounded-[3.5rem] p-12 md:p-16 relative overflow-hidden group shadow-2xl shadow-gray-400">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full mb-6">
              <MessageSquarePlus size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Feedback Loop</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              Sua voz é importante para nós melhorarmos a Plataforma.
            </h3>
            <p className="text-gray-400 font-medium text-lg mt-4 italic">
              Como a Nucleobase mudou sua rotina hoje?
            </p>
          </div>

          <a 
            href="/publicacao_depoimentos" 
            className="group relative inline-flex items-center justify-center gap-4 px-12 py-6 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-all font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/40 overflow-hidden"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300 relative z-10" /> 
            <span className="relative z-10">Deixar meu depoimento</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </a>
        </div>
        
        {/* EFEITO DE FUNDO */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-600/20 transition-all duration-700"></div>
      </div>
    </div>
  );
}