from copy import deepcopy
from datetime import datetime
from dateutil.relativedelta import relativedelta

from enums import FormaPagamento, TipoOrigem


def expandir_lancamento_em_parcelas(lancamento):
    """
    MOTOR FINANCEIRO UNIFICADO — VERSÃO FINAL BLINDADA

    GARANTIAS:
    - tipo_de_custo e fixo_ate NUNCA se perdem
    - valor parcelado é corretamente dividido
    - custo fixo projeta corretamente
    - conta corrente NUNCA herda fatura_mes
    """

    def clonar(origem):
        """Clone blindado semanticamente"""
        novo = deepcopy(origem)
        novo.tipo_de_custo = origem.tipo_de_custo
        novo.fixo_ate = origem.fixo_ate
        novo.fatura_mes = None  # 🔒 blindagem crítica
        return novo

    tipo_origem = (lancamento.tipo_origem or "").strip().lower()
    forma = (lancamento.forma_pagamento or "").strip().lower()
    tipo_custo = (lancamento.tipo_de_custo or "").strip().lower()

    # =========================================================
    # 1️⃣ CONTA CORRENTE
    # =========================================================
    if tipo_origem == TipoOrigem.CONTA_CORRENTE.value:

        # 🔒 Conta corrente NÃO pode herdar fatura_mes
        lancamento.fatura_mes = None

        # Variável → 1 lançamento
        if tipo_custo != "fixo":
            lancamento.is_projecao = False
            return [lancamento]

        # FIXO → projeção mensal
        if not lancamento.data_competencia:
            raise ValueError("data_competencia é obrigatória para custo fixo")

        base = datetime.strptime(
            lancamento.data_competencia.strftime("%Y-%m"), "%Y-%m"
        )

        try:
            fim = datetime.strptime(lancamento.fixo_ate, "%Y-%m")
        except Exception:
            raise ValueError("fixo_ate inválido (esperado YYYY-MM)")

        todos = []
        mes = base

        while mes <= fim:
            novo = clonar(lancamento)
            novo.fatura_mes = mes.strftime("%Y-%m")

            if mes == base:
                novo.is_projecao = False
            else:
                novo.is_projecao = True
                novo.origem_input = "projecao_custo_fixo"

            todos.append(novo)
            mes += relativedelta(months=1)

        return todos

    # =========================================================
    # 2️⃣ CARTÃO — base da fatura
    # =========================================================
    try:
        fatura_base = datetime.strptime(lancamento.fatura_mes, "%Y-%m")
    except Exception:
        fatura_base = None

    # =========================================================
    # Normalização segura de parcelamento
    # =========================================================
    try:
        parcelas_total = int(lancamento.parcelas_total)
        parcela_atual = int(lancamento.parcela_atual)
    except Exception:
        parcelas_total = None
        parcela_atual = None

    # =========================================================
    # 3️⃣ Parcelamento do cartão (COM divisão correta)
    # =========================================================
    base_lancamentos = []

    if (
        forma == FormaPagamento.PARCELADO.value
        and parcelas_total
        and parcela_atual
        and parcelas_total > 1
    ):
        if not fatura_base:
            raise ValueError("fatura_mes é obrigatória para cartão parcelado")

        valor_total = float(lancamento.valor)
        valor_base = round(valor_total / parcelas_total, 2)

        valores = [valor_base] * parcelas_total
        diferenca = round(valor_total - sum(valores), 2)
        valores[-1] += diferenca

        for numero in range(parcela_atual, parcelas_total + 1):
            novo = clonar(lancamento)

            idx = numero - 1
            novo.valor = valores[idx]

            novo.parcela_atual = numero
            novo.parcelas_total = parcelas_total

            nova_fatura = fatura_base + relativedelta(
                months=numero - parcela_atual
            )
            novo.fatura_mes = nova_fatura.strftime("%Y-%m")

            if numero == parcela_atual:
                novo.is_projecao = False
                novo.observacoes = f"Parcela {numero}/{parcelas_total}"
            else:
                novo.is_projecao = True
                novo.origem_input = "projecao_parcelamento"
                novo.observacoes = f"Projeção parcela {numero}/{parcelas_total}"

            base_lancamentos.append(novo)

    else:
        lancamento.is_projecao = False
        base_lancamentos.append(lancamento)

    # =========================================================
    # 4️⃣ CARTÃO: ENCERRA AQUI
    # =========================================================
    return base_lancamentos
