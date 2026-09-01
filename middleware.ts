// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // SEGURANÇA: Só valida a sessão se o navegador já possuir um cookie do Supabase.
  // Isso evita que o login seja bloqueado quando o usuário está sem cookies ou tentando logar.
  const hasAuthCookie = request.cookies.getAll().some(
    cookie => cookie.name.includes('auth-token') || cookie.name.includes('supabase')
  );

  if (hasAuthCookie) {
    try {
      await supabase.auth.getUser();
    } catch (error) {
      // Silencia erros de token expirado/inválido para não quebrar a navegação
    }
  }

  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

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

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};