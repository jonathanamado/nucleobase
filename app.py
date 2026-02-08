import streamlit as st
from datetime import date
import pandas as pd
from io import BytesIO

from schema import LancamentoFinanceiro
from validator import validar_lancamento, SchemaValidationError
from repository_db import salvar_lancamento
from deduplicator import gerar_hash_deduplicacao

from project_repository import listar_projetos_ativos
from project_service import criar_projeto

from enums import (
    TipoOrigem,
    Natureza,
    FormaPagamento,
    MeioPagamento,
)

from csv_importer import importar_arquivo
from services.parcelamento import expandir_lancamento_em_parcelas


# =========================================================
# Configuração da página
# =========================================================
st.set_page_config(
    page_title="Projeto Financeiro",
    page_icon="💰",
    layout="centered",
)

st.markdown(
    """
    <style>
    /* 1. Alinhamento da coluna superior direita */
    [data-testid="stColumn"] > div {
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-end !important;
    }

    /* 2. Estilo EXCLUSIVO para o link SAIR (key: btn_logout) */
    .st-key-btn_logout {
        width: auto !important;
        margin-left: auto !important;
    }
    
    .st-key-btn_logout > button {
        background-color: transparent !important;
        color: #007bff !important;
        border: none !important;
        padding: 0px !important;
        width: auto !important;
        height: auto !important;
        text-decoration: underline !important;
        margin-top: 10px !important; /* Espaço de uma linha */
        display: block !important;
        min-height: 0px !important;
    }

    /* Fonte pequena apenas para o texto 'Sair' */
    .st-key-btn_logout > button p {
        font-size: 0.7rem !important;
        margin: 0 !important;
        line-height: 1 !important;
    }

    .st-key-btn_logout > button:hover {
        color: #0056b3 !important;
        text-decoration: none !important;
    }

    /* 3. Estilo para o botão SALVAR (key: btn_salvar) */
    .st-key-btn_salvar {
        margin-left: auto !important;
        width: auto !important;
    }
    
    .st-key-btn_salvar > button {
        padding: 0.5rem 2rem !important;
        font-size: 1rem !important;
    }
    </style>
    """,
    unsafe_allow_html=True
)

# --- CONTROLE DE ESTADO E LOGIN ---
if "user" not in st.session_state:
    st.subheader("Acesso ao Sistema")
    with st.form("login_form"):
        email = st.text_input("Email", placeholder="seu@email.com")
        senha = st.text_input("Senha", type="password")
        entrar = st.form_submit_button("Entrar", use_container_width=True)

        if entrar:
            from auth_service import fazer_login
            res = fazer_login(email, senha)
            if res:
                st.session_state.user = res.user
                st.success("Login realizado com sucesso!")
                st.rerun()
            else:
                st.error("Usuário ou senha incorretos.")
    st.stop() 

# =========================================================
# Identificação do Usuário e Logoff (Totalmente à Direita)
# =========================================================

col_vazia, col_user = st.columns([0.5, 0.5])

with col_user:
    # E-mail com fonte aumentada conforme solicitado (1rem)
    st.markdown(
        f"""
        <div style="text-align: right; font-size: 1rem; white-space: nowrap;">
            🔐 <b>{st.session_state.user.email}</b>
        </div>
        """,
        unsafe_allow_html=True
    )
    
    # Botão Sair com redirecionamento externo para nucleobase.vercel.app
    if st.button("Sair", key="btn_logout"):
        st.session_state.clear()
        # Redirecionamento instantâneo via Meta Refresh
        st.markdown(
            '<meta http-equiv="refresh" content="0;URL=\'https://nucleobase.vercel.app\'">',
            unsafe_allow_html=True
        )
        st.stop()

st.divider()

def obter_nome_usuario(user_id):
    # (Sua lógica de banco de dados aqui)
    pass

st.title("💰 Projeto Financeiro | Pessoal")
st.caption("Input rápido de despesas / receitas")

# =========================================================
# Projeto
# =========================================================
st.subheader("Seleção de Projeto e Modo de Entrada")

with st.expander("➕ Criar novo projeto"):
    nome_completo = st.text_input(
        "Nome completo do projeto / cliente",
        placeholder="Ex: Jonathan Santos",
    )

    if st.button("➕ Criar projeto", use_container_width=False):
        try:
            criar_projeto(
                nome_exibicao=nome_completo,
                nome_completo=nome_completo,
            )
            st.success("✔ Projeto criado com sucesso")
            st.rerun()
        except Exception as e:
            st.error(str(e))


projetos = listar_projetos_ativos()

if not projetos:
    st.warning("Nenhum projeto cadastrado.")
    st.stop()

mapa_label_para_slug = {p["label"]: p["slug"] for p in projetos}

# --- AJUSTE AQUI: Inicialização preventiva ---
projeto = None  

st.markdown("<br>", unsafe_allow_html=True)

projeto_label = st.selectbox(
    "Selecione o Projeto Financeiro",
    options=list(mapa_label_para_slug.keys()),
    index=None,
    placeholder="Selecione um projeto...",
)

st.markdown("<br>", unsafe_allow_html=True)

