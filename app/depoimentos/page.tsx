"use client";
import React, { useEffect, useState } from "react";
import { Star, Quote, Loader2, User, Plus, MessageSquarePlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DepoimentosPage() {
  // AJUSTE: Tipagem definida como <any[]> para aceitar a estrutura vinda do Supabase
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
              profissao
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
    <div className="w-full max-w-6xl mx-auto px-4 py-0">
      <h1 className="text-5xl font-bold text-gray-900 mb-2 mt-2 tracking-tight">
        Sua Experiência<span className="text-blue-600">.</span> 💬
      </h1>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <h2 className="text-gray-500 text-lg font-bold max-w-2xl leading-tight">
          O sentimento real de quem já transformou sua gestão financeira.
        </h2>
        
        <a 
          href="/publicacao_depoimentos" 
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white border border-gray-200 text-gray-900 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-[0.15em] shadow-sm"
        >
          <Plus size={14} /> Criar depoimento
        </a>
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-24">
        {todosDepoimentos.map((item, index) => {
          // Lógica de compatibilidade entre dados fixos e dados do Supabase
          const perfil = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
          const nomeExibicao = perfil?.nome_completo || item.nome || "Membro Nucleobase";
          const cargoExibicao = perfil?.profissao || item.cargo || "Usuário";

          return (
            <div 
              key={item.id}
              className={`bg-white border border-gray-100 shadow-xl shadow-blue-50/50 rounded-[2.5rem] p-10 relative overflow-hidden transition-all hover:-translate-y-1 ${
                index % 2 !== 0 ? "md:mt-32" : ""
              }`}
            >
              <Quote size={60} className="absolute -top-2 -right-2 text-blue-50 opacity-40" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    {item.foto ? (
                      <img 
                        src={item.foto} 
                        alt={nomeExibicao} 
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-50 shadow-sm" 
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                        <User size={24} />
                      </div>
                    )}
                    <div>
                      <p className="font-black text-gray-900 text-sm uppercase tracking-wider">
                        {nomeExibicao}
                      </p>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                        {cargoExibicao}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-0.5 pt-2">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} size={14} className="fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <p className="text-gray-700 text-xl leading-relaxed font-medium italic">
                    "{item.content}"
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-24 p-1 rounded-[3rem] bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex w-16 h-16 bg-blue-600 text-white rounded-3xl items-center justify-center shadow-lg shadow-blue-200 rotate-3">
              <MessageSquarePlus size={30} />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Sua voz é importante para nós melhorarmos a Plataforma.</h3>
              <p className="text-gray-500 font-medium italic mt-1">Como a Nucleobase mudou sua rotina hoje?</p>
            </div>
          </div>

          <a 
            href="/publicacao_depoimentos" 
            className="group relative inline-flex items-center justify-center gap-3 px-12 py-5 bg-gray-900 text-white rounded-full hover:bg-black transition-all font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-gray-400 overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Plus size={18} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" /> 
            <span className="relative z-10">Deixar meu depoimento</span>
          </a>
        </div>
      </div>
    </div>
  );
}