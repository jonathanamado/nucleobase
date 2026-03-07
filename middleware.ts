import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Nome do cookie que seu componente CookieNotice deve usar
  const COOKIE_CONSENT_NAME = 'nucleobase-consent'; 
  const hasConsent = request.cookies.has(COOKIE_CONSENT_NAME);

  const MAIN_DOMAIN = 'nucleobase.app';
  const DASHBOARD_DOMAIN = 'dashboard.nucleobase.app';

  // --- 1. LÓGICA PARA O GOOGLE TAG GATEWAY (SERVER-SIDE) ---
  if (pathname.startsWith('/metrics')) {
    // Se NÃO tem consentimento, bloqueamos a ida para o servidor do Google aqui mesmo
    if (!hasConsent) {
      return new NextResponse(null, { status: 204 }); // Retorna "No Content" para não dar erro no console
    }

    // Proxy para o Google Analytics (Modo First Party)
    // Importante: Verifique se este ID está correto no seu painel de Fluxo de Dados do GA4
    const googleTarget = new URL(
      pathname + url.search,
      'https://www.google-analytics.com' // Alvo padrão para proxying se o fps.goog falhar
    );

    const response = NextResponse.rewrite(googleTarget);
    
    // Repassa headers essenciais para evitar bloqueio de CORS
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }

  const isNextDataRequest = url.searchParams.has('_rsc');

  // --- 2. LÓGICA PARA O SUBDOMÍNIO DASHBOARD ---
  if (hostname.includes(DASHBOARD_DOMAIN)) {
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/lancamentos', request.url));
    }

    const institutionalPages = ['/sobre', '/contato', '/precos'];
    if (institutionalPages.includes(pathname)) {
      if (isNextDataRequest) return new NextResponse(null, { status: 404 });
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};