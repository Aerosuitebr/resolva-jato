'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBannerProps {
  label?: string;
  /** 0–100; omitido = indeterminado */
  value?: number;
  className?: string;
}

/** Indicador para ações demoradas (ex.: Gerando PDF…). */
export function ProgressBanner({
  label = 'Processando…',
  value,
  className
}: ProgressBannerProps) {
  const determinate = typeof value === 'number' && Number.isFinite(value);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-950 shadow-sm',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-sky-700" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{label}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sky-200/80">
          {determinate ? (
            <div
              className="h-full rounded-full bg-sky-600 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, value!))}%` }}
            />
          ) : (
            <div className="rj-progress-indeterminate h-full w-1/3 rounded-full bg-sky-600" />
          )}
        </div>
      </div>
    </div>
  );
}
