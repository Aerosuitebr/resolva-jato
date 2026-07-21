'use client';

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  Receipt,
  Scale,
  Sparkles,
  Wallet,
  type LucideIcon
} from 'lucide-react';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { cn } from '@/lib/utils';

const CARD_ACCENT = 'from-slate-950 via-slate-900 to-sky-900';

export type SpotlightToolSlide = {
  label: string;
  tabLabel: string;
  hint: string;
  icon: LucideIcon;
  href: string;
  /** Link explicativo / planos (CTA secundário). */
  learnHref: string;
  cta: string;
  badge: string;
  steps: string[];
  preview: 'curriculo' | 'recibo' | 'pix' | 'capa' | 'contrato' | 'proposta' | 'orcamento' | 'agenda';
};

export const SPOTLIGHT_SLIDES: SpotlightToolSlide[] = [
  {
    label: 'Currículo profissional em minutos',
    tabLabel: 'Currículos',
    hint: 'Entre na área de ferramentas, abra Currículos, preencha seus dados e baixe o PDF pronto para a vaga.',
    icon: GraduationCap,
    href: '/ferramentas/curriculo',
    learnHref: '/ferramentas',
    cta: 'Criar meu currículo',
    badge: 'Gratuito',
    steps: [
      '1. Faça login e abra Currículos',
      '2. Preencha experiência, formação e idiomas',
      '3. Escolha o modelo e baixe o PDF'
    ],
    preview: 'curriculo'
  },
  {
    label: 'Recibo e cobrança Pix',
    tabLabel: 'Pix',
    hint: 'Use Pix para gerar QR e Copia e Cola; use Recibos para emitir o comprovante profissional no mesmo hub.',
    icon: Wallet,
    href: '/ferramentas/pix',
    learnHref: '/ferramentas',
    cta: 'Gerar Pix agora',
    badge: 'Gratuito',
    steps: [
      '1. Abra Cobrança Pix e informe sua chave',
      '2. Gere o QR ou o código Copia e Cola',
      '3. Se quiser, emita o recibo em Recibos'
    ],
    preview: 'pix'
  },
  {
    label: 'Capa de trabalho no padrão ABNT',
    tabLabel: 'Capas',
    hint: 'Em Capas de Trabalho, escolha o modelo (escolar, universitária ou folha de rosto), preencha e baixe para imprimir.',
    icon: BookOpen,
    href: '/ferramentas/trabalhos',
    learnHref: '/ferramentas',
    cta: 'Fazer minha capa',
    badge: 'Gratuito',
    steps: [
      '1. Abra Capas de Trabalho',
      '2. Escolha o modelo e preencha os campos',
      '3. Confira o preview e baixe o PDF'
    ],
    preview: 'capa'
  },
  {
    label: 'Contratos sob medida',
    tabLabel: 'Contratos',
    hint: 'Seis modelos prontos: escolha o tipo, ajuste cláusulas e partes, e exporte o PDF com assinatura.',
    icon: Scale,
    href: '/ferramentas/contratos',
    learnHref: '/ferramentas',
    cta: 'Abrir contratos',
    badge: 'Gratuito',
    steps: [
      'Prestação de serviços · Aluguel residencial',
      'Locação comercial · Contrato de trabalho',
      'Compra e venda · Comodato'
    ],
    preview: 'contrato'
  },
  {
    label: 'Proposta comercial com visual',
    tabLabel: 'Propostas',
    hint: 'Monte itens, condições e identidade visual. Envie a proposta em PDF para o cliente.',
    icon: FileText,
    href: '/ferramentas/propostas',
    learnHref: '/ferramentas',
    cta: 'Criar proposta',
    badge: 'Gratuito',
    steps: [
      '1. Abra Propostas Comerciais',
      '2. Cadastre empresa, cliente e itens',
      '3. Escolha o layout e baixe o PDF'
    ],
    preview: 'proposta'
  },
  {
    label: 'Orçamento com link de aprovação',
    tabLabel: 'Orçamentos',
    hint: 'Crie o orçamento, envie o link ao cliente e acompanhe aprovação ou pedido de ajuste.',
    icon: ClipboardList,
    href: '/ferramentas/orcamentos',
    learnHref: '/ferramentas',
    cta: 'Abrir orçamentos',
    badge: 'Gratuito',
    steps: [
      '1. Abra Orçamentos e cadastre os itens',
      '2. Gere o link público para o cliente',
      '3. Acompanhe a resposta na sua conta'
    ],
    preview: 'orcamento'
  },
  {
    label: 'Recibo profissional',
    tabLabel: 'Recibos',
    hint: 'Preencha recebedor, pagador e valor. Baixe um recibo limpo, pronto para imprimir ou enviar.',
    icon: Receipt,
    href: '/ferramentas/recibos',
    learnHref: '/ferramentas',
    cta: 'Emitir recibo',
    badge: 'Gratuito',
    steps: [
      '1. Abra Recibos',
      '2. Preencha as partes, valor e referência',
      '3. Escolha o modelo e baixe o PDF'
    ],
    preview: 'recibo'
  },
  {
    label: 'Agenda para a sua rotina',
    tabLabel: 'Agenda',
    hint: 'Organize compromissos e lembretes. No plano grátis você conhece a ferramenta; o uso completo é exclusivo do Premium.',
    icon: CalendarDays,
    href: '/ferramentas/agenda',
    learnHref: '/planos',
    cta: 'Conhecer Agenda Premium',
    badge: 'Exclusiva do Premium',
    steps: [
      'Calendário mensal + feriados nacionais',
      'Alertas e detecção de conflitos',
      'Uso completo liberado no Premium'
    ],
    preview: 'agenda'
  }
];

