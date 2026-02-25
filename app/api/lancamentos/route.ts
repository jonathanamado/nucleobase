import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { expandirLancamentos } from "@/lib/finance-service";

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');

  // Criamos o cliente do Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: authHeader || '' },
      },
    }
  );

  try {
    // --- NOVIDADE: VALIDAÇÃO DO USUÁRIO NO SERVIDOR ---
    // Isso garante que o token enviado é válido para o novo domínio
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Erro de autenticação na API:", authError?.message);
      return NextResponse.json({ error: "Usuário não identificado ou sessão expirada." }, { status: 401 });
    }

    const body = await request.json();

    // 1. Definição do lançamento base
    // Usamos o ID do usuário validado pelo servidor (user.id) para maior segurança
    const lancamentoBase = {
      user_id: user.id, // Segurança extra: não confiamos apenas no ID vindo do corpo da requisição
      projeto: body.projeto || "Pessoal",
      tipo_origem: body.tipo_origem,
      origem: body.origem,
      cartao_nome: body.cartao_nome,
      descricao: body.descricao,
      valor: body.valorTotal,
      natureza: body.natureza,
      categoria: body.categoria || null,
      data_competencia: body.dataCompetencia,
      parcelas_total: body.parcelasTotais || 1,
      parcela_atual: 1,
      fatura_mes: body.fatura_mes || null,
      tipo_de_custo: body.tipo_de_custo || 'Variável',
      fixo_ate: body.fixo_ate || null
    };

    // 2. Lógica de Expansão Inteligente
    let listaFinal = expandirLancamentos(lancamentoBase);

    // 3. Geração de Hash para Deduplicação
    listaFinal = listaFinal.map(item => {
      const uniqueString = `${item.user_id}-${item.valor}-${item.data_competencia}-${item.descricao}-${item.parcela_atual}`;
      const hash = Buffer.from(uniqueString).toString('base64');
      return { ...item, hash_deduplicacao: hash };
    });

    // 4. Inserção no Banco de Dados
    const { data, error: insertError } = await supabase
      .from("lancamentos_financeiros")
      .insert(listaFinal)
      .select();

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: "Este lançamento (ou suas parcelas) já consta no sistema." }, 
          { status: 409 }
        );
      }
      console.error("Erro Supabase Insert:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: data.length, data });

  } catch (error: any) {
    console.error("Erro na API de Lançamentos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}