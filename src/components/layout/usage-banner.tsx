'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { formatDateTime } from '@/lib/billing';

/** Só aparece quando o máximo de utilizações do plano gratuito foi atingido. */
export function UsageBanner() {
  const { ready, isAuthenticated, usage } = useAuth();
  if (!ready || !isAuthenticated || usage.unlimited || usage.remaining !== 0) return null;

  return (
    <div className="border-b border-rose-200 bg-rose-50">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-100 text-rose-700">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-rose-950">Máximo de utilizações atingido</p>
            <p className="text-xs leading-5 text-rose-800">
              {usage.nextReleaseAt
                ? `Um novo pacote gratuito libera em ${formatDateTime(usage.nextReleaseAt)}. Ou assine o Premium para uso ilimitado por 30 dias.`
                : 'Assine o Premium para uso ilimitado por 30 dias.'}
            </p>
          </div>
        </div>
        <Link
          href="/conta?upgrade=premium"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
        >
          <Crown className="h-4 w-4 text-amber-300" />
          Destravar uso ilimitado por 1 mês
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
