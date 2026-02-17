"use client";

import Link from 'next/link';

export function Sidebar() {
  return (
    <aside 
      className="w-64 hidden md:flex flex-col sticky top-4 self-start flex-shrink-0 overflow-y-auto pr-2"
      style={{
        maxHeight: 'calc(100vh - 2rem)', 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        aside::-webkit-scrollbar { display: none; }
      `}} />

      {/* Ajustado: text-gray-700 e leading-relaxed para bater com o MainContent */}
      <nav className="flex flex-col gap-0 text-sm text-gray-700 w-full pb-8 leading-relaxed">
        
        {/* CATEGORIA 1 */}
        <p className="text-[14px] font-bold text-gray-400 uppercase tracking-wider mb-1">
          Conheça | Explore
        </p>
        <Link href="/sobre" className="hover:text-blue-600 transition block py-0.5">
          Sobre a Plataforma
        </Link>
        <Link href="/blog" className="hover:text-blue-600 transition block py-0.5">
          Blog da Núcleo
        </Link>

        {/* CATEGORIA 2 */}
        <p className="text-[14px] font-bold text-gray-400 uppercase tracking-wider mt-6 mb-1">
          Experiência
        </p>
        <Link href="/resultados" className="block hover:text-blue-600 py-0.5 transition">
          Painel de Resultados
        </Link>
        <Link href="/depoimentos" className="block hover:text-blue-600 py-0.5 transition">
          Depoimentos
        </Link>
        <Link href="/faq" className="block hover:text-blue-600 py-0.5 transition">
          FAQ
        </Link>

        {/* CATEGORIA 3 */}
        <p className="text-[14px] font-bold text-gray-400 uppercase tracking-wider mt-6 mb-1">
          Security | Comunicação
        </p>
        <Link href="/seguranca_privacidade" className="block hover:text-blue-600 py-0.5 transition">
          Segurança
        </Link>
        <Link href="/contato" className="block hover:text-blue-600 py-0.5 transition">
          Fale conosco
        </Link>
        <Link href="/suporte" className="block hover:text-blue-600 py-0.5 transition">
          Suporte técnico
        </Link>


        {/* SEÇÃO COMUNIDADE */}
        <div className="mt-6 flex flex-col gap-2 items-start">
          <p className="text-[14px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
            COMUNIDADE | PARCERIAS
          </p>

          <Link 
            href="/parceria" 
            className="bg-orange-500 text-white px-4 py-1.5 rounded-md hover:bg-orange-600 transition font-bold text-[12px] shadow-sm w-fit"
          >
            Seja nosso melhor parceiro 🤝
          </Link>

          <Link 
            href="/indique" 
            className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition font-bold text-[12px] shadow-sm w-fit"
          >
            Indique o nosso APP! 🚀🚀🚀
          </Link>

        </div>
      </nav>
    </aside>
  );
}