"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ArrowRight, Instagram } from "lucide-react";
import { Suspense } from "react";

const siteMap = [
  { term: "cadastro", title: "Criar Nova Conta", desc: "Comece a gerenciar suas finanças agora.", href: "/cadastro", category: "Acesso" },
  { term: "login", title: "Acessar Plataforma", desc: "Entre na sua conta Nucleobase.", href: "/acesso-usuario", category: "Acesso" },
  { term: "planos", title: "Planos e Assinaturas", desc: "Conheça os planos Essential e Pro.", href: "/planos", category: "Serviços" },
  { term: "segurança", title: "Central de Segurança", desc: "Saiba como protegemos seus dados.", href: "/seguranca_privacidade", category: "Privacidade" },
  { term: "contato", title: "Fale Conosco", desc: "Suporte via WhatsApp e E-mail.", href: "https://wa.link/qbxg9f", category: "Suporte" },
  { term: "lançamentos", title: "Novidades e Lançamentos", desc: "Acompanhe as atualizações da plataforma.", href: "/lancamentos", category: "APP" },
];

function BuscaContent() {
  const searchParams = useSearchParams();
  
  const rawQuery = searchParams.get("q") || "";
  const query = rawQuery.trim().toLowerCase();

  const normalizeText = (text: string) => 
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const normalizedQuery = normalizeText(query);

  const results = siteMap.filter((item) => {
    if (!query) return false;
    const termMatch = normalizeText(item.term).includes(normalizedQuery);
    const titleMatch = normalizeText(item.title).includes(normalizedQuery);
    const categoryMatch = normalizeText(item.category).includes(normalizedQuery);
    return termMatch || titleMatch || categoryMatch;
  });

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* Header da Busca - Alinhado ao Padrão "Sobre" */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Resultados<span className="text-blue-600">.</span></span>
            <Search size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-0">
            Você buscou por: <span className="text-blue-600 font-bold">"{rawQuery.trim()}"</span>
          </h2>
        </div>
      </div>

      {/* Linha Divisória que ocupa toda a largura */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4 w-full">
        Sugestões Encontradas <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid gap-4">
        {results.length > 0 ? (
          results.map((result, index) => (
            <Link 
              key={index} 
              href={result.href}
              className="group bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500 relative overflow-hidden flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <div className="inline-block text-[9px] font-black px-3 py-1 rounded-full bg-gray-50 text-gray-400 uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-colors mb-2">
                  {result.category}
                </div>
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {result.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[90%] md:max-w-[80%]">
                    {result.desc}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-2xl text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-500 group-hover:translate-x-1 shrink-0">
                  <ArrowRight size={20} strokeWidth={3} />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-24 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
            <div className="bg-white w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Search size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-bold text-sm px-6">
              Não encontramos resultados exatos para sua busca. <br />
              Tente termos mais genéricos como "planos" ou "conta".
            </p>
          </div>
        )}
      </div>

      {/* Footer da busca */}
      <div className="mt-12 md:mt-20 bg-gray-900 rounded-3xl md:rounded-[4rem] p-8 md:p-20 text-center relative overflow-hidden group w-full shadow-lg mb-20">
          <div className="relative z-10">
            <h4 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4 tracking-tight">Ainda com dúvidas?</h4>
            <p className="text-sm text-gray-400 mb-8 font-medium">Nossa equipe de suporte está pronta para te ajudar com qualquer integração.</p>
            <Link href="https://wa.link/qbxg9f" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] md:text-[12px] uppercase tracking-widest transition-all">
              Chamar no WhatsApp
            </Link>
          </div>
          <Search size={200} className="absolute -right-10 -bottom-10 text-white/5 -rotate-12" />
      </div>

      {/* LINHA DIVISÓRIA "CONECTE-SE" */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM */}
      <div className="flex flex-col items-center text-center">
        <div className="max-w-3xl mb-12">
          <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
            Fique por dentro <br className="md:hidden"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
          </h4>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            Insights, novidades e bastidores da Nucleobase diretamente no seu feed.
          </p>
        </div>
        
        <a 
          href="https://www.instagram.com/nucleobase.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
            
            <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[2.2rem] md:rounded-[2.5rem] flex items-center justify-center text-white shadow-xl relative z-10 group-hover:rotate-6 transition-all duration-500">
              <Instagram className="w-12 h-12 md:w-14 md:h-14" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-pink-500 transition-colors">@nucleobase.app</span>
            <div className="h-1 w-0 bg-pink-500 mt-2 group-hover:w-full transition-all duration-500 rounded-full"></div>
          </div>
        </a>
      </div>
    </div>
  );
}

export default function BuscaPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    }>
      <BuscaContent />
    </Suspense>
  );
}