/**
 * Serviço de Inteligência Financeira
 * Trata a expansão de registros para Cartão de Crédito (Parcelas)
 * e Custos Fixos (Recorrência por data).
 */

export function expandirLancamentos(base: any) {
  const lancamentos = [];
  const dataInicio = new Date(base.data_competencia + 'T00:00:00');

  // PRIORIDADE 1: RECORRÊNCIA DE CUSTO FIXO
  // No custo fixo, o valor é integral em cada mês (ex: Aluguel R$ 1000 todo mês)
  if (base.tipo_de_custo === 'Fixo' && base.fixo_ate) {
    const dataFim = new Date(base.fixo_ate + 'T00:00:00');
    let dataAtual = new Date(dataInicio);
    let contadorRecorrencia = 1;

    while (dataAtual <= dataFim) {
      lancamentos.push({
        ...base,
        valor: base.valor, // Valor cheio em cada mês
        data_competencia: dataAtual.toISOString().split('T')[0],
        parcela_atual: contadorRecorrencia,
        parcelas_total: 1
      });

      dataAtual.setMonth(dataAtual.getMonth() + 1);
      contadorRecorrencia++;
      if (contadorRecorrencia > 120) break; 
    }
    return lancamentos;
  }

  // PRIORIDADE 2: PARCELAMENTO DE CARTÃO
  // Aqui dividimos o valor total pelo número de parcelas
  if (base.parcelas_total > 1) {
    const valorParcelaBase = Math.floor((base.valor / base.parcelas_total) * 100) / 100;
    const diferencaArredondamento = parseFloat((base.valor - (valorParcelaBase * base.parcelas_total)).toFixed(2));

    for (let i = 0; i < base.parcelas_total; i++) {
      const dataParcela = new Date(dataInicio);
      dataParcela.setMonth(dataInicio.getMonth() + i);

      // Se for a última parcela, adiciona a diferença do arredondamento
      const valorFinalParcela = (i === base.parcelas_total - 1) 
        ? (valorParcelaBase + diferencaArredondamento) 
        : valorParcelaBase;

      lancamentos.push({
        ...base,
        valor: valorFinalParcela,
        data_competencia: dataParcela.toISOString().split('T')[0],
        parcela_atual: i + 1,
      });
    }
    return lancamentos;
  }

  // CASO 3: LANÇAMENTO ÚNICO
  return [{ ...base, valor: base.valor, parcela_atual: 1 }];
}