# --- AJUSTE AQUI: Atribuição segura + Gestão de Projeto ---
if projeto_label is not None:
    projeto = mapa_label_para_slug[projeto_label]
    
    # Adicionamos um expansor logo abaixo da seleção para gerenciar o projeto
    with st.expander(f"⚙️ Gerenciar Projeto: {projeto_label}"):
        st.warning("Arquivar um projeto o removerá desta lista, mas manterá os dados no banco.")
        
        # Botão de arquivamento
        if st.button(f"🚫 Arquivar '{projeto_label}'", use_container_width=True):
            from project_service import arquivar_projeto # Import local para evitar conflito
            try:
                arquivar_projeto(projeto)
                st.success("Projeto arquivado! Recarregando lista...")
                st.rerun()
            except Exception as e:
                st.error(f"Erro ao arquivar: {e}")
else:
    st.info("ℹ️ Selecione um projeto para continuar")
# ---------------------------------------------------------

# =========================================================
# Modo de entrada
# =========================================================
modo_input = st.radio(
    "Selecione o Modo de Entrada",
    [
        "Lançamento manual (Em tela)",
        "Importação via arquivo (XLSX)",
        "Integração por API (Em construção)",
    ],
)

if modo_input == "Integração por API (Em construção)":
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown(
        """
        <div style="
            background-color: #e8f2ff;
            border-left: 6px solid #1f77ff;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            color: #0b3c74;
            font-size: 15px;
        ">
            <strong>👷‍♂️🚧 Integração por API - Módulo em fase de construção 👷‍♂️🚧</strong>
            <br><br>
            Estamos trabalhando para liberar essa funcionalidade em breve.
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("<br><br>", unsafe_allow_html=True)


# =========================================================
# ===================== MODO MANUAL =======================
# =========================================================
if modo_input == "Lançamento manual (Em tela)":
    st.divider()
    st.subheader("Origem do lançamento")

    tipo_origem_label = st.radio(
        "Tipo de origem",
        options=[e.label for e in TipoOrigem],
    )

    tipo_origem = TipoOrigem.from_label(tipo_origem_label).value

    origem = st.text_input(
        "Origem (Banco / Instituição)",
        placeholder="Ex: Bradesco, C6, Nubank",
    )

    cartao_nome = None
    if tipo_origem == TipoOrigem.CARTAO.value:
        cartao_nome = st.text_input(
            "Nome do cartão",
            placeholder="Ex: C6 Platinum",
        )

    st.markdown("<br>", unsafe_allow_html=True)
    st.subheader("Dados do lançamento")

    data_competencia = st.date_input(
        "Data de competência",
        value=date.today(),
    )

    descricao = st.text_input(
        "Descrição",
        placeholder="Ex: Mercado, Uber, Padaria",
    )

    valor = st.number_input(
        "Valor",
        min_value=0.01,
        step=0.01,
        format="%.2f",
    )

    natureza_label = st.selectbox(
        "Natureza",
        options=[e.label for e in Natureza],
    )

    natureza = Natureza.from_label(natureza_label).value

    tipo_custo = st.radio(
        "Tipo de custo",
        options=["Fixo", "Variável"],
    )

    tipo_de_custo = "fixo" if tipo_custo == "Fixo" else "variavel"

    fixo_ate = None
    if tipo_de_custo == "fixo":
        fixo_ate = st.text_input(
            "Custo fixo válido até (YYYY-MM)",
            placeholder="Ex: 2026-12",
        )

    forma_pagamento = None
    meio_pagamento = None
    parcelas_total = None
    parcela_atual = None
    fatura_mes = None

    if tipo_origem == TipoOrigem.CARTAO.value:
        st.markdown("<br>", unsafe_allow_html=True)
        st.subheader("Pagamento (Cartão)")

        # 🔒 REGRA: custo fixo no cartão = parcelado obrigatório
        if tipo_de_custo == "fixo":
            st.info("ℹ️ Custos fixos no cartão devem ser parcelados")

            forma_pagamento = FormaPagamento.PARCELADO.value
            st.selectbox(
                "Forma de pagamento",
                options=[FormaPagamento.PARCELADO.label],
                disabled=True,
            )

            parcelas_total = st.number_input(
                "Total de parcelas",
                min_value=2,
                step=1,
            )
            parcela_atual = st.number_input(
                "Parcela atual",
                min_value=1,
                step=1,
            )

        else:
            forma_label = st.selectbox(
                "Forma de pagamento",
                options=[e.label for e in FormaPagamento],
            )
            forma_pagamento = FormaPagamento.from_label(forma_label).value

            if forma_pagamento == FormaPagamento.PARCELADO.value:
                parcelas_total = st.number_input(
                    "Total de parcelas",
                    min_value=2,
                    step=1,
                )
                parcela_atual = st.number_input(
                    "Parcela atual",
                    min_value=1,
                    step=1,
                )

        fatura_mes = st.text_input(
            "Fatura (YYYY-MM)",
            placeholder="Ex: 2026-01",
        )


    if tipo_origem == TipoOrigem.CONTA_CORRENTE.value:
        st.markdown("<br>", unsafe_allow_html=True)
        st.subheader("Pagamento (Conta corrente)")

        meio_label = st.selectbox(
            "Meio de pagamento",
            options=[e.label for e in MeioPagamento],
        )

        meio_pagamento = MeioPagamento.from_label(meio_label).value
        forma_pagamento = FormaPagamento.AVISTA.value

    st.divider()
    st.markdown("<br>", unsafe_allow_html=True)

    # --- INÍCIO DO BLOCO SUBSTITUÍDO ---
    if st.button("💾 Salvar lançamento", use_container_width=True):
        # 1. Validação Visual Preventiva (Evita erros de 'nan' ou vazio no schema)
        if not descricao or descricao.strip() == "":
            st.error("❌ O campo 'Descrição' é obrigatório.")
            st.stop()
        
        if projeto is None:
            st.error("❌ Selecione um projeto antes de salvar.")
            st.stop()

        try:
            # 2. Montagem do objeto com limpeza de strings (.strip())
            lancamento_base = LancamentoFinanceiro(
                projeto=projeto,
                tipo_origem=tipo_origem,
                origem=origem.strip() if origem else "Não informado",
                cartao_nome=cartao_nome.strip() if cartao_nome else None,
                data_competencia=data_competencia,
                descricao=descricao.strip(),  # <--- CRÍTICO: Garante que não vá vazio
                valor=valor,
                natureza=natureza,
                tipo_de_custo=tipo_de_custo,
                fixo_ate=fixo_ate,
                forma_pagamento=forma_pagamento,
                meio_pagamento=meio_pagamento,
                parcelas_total=parcelas_total,
                parcela_atual=parcela_atual,
                fatura_mes=fatura_mes,
                origem_input="manual",
            )

            # 3. Validação lógica via schema/validator
            validar_lancamento(lancamento_base)
            
            # 4. Processamento de parcelas
            lancamentos = expandir_lancamento_em_parcelas(lancamento_base)

            inseridos = 0
            duplicados = 0
            erros = 0

            for lancamento in lancamentos:
                try:
                    # Tenta salvar no banco (repository_db.py)
                    salvo = salvar_lancamento(lancamento)

                    if salvo:
                        inseridos += 1
                    else:
                        duplicados += 1

                except Exception as e:
                    erros += 1
                    st.error(f"Erro ao salvar parcela individual: {e}")

            # 5. Feedback para o usuário
            if inseridos:
                st.success(f"✔ {inseridos} lançamentos inseridos com sucesso")

            if duplicados:
                st.warning(f"⚠ {duplicados} lançamentos ignorados (já existem no banco)")

            if erros:
                st.error(f"❌ {erros} lançamentos apresentaram erro técnico")

        except SchemaValidationError as e:
            # Captura o erro que você estava recebendo anteriormente
            st.error(f"❌ Dados inválidos detectados pelo validador: {e}")

        except Exception as e:
            st.error(f"Erro inesperado no processamento: {e}")
    # --- FIM DO BLOCO SUBSTITUÍDO ---


# =========================================================
# ================= IMPORTAR ARQUIVO ======================
# =========================================================
st.markdown("<br>", unsafe_allow_html=True)

if modo_input == "Importação via arquivo (XLSX)":
    st.subheader("📂 Importação de arquivo (Cartão de Crédito)")

    st.markdown(
        """
        Para realizar a importação, seu arquivo deve conter **exatamente**
        as colunas abaixo. Cada linha representa **uma compra**. Baixe o **modelo Excel**,
        preencha-o e importe-o para visualização dos dados consolidados.
        """
    )

    df_modelo = pd.DataFrame(
        [
            {
                "banco": "C6 Bank",
                "nome_cartao": "Platinum",
                "fatura_mes": "Janeiro/2026",
                "data_compra": "23/09/2025",
                "descricao": "VIDRACARIA AMADOS",
                "valor": 500,
                "natureza": "Despesa",
                "parcelamento_compra": "sim",
                "parcela_atual": 1,
                "parcelas_totais": 4,
                "tipo_de_custo": "variavel",
            }
        ]
    )

    # Preview do modelo
    st.dataframe(df_modelo, use_container_width=True)

    from io import BytesIO

    buffer = BytesIO()

    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df_modelo.to_excel(
            writer,
            index=False,
            sheet_name="modelo_importacao"
        )

    buffer.seek(0)

    st.download_button(
        label="⬇️ Baixar modelo Excel (.xlsx)",
        data=buffer,
        file_name="modelo_importacao_cartao.xlsx",
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    st.markdown("<br>", unsafe_allow_html=True)

    arquivo_excel = st.file_uploader(
        "Selecione o arquivo Excel (.xlsx ou .xls)",
        type=["xlsx", "xls"],
    )

    if arquivo_excel:
        try:
            resultado = importar_arquivo(
                arquivo_excel=arquivo_excel,
                projeto=projeto,
            )

            st.success(f"{resultado['inseridos']} lançamentos importados")
            st.warning(f"{resultado['duplicados']} duplicados ignorados")
            st.info(f"Total lidos: {resultado['total_lidos']}")

        except Exception as e:
            st.error(f"Erro na importação: {e}")
