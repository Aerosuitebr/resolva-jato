'use client';

import { useAuth } from '@/hooks/use-auth';

interface TopEnvBannerProps {
  visible?: boolean;
}

/** Faixa curta: documentos e busca gratuitos — sem plano, preço ou contagem. */
export function TopEnvBanner({ visible = true }: TopEnvBannerProps) {
  const { ready, isAuthenticated, usage } = useAuth();
  if (!visible) return null;

  const usageExhausted = ready && isAuthenticated && !usage.unlimited && usage.remaining === 0;

  const message = usageExhausted
    ? 'Máximo de utilizações atingido. Fale conosco ou tente mais tarde'
    : 'Documentos profissionais grátis · busca gratuita';

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[200] h-8 overflow-hidden ${
        usageExhausted ? 'bg-rose-950' : 'bg-slate-900'
      }`}
    >
      <div className="relative z-10 flex h-full items-center justify-center px-4 text-center text-[0.7rem] font-semibold tracking-wide text-sky-100 sm:text-[0.72rem]">
        {message}
      </div>
    </div>
  );
}
