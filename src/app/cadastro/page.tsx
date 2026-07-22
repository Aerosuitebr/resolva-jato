'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { Lock, Mail, User } from 'lucide-react';
import { PasswordStrength } from '@/components/auth/password-strength';
import { AuthReturnBanner } from '@/components/auth/auth-return-banner';
import { TurnstileWidget } from '@/components/auth/turnstile-widget';
import { AuthShell } from '@/components/brand/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerUser } from '@/lib/auth';
import { evaluatePasswordStrength } from '@/lib/password';
import {
  clearStoredReferralCode,
  readStoredReferralCode,
  ReferralCapture
} from '@/components/referral/referral-capture';
import { normalizeReferralCode } from '@/lib/referral-shared';

function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/ferramentas';
  return raw;
}

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const referralFromUrl = normalizeReferralCode(searchParams.get('ref'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [doneEmail, setDoneEmail] = useState('');
  const [referralCode] = useState(() => referralFromUrl || readStoredReferralCode());

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!strength.valid) {
      setError(strength.firstError || 'A senha não atende aos requisitos de segurança.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser({
        name,
        email,
        password,
        turnstileToken,
        referralCode: referralCode || undefined
      });
      clearStoredReferralCode();
      setDoneEmail(result.email);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  }

  if (doneEmail) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-lg font-bold text-slate-900">Confirme seu e-mail</p>
        <p className="text-sm leading-6 text-slate-600">
          Enviamos um link para <strong>{doneEmail}</strong>. Sem a confirmação, as ferramentas
          não são liberadas para salvamento e download.
        </p>
        <Button asChild className="w-full">
          <Link href={`/login?next=${encodeURIComponent(next)}&email=${encodeURIComponent(doneEmail)}`}>
            Ir para o login
          </Link>
        </Button>
        <p className="text-xs text-slate-500">
          Não recebeu? Entre e use &quot;Reenviar confirmação&quot; ou verifique o spam.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ReferralCapture />
      <AuthReturnBanner nextHref={searchParams.get('next')} />
      <p className="text-center text-sm text-slate-600">
        Sem cartão. Confirme o e-mail para liberar as ferramentas.
      </p>
      {referralCode ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-900">
          Convite aplicado: código <span className="font-mono">{referralCode}</span>
        </p>
      ) : null}
      <label className="relative block">
        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" className="pl-10" />
      </label>
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
      <div className="space-y-3">
        <label className="relative block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Senha
          </span>
          <span className="relative block">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Crie uma senha forte"
              className="pl-10"
              required
              minLength={8}
              autoComplete="new-password"
              aria-describedby="password-rules"
            />
          </span>
        </label>
        <div id="password-rules">
          <PasswordStrength password={password} />
        </div>
      </div>
      <TurnstileWidget onToken={setTurnstileToken} />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <Button
        type="submit"
        className="w-full"
        loading={loading}
        disabled={(Boolean(password) && !strength.valid) || !turnstileToken}
      >
        Criar conta
      </Button>
      <p className="text-center text-sm text-slate-600">
        Já tem conta?{' '}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-semibold text-sky-700 hover:text-sky-800"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}

export default function CadastroPage() {
  return (
    <AuthShell subtitle="Crie sua conta gratuita. Confirme o e-mail e libere as ferramentas.">
      <Suspense>
        <CadastroForm />
      </Suspense>
    </AuthShell>
  );
}
