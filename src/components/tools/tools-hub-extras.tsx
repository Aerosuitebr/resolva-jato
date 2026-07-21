'use client';

import Link from 'next/link';
import { Award, CircleHelp, Sparkles, X } from 'lucide-react';
import { getToolById, toolIntentOptions } from '@/lib/tools-catalog';
import type { ToolsEngagement } from '@/lib/tools-engagement';
import { cn } from '@/lib/utils';

export function ToolsIntentWizard({
  onPick,
  onDismiss
}: {
  onPick: (toolId: string) => void;
  onDismiss: () => void;
}) {
  return (
    <section
      className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-slate-50 p-4 shadow-sm sm:p-5"
      aria-labelledby="tools-wizard-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700">Comece em 1 toque</p>
          <h2 id="tools-wizard-title" className="rj-display mt-1 text-lg font-bold text-slate-950 sm:text-xl">
            O que você precisa agora?
          </h2>
          <p className="mt-1 text-sm font-medium leading-5 text-slate-600">
            Escolha o tipo de documento — abrimos a ferramenta certa.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rj-press inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          aria-label="Dispensar sugestões rápidas"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {toolIntentOptions.map((option) => {
          const tool = getToolById(option.toolId);
          if (!tool) return null;
          const Icon = tool.icon;
          return (
            <Link
              key={option.id}
              href={tool.href}
              onClick={() => onPick(tool.id)}
              className={cn(
                'rj-press group flex min-h-[5.5rem] flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-3',
                'text-left transition hover:border-sky-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100'
              )}
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white transition group-hover:bg-sky-600">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-sm font-bold text-slate-900">{option.label}</span>
              <span className="text-[11px] font-medium leading-4 text-slate-500">{option.hint}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function ToolsEngagementStrip({ engagement }: { engagement: ToolsEngagement }) {
  const unlocked = engagement.badges.filter((badge) => badge.unlocked);
  if (engagement.totalDocs === 0 && unlocked.length === 0) return null;

  return (
    <section
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5"
      aria-label="Seu progresso nas ferramentas"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-900">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-900">
            {engagement.docsThisMonth > 0
              ? `Você já criou ${engagement.docsThisMonth} documento${engagement.docsThisMonth === 1 ? '' : 's'} este mês`
              : `${engagement.totalDocs} documento${engagement.totalDocs === 1 ? '' : 's'} no total`}
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Cada salvamento ou download conta para o seu histórico.
          </p>
        </div>
      </div>
      {unlocked.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Conquistas">
          {unlocked.map((badge) => (
            <li
              key={badge.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white"
            >
              <Award className="h-3.5 w-3.5 text-amber-300" aria-hidden />
              {badge.label}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function ToolTipButton({ tip }: { tip: string }) {
  return (
    <button
      type="button"
      className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
      title={tip}
      aria-label={tip}
    >
      <CircleHelp className="h-4 w-4" aria-hidden />
    </button>
  );
}
