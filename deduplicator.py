# deduplicator.py

import hashlib
import unicodedata
from enums import TipoOrigem


HASH_VERSION = "v4"  # 🔥 bump de versão (correção parcelamento fixo)


# =========================================================
# Normalizações auxiliares
# =========================================================
def normalizar_texto(texto: str) -> str:
    """
    Normaliza texto para deduplicação:
    - lower
    - remove acentos
    - remove espaços extras
    """
    if not texto:
        return ""

    texto = str(texto).lower()
    texto = unicodedata.normalize("NFKD", texto)
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    texto = " ".join(texto.split())

    return texto


def normalizar_valor(valor) -> str:
    if valor is None:
        raise ValueError("Valor não pode ser None para deduplicação")

    return f"{float(valor):.2f}"


# =========================================================
# Hash determinístico oficial
# =========================================================
def gerar_hash_deduplicacao(lancamento) -> str:
    """
    Gera hash determinístico para deduplicação.

    Considera:
    - versão do algoritmo
    - projeto
    - tipo_origem
    - origem
    - cartao_nome
    - data_competencia
    - fatura_mes
    - valor
    - parcela_atual
    - parcelas_totais
    - natureza
    - is_projecao
    """

    # -------------------------
    # Validações fortes
    # -------------------------
    if not getattr(lancamento, "origem", None):
        raise ValueError("origem ausente no lançamento")

    if not getattr(lancamento, "data_competencia", None):
        raise ValueError("data_competencia ausente no lançamento")

    # Conta corrente nunca exige fatura
    if (
        lancamento.tipo_origem != TipoOrigem.CONTA_CORRENTE.value
        and not getattr(lancamento, "fatura_mes", None)
    ):
        raise ValueError("fatura_mes ausente no lançamento")

    if lancamento.valor is None:
        raise ValueError("valor ausente no lançamento")

    # -------------------------
    # Normalizações
    # -------------------------
    projeto = normalizar_texto(getattr(lancamento, "projeto", ""))
    tipo_origem = normalizar_texto(getattr(lancamento, "tipo_origem", ""))
    origem = normalizar_texto(lancamento.origem)
    cartao_nome = normalizar_texto(getattr(lancamento, "cartao_nome", ""))

    data_str = (
        lancamento.data_competencia.isoformat()
        if hasattr(lancamento.data_competencia, "isoformat")
        else str(lancamento.data_competencia)
    )

    fatura_mes = normalizar_texto(getattr(lancamento, "fatura_mes", ""))

    valor = normalizar_valor(lancamento.valor)

    # 🔥 CORREÇÃO CRÍTICA AQUI
    parcela_atual = getattr(lancamento, "parcela_atual", None) or 1
    parcelas_totais = (
        getattr(lancamento, "parcelas_totais", None)
        or getattr(lancamento, "parcelas_total", None)  # compat legado
        or 1
    )

    natureza = normalizar_texto(getattr(lancamento, "natureza", ""))

    is_projecao = bool(getattr(lancamento, "is_projecao", False))

    # -------------------------
    # Coerência mínima
    # -------------------------
    if parcela_atual > parcelas_totais:
        raise ValueError(
            "parcela_atual maior que parcelas_totais"
        )

    # -------------------------
    # Base determinística FINAL
    # -------------------------
    base = "|".join(
        [
            HASH_VERSION,
            projeto,
            tipo_origem,
            origem,
            cartao_nome,
            data_str,
            fatura_mes,
            valor,
            str(parcela_atual),
            str(parcelas_totais),
            natureza,
            str(is_projecao),
        ]
    )

    return hashlib.sha256(base.encode("utf-8")).hexdigest()
