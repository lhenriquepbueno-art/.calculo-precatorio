import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Clock, User, FileText, Loader2 } from 'lucide-react';
import moment from 'moment';
import TributacaoPanel from '@/components/dashboard/TributacaoPanel';

const acaoColors = {
  'Cadastro': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Cálculo': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Edição': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Exclusão': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Exportação': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Recálculo': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

export default function Auditoria() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await base44.entities.AuditLog.list('-created_date', 100);
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          Auditoria
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Registro completo de todas as alterações e operações
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Shield className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum registro de auditoria encontrado</p>
          <p className="text-xs text-muted-foreground/50 mt-1">As operações serão registradas automaticamente</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Data/Hora</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ação</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Descrição</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Versão</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-border/10 hover:bg-white/3">
                    <td className="py-2.5 px-4 font-mono text-foreground/60">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {moment(log.created_date).format('DD/MM/YYYY HH:mm:ss')}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${acaoColors[log.acao] || 'bg-muted text-muted-foreground border-border'}`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-foreground/80 max-w-md truncate">{log.descricao}</td>
                    <td className="py-2.5 px-4 font-mono text-muted-foreground">{log.versao || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TributacaoPanel />
    </div>
  );
}