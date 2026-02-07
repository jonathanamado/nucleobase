import os
from typing import List, Dict
import streamlit as st
import psycopg2

# Importamos a conexão centralizada para manter o padrão do projeto
from repository_db import get_conn

def obter_projeto_por_slug(slug: str) -> Dict | None:
    """Busca um projeto específico no Supabase pelo slug e pelo dono."""
    user_id = st.session_state.user.id
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT label, slug, ativo FROM projetos WHERE slug = %s AND user_id = %s", 
            (slug, user_id)
        )
        row = cur.fetchone()
        if row:
            return {
                "label": row[0],
                "slug": row[1],
                "ativo": row[2]
            }
        return None
    finally:
        cur.close()
        conn.close()

def slug_existe(slug: str) -> bool:
    """Verifica se um slug já está cadastrado para o usuário logado."""
    return obter_projeto_por_slug(slug) is not None

def listar_projetos_ativos() -> List[Dict]:
    """Lista apenas os projetos do usuário logado."""
    user_id = st.session_state.user.id
    conn = get_conn()
    cur = conn.cursor()
    try:
        # 🔒 Filtro de user_id adicionado
        cur.execute(
            "SELECT label, slug FROM projetos WHERE ativo = TRUE AND user_id = %s ORDER BY label",
            (user_id,)
        )
        rows = cur.fetchall()
        return [{"label": r[0], "slug": r[1]} for r in rows]
    finally:
        cur.close()
        conn.close()

def adicionar_projeto(projeto: Dict) -> None:
    """Insere um novo projeto vinculado ao usuário logado."""
    user_id = st.session_state.user.id
    conn = get_conn()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            INSERT INTO projetos (label, slug, ativo, user_id)
            VALUES (%s, %s, %s, %s)
            """,
            (
                projeto["label"],
                projeto["slug"],
                projeto.get("ativo", True),
                user_id # 🔒 Registro vinculado ao dono
            )
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

def desativar_projeto(slug: str) -> None:
    """Muda o status do projeto para inativo (apenas se pertencer ao usuário)."""
    user_id = st.session_state.user.id
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE projetos SET ativo = FALSE WHERE slug = %s AND user_id = %s",
            (slug, user_id)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()
