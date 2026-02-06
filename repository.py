from excel_writer import salvar_lancamento_excel
from path_resolver import obter_caminho_excel
from deduplicator import gerar_hash_deduplicacao
from enums import TipoOrigem


def salvar_lancamento(lancamento) -> bool:
    """
    Persiste um lançamento com deduplicação.

    RESPONSABILIDADE DO REPOSITORY:
    - Garantir coerência semântica do modelo
    - Garantir que o hash_deduplicacao exista
    - Centralizar regra de persistência

    REGRA IMPORTANTE:
    - repository NÃO altera fatura_mes
    - fatura_mes é definido pelo motor (parcelamento / projeção)
    """

    # =====================================================
    # ❌ NÃO zera mais fatura_mes para conta corrente
    # =====================================================
    # A responsabilidade do fatura_mes é:
    # - Conta corrente fixa → expandir_lancamento_em_parcelas
    # - Cartão → input + parcelamento
    # Aqui apenas respeitamos o valor recebido

    # =====================================================
    # Garante hash de deduplicação
    # =====================================================
    if not getattr(lancamento, "hash_deduplicacao", None):
        lancamento.hash_deduplicacao = gerar_hash_deduplicacao(lancamento)

    # =====================================================
    # Caminho do Excel
    # =====================================================
    caminho_excel = obter_caminho_excel(
        projeto=lancamento.projeto,
        tipo_origem=lancamento.tipo_origem,
    )

    try:
        return salvar_lancamento_excel(
            lancamento=lancamento,
            caminho_excel=caminho_excel,
        )

    except ValueError as e:
        # Duplicado detectado no writer
        if "duplicado" in str(e).lower():
            return False
        raise