const INTERVAL_MS = 4500;

export function SpotlightAnnouncements() {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const indexRef = useRef(0);
  const lastAdvanceRef = useRef(0);

  const slide = SPOTLIGHT_SLIDES[index];
  const Icon = slide.icon;

  indexRef.current = index;

  const goTo = useCallback((next: number) => {
    const normalized = (next + SPOTLIGHT_SLIDES.length) % SPOTLIGHT_SLIDES.length;
    indexRef.current = normalized;
    lastAdvanceRef.current = performance.now();
    setIndex(normalized);
    setAnimKey((value) => value + 1);
  }, []);

  useEffect(() => {
    lastAdvanceRef.current = performance.now();
    let raf = 0;

    const loop = (now: number) => {
      raf = window.requestAnimationFrame(loop);
      if (document.hidden) {
        lastAdvanceRef.current = now;
        return;
      }
      if (now - lastAdvanceRef.current < INTERVAL_MS) return;
      lastAdvanceRef.current = now;
      goTo(indexRef.current + 1);
    };

    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [goTo]);

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const end = event.changedTouches[0]?.clientX ?? start;
    const delta = end - start;
    if (Math.abs(delta) < 40) return;
    goTo(delta < 0 ? indexRef.current + 1 : indexRef.current - 1);
  }

  return (
    <section id="ferramentas-destaque" className="mx-auto max-w-[1400px] scroll-mt-[var(--rj-section-scroll-mt)]">
      <div className="mb-3 sm:mb-4">
        <p className="rj-display text-sm font-bold uppercase tracking-[0.18em] text-sky-700">
          Ferramentas Resolva Jato
        </p>
        <h2 className="rj-display mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          Resolva tarefas profissionais em poucos cliques
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-700 sm:text-base sm:leading-7">
          Ferramentas criadas pelo Resolva Jato para gerar documentos e concluir tarefas com qualidade profissional.
        </p>
      </div>

      <div className="mb-3 hidden gap-1.5 overflow-x-auto pb-1 lg:flex" role="tablist" aria-label="Ferramentas do carrossel">
        {SPOTLIGHT_SLIDES.map((item, tabIndex) => (
          <button
            key={item.href}
            type="button"
            role="tab"
            aria-selected={tabIndex === index}
            onClick={() => goTo(tabIndex)}
            className={cn(
              'h-9 shrink-0 rounded-full px-3.5 text-xs font-bold transition',
              tabIndex === index
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            {item.tabLabel}
          </button>
        ))}
      </div>

      <div
        className="relative touch-pan-y overflow-hidden rounded-[24px] border border-slate-800 bg-slate-950 text-white shadow-[0_20px_50px_-28px_rgba(2,8,23,0.55)]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br opacity-95', CARD_ACCENT)} />
        <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl" />

        <div className="relative grid gap-4 p-4 sm:gap-5 sm:p-5 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-6 lg:p-6">
          <div key={`copy-${animKey}`} className="rj-spotlight-enter flex min-w-0 flex-col">
            <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-black/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white ring-1 ring-white/20">
              <Icon className="h-3.5 w-3.5" />
              {slide.badge}
            </span>
            <h3 className="rj-display mt-3 text-xl font-extrabold tracking-tight sm:text-2xl lg:text-[1.75rem]">
              {slide.label}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/90">{slide.hint}</p>

            <ul className="mt-3 space-y-1">
              {slide.steps.map((step) => (
                <li key={step} className="flex items-start gap-2 text-sm text-white/90">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-200" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <AuthAwareLink
                href={slide.href}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-sky-50"
              >
                {slide.cta}
                <ArrowRight className="h-4 w-4" />
              </AuthAwareLink>
              <AuthAwareLink
                href={slide.learnHref}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 underline-offset-4 transition hover:text-white hover:underline"
              >
                Conhecer a ferramenta
                <ArrowRight className="h-3.5 w-3.5" />
              </AuthAwareLink>
            </div>
          </div>

          <div key={`visual-${animKey}`} className="rj-spotlight-enter-delay min-w-0">
            <ToolPreviewPanel preview={slide.preview} />
          </div>
        </div>

        <div className="relative flex items-center justify-center gap-2 border-t border-white/10 bg-black/20 px-3 py-2 lg:hidden">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            aria-label="Anúncio anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5" role="tablist" aria-label="Ferramentas em destaque">
            {SPOTLIGHT_SLIDES.map((item, dotIndex) => (
              <button
                key={item.href}
                type="button"
                onClick={() => goTo(dotIndex)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  dotIndex === index ? 'w-6 bg-white' : 'w-2 bg-white/40'
                )}
                aria-label={`Ir para ${item.label}`}
                aria-current={dotIndex === index ? 'true' : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            aria-label="Próximo anúncio"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ToolPreviewPanel({ preview }: { preview: SpotlightToolSlide['preview'] }) {
  return (
    <div className="flex h-full min-h-[180px] flex-col justify-center px-1 py-0 sm:min-h-[200px] sm:px-3">
      <div className="mx-auto w-full max-w-[260px] sm:max-w-[300px]">
        <div className="rj-spotlight-doc-frame">
          <DocumentMiniPreview type={preview} />
        </div>
      </div>
    </div>
  );
}

function DocumentMiniPreview({ type }: { type: SpotlightToolSlide['preview'] }) {
  if (type === 'curriculo') {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 text-slate-800 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.5)]">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2.5">
          <div>
            <p className="text-sm font-black tracking-tight text-slate-900">Ana Souza</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">
              Analista de marketing
            </p>
          </div>
          <GraduationCap className="h-5 w-5 shrink-0 text-sky-600" />
        </div>
        <div className="mt-2.5 space-y-2">
          <div className="h-1.5 w-[80%] rounded bg-slate-200" />
          <div className="h-1.5 w-full rounded bg-slate-100" />
          <div className="h-1.5 w-[75%] rounded bg-slate-100" />
          <p className="pt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Experiência</p>
          <div className="rounded-lg bg-slate-50 p-2">
            <p className="text-[11px] font-bold text-slate-800">Agência Norte · 2022–Atual</p>
            <div className="mt-1.5 h-1 w-full rounded bg-slate-200" />
            <div className="mt-1 h-1 w-[85%] rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'pix' || type === 'recibo') {
    return (
      <div className="grid grid-cols-2 gap-2.5">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Receipt className="h-4 w-4 shrink-0 text-sky-700" />
            <p className="text-[11px] font-bold text-slate-900">Recibo nº 0042</p>
          </div>
          <p className="mt-2 text-[10px] text-slate-500">Recebi de</p>
          <p className="text-xs font-bold text-slate-800">Cliente Exemplo</p>
          <p className="mt-2 text-base font-black text-sky-700">R$ 350,00</p>
          <div className="mt-2 h-1 w-full rounded bg-slate-100" />
          <div className="mt-1 h-1 w-2/3 rounded bg-slate-100" />
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-sky-200 bg-sky-50 p-2.5 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.4)]">
          <div className="grid h-20 w-20 place-items-center rounded-lg bg-white p-1.5 shadow-sm">
            <div
              className="h-full w-full rounded-sm"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg,#0f172a 0 2px,transparent 2px 4px), repeating-linear-gradient(90deg,#0f172a 0 2px,transparent 2px 4px)'
              }}
            />
          </div>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-800">Pix QR</p>
          <p className="text-center text-[10px] text-sky-900/80">Copia e Cola</p>
        </div>
      </div>
    );
  }

  if (type === 'capa') {
    return (
      <div className="mx-auto max-w-[190px] overflow-hidden rounded-xl border border-slate-300 bg-white px-4 py-5 text-center text-slate-900 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.5)]">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Universidade Federal</p>
        <p className="mt-1 text-[10px] text-slate-600">Curso de Administração</p>
        <div className="my-5 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wide">Título do Trabalho</p>
          <p className="text-[10px] italic text-slate-600">Subtítulo acadêmico</p>
        </div>
        <p className="text-[10px] font-semibold">Maria Silva</p>
        <p className="mt-4 text-[10px] font-semibold text-slate-700">Goiânia · 2026</p>
      </div>
    );
  }

  if (type === 'orcamento') {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 text-slate-800 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.5)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">Orçamento</p>
        <p className="mt-1 text-sm font-black text-slate-900">Serviço de instalação</p>
        <div className="mt-3 space-y-2">
          {['Mão de obra', 'Material', 'Deslocamento'].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2">
              <span className="text-[11px] font-semibold text-slate-700">{item}</span>
              <span className="h-1.5 w-10 rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <p className="mt-3 text-right text-base font-black text-sky-700">Total R$ 1.280</p>
      </div>
    );
  }

  if (type === 'agenda') {
    const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    const cells = Array.from({ length: 28 }, (_, i) => i + 1);
    const marked = new Set([3, 8, 12, 15, 21, 24]);

    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 text-slate-800 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.5)]">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">Agenda</p>
            <p className="mt-0.5 text-sm font-black text-slate-900">Março 2026</p>
          </div>
          <CalendarDays className="h-5 w-5 shrink-0 text-sky-600" />
        </div>
        <div className="mb-2 grid grid-cols-4 gap-1.5">
          {[
            { label: 'Hoje', value: '2' },
            { label: 'Próximos', value: '5' },
            { label: 'Conflitos', value: '1' },
            { label: 'Alertas', value: 'On' }
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg bg-slate-50 px-1.5 py-1.5 text-center">
              <p className="text-[9px] font-bold text-slate-500">{kpi.label}</p>
              <p className="text-xs font-black text-slate-900">{kpi.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <span key={day} className="text-center text-[9px] font-bold text-slate-400">
              {day}
            </span>
          ))}
          {cells.map((day) => (
            <span
              key={day}
              className={cn(
                'grid aspect-square place-items-center rounded-md text-[10px] font-semibold',
                marked.has(day) ? 'bg-sky-600 text-white' : 'bg-slate-50 text-slate-600'
              )}
            >
              {day}
            </span>
          ))}
        </div>
        <p className="mt-2.5 rounded-lg bg-sky-50 px-2 py-1.5 text-[10px] font-semibold text-sky-800">
          Lembrete · reunião com cliente em 30 min
        </p>
      </div>
    );
  }

  if (type === 'contrato') {
    const types = [
      { name: 'Prestação de serviços', audience: 'Freelancer e PJ' },
      { name: 'Aluguel residencial', audience: 'Casa e apartamento' },
      { name: 'Locação comercial', audience: 'Loja e sala' },
      { name: 'Contrato de trabalho', audience: 'Função e jornada' },
      { name: 'Compra e venda', audience: 'Bens e veículos' },
      { name: 'Comodato', audience: 'Empréstimo gratuito' }
    ];

    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 text-slate-800 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.5)]">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">Contratos</p>
            <p className="mt-0.5 text-sm font-black text-slate-900">6 modelos disponíveis</p>
          </div>
          <Scale className="h-5 w-5 shrink-0 text-sky-600" />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {types.map((item) => (
            <div key={item.name} className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5">
              <p className="text-[10px] font-bold leading-snug text-slate-900">{item.name}</p>
              <p className="mt-0.5 text-[9px] leading-snug text-slate-500">{item.audience}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 text-slate-800 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">Proposta</p>
          <p className="text-sm font-black text-slate-900">Projeto visual 2026</p>
        </div>
        <FileText className="h-5 w-5 shrink-0 text-sky-600" />
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {['Briefing', 'Design', 'Entrega'].map((phase) => (
          <div key={phase} className="rounded-lg bg-slate-50 p-2 text-center">
            <p className="text-[9px] font-bold text-slate-500">{phase}</p>
            <div className="mx-auto mt-1.5 h-1 w-8 rounded bg-sky-200" />
          </div>
        ))}
      </div>
      <p className="mt-2.5 text-right text-base font-black text-sky-700">R$ 2.400</p>
    </div>
  );
}
