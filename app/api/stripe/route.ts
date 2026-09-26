// app/api/stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-01-27.acacia' as any,
  });

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY não configurada nas variáveis de ambiente.");
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Tenta pegar o usuário pelo token do cabeçalho Authorization ou pelos cookies
    let user = null;
    const authHeader = req.headers.get('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user: tokenUser } } = await supabase.auth.getUser(token);
      user = tokenUser;
    }

    if (!user) {
      const { data: { user: cookieUser } } = await supabase.auth.getUser();
      user = cookieUser;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não autenticado. Clique em 'Criar Conta' ou 'Realizar login' antes de prosseguir com sua assinatura." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const lookup_key = body.lookup_key;

    if (!lookup_key) {
      return NextResponse.json({ error: "Chave de busca não fornecida." }, { status: 400 });
    }

    const prices = await stripe.prices.list({
      lookup_keys: [lookup_key],
      expand: ['data.product'],
    });

    if (!prices.data || prices.data.length === 0) {
      return NextResponse.json({ error: "Plano não encontrado no Stripe." }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [{ price: prices.data[0].id, quantity: 1 }],
      mode: 'subscription',
      metadata: {
        plan_name: lookup_key,
        supabase_user_id: user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/assinatura/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/planos`,
    });

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error("Erro crítico na rota Stripe:", err.message);
    return NextResponse.json(
      { error: err.message || "Erro interno ao processar pagamento." },
      { status: 500 }
    );
  }
}