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

    // 1. Inicializa o cliente Supabase usando os cookies da requisição com await para pegar o usuário logado
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

    const { data: { user } } = await supabase.auth.getUser();

    // Validação de segurança: se o usuário não estiver logado, redireciona para a página de acesso
    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/acesso-usuario?redirect=/planos`, 303);
    }

    const formData = await req.formData();
    const lookup_key = formData.get('lookup_key') as string;

    if (!lookup_key) {
      return NextResponse.json({ error: "Chave de busca não fornecida." }, { status: 400 });
    }

    // 2. Busca o preço no Stripe
    const prices = await stripe.prices.list({
      lookup_keys: [lookup_key],
      expand: ['data.product'],
    });

    if (!prices.data || prices.data.length === 0) {
      console.error(`Preço não encontrado para a chave: ${lookup_key}`);
      return NextResponse.json({ error: "Plano não encontrado no Stripe." }, { status: 404 });
    }

    // 3. Cria a sessão de Checkout injetando o ID do usuário do Supabase
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1
        }
      ],
      mode: 'subscription',

      metadata: {
        plan_name: lookup_key,
        supabase_user_id: user.id,
      },

      success_url: `${process.env.NEXT_PUBLIC_URL}/assinatura/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/planos`,
    });

    // 4. Redireciona para o Checkout do Stripe
    return NextResponse.redirect(session.url as string, 303);

  } catch (err: any) {
    console.error("Erro crítico na rota Stripe:", err.message);
    return NextResponse.json(
      { error: err.message || "Erro interno ao processar pagamento." },
      { status: 500 }
    );
  }
}