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
  if (hostname === DASHBOARD_DOMAIN) {
    
    // 1. Se acessar a raiz (/), manda para /lancamentos silenciosamente
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/lancamentos', request.url));
    }

    // 2. PROTEÇÃO: Se estiver no dashboard e tentar acessar QUALQUER coisa que NÃO SEJA /lancamentos
    // (ex: /minha-conta, /cadastro), manda ele de volta para o domínio principal
    if (!pathname.startsWith('/lancamentos') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL(`https://${MAIN_DOMAIN}${pathname}`, request.url));
    }
  }

  // --- LOGICA PARA O DOMÍNIO PRINCIPAL ---
  if (hostname === MAIN_DOMAIN) {
    // 3. Se tentar acessar /lancamentos no domínio principal, redireciona para o subdomínio correto
    if (pathname.startsWith('/lancamentos')) {
      return NextResponse.redirect(new URL(`https://${DASHBOARD_DOMAIN}`, request.url));
    }
  }

  return NextResponse.next();
}

// Opcional: Filtra quais caminhos o middleware deve rodar para economizar performance
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};