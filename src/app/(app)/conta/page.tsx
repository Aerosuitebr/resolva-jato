'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  Gauge,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { EnablePushButton } from '@/components/push/enable-push-button';
import { ReferralPanel } from '@/components/referral/referral-panel';
import { WhatsAppEphemeralInfoCard } from '@/components/whatsapp/whatsapp-ephemeral-info-card';
import { PageHero } from '@/components/shared/page-hero';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import { formatDate, formatDateTime, cancelPremium } from '@/lib/billing';
import { formatCpf, isValidCpf } from '@/lib/cpf';
import { PLANS } from '@/lib/plans';
import { Input } from '@/components/ui/input';

const PENDING_PAYMENT_KEY = 'rj_pending_mp_payment';
const PENDING_NUPAY_KEY = 'rj_pending_nupay';
const POLL_INTERVAL_MS = 4000;
const POLL_MAX_MS = 12 * 60 * 1000;

function firstValidParam(searchParams: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value && value !== 'null' && value !== 'undefined') return value;
  }
  return '';
}

function readPendingPayment() {
  if (typeof window === 'undefined') return { paymentId: '', merchantOrderId: '' };
  try {
    const raw = sessionStorage.getItem(PENDING_PAYMENT_KEY);
    if (!raw) return { paymentId: '', merchantOrderId: '' };
    const parsed = JSON.parse(raw) as { paymentId?: string; merchantOrderId?: string };
    return {
      paymentId: parsed.paymentId || '',
      merchantOrderId: parsed.merchantOrderId || ''
    };
  } catch {
    return { paymentId: '', merchantOrderId: '' };
  }
}

function savePendingPayment(paymentId: string, merchantOrderId: string) {
  if (typeof window === 'undefined') return;
  if (!paymentId && !merchantOrderId) return;
  sessionStorage.setItem(
    PENDING_PAYMENT_KEY,
    JSON.stringify({ paymentId, merchantOrderId, savedAt: Date.now() })
  );
}

function clearPendingPayment() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PENDING_PAYMENT_KEY);
}

function savePendingNuPay(sessionId: string, reference: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(
    PENDING_NUPAY_KEY,
    JSON.stringify({ sessionId, reference, savedAt: Date.now() })
  );
}

function readPendingNuPay() {
  if (typeof window === 'undefined') return { sessionId: '', reference: '' };
  try {
    const raw = sessionStorage.getItem(PENDING_NUPAY_KEY);
    if (!raw) return { sessionId: '', reference: '' };
    const parsed = JSON.parse(raw) as { sessionId?: string; reference?: string };
    return { sessionId: parsed.sessionId || '', reference: parsed.reference || '' };
  } catch {
    return { sessionId: '', reference: '' };
  }
}

function clearPendingNuPay() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PENDING_NUPAY_KEY);
}

function ContaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { session, plan, usage, refresh } = useAuth();
  const billingStatus = searchParams.get('billing');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [nupayLoading, setNupayLoading] = useState(false);
  const [cpf, setCpf] = useState('');
  const [billingMessage, setBillingMessage] = useState<{
    type: 'success' | 'pending' | 'error';
    text: string;
  } | null>(null);
  const pollStarted = useRef(false);

  async function confirmPayment(opts?: {
    paymentId?: string;
    merchantOrderId?: string;
    silent?: boolean;
  }) {
    if (!session?.user.email) return { approved: false as const };

    const stored = readPendingPayment();
    const paymentId = opts?.paymentId || stored.paymentId;
    const merchantOrderId = opts?.merchantOrderId || stored.merchantOrderId;
    const qs = new URLSearchParams({ email: session.user.email });
    if (paymentId) qs.set('payment_id', paymentId);
    if (merchantOrderId) qs.set('merchant_order_id', merchantOrderId);

    const response = await fetch(`/api/billing/confirm?${qs.toString()}`, {
      credentials: 'include'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Não foi possível confirmar o pagamento.');
    }

    if (data.approved) {
      clearPendingPayment();
      await refresh();
      setBillingMessage({
        type: 'success',
        text: 'Pagamento aprovado! Premium ativo por 30 dias: documentos sem marca Resolva Jato.'
      });
      if (!opts?.silent) toast('Premium ativado — documentos limpos, sem marca.');
      return { approved: true as const };
    }

    if (!opts?.silent) {
      setBillingMessage({
        type: 'pending',
        text: 'Pagamento ainda em processamento (Pix, cartão ou outro meio). Continuamos verificando automaticamente; o Premium libera assim que for aprovado.'
      });
    }
    return { approved: false as const, status: data.status as string | undefined };
  }

  async function confirmNuPay(opts?: { sessionId?: string; reference?: string; silent?: boolean }) {
    const stored = readPendingNuPay();
    const sessionId = opts?.sessionId || stored.sessionId;
    const reference = opts?.reference || stored.reference;
    const qs = new URLSearchParams();
    if (sessionId) qs.set('sessionId', sessionId);
    if (reference) qs.set('reference', reference);

    const response = await fetch(`/api/billing/confirm-nupay?${qs.toString()}`, {
      credentials: 'include'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Não foi possível confirmar o NuPay.');
    }

    if (data.approved) {
      clearPendingNuPay();
      await refresh();
      setBillingMessage({
        type: 'success',
        text: 'Pagamento NuPay aprovado! Premium ativo por 30 dias: documentos sem marca Resolva Jato.'
      });
      if (!opts?.silent) toast('Premium ativado via NuPay.');
      return { approved: true as const };
    }

    if (!opts?.silent) {
      setBillingMessage({
        type: 'pending',
        text: 'Aguardando confirmação do NuPay no app do Nubank…'
      });
    }
    return { approved: false as const, status: data.status as string | undefined };
  }

  useEffect(() => {
    if (!session?.user.email || pollStarted.current) return;
    if (billingStatus !== 'success' && billingStatus !== 'pending' && billingStatus !== 'failure' && billingStatus !== 'nupay' && billingStatus !== 'nupay-success' && billingStatus !== 'nupay-cancel') {
      return;
    }

    pollStarted.current = true;

    if (billingStatus === 'nupay-cancel') {
      clearPendingNuPay();
      setBillingMessage({ type: 'error', text: 'Pagamento NuPay cancelado. Você pode tentar de novo.' });
      router.replace('/conta');
      return;
    }

    if (billingStatus === 'nupay' || billingStatus === 'nupay-success') {
      const sessionId = firstValidParam(searchParams, ['sessionId', 'session_id']);
      const reference = firstValidParam(searchParams, ['reference']);
      const state = firstValidParam(searchParams, ['state']).toLowerCase();
      if (sessionId || reference) savePendingNuPay(sessionId, reference);

      if (state === 'canceled' || state === 'cancelled') {
        clearPendingNuPay();
        setBillingMessage({ type: 'error', text: 'Pagamento NuPay cancelado.' });
        router.replace('/conta');
        return;
      }

      setBillingMessage({
        type: 'pending',
        text: 'Confirmando pagamento NuPay…'
      });
      router.replace('/conta');

      let cancelled = false;
      const startedAt = Date.now();
      let timer: number | undefined;

      const tick = async () => {
        if (cancelled) return;
        try {
          const result = await confirmNuPay({ sessionId, reference, silent: true });
          if (cancelled) return;
          if (result.approved) {
            toast('Premium ativado via NuPay.');
            return;
          }
          setBillingMessage({
            type: 'pending',
            text: 'Aguardando aprovação no app do Nubank…'
          });
        } catch (error) {
          if (cancelled) return;
          setBillingMessage({
            type: 'error',
            text: error instanceof Error ? error.message : 'Falha ao confirmar NuPay.'
          });
        }

        if (Date.now() - startedAt >= POLL_MAX_MS) {
          setBillingMessage({
            type: 'pending',
            text: 'Ainda não encontramos a aprovação NuPay. Atualize esta página em alguns minutos.'
          });
          return;
        }
        timer = window.setTimeout(() => {
          void tick();
        }, POLL_INTERVAL_MS);
      };

      void tick();
      return () => {
        cancelled = true;
        if (timer) window.clearTimeout(timer);
      };
    }

    const paymentId = firstValidParam(searchParams, ['payment_id', 'collection_id']);
    const merchantOrderId = firstValidParam(searchParams, ['merchant_order_id']);
    savePendingPayment(paymentId, merchantOrderId);

    if (billingStatus === 'failure') {
      clearPendingPayment();
      setBillingMessage({ type: 'error', text: 'Pagamento não concluído. Você pode tentar de novo.' });
      router.replace('/conta');
      return;
    }

    setBillingMessage({
      type: 'pending',
      text: 'Confirmando seu pagamento (Pix, cartão e outros meios). Isso pode levar alguns segundos…'
    });
    router.replace('/conta');

    let cancelled = false;
    const startedAt = Date.now();
    let timer: number | undefined;

    const tick = async () => {
      if (cancelled) return;
      try {
        const result = await confirmPayment({
          paymentId,
          merchantOrderId,
          silent: true
        });
        if (cancelled) return;
        if (result.approved) {
          toast('Premium ativado — documentos limpos, sem marca.');
          return;
        }
        setBillingMessage({
          type: 'pending',
          text: 'Aguardando aprovação do pagamento. Verificamos de novo em instantes…'
        });
      } catch (error) {
        if (cancelled) return;
        setBillingMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Falha ao confirmar pagamento.'
        });
      }

      if (Date.now() - startedAt >= POLL_MAX_MS) {
        setBillingMessage({
          type: 'pending',
          text: 'Ainda não encontramos a aprovação. Atualize esta página em alguns minutos — o Premium libera automaticamente quando o pagamento for confirmado.'
        });
        return;
      }
      timer = window.setTimeout(() => {
        void tick();
      }, POLL_INTERVAL_MS);
    };

    void tick();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- uma vez no retorno do checkout
  }, [billingStatus, session?.user.email]);

  async function handleUpgrade() {
    if (!session?.user.email) {
      toast('Faça login para assinar o Premium.');
      return;
    }
    setCheckoutLoading(true);
    setBillingMessage(null);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível iniciar o checkout.');
      window.location.href = data.checkoutUrl as string;
    } catch (error) {
      setCheckoutLoading(false);
      const message = error instanceof Error ? error.message : 'Falha ao abrir o pagamento.';
      setBillingMessage({ type: 'error', text: message });
      toast(message);
    }
  }

  async function handleNuPayUpgrade() {
    if (!session?.user.email) {
      toast('Faça login para assinar com NuPay.');
      return;
    }
    if (!isValidCpf(cpf)) {
      toast('Informe um CPF válido para pagar com NuPay.');
      setBillingMessage({ type: 'error', text: 'CPF inválido. O NuPay exige CPF de conta Nubank elegível.' });
      return;
    }
    setNupayLoading(true);
    setBillingMessage(null);
    try {
      const response = await fetch('/api/billing/checkout-nupay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cpf })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível iniciar o NuPay.');
      if (data.sessionId) savePendingNuPay(data.sessionId, data.reference || '');
      window.location.href = data.checkoutUrl as string;
    } catch (error) {
      setNupayLoading(false);
      const message = error instanceof Error ? error.message : 'Falha ao abrir o NuPay.';
      setBillingMessage({ type: 'error', text: message });
      toast(message);
    }
  }

  function handleDowngrade() {
    cancelPremium();
    void refresh();
    toast('Premium encerrado neste navegador (servidor mantém até expirar).');
  }

  return (
    <AuthGate
      title="Sua conta"
      description="Entre para acompanhar seu plano e o upgrade Premium."
      enforceUsageLimit={false}
      requireEmailVerified={false}
    >
      <div className="space-y-5">
        <PageHero
          title="Minha conta"
          subtitle="Gerencie seu plano e remova a marca Resolva Jato com o Premium quando fizer sentido."
          icon={Sparkles}
        />

        {billingMessage ? (
          <div
            className={
              billingMessage.type === 'success'
                ? 'rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950'
                : billingMessage.type === 'pending'
                  ? 'rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950'
                  : 'rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-950'
            }
          >
            {billingMessage.text}
          </div>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-950 p-6 text-white sm:p-7">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
                  <UserRound className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Conta conectada</p>
                  <h2 className="mt-1 truncate text-xl font-bold">{session?.user.name}</h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                    <Mail className="h-3.5 w-3.5" />
                    {session?.user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Plano atual</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{plan.name}</p>
                  {usage.unlimited && usage.premiumExpiresAt ? (
                    <p className="mt-1 text-sm font-semibold text-emerald-700">
                      Vigência até {formatDateTime(usage.premiumExpiresAt)}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                    usage.unlimited
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {usage.unlimited ? <Crown className="h-3.5 w-3.5" /> : <Gauge className="h-3.5 w-3.5" />}
                  {usage.unlimited ? 'Premium · sem marca' : 'Ferramentas liberadas'}
                </span>
              </div>

              {!usage.unlimited ? (
                <div className="mt-6">
                  <p className="text-sm leading-6 text-slate-600">
                    Crie e baixe currículos, contratos, recibos e outros documentos com qualidade profissional.
                    No plano gratuito o PDF inclui a marca Resolva Jato — remova por {PLANS.premium.priceLabel}
                    {PLANS.premium.period}.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                      <div>
                        <p className="text-sm font-bold text-emerald-950">
                          Premium ativo — documentos sem marca Resolva Jato
                        </p>
                        <p className="mt-1 text-sm text-emerald-900">
                          PDFs limpos (sem rodapé e sem logo) ate{' '}
                          {usage.premiumExpiresAt
                            ? formatDateTime(usage.premiumExpiresAt)
                            : 'o fim do período contratado'}
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <Crown className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                    <div>
                      <p className="text-sm font-bold text-amber-950">Vigência sem referências</p>
                      <p className="mt-1 text-sm text-amber-900">
                        {usage.premiumExpiresAt
                          ? `Documentos sem marca Resolva Jato até ${formatDate(usage.premiumExpiresAt)} (${formatDateTime(usage.premiumExpiresAt)})`
                          : 'Período de 30 dias a partir da ativação.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href="/ferramentas">Ir para ferramentas</Link>
                </Button>
              </div>
            </div>
          </article>

          <aside
            className={`rounded-[28px] border p-6 shadow-xl sm:p-7 ${
              plan.id === 'premium'
                ? 'border-emerald-300 bg-gradient-to-br from-emerald-950 to-slate-950 text-white shadow-emerald-900/10'
                : 'border-slate-800 bg-gradient-to-br from-slate-950 to-blue-950 text-white shadow-slate-900/10'
            }`}
          >
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide ${
                plan.id === 'premium' ? 'bg-emerald-300 text-emerald-950' : 'bg-amber-300 text-slate-950'
              }`}
            >
              <Crown className="h-3.5 w-3.5" />
              {plan.id === 'premium' ? 'Premium ativo' : 'Premium'}
            </span>
            <h2 className="mt-5 text-2xl font-black">
              {plan.id === 'premium'
                ? 'Documentos sem marca Resolva Jato.'
                : 'Remova as referências do PDF.'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {plan.id === 'premium' && usage.premiumExpiresAt
                ? `Vigência até ${formatDate(usage.premiumExpiresAt)}: PDFs limpos, sem marca Resolva Jato.`
                : `Por ${PLANS.premium.priceLabel}${PLANS.premium.period}, gere documentos profissionais sem rodapé nem logo do Resolva Jato.`}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'PDF sem rodapé e sem logo Resolva Jato',
                'WhatsApp e e-mail sem referências',
                '30 dias de vigência claros na conta'
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm text-slate-100">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-sky-300" />
                  {benefit}
                </li>
              ))}
            </ul>
            {plan.id === 'premium' ? (
              <Button
                variant="outline"
                className="mt-7 w-full border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={handleDowngrade}
              >
                Encerrar Premium neste aparelho
              </Button>
            ) : (
              <div className="mt-7 space-y-3">
                <Button
                  className="w-full bg-white text-slate-950 hover:bg-sky-50"
                  onClick={handleUpgrade}
                  disabled={checkoutLoading || nupayLoading}
                >
                  {checkoutLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  {checkoutLoading
                    ? 'Abrindo pagamento…'
                    : `Assinar Premium por ${PLANS.premium.priceLabel}`}
                </Button>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    CPF para NuPay (Nubank)
                  </label>
                  <Input
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    autoComplete="off"
                    className="mt-2 border-white/20 bg-slate-950/40 text-white placeholder:text-slate-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    onClick={handleNuPayUpgrade}
                    disabled={checkoutLoading || nupayLoading}
                  >
                    {nupayLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {nupayLoading ? 'Abrindo NuPay…' : 'Pagar com NuPay'}
                  </Button>
                </div>
              </div>
            )}
            <p className="mt-4 text-xs leading-5 text-slate-400">
              {plan.id === 'premium'
                ? 'Após o vencimento, a conta volta ao plano grátis.'
                : 'Pagamento seguro (cartão, Pix, NuPay e outros). Assim que for aprovado — por qualquer meio — o Premium libera automaticamente por 30 dias.'}
            </p>
          </aside>
        </section>

        <ReferralPanel />

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Como você é avisado (sem barreira no iPhone)
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li>
              <strong>1. E-mail:</strong> caixa de entrada (configure Resend no servidor).
            </li>
            <li>
              <strong>2. SMS:</strong> mensagem de texto automática no seu chip (configure Twilio).
            </li>
            <li>
              <strong>3. Push no navegador:</strong> opcional, melhor no Android.
            </li>
            <li>
              <strong>4. WhatsApp ao cliente:</strong> na hora do envio do orçamento, você escaneia o QR com o seu
              aparelho, envia e o servidor desconecta (vários profissionais no mesmo site).
            </li>
          </ul>
          <div className="mt-5 space-y-4">
            <WhatsAppEphemeralInfoCard />
            <EnablePushButton variant="inline" />
          </div>
        </section>

        <section className="rounded-2xl border border-sky-200 bg-sky-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Busca sempre gratuita</h3>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                O catálogo de links úteis continua aberto para qualquer pessoa, com ou sem conta.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/busca">
                Explorar busca
                <Search className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </AuthGate>
  );
}

export default function ContaPage() {
  return (
    <Suspense>
      <ContaContent />
    </Suspense>
  );
}
