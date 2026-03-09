"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MessageCircle, Undo2, ShieldCheck, AppWindow } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { MobileTabBar } from "@/components/MobileTabBar";
import CookieNotice from "@/components/CookieNotice"; 
import { usePathname } from "next/navigation";
import Script from "next/script";
import Link from "next/link";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

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
      className="fixed bottom-24 md:bottom-6 right-6 z-50 bg-green-500 text-white pl-4 pr-3 py-2.5 rounded-full shadow-lg hover:bg-green-600 hover:scale-105 transition-all duration-300 flex items-center gap-2 opacity-95 hover:opacity-100"
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
        <Script id="gtm-init" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied'
            });
          `}
        </Script>
        
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          src="/metrics/gtm.js?id=GTM-NS5KWXFL"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen flex flex-col overflow-x-hidden max-w-full`}>
        
        <noscript>
          <iframe 
            src="/metrics/ns.html?id=GTM-NS5KWXFL"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>

        <Header />

        <main className="flex-1 flex w-full max-w-full overflow-x-hidden">
          <Sidebar />
          
          <section className="flex-1 w-full max-w-full px-4 md:px-10 py-6 pb-20 md:pb-6 scroll-smooth md:ml-80 overflow-x-hidden flex flex-col">
            <div className="min-h-[calc(100vh-200px)] w-full">
              {children}
            </div>
            
            {/* Navegação Inferior - Estilo Header */}
            {!isHome && (
              <div className="mt-20 flex flex-row items-center justify-center gap-4 md:gap-8 pt-10 border-t border-gray-100">
                <Link 
                  href="/" 
                  className="flex items-center gap-2.5 text-gray-400 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest group"
                >
                  <div className="bg-white p-2 rounded-full group-hover:bg-blue-50 transition-colors border border-gray-100 group-hover:border-blue-100 shadow-sm">
                    <AppWindow size={16} strokeWidth={2} />
                  </div>
                  Início
                </Link>

                <div className="h-4 w-px bg-gray-200"></div>

                <button 
                  onClick={() => window.history.back()}
                  className="text-gray-400 hover:text-gray-900 transition-all font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 group"
                >
                  Página Anterior
                  <div className="bg-white p-2.5 rounded-full shadow-sm group-hover:bg-gray-100 transition-colors border border-gray-100 group-hover:border-gray-200">
                    <Undo2 size={14} strokeWidth={1.5} className="opacity-60" />
                  </div>
                </button>
              </div>
            )}

            {/* Rodapé Unificado e Minimalista */}
            <footer className="mt-16 mb-10 w-full flex flex-col items-center">
              <div className="w-full max-w-2xl bg-white/40 border border-gray-100 rounded-3xl md:rounded-full p-5 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600/5 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-black text-[10px]">N</span>
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    © {new Date().getFullYear()} Nucleobase <span className="mx-2 text-gray-200">|</span> Todos os direitos reservados
                  </p>
                </div>

                <div className="flex items-center">
                  <Link 
                    href="/politica-de-cookies" 
                    className="group flex items-center gap-2 px-4 py-2 hover:bg-blue-50 rounded-full transition-all border border-transparent hover:border-blue-100"
                  >
                    <ShieldCheck size={12} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-blue-600 transition-colors">
                      Privacidade & Cookies
                    </span>
                  </Link>
                </div>
              </div>
            </footer>
          </section>
        </main>
        
        <MobileTabBar />

        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          <CookieNotice />
          <WhatsAppFloating />
        </div>
      </body>
    </html>
  );
}