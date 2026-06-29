import React from 'react';

export default function StatCard({ label, value, subtitle, icon: Icon, color = 'blue', glow = false }) {
  const colorMap = {
    blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glowClass: 'glow-blue' },
    green: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glowClass: 'glow-green' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glowClass: 'glow-amber' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', glowClass: '' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', glowClass: '' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`glass-card rounded-xl p-5 transition-all duration-300 glass-hover ${glow ? c.glowClass : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${c.text}`} />
          </div>
        )}
      </div>
      <p className={`text-2xl font-bold ${c.text} font-mono animate-count-up`}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
    </div>
  );
}