'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { CheckCircle2, MailWarning } from 'lucide-react';
import { AuthShell } from '@/components/brand/auth-shell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

function VerifyContent() {
  const searchParams = useSearchParams();
  const ok = searchParams.get('ok') === '1';
  const error = searchParams.get('error');
  const { refresh } = useAuth();

  useEffect(() => {
    if (ok) void refresh();
  }, [ok, refresh]);

  return (
    <div className="space-y-5 text-center">
      {ok ? (
        <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-900">E-mail confirmado</h1>
          <p className="text-sm leading-6 text-slate-600">
            Sua conta está ativa e as ferramentas foram liberadas.
          </p>
          <Button asChild className="w-full">
            <Link href="/ferramentas">Abrir ferramentas</Link>
          </Button>
        </>
      ) : (
        <>
          <MailWarning className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="text-2xl font-bold text-slate-900">Não foi possível confirmar</h1>
          <p className="text-sm leading-6 text-slate-600">
            {error === 'missing'
              ? 'Link incompleto.'
              : error === 'db'
                ? 'Serviço temporariamente indisponível.'
                : decodeURIComponent(error || 'Link inválido ou expirado.')}
          </p>
          <Button asChild className="w-full" variant="outline">
            <Link href="/login">Voltar ao login</Link>
          </Button>
        </>
      )}
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <AuthShell subtitle="Confirmação de e-mail">
      <Suspense>
        <VerifyContent />
      </Suspense>
    </AuthShell>
  );
}
