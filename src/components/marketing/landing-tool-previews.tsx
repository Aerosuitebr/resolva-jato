'use client';

import type { ReactNode } from 'react';
import { CheckCircle2, MessageCircle, ThumbsUp } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ContabilPreview } from '@/components/contabeis/contabil-preview';
import { ContratoPreview } from '@/components/contratos/contrato-preview';
import { ResumePreview } from '@/components/curriculo/resume-preview';
import { JuridicoPreview } from '@/components/juridicos/juridico-preview';
import { PropostaPreview } from '@/components/propostas/proposta-preview';
import { ReciboPreview } from '@/components/recibos/recibo-preview';
import { TrabalhoPreview } from '@/components/trabalhos/trabalho-preview';
import { SAMPLE_CONTABIL_DOCUMENT } from '@/lib/contabeis/defaults';
import { SAMPLE_CONTRATO } from '@/lib/contratos/defaults';
import { SAMPLE_RESUME } from '@/lib/curriculo/defaults';
import { formatCurrency } from '@/lib/formatters';
import { SAMPLE_LEGAL_DOCUMENT } from '@/lib/juridicos/defaults';
import { buildPixBrCode } from '@/lib/pix/brcode';
import { SAMPLE_PROPOSAL } from '@/lib/propostas/defaults';
import { SAMPLE_RECEIPT } from '@/lib/recibos/defaults';
import { SAMPLE_TRABALHO } from '@/lib/trabalhos/defaults';
import { cn } from '@/lib/utils';

type FrameTone = 'light' | 'sky' | 'dark' | 'emerald' | 'amber';
type FrameTilt = 'flat' | 'left' | 'right';

