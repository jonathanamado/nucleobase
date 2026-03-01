"use client";

import Link from 'next/link';

export function Sidebar() {
  return (
    // Mudamos para 'fixed' para que ela ignore a rolagem do corpo da página
    // 'h-screen' garante que ela ocupe toda a altura do monitor
    <aside 
      className="w-80 hidden md:flex flex-col fixed left-0 top-20 flex-shrink-0 pl-10 pr-6 bg-white"
      style={{
        height: 'calc(100vh - 5rem)', // 5rem (80px) é a altura do seu header
        overflowY: 'auto', // Caso o monitor seja muito pequeno, a sidebar ganha scroll interno próprio
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        aside::-webkit-scrollbar { display: none; }
      `}} />

      <nav className="flex flex-col h-full w-full">
        <div className="flex flex-col h-full pt-[2vh]">
          
          {/* ÁREA DE LINKS */}
          <div className="flex-grow flex flex-col gap-[2vh] 2xl:gap-[3vh]">
            
            {/* CATEGORIA 1 */}
            <section className="space-y-[1vh]">
              <p className="text-[clamp(11px,0.8vw,13px)] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                Conheça | Explore
              </p>
              <div className="flex flex-col gap-[0.8vh] pl-3 text-[clamp(14px,0.85vw,16px)] font-medium text-gray-700">
                <Link href="/sobre" className="transition-all hover:text-blue-600 hover:pl-1">Sobre a Plataforma</Link>
                <Link href="/blog" className="hover:text-blue-600 transition-all hover:pl-1">Blog da Núcleo</Link>
                <Link href="/planos" className="hover:text-blue-600 transition-all hover:pl-1">Assinatura Digital</Link>
              </div>
            </section>

            {/* CATEGORIA 2 */}
            <section className="space-y-[1vh]">
              <p className="text-[clamp(11px,0.8vw,13px)] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                Experiência
              </p>
              <div className="flex flex-col gap-[0.8vh] pl-3 text-[clamp(14px,0.85vw,16px)] font-medium text-gray-700">
                <Link href="/resultados" className="hover:text-blue-600 transition-all hover:pl-1">Painel de Resultados</Link>
                <Link href="/depoimentos" className="hover:text-blue-600 transition-all hover:pl-1">Depoimentos</Link>
                <Link href="/faq" className="hover:text-blue-600 transition-all hover:pl-1">FAQ</Link>
              </div>
            </section>

            {/* CATEGORIA 3 */}
            <section className="space-y-[1vh]">
              <p className="text-[clamp(11px,0.8vw,13px)] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                Comunicação
              </p>
              <div className="flex flex-col gap-[0.8vh] pl-3 text-[clamp(14px,0.85vw,16px)] font-medium text-gray-700">
                <Link href="/contato" className="hover:text-blue-600 transition-all hover:pl-1">Fale conosco</Link>
                <Link href="/seguranca_privacidade" className="hover:text-blue-600 transition-all hover:pl-1">Segurança</Link>
                <Link href="/suporte" className="hover:text-blue-600 transition-all hover:pl-1">Suporte técnico</Link>
              </div>
            </section>
          </div>

          {/* SEÇÃO COMUNIDADE - Fixa no rodapé da sidebar */}
          <section className="pt-4 pb-10 border-t border-gray-100 flex flex-col gap-3 items-center mt-auto">
            <p className="text-[clamp(11px,0.8vw,12px)] font-black text-gray-400 uppercase tracking-[0.2em] w-full text-center">
              COMUNIDADE NÚCLEO
            </p>

            <Link 
              href="/parceria" 
              className="bg-orange-500 text-white px-4 py-2.5 rounded-2xl hover:bg-orange-600 transition-all font-bold text-[clamp(10px,0.7vw,11px)] shadow-lg shadow-orange-200/50 w-full text-center group uppercase tracking-widest"
            >
              Seja nosso parceiro <span className="inline-block group-hover:rotate-12 transition-transform">🤝</span>
            </Link>

            <Link 
              href="/indique" 
              className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl hover:bg-blue-700 transition-all font-bold text-[clamp(10px,0.7vw,11px)] shadow-lg shadow-blue-200/50 w-full text-center group uppercase tracking-widest"
            >
              Indique o nosso APP! <span className="inline-block group-hover:scale-110 transition-transform">🚀</span>
            </Link>
          </section>
        </div>
      </nav>
    </aside>
  );
}