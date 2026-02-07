import streamlit as st
from supabase import create_client, Client

# Inicializa o cliente Supabase usando as chaves do bloco [supabase] do secrets.toml
# Certifique-se que no secrets está: [supabase] url = "..." e key = "..."
url: str = st.secrets["supabase"]["url"]
key: str = st.secrets["supabase"]["key"]
supabase: Client = create_client(url, key)

def fazer_login(email, password):
    """
    Realiza a autenticação do usuário no Supabase Auth.
    Retorna o objeto da sessão em caso de sucesso.
    """
    try:
        # O método sign_in_with_password valida o e-mail e senha no Supabase
        response = supabase.auth.sign_in_with_password({
            "email": email, 
            "password": password
        })
        return response
    except Exception as e:
        # Erros comuns: "Invalid login credentials" ou e-mail não confirmado
        st.error(f"Erro na autenticação: {e}")
        return None

def fazer_logout():
    """
    Encerra a sessão no Supabase e limpa o estado do Streamlit.
    """
    try:
        supabase.auth.sign_out()
        # Remove o usuário da sessão do Streamlit para forçar a tela de login
        if "user" in st.session_state:
            del st.session_state["user"]
        st.rerun()
    except Exception as e:
        st.error(f"Erro ao sair: {e}")
