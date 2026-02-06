import json
import os
from typing import List, Dict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
PROJECTS_FILE = os.path.join(DATA_DIR, "projects.json")


def _garantir_estrutura():
    os.makedirs(DATA_DIR, exist_ok=True)

    if not os.path.exists(PROJECTS_FILE):
        with open(PROJECTS_FILE, "w", encoding="utf-8") as f:
            json.dump({"projects": []}, f, ensure_ascii=False, indent=2)


def carregar_projetos() -> List[Dict]:
    _garantir_estrutura()

    with open(PROJECTS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    return data.get("projects", [])


def salvar_projetos(projetos: List[Dict]) -> None:
    _garantir_estrutura()

    with open(PROJECTS_FILE, "w", encoding="utf-8") as f:
        json.dump(
            {"projects": projetos},
            f,
            ensure_ascii=False,
            indent=2
        )


def obter_projeto_por_slug(slug: str) -> Dict | None:
    projetos = carregar_projetos()
    return next((p for p in projetos if p["slug"] == slug), None)


def slug_existe(slug: str) -> bool:
    return obter_projeto_por_slug(slug) is not None


def listar_projetos_ativos() -> List[Dict]:
    projetos = carregar_projetos()
    return [p for p in projetos if p.get("ativo", True)]


def adicionar_projeto(projeto: Dict) -> None:
    projetos = carregar_projetos()

    if slug_existe(projeto["slug"]):
        raise ValueError(f"Projeto já existe: {projeto['slug']}")

    projetos.append(projeto)
    salvar_projetos(projetos)
