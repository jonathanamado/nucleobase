"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MessageCircle, LayoutDashboard, Undo2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function WhatsAppFloating() {
  return (
    <a
      href="https://wa.link/qbxg9f"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white pl-4 pr-3 py-2.5 rounded-full shadow-lg hover:bg-green-600 hover:scale-105 transition-all duration-300 flex items-center gap-2 opacity-95 hover:opacity-100"
      aria-label="WhatsApp"
    >
      <span className="text-[11px] font-semibold tracking-wide uppercase">
        Contato
      </span>
      <MessageCircle size={20} fill="currentColor" />
    </a>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Configurações de exibição por rota
  const paginasSemScroll = ["/acesso-usuario"];
  const isHome = pathname === "/";
  const deveTravarScroll = paginasSemScroll.includes(pathname);

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 h-screen overflow-hidden flex flex-col`}>
        
        <Header />

        <main className="flex-1 flex flex-col md:flex-row gap-8 px-8 py-6 max-w-7xl mx-auto w-full items-stretch overflow-hidden">
          <Sidebar />
          
          <section className={`flex-1 pr-2 ${deveTravarScroll ? 'overflow-hidden' : 'overflow-y-auto'} scroll-smooth`}>
            {/* CONTEÚDO DA PÁGINA */}
            <div className="min-h-[calc(100vh-200px)]">
              {children}
            </div>
            
            {/* NAVEGAÇÃO DE RETORNO (Só aparece se não for a Home) */}
            {!isHome && (
              <div className="mt-20 flex items-center justify-center gap-10 pt-10 border-t border-gray-100">
                <a 
                  href="/" 
                  className="text-gray-400 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 group no-underline"
                >
                  <div className="bg-white p-2.5 rounded-full shadow-sm group-hover:bg-blue-50 transition-colors border border-gray-100 group-hover:border-blue-100">
                    <LayoutDashboard size={14} strokeWidth={1.5} className="opacity-60" />
                  </div>
                  Página Inicial
                </a>

                <div className="h-4 w-px bg-gray-200"></div>

                <button 
                  onClick={() => window.history.back()}
                  className="text-gray-400 hover:text-gray-900 transition-all font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 group no-underline"
                >
                  Página Anterior
                  <div className="bg-white p-2.5 rounded-full shadow-sm group-hover:bg-gray-100 transition-colors border border-gray-100 group-hover:border-gray-200">
                    <Undo2 size={14} strokeWidth={1.5} className="opacity-60" />
                  </div>
                </button>
              </div>
            )}

            {/* RODAPÉ: DIREITOS RESERVADOS */}
            <footer className="mt-12 mb-10 text-center">
              <div className="inline-block px-8 py-3 bg-white/50 rounded-full border border-gray-100 shadow-sm">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                  © {new Date().getFullYear()} Nucleobase
                  <span className="h-1 w-1 bg-blue-600/40 rounded-full"></span> 
                  Todos os direitos reservados
                </p>
              </div>
            </footer>
          </section>
        </main>
        
        <WhatsAppFloating />
      </body>
    </html>
  );
}