import type { ReactNode } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type FieldState = 'idle' | 'valid' | 'error' | 'loading';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  success?: string;
  state?: FieldState;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  success,
  state = 'idle',
  className,
  children
}: FormFieldProps) {
  const showError = Boolean(error);
  const showSuccess = !showError && Boolean(success) && state !== 'loading';
  const showLoading = state === 'loading' && !showError;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  const describedBy = showError ? errorId : hint && !showSuccess && !showLoading ? hintId : undefined;

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
        {label}
        {required ? (
          <>
            <span className="text-rose-600" aria-hidden>
              *
            </span>
            <span className="sr-only">(obrigatório)</span>
          </>
        ) : null}
      </label>
      <div
        className="min-w-0"
        data-invalid={showError ? 'true' : undefined}
        data-describedby={describedBy}
      >
        {children}
      </div>
      {showError ? (
        <p id={errorId} role="alert" className="text-xs font-semibold leading-4 text-rose-600">
          {error}
        </p>
      ) : showLoading ? (
        <p className="flex items-center gap-1.5 text-xs leading-4 text-slate-600" aria-live="polite">
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
          {hint || success || 'Carregando…'}
        </p>
      ) : showSuccess ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {success}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs leading-4 text-slate-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function fieldStateClass(state: FieldState): string {
  if (state === 'error') return 'border-rose-400 focus:border-rose-500 focus:ring-rose-100';
  if (state === 'valid') return 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100';
  return '';
}

/** Classe base compartilhada para inputs customizados / masked. */
export const controlSurfaceClass =
  'rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-150 hover:border-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100';
