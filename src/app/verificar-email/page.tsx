'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { CheckCircle2, Loader2, MailWarning, ShieldCheck } from 'lucide-react';
import { AuthShell } from '@/components/brand/auth-shell';
import { Button } from '@/components/ui/button';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const errorParam = searchParams.get('error');

  const [phase, setPhase] = useState<'ready' | 'loading' | 'error'>(
    errorParam ? 'error' : token ? 'ready' : 'error'
  );
  const [error, setError] = useState(errorParam || (!token ? 'missing' : ''));

  async function confirmEmail() {
    if (!token) return;
    setPhase('loading');
    setError('');
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; email?: string }
        | null;

      if (res.ok && data?.ok) {
        const email = data.email ? encodeURIComponent(data.email) : '';
        router.replace(`/login?verified=1${email ? `&email=${email}` : ''}`);
        return;
      }

      setError(data?.error || 'server');
      setPhase('error');
    } catch {
      setError('server');
      setPhase('error');
    }
  }

  if (phase === 'loading') {
    return (
      <div className="space-y-5 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-sky-600" />
        <h1 className="text-2xl font-bold text-slate-900">Confirmando e-mail…</h1>
        <p className="text-sm leading-6 text-slate-600">Só um instante.</p>
      </div>
    );
  }

  if (phase === 'ready' && token) {
    return (
      <div className="space-y-5 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-sky-600" />
        <h1 className="text-2xl font-bold text-slate-900">Confirmar e-mail</h1>
        <p className="text-sm leading-6 text-slate-600">
          Você está em <strong className="font-semibold text-slate-800">resolvajato.com.br</strong>.
          Toque no botão abaixo para ativar sua conta. Depois, entre com sua senha.
        </p>
        <Button type="button" className="w-full" onClick={() => void confirmEmail()}>
          Confirmar meu e-mail
        </Button>
        <p className="text-xs leading-5 text-slate-500">
          Se você não criou esta conta, ignore esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-center">
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
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <AuthShell subtitle="Confirmação de e-mail — Resolva Jato">
      <Suspense>
        <VerifyContent />
      </Suspense>
    </AuthShell>
  );
}
