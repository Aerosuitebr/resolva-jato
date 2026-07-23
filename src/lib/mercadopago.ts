import {
  BILLING_PRODUCTS,
  getBillingProduct,
  isBillingProductId,
  type BillingProductId
} from '@/lib/billing-products';

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

function splitPayerName(fullName?: string) {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { name: undefined as string | undefined, surname: undefined as string | undefined };
  if (parts.length === 1) return { name: parts[0], surname: undefined };
  return { name: parts[0], surname: parts.slice(1).join(' ') };
}

export async function createBillingCheckoutPreference(input: {
  payerEmail: string;
  payerName?: string;
  product?: BillingProductId | string | null;
  /** Device ID do security.js — header X-meli-session-id (antifraude MP). */
  deviceSessionId?: string;
}) {
  const appUrl = getAppPublicUrl();
  const product = getBillingProduct(input.product);
  const sandbox = isMercadoPagoSandbox();
  const { name, surname } = splitPayerName(input.payerName);
  const deviceSessionId = input.deviceSessionId?.trim() || '';

  const preference = await mpFetch<CheckoutPreferenceResult>('/checkout/preferences', {
    method: 'POST',
    headers: deviceSessionId ? { 'X-meli-session-id': deviceSessionId } : undefined,
    body: JSON.stringify({
      items: [
        {
          id: product.itemId,
          title: product.title,
          description: product.description,
          category_id: 'services',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: product.price
        }
      ],
      payer: {
        email: input.payerEmail,
        name: name || undefined,
        surname: surname || undefined
      },
      external_reference: input.payerEmail.toLowerCase(),
      statement_descriptor: 'RESOLVA JATO',
      additional_info: `digital_service;product=${product.id};days=${product.days}`,
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
        product: product.id,
        days: product.days,
        mode: sandbox ? 'sandbox' : 'production',
        has_device_id: Boolean(deviceSessionId)
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
    mode: sandbox ? ('sandbox' as const) : ('production' as const),
    product: product.id,
    days: product.days,
    amount: product.price
  };
}

/** @deprecated Use createBillingCheckoutPreference({ product: 'premium' }) */
export async function createPremiumCheckoutPreference(input: {
  payerEmail: string;
  payerName?: string;
}) {
  return createBillingCheckoutPreference({ ...input, product: BILLING_PRODUCTS.premium.id });
}

export { isBillingProductId };
export type { BillingProductId };

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

/** Busca pagamentos recentes pelo e-mail gravado em external_reference (ex.: Pix atrasado). */
export async function searchPaymentsByExternalReference(email: string, limit = 10) {
  const ref = encodeURIComponent(email.trim().toLowerCase());
  const data = await mpFetch<{ results?: MercadoPagoPayment[] }>(
    `/v1/payments/search?external_reference=${ref}&sort=date_created&criteria=desc&limit=${limit}`
  );
  return Array.isArray(data.results) ? data.results : [];
}
