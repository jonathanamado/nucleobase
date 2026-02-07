import streamlit as st
import psycopg2
from psycopg2 import errors
from deduplicator import gerar_hash_deduplicacao

# =========================
# Conexão com o banco
# =========================
def get_conn():
    """
    Estabelece conexão com o Supabase via Pooler (IPv4),
    compatível com Streamlit Cloud e SSL obrigatório.
    """

    try:
        db = st.secrets["database"]

        return psycopg2.connect(
            host=db["host"],
            port=db["port"],
            dbname=db["dbname"],
            user=db["user"],
            password=db["password"],
            sslmode="require",
            connect_timeout=10,
        )

    except KeyError as e:
        st.error(f"❌ Chave ausente em st.secrets['database']: {e}")
        st.stop()

    except Exception as e:
        st.error("❌ Falha ao conectar ao banco de dados")
        st.exception(e)
        st.stop()


# =========================
# Persistência
# =========================
def salvar_lancamento(lancamento):
    # 🔒 Segurança: exige usuário autenticado
    if "user" not in st.session_state or not st.session_state.user:
        raise PermissionError("Usuário não autenticado para realizar lançamentos.")

    user_id = st.session_state.user.id
    hash_deduplicacao = gerar_hash_deduplicacao(lancamento)

    # Tratamento de data: YYYY-MM → YYYY-MM-01
    fixo_ate_valido = lancamento.fixo_ate
    if fixo_ate_valido and len(str(fixo_ate_valido)) == 7:
        fixo_ate_valido = f"{fixo_ate_valido}-01"

    conn = get_conn()

    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO lancamentos (
                    projeto,
                    tipo_origem,
                    origem,
                    cartao_nome,
                    data_competencia,
                    descricao,
                    valor,
                    natureza,
                    tipo_de_custo,
                    fixo_ate,
                    forma_pagamento,
                    meio_pagamento,
                    parcelas_total,
                    parcela_atual,
                    fatura_mes,
                    origem_input,
                    hash_deduplicacao,
                    user_id
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    lancamento.projeto,
                    lancamento.tipo_origem,
                    lancamento.origem,
                    lancamento.cartao_nome,
                    lancamento.data_competencia,
                    lancamento.descricao,
                    lancamento.valor,
                    lancamento.natureza,
                    lancamento.tipo_de_custo,
                    fixo_ate_valido,
                    lancamento.forma_pagamento,
                    lancamento.meio_pagamento,
                    lancamento.parcelas_total,
                    lancamento.parcela_atual,
                    lancamento.fatura_mes,
                    lancamento.origem_input,
                    hash_deduplicacao,
                    user_id,
                ),
            )

        conn.commit()
        return True, None

    except errors.UniqueViolation:
        conn.rollback()
        return False, "duplicado"

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()
