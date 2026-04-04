import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Lógica para capturar os dados mesmo que venham dentro de um array [ ] ou objeto direto { }
    const userData = Array.isArray(body) ? body[0] : body;

    // Mapeamento das variáveis conforme o seu JSON do Supabase
    const nome_completo = userData.nome_completo || userData.nome;
    const email = userData.email || userData.email_contato;

    // Ajuste do fallback para remover contexto exclusivo de investidor
    const nomeExibicao = nome_completo || "Usuário(a)";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer re_xHFu9ddK_3DZ7JppAYEjk2KcChtfoz9Er`,
      },
      body: JSON.stringify({
        from: "Nucleobase <boasvindas@nucleobase.app>",
        to: [email],
        subject: `Bem-vindo(a) à Nucleobase, ${nomeExibicao}! 🚀`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff; padding: 40px 20px; color: #111827; margin: 0; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto;">
              
              <div style="padding: 0 0 30px 0;">
                <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                  <tr>
                    <td style="vertical-align: middle;">
                      <img src="https://nucleobase.app/logo-oficial.png" alt="Nucleobase" width="130" style="display: block; border: 0;" />
                    </td>
                    <td style="font-size: 13px; font-weight: 800; line-height: 1.1; color: #111827; vertical-align: middle; padding-left: 12px; text-align: left;">
                      Sua plataforma<br/>
                      <span style="color: #6b7280;">financeira</span><br/>
                      <span style="background-color: #2563eb; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 900; display: inline-block; margin-top: 4px; letter-spacing: 0.5px;">DIGITAL</span>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="padding: 20px 0;">
                <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 16px; color: #111827; letter-spacing: -1px;">Olá, ${nomeExibicao}!</h1>
                <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 35px;">
                  Sua conta na <strong>Nucleobase</strong> foi criada com sucesso. Acesse sua central de inteligência e controle financeiro.
                </p>

                <div style="background-color: #f8fafc; border-radius: 20px; padding: 30px; margin-bottom: 35px;">
                  <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #2563eb; margin: 0 0 20px 0; letter-spacing: 1.5px;">Credenciais de Acesso:</p>
                  
                  <div>
                    <span style="font-size: 12px; color: #64748b; font-weight: 600;">E-mail:</span><br/>
                    <strong style="font-size: 16px; color: #111827;">${email}</strong>
                  </div>

                  <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
                      💡 Utilize seu e-mail para realizar o login com segurança através de qualquer dispositivo.
                    </p>
                  </div>
                </div>

                <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
                  Complete o seu cadastro e tenha insights personalizados, de acordo com o seu perfil e comportamento:
                </p>

                <div style="margin-bottom: 40px;">
                  <a href="https://nucleobase.app/minha-conta" style="background-color: #f97316; color: #ffffff; padding: 18px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Atualizar Perfil</a>
                </div>
              </div>

              <div style="padding-top: 30px; border-top: 1px solid #f1f5f9;">
                <a href="https://instagram.com/nucleobase.app" style="color: #2563eb; font-weight: 800; text-decoration: none; font-size: 13px;">@nucleobase.app</a>
                <p style="font-size: 10px; color: #94a3b8; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px;">© 2026 Nucleobase — Sua plataforma de controle financeiro</p>
              </div>
            </div>
          </div>
        `,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro no Route:", error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}