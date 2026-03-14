import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // --- LÓGICA DE PERSISTÊNCIA SUPABASE (SSR) ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
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

  // Essencial para renovar o token e persistir a conta Google nos cookies
  await supabase.auth.getUser();

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
    // Bloqueia envio se usuário não consentiu
    if (!hasConsent) {
      return new NextResponse(null, { status: 204 });
    }

    // Remove o prefixo /metrics
    const targetPath = pathname.replace('/metrics', '');

    let googleDomain = 'https://www.google-analytics.com';

    // Arquivos do GTM precisam vir do googletagmanager
    if (targetPath.startsWith('/gtm.js') || targetPath.startsWith('/gtag/js')) {
      googleDomain = 'https://www.googletagmanager.com';
    }

    const googleTarget = new URL(
      targetPath + url.search,
      googleDomain
    );

    // Reaplica a resposta mantendo os cookies do Supabase
    const rewriteResponse = NextResponse.rewrite(googleTarget);
    rewriteResponse.headers.set('Access-Control-Allow-Origin', '*');
    return rewriteResponse;
  }

  const isNextDataRequest = url.searchParams.has('_rsc');

  // --- 2. LÓGICA PARA O SUBDOMÍNIO DASHBOARD ---
  if (hostname.includes(DASHBOARD_DOMAIN)) {
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/lancamentos', request.url));
    }

    const institutionalPages = ['/sobre', '/contato', '/precos'];

    if (institutionalPages.includes(pathname)) {
      if (isNextDataRequest) {
        return new NextResponse(null, { status: 404 });
      }

      return NextResponse.redirect(
        new URL(`https://${MAIN_DOMAIN}${pathname}`, request.url)
      );
    }
  }

  // --- 3. LÓGICA PARA O DOMÍNIO PRINCIPAL ---
  if (hostname === MAIN_DOMAIN) {
    if (pathname.startsWith('/lancamentos')) {
      return NextResponse.redirect(
        new URL(`https://${DASHBOARD_DOMAIN}/lancamentos`, request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};