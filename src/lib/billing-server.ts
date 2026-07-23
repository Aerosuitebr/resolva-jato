import { getPrisma } from '@/lib/db';
import { premiumDaysFromAmount } from '@/lib/billing-products';
import { getPlan, type PlanId } from '@/lib/plans';

/** Dias de vigência do Premium mensal após pagamento. */
export const ACCESS_DAYS = 30;
const MAX_AUDIT_ENTRIES = 100;
const CHARGE_DEDUPE_MS = 2500;

export type BillableToolId =
  | 'curriculo'
  | 'recibos'
  | 'propostas'
  | 'agenda'
  | 'trabalhos'
  | 'contratos'
  | 'juridicos'
  | 'contabeis'
  | 'orcamentos'
  | 'pix';

export type BillableAction = 'manual_save' | 'download';

export interface BillableContext {
  toolId: BillableToolId;
  artifactId: string;
  action: BillableAction;
}

export interface UsageAuditEntry {
  id: string;
  toolId: BillableToolId;
  artifactId: string;
  action: BillableAction;
  occurredAt: string;
}

function billableContextKey(context: BillableContext) {
  return `${context.toolId}|${context.artifactId}|${context.action}`;
}

async function getActiveSubscription(userId: string) {
  const prisma = getPrisma();
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return null;
  if (sub.expiresAt.getTime() <= Date.now()) {
    await prisma.subscription.delete({ where: { userId } }).catch(() => undefined);
    return null;
  }
  return sub;
}

async function ensureUsage(userId: string) {
  const prisma = getPrisma();
  let usage = await prisma.toolUsage.findUnique({ where: { userId } });
  if (!usage) {
    usage = await prisma.toolUsage.create({
      data: { userId, availableUses: 0, totalConsumed: 0, periodDays: ACCESS_DAYS }
    });
  }

  // Plano grátis não tem cota: limpa bloqueios antigos (pacote de 5 usos).
  if (usage.exhaustedAt || usage.nextReleaseAt || usage.availableUses !== 0) {
    usage = await prisma.toolUsage.update({
      where: { userId },
      data: {
        availableUses: 0,
        exhaustedAt: null,
        nextReleaseAt: null
      }
    });
  }

  return usage;
}

export async function getServerPlanId(userId: string): Promise<PlanId> {
  return (await getActiveSubscription(userId)) ? 'premium' : 'gratis';
}

export async function getServerUsageProgress(userId: string) {
  const subscription = await getActiveSubscription(userId);
  const usage = await ensureUsage(userId);
  const recentActions = (
    Array.isArray(usage.recentActions) ? (usage.recentActions as unknown as UsageAuditEntry[]) : []
  );

  if (subscription) {
    return {
      current: usage.totalConsumed,
      limit: null as number | null,
      unlimited: true,
      remaining: null as number | null,
      ratio: 0,
      exhaustedAt: null as string | null,
      nextReleaseAt: null as string | null,
      premiumExpiresAt: subscription.expiresAt.toISOString(),
      recentActions
    };
  }

  // Grátis: uso ilimitado das ferramentas; Premium só remove a marca.
  return {
    current: usage.totalConsumed,
    limit: null as number | null,
    unlimited: false,
    remaining: null as number | null,
    ratio: 0,
    exhaustedAt: null as string | null,
    nextReleaseAt: null as string | null,
    premiumExpiresAt: null as string | null,
    recentActions
  };
}

export async function canUseToolServer(userId: string, emailVerified: boolean) {
  if (!emailVerified) {
    return {
      allowed: false,
      emailVerificationRequired: true,
      reason: 'Confirme seu e-mail para liberar as ferramentas.'
    };
  }

  // Sem cota de utilizações no plano gratuito.
  void userId;
  return { allowed: true };
}

export async function consumeServerUse(userId: string, context: BillableContext) {
  const prisma = getPrisma();
  const subscription = await getActiveSubscription(userId);
  if (subscription) {
    return { charged: false, progress: await getServerUsageProgress(userId) };
  }

  const usage = await ensureUsage(userId);
  const recentActions = (
    Array.isArray(usage.recentActions) ? (usage.recentActions as unknown as UsageAuditEntry[]) : []
  );
  const key = billableContextKey(context);
  const cutoff = Date.now() - CHARGE_DEDUPE_MS;
  const recentlyCharged = recentActions.some((entry) => {
    if (billableContextKey(entry) !== key) return false;
    const at = Date.parse(entry.occurredAt);
    return Number.isFinite(at) && at >= cutoff;
  });

  if (recentlyCharged) {
    return { charged: false, progress: await getServerUsageProgress(userId) };
  }

  const now = new Date();
  const entry: UsageAuditEntry = {
    id: `${now.getTime()}_${Math.random().toString(36).slice(2, 8)}`,
    ...context,
    occurredAt: now.toISOString()
  };
  const nextRecent = [entry, ...recentActions].slice(0, MAX_AUDIT_ENTRIES);

  await prisma.toolUsage.update({
    where: { userId },
    data: {
      totalConsumed: { increment: 1 },
      recentActions: nextRecent as unknown as object[],
      exhaustedAt: null,
      nextReleaseAt: null
    }
  });

  return { charged: true, progress: await getServerUsageProgress(userId) };
}

