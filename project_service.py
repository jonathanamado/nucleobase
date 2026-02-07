import os
import re
import unicodedata
from project_repository import (
    obter_projeto_por_slug,
    adicionar_projeto,
    desativar_projeto
)

# Mantemos o BASE_DIR para o caso de você ainda querer criar as pastas físicas de backup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class ProjectServiceError(Exception):
    pass

def _normalizar_slug(nome: str) -> str:
    """Gera slug canônico para ser usado como ID no banco e nome de pasta."""
    texto = nome.strip().lower()
    # Remove acentos
    texto = unicodedata.normalize("NFKD", texto)
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    # Remove caracteres especiais, mantém hífens e espaços
    texto = re.sub(r"[^a-z0-9\s-]", "", texto)
    # Transforma espaços em hífens e remove hífens duplos
    texto = re.sub(r"\s+", "-", texto)
    texto = re.sub(r"-+", "-", texto)
    return texto.strip("-")

def criar_projeto(
    nome_exibicao: str,
    nome_completo: str | None = None,
) -> dict:
    """
    Cria um novo projeto financeiro no banco de dados e cria a pasta física de backup.
    """
    if not nome_exibicao or not nome_exibicao.strip():
        raise ProjectServiceError("Nome do projeto é obrigatório.")

    slug = _normalizar_slug(nome_exibicao)

    # 1. Verifica se o slug já existe no Supabase (evita erro de Unique Key)
    if obter_projeto_por_slug(slug):
        raise ProjectServiceError(
            f"Já existe um projeto cadastrado com o identificador '{slug}'."
        )

    # 2. Criação da pasta física (Backup/Documentos)
    folder = slug
    caminho_pasta = os.path.join(BASE_DIR, "projetos", folder)
    
    if not os.path.exists(caminho_pasta):
        os.makedirs(caminho_pasta, exist_ok=True)

    # 3. Estrutura do objeto para o Supabase
    # Nota: Removi campos que podem não existir na sua tabela SQL simplificada
    projeto = {
        "slug": slug,
        "label": nome_exibicao.strip(),
        "ativo": True,
    }

    # 4. Persistência no Supabase via project_repository
    try:
        adicionar_projeto(projeto)
    except Exception as e:
        raise ProjectServiceError(f"Erro ao salvar projeto no banco: {str(e)}")

    return projeto

def arquivar_projeto(slug: str) -> None:
    """Regra de negócio para desativar um projeto."""
    if not slug:
        raise ProjectServiceError("Identificador do projeto não informado.")
    
    if not obter_projeto_por_slug(slug):
        raise ProjectServiceError("Projeto não encontrado.")
        
    # Agora o Python encontrará esta função pois você a importou no topo
    desativar_projeto(slug)
    
    # Verifica se o projeto existe antes de tentar desativar
    if not obter_projeto_por_slug(slug):
        raise ProjectServiceError("Projeto não encontrado.")
        
    desativar_projeto(slug)
