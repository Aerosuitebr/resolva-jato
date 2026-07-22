'use client';

import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/billing';

interface TopEnvBannerProps {
  visible?: boolean;
}

/** Faixa curta de contexto — sem contagem de usos no dia a dia. */
export function TopEnvBanner({ visible = true }: TopEnvBannerProps) {
  const { ready, isAuthenticated, usage } = useAuth();
  if (!visible) return null;

  const usageExhausted =
    ready && isAuthenticated && !usage.unlimited && usage.remaining === 0;

  const message =
    ready && isAuthenticated && usage.unlimited
      ? usage.premiumExpiresAt
        ? `Premium ativo · uso ilimitado até ${formatDate(usage.premiumExpiresAt)}`
        : 'Premium ativo · uso ilimitado de ferramentas'
      : usageExhausted
        ? 'Máximo de utilizações atingido · Premium libera uso ilimitado por 30 dias'
        : 'Ferramentas profissionais grátis · busca ilimitada';

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[200] h-8 overflow-hidden ${
        ready && isAuthenticated && usage.unlimited
          ? 'bg-emerald-950'
          : usageExhausted
            ? 'bg-rose-950'
            : 'bg-slate-900'
      }`}
    >
      <div className="relative z-10 flex h-full items-center justify-center px-4 text-center text-[0.7rem] font-semibold tracking-wide text-sky-100 sm:text-[0.72rem]">
        {message}
      </div>
    </div>
  );
}