export async function grantPremiumDaysServer(
  userId: string,
  days: number,
  providerRef?: string | null
) {
  const prisma = getPrisma();
  const now = new Date();
  const periodMs = Math.max(1, Math.round(days)) * 24 * 60 * 60 * 1000;
  const current = await getActiveSubscription(userId);
  const base =
    current && current.expiresAt.getTime() > now.getTime() ? current.expiresAt : now;
  const expiresAt = new Date(base.getTime() + periodMs);

  return prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId: 'premium',
      startedAt: now,
      expiresAt,
      providerRef: providerRef || null
    },
    update: {
      expiresAt,
      providerRef: providerRef || undefined
    }
  });
}

export async function grantPremiumMonthServer(userId: string, providerRef?: string | null) {
  return grantPremiumDaysServer(userId, ACCESS_DAYS, providerRef);
}

function premiumAmountMatches(amount: number | undefined) {
  if (typeof amount !== 'number') return true;
  return premiumDaysFromAmount(amount) !== null;
}

export type PremiumActivationResult =
  | {
      activated: true;
      alreadyActive?: boolean;
      userId: string;
      email: string;
      paymentId: number;
      expiresAt: string;
      status: string;
    }
  | {
      activated: false;
      reason: string;
      status?: string;
      email?: string;
      paymentId?: number;
    };

/**
 * Libera Premium a partir de um pagamento aprovado do Mercado Pago.
 * Idempotente: o mesmo payment id não renova de novo.
 */
export async function activatePremiumFromMercadoPagoPayment(input: {
  id: number;
  status: string;
  external_reference?: string | null;
  transaction_amount?: number;
}): Promise<PremiumActivationResult> {
  const paymentId = input.id;
  const status = input.status;
  const email = (input.external_reference || '').trim().toLowerCase();

  if (status !== 'approved') {
    return { activated: false, reason: 'not_approved', status, email, paymentId };
  }
  if (!premiumAmountMatches(input.transaction_amount)) {
    return { activated: false, reason: 'amount_mismatch', status, email, paymentId };
  }
  if (!email) {
    return { activated: false, reason: 'missing_email', status, paymentId };
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true }
  });
  if (!user) {
    return { activated: false, reason: 'user_not_found', status, email, paymentId };
  }

  const providerRef = `mp:${paymentId}`;
  const existing = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (existing?.providerRef === providerRef) {
    return {
      activated: true,
      alreadyActive: true,
      userId: user.id,
      email: user.email,
      paymentId,
      expiresAt: existing.expiresAt.toISOString(),
      status
    };
  }

  const days = premiumDaysFromAmount(input.transaction_amount) ?? ACCESS_DAYS;
  const sub = await grantPremiumDaysServer(user.id, days, providerRef);
  return {
    activated: true,
    userId: user.id,
    email: user.email,
    paymentId,
    expiresAt: sub.expiresAt.toISOString(),
    status
  };
}

/**
 * Libera Premium a partir de pagamento NuPay (AUTHORIZED / COMPLETED).
 * Idempotente pelo pspReferenceId.
 */
export async function activatePremiumFromNuPayPayment(input: {
  userId: string;
  pspReferenceId: string;
  status: string;
  amount?: number;
}): Promise<PremiumActivationResult> {
  const { userId, pspReferenceId, status } = input;
  if (status !== 'COMPLETED' && status !== 'AUTHORIZED') {
    return { activated: false, reason: 'not_approved', status };
  }
  if (!premiumAmountMatches(input.amount)) {
    return { activated: false, reason: 'amount_mismatch', status };
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true }
  });
  if (!user) {
    return { activated: false, reason: 'user_not_found', status };
  }

  const providerRef = `nupay:${pspReferenceId}`;
  const existing = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (existing?.providerRef === providerRef) {
    return {
      activated: true,
      alreadyActive: true,
      userId: user.id,
      email: user.email,
      paymentId: 0,
      expiresAt: existing.expiresAt.toISOString(),
      status
    };
  }

  const sub = await grantPremiumMonthServer(user.id, providerRef);
  return {
    activated: true,
    userId: user.id,
    email: user.email,
    paymentId: 0,
    expiresAt: sub.expiresAt.toISOString(),
    status
  };
}

export async function cancelPremiumServer(userId: string) {
  const prisma = getPrisma();
  await prisma.subscription.deleteMany({ where: { userId } });
}

/**
 * Plano grátis = mensagens WhatsApp/e-mail com referência Resolva Jato.
 * Premium (subscription ativa) = sem marca.
 */
export async function shouldBrandOutboundMessagesByEmail(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return true;
  try {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true }
    });
    if (!user) return true;
    return (await getServerPlanId(user.id)) !== 'premium';
  } catch {
    return true;
  }
}

export function getPlanForId(planId: PlanId) {
  return getPlan(planId);
}
