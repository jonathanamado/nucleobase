"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MessageCircle, LayoutDashboard, Undo2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import Script from "next/script";

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
  const isHome = pathname === "/";

  return (
    <html lang="pt-BR">
      <head>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NS5KWXFL');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen flex flex-col overflow-x-hidden max-w-full`}>
        
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-NS5KWXFL"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>

        <Header />

        <main className="flex-1 flex w-full max-w-full overflow-x-hidden">
          
          <Sidebar />
          
          <section className="flex-1 w-full max-w-full px-4 md:px-10 py-6 scroll-smooth md:ml-80 overflow-x-hidden flex flex-col">
            <div className="min-h-[calc(100vh-200px)] w-full">
              {children}
            </div>
            
            {!isHome && (
              <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 pt-10 border-t border-gray-100">
                <a 
                  href="/" 
                  className="text-gray-400 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 group no-underline"
                >
                  <div className="bg-white p-2.5 rounded-full shadow-sm group-hover:bg-blue-50 transition-colors border border-gray-100 group-hover:border-blue-100">
                    <LayoutDashboard size={14} strokeWidth={1.5} className="opacity-60" />
                  </div>
                  Página Inicial
                </a>

                <div className="hidden md:block h-4 w-px bg-gray-200"></div>

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

            {/* RODAPÉ AJUSTADO PARA CENTRALIZAÇÃO MOBILE */}
            <footer className="mt-12 mb-10 flex justify-center w-full">
              <div className="inline-flex px-6 py-3 bg-white/50 rounded-2xl md:rounded-full border border-gray-100 shadow-sm">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:whitespace-nowrap text-center">
                  <span>© {new Date().getFullYear()} Nucleobase</span>
                  <span className="hidden md:inline h-1 w-1 bg-blue-600/40 rounded-full shrink-0"></span> 
                  <span>Todos os direitos reservados</span>
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