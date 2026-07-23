'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface AuthGateProps {
  title: string;
  description: string;
  children: ReactNode;
  /**
   * @deprecated Cota de utilizações removida — plano grátis não bloqueia por uso.
   * Mantido só por compatibilidade de props.
   */
  enforceUsageLimit?: boolean;
  /** Quando true (padrão), exige e-mail confirmado. */
  requireEmailVerified?: boolean;
}

export function AuthGate({
  children,
  requireEmailVerified = true
}: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, isAuthenticated, emailVerified, session } = useAuth();
  const needsEmail = requireEmailVerified && isAuthenticated && !emailVerified;

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/ferramentas')}`);
    }
  }, [isAuthenticated, pathname, ready, router]);

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
          Enviamos um link para <strong>{session?.user.email}</strong>. As ferramentas só são
          liberadas após a confirmação.
        </p>
        <Button asChild className="mt-5">
          <Link href={`/login?email=${encodeURIComponent(session?.user.email || '')}`}>
            Reenviar confirmação no login
          </Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
