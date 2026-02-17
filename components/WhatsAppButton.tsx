"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const whatsappLink = "https://wa.link/qbxg9f";

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition-all duration-300 group flex items-center gap-2"
      aria-label="Chamar no WhatsApp"
    >
      {/* Texto que aparece no hover */}
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-medium">
        Dúvidas? Fale conosco
      </span>
      <MessageCircle size={28} fill="currentColor" className="text-white" />
      
      {/* Notificaçãozinha pulsante para chamar atenção */}
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-600"></span>
      </span>
    </a>
  );
}
