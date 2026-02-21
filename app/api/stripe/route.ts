import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const lookup_key = formData.get('lookup_key') as string;

    if (!lookup_key) {
      return NextResponse.json({ error: "Chave de busca não fornecida." }, { status: 400 });
    }

    // 1. Busca o preço no Stripe usando a Chave de Pesquisa
    const prices = await stripe.prices.list({
      lookup_keys: [lookup_key],
      expand: ['data.product'],
    });

    if (!prices.data || prices.data.length === 0) {
      console.error(`Preço não encontrado para a chave: ${lookup_key}`);
      return NextResponse.json({ error: "Plano não encontrado no Stripe." }, { status: 404 });
    }

    // 2. Cria a sessão de Checkout
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        { 
          price: prices.data[0].id, 
          quantity: 1 
        }
      ],
      mode: 'subscription', 
      
      // AQUI ESTÁ O AJUSTE: Enviando o nome do plano para o Webhook ler depois
      metadata: {
        plan_name: lookup_key, 
      },

      success_url: `${process.env.NEXT_PUBLIC_URL}/assinatura/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/planos`,
    });

    // 3. Redireciona
    return NextResponse.redirect(session.url as string, 303);

  } catch (err: any) {
    console.error("Erro crítico na rota Stripe:", err.message);
    return NextResponse.json(
      { error: "Erro interno ao processar pagamento." }, 
      { status: 500 }
    );
  }
}