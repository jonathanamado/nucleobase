from copy import deepcopy
from datetime import datetime
from dateutil.relativedelta import relativedelta

from enums import FormaPagamento, TipoOrigem


def expandir_lancamento_em_parcelas(lancamento):
    """
    MOTOR FINANCEIRO UNIFICADO — VERSÃO FINAL BLINDADA
    """

    def clonar(origem):
        novo = deepcopy(origem)
        novo.tipo_de_custo = origem.tipo_de_custo
        novo.fixo_ate = origem.fixo_ate
        novo.fatura_mes = None 
        return novo

    tipo_origem = (lancamento.tipo_origem or "").strip().lower()
    forma = (lancamento.forma_pagamento or "").strip().lower()
    tipo_custo = (lancamento.tipo_de_custo or "").strip().lower()

    # =========================================================
    # 1️⃣ CONTA CORRENTE
    # =========================================================
    if tipo_origem == TipoOrigem.CONTA_CORRENTE.value:
        lancamento.fatura_mes = None

        if tipo_custo != "fixo":
            lancamento.is_projecao = False
            return [lancamento]

        if not lancamento.data_competencia:
            raise ValueError("data_competencia é obrigatória para custo fixo")

        base = datetime.strptime(lancamento.data_competencia.strftime("%Y-%m"), "%Y-%m")

        try:
            fim = datetime.strptime(lancamento.fixo_ate, "%Y-%m")
        except Exception:
            raise ValueError("fixo_ate inválido (esperado YYYY-MM)")

        todos = []
        mes = base
        while mes <= fim:
            novo = clonar(lancamento)
            novo.fatura_mes = mes.strftime("%Y-%m")
            novo.is_projecao = (mes != base)
            if novo.is_projecao:
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

    try:
        parcelas_total = int(lancamento.parcelas_total)
        parcela_atual = int(lancamento.parcela_atual)
    except Exception:
        parcelas_total = None
        parcela_atual = None

    # =========================================================
    # 3️⃣ Parcelamento do cartão (COM distinção FIXO vs VARIÁVEL)
    # =========================================================
    base_lancamentos = []

    if (forma == FormaPagamento.PARCELADO.value and parcelas_total and parcela_atual):
        
        if not fatura_base:
            raise ValueError("fatura_mes é obrigatória para cartão parcelado")

        # --- LÓGICA DE VALOR ---
        valor_original = float(lancamento.valor)
        
        if tipo_custo == "fixo":
            # 🟢 SE FOR FIXO: O valor se repete integralmente em cada parcela/fatura
            valores = [valor_original] * (parcelas_total + 1) # Array de valores fixos
        else:
            # 🔴 SE FOR VARIÁVEL: Divide o valor total pelas parcelas
            valor_base = round(valor_original / parcelas_total, 2)
            valores = [valor_base] * (parcelas_total + 1)
            diferenca = round(valor_original - sum(valores[1:parcelas_total+1]), 2)
            valores[parcelas_total] += diferenca

        for numero in range(parcela_atual, parcelas_total + 1):
            novo = clonar(lancamento)
            
            # Atribui o valor conforme a lógica definida acima
            novo.valor = valores[numero] if tipo_custo != "fixo" else valor_original

            novo.parcela_atual = numero
            novo.parcelas_total = parcelas_total

            nova_fatura = fatura_base + relativedelta(months=numero - parcela_atual)
            novo.fatura_mes = nova_fatura.strftime("%Y-%m")

            if numero == parcela_atual:
                novo.is_projecao = False
                novo.observacoes = f"Parcela {numero}/{parcelas_total} (Fixo)" if tipo_custo == "fixo" else f"Parcela {numero}/{parcelas_total}"
            else:
                novo.is_projecao = True
                novo.origem_input = "projecao_parcelamento"
                novo.observacoes = f"Projeção fixo {numero}/{parcelas_total}" if tipo_custo == "fixo" else f"Projeção parcela {numero}/{parcelas_total}"

            base_lancamentos.append(novo)

    else:
        lancamento.is_projecao = False
        base_lancamentos.append(lancamento)

    return base_lancamentos
