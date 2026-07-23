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

    if (!paymentId && !merchantOrderId) {
      setBillingMessage({
        type: 'pending',
        text: 'Retorno do Mercado Pago recebido, mas sem id de pagamento. Atualize a página em alguns segundos ou entre em contato se o valor já tiver sido cobrado.'
      });
      router.replace('/conta');
      return;
    }

    const qs = new URLSearchParams({ email: session.user.email });
    if (paymentId) qs.set('payment_id', paymentId);
    if (merchantOrderId) qs.set('merchant_order_id', merchantOrderId);

    fetch(`/api/billing/confirm?${qs.toString()}`, { credentials: 'include' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível confirmar o pagamento.');
        if (data.approved) {
          await refresh();
          setBillingMessage({
            type: 'success',
            text: 'Pagamento aprovado! Premium ativo por 30 dias: documentos sem marca Resolva Jato.'
          });
          toast('Premium ativado — documentos limpos, sem marca.');
          router.replace('/conta');
        } else {
          setBillingMessage({
            type: 'pending',
            text: `Pagamento com status “${data.status || 'pendente'}”. Aguarde a confirmação e atualize a página.`
          });
          router.replace('/conta');
        }
      })
      .catch((error) => {
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
                          PDFs limpos (sem rodapé e sem logo) até{' '}
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
                    ? 'Remover marca no Mercado Pago'
                    : 'Remover marca no Mercado Pago'}
              </Button>
            )}
            <p className="mt-4 text-xs leading-5 text-slate-400">
              {plan.id === 'premium'
                ? 'Após o vencimento, a conta volta ao plano grátis.'
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
