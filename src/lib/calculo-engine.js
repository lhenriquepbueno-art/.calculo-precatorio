import { getIPCAE, getSELIC } from './indices-data';

/**
 * Motor de Cálculo Jurídico de Precatórios - Estado de São Paulo
 * 
 * Metodologia:
 * FASE 1: IPCA-E até novembro/2021
 * CONSOLIDAÇÃO: Nov/2021
 * FASE 2: SELIC a partir de dezembro/2021
 * PERÍODO DE GRAÇA: Verificação constitucional
 */

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return d;
}

function getMonthYear(date) {
  return { mes: date.getMonth() + 1, ano: date.getFullYear() };
}

function nextMonth(ano, mes) {
  if (mes === 12) return { ano: ano + 1, mes: 1 };
  return { ano, mes: mes + 1 };
}

function isBeforeOrEqual(a, b) {
  if (a.ano < b.ano) return true;
  if (a.ano === b.ano && a.mes <= b.mes) return true;
  return false;
}

function monthLabel(ano, mes) {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${meses[mes - 1]}/${ano}`;
}

/**
 * Calcula o prazo de graça constitucional (Art. 100 CF / EC 62)
 * 
 * Regra:
 * - Precatório inscrito até 01/fev do ano X → entra no orçamento do ano X+1
 *   → prazo de pagamento: até 31/dez do ano X+1
 * - Precatório inscrito após 01/fev do ano X → entra no orçamento do ano X+2
 *   → prazo de pagamento: até 31/dez do ano X+2
 * 
 * Durante o período de graça NÃO correm juros.
 * Juros de mora só começam em 01/jan do ano seguinte ao prazo final.
 */
function calcularPeriodoGraca(dataInscricao) {
  if (!dataInscricao) return null;
  
  const inscricao = parseDate(dataInscricao);
  const anoInscricao = inscricao.getFullYear();
  const mesInscricao = inscricao.getMonth() + 1;
  const diaInscricao = inscricao.getDate();

  // Se inscrito até 01/fev → orçamento do próximo ano → paga até 31/dez do próximo ano
  // Se inscrito após 01/fev → orçamento do ano seguinte ao próximo → paga até 31/dez daquele ano
  let anoPrazo;
  if (mesInscricao < 2 || (mesInscricao === 2 && diaInscricao === 1)) {
    anoPrazo = anoInscricao + 1;
  } else {
    anoPrazo = anoInscricao + 2;
  }

  // Período de graça: da inscrição até 31/dez/anoPrazo (inclusive)
  const fimGraca = { ano: anoPrazo, mes: 12 }; // Dez/anoPrazo é o último mês sem juros

  // Juros de mora começam em jan do ano seguinte
  const inicioJurosMora = { ano: anoPrazo + 1, mes: 1 };

  return {
    fimGraca,                  // { ano, mes } — último mês do período de graça
    inicioJurosMora,           // { ano, mes } — primeiro mês com juros de mora
    prazoFinalStr: `31/12/${anoPrazo}`,
    anoPrazo
  };
}

function verificarPrazoConstitucional(dataInscricao, dataPagamento) {
  const graca = calcularPeriodoGraca(dataInscricao);
  if (!graca) return { dentro: null, prazoFinal: null };

  const dentro = dataPagamento
    ? parseDate(dataPagamento) <= new Date(graca.anoPrazo, 11, 31)
    : null;

  return {
    dentro,
    prazoFinal: `${graca.anoPrazo}-12-31`,
    anoExercicio: graca.anoPrazo,
    prazoFinalFormatado: graca.prazoFinalStr,
    inicioJurosMora: graca.inicioJurosMora
  };
}

/**
 * Executa o cálculo completo de atualização do precatório
 */
export function calcularPrecatorio({
  valorPrincipal,
  valorHonorarios = 0,
  valorJurosOriginal = 0,
  dataBaseConta,
  dataInscricao,
  dataPagamento,
  metodoSelic = 'Linear'
}) {
  const memoria = [];
  const dataBase = parseDate(dataBaseConta);
  if (!dataBase || !valorPrincipal) {
    return { erro: 'Dados insuficientes para o cálculo' };
  }

  let { ano: anoInicio, mes: mesInicio } = getMonthYear(dataBase);
  
  // Limite da FASE 1: novembro/2021
  const limiteIPCAE = { ano: 2021, mes: 11 };
  
  // ═══════════════════════════════════════════
  // FASE 1 — IPCA-E (até novembro/2021)
  // ═══════════════════════════════════════════
  let valorAcumulado = valorPrincipal;
  let fatorAcumuladoIPCAE = 1;
  let current = { ano: anoInicio, mes: mesInicio };
  
  // Avançar para o mês seguinte à data-base
  current = nextMonth(current.ano, current.mes);
  
  const memoriaFase1 = [];
  
  while (isBeforeOrEqual(current, limiteIPCAE)) {
    const taxa = getIPCAE(current.ano, current.mes);
    if (taxa !== null) {
      const fator = 1 + (taxa / 100);
      fatorAcumuladoIPCAE *= fator;
      valorAcumulado = valorPrincipal * fatorAcumuladoIPCAE;
      
      memoriaFase1.push({
        periodo: monthLabel(current.ano, current.mes),
        ano: current.ano,
        mes: current.mes,
        fase: 'IPCA-E',
        indice: 'IPCA-E',
        taxa: taxa,
        fatorAcumulado: fatorAcumuladoIPCAE,
        valorBase: valorPrincipal,
        valorAtualizado: Math.round(valorAcumulado * 100) / 100
      });
    }
    current = nextMonth(current.ano, current.mes);
  }

  // ═══════════════════════════════════════════
  // CONSOLIDAÇÃO — Novembro/2021
  // ═══════════════════════════════════════════
  const valorPrincipalAtualizado = Math.round(valorAcumulado * 100) / 100;
  const honorariosAtualizados = Math.round(valorHonorarios * fatorAcumuladoIPCAE * 100) / 100;
  const jurosAtualizados = Math.round(valorJurosOriginal * fatorAcumuladoIPCAE * 100) / 100;
  
  const valorConsolidado = Math.round((valorPrincipalAtualizado + honorariosAtualizados + jurosAtualizados) * 100) / 100;

  const consolidacao = {
    data: 'Nov/2021',
    valorPrincipalAtualizado,
    honorariosAtualizados,
    jurosAtualizados,
    valorConsolidado,
    fatorIPCAE: fatorAcumuladoIPCAE,
    percentualIPCAE: Math.round((fatorAcumuladoIPCAE - 1) * 10000) / 100
  };

  // ═══════════════════════════════════════════
  // PERÍODO DE GRAÇA CONSTITUCIONAL
  // ═══════════════════════════════════════════
  const periodoGraca = calcularPeriodoGraca(dataInscricao);
  const prazoConstitucional = verificarPrazoConstitucional(dataInscricao, dataPagamento);

  // ═══════════════════════════════════════════
  // FASE 2 — SELIC (a partir de dezembro/2021)
  // Juros NÃO correm durante o período de graça.
  // Só começam em 01/jan do ano seguinte ao prazo final de pagamento.
  // ═══════════════════════════════════════════
  let valorFinal = valorConsolidado;
  let somaSelicLinear = 0;
  let fatorSelicAcumulado = 1;
  
  const memoriaFase2 = [];
  
  // Determinar data final do cálculo: sempre até hoje (ou data de pagamento se for futura)
  const hoje = new Date();
  let dataFinal = hoje;
  if (dataPagamento) {
    const dp = parseDate(dataPagamento);
    if (dp > hoje) dataFinal = dp;
  }
  const { ano: anoFim, mes: mesFim } = getMonthYear(dataFinal);
  
  // Início dos juros SELIC: Dec/2021 ou o início dos juros de mora (o que for posterior)
  let inicioSELIC = { ano: 2021, mes: 12 };
  if (periodoGraca && !isBeforeOrEqual(periodoGraca.inicioJurosMora, { ano: 2021, mes: 12 })) {
    inicioSELIC = periodoGraca.inicioJurosMora;
  }

  current = { ...inicioSELIC };
  const fimCalculo = { ano: anoFim, mes: mesFim };
  
  while (isBeforeOrEqual(current, fimCalculo)) {
    const taxa = getSELIC(current.ano, current.mes);
    if (taxa !== null) {
      somaSelicLinear += taxa;
      fatorSelicAcumulado *= (1 + taxa / 100);
      
      let valorMes;
      if (metodoSelic === 'Linear') {
        valorMes = valorConsolidado * (1 + somaSelicLinear / 100);
      } else {
        valorMes = valorConsolidado * fatorSelicAcumulado;
      }
      
      memoriaFase2.push({
        periodo: monthLabel(current.ano, current.mes),
        ano: current.ano,
        mes: current.mes,
        fase: 'SELIC',
        indice: 'SELIC',
        taxa: taxa,
        taxaAcumulada: metodoSelic === 'Linear' ? somaSelicLinear : Math.round((fatorSelicAcumulado - 1) * 10000) / 100,
        valorBase: valorConsolidado,
        valorAtualizado: Math.round(valorMes * 100) / 100
      });
      
      valorFinal = Math.round(valorMes * 100) / 100;
    }
    current = nextMonth(current.ano, current.mes);
  }

  // ═══════════════════════════════════════════
  // RESULTADO FINAL
  // ═══════════════════════════════════════════
  const percentualTotal = valorPrincipal > 0 
    ? Math.round(((valorFinal / valorPrincipal) - 1) * 10000) / 100 
    : 0;

  const selicPercentual = metodoSelic === 'Linear' ? somaSelicLinear : Math.round((fatorSelicAcumulado - 1) * 10000) / 100;

  return {
    valorOriginal: valorPrincipal,
    valorAtualizado: valorFinal,
    percentualCorrecao: percentualTotal,
    consolidacao,
    prazoConstitucional,
    metodoSelic,
    fase1: {
      indice: 'IPCA-E',
      periodoInicio: monthLabel(anoInicio, mesInicio),
      periodoFim: 'Nov/2021',
      fatorAcumulado: fatorAcumuladoIPCAE,
      percentual: Math.round((fatorAcumuladoIPCAE - 1) * 10000) / 100,
      memoria: memoriaFase1
    },
    fase2: {
      indice: 'SELIC',
      metodo: metodoSelic,
      periodoInicio: periodoGraca ? `Jan/${periodoGraca.anoPrazo + 1}` : 'Dez/2021',
      periodoFim: monthLabel(anoFim, mesFim),
      percentualAcumulado: Math.round(selicPercentual * 100) / 100,
      memoria: memoriaFase2,
      periodoGraca: periodoGraca ? {
        inicio: dataInscricao,
        fim: periodoGraca.prazoFinalStr,
        inicioJurosMora: `01/01/${periodoGraca.anoPrazo + 1}`
      } : null
    },
    memoriaCompleta: [...memoriaFase1, ...memoriaFase2],
    dataCalculo: new Date().toISOString(),
    fundamentacao: {
      base: 'Constituição Federal, Art. 100',
      temaSTF: 'Tema 810 - STF',
      temaSTJ: 'Tema 905 - STJ',
      ec113: 'Emenda Constitucional nº 113/2021',
      inaplicabilidade: 'Lei nº 14.905/2024 — Inaplicável a precatórios da Fazenda Pública'
    }
  };
}

export function formatCurrency(value) {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatPercent(value) {
  if (value === null || value === undefined) return '0,00%';
  return value.toFixed(2).replace('.', ',') + '%';
}