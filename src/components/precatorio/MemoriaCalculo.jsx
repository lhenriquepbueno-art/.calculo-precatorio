import React, { useState } from 'react';
import { formatCurrency, formatPercent } from '@/lib/calculo-engine';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function MemoriaCalculo({ resultado }) {
  const [showFase1, setShowFase1] = useState(false);
  const [showFase2, setShowFase2] = useState(true);

  if (!resultado) return null;

  const TableHeader = () => (
    <tr className="border-b border-border/30">
      <th className="text-left py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Período</th>
      <th className="text-left py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Índice</th>
      <th className="text-right py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Taxa (%)</th>
      <th className="text-right py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Acum. (%)</th>
      <th className="text-right py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Valor Atualizado</th>
    </tr>
  );

  return (
    <div className="space-y-4">
      {/* FASE 1 */}
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          onClick={() => setShowFase1(!showFase1)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-sm font-semibold text-foreground">Fase 1 — IPCA-E</span>
            <span className="text-xs text-muted-foreground">({resultado.fase1.periodoInicio} → {resultado.fase1.periodoFim})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-cyan-400">+{formatPercent(resultado.fase1.percentual)}</span>
            {showFase1 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>
        {showFase1 && resultado.fase1.memoria.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><TableHeader /></thead>
              <tbody>
                {resultado.fase1.memoria.map((row, i) => (
                  <tr key={i} className="border-b border-border/10 hover:bg-white/3">
                    <td className="py-1.5 px-3 font-mono text-foreground/80">{row.periodo}</td>
                    <td className="py-1.5 px-3 text-cyan-400">{row.indice}</td>
                    <td className="py-1.5 px-3 text-right font-mono">{row.taxa.toFixed(2).replace('.', ',')}</td>
                    <td className="py-1.5 px-3 text-right font-mono">{((row.fatorAcumulado - 1) * 100).toFixed(4).replace('.', ',')}</td>
                    <td className="py-1.5 px-3 text-right font-mono font-medium">{formatCurrency(row.valorAtualizado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONSOLIDAÇÃO */}
      <div className="glass-card rounded-xl p-4 border border-purple-500/20 glow-blue">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-sm font-semibold text-foreground">Consolidação — Nov/2021</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Principal Atualizado</p>
            <p className="text-sm font-bold font-mono text-purple-400">{formatCurrency(resultado.consolidacao.valorPrincipalAtualizado)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Honorários Atualiz.</p>
            <p className="text-sm font-bold font-mono text-purple-400">{formatCurrency(resultado.consolidacao.honorariosAtualizados)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Juros Atualizados</p>
            <p className="text-sm font-bold font-mono text-purple-400">{formatCurrency(resultado.consolidacao.jurosAtualizados)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Valor Consolidado</p>
            <p className="text-sm font-bold font-mono text-emerald-400">{formatCurrency(resultado.consolidacao.valorConsolidado)}</p>
          </div>
        </div>
      </div>

      {/* FASE 2 */}
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          onClick={() => setShowFase2(!showFase2)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-sm font-semibold text-foreground">Fase 2 — SELIC ({resultado.metodoSelic})</span>
            <span className="text-xs text-muted-foreground">({resultado.fase2.periodoInicio} → {resultado.fase2.periodoFim})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-amber-400">+{formatPercent(resultado.fase2.percentualAcumulado)}</span>
            {showFase2 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>
        {showFase2 && resultado.fase2.memoria.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><TableHeader /></thead>
              <tbody>
                {resultado.fase2.memoria.map((row, i) => (
                  <tr key={i} className="border-b border-border/10 hover:bg-white/3">
                    <td className="py-1.5 px-3 font-mono text-foreground/80">{row.periodo}</td>
                    <td className="py-1.5 px-3 text-amber-400">{row.indice}</td>
                    <td className="py-1.5 px-3 text-right font-mono">{row.taxa.toFixed(2).replace('.', ',')}</td>
                    <td className="py-1.5 px-3 text-right font-mono">{row.taxaAcumulada.toFixed(2).replace('.', ',')}</td>
                    <td className="py-1.5 px-3 text-right font-mono font-medium">{formatCurrency(row.valorAtualizado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}