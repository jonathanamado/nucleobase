import os
import re
import unicodedata

from project_repository import (
    obter_projeto_por_slug,
    adicionar_projeto,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class ProjectServiceError(Exception):
    pass


def _normalizar_slug(nome: str) -> str:
    """
    Gera slug canônico:
    - minúsculo
    - sem acentos
    - espaços → hífen
    - somente [a-z0-9-]
    """
    texto = nome.strip().lower()
    texto = unicodedata.normalize("NFKD", texto)
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    texto = re.sub(r"[^a-z0-9\s-]", "", texto)
    texto = re.sub(r"\s+", "-", texto)

    return texto


def criar_projeto(
    nome_exibicao: str,
    nome_completo: str | None = None,
) -> dict:
    """
    Cria um novo projeto financeiro.
    """

    if not nome_exibicao or not nome_exibicao.strip():
        raise ProjectServiceError("Nome do projeto é obrigatório.")

    slug = _normalizar_slug(nome_exibicao)

    if obter_projeto_por_slug(slug):
        raise ProjectServiceError(
            f"Já existe um projeto com o nome '{nome_exibicao}'."
        )

    # pasta física = slug
    caminho_pasta = os.path.join(BASE_DIR, "projetos", slug)
    os.makedirs(caminho_pasta, exist_ok=False)

    projeto = {
        "slug": slug,
        "label": nome_exibicao,
        "nome_completo": nome_completo or nome_exibicao,
        "folder": slug,
        "ativo": True,
    }

    adicionar_projeto(projeto)

    return projeto
    """
    Cria um novo projeto financeiro.

    Retorna o objeto do projeto criado.
    """

    if not nome_exibicao or not nome_exibicao.strip():
        raise ProjectServiceError("Nome do projeto é obrigatório.")

    slug = _normalizar_slug(nome_exibicao)

    if obter_projeto_por_slug(slug):
        raise ProjectServiceError(
            f"Já existe um projeto com o nome '{nome_exibicao}'."
        )

    folder = f"{slug}"

    # Criação da pasta física
    caminho_pasta = os.path.join(BASE_DIR, "projetos", folder)
    os.makedirs(caminho_pasta, exist_ok=False)

    projeto = {
        "slug": slug,
        "label": nome_exibicao,
        "nome_completo": nome_completo or nome_exibicao,
        "folder": folder,
        "ativo": True,
    }

    adicionar_projeto(projeto)

    return projeto
