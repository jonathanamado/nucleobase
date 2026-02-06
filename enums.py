from enum import Enum


# =========================================================
# Base
# =========================================================
class BaseEnum(Enum):
    @property
    def label(self) -> str:
        raise NotImplementedError

    @classmethod
    def from_label(cls, label):
        """
        Usado para labels amigáveis (UI / exibição)
        Ex: "Despesa", "Receita"
        """
        if isinstance(label, tuple):
            label = label[0]

        if not isinstance(label, str):
            raise TypeError(
                f"Label inválido para {cls.__name__}: {label} ({type(label)})"
            )

        label = label.strip()

        for item in cls:
            if item.label == label:
                return item

        raise ValueError(f"Label inválido para {cls.__name__}: {label}")

    @classmethod
    def from_value(cls, value):
        """
        Usado para valores lógicos vindos de Excel / CSV / backend
        Ex: "despesa", "receita"
        """
        if isinstance(value, tuple):
            value = value[0]

        if not isinstance(value, str):
            raise TypeError(
                f"Value inválido para {cls.__name__}: {value} ({type(value)})"
            )

        value = value.strip().lower()

        for item in cls:
            if item.value == value:
                return item

        raise ValueError(f"Value inválido para {cls.__name__}: {value}")


# =========================================================
# Banco
# =========================================================
class Banco(BaseEnum):
    C6 = "c6"
    BRADESCO = "bradesco"
    NUBANK = "nubank"
    MERCADO_LIVRE = "mercado_livre"
    CAIXA = "caixa"

    @property
    def label(self):
        return {
            "c6": "C6 Bank",
            "bradesco": "Bradesco",
            "nubank": "Nubank",
            "mercado_livre": "Mercado Livre",
            "caixa": "Caixa Econômica Federal",
        }[self.value]


# =========================================================
# Tipo de origem
# =========================================================
class TipoOrigem(BaseEnum):
    CARTAO = "cartao"
    CONTA_CORRENTE = "conta_corrente"

    @property
    def label(self):
        return {
            "cartao": "Cartão de crédito",
            "conta_corrente": "Conta corrente",
        }[self.value]


# =========================================================
# Natureza
# =========================================================
class Natureza(BaseEnum):
    DESPESA = "despesa"
    RECEITA = "receita"

    @property
    def label(self):
        return {
            "despesa": "Despesa",
            "receita": "Receita",
        }[self.value]


# =========================================================
# Forma de pagamento (cartão)
# =========================================================
class FormaPagamento(BaseEnum):
    AVISTA = "avista"
    PARCELADO = "parcelado"

    @property
    def label(self):
        return {
            "avista": "Crédito à vista",
            "parcelado": "Crédito parcelado",
        }[self.value]


# =========================================================
# Meio de pagamento (conta corrente)
# =========================================================
class MeioPagamento(BaseEnum):
    PIX = "pix"
    BOLETO = "boleto"
    TRANSFERENCIA = "transferencia"
    DEBITO = "debito"

    @property
    def label(self):
        return {
            "pix": "Pix",
            "boleto": "Boleto",
            "transferencia": "Transferência",
            "debito": "Débito",
        }[self.value]
