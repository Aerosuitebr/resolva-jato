'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

/**
 * Planos só aparece quando o usuário precisa de upgrade:
 * máximo de utilizações atingido ou Premium já encerrado (sem uso ilimitado).
 */
export function PlanosAccessGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { ready, isAuthenticated, usage } = useAuth();
  const needsUpgrade = isAuthenticated && !usage.unlimited && usage.remaining === 0;

  useEffect(() => {
    if (!ready) return;
    if (!needsUpgrade) {
      router.replace('/');
    }
  }, [needsUpgrade, ready, router]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-slate-600">
        Carregando...
      </div>
    );
  }

  if (!needsUpgrade) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-slate-600">
        Redirecionando...
      </div>
    );
  }

  return <>{children}</>;
}
