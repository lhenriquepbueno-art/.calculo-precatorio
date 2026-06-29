import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, AlertTriangle, Info, Receipt, FileText, Percent, Building2 } from 'lucide-react';

const Section = ({ icon: Icon, title, color, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  };
  const c = colorMap[color] || colorMap.blue;
  const [textColor] = c.split(' ');

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${c}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-2 border-t border-border/40 pt-4">{children}</div>}
    </div>
  );
};

const InfoRow = ({ label, value, highlight }) => (
  <div className={`flex items-start justify-between gap-4 py-2 px-3 rounded-lg ${highlight ? 'bg-blue-500/5 border border-blue-500/10' : 'bg-muted/30'}`}>
    <span className="text-xs text-muted-foreground flex-1">{label}</span>
    <span className="text-xs font-semibold text-foreground text-right">{value}</span>
  </div>
);

const Tag = ({ text, type }) => {
  const map = {
    isento: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    tributavel: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${map[type] || map.info}`}>
      {text}
    </span>
  );
};

export default function TributacaoPanel({ prec }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Receipt className="w-4 h-4 text-amber-400" />
        <h2 className="text-sm font-bold text-foreground">Tributação</h2>
        <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">Informativo — consulte seu advogado/contador</span>
      </div>

      {/* Natureza do precatório */}
      {prec && (
        <div className="glass-card rounded-xl p-4 flex flex-wrap gap-4 items-center">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Natureza cadastrada</p>
            <Tag
              text={prec.natureza === 'Alimentar' ? 'Alimentar (potencialmente tributável)' : 'Comum (verificar natureza indenizatória)'}
              type={prec.natureza === 'Alimentar' ? 'tributavel' : 'info'}
            />
          </div>
          <div className="flex-1 text-xs text-muted-foreground">
            {prec.natureza === 'Alimentar'
              ? 'Precatórios alimentares de origem salarial/remuneratória geralmente têm incidência de IR. Verbas de caráter indenizatório, mesmo em processo trabalhista, podem ser isentas.'
              : 'Precatórios comuns com natureza indenizatória (danos morais, desapropriação, danos materiais) são isentos de IR. Confirme a origem com seu advogado.'}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* 1. Incidência do IR */}
        <Section icon={AlertTriangle} title="1. Incidência do Imposto de Renda (IR)" color="amber" defaultOpen={true}>
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground mb-3">A tributação depende da natureza jurídica do crédito:</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-red-400 mb-0.5">Verbas Tributáveis</p>
                  <p className="text-[11px] text-muted-foreground">Salários atrasados, adicionais, gratificações, pensões e revisões previdenciárias (SPPrev) de servidores públicos estaduais.</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <ShieldCheck className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-emerald-400 mb-0.5">Verbas Isentas (Não Tributáveis)</p>
                  <p className="text-[11px] text-muted-foreground">Indenizações por danos morais, danos materiais, lucros cessantes, desapropriações de imóveis e ressarcimento de perdas físicas.</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                <Info className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-cyan-400 mb-0.5">Juros de Mora — Posição do STJ</p>
                  <p className="text-[11px] text-muted-foreground">Por jurisprudência consolidada no STJ, os juros de mora sobre verbas trabalhistas/salariais atrasadas são <strong className="text-foreground">isentos de IR</strong>.</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 2. RRA */}
        <Section icon={Percent} title="2. Retenção na Fonte e Regra do RRA" color="blue" defaultOpen={true}>
          <div className="space-y-2">
            <InfoRow label="Retenção antecipada (instituição financeira)" value="3% na fonte" highlight />
            <InfoRow label="Instituição depositária" value="Banco do Brasil ou Caixa Econômica Federal" />
            <div className="mt-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <p className="text-[11px] font-semibold text-purple-400 mb-1">Regra RRA (Rendimentos Recebidos Acumuladamente)</p>
              <p className="text-[11px] text-muted-foreground">
                Na declaração anual, o valor total do precatório é <strong className="text-foreground">dividido pelo número de meses</strong> a que se refere o período de acumulação. A alíquota de IR é aplicada sobre essa <strong className="text-foreground">média mensal</strong>, evitando a tributação pela alíquota máxima em um único mês.
              </p>
            </div>
            <div className="mt-2 p-2.5 rounded-lg bg-muted/30">
              <p className="text-[11px] text-muted-foreground">
                <strong className="text-foreground">Tributação Exclusiva na Fonte</strong> (opção do contribuinte no RRA) geralmente gera maior restituição do IR retido antecipadamente.
              </p>
            </div>
          </div>
        </Section>

        {/* 3. Deduções SP */}
        <Section icon={Building2} title="3. Outras Deduções — Estado de SP" color="purple">
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <p className="text-[11px] font-semibold text-purple-400 mb-1">Contribuição Previdenciária (SPPrev)</p>
              <p className="text-[11px] text-muted-foreground">Se o precatório decorrer de revisões salariais ou gratificações de servidores ativos/inativos estaduais, haverá <strong className="text-foreground">retenção da alíquota previdenciária oficial</strong> antes da liberação do saldo líquido.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <p className="text-[11px] font-semibold text-amber-400 mb-1">Acordo Direto PGE/SP (Deságio)</p>
              <p className="text-[11px] text-muted-foreground">Nas rodadas de acordo da Procuradoria Geral do Estado (PGE/SP) para pagamento antecipado, aplica-se um <strong className="text-foreground">deságio de até 20%</strong> sobre o valor bruto atualizado do título.</p>
            </div>
          </div>
        </Section>

        {/* 4. Como declarar */}
        <Section icon={FileText} title="4. Como Declarar o Precatório no IR" color="green">
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground">O recebimento do precatório <strong className="text-foreground">deve constar obrigatoriamente</strong> na declaração anual de IR, independentemente de ser tributável ou isento.</p>
            <InfoRow label="Emissão do Informe de Rendimentos" value="Portal de Precatórios TJSP ou PGE/SP" />
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center gap-2">
                <Tag text="ISENTO" type="isento" />
                <p className="text-[11px] text-muted-foreground">Declarar em <strong className="text-foreground">"Rendimentos Isentos e Não Tributáveis"</strong></p>
              </div>
              <div className="flex items-center gap-2">
                <Tag text="TRIBUTÁVEL" type="tributavel" />
                <p className="text-[11px] text-muted-foreground">Declarar em <strong className="text-foreground">"Rendimentos Recebidos Acumuladamente (RRA)"</strong> — optar pela Tributação Exclusiva na Fonte</p>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/20 border border-border/30">
        <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-[10px] text-muted-foreground">
          As informações acima têm caráter <strong className="text-foreground">meramente informativo</strong> e não constituem consultoria jurídica ou tributária. Para análise específica do seu caso — natureza do crédito, regime de tributação aplicável e cálculo do RRA — consulte um advogado tributarista ou contador habilitado.
        </p>
      </div>
    </div>
  );
}