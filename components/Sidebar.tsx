"use client";

import Link from 'next/link';

export function Sidebar() {
  return (
    <aside 
      className="w-80 hidden md:flex flex-col sticky top-4 self-start flex-shrink-0 pl-10 pr-6"
      style={{
        // Aumentamos a folga para -6rem para garantir que nada encoste na borda física do monitor
        height: 'calc(100vh - 6rem)',
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        aside::-webkit-scrollbar { display: none; }
      `}} />

      <nav className="flex flex-col h-full w-full">
        
        {/* Container principal */}
        <div className="flex flex-col h-full pt-[1vh] 2xl:pt-[2vh]">
          
          {/* ÁREA DE LINKS - flex-grow faz este bloco ocupar o espaço disponível e "segurar" o de baixo */}
          <div className="flex-grow flex flex-col gap-[2vh] 2xl:gap-[4vh]">
            
            {/* CATEGORIA 1 */}
            <section className="space-y-[1vh] mb-6 lg:mb-3 2xl:mb-10">
              <p className="text-[clamp(12px,0.9vw,15px)] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                Conheça | Explore
              </p>
              <div className="flex flex-col gap-[0.8vh] pl-3 text-[clamp(14px,0.9vw,18px)] font-medium text-gray-700">
                <Link
                  href="/sobre"
                  className="relative block transition-all text-gray-700 hover:text-blue-600 hover:pl-1"
                >
                  Sobre a Plataforma
                </Link>
                <Link href="/blog" className="hover:text-blue-600 transition-all hover:pl-1 block">
                  Blog da Núcleo
                </Link>
                <Link href="/planos" className="hover:text-blue-600 transition-all hover:pl-1 block">
                  Assinatura digital
                </Link>
              </div>
            </section>

            {/* CATEGORIA 2 */}
            <section className="space-y-[1vh] mb-6 lg:mb-3 2xl:mb-10">
              <p className="text-[clamp(12px,0.9vw,15px)] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                Experiência
              </p>
              <div className="flex flex-col gap-[0.8vh] pl-3 text-[clamp(14px,0.9vw,18px)] font-medium text-gray-700">
                <Link href="/resultados" className="hover:text-blue-600 transition-all hover:pl-1 block">
                  Painel de Resultados
                </Link>
                <Link href="/depoimentos" className="hover:text-blue-600 transition-all hover:pl-1 block">
                  Depoimentos
                </Link>
                <Link href="/faq" className="hover:text-blue-600 transition-all hover:pl-1 block">
                  FAQ
                </Link>
              </div>
            </section>

            {/* CATEGORIA 3 */}
            <section className="space-y-[1vh] mb-6 lg:mb-3 2xl:mb-10">
              <p className="text-[clamp(12px,0.9vw,15px)] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                Comunicação
              </p>
              <div className="flex flex-col gap-[0.8vh] pl-3 text-[clamp(14px,0.9vw,18px)] font-medium text-gray-700">
                <Link href="/contato" className="hover:text-blue-600 transition-all hover:pl-1 block">
                  Fale conosco
                </Link>
                <Link href="/seguranca_privacidade" className="hover:text-blue-600 transition-all hover:pl-1 block">
                  Segurança
                </Link>
                <Link href="/suporte" className="hover:text-blue-600 transition-all hover:pl-1 block">
                  Suporte técnico
                </Link>
              </div>
            </section>
          </div>

          {/* SEÇÃO COMUNIDADE - Centralizada e com margem inferior de segurança */}
          <section className="pt-0 pb-6 border-t border-gray-100 flex flex-col gap-3 mb-2 items-center mt-4">
            <p className="text-[clamp(12px,0.9vw,15px)] font-black text-gray-400 uppercase tracking-[0.2em] mt-2 mb-0 w-full text-center">
              COMUNIDADE NÚCLEO
            </p>

            <Link 
              href="/parceria" 
              className="bg-orange-500 text-white px-4 py-2 rounded-2xl hover:bg-orange-600 transition-all font-bold text-[clamp(10px,0.7vw,11px)] shadow-lg shadow-orange-200/50 w-full text-center group uppercase tracking-widest"
            >
              Seja nosso parceiro <span className="inline-block group-hover:rotate-12 transition-transform">🤝</span>
            </Link>

            <Link 
              href="/indique" 
              className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition-all font-bold text-[clamp(10px,0.7vw,11px)] shadow-lg shadow-blue-200/50 w-full text-center group uppercase tracking-widest"
            >
              Indique o nosso APP! <span className="inline-block group-hover:scale-110 transition-transform">🚀</span>
            </Link>
          </section>
        </div>
      </nav>
    </aside>
  );
}