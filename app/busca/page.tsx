"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ArrowRight, Instagram, SearchSlash, Sparkles, HelpCircle } from "lucide-react";
import { Suspense, useState, useEffect } from "react";

// Mapeamento abrangente baseado na estrutura do seu projeto
const siteMap = [
  // Core & Acesso
  { term: "cadastro registro criar conta", title: "Criar Nova Conta", desc: "Comece a gerenciar suas finanças agora.", href: "/cadastro", category: "Acesso" },
  { term: "login entrar acessar", title: "Acessar Plataforma", desc: "Entre na sua conta Nucleobase.", href: "/acesso-usuario", category: "Acesso" },
  { term: "senha esqueci recuperar reset", title: "Recuperar Senha", desc: "Redefina seu acesso com segurança.", href: "/reset-password", category: "Acesso" },
  
  // Operacional e Dashboard
  { term: "lançamentos financeiro entradas saídas", title: "Gestão de Lançamentos", desc: "Controle seu fluxo financeiro diário.", href: "/lancamentos", category: "Operacional" },
  { term: "importar csv excel planilha", title: "Importar Dados", desc: "Suba suas planilhas de bancos ou plataformas.", href: "/lancamentos/importar", category: "Operacional" },
  { term: "integrar api webhook hotmart kiwify", title: "Integrações", desc: "Conecte a Nucleobase com suas ferramentas.", href: "/lancamentos/integrar", category: "Operacional" },
  { term: "resultados dashboard bi gráficos lucro", title: "Painel de Resultados", desc: "Visualize a saúde do seu negócio em tempo real.", href: "/resultados", category: "Estratégico" },
  
  // Assinatura e Planos
  { term: "planos preços assinatura valores", title: "Nossos Planos", desc: "Escolha o plano ideal para sua escala.", href: "/planos", category: "Comercial" },
  { term: "essencial básico", title: "Plano Essencial", desc: "O ponto de partida para sua organização.", href: "/planos/essencial", category: "Comercial" },
  { term: "pro profissional escala expert", title: "Plano PRO", desc: "Recursos avançados para grandes operações.", href: "/planos/pro", category: "Comercial" },
  { term: "checkout pagar assinar", title: "Finalizar Assinatura", desc: "Conclua sua contratação de forma segura.", href: "/assinatura/checkout", category: "Comercial" },

  // Conteúdo e Blog
  { term: "blog artigos notícias ciência", title: "Blog Nucleobase", desc: "Conteúdo especializado em finanças e lucro.", href: "/blog", category: "Conteúdo" },
  { term: "kpis indicadores métricas", title: "KPIs que Importam", desc: "Artigo: Indicadores essenciais para seu financeiro.", href: "/blog/contribuicoes/kpis-que-realmente-importam-para-o-seu-financeiro", category: "Conteúdo" },
  { term: "caixa fôlego financeiro previsão", title: "Fluxo de Caixa", desc: "Artigo: Como prever o fôlego financeiro.", href: "/blog/contribuicoes/fluxo-de-caixa-como-prever-o-folego-financeiro", category: "Conteúdo" },
  
  // Institucional e Suporte
  { term: "sobre empresa história", title: "Sobre a Nucleobase", desc: "Nossa missão e visão sobre o mercado digital.", href: "/sobre", category: "Institucional" },
  { term: "faq dúvidas perguntas frequentes", title: "Central de Ajuda (FAQ)", desc: "Respostas rápidas para as principais dúvidas.", href: "/faq", category: "Suporte" },
  { term: "contato suporte whatsapp ajuda", title: "Fale Conosco", desc: "Suporte via WhatsApp e E-mail.", href: "/suporte", category: "Suporte" },
  { term: "segurança privacidade dados termos", title: "Segurança e Privacidade", desc: "Como protegemos seus dados e sua operação.", href: "/seguranca_privacidade", category: "Legal" },
];

function BuscaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const rawQuery = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(rawQuery);

  useEffect(() => {
    setInputValue(rawQuery);
  }, [rawQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/busca?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  const normalizeText = (text: string) => 
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const query = normalizeText(rawQuery);

  const results = siteMap.filter((item) => {
    if (!query) return false;
    return normalizeText(item.term).includes(query) || 
           normalizeText(item.title).includes(query) || 
           normalizeText(item.category).includes(query);
  });

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER DA BUSCA - PADRÃO NUCLEO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Resultados<span className="text-blue-600">.</span></span>
            <Search size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-0">
            {results.length > 0 
              ? `Encontramos ${results.length} sugestões para: ` 
              : "Não encontramos resultados para: "}
            <span className="text-blue-600 font-bold">"{rawQuery}"</span>
          </h2>
        </div>
      </div>

      {/* LINHA DIVISÓRIA PADRÃO */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4 w-full">
        {results.length > 0 ? "Sugestões Encontradas" : "Tente uma nova busca"} 
        <div className="h-px bg-gray-300 flex-1"></div>
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
          /* ESTADO DE ERRO COM PESQUISA INTERNA */
          <div className="flex flex-col items-center">
            <div className="w-full text-center py-16 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200 mb-8">
              <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <SearchSlash size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-bold text-lg px-6 mb-2">
                Poxa, não encontramos o que você buscava.
              </p>
              <p className="text-gray-400 text-sm mb-8">
                Tente palavras mais simples como "planos", "blog" ou "ajuda".
              </p>

              <form onSubmit={handleSearch} className="max-w-md mx-auto px-4 relative">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Pesquisar novamente..."
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-6 pr-14 focus:border-blue-500 outline-none transition-all shadow-sm font-medium text-gray-700"
                />
                <button type="submit" className="absolute right-7 top-1/2 -translate-y-1/2 text-blue-600 hover:scale-110 transition-transform">
                  <Search size={24} strokeWidth={2.5} />
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
               <QuickLink icon={<Sparkles size={18}/>} title="Ver Planos" href="/planos" />
               <QuickLink icon={<HelpCircle size={18}/>} title="Central de Ajuda" href="/faq" />
               <QuickLink icon={<Instagram size={18}/>} title="Instagram" href="https://www.instagram.com/nucleobase.app/" external />
            </div>
          </div>
        )}
      </div>

      {/* FOOTER DA BUSCA - CTA PADRÃO */}
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

      {/* LINHA DIVISÓRIA "CONECTE-SE" CENTRALIZADA */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM CENTRALIZADO - PADRÃO "SOBRE" */}
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

function QuickLink({ icon, title, href, external = false }: { icon: any, title: string, href: string, external?: boolean }) {
  const content = (
    <div className="flex items-center justify-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
      <span className="text-blue-600">{icon}</span>
      <span className="text-sm font-bold text-gray-700">{title}</span>
    </div>
  );
  return external ? <a href={href} target="_blank">{content}</a> : <Link href={href}>{content}</Link>;
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