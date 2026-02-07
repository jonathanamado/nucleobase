import psycopg2

conn = psycopg2.connect(
    host="db.ayxwgqsowewwiurncaux.supabase.co",
    database="postgres",
    user="postgres",
    password="SUA_SENHA",
    port=5432,
    connect_timeout=5,
)

cur = conn.cursor()
cur.execute("SELECT 1;")
print(cur.fetchone())

cur.close()
conn.close()