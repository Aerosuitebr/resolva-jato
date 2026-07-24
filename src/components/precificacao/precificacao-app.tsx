'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Copy,
  MessageCircle,
  Package,
  Percent,
  PiggyBank,
  Tag,
  Wallet
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { EditorStepProgress } from '@/components/shared/editor-step-progress';
import { PageHero } from '@/components/shared/page-hero';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { formatCurrency, formatCurrencyInput, parseCurrency } from '@/lib/formatters';
import {
  calcularPrecificacao,
  type PrecificacaoCompositionSlice
} from '@/lib/precificacao/calc';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'custos', label: 'Materiais' },
  { id: 'tempo', label: 'Seu tempo' },
  { id: 'fixos', label: 'Custos fixos' },
  { id: 'margem', label: 'Impostos' }
] as const;

type StepId = (typeof STEPS)[number]['id'];

const SLICE_STYLE: Record<
  PrecificacaoCompositionSlice['id'],
  { bar: string; dot: string; text: string }
> = {
  material: { bar: 'bg-sky-500', dot: 'bg-sky-500', text: 'text-sky-800' },
  maoDeObra: { bar: 'bg-teal-500', dot: 'bg-teal-500', text: 'text-teal-800' },
  custoFixo: { bar: 'bg-amber-500', dot: 'bg-amber-500', text: 'text-amber-900' },
  taxasImpostos: { bar: 'bg-slate-500', dot: 'bg-slate-500', text: 'text-slate-800' },
  lucro: { bar: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-800' }
};

export function PrecificacaoApp() {
  const { toast } = useToast();
  const [step, setStep] = useState<StepId>('custos');
  const [custoDiretoInput, setCustoDiretoInput] = useState('');
  const [custosFixosInput, setCustosFixosInput] = useState('');
  const [vendasMensais, setVendasMensais] = useState(30);
  const [horas, setHoras] = useState(1);
  const [valorHoraInput, setValorHoraInput] = useState('');
  const [taxaCartao, setTaxaCartao] = useState(4.99);
  const [imposto, setImposto] = useState(6);
  const [margem, setMargem] = useState(20);

  const custoDireto = parseCurrency(custoDiretoInput);
  const custosFixos = parseCurrency(custosFixosInput);
  const valorHora = parseCurrency(valorHoraInput);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const isFirst = stepIndex <= 0;
  const isLast = stepIndex >= STEPS.length - 1;

  const resultado = useMemo(() => {
    const temBase = custoDireto > 0 || custosFixos > 0 || (horas > 0 && valorHora > 0);
    if (!temBase) return null;
    return calcularPrecificacao({
      custoDireto,
      custosFixosMensais: custosFixos,
      vendasMensaisEstimadas: vendasMensais,
      horasTrabalhadas: horas,
      valorHora,
      taxasCartaoPercentual: taxaCartao,
      impostoPercentual: imposto,
      margemLucroDesejadaPercentual: margem
    });
  }, [custoDireto, custosFixos, vendasMensais, horas, valorHora, taxaCartao, imposto, margem]);

  const partialHint = useMemo(() => {
    if (!resultado) {
      if (custoDireto > 0) return `Materiais: ${formatCurrency(custoDireto)} — continue para cobrir seu tempo.`;
      return 'Preencha o primeiro valor e o preço sugerido aparece na hora.';
    }
    if (step === 'custos') {
      return `Só com materiais, o piso já está em ${formatCurrency(resultado.precoFinal)}.`;
    }
    if (step === 'tempo') {
      return `Com o seu tempo, o preço sobe para ${formatCurrency(resultado.precoFinal)}.`;
    }
    if (step === 'fixos') {
      return `Rateando o fixo, o sugerido fica em ${formatCurrency(resultado.precoFinal)}.`;
    }
    return `Preço final sugerido: ${formatCurrency(resultado.precoFinal)}.`;
  }, [resultado, custoDireto, step]);

  function goNext() {
    if (isLast) return;
    setStep(STEPS[stepIndex + 1].id);
  }

  function goPrev() {
    if (isFirst) return;
    setStep(STEPS[stepIndex - 1].id);
  }

  function resumoTexto() {
    if (!resultado) return '';
    return [
      '*Precificação — Resolva Jato*',
      `Custo total (material + mão de obra + rateio fixo): ${formatCurrency(resultado.custoTotal)}`,
      `Preço de venda sugerido: ${formatCurrency(resultado.precoFinal)}`,
      `Lucro líquido estimado por venda: ${formatCurrency(resultado.lucroLiquidoPorVenda)} (${resultado.margemLiquidaReal.toFixed(1)}%)`,
      `Markup sobre custo direto: ${resultado.markup.toFixed(2)}x`,
      '',
      'Estimativa educativa. Ajuste conforme concorrência e percepção de valor do seu público.'
    ].join('\n');
  }

  function handleCopy() {
    if (!resultado) return;
    navigator.clipboard.writeText(resumoTexto());
    toast('Resultado copiado!');
  }

  function handleWhatsApp() {
    if (!resultado) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(resumoTexto())}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <AuthGate title="Calculadora de Precificação" description="Cadastre-se gratuitamente para calcular seu preço ideal.">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero
          title="Quanto cobrar sem perder dinheiro?"
          subtitle="Quatro passos curtos: materiais, seu tempo, custos fixos e a margem que você quer de verdade."
          icon={Tag}
        />

        <EditorStepProgress
          steps={[...STEPS]}
          currentId={step}
          onSelect={(id) => setStep(id as StepId)}
        />

        <div
          className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-950"
          role="status"
          aria-live="polite"
        >
          {partialHint}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <section
            aria-labelledby={`step-title-${step}`}
            className={cn(
              'space-y-4 rounded-2xl border p-4 shadow-sm sm:p-5',
              step === 'custos' && 'border-sky-200 bg-gradient-to-br from-sky-50 to-white',
              step === 'tempo' && 'border-teal-200 bg-gradient-to-br from-teal-50 to-white',
              step === 'fixos' && 'border-amber-200 bg-gradient-to-br from-amber-50 to-white',
              step === 'margem' && 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
            )}
          >
            {step === 'custos' ? (
              <>
                <StepHeader
                  id="step-title-custos"
                  icon={Package}
                  tone="sky"
                  title="Quanto você gasta em materiais?"
                  subtitle="Insumos, embalagem, deslocamento — o que sai do bolso por unidade."
                />
                <FormField
                  label="Materiais e insumos"
                  htmlFor="custo-direto"
                  required
                  hint="Pode ser aproximado. O importante é não esquecer nada."
                >
                  <Input
                    id="custo-direto"
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    value={custoDiretoInput}
                    onChange={(e) => setCustoDiretoInput(formatCurrencyInput(e.target.value))}
                    aria-required="true"
                  />
                </FormField>
              </>
            ) : null}

            {step === 'tempo' ? (
              <>
                <StepHeader
                  id="step-title-tempo"
                  icon={Clock3}
                  tone="teal"
                  title="Quanto vale a sua hora?"
                  subtitle="Seu tempo também é custo. Coloque um valor justo para você."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Horas por unidade" htmlFor="horas" hint="Produzir, entregar, revisar…">
                    <Input
                      id="horas"
                      type="number"
                      min={0}
                      step={0.5}
                      value={horas}
                      onChange={(e) => setHoras(Math.max(0, Number(e.target.value) || 0))}
                    />
                  </FormField>
                  <FormField label="Valor da sua hora" htmlFor="valor-hora" hint="Quanto você quer ganhar por hora.">
                    <Input
                      id="valor-hora"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={valorHoraInput}
                      onChange={(e) => setValorHoraInput(formatCurrencyInput(e.target.value))}
                    />
                  </FormField>
                </div>
              </>
            ) : null}

            {step === 'fixos' ? (
              <>
                <StepHeader
                  id="step-title-fixos"
                  icon={Wallet}
                  tone="amber"
                  title="E os custos que vêm todo mês?"
                  subtitle="Aluguel, internet, ferramentas — rateamos pelas vendas do mês."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Custos fixos mensais" htmlFor="custos-fixos" hint="Se não tiver, deixe zero.">
                    <Input
                      id="custos-fixos"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={custosFixosInput}
                      onChange={(e) => setCustosFixosInput(formatCurrencyInput(e.target.value))}
                    />
                  </FormField>
                  <FormField
                    label="Vendas por mês (estimativa)"
                    htmlFor="vendas-mensais"
                    hint="Quantas unidades você espera vender."
                  >
                    <Input
                      id="vendas-mensais"
                      type="number"
                      min={1}
                      value={vendasMensais}
                      onChange={(e) => setVendasMensais(Math.max(1, Number(e.target.value) || 1))}
                    />
                  </FormField>
                </div>
              </>
            ) : null}

            {step === 'margem' ? (
              <>
                <StepHeader
                  id="step-title-margem"
                  icon={Percent}
                  tone="emerald"
                  title="Quanto sobra no final?"
                  subtitle="Taxas, impostos e a margem de lucro que você quer proteger."
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <SliderField
                    id="taxa-cartao"
                    label="Taxa do cartão"
                    value={taxaCartao}
                    onChange={setTaxaCartao}
                    max={15}
                    step={0.1}
                  />
                  <SliderField
                    id="imposto"
                    label="Impostos"
                    value={imposto}
                    onChange={setImposto}
                    max={30}
                    step={0.5}
                  />
                  <SliderField
                    id="margem"
                    label="Margem de lucro"
                    value={margem}
                    onChange={setMargem}
                    max={80}
                    step={1}
                  />
                </div>
              </>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-4">
              <Button type="button" variant="outline" size="sm" onClick={goPrev} disabled={isFirst} icon={ArrowLeft}>
                Voltar
              </Button>
              {!isLast ? (
                <Button type="button" size="sm" onClick={goNext} icon={ArrowRight}>
                  Continuar
                </Button>
              ) : (
                <p className="text-xs font-semibold text-emerald-800">Pronto — confira o preço ao lado.</p>
              )}
            </div>
          </section>

          <aside
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            aria-labelledby="resultado-titulo"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                <PiggyBank className="h-4 w-4" aria-hidden />
              </span>
              <h2 id="resultado-titulo" className="rj-display text-base font-bold text-slate-900">
                Seu preço sugerido
              </h2>
            </div>

            {!resultado ? (
              <p className="text-sm font-medium leading-6 text-slate-600">
                Digite o valor dos materiais (ou do seu tempo) e o cálculo parcial já aparece aqui.
              </p>
            ) : (
              <div className="space-y-4">
                <div
                  className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 px-4 py-5 text-white"
                  aria-live="polite"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-200">Preço de venda</p>
                  <p className="rj-display mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                    {formatCurrency(resultado.precoFinal)}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Lucro estimado: {formatCurrency(resultado.lucroLiquidoPorVenda)} (
                    {resultado.margemLiquidaReal.toFixed(1)}%)
                  </p>
                </div>

                <CompositionChart slices={resultado.composition} total={resultado.precoFinal} />

                <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
                  <Row label="Rateio de custo fixo" value={resultado.custoFixoRateado} />
                  <Row label="Custo da mão de obra" value={resultado.custoMaoDeObra} />
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                    <span>Custo total por unidade</span>
                    <span>{formatCurrency(resultado.custoTotal)}</span>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Lucro / venda</p>
                    <p className="rj-display mt-1 text-lg font-bold text-emerald-900">
                      {formatCurrency(resultado.lucroLiquidoPorVenda)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Markup</p>
                    <p className="rj-display mt-1 text-lg font-bold text-slate-900">
                      {resultado.markup > 0 ? `${resultado.markup.toFixed(2)}x` : '—'}
                    </p>
                  </div>
                </div>

                <p className="text-xs leading-5 text-slate-600">
                  Estimativa educativa. Ajuste conforme concorrência e o valor que seu cliente enxerga.
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} icon={Copy}>
                    Copiar resultado
                  </Button>
                  <Button variant="success" size="sm" onClick={handleWhatsApp} icon={MessageCircle}>
                    Enviar no WhatsApp
                  </Button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </AuthGate>
  );
}

function StepHeader({
  id,
  icon: Icon,
  tone,
  title,
  subtitle
}: {
  id: string;
  icon: typeof Package;
  tone: 'sky' | 'teal' | 'amber' | 'emerald';
  title: string;
  subtitle: string;
}) {
  const toneClass = {
    sky: 'bg-sky-100 text-sky-800',
    teal: 'bg-teal-100 text-teal-800',
    amber: 'bg-amber-100 text-amber-900',
    emerald: 'bg-emerald-100 text-emerald-800'
  }[tone];

  return (
    <header className="flex gap-3">
      <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', toneClass)}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <h2 id={id} className="rj-display text-base font-bold text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-slate-600">{subtitle}</p>
      </div>
    </header>
  );
}

function CompositionChart({
  slices,
  total
}: {
  slices: PrecificacaoCompositionSlice[];
  total: number;
}) {
  const visible = slices.filter((s) => s.value > 0.009);
  const sum = visible.reduce((acc, s) => acc + s.value, 0) || total || 1;

  return (
    <div className="space-y-2" aria-label="Composição do preço">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Composição do preço</p>
      <div
        className="flex h-4 overflow-hidden rounded-full bg-slate-100"
        role="img"
        aria-label={visible
          .map((s) => `${s.label}: ${((s.value / sum) * 100).toFixed(0)}%`)
          .join(', ')}
      >
        {visible.map((slice) => (
          <div
            key={slice.id}
            className={cn('h-full min-w-[2px] transition-all', SLICE_STYLE[slice.id].bar)}
            style={{ width: `${(slice.value / sum) * 100}%` }}
            title={`${slice.label}: ${formatCurrency(slice.value)}`}
          />
        ))}
      </div>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {visible.map((slice) => {
          const pct = (slice.value / sum) * 100;
          return (
            <li key={slice.id} className="flex items-center justify-between gap-2 text-xs">
              <span className={cn('inline-flex items-center gap-1.5 font-semibold', SLICE_STYLE[slice.id].text)}>
                <span className={cn('h-2.5 w-2.5 rounded-full', SLICE_STYLE[slice.id].dot)} aria-hidden />
                {slice.label}
              </span>
              <span className="font-bold text-slate-800">
                {formatCurrency(slice.value)} · {pct.toFixed(0)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="font-bold text-slate-900">{formatCurrency(value)}</span>
    </div>
  );
}

function SliderField({
  id,
  label,
  value,
  onChange,
  max,
  step
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
  step: number;
}) {
  const valueId = `${id}-value`;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
          {label}
        </label>
        <span id={valueId} className="text-sm font-bold text-sky-800" aria-live="polite">
          {value}%
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-describedby={valueId}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-700"
      />
    </div>
  );
}
