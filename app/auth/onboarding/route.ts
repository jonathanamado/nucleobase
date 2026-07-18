// app/auth/onboarding/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Instancia o cliente com a Service Role Key para ter permissão de alterar tabelas internas do Auth
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ==========================================
// METODO POST: Executa a troca do e-mail provisório
// ==========================================
export async function POST(request: Request) {
  try {
    const { slug, realEmail } = await request.json()

    if (!slug || !realEmail) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 })
    }

    // 1. Busca o id do usuário associado ao slug na tabela profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email_contato")
      .eq("slug", slug.trim().toLowerCase())
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ error: "ID de Usuário (Slug) não localizado no sistema." }, { status: 404 })
    }

    // Se já não contiver a tag de pendente, barra para evitar ataques ou sobrescritas indesejadas
    if (profile.email_contato && !profile.email_contato.startsWith("pendente.morador.")) {
      return NextResponse.json({ error: "Este perfil já possui um e-mail definitivo associado." }, { status: 400 })
    }

    // 2. Atualiza o e-mail no Core de Autenticação do Supabase (auth.users)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      {
        email: realEmail.trim().toLowerCase(),
        email_confirm: true // bypass de confirmação dupla no e-mail fantasma
      }
    )

    if (authError) {
      console.error("Erro interno no Supabase Auth:", authError)
      return NextResponse.json({ error: "Erro ao atualizar credenciais internas de autenticação." }, { status: 400 })
    }

    // 3. Atualiza na tabela pública profiles para manter a consistência dos dados
    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({ email_contato: realEmail.trim().toLowerCase() })
      .eq("id", profile.id)

    if (updateProfileError) {
      return NextResponse.json({ error: "Erro ao sincronizar e-mail na tabela de perfis." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Erro crítico na API de Onboarding:", err)
    return NextResponse.json({ error: "Ocorreu um erro inesperado no servidor." }, { status: 500 })
  }
}

// ==========================================
// MANTENHA SEU MÉTODO GET CASO ELE EXISTA AQUI
// ==========================================
// Se o seu GET antigo de troca de códigos (Callback) estava nesse mesmo arquivo,
// pode colá-lo aqui embaixo sem problemas para manter as duas lógicas ativas.