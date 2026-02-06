from deduplicator import gerar_hash_deduplicacao
from parsers.excel_manual import parse_excel_manual
from repository import salvar_lancamento
from validator import validar_lancamento, SchemaValidationError
from services.parcelamento import expandir_lancamento_em_parcelas


# =========================================================
# Importador principal (Streamlit-safe)
# =========================================================
def importar_arquivo(
    arquivo_excel,   # UploadedFile
    projeto: str,
) -> dict:
    """
    Importa Excel manual padronizado via Streamlit.

    Fluxo CORRETO:
    - Parser
    - Expansão de parcelas (dívida + custo fixo)
    - Validação FINAL (por parcela)
    - Deduplicação
    - Persistência

    REGRA CRÍTICA:
    - PermissionError (arquivo aberto) SEMPRE sobe para o app
    """

    if arquivo_excel is None:
        raise ValueError("Arquivo não informado")

    # -----------------------------------------------------
    # Parser
    # -----------------------------------------------------
    lancamentos_base = parse_excel_manual(
        arquivo_excel=arquivo_excel,
        projeto=projeto,
    )

    inseridos = 0
    duplicados = 0
    erros = 0
    total_lidos = 0

    # -----------------------------------------------------
    # Processamento
    # -----------------------------------------------------
    for idx_base, lancamento_base in enumerate(lancamentos_base, start=1):
        try:
            # =====================================================
            # Expansão de parcelas + custo fixo
            # =====================================================
            lancamentos = expandir_lancamento_em_parcelas(
                lancamento_base
            )

            total_lidos += len(lancamentos)

            # =====================================================
            # Processamento de cada parcela/projeção
            # =====================================================
            for lancamento in lancamentos:
                try:
                    # Validação FINAL
                    validar_lancamento(lancamento)

                    # Hash determinístico
                    lancamento.hash_deduplicacao = (
                        gerar_hash_deduplicacao(lancamento)
                    )

                    salvo = salvar_lancamento(lancamento)

                    if salvo:
                        inseridos += 1
                    else:
                        duplicados += 1

                # 🔥 ERRO FATAL → SOBE
                except PermissionError:
                    raise

                except SchemaValidationError as e:
                    erros += 1
                    print(
                        f"Erro de validação "
                        f"(linha-base {idx_base}): {e}"
                    )

                except Exception as e:
                    erros += 1
                    print(
                        f"Erro inesperado ao salvar parcela "
                        f"(linha-base {idx_base}): {e}"
                    )

        # 🔥 ERRO FATAL → SOBE
        except PermissionError:
            raise

        except Exception as e:
            erros += 1
            print(
                f"Erro inesperado ao processar lançamento base "
                f"(linha-base {idx_base}): {e}"
            )

    return {
        "total_lidos": total_lidos,
        "inseridos": inseridos,
        "duplicados": duplicados,
        "erros": erros,
    }
