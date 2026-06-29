import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { calcularPrecatorio, formatCurrency, formatPercent } from '@/lib/calculo-engine';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import StatCard from '@/components/dashboard/StatCard';
import { DollarSign, TrendingUp, BarChart3, Calculator, Loader2, CheckSquare, Square, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function buildRelatorioConsolidadoHTML(selecionados, resultados, totais) {
  const hoje = new Date().toLocaleDateString('pt-BR');
  const rows = selecionados.map((prec, i) => {
    const r = resultados[i];
    if (!r || r.erro) return '';
    return `<tr>
      <td>${prec.numero_precatorio}</td>
      <td>${prec.tribunal}</td>
      <td>${prec.natureza}</td>
      <td>${prec.data_base_conta ? new Date(prec.data_base_conta + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
      <td style="text-align:right">${formatCurrency(r.valorOriginal)}</td>
      <td style="text-align:right">${formatCurrency(r.valorAtualizado)}</td>
      <td style="text-align:right">${formatPercent(r.percentualCorrecao)}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
  <title>Relatório Consolidado — Precatório SP AI</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:Arial,sans-serif; font-size:11px; color:#1a1a2e; padding:32px; }
    h1 { font-size:17px; margin-bottom:4px; }
    h2 { font-size:13px; border-bottom:2px solid #1e3a8a; padding-bottom:4px; margin:20px 0 10px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #1e3a8a; padding-bottom:16px; margin-bottom:20px; }
    .header-right { text-align:right; font-size:10px; color:#6b7280; }
    .summary-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:20px; }
    .summary-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px; }
    .summary-card label { font-size:9px; text-transform:uppercase; color:#94a3b8; display:block; margin-bottom:3px; }
    .summary-card .val { font-size:14px; font-weight:bold; color:#1e3a8a; }
    .summary-card .val.green { color:#065f46; }
    table { width:100%; border-collapse:collapse; font-size:10px; }
    thead tr { background:#1e3a8a; color:#fff; }
    thead th { padding:6px 8px; text-align:left; }
    tbody tr:nth-child(even) { background:#f8fafc; }
    tbody td { padding:5px 8px; border-bottom:1px solid #e2e8f0; }
    tfoot tr { background:#1e3a8a; color:#fff; font-weight:bold; }
    tfoot td { padding:6px 8px; }
    .footer { margin-top:24px; padding-top:10px; border-top:1px solid #e2e8f0; font-size:9px; color:#9ca3af; text-align:center; }
  </style></head><body>
  <div class="header">
    <div><h1>Precatório SP AI — Relatório Consolidado</h1><p style="font-size:10px;color:#6b7280">Cálculo agregado de múltiplos precatórios</p></div>
    <div class="header-right"><p>Emitido em: <strong>${hoje}</strong></p><p>Precatórios: <strong>${selecionados.length}</strong></p></div>
  </div>
  <h2>Resumo Consolidado</h2>
  <div class="summary-grid">
    <div class="summary-card"><label>Qtd. Precatórios</label><div class="val">${selecionados.length}</div></div>
    <div class="summary-card"><label>Total Original</label><div class="val">${formatCurrency(totais.totalOriginal)}</div></div>
    <div class="summary-card"><label>Total Atualizado</label><div class="val green">${formatCurrency(totais.totalAtualizado)}</div></div>
    <div class="summary-card"><label>Correção Média</label><div class="val">${formatPercent(totais.correcaoMedia)}</div></div>
  </div>
  <h2>Detalhamento por Precatório</h2>
  <table>
    <thead><tr><th>Precatório</th><th>Tribunal</th><th>Natureza</th><th>Data-Base</th><th>Valor Original</th><th>Valor Atualizado</th><th>Correção</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr>
      <td colspan="4">TOTAL CONSOLIDADO</td>
      <td style="text-align:right">${formatCurrency(totais.totalOriginal)}</td>
      <td style="text-align:right">${formatCurrency(totais.totalAtualizado)}</td>
      <td style="text-align:right">${formatPercent(totais.correcaoMedia)}</td>
    </tr></tfoot>
  </table>
  <div class="footer"><p>Relatório gerado automaticamente pelo sistema <strong>Precatório SP AI</strong> em ${hoje}.</p></div>
  </body></html>`;
}

export default function CalculoConsolidado() {
  const [precatorios, setPrecatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecionados, setSelecionados] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [calculando, setCalculando] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    base44.entities.Precatorio.list('-created_date', 100).then(data => {
      setPrecatorios(data);
      setSelecionados(data.map(p => p.id)); // todos selecionados por padrão
      setLoading(false);
    });
  }, []);

  const toggleTodos = () => {
    if (selecionados.length === precatorios.length) {
      setSelecionados([]);
    } else {
      setSelecionados(precatorios.map(p => p.id));
    }
  };

  const toggleItem = (id) => {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const calcular = () => {
    if (selecionados.length === 0) {
      toast({ title: 'Selecione ao menos um precatório', variant: 'destructive' });
      return;
    }
    setCalculando(true);
    const precs = precatorios.filter(p => selecionados.includes(p.id));
    const res = precs.map(prec => calcularPrecatorio({
      valorPrincipal: prec.valor_principal,
      valorHonorarios: prec.valor_honorarios || 0,
      valorJurosOriginal: prec.valor_juros_original || 0,
      dataBaseConta: prec.data_base_conta,
      dataInscricao: prec.data_inscricao,
      dataPagamento: prec.data_prevista_pagamento,
      metodoSelic: prec.metodo_selic || 'Linear'
    }));
    setResultados(res);
    setCalculando(false);
  };

  const precsSelecionados = precatorios.filter(p => selecionados.includes(p.id));

  const totais = resultados.length > 0 ? (() => {
    const validos = resultados.filter(r => !r?.erro);
    const totalOriginal = validos.reduce((s, r) => s + r.valorOriginal, 0);
    const totalAtualizado = validos.reduce((s, r) => s + r.valorAtualizado, 0);
    const totalConsolidado = validos.reduce((s, r) => s + r.consolidacao.valorConsolidado, 0);
    const correcaoMedia = totalOriginal > 0 ? ((totalAtualizado / totalOriginal) - 1) * 100 : 0;
    return { totalOriginal, totalAtualizado, totalConsolidado, correcaoMedia };
  })() : null;

  const handleRelatorio = () => {
    if (!totais) return;
    const html = buildRelatorioConsolidadoHTML(precsSelecionados, resultados, totais);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Cálculo Consolidado</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Selecione os precatórios para calcular o resultado agregado</p>
        </div>
        <div className="flex items-center gap-3">
          {totais && (
            <Button size="sm" variant="outline" className="gap-1.5 border-border/50" onClick={handleRelatorio}>
              <FileText className="w-3.5 h-3.5" /> Relatório PDF
            </Button>
          )}
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            onClick={calcular}
            disabled={calculando || selecionados.length === 0}
          >
            {calculando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calculator className="w-3.5 h-3.5" />}
            Calcular {selecionados.length > 0 ? `(${selecionados.length})` : ''}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Precatórios</h3>
              <button
                onClick={toggleTodos}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {selecionados.length === precatorios.length
                  ? <><CheckSquare className="w-3.5 h-3.5" /> Desmarcar todos</>
                  : <><Square className="w-3.5 h-3.5" /> Selecionar todos</>
                }
              </button>
            </div>
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {precatorios.map(prec => {
                const checked = selecionados.includes(prec.id);
                return (
                  <label
                    key={prec.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                      checked ? 'bg-blue-500/10 border-blue-500/30' : 'bg-muted/30 border-transparent hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleItem(prec.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-semibold text-foreground truncate">{prec.numero_precatorio}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{prec.numero_processo}</p>
                      <p className="text-[10px] text-blue-400 font-mono mt-0.5">{formatCurrency(prec.valor_principal)}</p>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                      prec.natureza === 'Alimentar' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>{prec.natureza}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-2 space-y-4">
          {totais ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Total Original" value={formatCurrency(totais.totalOriginal)} subtitle={`${resultados.filter(r => !r?.erro).length} precatórios`} icon={DollarSign} color="blue" />
                <StatCard label="Total Atualizado" value={formatCurrency(totais.totalAtualizado)} subtitle={`Atualizado em ${new Date().toLocaleDateString('pt-BR')}`} icon={TrendingUp} color="green" glow />
                <StatCard label="Correção Média" value={formatPercent(totais.correcaoMedia)} subtitle="Percentual médio acumulado" icon={BarChart3} color="amber" />
                <StatCard label="Total Consolidado Nov/2021" value={formatCurrency(totais.totalConsolidado)} subtitle="Base para Fase 2 (SELIC)" icon={Calculator} color="purple" />
              </div>

              {/* Tabela detalhada */}
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <h3 className="text-sm font-semibold text-foreground">Detalhamento por Precatório</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="text-left p-3 font-semibold text-muted-foreground">Precatório</th>
                        <th className="text-left p-3 font-semibold text-muted-foreground">Tribunal</th>
                        <th className="text-right p-3 font-semibold text-muted-foreground">Valor Original</th>
                        <th className="text-right p-3 font-semibold text-muted-foreground">Valor Atualizado</th>
                        <th className="text-right p-3 font-semibold text-muted-foreground">Correção</th>
                      </tr>
                    </thead>
                    <tbody>
                      {precsSelecionados.map((prec, i) => {
                        const r = resultados[i];
                        if (!r) return null;
                        if (r.erro) return (
                          <tr key={prec.id} className="border-b border-border/30">
                            <td className="p-3 font-mono text-foreground">{prec.numero_precatorio}</td>
                            <td className="p-3 text-muted-foreground">{prec.tribunal}</td>
                            <td className="p-3 text-right text-red-400" colSpan={3}>Erro: {r.erro}</td>
                          </tr>
                        );
                        return (
                          <tr key={prec.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                            <td className="p-3 font-mono text-foreground">{prec.numero_precatorio}</td>
                            <td className="p-3 text-muted-foreground">{prec.tribunal}</td>
                            <td className="p-3 text-right font-mono text-blue-400">{formatCurrency(r.valorOriginal)}</td>
                            <td className="p-3 text-right font-mono text-emerald-400 font-semibold">{formatCurrency(r.valorAtualizado)}</td>
                            <td className="p-3 text-right font-mono text-amber-400">{formatPercent(r.percentualCorrecao)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-blue-500/10 border-t border-blue-500/30">
                        <td className="p-3 font-bold text-foreground" colSpan={2}>TOTAL</td>
                        <td className="p-3 text-right font-mono font-bold text-blue-400">{formatCurrency(totais.totalOriginal)}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(totais.totalAtualizado)}</td>
                        <td className="p-3 text-right font-mono font-bold text-amber-400">{formatPercent(totais.correcaoMedia)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card rounded-xl flex flex-col items-center justify-center h-80 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Calculator className="w-7 h-7 text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-foreground">Nenhum cálculo executado</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Selecione os precatórios na lista à esquerda e clique em <strong>Calcular</strong> para obter o resultado consolidado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}