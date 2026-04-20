import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const userData = Array.isArray(body) ? body[0] : body;

    const nome_completo = userData.nome_completo || userData.nome;
    const email = userData.email || userData.email_contato;

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
        subject: `Bem-vindo à Nucleobase 🚀`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7fa; padding: 60px 20px; color: #1e293b; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
              
              <!-- HEADER (MANTIDO) -->
              <div style="background-color: #ffffff; padding: 40px; border-bottom: 1px solid #f1f5f9;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="vertical-align: middle; width: 140px;">
                      <img src="https://nucleobase.app/logo-oficial.png" alt="Nucleobase" width="130" style="display: block; border: 0;" />
                    </td>
                    <td style="font-size: 14px; font-weight: 800; line-height: 1.2; color: #0f172a; vertical-align: middle; padding-left: 15px; text-align: left; text-transform: uppercase; letter-spacing: 0.5px;">
                      Sua plataforma<br/>
                      <span style="color: #64748b;">financeira digital</span><br/>
                      <span style="background-color: #2563eb; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 900; display: inline-block; margin-top: 5px; letter-spacing: 1px;">PREMIUM</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CONTEÚDO -->
              <div style="padding: 50px 40px; text-align: center;">
                <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 20px; letter-spacing: -1px;">
                  Seja bem-vindo(a), ${nomeExibicao} 🎉
                </h1>
                
                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 30px;">
                  Estamos muito felizes por ter você com a gente.
                </p>

                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 30px;">
                  A partir de agora, você dá um passo além das planilhas manuais e entra em uma nova forma de organizar sua vida financeira.<br/><br/>
                  A Nucleo foi pensada para <strong>centralizar e automatizar seu controle</strong>, trazendo clareza sobre o seu orçamento 
                  e contribuindo em suas decisões sobre compras e investimentos no dia a dia.
                </p>

                <!-- IDENTIDADE -->
                <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 18px; padding: 30px; margin-bottom: 40px; text-align: center; color: #ffffff; box-shadow: 0 15px 25px rgba(15, 23, 42, 0.25);">
                  
                  <span style="background-color: #2563eb; color: #ffffff; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; display: inline-block; margin-bottom: 15px; letter-spacing: 1px;">
                    SUA IDENTIDADE DE ACESSO
                  </span>

                  <div style="font-size: 18px; font-weight: 700; letter-spacing: 0.3px; color: #475569;">
                    <strong>E-mail:</strong> <span style="color: #475569;">${email}</span>
                  </div>

                  <div style="margin-top: 20px; height: 1px; background: #475569; width: 60%; margin-left: auto; margin-right: auto;"></div>

                  <div style="margin-top: 15px; font-size: 11px; letter-spacing: 1.5px; color: #475569;">
                    NUCLEOBASE • DIGITAL ACCESS
                  </div>
                </div>

                <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 15px; text-align: left;">
                  Com o APP, você poderá:
                </h3>

                <ul style="text-align: left; color: #475569; font-size: 15px; line-height: 1.8; margin-bottom: 40px; padding-left: 20px;">
                  <li>📊 Organizar suas receitas e despesas com facilidade</li>
                  <li>💳 Integrar diferentes cartões de forma centralizada</li>
                  <li>📈 Acompanhar sua evolução financeira digitalmente</li>
                  <li>🧠 Entender hábitos de consumo em poucos cliques</li>
                  <li>🎯 Planejar um futuro com segurança em suas decisões</li>
                </ul>

                <p style="font-size: 15px; color: #475569; margin-bottom: 30px;">
                  👉 Comece agora registrando seus primeiros lançamentos. Quanto mais você usa, mais valor você extrai da plataforma.
                </p>

                <div style="margin-bottom: 20px;">
                  <a href="https://nucleobase.app/minha-conta" style="background-color: #0f172a; color: #ffffff; padding: 20px 40px; border-radius: 14px; text-decoration: none; font-weight: 800; display: inline-block; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.3);">
                    Acessar Minha Conta
                  </a>
                </div>

                <p style="font-size: 13px; color: #94a3b8; margin-top: 25px;">
                  Se precisar de ajuda, nos acione através dos nossos canais.
                </p>
              </div>

              <!-- FOOTER (MANTIDO) -->
              <div style="padding: 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                <p style="font-size: 14px; color: #475569; margin-bottom: 10px; font-weight: 600;">Junte-se à nossa comunidade:</p>
                <a href="https://instagram.com/nucleobase.app" style="text-decoration: none; display: inline-block;">
                  <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="30" style="display: block; margin: 0 auto 10px auto;" />
                  <span style="color: #2563eb; font-weight: 800; font-size: 14px;">@nucleobase.app</span>
                </a>
                <div style="height: 1px; background-color: #e2e8f0; width: 50px; margin: 20px auto;"></div>
                <p style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">© 2026 NUCLEOBASE — ORGANIZE HOJE. DECIDA MELHOR AMANHÃ.</p>
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