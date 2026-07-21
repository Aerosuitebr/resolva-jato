'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';
import { getSession } from '@/lib/auth';

/** Após login/cadastro por acesso a ferramentas, sempre cai no hub (não volta à busca). */
export function resolveToolsAuthNext(href?: string) {
  const path = (href || '/ferramentas').split('?')[0] || '/ferramentas';
  if (path.startsWith('/conta')) return path;
  return '/ferramentas';
}

interface AuthRequiredContextValue {
  /** Abre o modal pedindo login/cadastro e guarda o destino pós-auth. */
  requireAuth: (nextHref?: string) => void;
  closeAuthRequired: () => void;
}

const AuthRequiredContext = createContext<AuthRequiredContextValue | null>(null);

export function AuthRequiredProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [nextHref, setNextHref] = useState('/ferramentas');

  const requireAuth = useCallback((href = '/ferramentas') => {
    if (getSession()) return;
    setNextHref(resolveToolsAuthNext(href));
    setOpen(true);
  }, []);

  const closeAuthRequired = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ requireAuth, closeAuthRequired }),
    [requireAuth, closeAuthRequired]
  );

  return (
    <AuthRequiredContext.Provider value={value}>
      {children}
      <AuthRequiredModal open={open} nextHref={nextHref} onClose={closeAuthRequired} />
    </AuthRequiredContext.Provider>
  );
}

export function useAuthRequired() {
  const context = useContext(AuthRequiredContext);
  if (!context) {
    throw new Error('useAuthRequired must be used within AuthRequiredProvider');
  }
  return context;
}