function LandingDocFrame({
  children,
  tone = 'light',
  tilt = 'flat',
  maxHeightClass = 'max-h-[440px]',
  scaleClass = 'scale-[0.46]',
  className
}: {
  children: ReactNode;
  tone?: FrameTone;
  tilt?: FrameTilt;
  maxHeightClass?: string;
  scaleClass?: string;
  className?: string;
}) {
  const toneClass =
    tone === 'dark'
      ? 'bg-slate-900/40'
      : tone === 'sky'
        ? 'bg-sky-100/90'
        : tone === 'emerald'
          ? 'bg-emerald-100/80'
          : tone === 'amber'
            ? 'bg-amber-100/70'
            : 'bg-white';

  return (
    <div className={cn('relative mx-auto w-full max-w-[420px]', className)}>
      <div className={cn('absolute -inset-4 rounded-[2rem]', toneClass)} />
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100/90 p-2.5 shadow-[0_28px_70px_-28px_rgba(15,23,42,0.55)] sm:p-3',
          tilt === 'left' && 'sm:[transform:perspective(1400px)_rotateY(7deg)_rotateX(2deg)]',
          tilt === 'right' && 'sm:[transform:perspective(1400px)_rotateY(-7deg)_rotateX(2deg)]'
        )}
      >
        <div className={cn('overflow-hidden rounded-xl bg-white shadow-md', maxHeightClass)}>
          <div className={cn('origin-top', scaleClass)} style={{ width: '210mm' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Capa universitária ABNT — ângulo limpo, tipografia central. */
export function LandingTrabalhoPreview() {
  return (
    <LandingDocFrame tone="light" tilt="left" scaleClass="scale-[0.48]">
      <TrabalhoPreview data={SAMPLE_TRABALHO} />
    </LandingDocFrame>
  );
}

/** Currículo moderno — layout com barra lateral, o mais visual. */
export function LandingCurriculoPreview() {
  return (
    <LandingDocFrame tone="sky" tilt="right" scaleClass="scale-[0.44]">
      <ResumePreview data={{ ...SAMPLE_RESUME, templateId: 'modern' }} />
    </LandingDocFrame>
  );
}

/** Proposta criativa — o layout mais marcante da ferramenta. */
export function LandingPropostaPreview() {
  return (
    <LandingDocFrame tone="dark" tilt="left" scaleClass="scale-[0.42]" maxHeightClass="max-h-[460px]">
      <PropostaPreview data={{ ...SAMPLE_PROPOSAL, templateId: 'criativa' }} />
    </LandingDocFrame>
  );
}

/** Contrato de prestação — cabeçalho e cláusulas reais. */
export function LandingContratoPreview() {
  return (
    <LandingDocFrame tone="sky" tilt="right" scaleClass="scale-[0.44]">
      <ContratoPreview data={SAMPLE_CONTRATO} />
    </LandingDocFrame>
  );
}

/** Recibo moderno — faixa de valor em destaque. */
export function LandingReciboPreview() {
  return (
    <LandingDocFrame tone="emerald" tilt="left" scaleClass="scale-[0.48]" maxHeightClass="max-h-[400px]">
      <ReciboPreview data={{ ...SAMPLE_RECEIPT, templateId: 'moderno' }} />
    </LandingDocFrame>
  );
}

/** Procuração ad judicia — documento jurídico real. */
export function LandingJuridicoPreview() {
  return (
    <LandingDocFrame tone="sky" tilt="right" scaleClass="scale-[0.44]">
      <JuridicoPreview data={SAMPLE_LEGAL_DOCUMENT} />
    </LandingDocFrame>
  );
}

/** Serviços contábeis — CRC e cláusulas reais. */
export function LandingContabilPreview() {
  return (
    <LandingDocFrame tone="light" tilt="left" scaleClass="scale-[0.44]">
      <ContabilPreview data={SAMPLE_CONTABIL_DOCUMENT} />
    </LandingDocFrame>
  );
}

/** Lattes no visual acadêmico CNPq (mesma estrutura da ferramenta). */
export function LandingLattesPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div className="absolute -inset-4 rounded-[2rem] bg-amber-400/15" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_70px_-28px_rgba(15,23,42,0.55)] sm:[transform:perspective(1400px)_rotateY(6deg)_rotateX(2deg)]">
        <div className="border-b-4 border-amber-500 bg-[#1a365d] px-5 py-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
            Currículo Lattes · CNPq
          </p>
          <p className="mt-1 text-lg font-bold leading-tight">Prof. Dr. Rafael Nogueira Silva</p>
          <p className="mt-1 text-xs text-slate-300">Ciência da Computação · Universidade Federal de Minas Gerais</p>
        </div>
        <div className="space-y-0 text-[12px] text-slate-800">
          <section className="border-b border-slate-100 px-5 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a365d]">Resumo</p>
            <p className="mt-1.5 leading-5 text-slate-600">
              Pesquisador em inteligência artificial aplicada à educação, com foco em redes neurais e sistemas
              tutores inteligentes. Bolsista CNPq PQ-2.
            </p>
          </section>
          {[
            {
              title: 'Formação acadêmica',
              lines: [
                'Doutorado em Ciência da Computação — UFMG (2018)',
                'Mestrado em Ciência da Computação — Unicamp (2014)',
                'Bacharelado em Sistemas de Informação — UFG (2011)'
              ]
            },
            {
              title: 'Produção bibliográfica',
              lines: [
                '18 artigos em periódicos Qualis A1–A2',
                '4 capítulos de livro · 2 livros organizados'
              ]
            },
            {
              title: 'Projetos de pesquisa',
              lines: ['IA na Educação Básica — CNPq (2023–2026)', 'Tutores inteligentes — FAPEMIG (2021–2023)']
            }
          ].map((block) => (
            <section key={block.title} className="border-b border-slate-100 px-5 py-3.5 last:border-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a365d]">{block.title}</p>
              <ul className="mt-1.5 space-y-1 text-slate-600">
                {block.lines.map((line) => (
                  <li key={line} className="leading-5">
                    · {line}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <div className="flex flex-wrap gap-1.5 bg-slate-50 px-5 py-3">
            {['Inteligência Artificial', 'Educação', 'Redes Neurais'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-900"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Orçamento digital — mesma cara da página pública de aprovação. */
export function LandingOrcamentoPreview() {
  const itens = [
    { id: '1', nome: 'Instalação elétrica completa', quantidade: 1, valorUnitario: 1800 },
    { id: '2', nome: 'Material e mão de obra', quantidade: 1, valorUnitario: 650 }
  ];
  const total = itens.reduce((sum, item) => sum + item.quantidade * item.valorUnitario, 0);

  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <div className="absolute -inset-3 rounded-[2rem] bg-emerald-100/70" />
      <div className="relative overflow-hidden rounded-[24px] border border-emerald-200 bg-[linear-gradient(180deg,#fff_0%,#ecfdf5_100%)] p-3 shadow-[0_24px_50px_-24px_rgba(6,95,70,0.45)] sm:[transform:perspective(1200px)_rotateY(5deg)_rotateX(2deg)]">
        <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Orçamento digital</p>
          <p className="mt-1 text-lg font-extrabold text-slate-900">Elétrica Norte Serviços</p>
          <p className="mt-1 text-xs text-slate-600">
            Preparado para <strong>Marina Duarte</strong>
          </p>
          <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Total</p>
              <p className="text-2xl font-black text-emerald-700">{formatCurrency(total)}</p>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">
              Aguardando
            </span>
          </div>
        </header>
        <section className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-2.5">
            <p className="text-xs font-bold text-slate-900">Itens</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {itens.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 px-4 py-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{item.nome}</p>
                  <p className="mt-0.5 text-slate-500">
                    {item.quantidade} × {formatCurrency(item.valorUnitario)}
                  </p>
                </div>
                <p className="shrink-0 font-bold text-slate-900">
                  {formatCurrency(item.quantidade * item.valorUnitario)}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <div className="mt-2 flex gap-2">
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-[11px] font-bold text-white">
            <ThumbsUp className="h-3.5 w-3.5" />
            Aprovar
          </div>
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-[11px] font-bold text-slate-700">
            <MessageCircle className="h-3.5 w-3.5" />
            Ajustar
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cobrança Pix — QR real gerado pelo mesmo motor da ferramenta. */
export function LandingPixPreview() {
  const brCode = buildPixBrCode({
    key: 'ana@analimadesign.com.br',
    keyType: 'email',
    merchantName: 'Ana Lima Design',
    merchantCity: 'Sao Paulo',
    amount: 2450,
    description: 'Servicos de design',
    txid: 'RJSHOWCASE01'
  });

  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="absolute -inset-3 rounded-[2rem] bg-emerald-100/70" />
      <div className="relative overflow-hidden rounded-[24px] border border-emerald-200 bg-white p-5 shadow-[0_24px_50px_-24px_rgba(6,95,70,0.45)] sm:[transform:perspective(1200px)_rotateY(-5deg)_rotateX(2deg)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Cobrança Pix</p>
        <p className="mt-1 text-lg font-extrabold text-slate-900">Ana Lima Design</p>
        <p className="text-xs text-slate-500">Mercado Central Ltda</p>
        <p className="mt-3 text-3xl font-black text-emerald-700">{formatCurrency(2450)}</p>
        <div className="mx-auto mt-4 grid w-fit place-items-center rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <QRCodeSVG value={brCode || 'resolvajato-pix'} size={148} level="M" includeMargin />
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-800">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          QR Code e Copia e Cola prontos
        </div>
      </div>
    </div>
  );
}

/** Agenda — calendário + compromissos no visual da ferramenta. */
export function LandingAgendaPreview() {
  const weekLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const eventDays = new Set([6, 9, 14, 19, 22]);
  const today = 14;

  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div className="absolute -inset-4 rounded-[2rem] bg-sky-50" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_70px_-28px_rgba(15,23,42,0.4)] sm:[transform:perspective(1400px)_rotateY(-6deg)_rotateX(2deg)]">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-5 py-4 text-white">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Calendário inteligente</p>
            <p className="mt-0.5 text-base font-bold">Julho 2026</p>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold">Hoje</span>
        </div>
        <div className="grid grid-cols-4 gap-2 border-b border-slate-100 px-4 py-3">
          {[
            { label: 'Hoje', value: '2' },
            { label: 'Próximos', value: '5' },
            { label: 'Conflitos', value: '0' },
            { label: 'Atrasados', value: '1' }
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl bg-sky-50 px-2 py-2 text-center">
              <p className="text-sm font-black text-sky-800">{kpi.value}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-sky-600">{kpi.label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 px-4 pt-3 text-center text-[10px] font-semibold text-slate-400">
          {weekLabels.map((d, i) => (
            <span key={`${d}-${i}`}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 px-4 pb-3 pt-1 text-center text-[11px]">
          {Array.from({ length: 28 }).map((_, i) => {
            const day = i + 1;
            const active = day === today;
            const hasEvent = eventDays.has(day) && !active;
            return (
              <div
                key={day}
                className={cn(
                  'relative rounded-lg py-1.5',
                  active ? 'bg-sky-600 font-bold text-white' : 'text-slate-600'
                )}
              >
                {day}
                {hasEvent ? (
                  <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-sky-500" />
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="space-y-2 border-t border-slate-100 px-4 py-3">
          {[
            { time: '09:00', title: 'Reunião com cliente', tag: 'Confirmado', tagClass: 'bg-emerald-100 text-emerald-700' },
            { time: '14:30', title: 'Entrega da proposta', tag: 'Urgente', tagClass: 'bg-rose-100 text-rose-700' }
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[11px]"
            >
              <p className="font-bold text-slate-900">
                {item.time} · {item.title}
              </p>
              <span className={cn('rounded-full px-2 py-1 text-[10px] font-bold', item.tagClass)}>{item.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
