// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  const MAIN_DOMAIN = 'nucleobase.app';
  const DASHBOARD_DOMAIN = 'dashboard.nucleobase.app';

  // --- LOGICA PARA O SUBDOMÍNIO DASHBOARD ---
  if (hostname.includes(DASHBOARD_DOMAIN)) {
    
    // 1. Se acessar a raiz (/), manda para /lancamentos
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/lancamentos', request.url));
    }

    // 2. PROTEÇÃO FLEXÍVEL:
    // Permitir /lancamentos, /api, arquivos do Next (_next) e AUTH do Supabase
    const isAllowedPath = 
      pathname.startsWith('/lancamentos') || 
      pathname.startsWith('/api') || 
      pathname.startsWith('/_next') ||
      pathname.includes('auth'); // Importante para manter a sessão

    if (!isAllowedPath) {
      // Em vez de redirecionar tudo, apenas deixe passar se for um recurso do Next.js
      // ou redirecione apenas se for uma tentativa de acessar páginas institucionais explicitamente
      if (pathname === '/sobre' || pathname === '/contato') {
        return NextResponse.redirect(new URL(`https://${MAIN_DOMAIN}${pathname}`, request.url));
      }
    }
  }

  // --- LOGICA PARA O DOMÍNIO PRINCIPAL ---
  if (hostname === MAIN_DOMAIN) {
    if (pathname.startsWith('/lancamentos')) {
      return NextResponse.redirect(new URL(`https://${DASHBOARD_DOMAIN}/lancamentos`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Ajustado para não interceptar chamadas de API e Auth que precisam de headers limpos
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};