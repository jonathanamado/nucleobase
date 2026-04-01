"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MessageCircle, ShieldCheck } from "lucide-react";
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

  return (
    <html lang="pt-BR" className="light" style={{ colorScheme: 'light' }}>
      <head>
        <meta name="color-scheme" content="only light" />
        
        {/* 1. Inicialização do Consent Mode e dataLayer (Obrigatório antes do GTM) */}
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
        
        {/* 2. Script principal do GTM usando URL oficial */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtm.js?id=GTM-NS5KWXFL"
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 min-h-screen flex flex-col overflow-x-hidden max-w-full`}>
        
        {/* NoScript corrigido para URL oficial */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-NS5KWXFL"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>

        <Header />

        <main className="flex-1 flex w-full max-w-full overflow-x-hidden bg-white">
          <Sidebar />
          
          <section className="flex-1 w-full max-w-full px-4 md:px-10 py-6 pb-20 md:pb-6 scroll-smooth md:ml-80 overflow-x-hidden flex flex-col bg-white">
            <div className="min-h-[calc(100vh-200px)] w-full bg-white">
              {children}
            </div>
            
            <footer className="mt-16 mb-10 w-full flex flex-col items-center">
              <div className="w-full max-w-2xl bg-gray-50 border border-gray-100 rounded-3xl md:rounded-full p-5 flex flex-col md:flex-row items-center justify-center gap-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600/5 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-black text-[10px]">N</span>
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center md:text-left">
                    © {new Date().getFullYear()} Nucleobase 
                    <br className="block md:hidden" /> 
                    <span className="hidden md:inline mx-2 text-gray-200">|</span> 
                    <span className="mt-1 md:mt-0 block md:inline">Todos os direitos reservados</span>
                  </p>
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