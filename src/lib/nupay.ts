import { PLANS } from '@/lib/plans';
import { getAppPublicUrl } from '@/lib/mercadopago';
import { onlyDigits } from '@/lib/cpf';

export function getNuPayAppKey() {
  return process.env.NUPAY_APP_KEY?.trim() || '';
}

export function getNuPayAppToken() {
  return process.env.NUPAY_APP_TOKEN?.trim() || '';
}

export function getNuPayMode(): 'sandbox' | 'production' {
  const raw = (process.env.NUPAY_MODE || '').trim().toLowerCase();
  if (raw === 'production' || raw === 'prod' || raw === 'producao' || raw === 'produção') {
    return 'production';
  }
  return 'sandbox';
}

export function isNuPayConfigured() {
  return Boolean(getNuPayAppKey() && getNuPayAppToken());
}

export function getNuPayApiBase() {
  return getNuPayMode() === 'production'
    ? 'https://api.spinpay.com.br'
    : 'https://sandbox-api.spinpay.com.br';
}

async function nupayFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = getNuPayAppKey();
  const token = getNuPayAppToken();
  if (!key || !token) {
    throw new Error('NuPay não configurado. Defina NUPAY_APP_KEY e NUPAY_APP_TOKEN.');
  }

  const response = await fetch(`${getNuPayApiBase()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Merchant-Key': key,
      'X-Merchant-Token': token,
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string;
    error?: string;
    title?: string;
  };

  if (!response.ok) {
    const detail =
      data.message || data.error || data.title || `Erro NuPay (${response.status})`;
    const err = new Error(detail) as Error & { status?: number; body?: unknown };
    err.status = response.status;
    err.body = data;
    throw err;
  }

  return data;
}

export type NuPaySessionStatus = 'pending' | 'approved' | 'completed' | 'canceled' | 'expired';

export interface NuPayCheckoutSession {
  id: string;
  reference: string;
  status: NuPaySessionStatus;
  redirectUrl: string;
  createdAt: string;
  expiresAt: string;
  approvalCode?: string;
  selectedPaymentOption?: Record<string, unknown>;
  shopper?: {
    identification?: { type?: string; value?: string };
  };
}

export interface NuPayPaymentStatus {
  pspReferenceId: string;
  referenceId: string;
  status: 'WAITING_PAYMENT_METHOD' | 'AUTHORIZED' | 'CANCELLED' | 'ERROR' | 'COMPLETED';
  amount?: { value?: number; currency?: string };
  paymentMethodType?: string;
  paymentType?: string;
  timestamp?: string;
}

/** reference: rjprem_{userId}_{random} — único por tentativa. */
export function buildNuPayReference(userId: string) {
  const rand = Math.random().toString(36).slice(2, 10);
  return `rjprem_${userId}_${Date.now().toString(36)}_${rand}`;
}

export function parseUserIdFromNuPayReference(reference: string) {
  const parts = reference.split('_');
  if (parts[0] !== 'rjprem' || parts.length < 3) return null;
  return parts[1] || null;
}

export async function createNuPayPremiumSession(input: {
  userId: string;
  email: string;
  name: string;
  cpf: string;
}) {
  const appUrl = getAppPublicUrl();
  const amount = PLANS.premium.price;
  const reference = buildNuPayReference(input.userId);
  const cpf = onlyDigits(input.cpf);

  const session = await nupayFetch<NuPayCheckoutSession>('/v1/checkouts/sessions', {
    method: 'POST',
    body: JSON.stringify({
      currency: 'BRL',
      reference,
      amount,
      merchant: { displayName: 'Resolva Jato' },
      shopper: {
        identification: { type: 'CPF', value: cpf }
      },
      paymentOptions: [{ type: 'debit', totalAmount: amount }],
      lineItems: [
        {
          id: 'premium-30-dias',
          description: 'Resolva Jato Premium — documentos sem marca · 30 dias',
          quantity: 1,
          price: amount
        }
      ],
      expiresInMinutes: 30,
      returnUrl: `${appUrl}/conta?billing=nupay`,
      callbackUrl: `${appUrl}/api/webhooks/nupay`
    })
  });

  return {
    session,
    reference,
    checkoutUrl: session.redirectUrl,
    mode: getNuPayMode()
  };
}

export async function getNuPaySession(sessionId: string) {
  return nupayFetch<NuPayCheckoutSession>(`/v1/checkouts/sessions/${encodeURIComponent(sessionId)}`);
}

export async function getNuPaySessionByReference(reference: string) {
  return nupayFetch<NuPayCheckoutSession>(
    `/v1/checkouts/sessions/by-reference/${encodeURIComponent(reference)}`
  );
}

/**
 * Após a sessão approved, captura o pagamento com approvalCode.
 * Payload enxuto (fluxo sessões 2FA) + campos de pedido para APIs que exigem body completo.
 */
export async function createNuPayPaymentFromSession(input: {
  session: NuPayCheckoutSession;
  email: string;
  name: string;
  cpf: string;
}) {
  const { session } = input;
  if (!session.approvalCode) {
    throw new Error('Sessão NuPay sem approvalCode.');
  }

  const amount = PLANS.premium.price;
  const appUrl = getAppPublicUrl();
  const cpf = onlyDigits(input.cpf || session.shopper?.identification?.value || '');
  const nameParts = input.name.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || 'Cliente';
  const lastName = nameParts.slice(1).join(' ') || 'ResolvaJato';
  const referenceId = `${session.reference}-pay`;

  const body = {
    approvalCode: session.approvalCode,
    selectedPaymentOption: session.selectedPaymentOption,
    merchantOrderReference: session.reference,
    referenceId,
    merchantName: 'Resolva Jato',
    amount: { value: amount, currency: 'BRL' },
    delayToAutoCancel: 30,
    paymentMethod: {
      type: 'nupay',
      authorizationType: 'manually_authorized'
    },
    paymentFlow: {
      returnUrl: `${appUrl}/conta?billing=nupay-success`,
      cancelUrl: `${appUrl}/conta?billing=nupay-cancel`
    },
    shopper: {
      reference: session.reference,
      firstName,
      lastName,
      document: cpf,
      documentType: 'CPF',
      email: input.email,
      locale: 'pt-BR'
    },
    items: [
      {
        id: 'premium-30-dias',
        description: 'Resolva Jato Premium — 30 dias',
        value: amount,
        quantity: 1,
        discount: 0,
        taxAmount: 0,
        amountExcludingTax: amount,
        amountIncludingTax: amount
      }
    ],
    callbackUrl: `${appUrl}/api/webhooks/nupay`
  };

  return nupayFetch<{
    pspReferenceId: string;
    referenceId: string;
    status: string;
    paymentUrl?: string;
    paymentMethodType?: string;
  }>('/v1/checkouts/payments', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export async function getNuPayPaymentStatus(pspReferenceId: string) {
  return nupayFetch<NuPayPaymentStatus>(
    `/v1/checkouts/payments/${encodeURIComponent(pspReferenceId)}/status`
  );
}

export function isNuPayPaymentPaid(status: string | undefined) {
  return status === 'COMPLETED' || status === 'AUTHORIZED';
}
