'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, CalendarClock, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { formatDateTime } from '@/lib/billing';

export function UsageBanner() {
  const { ready, isAuthenticated, usage } = useAuth();
  if (!ready || !isAuthenticated || usage.unlimited || usage.remaining === null || usage.remaining > 1) return null;

  const exhausted = usage.remaining === 0;
  return (
    <div className={exhausted ? 'border-b border-rose-200 bg-rose-50' : 'border-b border-amber-200 bg-amber-50'}>
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
            exhausted ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
          }`}>
            {exhausted ? <AlertTriangle className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
          </span>
          <div>
            <p className={`text-sm font-bold ${exhausted ? 'text-rose-950' : 'text-amber-950'}`}>
              {exhausted ? 'Seu saldo gratuito terminou' : 'Você tem apenas 1 utilização restante'}
            </p>
            <p className={`text-xs leading-5 ${exhausted ? 'text-rose-800' : 'text-amber-800'}`}>
              {exhausted && usage.nextReleaseAt
                ? `Mais 5 utilizações serão liberadas em ${formatDateTime(usage.nextReleaseAt)}.`
                : 'Cada salvamento manual ou download consome uma utilização.'}
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
