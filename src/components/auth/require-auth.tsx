'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface RequireAuthProps {
  children: ReactNode;
}

/** Bloqueia a rota até haver sessão. Visitantes vão direto para /login. */
export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent('/ferramentas')}`);
    }
  }, [isAuthenticated, ready, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
        Redirecionando para o login...
      </div>
    );
  }

  return <>{children}</>;
}
