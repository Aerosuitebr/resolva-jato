'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarClock,
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
import { formatDate, formatDateTime, grantPremiumMonth, cancelPremium } from '@/lib/billing';
import { PLANS } from '@/lib/plans';

function firstValidParam(searchParams: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value && value !== 'null' && value !== 'undefined') return value;
  }
  return '';
}

function ContaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { session, plan, usage, refresh, logout } = useAuth();
  const wantsUpgrade = searchParams.get('upgrade') === 'premium';
  const billingStatus = searchParams.get('billing');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [billingMessage, setBillingMessage] = useState<{
    type: 'success' | 'pending' | 'error';
    text: string;
  } | null>(null);
  const confirmTried = useRef(false);

  useEffect(() => {
    if (!session?.user.email || confirmTried.current) return;
    if (billingStatus !== 'success' && billingStatus !== 'pending' && billingStatus !== 'failure') {
      return;
    }

    confirmTried.current = true;

    // MP frequentemente envia payment_id=null; o id real vem em collection_id / merchant_order_id
    const paymentId = firstValidParam(searchParams, ['payment_id', 'collection_id']);
    const merchantOrderId = firstValidParam(searchParams, ['merchant_order_id']);
    const mpStatus = firstValidParam(searchParams, ['collection_status', 'status']).toLowerCase();

    if (billingStatus === 'failure') {
      setBillingMessage({ type: 'error', text: 'Pagamento não concluído. Você pode tentar de novo.' });
      router.replace('/conta');
      return;
    }

    if (billingStatus === 'pending' || mpStatus === 'pending' || mpStatus === 'in_process') {
      setBillingMessage({
        type: 'pending',
        text: 'Pagamento pendente (ex.: Pix aguardando). Assim que for aprovado, volte nesta página — o Premium libera automaticamente.'
      });
      router.replace('/conta');
      return;
    }

    async function activatePremium(label: string) {
      await grantPremiumMonth();
      await refresh();
      setBillingMessage({ type: 'success', text: label });
      toast('Premium ativado — uso ilimitado liberado.');
      router.replace('/conta');
    }

    // Retorno aprovado sem id (comum no sandbox): libera localmente
    if (billingStatus === 'success' && mpStatus === 'approved' && !paymentId && !merchantOrderId) {
      void activatePremium('Pagamento aprovado no Mercado Pago. Premium liberado por 30 dias.');
      return;
    }

    if (!paymentId && !merchantOrderId) {
      setBillingMessage({
        type: 'pending',
        text: 'Retorno do Mercado Pago recebido, mas sem id de pagamento. Se o pagamento foi aprovado, use o botão “Já paguei — liberar Premium” abaixo.'
      });
      router.replace('/conta');
      return;
    }

    const qs = new URLSearchParams({ email: session.user.email });
    if (paymentId) qs.set('payment_id', paymentId);
    if (merchantOrderId) qs.set('merchant_order_id', merchantOrderId);

    fetch(`/api/billing/confirm?${qs.toString()}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível confirmar o pagamento.');
        if (data.approved || mpStatus === 'approved') {
          await activatePremium('Pagamento aprovado! Premium liberado por 30 dias com uso ilimitado.');
        } else {
          setBillingMessage({
            type: 'pending',
            text: `Pagamento com status “${data.status || 'pendente'}”. Aguarde a confirmação e atualize a página.`
          });
          router.replace('/conta');
        }
      })
      .catch(async (error) => {
        // Se o MP já marcou approved na URL, libera mesmo se a API falhar (ex.: rede/token)
        if (mpStatus === 'approved' || billingStatus === 'success') {
          await activatePremium(
            'Pagamento indicado como aprovado. Premium liberado neste aparelho por 30 dias.'
          );
          return;
        }
        setBillingMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Falha ao confirmar pagamento.'
        });
        router.replace('/conta');
      });
  }, [billingStatus, refresh, router, searchParams, session?.user.email, toast]);

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
      const message = error instanceof Error ? error.message : 'Falha ao abrir o Mercado Pago.';
      setBillingMessage({ type: 'error', text: message });
      toast(message);
    }
  }

  async function handleManualPremiumUnlock() {
    try {
      await grantPremiumMonth();
      await refresh();
      setBillingMessage({
        type: 'success',
        text: 'Premium liberado por 30 dias. Uso ilimitado ativo.'
      });
      toast('Premium ativado.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Falha ao liberar Premium.');
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
      description="Entre para acompanhar plano, utilizações e upgrade Premium."
      enforceUsageLimit={false}
      requireEmailVerified={false}
    >
      <div className="space-y-5">
        <PageHero
          title="Minha conta"
          subtitle="Gerencie seu plano, acompanhe utilizações e evolua para o Premium quando fizer sentido."
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
                    usage.unlimited ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {usage.unlimited ? <Crown className="h-3.5 w-3.5" /> : <Gauge className="h-3.5 w-3.5" />}
                  {usage.unlimited
                    ? 'Uso ilimitado'
                    : usage.remaining === 0
                      ? 'Sem usos restantes'
                      : `Restam ${usage.remaining} usos`}
                </span>
              </div>

              {!usage.unlimited ? (
                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm font-semibold text-slate-700">
                    <span>Usos já consumidos</span>
                    <span>
                      {usage.current} de {usage.limit}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${usage.remaining === 0 ? 'bg-rose-500' : 'bg-sky-600'}`}
                      style={{
                        width: `${Math.max(((usage.current || 0) / (usage.limit || 5)) * 100, 0)}%`
                      }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Cada salvamento manual ou download concluído consome uma utilização. O salvamento automático não
                    consome saldo.
                  </p>
                  {usage.nextReleaseAt ? (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                      <div>
                        <p className="text-sm font-bold text-amber-950">Próxima liberação de 5 utilizações</p>
                        <p className="mt-1 text-sm text-amber-900">{formatDateTime(usage.nextReleaseAt)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-slate-500">
                      O prazo de 30 dias começa quando a quinta utilização for consumida.
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                      <div>
                        <p className="text-sm font-bold text-emerald-950">Premium ativo — uso ilimitado</p>
                        <p className="mt-1 text-sm text-emerald-900">
                          Sem contador de utilizações. Salve e baixe à vontade até{' '}
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
                      <p className="text-sm font-bold text-amber-950">Vigência do plano</p>
                      <p className="mt-1 text-sm text-amber-900">
                        {usage.premiumExpiresAt
                          ? `Válido até ${formatDate(usage.premiumExpiresAt)} (${formatDateTime(usage.premiumExpiresAt)})`
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
                {!usage.unlimited ? (
                  <Button onClick={handleManualPremiumUnlock}>
                    Já paguei — liberar Premium
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={logout}>
                  Sair da conta
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
              {plan.id === 'premium' ? 'Você está no uso ilimitado.' : 'Trabalhe sem contar utilizações.'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {plan.id === 'premium' && usage.premiumExpiresAt
                ? `Plano Premium vigente até ${formatDate(usage.premiumExpiresAt)}. Contador do plano grátis oculto enquanto o Premium estiver ativo.`
                : `Por ${PLANS.premium.priceLabel}${PLANS.premium.period}, salve e baixe documentos sem limites durante 30 dias. Pagamento via Mercado Pago (cartão, Pix e outros).`}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Salvamentos e downloads ilimitados',
                'Todas as ferramentas liberadas',
                '30 dias completos de acesso'
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
              <Button
                className="mt-7 w-full bg-white text-slate-950 hover:bg-sky-50"
                onClick={handleUpgrade}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {checkoutLoading
                  ? 'Abrindo Mercado Pago…'
                  : wantsUpgrade
                    ? 'Pagar Premium no Mercado Pago'
                    : 'Pagar Premium no Mercado Pago'}
              </Button>
            )}
            <p className="mt-4 text-xs leading-5 text-slate-400">
              {plan.id === 'premium'
                ? 'Após o vencimento, a conta volta ao plano grátis com 5 utilizações.'
                : 'Você será redirecionado ao Checkout Pro do Mercado Pago (cartão, Pix e outros). Após o pagamento aprovado, o Premium libera automaticamente por 30 dias.'}
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
