import hashlib


def gerar_hash_lancamento(dados: dict) -> str:
    """
    Gera um hash estável para deduplicação de lançamentos.

    Regras:
    - NÃO usa descrição
    - NÃO usa timestampg
    - Usa apenas campos estruturais
    """

    campos_chave = [
        dados.get("tipo_origem", ""),
        dados.get("origem", ""),
        dados.get("cartao_nome", "") or "",
        str(dados.get("data_competencia", "")),
        f"{float(dados.get('valor', 0)):.2f}",
        dados.get("natureza", "")
    ]

    texto_base = "|".join(c.strip().lower() for c in campos_chave)

    return hashlib.sha256(texto_base.encode("utf-8")).hexdigest()
