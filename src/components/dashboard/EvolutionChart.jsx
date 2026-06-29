import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/calculo-engine';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg p-3 shadow-xl border border-white/10">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-blue-400 font-mono">{formatCurrency(payload[0].value)}</p>
      {payload[0].payload.taxa !== undefined && (
        <p className="text-xs text-muted-foreground mt-0.5">
          Taxa: {payload[0].payload.taxa.toFixed(2).replace('.', ',')}%
        </p>
      )}
    </div>
  );
}

export default function EvolutionChart({ data }) {
  if (!data || data.length === 0) return null;

  // Sample data to show max ~40 points for readability
  const step = Math.max(1, Math.floor(data.length / 40));
  const chartData = data.filter((_, i) => i % step === 0 || i === data.length - 1).map(d => ({
    periodo: d.periodo,
    valor: d.valorAtualizado,
    taxa: d.taxa
  }));

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Evolução do Crédito</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="periodo" 
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="valor" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#gradientBlue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}