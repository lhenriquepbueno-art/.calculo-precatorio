import React from 'react';
import { BookOpen, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';

export default function MethodologySummary({ resultado }) {
  if (!resultado) return null;

  const { prazoConstitucional, fundamentacao } = resultado;

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-foreground">Resumo Jurídico da Metodologia</h3>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-400">Inaplicabilidade da Lei nº 14.905/2024</p>
            <p className="text-muted-foreground mt-0.5">
              Afastada integralmente. Precatórios possuem disciplina constitucional própria.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-cyan-400">Fundamentação Aplicada</p>
            <p className="text-muted-foreground mt-0.5">
              {fundamentacao.base} · {fundamentacao.temaSTF} · {fundamentacao.temaSTJ} · {fundamentacao.ec113}
            </p>
          </div>
        </div>

        {prazoConstitucional.dentro !== null && (
          <div className={`flex items-start gap-2 p-2.5 rounded-lg ${
            prazoConstitucional.dentro 
              ? 'bg-emerald-500/5 border border-emerald-500/10' 
              : 'bg-amber-500/5 border border-amber-500/10'
          }`}>
            {prazoConstitucional.dentro ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
            )}
            <div>
              <p className={`font-semibold ${prazoConstitucional.dentro ? 'text-emerald-400' : 'text-amber-400'}`}>
                Período de Graça Constitucional
              </p>
              <p className="text-muted-foreground mt-0.5">
                {prazoConstitucional.dentro 
                  ? `Pagamento DENTRO do prazo constitucional (até 31/12/${prazoConstitucional.anoExercicio})`
                  : `Pagamento FORA do prazo constitucional (prazo: 31/12/${prazoConstitucional.anoExercicio})`
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}