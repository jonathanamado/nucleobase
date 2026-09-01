// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // --- LÓGICA DE PERSISTÊNCIA SUPABASE (SSR com proteção de erro) ---
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

  try {
    await supabase.auth.getUser();
  } catch (error) {
    // Silencia erros de sessão ausente para não quebrar o fluxo de login inicial
  }

  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Definições de domínio declaradas no topo para evitar erros de escopo
  const MAIN_DOMAIN = 'nucleobase.app';
  const DASHBOARD_DOMAIN = 'dashboard.nucleobase.app';

  // --- 1. LÓGICA PARA O GOOGLE TAG GATEWAY (SERVER-SIDE VIA PROXY) ---
  if (pathname.startsWith('/metrics')) {
    const targetPath = pathname.replace('/metrics', '');

    let googleDomain = 'https://www.google-analytics.com';

    if (targetPath.startsWith('/gtm.js') || targetPath.startsWith('/gtag/js')) {
      googleDomain = 'https://www.googletagmanager.com';
    }

    const googleTarget = new URL(
      targetPath + url.search,
      googleDomain
    );

    const rewriteResponse = NextResponse.rewrite(googleTarget);
    rewriteResponse.headers.set('Access-Control-Allow-Origin', '*');
    return rewriteResponse;
  }

  const isNextDataRequest = url.searchParams.has('_rsc');

  // --- 2. LÓGICA PARA O SUBDOMÍNIO DASHBOARD ---
  if (hostname.includes(DASHBOARD_DOMAIN)) {
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/controle-financeiro/lancamentos', request.url));
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
        new URL(`https://${DASHBOARD_DOMAIN}/controle-financeiro/lancamentos`, request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};