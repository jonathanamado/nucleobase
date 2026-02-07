import streamlit as st
import psycopg2
from psycopg2 import errors
from deduplicator import gerar_hash_deduplicacao

# =========================
# Conexão com o banco
# =========================
def get_conn():
    return psycopg2.connect(
        host=st.secrets["database"]["host"],
        database=st.secrets["database"]["dbname"],
        user=st.secrets["database"]["user"],
        password=st.secrets["database"]["password"],
        port=st.secrets["database"]["port"],
        connect_timeout=30,
        sslmode="require"
    )

# =========================
# Persistência
# =========================
def salvar_lancamento(lancamento):
    # 🔒 SEGURANÇA: Obtém o ID do usuário logado na sessão
    if "user" not in st.session_state:
        raise PermissionError("Usuário não autenticado para realizar lançamentos.")
    
    user_id = st.session_state.user.id
    
    conn = get_conn()
    cur = conn.cursor()

    hash_deduplicacao = gerar_hash_deduplicacao(lancamento)
    
    # TRATAMENTO DE DATA: Transforma "YYYY-MM" em "YYYY-MM-01" para o Postgres DATE
    fixo_ate_valido = lancamento.fixo_ate
    if fixo_ate_valido and len(str(fixo_ate_valido)) == 7:
        fixo_ate_valido = f"{fixo_ate_valido}-01"

    try:
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
                user_id  -- 🔒 Nova coluna de segurança
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
                user_id, # 🔒 Vincula o dado ao usuário
            ),
        )

        conn.commit()
        return True, None

    except errors.UniqueViolation:
        conn.rollback()
        return False, "duplicado"

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        cur.close()
        conn.close()
