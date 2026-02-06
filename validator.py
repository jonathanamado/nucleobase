from datetime import datetime 

from schema import LancamentoFinanceiro
from enums import (
    TipoOrigem,
    FormaPagamento,
    MeioPagamento,
)

from identity import gerar_hash_lancamento


class SchemaValidationError(Exception):
    pass


def validar_lancamento(l: LancamentoFinanceiro) -> LancamentoFinanceiro:
    """
    Validação de regras de negócio.

    PRINCÍPIOS:
    - Valores internos SEMPRE canônicos (minúsculos)
    - Nenhuma tradução / label aqui
    - Nenhuma conversão agressiva (int/float) sem checagem
    - Regras variam conforme tipo_origem
    """
    erros = []

    # =====================================================
    # Campos obrigatórios gerais
    # =====================================================
    if not l.projeto:
        erros.append("Campo 'projeto' é obrigatório.")

    if l.tipo_origem not in [e.value for e in TipoOrigem]:
        erros.append(f"tipo_origem inválido: {l.tipo_origem}")

    if not l.origem:
        erros.append("Campo 'origem' é obrigatório.")

    if not l.data_competencia:
        erros.append("Campo 'data_competencia' é obrigatório.")

    if not l.descricao:
        erros.append("Campo 'descricao' é obrigatório.")

    if l.valor is None or not isinstance(l.valor, (int, float)) or l.valor <= 0:
        erros.append("Campo 'valor' deve ser numérico e maior que zero.")

    # =====================================================
    # Natureza (TEXTO LIVRE — canônica)
    # =====================================================
    if not l.natureza or not isinstance(l.natureza, str):
        erros.append("Campo 'natureza' é obrigatório e deve ser texto.")
    else:
        l.natureza = l.natureza.strip().lower()

    if not l.origem_input:
        erros.append("Campo 'origem_input' é obrigatório.")

    # =====================================================
    # 🔥 REGRA D — Tipo de custo (AGORA SÓ PARA CONTA CORRENTE)
    # =====================================================

    if l.tipo_origem == TipoOrigem.CONTA_CORRENTE.value:

        if not l.tipo_de_custo:
            erros.append("Campo 'tipo_de_custo' é obrigatório (fixo ou variavel).")

        elif l.tipo_de_custo not in ["fixo", "variavel"]:
            erros.append("tipo_de_custo deve ser 'fixo' ou 'variavel'.")

        # ---------- CUSTO FIXO (SÓ EM CONTA CORRENTE) ----------
        if l.tipo_de_custo == "fixo":

            if not getattr(l, "fixo_ate", None):
                erros.append("Custos fixos exigem 'fixo_ate' (YYYY-MM).")
            else:
                try:
                    datetime.strptime(l.fixo_ate, "%Y-%m")
                except Exception:
                    erros.append("fixo_ate deve estar no formato YYYY-MM.")

    # =====================================================
    # Tipo de custo — agora também válido para CARTÃO
    # =====================================================

    if l.tipo_de_custo is not None:

        if l.tipo_de_custo not in ["fixo", "variavel"]:
            erros.append("tipo_de_custo deve ser 'fixo' ou 'variavel'.")

        if l.tipo_de_custo == "fixo":

            if not getattr(l, "fixo_ate", None):
                erros.append("Custos fixos exigem 'fixo_ate' (YYYY-MM).")
            else:
                try:
                    datetime.strptime(l.fixo_ate, "%Y-%m")
                except Exception:
                    erros.append("fixo_ate deve estar no formato YYYY-MM.")



    # =====================================================
    # Regras por tipo de origem
    # =====================================================

    # =========================
    # CARTÃO DE CRÉDITO
    # =========================
    if l.tipo_origem == TipoOrigem.CARTAO.value:

        if not l.cartao_nome:
            erros.append("Cartão exige 'cartao_nome'.")

        if l.forma_pagamento not in [e.value for e in FormaPagamento]:
            erros.append(
                f"forma_pagamento inválida para cartão: {l.forma_pagamento}"
            )

        # Cartão NUNCA pode ter meio_pagamento
        if getattr(l, "meio_pagamento", None) is not None:
            erros.append("Cartão não pode ter meio_pagamento.")

        # 🔥 Fatura é obrigatória para QUALQUER lançamento de cartão
        if not getattr(l, "fatura_mes", None):
            erros.append("fatura_mes é obrigatório para cartão de crédito.")
        else:
            try:
                datetime.strptime(l.fatura_mes, "%Y-%m")
            except Exception:
                erros.append(
                    f"fatura_mes inválida: {l.fatura_mes} (esperado YYYY-MM)"
                )

        # ---------- PARCELADO ----------
        if l.forma_pagamento == FormaPagamento.PARCELADO.value:

            if l.parcelas_total is None:
                erros.append(
                    "parcelas_total é obrigatório para pagamento parcelado."
                )

            if l.parcela_atual is None:
                erros.append(
                    "parcela_atual é obrigatório para pagamento parcelado."
                )

            if l.parcelas_total is not None and not isinstance(
                l.parcelas_total, int
            ):
                erros.append("parcelas_total deve ser inteiro.")

            if l.parcela_atual is not None and not isinstance(
                l.parcela_atual, int
            ):
                erros.append("parcela_atual deve ser inteiro.")

            if isinstance(l.parcelas_total, int) and l.parcelas_total < 2:
                erros.append("parcelas_total deve ser >= 2.")

            if isinstance(l.parcela_atual, int) and l.parcela_atual < 1:
                erros.append("parcela_atual deve ser >= 1.")

            if (
                isinstance(l.parcela_atual, int)
                and isinstance(l.parcelas_total, int)
                and l.parcela_atual > l.parcelas_total
            ):
                erros.append(
                    "parcela_atual não pode ser maior que parcelas_total."
                )

        # ---------- À VISTA ----------
        if l.forma_pagamento == FormaPagamento.AVISTA.value:
            l.parcelas_total = None
            l.parcela_atual = None

    # =========================
    # CONTA CORRENTE
    # =========================
    if l.tipo_origem == TipoOrigem.CONTA_CORRENTE.value:

        if l.cartao_nome:
            erros.append("Conta corrente não pode ter cartao_nome.")

        # Conta corrente DEVE ter meio_pagamento válido
        if l.meio_pagamento not in [e.value for e in MeioPagamento]:
            erros.append(
                f"meio_pagamento inválido para conta corrente: {l.meio_pagamento}"
            )

        # 🔥 NOVA REGRA: Conta corrente DEVE ter forma_pagamento = "avista"
        if l.forma_pagamento != FormaPagamento.AVISTA.value:
            erros.append(
                "Conta corrente deve ter forma_pagamento = 'avista'."
            )

        # Conta corrente NUNCA parcela
        l.parcelas_total = None
        l.parcela_atual = None

        # NÃO bloqueamos fatura_mes (excel_writer trata isso depois)

    # =====================================================
    # Resultado final
    # =====================================================
    if erros:
        raise SchemaValidationError(" | ".join(erros))

    # =====================================================
    # Geração de identidade (hash de origem)
    # =====================================================
    dados_hash = {
        "tipo_origem": l.tipo_origem,
        "origem": l.origem,
        "cartao_nome": l.cartao_nome,
        "data_competencia": l.data_competencia,
        "valor": l.valor,
        "natureza": l.natureza,
        "tipo_de_custo": l.tipo_de_custo,
    }

    l.hash_origem = gerar_hash_lancamento(dados_hash)

    return l
