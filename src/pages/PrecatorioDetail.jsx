import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { calcularPrecatorio, formatCurrency, formatPercent } from '@/lib/calculo-engine';
import StatCard from '@/components/dashboard/StatCard';
import EvolutionChart from '@/components/dashboard/EvolutionChart';
import TimelineCard from '@/components/dashboard/TimelineCard';
import MethodologySummary from '@/components/dashboard/MethodologySummary';
import MemoriaCalculo from '@/components/precatorio/MemoriaCalculo';
import RelatorioGenerator from '@/components/relatorio/RelatorioGenerator';
import { 
  ArrowLeft, DollarSign, TrendingUp, Calculator, BarChart3,
  Loader2, RefreshCw, Trash2, Download, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function PrecatorioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prec, setPrec] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadPrecatorio();
  }, [id]);

  const loadPrecatorio = async () => {
    try {
      const data = await base44.entities.Precatorio.get(id);
      setPrec(data);
      runCalculo(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const runCalculo = (data) => {
    const res = calcularPrecatorio({
      valorPrincipal: data.valor_principal,
      valorHonorarios: data.valor_honorarios || 0,
      valorJurosOriginal: data.valor_juros_original || 0,
      dataBaseConta: data.data_base_conta,
      dataInscricao: data.data_inscricao,
      dataPagamento: data.data_prevista_pagamento,
      metodoSelic: data.metodo_selic || 'Linear'
    });
    setResultado(res);
  };

  const handleRecalculate = async () => {
    setCalculating(true);
    const res = calcularPrecatorio({
      valorPrincipal: prec.valor_principal,
      valorHonorarios: prec.valor_honorarios || 0,
      valorJurosOriginal: prec.valor_juros_original || 0,
      dataBaseConta: prec.data_base_conta,
      dataInscricao: prec.data_inscricao,
      dataPagamento: prec.data_prevista_pagamento,
      metodoSelic: prec.metodo_selic || 'Linear'
    });
    setResultado(res);

    // Upload memoria_calculo as a file to avoid field size limits
    const file = new File([JSON.stringify(res)], 'memoria_calculo.json', { type: 'application/json' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    // Save updated values
    await base44.entities.Precatorio.update(id, {
      valor_atualizado: res.valorAtualizado,
      valor_consolidado_nov2021: res.consolidacao.valorConsolidado,
      percentual_correcao: res.percentualCorrecao,
      dentro_prazo_constitucional: res.prazoConstitucional.dentro,
      memoria_calculo: file_url,
      status: 'Calculado'
    });

    // Audit log
    await base44.entities.AuditLog.create({
      precatorio_id: id,
      acao: 'Cálculo',
      descricao: `Cálculo atualizado. Valor: ${formatCurrency(res.valorAtualizado)}`,
      dados_novos: JSON.stringify({ valorAtualizado: res.valorAtualizado, percentual: res.percentualCorrecao })
    });

    toast({ title: 'Cálculo atualizado', description: `Valor: ${formatCurrency(res.valorAtualizado)}` });
    setCalculating(false);
  };

  const handleDelete = async () => {
    await base44.entities.Precatorio.delete(id);
    await base44.entities.AuditLog.create({
      precatorio_id: id,
      acao: 'Exclusão',
      descricao: `Precatório ${prec.numero_precatorio} excluído`
    });
    navigate('/');
  };

  const handleExportCSV = () => {
    if (!resultado || !resultado.memoriaCompleta) return;
    const headers = 'Período;Fase;Índice;Taxa (%);Valor Atualizado\n';
    const rows = resultado.memoriaCompleta.map(r => 
      `${r.periodo};${r.fase};${r.indice};${r.taxa};${r.valorAtualizado}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `precatorio_${prec.numero_precatorio}_memoria.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!prec) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Precatório não encontrado</p>
        <Link to="/" className="text-blue-400 text-sm mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </Link>
          <h1 className="text-lg font-bold text-foreground">Precatório {prec.numero_precatorio}</h1>
          <p className="text-xs text-muted-foreground">{prec.numero_processo} · {prec.tribunal} · {prec.ente_devedor}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <RelatorioGenerator prec={prec} resultado={resultado} />
          <Button size="sm" variant="outline" className="gap-1.5 border-border/50" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 border-border/50 text-red-400 hover:text-red-300 hover:border-red-500/30" onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5" /> Excluir
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5" onClick={handleRecalculate} disabled={calculating}>
            {calculating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Recalcular
          </Button>
        </div>
      </div>

      {resultado && !resultado.erro && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Valor Original" value={formatCurrency(resultado.valorOriginal)} icon={DollarSign} color="blue" />
            <StatCard label="Valor Atualizado" value={formatCurrency(resultado.valorAtualizado)} icon={TrendingUp} color="green" glow />
            <StatCard label="Correção Total" value={formatPercent(resultado.percentualCorrecao)} icon={BarChart3} color="amber" />
            <StatCard label="Consolidado Nov/2021" value={formatCurrency(resultado.consolidacao.valorConsolidado)} icon={Calculator} color="purple" />
          </div>

          {/* Chart + Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <EvolutionChart data={resultado.memoriaCompleta} />
            </div>
            <TimelineCard resultado={resultado} />
          </div>

          {/* Methodology */}
          <MethodologySummary resultado={resultado} />

          {/* Memória de Cálculo */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Memória de Cálculo Detalhada
            </h2>
            <MemoriaCalculo resultado={resultado} />
          </div>
        </>
      )}
    </div>
  );
}