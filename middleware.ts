import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  const MAIN_DOMAIN = 'nucleobase.app';
  const DASHBOARD_DOMAIN = 'dashboard.nucleobase.app';

  // Detecta se é uma requisição de dados do Next.js (Prefetch ou navegação SPA)
  const isNextDataRequest = url.searchParams.has('_rsc');

  // --- LÓGICA PARA O SUBDOMÍNIO DASHBOARD ---
  if (hostname.includes(DASHBOARD_DOMAIN)) {
    
    // 1. Rewrite silencioso da raiz para lançamentos
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/lancamentos', request.url));
    }

    // 2. CORREÇÃO DE CORS: Se for uma requisição de dados do Next.js para páginas 
    // que não existem no dashboard, não redirecione. Apenas ignore ou mande 404.
    // Isso evita que o navegador tente seguir um redirect cross-origin proibido.
    const institutionalPages = ['/sobre', '/contato', '/precos'];
    
    if (institutionalPages.includes(pathname)) {
      if (isNextDataRequest) {
        // Retorna um 404 limpo para o prefetch não quebrar o log
        return new NextResponse(null, { status: 404 });
      }
      // Redirecionamento completo só se o usuário DIGITAR na barra de endereços
      return NextResponse.redirect(new URL(`https://${MAIN_DOMAIN}${pathname}`, request.url));
    }
  }

  // --- LÓGICA PARA O DOMÍNIO PRINCIPAL ---
  if (hostname === MAIN_DOMAIN) {
    if (pathname.startsWith('/lancamentos')) {
      return NextResponse.redirect(new URL(`https://${DASHBOARD_DOMAIN}/lancamentos`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Mantendo o matcher original, mas ele agora ignora os arquivos estáticos corretamente
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};