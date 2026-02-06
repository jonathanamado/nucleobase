import os
import pandas as pd
from enums import TipoOrigem, FormaPagamento


# =========================================================
# Escrita em Excel com deduplicação e padronização
# =========================================================
def salvar_lancamento_excel(lancamento, caminho_excel: str) -> bool:
    """
    Salva um lançamento no Excel aplicando deduplicação por hash.

    REGRA DE INFRAESTRUTURA:
    - PermissionError NUNCA é tratado aqui
    - Erro de permissão deve subir até a UI
    """

    os.makedirs(os.path.dirname(caminho_excel), exist_ok=True)

    # -------------------------
    # Hash obrigatório
    # -------------------------
    if not getattr(lancamento, "hash_deduplicacao", None):
        raise ValueError("Lançamento sem hash_deduplicacao.")

    novo_hash = lancamento.hash_deduplicacao

    # =====================================================
    # fatura_mes (sempre respeita o valor do lançamento)
    # =====================================================
    if lancamento.fatura_mes:
        fatura_mes = lancamento.fatura_mes
    else:
        dc = lancamento.data_competencia
        fatura_mes = (
            dc.strftime("%Y-%m")
            if hasattr(dc, "strftime")
            else str(dc)[:7]
        )



    # =====================================================
    # Arquivo de saída
    # =====================================================
    nome_arquivo = os.path.basename(caminho_excel).lower()

    # -------------------------
    # Meio de pagamento
    # -------------------------
    if "acumulado_cartoes" in nome_arquivo:
        meio_pagamento = "cartao de credito"
    else:
        meio_pagamento = lancamento.meio_pagamento or ""

    # -------------------------
    # Forma de pagamento
    # -------------------------
    if lancamento.tipo_origem == TipoOrigem.CONTA_CORRENTE.value:
        forma_pagamento = FormaPagamento.AVISTA.value
    else:
        forma_pagamento = lancamento.forma_pagamento or ""

    # -------------------------
    # Padronizações
    # -------------------------
    data_formatada = (
        lancamento.data_competencia.strftime("%d/%m/%Y")
        if hasattr(lancamento.data_competencia, "strftime")
        else str(lancamento.data_competencia)
    )

    valor_formatado = f"{float(lancamento.valor):.2f}"

    parcelas_total = (
        str(lancamento.parcelas_total)
        if lancamento.parcelas_total not in (None, "")
        else ""
    )

    parcela_atual = (
        str(lancamento.parcela_atual)
        if lancamento.parcela_atual not in (None, "")
        else ""
    )

    # =====================================================
    # ID lógico
    # =====================================================
    campos_id = [
        str(lancamento.origem),
        data_formatada,
        valor_formatado,
        parcelas_total,
        parcela_atual,
    ]

    # Apenas conta corrente inclui descrição no ID
    if "acumulado_contas_corrente" in nome_arquivo:
        campos_id.insert(2, str(lancamento.descricao))

    id_lancamento = "_".join(filter(None, campos_id))

    # =====================================================
    # Registro final
    # =====================================================
    registro = {
        "id_lancamento": id_lancamento,
        "hash": novo_hash,
        "projeto": lancamento.projeto,
        "tipo_origem": lancamento.tipo_origem,
        "origem": lancamento.origem,
        "cartao_nome": lancamento.cartao_nome or "",
        "data_competencia": data_formatada,
        "descricao": lancamento.descricao,
        "valor": valor_formatado,
        "natureza": lancamento.natureza,

        # 🔥 AGORA VALE PARA CARTÃO E CONTA CORRENTE
        "tipo_de_custo": lancamento.tipo_de_custo or "",
        "fixo_ate": lancamento.fixo_ate or "",

        "forma_pagamento": forma_pagamento,
        "meio_pagamento": meio_pagamento,
        "parcela_atual": parcela_atual,
        "parcelas_total": parcelas_total,
        "fatura_mes": fatura_mes,
        "categoria": getattr(lancamento, "categoria", ""),
        "origem_input": lancamento.origem_input,
        "is_projecao": str(bool(getattr(lancamento, "is_projecao", False))),
    }

    df_novo = pd.DataFrame([registro])

    # =====================================================
    # Escrita (COM BLOQUEIO REAL)
    # =====================================================
    if not os.path.exists(caminho_excel):
        df_novo.to_excel(caminho_excel, index=False)
        return True

    df_existente = pd.read_excel(caminho_excel, dtype=str)

    if "hash" in df_existente.columns and novo_hash in df_existente["hash"].values:
        return False

    df_final = pd.concat([df_existente, df_novo], ignore_index=True)
    df_final.to_excel(caminho_excel, index=False)

    return True
