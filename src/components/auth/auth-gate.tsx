'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { UpgradeModal } from '@/components/billing/upgrade-modal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { formatDateTime } from '@/lib/billing';

interface AuthGateProps {
  title: string;
  description: string;
  children: ReactNode;
  /** Quando true (padrão), bloqueia a ferramenta se o saldo gratuito acabou. */
  enforceUsageLimit?: boolean;
  /** Quando true (padrão), exige e-mail confirmado. */
  requireEmailVerified?: boolean;
}

export function AuthGate({
  children,
  enforceUsageLimit = true,
  requireEmailVerified = true
}: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const lockRef = useRef<HTMLDivElement>(null);
  const { ready, isAuthenticated, emailVerified, usage, session } = useAuth();
  const needsEmail = requireEmailVerified && isAuthenticated && !emailVerified;
  const exhausted =
    enforceUsageLimit &&
    isAuthenticated &&
    emailVerified &&
    !usage.unlimited &&
    usage.remaining === 0;

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/ferramentas')}`);
    }
  }, [isAuthenticated, pathname, ready, router]);

  useEffect(() => {
    const node = lockRef.current;
    if (!node) return;
    if (exhausted || needsEmail) node.setAttribute('inert', '');
    else node.removeAttribute('inert');
  }, [exhausted, needsEmail]);

  function handleUnlock() {
    router.push('/conta?upgrade=premium');
  }

  if (!ready) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">Carregando sua conta...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-sky-100 bg-sky-50 p-8 text-sm leading-6 text-slate-700">
        <p className="font-semibold text-slate-900">Falta pouco para acessar esta ferramenta.</p>
        <p className="mt-2">Levantando a tela de login. Depois você entra na área de ferramentas.</p>
      </div>
    );
  }

  if (needsEmail) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-sm leading-6 text-slate-700">
        <p className="font-semibold text-slate-900">Confirme seu e-mail para continuar</p>
        <p className="mt-2">
          Enviamos um link para <strong>{session?.user.email}</strong>. As ferramentas
          profissionais só são liberadas após a confirmação.
        </p>
        <Button asChild className="mt-5">
          <Link href={`/login?email=${encodeURIComponent(session?.user.email || '')}`}>
            Reenviar confirmação no login
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        ref={lockRef}
        className={exhausted ? 'pointer-events-none select-none blur-[2px] opacity-55' : undefined}
        aria-hidden={exhausted || undefined}
      >
        {children}
      </div>

      <UpgradeModal
        open={Boolean(exhausted)}
        nextReleaseAtLabel={usage.nextReleaseAt ? formatDateTime(usage.nextReleaseAt) : null}
        onUnlock={handleUnlock}
        onLeave={() => router.push('/busca')}
      />
    </>
  );
}
