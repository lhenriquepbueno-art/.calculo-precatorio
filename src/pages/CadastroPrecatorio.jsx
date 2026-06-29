import React from 'react';
import { useNavigate } from 'react-router-dom';
import PrecatorioForm from '@/components/precatorio/PrecatorioForm';
import { ArrowLeft, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CadastroPrecatorio() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-3 h-3" />
          Voltar ao Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Cadastrar Precatório</h1>
            <p className="text-xs text-muted-foreground">Informe os dados para cálculo de atualização monetária</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="glass-card rounded-xl p-6">
        <PrecatorioForm onSuccess={() => navigate('/')} />
      </div>
    </div>
  );
}