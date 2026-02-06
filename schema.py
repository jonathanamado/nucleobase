from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional
import uuid

from enums import Natureza, TipoOrigem


@dataclass
class LancamentoFinanceiro:
    # =========================================================
    # Identificação
    # =========================================================
    id_lancamento: str = field(default_factory=lambda: str(uuid.uuid4()))
    projeto: str = ""

    # =========================================================
    # Origem
    # =========================================================
    tipo_origem: str = ""           # cartao | conta_corrente
    origem: str = ""
    cartao_nome: Optional[str] = None

    # =========================================================
    # Datas
    # =========================================================
    data_competencia: Optional[date] = None

    # 🔥 Cartão usa fatura real | Conta corrente recebe fallback automático
    fatura_mes: Optional[str] = None

    # =========================================================
    # Descrição e valor
    # =========================================================
    descricao: str = ""
    valor: float = 0.0
    natureza: str = ""              # despesa | receita

    # =========================================================
    # Pagamentos
    # =========================================================
    forma_pagamento: Optional[str] = None   # SOMENTE cartão
    meio_pagamento: Optional[str] = None    # SOMENTE conta corrente

    # =========================================================
    # Parcelamento
    # =========================================================
    parcelas_total: Optional[int] = None
    parcela_atual: Optional[int] = None

    # =========================================================
    # Classificação
    # =========================================================
    categoria: Optional[str] = None
    subcategoria: Optional[str] = None
    tags: Optional[str] = None

    # =========================================================
    # 🔥 Tipo de custo (REGRA D)
    # =========================================================
    tipo_de_custo: Optional[str] = None     # fixo | variavel
    fixo_ate: Optional[str] = None          # YYYY-MM (quando fixo)

    # =========================================================
    # Metadados
    # =========================================================
    origem_input: str = ""           # manual | csv | importacao
    hash_origem: Optional[str] = None
    observacoes: Optional[str] = None
    ativo: bool = True

    # =========================================================
    # Controle de projeção
    # =========================================================
    is_projecao: bool = False

    timestamp_insercao: datetime = field(default_factory=datetime.now)

    # =========================================================
    # Normalização pós-criação
    # =========================================================
    def __post_init__(self):

        # -------------------------
        # Normaliza tipo_origem
        # -------------------------
        if self.tipo_origem:
            self.tipo_origem = self.tipo_origem.strip().lower()

        # -------------------------
        # Normaliza natureza
        # -------------------------
        if self.natureza:
            if isinstance(self.natureza, Natureza):
                self.natureza = self.natureza.value
            elif isinstance(self.natureza, str):
                self.natureza = Natureza(self.natureza.lower()).value
            else:
                raise TypeError(
                    f"Tipo inválido para natureza: {type(self.natureza)}"
                )

        # -------------------------
        # Normalização de strings
        # -------------------------
        if self.forma_pagamento:
            self.forma_pagamento = self.forma_pagamento.strip().lower()

        if self.meio_pagamento:
            self.meio_pagamento = self.meio_pagamento.strip().lower()

        if self.cartao_nome:
            self.cartao_nome = self.cartao_nome.strip()

        if self.tipo_de_custo:
            self.tipo_de_custo = self.tipo_de_custo.strip().lower()

        if self.fixo_ate:
            self.fixo_ate = self.fixo_ate.strip()

        # =====================================================
        # 🔥 REGRA DE OURO DA SUA ARQUITETURA
        # =====================================================
        # Conta corrente NÃO tem fatura → usa data_competencia
        # =====================================================
        if self.tipo_origem == TipoOrigem.CONTA_CORRENTE.value:
            if self.data_competencia:
                self.fatura_mes = self.data_competencia.strftime("%Y-%m")
            else:
                self.fatura_mes = None
