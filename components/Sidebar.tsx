"use client";

import Link from 'next/link';

export function Sidebar() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        aside::-webkit-scrollbar { display: none; }
      `}} />

      <aside
        className="w-80 hidden md:flex flex-col fixed left-0 top-20 flex-shrink-0 pl-10 pr-6 bg-white text-gray-900"
        style={{
          height: 'calc(100vh - 5rem)', // 5rem (80px) é a altura do header
          paddingTop: '1.4rem', // Reduzido drasticamente para puxar tudo para o topo
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          zIndex: 40, // Garante que fique acima do conteúdo mas abaixo de modais
        }}
      >
        <nav className="flex flex-col h-full w-full">
          <div className="flex flex-col h-full">

            {/* ÁREA DE LINKS - Mantém o gap expandido, mas agora começando do topo absoluto */}
            <div className="flex-grow flex flex-col gap-[4.5vh] 2xl:gap-[6vh]">

              {/* CATEGORIA 1 */}
              <section className="space-y-[0.5vh] text-center">
                <p className="text-[clamp(11px,0.8vw,13px)] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 text-center">
                  Conheça | Explore
                </p>
                <div className="flex flex-col gap-[0.6vh] pl-0 items-center text-[clamp(14px,0.85vw,16px)] font-medium text-gray-700 w-full">
                  <Link href="/sobre" className="transition-all hover:text-blue-600 hover:scale-[1.02] text-center w-full">Sobre a Plataforma</Link>
                  <Link href="/blog" className="transition-all hover:text-blue-600 hover:scale-[1.02] text-center w-full">Blog da Nucleo</Link>
                  <Link href="/planos" className="transition-all hover:text-blue-600 hover:scale-[1.02] text-center w-full">Assinatura Digital</Link>
                </div>
              </section>

              {/* CATEGORIA 2 */}
              <section className="space-y-[0.5vh] text-center">
                <p className="text-[clamp(11px,0.8vw,13px)] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 text-center">
                  Experiência
                </p>
                <div className="flex flex-col gap-[0.6vh] pl-0 items-center text-[clamp(14px,0.85vw,16px)] font-medium text-gray-700 w-full">
                  <Link href="/lancamentos" className="transition-all hover:text-blue-600 hover:scale-[1.02] text-center w-full">Controle financeiro</Link>
                  <Link href="/resultados" className="transition-all hover:text-blue-600 hover:scale-[1.02] text-center w-full">Painel de Resultados</Link>
                  <Link href="/condo" className="transition-all hover:text-blue-600 hover:scale-[1.02] text-center w-full">Administração Condo</Link>
                </div>
              </section>

              {/* CATEGORIA 3 */}
              <section className="space-y-[0.5vh] text-center">
                <p className="text-[clamp(11px,0.8vw,13px)] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 text-center">
                  Comunicação
                </p>
                <div className="flex flex-col gap-[0.6vh] pl-0 items-center text-[clamp(14px,0.85vw,16px)] font-medium text-gray-700 w-full">
                  <Link href="/contato" className="transition-all hover:text-blue-600 hover:scale-[1.02] text-center w-full">Fale conosco</Link>
                  <Link href="/seguranca_privacidade" className="transition-all hover:text-blue-600 hover:scale-[1.02] text-center w-full">Segurança</Link>
                  <Link href="/suporte" className="transition-all hover:text-blue-600 hover:scale-[1.02] text-center w-full">Suporte técnico</Link>
                </div>
              </section>
            </div>

            {/* SEÇÃO COMUNIDADE - Fixa na base, isolada com o maior respiro superior criado */}
            <section className="pt-3 pb-6 border-t border-gray-100 flex flex-col gap-1.5 items-center mt-auto bg-white w-full">
              <p className="text-[clamp(10px,0.75vw,11px)] font-black text-gray-400 uppercase tracking-[0.2em] w-full text-center mb-1">
                COMUNIDADE NUCLEO
              </p>

              <div className="flex flex-col gap-1.5 w-full items-center max-w-[85%]">
                <Link
                  href="/parceria"
                  className="bg-orange-500 text-white px-3 py-1.5 rounded-xl hover:bg-orange-600 transition-all font-bold text-[clamp(9px,0.65vw,10px)] shadow-sm shadow-orange-200/50 w-full group uppercase tracking-widest flex items-center justify-center gap-1"
                >
                  Seja parceiro <span className="inline-block group-hover:rotate-12 transition-transform">🤝</span>
                </Link>

                <Link
                  href="/indique"
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition-all font-bold text-[clamp(9px,0.65vw,10px)] shadow-sm shadow-blue-200/50 w-full group uppercase tracking-widest flex items-center justify-center gap-1"
                >
                  Indique o APP <span className="inline-block group-hover:scale-110 transition-transform">🚀</span>
                </Link>

                <Link
                  href="/depoimentos"
                  className="bg-teal-600 text-white px-3 py-1.5 rounded-xl hover:bg-teal-700 transition-all font-bold text-[clamp(9px,0.65vw,10px)] shadow-sm shadow-teal-200/40 w-full group uppercase tracking-widest flex items-center justify-center gap-1"
                >
                  Depoimentos <span className="inline-block group-hover:animate-pulse">💬</span>
                </Link>
              </div>
            </section>
          </div>
        </nav>
      </aside>
    </>
  );
}