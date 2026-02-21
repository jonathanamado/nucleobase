import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Erro de Assinatura Webhook: ${err.message}`);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const customerEmail = session.customer_details?.email;
    const stripeCustomerId = session.customer as string;
    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : session.subscription?.id || null;

    const rawPlanName = session.metadata?.plan_name || 'essencial_mensal';
    const formattedPlanName = rawPlanName.replace('_', ' ').toUpperCase();

    console.log(`🔎 Atualizando: ${customerEmail} | Plano: ${rawPlanName}`);

    // 1. ATUALIZAÇÃO NO SUPABASE
    const { data, error: supabaseError } = await supabase
      .from('profiles')
      .update({ 
        is_subscribed: true,
        plan_type: rawPlanName, 
        stripe_customer_id: stripeCustomerId,
        subscription_id: subscriptionId,
        updated_at: new Date().toISOString(),
      })
      .ilike('email', customerEmail!)
      .select();

    if (supabaseError) {
      console.error('❌ Erro Supabase:', supabaseError.message);
    } else if (data && data.length > 0) {
      
      console.log('✅ Supabase OK. Tentando enviar e-mails...');

      // 2. ENVIO DE E-MAILS
      try {
        // A. E-mail para o CLIENTE
        const resCliente = await resend.emails.send({
          from: 'Nucleo Base <comercial@nucleobase.app>',
          to: [customerEmail!],
          replyTo: 'nucleobase.app@gmail.com',
          subject: 'Acesso Liberado! Seja bem-vindo ao Nucleo Base 🚀',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; padding: 30px; border-radius: 16px;">
              <h1 style="color: #2563eb; font-size: 24px;">Olá!</h1>
              <p style="color: #4b5563; font-size: 16px;">Confirmamos seu pagamento com sucesso. Seu acesso ao <strong>Plano ${formattedPlanName}</strong> está liberado!</p>
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 14px;">RESUMO DA ASSINATURA</p>
                <p style="margin: 5px 0 0 0; color: #1e293b; font-weight: bold; font-size: 18px;">${formattedPlanName}</p>
              </div>
              <p style="color: #4b5563; font-size: 16px;">Você já pode começar a gerenciar sua jornada financeira agora mesmo:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_URL}/acesso-usuario" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold;">Entrar no Painel</a>
              </div>
              <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 30px 0;" />
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">Nucleo Base - Gestão Estratégica</p>
            </div>
          `
        });

        if (resCliente.error) {
           console.error('❌ Erro Resend (Cliente):', resCliente.error);
        } else {
           console.log('📧 E-mail do cliente enviado! ID:', resCliente.data?.id);
        }

        // --- PAUSA DE 1.5 SEGUNDOS PARA EVITAR RATE LIMIT (429) ---
        await new Promise(resolve => setTimeout(resolve, 1500));

        // B. E-mail de NOTIFICAÇÃO PARA VOCÊ
        const resAdmin = await resend.emails.send({
          from: 'Nucleo Base <comercial@nucleobase.app>',
          to: ['nucleobase.app@gmail.com'], 
          replyTo: customerEmail!,
          subject: `💰 Nova Venda: ${formattedPlanName}`,
          html: `<h3>Parabéns! Nova assinatura: ${customerEmail}</h3>`
        });

        if (resAdmin.error) {
           console.error('❌ Erro Resend (Admin):', resAdmin.error);
        } else {
           console.log('📧 Notificação admin enviada!');
        }

      } catch (mailErr) {
        console.error('⚠️ Falha crítica na API do Resend:', mailErr);
      }
    }
  }

  return NextResponse.json({ received: true });
}