import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // 1. Criamos a resposta inicial
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Configuração do cliente Supabase SSR
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Atualiza os cookies na requisição e na resposta simultaneamente
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Essencial para renovar o token (refresh token) e persistir a sessão
  // Isso garante que o usuário não seja "deslogado" aleatoriamente na Home
  await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  const COOKIE_CONSENT_NAME = 'nucleobase-consent';
  const hasConsent = request.cookies.has(COOKIE_CONSENT_NAME);

  const MAIN_DOMAIN = 'nucleobase.app';
  const DASHBOARD_DOMAIN = 'dashboard.nucleobase.app';

  // --- 1. LÓGICA PARA O GOOGLE TAG GATEWAY ---
  if (pathname.startsWith('/metrics')) {
    if (!hasConsent) return new NextResponse(null, { status: 204 });

    const targetPath = pathname.replace('/metrics', '');
    let googleDomain = 'https://www.google-analytics.com';

    if (targetPath.startsWith('/gtm.js') || targetPath.startsWith('/gtag/js')) {
      googleDomain = 'https://www.googletagmanager.com';
    }

    const googleTarget = new URL(targetPath + url.search, googleDomain);
    
    // IMPORTANTE: Criar o rewrite mas manter os cookies da 'response' anterior
    const rewriteResponse = NextResponse.rewrite(googleTarget);
    // Copia os cookies de autenticação para o rewrite
    response.cookies.getAll().forEach(cookie => {
      rewriteResponse.cookies.set(cookie.name, cookie.value);
    });
    rewriteResponse.headers.set('Access-Control-Allow-Origin', '*');
    return rewriteResponse;
  }

  const isNextDataRequest = url.searchParams.has('_rsc');

  // --- 2. LÓGICA PARA O SUBDOMÍNIO DASHBOARD ---
  if (hostname.includes(DASHBOARD_DOMAIN)) {
    if (pathname === '/') {
      const urlLancamentos = new URL('/lancamentos', request.url);
      const rewriteDashboard = NextResponse.rewrite(urlLancamentos);
      // Garante persistência de sessão no rewrite
      response.cookies.getAll().forEach(c => rewriteDashboard.cookies.set(c.name, c.value));
      return rewriteDashboard;
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

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};