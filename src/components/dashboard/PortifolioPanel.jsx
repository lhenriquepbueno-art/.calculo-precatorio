import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '@/lib/calculo-engine';
import { calcularPrecatorio } from '@/lib/calculo-engine';
import { TrendingUp, DollarSign, Layers, Clock } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg p-3 shadow-xl border border-white/10">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-emerald-400 font-mono">{formatCurrency(payload[0]?.value || 0)}</p>
      {payload[1]?.value > 0 && (
        <p className="text-xs text-blue-400 font-mono mt-0.5">Original: {formatCurrency(payload[1].value)}</p>
      )}
    </div>
  );
}

export default function PortfolioPanel({ precatorios }) {
  const { totais, projecaoMensal } = useMemo(() => {
    if (!precatorios || precatorios.length === 0) return { totais: null, projecaoMensal: [] };

    let somaOriginal = 0;
    let somaAtualizada = 0;
    let somaHonorarios = 0;

    // Calcula cada precatório e acumula totais
    const calculos = precatorios.map(prec => {
      const res = calcularPrecatorio({
        valorPrincipal: prec.valor_principal,
        valorHonorarios: prec.valor_honorarios || 0,
        valorJurosOriginal: prec.valor_juros_original || 0,
        dataBaseConta: prec.data_base_conta,
        dataInscricao: prec.data_inscricao,
        dataPagamento: prec.data_prevista_pagamento,
        metodoSelic: prec.metodo_selic || 'Linear'
      });
      somaOriginal += res.valorOriginal || 0;
      somaAtualizada += res.valorAtualizado || 0;
      somaHonorarios += prec.valor_honorarios || 0;
      return { prec, res };
    });

    // Projeção: valor acumulado mês a mês para os próximos 12 meses
    const hoje = new Date();
    const meses = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      return {
        label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        date: d,
      };
    });

    const projecaoMensal = meses.map(({ label, date }) => {
      let totalMes = 0;
      let originalMes = 0;
      calculos.forEach(({ prec, res }) => {
        // Simula valor acumulado até aquela data usando a taxa mensal do último mês calculado
        const ultimoMes = res.memoriaCompleta?.[res.memoriaCompleta.length - 1];
        const taxaMensal = ultimoMes?.taxa || 0;
        const mesesAdicionais = (date.getFullYear() - hoje.getFullYear()) * 12 + (date.getMonth() - hoje.getMonth());
        const fator = 1 + (taxaMensal / 100) * mesesAdicionais;
        totalMes += (res.valorAtualizado || 0) * Math.max(fator, 1);
        originalMes += res.valorOriginal || 0;
      });
      return { label, atualizado: Math.round(totalMes), original: Math.round(originalMes) };
    });

    return {
      totais: { somaOriginal, somaAtualizada, somaHonorarios, count: precatorios.length },
      projecaoMensal
    };
  }, [precatorios]);

  if (!totais) return null;

  const ganhoTotal = totais.somaAtualizada - totais.somaOriginal;
  const pctGanho = totais.somaOriginal > 0 ? ((ganhoTotal / totais.somaOriginal) * 100).toFixed(1) : 0;

  return (
    <div className="glass-card rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Impacto Financeiro Total da Carteira</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{totais.count} precatório{totais.count !== 1 ? 's' : ''} cadastrado{totais.count !== 1 ? 's' : ''}</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Layers className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-muted/40 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Soma Original</span>
          </div>
          <p className="text-sm font-bold text-blue-400 font-mono">{formatCurrency(totais.somaOriginal)}</p>
        </div>
        <div className="bg-muted/40 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Soma Atualizada</span>
          </div>
          <p className="text-sm font-bold text-emerald-400 font-mono">{formatCurrency(totais.somaAtualizada)}</p>
        </div>
        <div className="bg-muted/40 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Ganho Acumulado</span>
          </div>
          <p className="text-sm font-bold text-amber-400 font-mono">+{formatCurrency(ganhoTotal)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">+{pctGanho}%</p>
        </div>
        <div className="bg-muted/40 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Honorários</span>
          </div>
          <p className="text-sm font-bold text-purple-400 font-mono">{formatCurrency(totais.somaHonorarios)}</p>
        </div>
      </div>

      {/* Projeção mensal */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          Projeção de Valores Atualizados — Próximos 12 Meses
        </p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projecaoMensal} margin={{ top: 4, right: 4, left: 4, bottom: 4 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1_000_000).toFixed(1)}M`}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <ReferenceLine y={totais.somaAtualizada} stroke="rgba(52,211,153,0.3)" strokeDasharray="4 2" />
              <Bar dataKey="atualizado" fill="#34d399" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 text-center">
          * Projeção estimada com base na taxa SELIC do último período calculado
        </p>
      </div>
    </div>
  );
}