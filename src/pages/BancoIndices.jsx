import React, { useState } from 'react';
import { IPCA_E_DATA, SELIC_DATA } from '@/lib/indices-data';
import { Database, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg p-3 shadow-xl border border-white/10">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-blue-400 font-mono">{payload[0].value.toFixed(2).replace('.', ',')}%</p>
    </div>
  );
}

const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function IndiceTable({ data, color }) {
  const anos = Object.keys(data).sort((a, b) => Number(b) - Number(a));
  const [selectedAno, setSelectedAno] = useState(anos[0]);

  const meses = data[selectedAno] || {};
  const chartData = Object.entries(meses).map(([mes, valor]) => ({
    name: mesesNomes[Number(mes) - 1],
    valor
  }));

  const acumuladoAno = Object.values(meses).reduce((sum, v) => sum + v, 0);
  const barColor = color === 'cyan' ? '#22d3ee' : '#f59e0b';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={selectedAno} onValueChange={setSelectedAno}>
          <SelectTrigger className="w-32 bg-muted/50 border-border/50 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {anos.map(a => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase">Acumulado no Ano</p>
          <p className="text-sm font-bold font-mono" style={{ color: barColor }}>
            {acumuladoAno.toFixed(2).replace('.', ',')}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="valor" fill={barColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Mês</th>
              <th className="text-right py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Taxa (%)</th>
              <th className="text-right py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Acumulado (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(meses).sort((a, b) => Number(a[0]) - Number(b[0])).map(([mes, valor]) => {
              const acum = Object.entries(meses)
                .filter(([m]) => Number(m) <= Number(mes))
                .reduce((s, [, v]) => s + v, 0);
              return (
                <tr key={mes} className="border-b border-border/10 hover:bg-white/3">
                  <td className="py-1.5 px-3 font-mono text-foreground/80">
                    {mesesNomes[Number(mes) - 1]}/{selectedAno}
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono" style={{ color: barColor }}>
                    {valor.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono text-foreground/60">
                    {acum.toFixed(2).replace('.', ',')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BancoIndices() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          Banco de Índices
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Índices financeiros utilizados na atualização de precatórios
        </p>
      </div>

      <Tabs defaultValue="ipca" className="w-full">
        <TabsList className="bg-muted/50 border border-border/50">
          <TabsTrigger value="ipca" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-xs">
            IPCA-E
          </TabsTrigger>
          <TabsTrigger value="selic" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-xs">
            SELIC
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ipca">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <h3 className="text-sm font-semibold text-foreground">IPCA-E — Índice Nacional de Preços ao Consumidor Amplo Especial</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Fonte: IBGE · Aplicado na Fase 1 da atualização (data-base até novembro/2021)
            </p>
            <IndiceTable data={IPCA_E_DATA} color="cyan" />
          </div>
        </TabsContent>

        <TabsContent value="selic">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">SELIC — Sistema Especial de Liquidação e de Custódia</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Fonte: Banco Central do Brasil · Aplicado na Fase 2 (a partir de dezembro/2021 — EC 113/2021)
            </p>
            <IndiceTable data={SELIC_DATA} color="amber" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}