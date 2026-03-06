import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  const MAIN_DOMAIN = 'nucleobase.app';
  const DASHBOARD_DOMAIN = 'dashboard.nucleobase.app';

  // --- 1. LÓGICA PARA O GOOGLE TAG GATEWAY (SERVER-SIDE) ---
  // Esta regra deve vir primeiro para garantir o roteamento correto dos dados
  if (pathname.startsWith('/metrics')) {
    const googleTarget = new URL(
      pathname + url.search,
      'https://G-BNPVR4P74H.fps.goog'
    );

    return NextResponse.rewrite(googleTarget, {
      request: {
        // Repassa os cabeçalhos originais (incluindo cookies e geo-localização da Vercel)
        headers: new Headers(request.headers),
      },
    });
  }

  // Detecta se é uma requisição de dados do Next.js (Prefetch ou navegação SPA)
  const isNextDataRequest = url.searchParams.has('_rsc');

  // --- 2. LÓGICA PARA O SUBDOMÍNIO DASHBOARD ---
  if (hostname.includes(DASHBOARD_DOMAIN)) {
    
    // 1. Rewrite silencioso da raiz para lançamentos
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/lancamentos', request.url));
    }

    // 2. CORREÇÃO DE CORS
    const institutionalPages = ['/sobre', '/contato', '/precos'];
    
    if (institutionalPages.includes(pathname)) {
      if (isNextDataRequest) {
        return new NextResponse(null, { status: 404 });
      }
      return NextResponse.redirect(new URL(`https://${MAIN_DOMAIN}${pathname}`, request.url));
    }
  }

  // --- 3. LÓGICA PARA O DOMÍNIO PRINCIPAL ---
  if (hostname === MAIN_DOMAIN) {
    if (pathname.startsWith('/lancamentos')) {
      return NextResponse.redirect(new URL(`https://${DASHBOARD_DOMAIN}/lancamentos`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // O matcher permite que o middleware processe a rota /metrics
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};