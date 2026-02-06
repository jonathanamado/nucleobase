import pandas as pd
from io import StringIO
from datetime import datetime

from schema import LancamentoFinanceiro
from enums import (
    TipoOrigem,
    Natureza,
    FormaPagamento,
)


# =========================================================
# Parser CSV C6 Bank (VERSÃO FINAL CORRETA)
# =========================================================
def parse_c6_csv(conteudo_csv: str, projeto: str) -> list[LancamentoFinanceiro]:
    """
    Parser do CSV de cartão de crédito do C6 Bank
    Compatível com:
    - Valor direto em R$
    - Valor em US$ + Cotação
    - Parcelas "Única" ou "1/3"
    """

    # -----------------------------------------------------
    # Leitura do CSV
    # -----------------------------------------------------
    df = pd.read_csv(
        StringIO(conteudo_csv),
        sep=";",
        encoding="utf-8",
        dtype=str,
    )

    # -----------------------------------------------------
    # Normalização dos nomes das colunas
    # -----------------------------------------------------
    df.columns = df.columns.str.strip().str.lower()

    # -----------------------------------------------------
    # Colunas obrigatórias mínimas
    # -----------------------------------------------------
    colunas_necessarias = [
        "data de compra",
        "descrição",
        "valor (em r$)",
        "parcela",
    ]

    for col in colunas_necessarias:
        if col not in df.columns:
            raise KeyError(
                f"Coluna obrigatória não encontrada no CSV C6: {col}"
            )

    lancamentos = []

    # -----------------------------------------------------
    # Iteração linha a linha
    # -----------------------------------------------------
    for _, row in df.iterrows():

        # -------------------------
        # Data
        # -------------------------
        data_compra = datetime.strptime(
            row["data de compra"].strip(),
            "%d/%m/%Y",
        ).date()

        # -------------------------
        # Valor (PRIORIDADE R$)
        # -------------------------
        valor = 0.0

        raw_rs = str(row.get("valor (em r$)", "")).strip()
        if raw_rs:
            valor = float(
                raw_rs.replace(".", "").replace(",", ".")
            )

        # Fallback US$ × Cotação (se R$ zerado)
        if valor <= 0:
            raw_usd = str(row.get("valor (em us$)", "")).strip()
            raw_cot = str(row.get("cotação (em r$)", "")).strip()

            if raw_usd and raw_cot:
                valor_usd = float(
                    raw_usd.replace(".", "").replace(",", ".")
                )
                cotacao = float(
                    raw_cot.replace(".", "").replace(",", ".")
                )
                valor = round(valor_usd * cotacao, 2)

        # Ignora linhas inválidas
        if valor <= 0:
            continue

        # -------------------------
        # Parcelamento
        # -------------------------
        parcelas_total = None
        parcela_atual = None

        parcela_raw = str(row.get("parcela", "")).strip().lower()

        if "/" in parcela_raw:
            parcela_atual, parcelas_total = parcela_raw.split("/")
            parcela_atual = int(parcela_atual)
            parcelas_total = int(parcelas_total)

        # -------------------------
        # Forma de pagamento
        # -------------------------
        forma_pagamento = (
            FormaPagamento.PARCELADO.value
            if parcelas_total
            else FormaPagamento.AVISTA.value
        )

        # -------------------------
        # Criação do lançamento
        # -------------------------
        lancamento = LancamentoFinanceiro(
            projeto=projeto,
            tipo_origem=TipoOrigem.CARTAO.value,
            origem="C6 Bank",
            cartao_nome=row.get("nome no cartão"),
            data_competencia=data_compra,
            descricao=row["descrição"].strip(),
            valor=valor,
            natureza=Natureza.DESPESA.value,
            forma_pagamento=forma_pagamento,
            parcelas_total=parcelas_total,
            parcela_atual=parcela_atual,
            categoria=row.get("categoria"),
            origem_input="csv_c6",
        )

        lancamentos.append(lancamento)

    return lancamentos
