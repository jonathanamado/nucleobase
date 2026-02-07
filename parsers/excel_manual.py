import pandas as pd
import re

from schema import LancamentoFinanceiro
from enums import (
    TipoOrigem,
    FormaPagamento,
)


# =========================================================
# Helpers seguros
# =========================================================
def parse_optional_int(valor):
    if valor is None or pd.isna(valor):
        return None
    try:
        return int(valor)
    except (ValueError, TypeError):
        return None


def parse_float(valor, idx):
    if pd.isna(valor):
        raise ValueError(f"Linha {idx}: valor vazio")

    valor_str = str(valor).strip().replace(",", ".")
    try:
        return float(valor_str)
    except ValueError:
        raise ValueError(f"Linha {idx}: valor inválido ({valor})")


def normalizar_fatura_mes(valor, idx):
    """
    Aceita: Janeiro/2026, 01/2026, 2026-01
    Retorna: YYYY-MM
    """
    if pd.isna(valor):
        raise ValueError(f"Linha {idx}: fatura_mes vazio")

    texto = str(valor).strip().lower()

    if re.match(r"^\d{4}-\d{2}$", texto):
        return texto

    mapa_meses = {
        "janeiro": "01", "fevereiro": "02", "março": "03", "marco": "03",
        "abril": "04", "maio": "05", "junho": "06", "julho": "07",
        "agosto": "08", "setembro": "09", "outubro": "10", "novembro": "11",
        "dezembro": "12",
    }

    if "/" in texto:
        try:
            parte_mes, parte_ano = texto.split("/", 1)
            parte_mes = parte_mes.strip()
            parte_ano = parte_ano.strip()

            if parte_mes in mapa_meses:
                return f"{parte_ano}-{mapa_meses[parte_mes]}"

            if parte_mes.isdigit():
                return f"{parte_ano}-{parte_mes.zfill(2)}"
        except ValueError:
            pass

    raise ValueError(f"Linha {idx}: fatura_mes inválido ({valor})")


# =========================================================
# Parser Excel manual (APENAS CARTÃO)
# =========================================================
def parse_excel_manual(arquivo_excel, projeto: str) -> list[LancamentoFinanceiro]:

    if arquivo_excel is None:
        raise ValueError("Arquivo Excel não informado")

    # Lê o arquivo e remove linhas totalmente vazias que podem vir do Excel
    df = pd.read_excel(arquivo_excel)
    df = df.dropna(how='all') 
    
    df.columns = df.columns.str.strip().str.lower()

    colunas_obrigatorias = [
        "banco", "nome_cartao", "data_compra", "descricao", 
        "valor", "parcelamento_compra", "parcela_atual", 
        "parcelas_totais", "fatura_mes", "natureza"
    ]

    faltantes = set(colunas_obrigatorias) - set(df.columns)
    if faltantes:
        raise ValueError(f"Colunas ausentes no Excel: {faltantes}")

    lancamentos = []

    for idx, row in df.iterrows():
        # Ajuste de índice para o usuário (Excel começa na linha 2 após cabeçalho)
        linha_excel = idx + 2 

        # -------------------------
        # Descrição (CORREÇÃO DO ERRO)
        # -------------------------
        desc_raw = row["descricao"]
        if pd.isna(desc_raw) or str(desc_raw).strip().lower() in ["nan", ""]:
            raise ValueError(f"Linha {linha_excel}: O campo 'descricao' é obrigatório e está vazio.")
        
        descricao_final = str(desc_raw).strip()

        # -------------------------
        # Data
        # -------------------------
        if pd.isna(row["data_compra"]):
            raise ValueError(f"Linha {linha_excel}: data_compra vazia")

        data_compra = pd.to_datetime(
            row["data_compra"], dayfirst=True, errors="raise"
        ).date()

        # -------------------------
        # Valor
        # -------------------------
        valor = parse_float(row["valor"], linha_excel)
        if valor <= 0:
            raise ValueError(f"Linha {linha_excel}: valor deve ser maior que zero")

        # -------------------------
        # Natureza
        # -------------------------
        natureza_raw = row["natureza"]
        if pd.isna(natureza_raw):
            raise ValueError(f"Linha {linha_excel}: natureza vazia")
        natureza = str(natureza_raw).strip().lower()

        # -------------------------
        # Parcelamento
        # -------------------------
        parcelamento_raw = str(row["parcelamento_compra"]).strip().lower()
        parcelado = parcelamento_raw in ["sim", "s", "yes", "y"]

        parcelas_total = parse_optional_int(row["parcelas_totais"])
        parcela_atual = parse_optional_int(row["parcela_atual"])

        if not parcelado:
            parcelas_total = None
            parcela_atual = None

        forma_pagamento = (
            FormaPagamento.PARCELADO.value
            if parcelado
            else FormaPagamento.AVISTA.value
        )

        # -------------------------
        # Fatura (cartão)
        # -------------------------
        fatura_mes = normalizar_fatura_mes(row["fatura_mes"], linha_excel)

        # -------------------------
        # Criação do lançamento
        # -------------------------
        lancamento = LancamentoFinanceiro(
            projeto=projeto,
            tipo_origem=TipoOrigem.CARTAO.value,
            origem=str(row["banco"]).strip() if pd.notna(row["banco"]) else "Não Informado",
            cartao_nome=str(row["nome_cartao"]).strip() if pd.notna(row["nome_cartao"]) else None,
            data_competencia=data_compra,
            descricao=descricao_final,
            valor=valor,
            natureza=natureza,
            tipo_de_custo=None,
            forma_pagamento=forma_pagamento,
            parcelas_total=parcelas_total,
            parcela_atual=parcela_atual,
            fatura_mes=fatura_mes,
            origem_input="excel_manual",
        )

        lancamentos.append(lancamento)

    return lancamentos
