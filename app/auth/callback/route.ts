// app/api/auth/onboarding/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Mantenha apenas a URL pública, a SERVICE_ROLE_KEY deve ser lida apenas do servidor
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // IMPORTANTE: Sem NEXT_PUBLIC_ aqui
)

export async function POST(request: Request) {
  try {
    const { slug, realEmail } = await request.json()

    if (!slug || !realEmail) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 })
    }

    // 1. Localiza o id do morador pelo slug na tabela pública de profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email_contato")
      .eq("slug", slug.trim().toLowerCase())
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ error: "ID de Usuário (Slug) não encontrado." }, { status: 404 })
    }

    // Se já tiver e-mail normal (sem a tag pendente), barra a operação por segurança
    if (profile.email_contato && !profile.email_contato.startsWith("pendente.morador.")) {
      return NextResponse.json({ error: "Este perfil já possui um e-mail definitivo associado." }, { status: 400 })
    }

    // 2. Atualiza o e-mail no Core de Autenticação (auth.users)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      {
        email: realEmail.trim().toLowerCase(),
        email_confirm: true
      }
    )

    if (authError) {
      console.error("Erro interno Supabase Auth:", authError)
      return NextResponse.json({ error: "Erro ao atualizar credenciais no sistema de autenticação." }, { status: 400 })
    }

    // 3. Atualiza o campo correspondente na tabela pública
    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({ email_contato: realEmail.trim().toLowerCase() })
      .eq("id", profile.id)

    if (updateProfileError) {
      return NextResponse.json({ error: "Erro ao sincronizar e-mail de contato no perfil público." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Erro na rota de Onboarding:", err)
    return NextResponse.json({ error: "Ocorreu um erro inesperado no processamento." }, { status: 500 })
  }
}