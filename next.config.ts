import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isso impede que o Next.js redirecione de /api/webhook para /api/webhook/ (ou vice-versa)
  trailingSlash: false, 
  
  // Opcional: Ajuda a evitar problemas de redirecionamento de protocolo em alguns proxies
  skipTrailingSlashRedirect: true,
};

export default nextConfig;