'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EditorStepItem {
  id: string;
  label: string;
}

interface EditorStepProgressProps {
  steps: EditorStepItem[];
  currentId: string;
  onSelect?: (id: string) => void;
}

/** Barra de etapas com progresso visual (mobile-friendly). */
export function EditorStepProgress({ steps, currentId, onSelect }: EditorStepProgressProps) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === currentId)
  );
  const ratio = steps.length <= 1 ? 1 : currentIndex / (steps.length - 1);

  return (
    <div className="space-y-3" aria-label="Progresso da criação">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Etapa {currentIndex + 1} de {steps.length}
        </p>
        <p className="text-xs font-semibold text-sky-700">{steps[currentIndex]?.label}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
        <div
          className="h-full rounded-full bg-sky-600 transition-all duration-300"
          style={{ width: `${Math.max(12, ratio * 100)}%` }}
        />
      </div>
      <ol
        className={cn(
          'grid gap-2',
          steps.length <= 2 && 'grid-cols-2',
          steps.length === 3 && 'grid-cols-1 sm:grid-cols-3',
          steps.length === 4 && 'grid-cols-2 sm:grid-cols-4',
          steps.length >= 5 && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
        )}
      >
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelect?.(step.id)}
                className={cn(
                  'rj-press flex w-full items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left transition',
                  active && 'border-sky-500 bg-sky-50 ring-2 ring-sky-100',
                  done && !active && 'border-emerald-200 bg-emerald-50/70',
                  !done && !active && 'border-slate-200 bg-white hover:bg-slate-50'
                )}
                aria-current={active ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold',
                    active && 'bg-sky-600 text-white',
                    done && !active && 'bg-emerald-600 text-white',
                    !done && !active && 'bg-slate-100 text-slate-600'
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
                </span>
                <span
                  className={cn(
                    'text-xs font-bold',
                    active ? 'text-sky-950' : done ? 'text-emerald-900' : 'text-slate-600'
                  )}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
