import React, { useState } from 'react';
import { FileText, Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercent } from '@/lib/calculo-engine';

function buildRelatorioHTML(prec, resultado) {
  const hoje = new Date().toLocaleDateString('pt-BR');
  const { consolidacao, fase1, fase2, prazoConstitucional, fundamentacao } = resultado;

  const periodoGracaInfo = fase2.periodoGraca
    ? `<p>Início dos juros de mora: <strong>${fase2.periodoGraca.inicioJurosMora}</strong> (após fim do período de graça em ${fase2.periodoGraca.fim})</p>`
    : '';

  const memoriaFase1Rows = (fase1.memoria || []).map(r => `
    <tr>
      <td>${r.periodo}</td>
      <td>${r.taxa?.toFixed(4).replace('.', ',')}%</td>
      <td>${(r.fatorAcumulado ? ((r.fatorAcumulado - 1) * 100).toFixed(4) : '').replace('.', ',')}%</td>
      <td>${formatCurrency(r.valorAtualizado)}</td>
    </tr>`).join('');

  const memoriaFase2Rows = (fase2.memoria || []).map(r => `
    <tr>
      <td>${r.periodo}</td>
      <td>${r.taxa?.toFixed(4).replace('.', ',')}%</td>
      <td>${r.taxaAcumulada?.toFixed(4).replace('.', ',')}%</td>
      <td>${formatCurrency(r.valorAtualizado)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Relatório de Precatório — ${prec.numero_precatorio}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; font-size: 11px; color: #1a1a2e; background: #fff; padding: 32px; }
    h1 { font-size: 18px; color: #1a1a2e; }
    h2 { font-size: 13px; color: #1a1a2e; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin: 20px 0 10px; }
    h3 { font-size: 11px; color: #374151; margin: 14px 0 6px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 3px solid #1e3a8a; padding-bottom: 16px; }
    .header-left h1 { margin-bottom: 4px; }
    .header-left p { font-size: 10px; color: #6b7280; }
    .header-right { text-align: right; font-size: 10px; color: #6b7280; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; }
    .badge-blue { background: #dbeafe; color: #1d4ed8; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; }
    .info-box label { font-size: 9px; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 3px; letter-spacing: 0.05em; }
    .info-box .value { font-size: 13px; font-weight: bold; color: #1e293b; }
    .info-box .value.big { font-size: 15px; color: #065f46; }
    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; }
    .summary-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; }
    .summary-card label { font-size: 9px; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 3px; }
    .summary-card .val { font-size: 14px; font-weight: bold; color: #1e3a8a; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 8px; }
    thead tr { background: #1e3a8a; color: #fff; }
    thead th { padding: 6px 8px; text-align: left; font-weight: 600; }
    tbody tr:nth-child(even) { background: #f8fafc; }
    tbody tr:hover { background: #eff6ff; }
    tbody td { padding: 4px 8px; border-bottom: 1px solid #e2e8f0; }
    .methodology-block { background: #f8fafc; border-left: 3px solid #1e3a8a; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-bottom: 10px; }
    .methodology-block p { margin-bottom: 4px; line-height: 1.5; }
    .warning-block { background: #fef3c7; border-left: 3px solid #f59e0b; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-bottom: 10px; }
    .warning-block p { margin-bottom: 4px; line-height: 1.5; color: #78350f; }
    .success-block { background: #d1fae5; border-left: 3px solid #10b981; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-bottom: 10px; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #9ca3af; text-align: center; }
    .page-break { page-break-before: always; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>

  <!-- CABEÇALHO -->
  <div class="header">
    <div class="header-left">
      <h1>Precatório SP AI — Relatório de Atualização Monetária</h1>
      <p>Cálculo jurídico conforme metodologia do STF — Tema 810 / EC 113/2021</p>
    </div>
    <div class="header-right">
      <p>Emitido em: <strong>${hoje}</strong></p>
      <p>Precatório: <strong>${prec.numero_precatorio}</strong></p>
      <p>Tribunal: <strong>${prec.tribunal}</strong></p>
      <span class="badge badge-blue">${prec.natureza}</span>
    </div>
  </div>

  <!-- DADOS DO PRECATÓRIO -->
  <h2>1. Dados do Precatório</h2>
  <div class="info-grid">
    <div class="info-box">
      <label>Número do Processo</label>
      <div class="value">${prec.numero_processo}</div>
    </div>
    <div class="info-box">
      <label>Número do Precatório</label>
      <div class="value">${prec.numero_precatorio}</div>
    </div>
    <div class="info-box">
      <label>Tribunal</label>
      <div class="value">${prec.tribunal}</div>
    </div>
    <div class="info-box">
      <label>Ente Devedor</label>
      <div class="value">${prec.ente_devedor || 'Estado de São Paulo'}</div>
    </div>
    <div class="info-box">
      <label>Natureza</label>
      <div class="value">${prec.natureza}</div>
    </div>
    <div class="info-box">
      <label>Data-Base da Conta</label>
      <div class="value">${prec.data_base_conta ? new Date(prec.data_base_conta + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</div>
    </div>
    <div class="info-box">
      <label>Data de Inscrição</label>
      <div class="value">${prec.data_inscricao ? new Date(prec.data_inscricao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</div>
    </div>
    <div class="info-box">
      <label>Data Prevista de Pagamento</label>
      <div class="value">${prec.data_prevista_pagamento ? new Date(prec.data_prevista_pagamento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informada'}</div>
    </div>
    <div class="info-box">
      <label>Método SELIC</label>
      <div class="value">${prec.metodo_selic || 'Linear'}</div>
    </div>
  </div>

  <!-- VALORES ORIGINAIS -->
  <h2>2. Valores Originais (Data-Base)</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <label>Valor Principal</label>
      <div class="val">${formatCurrency(resultado.valorOriginal)}</div>
    </div>
    <div class="summary-card">
      <label>Honorários</label>
      <div class="val">${formatCurrency(prec.valor_honorarios || 0)}</div>
    </div>
    <div class="summary-card">
      <label>Juros da Conta Original</label>
      <div class="val">${formatCurrency(prec.valor_juros_original || 0)}</div>
    </div>
    <div class="summary-card">
      <label>Total na Data-Base</label>
      <div class="val">${formatCurrency((resultado.valorOriginal || 0) + (prec.valor_honorarios || 0) + (prec.valor_juros_original || 0))}</div>
    </div>
  </div>

  <!-- RESULTADO DO CÁLCULO -->
  <h2>3. Resultado do Cálculo de Atualização</h2>
  <div class="info-grid">
    <div class="info-box">
      <label>Valor Atualizado Total</label>
      <div class="value big">${formatCurrency(resultado.valorAtualizado)}</div>
    </div>
    <div class="info-box">
      <label>Correção Acumulada</label>
      <div class="value big">${formatPercent(resultado.percentualCorrecao)}</div>
    </div>
    <div class="info-box">
      <label>Consolidado Nov/2021 (Base SELIC)</label>
      <div class="value">${formatCurrency(consolidacao.valorConsolidado)}</div>
    </div>
    <div class="info-box">
      <label>Fator IPCA-E Acumulado (Fase 1)</label>
      <div class="value">${consolidacao.fatorIPCAE?.toFixed(6)}</div>
    </div>
    <div class="info-box">
      <label>Correção IPCA-E</label>
      <div class="value">${consolidacao.percentualIPCAE?.toFixed(2).replace('.', ',')}%</div>
    </div>
    <div class="info-box">
      <label>Correção SELIC (Fase 2)</label>
      <div class="value">${fase2.percentualAcumulado?.toFixed(2).replace('.', ',')}%</div>
    </div>
  </div>

  <!-- METODOLOGIA -->
  <h2>4. Metodologia de Cálculo</h2>

  <h3>4.1 Fundamentação Jurídica</h3>
  <div class="methodology-block">
    <p><strong>Base Constitucional:</strong> ${fundamentacao.base}</p>
    <p><strong>Tema STF:</strong> ${fundamentacao.temaSTF} — Definiu a metodologia de correção dos precatórios após a EC 113/2021.</p>
    <p><strong>Tema STJ:</strong> ${fundamentacao.temaSTJ}</p>
    <p><strong>Emenda Constitucional:</strong> ${fundamentacao.ec113} — Instituiu a SELIC como único índice de correção a partir de dezembro/2021.</p>
    <p><strong>Inaplicabilidade:</strong> ${fundamentacao.inaplicabilidade}</p>
  </div>

  <h3>4.2 Fase 1 — Correção por IPCA-E (até novembro/2021)</h3>
  <div class="methodology-block">
    <p><strong>Período:</strong> ${fase1.periodoInicio} até ${fase1.periodoFim}</p>
    <p><strong>Índice:</strong> IPCA-E (Índice de Preços ao Consumidor Amplo Especial) — IBGE</p>
    <p><strong>Aplicação:</strong> Fator multiplicativo mensal sobre o valor principal. O fator acumulado é calculado mês a mês desde a data-base da conta judicial.</p>
    <p><strong>Fator IPCA-E Acumulado:</strong> ${consolidacao.fatorIPCAE?.toFixed(6)} (equivalente a ${consolidacao.percentualIPCAE?.toFixed(2).replace('.', ',')}%)</p>
    <p><strong>Resultado:</strong> Principal Atualizado = ${formatCurrency(consolidacao.valorPrincipalAtualizado)} | Honorários = ${formatCurrency(consolidacao.honorariosAtualizados)} | Juros = ${formatCurrency(consolidacao.jurosAtualizados)}</p>
  </div>

  <h3>4.3 Consolidação — Novembro/2021</h3>
  <div class="methodology-block">
    <p>Em novembro/2021, os valores são consolidados conforme determinação da EC 113/2021.</p>
    <p><strong>Valor Consolidado:</strong> ${formatCurrency(consolidacao.valorConsolidado)} (soma do principal + honorários + juros, todos atualizados pelo IPCA-E)</p>
    <p>Este valor passa a ser a <strong>base de cálculo para a Fase 2 (SELIC)</strong>.</p>
  </div>

  <h3>4.4 Período de Graça Constitucional (Art. 100, §5º CF)</h3>
  ${prazoConstitucional.dentro !== null ? `
  <div class="${prazoConstitucional.dentro ? 'success-block' : 'warning-block'}">
    <p><strong>Prazo Constitucional de Pagamento:</strong> ${prazoConstitucional.prazoFinalFormatado || `31/12/${prazoConstitucional.anoExercicio}`}</p>
    <p>Os precatórios inscritos até 1º de fevereiro de um ano devem ser incluídos no orçamento do ano seguinte e pagos até 31 de dezembro desse mesmo ano.</p>
    <p>Durante o período de graça, <strong>não correm juros de mora</strong> (STF — vedação de cobrança retroativa de juros do período de graça).</p>
    ${periodoGracaInfo}
    <p><strong>Status:</strong> ${prazoConstitucional.dentro ? '✓ Pagamento DENTRO do prazo constitucional.' : '⚠ Pagamento FORA do prazo constitucional — juros de mora fluem a partir de ' + (prazoConstitucional.inicioJurosMora ? `01/01/${prazoConstitucional.anoExercicio + 1}` : 'data não apurada') + '.'}</p>
  </div>` : '<div class="methodology-block"><p>Data de inscrição não informada — período de graça não apurado.</p></div>'}

  <h3>4.5 Fase 2 — Correção por SELIC (a partir de dezembro/2021 / início dos juros de mora)</h3>
  <div class="methodology-block">
    <p><strong>Período:</strong> ${fase2.periodoInicio} até ${fase2.periodoFim}</p>
    <p><strong>Índice:</strong> Taxa SELIC (Sistema Especial de Liquidação e de Custódia) — Banco Central do Brasil</p>
    <p><strong>Método:</strong> ${resultado.metodoSelic === 'Linear' ? 'Linear — soma das taxas mensais aplicada sobre o valor consolidado' : 'Composta — produto dos fatores mensais (acumulação geométrica)'}</p>
    <p><strong>Base de Cálculo:</strong> ${formatCurrency(consolidacao.valorConsolidado)} (valor consolidado em Nov/2021)</p>
    <p><strong>SELIC Acumulada no Período:</strong> ${fase2.percentualAcumulado?.toFixed(2).replace('.', ',')}%</p>
    <p><strong>Valor Final:</strong> ${formatCurrency(resultado.valorAtualizado)}</p>
  </div>

  <!-- MEMÓRIA DE CÁLCULO FASE 1 -->
  <div class="page-break"></div>
  <h2>5. Memória de Cálculo — Fase 1 (IPCA-E)</h2>
  <table>
    <thead>
      <tr>
        <th>Período</th>
        <th>Taxa IPCA-E (%)</th>
        <th>Acumulado (%)</th>
        <th>Valor Atualizado</th>
      </tr>
    </thead>
    <tbody>
      ${memoriaFase1Rows || '<tr><td colspan="4">Sem dados para exibir</td></tr>'}
    </tbody>
  </table>

  <!-- MEMÓRIA DE CÁLCULO FASE 2 -->
  <h2>6. Memória de Cálculo — Fase 2 (SELIC)</h2>
  <table>
    <thead>
      <tr>
        <th>Período</th>
        <th>Taxa SELIC (%)</th>
        <th>Acumulado (%)</th>
        <th>Valor Atualizado</th>
      </tr>
    </thead>
    <tbody>
      ${memoriaFase2Rows || '<tr><td colspan="4">Sem dados para exibir</td></tr>'}
    </tbody>
  </table>

  <!-- RODAPÉ -->
  <div class="footer">
    <p>Relatório gerado automaticamente pelo sistema <strong>Precatório SP AI</strong> em ${hoje}.</p>
    <p>Este documento tem caráter informativo. Valores sujeitos a confirmação judicial. Dados de índices: IBGE (IPCA-E) e Banco Central do Brasil (SELIC).</p>
  </div>

</body>
</html>`;
}

export default function RelatorioGenerator({ prec, resultado }) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prec || !resultado || resultado.erro) return;
    setGenerating(true);

    const html = buildRelatorioHTML(prec, resultado);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      setGenerating(false);
    }, 600);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5 border-border/50"
      onClick={handleGenerate}
      disabled={generating || !resultado || !!resultado?.erro}
    >
      {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
      Relatório PDF
    </Button>
  );
}