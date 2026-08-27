/**
 * Serviço de Inteligência Financeira
 * Trata a expansão de registros para Cartão de Crédito (Parcelas)
 * e Custos Fixos (Recorrência por data).
 */

export function expandirLancamentos(base: any) {
  const lancamentos = [];
  const dataInicio = new Date(base.data_competencia + 'T00:00:00');

  // PRIORIDADE 1: RECORRÊNCIA DE CUSTO FIXO
  if (base.tipo_de_custo === 'Fixo' && base.fixo_ate) {
    const dataFim = new Date(base.fixo_ate + 'T00:00:00');
    let dataAtual = new Date(dataInicio);
    let contadorRecorrencia = 1;

    while (dataAtual <= dataFim) {
      const dataStr = dataAtual.toISOString().split('T')[0];
      const faturaMesStr = dataStr.slice(0, 7);

      lancamentos.push({
        ...base,
        valor: base.valor,
        data_competencia: dataStr,
        fatura_mes: base.tipo_origem === "CONTA_CORRENTE" ? "" : faturaMesStr,
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
  if (base.parcelas_total > 1) {
    const valorParcelaBase = Math.floor((base.valor / base.parcelas_total) * 100) / 100;
    const diferencaArredondamento = parseFloat((base.valor - (valorParcelaBase * base.parcelas_total)).toFixed(2));

    // Captura o mês base da fatura inicial informada pelo usuário (ex: "2026-09")
    const faturaBaseStr = base.fatura_mes || dataInicio.toISOString().slice(0, 7);
    const [anoFatura, mesFatura] = faturaBaseStr.split('-').map(Number);

    for (let i = 0; i < base.parcelas_total; i++) {
      // 1. Projeta a data de competência (avança mês a mês a partir da data da compra)
      const dataParcela = new Date(dataInicio);
      dataParcela.setMonth(dataInicio.getMonth() + i);
      const dataStr = dataParcela.toISOString().split('T')[0];

      // 2. Projeta a fatura do mês (avança mês a mês a partir da "Fatura 1º pag." escolhida)
      const dataFaturaObj = new Date(anoFatura, (mesFatura - 1) + i, 1);
      const faturaMesProjetada = dataFaturaObj.toISOString().slice(0, 7);

      const valorFinalParcela = (i === base.parcelas_total - 1)
        ? (valorParcelaBase + diferencaArredondamento)
        : valorParcelaBase;

      lancamentos.push({
        ...base,
        valor: valorFinalParcela,
        data_competencia: dataStr,
        fatura_mes: base.tipo_origem === "CONTA_CORRENTE" ? "" : faturaMesProjetada,
        parcela_atual: i + 1,
      });
    }
    return lancamentos;
  }

  // CASO 3: LANÇAMENTO ÚNICO
  const dataStr = dataInicio.toISOString().split('T')[0];
  const faturaMesStr = dataStr.slice(0, 7);

  return [{
    ...base,
    valor: base.valor,
    data_competencia: dataStr,
    fatura_mes: base.tipo_origem === "CONTA_CORRENTE" ? "" : (base.fatura_mes || faturaMesStr),
    parcela_atual: 1
  }];
}