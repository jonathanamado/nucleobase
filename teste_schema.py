from datetime import date
from schema import LancamentoFinanceiro
from validator import validar_lancamento

l = LancamentoFinanceiro(
    projeto="jonathan",
    tipo_origem="conta_corrente",
    origem="Bradesco",
    data_competencia=date.today(),
    descricao="Padaria",
    valor=18.50,
    natureza="despesa",
    forma_pagamento="À vista",
    origem_input="importacao_manual"
)

print(validar_lancamento(l))
