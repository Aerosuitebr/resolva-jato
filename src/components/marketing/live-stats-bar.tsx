'use client';

import { useEffect, useState } from 'react';
import type { PublicStats } from '@/lib/public-stats';
import { cn } from '@/lib/utils';

function formatCount(n: number) {
  return n.toLocaleString('pt-BR');
}

export function LiveStatsBar({
  initial,
  className
}: {
  initial?: PublicStats | null;
  className?: string;
}) {
  const [stats, setStats] = useState<PublicStats | null>(initial || null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/public')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: PublicStats | null) => {
        if (!cancelled && data) setStats(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) return null;

  const items = [
    {
      value: formatCount(stats.orcamentosToday),
      label: 'Orçamentos hoje',
      show: true
    },
    {
      value: formatCount(stats.orcamentosApprovedWeek),
      label: 'Aprovados na semana',
      show: true
    },
    {
      value: formatCount(stats.docsGeneratedApprox),
      label: 'Docs gerados',
      show: stats.docsGeneratedApprox > 0
    },
    {
      value: formatCount(stats.usersTotal),
      label: 'Contas criadas',
      show: stats.usersTotal > 0
    }
  ].filter((item) => item.show);

  if (items.length === 0) {
    return (
      <ul className={cn('grid gap-3 sm:grid-cols-3', className)}>
        {[
          { value: 'Orçamento + Pix', label: 'Fecha no WhatsApp' },
          { value: 'Sem app', label: 'Cliente aprova no celular' },
          { value: 'PDF pronto', label: 'Em minutos' }
        ].map((stat) => (
          <li
            key={stat.label}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-4 text-center"
          >
            <p className="text-sm font-extrabold tracking-tight text-emerald-950 sm:text-base">
              {stat.value}
            </p>
            <p className="mt-1 text-xs leading-5 text-emerald-900/75">{stat.label}</p>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={cn('grid gap-3 sm:grid-cols-3', className)}>
      {items.slice(0, 3).map((stat) => (
        <li
          key={stat.label}
          className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-4 text-center"
        >
          <p className="text-2xl font-black tabular-nums tracking-tight text-emerald-950">
            {stat.value}
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-emerald-900/75">{stat.label}</p>
        </li>
      ))}
    </ul>
  );
}
