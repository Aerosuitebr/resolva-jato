'use client';

import { Check, X } from 'lucide-react';
import { evaluatePasswordStrength } from '@/lib/password';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const result = evaluatePasswordStrength(password);
  const ratio = result.maxScore === 0 ? 0 : result.score / result.maxScore;

  const barClass =
    result.level === 'forte'
      ? 'bg-emerald-500'
      : result.level === 'media'
        ? 'bg-amber-500'
        : result.level === 'vazia'
          ? 'bg-slate-200'
          : 'bg-rose-500';

  const labelClass =
    result.level === 'forte'
      ? 'text-emerald-700'
      : result.level === 'media'
        ? 'text-amber-700'
        : result.level === 'vazia'
          ? 'text-slate-500'
          : 'text-rose-700';

  return (
    <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-800">Força da senha</p>
        <p className={cn('text-sm font-bold', labelClass)}>{result.label}</p>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white">
        <div
          className={cn('h-full rounded-full transition-all duration-300', barClass)}
          style={{ width: `${Math.max(ratio * 100, password ? 12 : 0)}%` }}
        />
      </div>
      <ul className="grid gap-1.5 sm:grid-cols-1">
        {result.rules.map((rule) => (
          <li key={rule.id} className="flex items-start gap-2 text-xs leading-5">
            <span
              className={cn(
                'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full',
                rule.ok ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 ring-1 ring-slate-200'
              )}
            >
              {rule.ok ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" />}
            </span>
            <span className={rule.ok ? 'font-medium text-slate-800' : 'text-slate-600'}>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
