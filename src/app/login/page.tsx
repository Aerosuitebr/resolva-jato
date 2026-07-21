'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { AuthReturnBanner } from '@/components/auth/auth-return-banner';
import { TurnstileWidget } from '@/components/auth/turnstile-widget';
import { AuthShell } from '@/components/brand/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { loginUser, resendVerification } from '@/lib/auth';

function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/ferramentas';
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const { ready, isAuthenticated, emailVerified, refresh } = useAuth();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const verified = searchParams.get('verified') === '1';

  useEffect(() => {
    if (!ready) return;
    if (isAuthenticated && emailVerified) router.replace(next);
  }, [emailVerified, isAuthenticated, next, ready, router]);

  useEffect(() => {
    if (verified) {
      setInfo('E-mail confirmado. Entre com sua senha para acessar as ferramentas.');
    }
  }, [verified]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      await refresh();
      if (!data.emailVerified) {
        setNeedsVerify(true);
        setInfo('Conta encontrada, mas o e-mail ainda não foi confirmado.');
        return;
      }
      router.push(next);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setInfo('');
    try {
      await resendVerification(email, turnstileToken);
      setInfo('Se a conta existir e ainda não estiver confirmada, enviamos um novo e-mail.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao reenviar.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthReturnBanner nextHref={searchParams.get('next')} />
      <p className="text-center text-sm text-slate-600">Acesse suas ferramentas e acompanhe seu plano.</p>
      <label className="relative block">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email@exemplo.com"
          className="pl-10"
          required
        />
      </label>
      <label className="relative block">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Senha"
          className="pl-10"
          required
        />
      </label>
      {needsVerify ? <TurnstileWidget onToken={setTurnstileToken} /> : null}
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {info ? <p className="text-sm font-medium text-sky-700">{info}</p> : null}
      <Button type="submit" className="w-full" loading={loading}>
        Entrar
      </Button>
      {needsVerify ? (
        <Button type="button" variant="outline" className="w-full" onClick={() => void handleResend()}>
          Reenviar confirmação
        </Button>
      ) : null}
      <p className="text-center text-sm text-slate-600">
        Ainda não tem conta?{' '}
        <Link
          href={`/cadastro?next=${encodeURIComponent(next)}`}
          className="font-semibold text-sky-700 hover:text-sky-800"
        >
          Criar conta grátis
        </Link>
      </p>
      <p className="rounded-xl bg-sky-50 px-4 py-3 text-center text-sm leading-6 text-slate-700">
        A busca de recursos continua gratuita e sem cadastro em{' '}
        <Link href="/busca" className="font-semibold text-sky-700">
          /busca
        </Link>
        .
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell subtitle="Entre para usar currículos, recibos, propostas e agenda.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
