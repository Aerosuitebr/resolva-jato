import { PLANS } from '@/lib/plans';

export type BillingProductId = 'premium' | 'acesso-especial';

export interface BillingProduct {
  id: BillingProductId;
  price: number;
  priceLabel: string;
  days: number;
  itemId: string;
  title: string;
  description: string;
}

export const BILLING_PRODUCTS: Record<BillingProductId, BillingProduct> = {
  premium: {
    id: 'premium',
    price: PLANS.premium.price,
    priceLabel: PLANS.premium.priceLabel,
    days: 30,
    itemId: 'premium-30-dias',
    title: 'Resolva Jato Premium — documentos sem marca · 30 dias',
    description: 'PDF, WhatsApp e e-mail sem marca Resolva Jato por 30 dias'
  },
  'acesso-especial': {
    id: 'acesso-especial',
    price: 135,
    priceLabel: 'R$ 135,00',
    days: 365,
    itemId: 'acesso-especial-365-dias',
    title: 'Resolva Jato — Acesso especial · 1 ano sem marca',
    description: 'PDF, WhatsApp e e-mail sem marca Resolva Jato por 365 dias'
  }
};

export function getBillingProduct(productId?: string | null): BillingProduct {
  if (productId && productId in BILLING_PRODUCTS) {
    return BILLING_PRODUCTS[productId as BillingProductId];
  }
  return BILLING_PRODUCTS.premium;
}

export function isBillingProductId(value: unknown): value is BillingProductId {
  return typeof value === 'string' && value in BILLING_PRODUCTS;
}

/** Resolve dias de Premium a partir do valor pago no Mercado Pago. */
export function premiumDaysFromAmount(amount: number | undefined): number | null {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null;
  for (const product of Object.values(BILLING_PRODUCTS)) {
    if (Math.abs(amount - product.price) < 0.05) return product.days;
  }
  return null;
}
