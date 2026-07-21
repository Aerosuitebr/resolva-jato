'use client';

import { describeAuthDestination } from '@/components/auth/auth-required-modal';

interface AuthReturnBannerProps {
  nextHref: string | null | undefined;
}

/** Banner discreto em login/cadastro quando o usuário veio de uma ferramenta. */
export function AuthReturnBanner({ nextHref }: AuthReturnBannerProps) {
  if (!nextHref || nextHref === '/' || nextHref === '/busca') return null;

  const destination = describeAuthDestination(nextHref);

  return (
    <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-center text-sm leading-6 text-slate-700">
      Faça login para acessar <strong className="font-semibold text-slate-900">{destination}</strong>.
      Depois do acesso, você entra na área de ferramentas.
    </div>
  );
}
