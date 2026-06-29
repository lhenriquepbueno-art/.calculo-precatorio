import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/calculo-engine';

export default function TimelineCard({ resultado }) {
  if (!resultado) return null;

  const steps = [
    {
      label: 'Valor Original',
      value: formatCurrency(resultado.valorOriginal),
      detail: 'Valor principal na data-base',
      status: 'done',
      color: 'blue'
    },
    {
      label: 'Fase 1 — IPCA-E',
      value: `+${resultado.fase1.percentual.toFixed(2).replace('.', ',')}%`,
      detail: `${resultado.fase1.periodoInicio} → ${resultado.fase1.periodoFim}`,
      status: 'done',
      color: 'cyan'
    },
    {
      label: 'Consolidação Nov/2021',
      value: formatCurrency(resultado.consolidacao.valorConsolidado),
      detail: 'Principal + Honorários + Juros atualizados',
      status: 'done',
      color: 'purple'
    },
    {
      label: 'Fase 2 — SELIC',
      value: `+${resultado.fase2.percentualAcumulado.toFixed(2).replace('.', ',')}%`,
      detail: `${resultado.fase2.periodoInicio} → ${resultado.fase2.periodoFim} (${resultado.metodoSelic})`,
      status: 'done',
      color: 'amber'
    },
    {
      label: 'Valor Atualizado',
      value: formatCurrency(resultado.valorAtualizado),
      detail: `Correção total: ${resultado.percentualCorrecao.toFixed(2).replace('.', ',')}%`,
      status: 'final',
      color: 'green'
    }
  ];

  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    cyan: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
    purple: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    amber: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    green: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-5">Linha do Tempo da Atualização</h3>
      <div className="space-y-0">
        {steps.map((step, i) => {
          const c = colorMap[step.color];
          const textColor = c.split(' ')[0];
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${c}`}>
                  {step.status === 'final' ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-2.5 h-2.5 fill-current" />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px h-10 bg-border/50" />
                )}
              </div>
              <div className="pb-6">
                <p className="text-xs text-muted-foreground">{step.label}</p>
                <p className={`text-sm font-bold font-mono ${textColor}`}>{step.value}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{step.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}