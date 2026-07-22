import { getPrisma } from '@/lib/db';
import { getPlan, type PlanId } from '@/lib/plans';

export const FREE_USES = 5;
export const ACCESS_DAYS = 30;
const ACCESS_PERIOD_MS = ACCESS_DAYS * 24 * 60 * 60 * 1000;
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
      data: { userId, availableUses: FREE_USES, totalConsumed: 0, periodDays: ACCESS_DAYS }
    });
  }

  if (
    usage.availableUses === 0 &&
    usage.nextReleaseAt &&
    usage.nextReleaseAt.getTime() <= Date.now()
  ) {
    usage = await prisma.toolUsage.update({
      where: { userId },
      data: {
        availableUses: FREE_USES,
        exhaustedAt: null,
        nextReleaseAt: null,
        recentActions: []
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
      exhaustedAt: usage.exhaustedAt?.toISOString() ?? null,
      nextReleaseAt: usage.nextReleaseAt?.toISOString() ?? null,
      premiumExpiresAt: subscription.expiresAt.toISOString(),
      recentActions
    };
  }

  const current = FREE_USES - usage.availableUses;
  return {
    current,
    limit: FREE_USES,
    unlimited: false,
    remaining: usage.availableUses,
    ratio: Math.min(current / FREE_USES, 1),
    exhaustedAt: usage.exhaustedAt?.toISOString() ?? null,
    nextReleaseAt: usage.nextReleaseAt?.toISOString() ?? null,
    premiumExpiresAt: null as string | null,
    recentActions
  };
}

export async function canUseToolServer(userId: string, emailVerified: boolean) {
  if (!emailVerified) {
    return {
      allowed: false,
      emailVerificationRequired: true,
      reason: 'Confirme seu e-mail para liberar as utilizações gratuitas.'
    };
  }

  const planId = await getServerPlanId(userId);
  if (planId === 'premium') return { allowed: true };

  const progress = await getServerUsageProgress(userId);
  if (progress.remaining === 0) {
    return {
      allowed: false,
      upgradeRequired: true,
      reason: progress.nextReleaseAt
        ? 'Máximo de utilizações atingido. Aguarde o próximo pacote ou assine o Premium.'
        : 'Máximo de utilizações atingido. Assine o Premium para continuar sem limites.'
    };
  }
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

  if (recentlyCharged || usage.availableUses <= 0) {
    return { charged: false, progress: await getServerUsageProgress(userId) };
  }

  const now = new Date();
  const nextAvailable = usage.availableUses - 1;
  const entry: UsageAuditEntry = {
    id: `${now.getTime()}_${Math.random().toString(36).slice(2, 8)}`,
    ...context,
    occurredAt: now.toISOString()
  };
  const nextRecent = [entry, ...recentActions].slice(0, MAX_AUDIT_ENTRIES);

  await prisma.toolUsage.update({
    where: { userId },
    data: {
      availableUses: nextAvailable,
      totalConsumed: { increment: 1 },
      recentActions: nextRecent as unknown as object[],
      exhaustedAt: nextAvailable === 0 ? now : usage.exhaustedAt,
      nextReleaseAt:
        nextAvailable === 0 ? new Date(now.getTime() + ACCESS_PERIOD_MS) : usage.nextReleaseAt
    }
  });

  return { charged: true, progress: await getServerUsageProgress(userId) };
}

export async function grantPremiumMonthServer(userId: string, providerRef?: string | null) {
  const prisma = getPrisma();
  const now = new Date();
  const current = await getActiveSubscription(userId);
  const base =
    current && current.expiresAt.getTime() > now.getTime() ? current.expiresAt : now;
  const expiresAt = new Date(base.getTime() + ACCESS_PERIOD_MS);

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

export async function cancelPremiumServer(userId: string) {
  const prisma = getPrisma();
  await prisma.subscription.deleteMany({ where: { userId } });
}

export function getPlanForId(planId: PlanId) {
  return getPlan(planId);
}
