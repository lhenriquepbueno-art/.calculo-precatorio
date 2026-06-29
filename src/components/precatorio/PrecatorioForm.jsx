import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Upload, FileText, Loader2 } from 'lucide-react';

export default function PrecatorioForm({ onSuccess }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({
    numero_processo: '',
    numero_precatorio: '',
    tribunal: 'TJSP',
    data_transito_julgado: '',
    data_base_conta: '',
    data_inscricao: '',
    valor_principal: '',
    valor_honorarios: '',
    valor_juros_original: '',
    data_prevista_pagamento: '',
    ente_devedor: 'Estado de São Paulo',
    natureza: 'Comum',
    metodo_selic: 'Linear',
    notas: ''
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const res = await base44.integrations.Core.UploadFile({ file });
        uploaded.push(res.file_url);
      }
      setDocs(prev => [...prev, ...uploaded]);
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        valor_principal: parseFloat(form.valor_principal) || 0,
        valor_honorarios: parseFloat(form.valor_honorarios) || 0,
        valor_juros_original: parseFloat(form.valor_juros_original) || 0,
        documentos: docs,
        status: 'Cadastrado'
      };
      await base44.entities.Precatorio.create(data);
      onSuccess?.();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const fieldClass = "bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:border-blue-500/50 focus:ring-blue-500/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados do Processo */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Dados do Processo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Número do Processo *</Label>
            <Input className={fieldClass} value={form.numero_processo} onChange={e => handleChange('numero_processo', e.target.value)} placeholder="0000000-00.0000.0.00.0000" required />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Número do Precatório *</Label>
            <Input className={fieldClass} value={form.numero_precatorio} onChange={e => handleChange('numero_precatorio', e.target.value)} placeholder="000/0000" required />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Tribunal *</Label>
            <Select value={form.tribunal} onValueChange={v => handleChange('tribunal', v)}>
              <SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TJSP">TJSP</SelectItem>
                <SelectItem value="TRF3">TRF3</SelectItem>
                <SelectItem value="TRT2">TRT2</SelectItem>
                <SelectItem value="TRT15">TRT15</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Ente Devedor</Label>
            <Input className={fieldClass} value={form.ente_devedor} onChange={e => handleChange('ente_devedor', e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Natureza</Label>
            <Select value={form.natureza} onValueChange={v => handleChange('natureza', v)}>
              <SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Alimentar">Alimentar</SelectItem>
                <SelectItem value="Comum">Comum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Datas */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          Datas Relevantes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Data do Trânsito em Julgado</Label>
            <Input type="date" className={fieldClass} value={form.data_transito_julgado} onChange={e => handleChange('data_transito_julgado', e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Data-Base da Conta Judicial *</Label>
            <Input type="date" className={fieldClass} value={form.data_base_conta} onChange={e => handleChange('data_base_conta', e.target.value)} required />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Data da Inscrição *</Label>
            <Input type="date" className={fieldClass} value={form.data_inscricao} onChange={e => handleChange('data_inscricao', e.target.value)} required />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Data Prevista para Pagamento</Label>
            <Input type="date" className={fieldClass} value={form.data_prevista_pagamento} onChange={e => handleChange('data_prevista_pagamento', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Valores */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Valores
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Valor Principal (R$) *</Label>
            <Input type="number" step="0.01" className={fieldClass} value={form.valor_principal} onChange={e => handleChange('valor_principal', e.target.value)} placeholder="0,00" required />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Honorários (R$)</Label>
            <Input type="number" step="0.01" className={fieldClass} value={form.valor_honorarios} onChange={e => handleChange('valor_honorarios', e.target.value)} placeholder="0,00" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Juros da Conta Original (R$)</Label>
            <Input type="number" step="0.01" className={fieldClass} value={form.valor_juros_original} onChange={e => handleChange('valor_juros_original', e.target.value)} placeholder="0,00" />
          </div>
        </div>
      </div>

      {/* Método SELIC */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Parâmetros de Cálculo
        </h3>
        <div className="max-w-xs">
          <Label className="text-xs text-muted-foreground">Método SELIC (Fase 2)</Label>
          <Select value={form.metodo_selic} onValueChange={v => handleChange('metodo_selic', v)}>
            <SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Linear">SELIC Linear (Padrão)</SelectItem>
              <SelectItem value="Acumulada">SELIC Acumulada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Documentos */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          Documentos
        </h3>
        <div className="border border-dashed border-border/50 rounded-lg p-6 text-center">
          <input type="file" id="file-upload" multiple accept=".pdf,.jpg,.png" className="hidden" onChange={handleFileUpload} />
          <label htmlFor="file-upload" className="cursor-pointer">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-muted-foreground mx-auto animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-muted-foreground mx-auto" />
            )}
            <p className="text-xs text-muted-foreground mt-2">Clique para anexar documentos</p>
            <p className="text-[10px] text-muted-foreground/50">PDF do processo, conta judicial, ofício requisitório</p>
          </label>
        </div>
        {docs.length > 0 && (
          <div className="mt-3 space-y-1">
            {docs.map((url, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="w-3 h-3" />
                <span>Documento {i + 1}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notas */}
      <div>
        <Label className="text-xs text-muted-foreground">Observações</Label>
        <Textarea className={`${fieldClass} min-h-[80px]`} value={form.notas} onChange={e => handleChange('notas', e.target.value)} placeholder="Observações adicionais..." />
      </div>

      <Button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {saving ? 'Cadastrando...' : 'Cadastrar Precatório'}
      </Button>
    </form>
  );
}