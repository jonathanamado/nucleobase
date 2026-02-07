import streamlit as st
import psycopg2

st.title("Teste de Conexão com Supabase")

try:
    conn = psycopg2.connect(
        host=st.secrets["database"]["host"],
        dbname=st.secrets["database"]["dbname"],
        user=st.secrets["database"]["user"],
        password=st.secrets["database"]["password"],
        port=st.secrets["database"]["port"],
    )

    cur = conn.cursor()
    cur.execute("select now();")
    result = cur.fetchone()

    st.success("Conexão OK 🎉")
    st.write("Horário do banco:", result[0])

    cur.close()
    conn.close()

except Exception as e:
    st.error("Erro ao conectar no banco")
    st.exception(e)
