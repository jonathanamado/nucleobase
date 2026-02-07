from supabase import create_client

# 🔐 Dados do Supabase
SUPABASE_URL = "https://ayxwgqsowewwiurncaux.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eHdncXNvd2V3d2l1cm5jYXV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQwOTI1NiwiZXhwIjoyMDg1OTg1MjU2fQ.2rwHBR7vi0CjcB-WumBCWL-BzkZuokvCPnukhxb9czY"

# 🔌 Conexão
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 🧪 Teste simples
def teste_conexao():
    resposta = supabase.table("lancamentos").select("id").limit(1).execute()
    print("Conexão OK 🎉")
    print("Resposta:", resposta)

if __name__ == "__main__":
    teste_conexao()
