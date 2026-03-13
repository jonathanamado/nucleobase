import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Impede que o Next.js adicione uma barra ao final da URL (ex: /blog/ vira /blog)
  trailingSlash: false, 
  
  // Evita problemas de redirecionamento em proxies/load balancers
  skipTrailingSlashRedirect: true,

  // --- CONFIGURAÇÃO DE IMAGENS ---
  images: {
    // Permite que o Next.js renderize SVGs se necessário (alguns provedores de auth usam)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**', // O padrão '/**' é mais abrangente para subpastas
      },
      {
        protocol: 'https',
        hostname: 'lh3.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Melhora a estabilidade do HMR (Hot Module Replacement) em desenvolvimento
  reactStrictMode: true,
};

export default nextConfig;