import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { calcularPrecatorio, formatCurrency, formatPercent } from '@/lib/calculo-engine';
import StatCard from '@/components/dashboard/StatCard';
import EvolutionChart from '@/components/dashboard/EvolutionChart';
import TimelineCard from '@/components/dashboard/TimelineCard';
import MethodologySummary from '@/components/dashboard/MethodologySummary';
import PortfolioPanel from '@/components/dashboard/PortfolioPanel';
import RelatorioGenerator from '@/components/relatorio/RelatorioGenerator';
import { 
  DollarSign, TrendingUp, Calculator, Scale, Clock, 
  FilePlus, ArrowRight, FileText, BarChart3, Loader2, Trash2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export default function Home() {
  const [precatorios, setPrecatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [deletingCalculo, setDeletingCalculo] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [recalculando, setRecalculando] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPrecatorios();
  }, []);

  const loadPrecatorios = async () => {
    try {
      const data = await base44.entities.Precatorio.list('-created_date', 50);
      setPrecatorios(data);
      if (data.length > 0) {
        setSelectedId(data[0].id);
        runCalculo(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const runCalculo = (prec) => {
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
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    const prec = precatorios.find(p => p.id === id);
    if (prec) runCalculo(prec);
  };

  const selectedPrec = precatorios.find(p => p.id === selectedId);

  const handleRecalcular = async () => {
    if (!selectedPrec) return;
    setRecalculando(true);
    const res = calcularPrecatorio({
      valorPrincipal: selectedPrec.valor_principal,
      valorHonorarios: selectedPrec.valor_honorarios || 0,
      valorJurosOriginal: selectedPrec.valor_juros_original || 0,
      dataBaseConta: selectedPrec.data_base_conta,
      dataInscricao: selectedPrec.data_inscricao,
      dataPagamento: selectedPrec.data_prevista_pagamento,
      metodoSelic: selectedPrec.metodo_selic || 'Linear'
    });
    setResultado(res);
    if (!res.erro) {
      const memoriaJson = JSON.stringify({ memoriaCompleta: res.memoriaCompleta });
      const blob = new Blob([memoriaJson], { type: 'application/json' });
      const file = new File([blob], `memoria_${selectedPrec.id}.json`, { type: 'application/json' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Precatorio.update(selectedPrec.id, {
        valor_atualizado: res.valorAtualizado,
        valor_consolidado_nov2021: res.consolidacao.valorConsolidado,
        percentual_correcao: res.percentualCorrecao,
        dentro_prazo_constitucional: res.prazoConstitucional.dentro,
        memoria_calculo: file_url,
        status: 'Calculado'
      });
      await base44.entities.AuditLog.create({
        precatorio_id: selectedPrec.id,
        acao: 'Recálculo',
        descricao: `Recálculo realizado em ${new Date().toLocaleDateString('pt-BR')} — Valor atualizado: ${formatCurrency(res.valorAtualizado)}`
      });
      toast({ title: 'Recálculo concluído', description: `Valor atualizado: ${formatCurrency(res.valorAtualizado)}` });
    }
    setRecalculando(false);
  };

  const handleDeleteCalculo = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeletingCalculo(true);
    await base44.entities.Precatorio.update(selectedId, {
      valor_atualizado: null,
      valor_consolidado_nov2021: null,
      percentual_correcao: null,
      dentro_prazo_constitucional: null,
      memoria_calculo: null,
      status: 'Cadastrado'
    });
    await base44.entities.AuditLog.create({
      precatorio_id: selectedId,
      acao: 'Recálculo',
      descricao: `Cálculo excluído do precatório ${selectedPrec?.numero_precatorio}`
    });
    setResultado(null);
    setConfirmDelete(false);
    setDeletingCalculo(false);
    toast({ title: 'Cálculo excluído', description: 'Os dados calculados foram removidos.' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  // Empty state
  if (precatorios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
          <Scale className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Bem-vindo ao Precatório SP AI</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          Plataforma de inteligência artificial para atualização monetária de precatórios do Estado de São Paulo.
        </p>
        <Link to="/cadastro">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <FilePlus className="w-4 h-4" />
            Cadastrar Primeiro Precatório
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Painel de atualização monetária de precatórios</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedId} onValueChange={handleSelect}>
            <SelectTrigger className="w-64 bg-muted/50 border-border/50 text-sm">
              <SelectValue placeholder="Selecionar precatório" />
            </SelectTrigger>
            <SelectContent>
              {precatorios.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.numero_precatorio} — {formatCurrency(p.valor_principal)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <RelatorioGenerator prec={selectedPrec} resultado={resultado} />
          <Link to="/cadastro">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
              <FilePlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Novo</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Precatorio info bar */}
      {selectedPrec && (
        <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase">Processo</span>
            <p className="text-xs font-mono text-foreground">{selectedPrec.numero_processo}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase">Precatório</span>
            <p className="text-xs font-mono text-foreground">{selectedPrec.numero_precatorio}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase">Tribunal</span>
            <p className="text-xs font-mono text-foreground">{selectedPrec.tribunal}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase">Natureza</span>
            <p className="text-xs font-mono text-foreground">{selectedPrec.natureza}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase">Ente Devedor</span>
            <p className="text-xs font-mono text-foreground">{selectedPrec.ente_devedor}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={handleRecalcular}
              disabled={recalculando}
              className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              {recalculando ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {recalculando ? 'Recalculando...' : 'Recalcular'}
            </button>
            {resultado && !resultado.erro && (
              <button
                onClick={handleDeleteCalculo}
                disabled={deletingCalculo}
                onBlur={() => setConfirmDelete(false)}
                className={`text-xs flex items-center gap-1 transition-colors ${confirmDelete ? 'text-red-400 hover:text-red-300' : 'text-muted-foreground hover:text-red-400'}`}
              >
                {deletingCalculo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                {confirmDelete ? 'Confirmar exclusão' : 'Excluir cálculo'}
              </button>
            )}
            <Link to={`/precatorio/${selectedPrec.id}`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Ver detalhes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {resultado && !resultado.erro && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Valor Original"
              value={formatCurrency(resultado.valorOriginal)}
              subtitle="Valor principal na data-base"
              icon={DollarSign}
              color="blue"
            />
            <StatCard
              label="Valor Atualizado"
              value={formatCurrency(resultado.valorAtualizado)}
              subtitle={`Atualizado em ${new Date().toLocaleDateString('pt-BR')}`}
              icon={TrendingUp}
              color="green"
              glow
            />
            <StatCard
              label="Correção Acumulada"
              value={formatPercent(resultado.percentualCorrecao)}
              subtitle="Percentual total de correção"
              icon={BarChart3}
              color="amber"
            />
            <StatCard
              label="Consolidado Nov/2021"
              value={formatCurrency(resultado.consolidacao.valorConsolidado)}
              subtitle="Base para Fase 2 (SELIC)"
              icon={Calculator}
              color="purple"
            />
          </div>

          {/* Charts + Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <EvolutionChart data={resultado.memoriaCompleta} />
            </div>
            <TimelineCard resultado={resultado} />
          </div>

          {/* Methodology */}
          <MethodologySummary resultado={resultado} />
        </>
      )}

      {/* Portfolio Panel — always visible when there are precatórios */}
      <PortfolioPanel precatorios={precatorios} />
    </div>
  );
}