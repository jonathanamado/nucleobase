"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ArrowRight, Sparkles, Instagram } from "lucide-react";
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
  const query = searchParams.get("q")?.toLowerCase() || "";

  const results = siteMap.filter(
    (item) => 
      item.term.includes(query) || 
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
  );

  return (
    <div className="w-full max-w-3xl mx-auto pt-6 md:pt-12 pb-24 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header da Busca */}
      <div className="mb-10">
        <div className="flex items-end gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">
            Resultados<span className="text-orange-500">.</span>
          </h1>
          <Sparkles className="text-orange-500 mb-2 animate-pulse" size={24} />
        </div>
        <p className="text-gray-500 font-medium">
          Você buscou por: <span className="text-blue-600 font-bold">"{query}"</span>
        </p>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-300 mb-6 flex items-center gap-4 w-full">
        Sugestões Encontradas <div className="h-px bg-gray-100 flex-1"></div>
      </h3>

      <div className="grid gap-4">
        {results.length > 0 ? (
          results.map((result, index) => (
            <Link 
              key={index} 
              href={result.href}
              className="group bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500 relative overflow-hidden"
            >
              {/* Badge de Categoria */}
              <div className="absolute top-6 right-8 text-[9px] font-black px-2 py-1 rounded-full bg-gray-50 text-gray-400 uppercase tracking-tighter group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {result.category}
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {result.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[80%]">
                    {result.desc}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-2xl text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-500 group-hover:translate-x-1">
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
      <div className="mt-12 p-8 rounded-[2.5rem] bg-gray-900 text-white relative overflow-hidden shadow-lg mb-20">
          <div className="relative z-10">
            <h4 className="font-bold mb-2">Ainda com dúvidas?</h4>
            <p className="text-xs text-gray-400 mb-4 font-medium">Nossa equipe de suporte está pronta para te ajudar com qualquer integração.</p>
            <Link href="https://wa.link/qbxg9f" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
              Chamar no WhatsApp
            </Link>
          </div>
          <Search size={150} className="absolute -right-10 -bottom-10 text-white/5 -rotate-12" />
      </div>

      {/* LINHA DIVISÓRIA "CONECTE-SE" CENTRALIZADA PADRONIZADA */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM CENTRALIZADO COM GRADIENTE E BRILHO PADRONIZADO */}
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
            {/* Efeito de brilho/glow ao fundo do ícone */}
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