// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host');

  // 1. Se o usuário estiver no dashboard.nucleobase.app
  if (hostname === 'dashboard.nucleobase.app') {
    // Se ele tentar acessar a home (/) do subdomínio, manda para /lancamentos
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/lancamentos', request.url));
    }
  }

  // 2. Se o usuário estiver no nucleobase.app (principal)
  // E tentar acessar o /lancamentos, podemos redirecionar para o subdomínio
  if (hostname === 'nucleobase.app' && url.pathname.startsWith('/lancamentos')) {
    return NextResponse.redirect(new URL(`https://dashboard.nucleobase.app${url.pathname}`, request.url));
  }

  return NextResponse.next();
}