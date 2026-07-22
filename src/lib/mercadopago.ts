import { PLANS } from '@/lib/plans';

const MP_API = 'https://api.mercadopago.com';

export function getMercadoPagoAccessToken() {
  return process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() || '';
}

export function getAppPublicUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

/** `production` usa init_point; `sandbox` usa sandbox_init_point (credenciais de teste). */
export function getMercadoPagoMode(): 'production' | 'sandbox' {
  const raw = (process.env.MERCADOPAGO_MODE || process.env.NEXT_PUBLIC_MERCADOPAGO_MODE || '')
    .trim()
    .toLowerCase();
  if (raw === 'sandbox' || raw === 'test' || raw === 'teste') return 'sandbox';
  if (raw === 'production' || raw === 'prod' || raw === 'producao' || raw === 'produção') {
    return 'production';
  }
  return process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';
}

export function isMercadoPagoSandbox() {
  return getMercadoPagoMode() === 'sandbox';
}

export function isMercadoPagoConfigured() {
  return Boolean(getMercadoPagoAccessToken());
}

async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getMercadoPagoAccessToken();
  if (!token) {
    throw new Error('Mercado Pago não configurado. Defina MERCADOPAGO_ACCESS_TOKEN no .env.');
  }

  const response = await fetch(`${MP_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });

  const data = (await response.json().catch(() => ({}))) as T & { message?: string; error?: string };
  if (!response.ok) {
    const detail =
      (data as { message?: string }).message ||
      (data as { error?: string }).error ||
      `Erro Mercado Pago (${response.status})`;
    throw new Error(detail);
  }
  return data;
}

export interface CheckoutPreferenceResult {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
}

export async function createPremiumCheckoutPreference(input: {
  payerEmail: string;
  payerName?: string;
}) {
  const appUrl = getAppPublicUrl();
  const amount = PLANS.premium.price;
  const sandbox = isMercadoPagoSandbox();

  const preference = await mpFetch<CheckoutPreferenceResult>('/checkout/preferences', {
    method: 'POST',
    body: JSON.stringify({
      items: [
        {
          id: 'premium-30-dias',
          title: 'Resolva Jato Premium — documentos sem marca · 30 dias',
          description: 'Utilizações ilimitadas das ferramentas por 30 dias',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: amount
        }
      ],
      payer: {
        email: input.payerEmail,
        name: input.payerName || undefined
      },
      external_reference: input.payerEmail.toLowerCase(),
      statement_descriptor: 'RESOLVA JATO',
      payment_methods: {
        installments: 1
      },
      back_urls: {
        success: `${appUrl}/conta?billing=success`,
        failure: `${appUrl}/conta?billing=failure`,
        pending: `${appUrl}/conta?billing=pending`
      },
      auto_return: 'approved',
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      metadata: {
        product: 'premium',
        days: 30,
        mode: sandbox ? 'sandbox' : 'production'
      }
    })
  });

  const checkoutUrl = sandbox
    ? preference.sandbox_init_point || preference.init_point
    : preference.init_point || preference.sandbox_init_point;

  if (!checkoutUrl) {
    throw new Error('Preferência criada, mas sem URL de checkout.');
  }

  return {
    preferenceId: preference.id,
    checkoutUrl,
    mode: sandbox ? ('sandbox' as const) : ('production' as const)
  };
}

export interface MercadoPagoPayment {
  id: number;
  status: string;
  status_detail?: string;
  external_reference?: string | null;
  transaction_amount?: number;
  payment_method_id?: string;
  date_approved?: string | null;
}

export async function getMercadoPagoPayment(paymentId: string) {
  return mpFetch<MercadoPagoPayment>(`/v1/payments/${paymentId}`);
}

export async function getMerchantOrder(orderId: string) {
  return mpFetch<{ id: number; payments?: Array<{ id: number; status: string }> }>(
    `/merchant_orders/${orderId}`
  );
}
