'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';
import { resolveToolsAuthNext, useAuthRequired } from '@/components/auth/auth-required-provider';
import { useAuth } from '@/hooks/use-auth';

type AuthAwareLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
  /** Destino quando o visitante não está logado (padrão: modal + login com next). */
  guestHref?: string;
  /** Se true (padrão), abre modal contextual em vez de ir direto ao login. */
  promptModal?: boolean;
};

/** Link que pede login via modal (ou redireciona) quando o destino exige conta. */
export function AuthAwareLink({
  href,
  guestHref,
  promptModal = true,
  onClick,
  ...props
}: AuthAwareLinkProps) {
  const { ready, isAuthenticated } = useAuth();
  const { requireAuth } = useAuthRequired();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (!ready) return;

    if (!isAuthenticated) {
      event.preventDefault();
      const next = resolveToolsAuthNext(href);
      if (promptModal) {
        requireAuth(next);
        return;
      }
      window.location.assign(guestHref || `/login?next=${encodeURIComponent(next)}`);
    }
  }

  return <Link href={isAuthenticated ? href : guestHref || href} onClick={handleClick} {...props} />;
}
