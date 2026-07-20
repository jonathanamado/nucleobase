// app/auth/onboarding/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Instancia o cliente com a Service Role Key para ter permissão administrativa total
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { slug, realEmail } = await request.json()
    const emailFormatado = realEmail.trim().toLowerCase()
    const slugFormatado = slug.trim().toLowerCase()

    if (!slugFormatado || !emailFormatado) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 })
    }

    // 1. Busca o id do usuário associado ao slug na tabela profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email_contato")
      .eq("slug", slugFormatado)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ error: "ID de Usuário (Slug) não localizado no sistema." }, { status: 404 })
    }

    // Validação de segurança: permite apenas atualizar perfis "pendentes"
    if (profile.email_contato && !profile.email_contato.startsWith("pendente.morador.")) {
      return NextResponse.json({ error: "Este perfil já possui um e-mail definitivo associado." }, { status: 400 })
    }

    // 2. Verificação de Duplicidade: Verifica se o e-mail real já existe em outro perfil
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email_contato", emailFormatado)
      .neq("id", profile.id) // Ignora o próprio usuário atual
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json({ error: "Este e-mail já está sendo utilizado por outro usuário." }, { status: 409 })
    }

    // 3. Atualiza o e-mail no Core de Autenticação do Supabase (auth.users)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      {
        email: emailFormatado,
        email_confirm: true
      }
    )

    if (authError) {
      console.error("Erro interno no Supabase Auth:", authError)
      return NextResponse.json({ error: "Erro ao atualizar credenciais internas de autenticação." }, { status: 400 })
    }

    // --- Delay de Segurança ---
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 4. Atualiza na tabela pública profiles para consistência
    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({ email_contato: emailFormatado })
      .eq("id", profile.id)

    if (updateProfileError) {
      console.error("Erro ao sincronizar perfis:", updateProfileError)
      return NextResponse.json({ error: "Erro ao sincronizar e-mail na tabela de perfis." }, { status: 500 })
    }

    // 5. Gera um Link de Login (Magic Link) para não depender de disparo de e-mail SMTP
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: emailFormatado,
      options: {
        redirectTo: `https://nucleobase.app/minha-conta`
      }
    });

    if (magicLinkError) {
      console.error("Erro ao gerar magic link:", magicLinkError);
      return NextResponse.json({ error: "Conta ativada, mas falha ao gerar link de acesso." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      magicLink: magicLinkData.properties.action_link
    })

  } catch (err: any) {
    console.error("Erro crítico na API de Onboarding:", err)
    return NextResponse.json({ error: "Ocorreu um erro inesperado no servidor." }, { status: 500 })
  }
}