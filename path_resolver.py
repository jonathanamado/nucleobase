import os
from project_repository import obter_projeto_por_slug

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def obter_caminho_excel(
    projeto: str,
    tipo_origem: str
) -> str:
    projeto_data = obter_projeto_por_slug(projeto)

    if not projeto_data:
        raise ValueError(f"Projeto inválido: {projeto}")

    if tipo_origem == "cartao":
        nome_arquivo = "acumulado_cartoes.xlsx"
    elif tipo_origem == "conta_corrente":
        nome_arquivo = "acumulado_contas_corrente.xlsx"
    else:
        raise ValueError("tipo_origem inválido")

    caminho = os.path.join(
        BASE_DIR,
        "projetos",
        projeto_data["folder"],
        nome_arquivo
    )

    os.makedirs(os.path.dirname(caminho), exist_ok=True)

    return caminho
