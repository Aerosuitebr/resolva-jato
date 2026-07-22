import { getSession } from './auth';
import { getPlan, type PlanId } from './plans';
import type { BillableAction, BillableContext, BillableToolId } from './billing-server';

export type { BillableAction, BillableContext, BillableToolId };

const FREE_USES = 5;

export interface UsageAuditEntry {
  id: string;
  toolId: BillableToolId;
  artifactId: string;
  action: BillableAction;
  occurredAt: string;
}

export interface UsageState {
  availableUses: number;
  totalConsumed: number;
  exhaustedAt: string | null;
  nextReleaseAt: string | null;
  recentActions: UsageAuditEntry[];
}

export interface SubscriptionState {
  planId: 'premium';
  startedAt: string;
  expiresAt: string;
}

export interface UsageDecision {
  allowed: boolean;
  accountRequired?: boolean;
  upgradeRequired?: boolean;
  emailVerificationRequired?: boolean;
  reason?: string;
}

export interface ToolUsageProgress {
  current: number;
  limit: number | null;
  unlimited: boolean;
  remaining: number | null;
  ratio: number;
  exhaustedAt: string | null;
  nextReleaseAt: string | null;
  premiumExpiresAt: string | null;
}

/** Cache em memória sincronizado por useAuth via /api/auth/me */
let cachedProgress: ToolUsageProgress = {
  current: 0,
  limit: FREE_USES,
  unlimited: false,
  remaining: FREE_USES,
  ratio: 0,
  exhaustedAt: null,
  nextReleaseAt: null,
  premiumExpiresAt: null
};

let cachedPlanId: PlanId = 'gratis';

export function hydrateBillingFromServer(input: {
  planId?: PlanId | string | null;
  usage?: Partial<ToolUsageProgress> | null;
}) {
  if (input.planId === 'premium' || input.planId === 'gratis') {
    cachedPlanId = input.planId;
  }
  if (input.usage) {
    cachedProgress = {
      current: Number(input.usage.current) || 0,
      limit: input.usage.limit ?? FREE_USES,
      unlimited: Boolean(input.usage.unlimited),
      remaining: input.usage.remaining ?? FREE_USES,
      ratio: Number(input.usage.ratio) || 0,
      exhaustedAt: input.usage.exhaustedAt ?? null,
      nextReleaseAt: input.usage.nextReleaseAt ?? null,
      premiumExpiresAt: input.usage.premiumExpiresAt ?? null
    };
  }
}

export function getSubscriptionState(): SubscriptionState | null {
  if (!cachedProgress.premiumExpiresAt) return null;
  return {
    planId: 'premium',
    startedAt: '',
    expiresAt: cachedProgress.premiumExpiresAt
  };
}

/** @deprecated Liberação manual removida — use /api/billing/confirm após pagamento. */
export async function grantPremiumMonth(): Promise<SubscriptionState | null> {
  throw new Error(
    'Liberação manual de Premium desativada. Conclua o pagamento no Mercado Pago.'
  );
}

export function cancelPremium() {
  cachedPlanId = 'gratis';
  cachedProgress = {
    ...cachedProgress,
    unlimited: false,
    remaining: cachedProgress.remaining ?? 0,
    limit: FREE_USES,
    premiumExpiresAt: null
  };
}

export function getCurrentPlanId(): PlanId {
  return cachedPlanId;
}

export function getCurrentPlan() {
  return getPlan(getCurrentPlanId());
}

export function setCurrentPlanId(planId: PlanId) {
  if (planId === 'premium') {
    // Premium só no servidor, após confirmação de pagamento.
    return;
  }
  cancelPremium();
}

export function getUsageState(): UsageState {
  return {
    availableUses: cachedProgress.remaining ?? 0,
    totalConsumed: cachedProgress.current,
    exhaustedAt: cachedProgress.exhaustedAt,
    nextReleaseAt: cachedProgress.nextReleaseAt,
    recentActions: []
  };
}

export function getToolUsageProgress(): ToolUsageProgress {
  return { ...cachedProgress };
}

export function canUseTool(): UsageDecision {
  if (!getSession()) {
    return {
      allowed: false,
      accountRequired: true,
      reason: 'Crie uma conta gratuita para salvar ou baixar documentos.'
    };
  }
  if (getSession()?.user.emailVerified === false) {
    return {
      allowed: false,
      emailVerificationRequired: true,
      reason: 'Confirme seu e-mail para liberar as ferramentas.'
    };
  }
  if (cachedProgress.unlimited) return { allowed: true };
  if (cachedProgress.remaining === 0) {
    return {
      allowed: false,
      upgradeRequired: true,
      reason: cachedProgress.nextReleaseAt
        ? 'Máximo de utilizações atingido. Assine o Premium ou aguarde o próximo pacote.'
        : 'Máximo de utilizações atingido. Assine o Premium para continuar sem limites.'
    };
  }
  return { allowed: true };
}

const inFlightBillableKeys = new Set<string>();

function billableContextKey(context: BillableContext) {
  return `${context.toolId}|${context.artifactId}|${context.action}`;
}

/**
 * Executa a ação e só registra o consumo no servidor após sucesso.
 */
export async function performBillableAction<T>(context: BillableContext, effect: () => Promise<T> | T) {
  const access = canUseTool();
  if (!access.allowed) return { ...access, result: undefined as T | undefined, charged: false };

  const key = billableContextKey(context);
  if (inFlightBillableKeys.has(key)) {
    return { allowed: true, result: undefined as T | undefined, charged: false };
  }

  inFlightBillableKeys.add(key);
  try {
    const result = await effect();

    const consumeRes = await fetch('/api/billing/consume', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context)
    });
    const consumeData = await consumeRes.json().catch(() => ({}));

    if (!consumeRes.ok && consumeRes.status !== 402) {
      // Ação já executou; não reverte, mas sinaliza
      console.warn('[billing] consume failed', consumeData);
    }

    if (consumeData.usage) {
      hydrateBillingFromServer({ usage: consumeData.usage, planId: cachedPlanId });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('resolva-jato-auth-change'));
      }
    }

    if (consumeRes.status === 402) {
      return {
        allowed: false,
        upgradeRequired: Boolean(consumeData.upgradeRequired),
        emailVerificationRequired: Boolean(consumeData.emailVerificationRequired),
        reason: consumeData.reason || consumeData.error,
        result: undefined as T | undefined,
        charged: false
      };
    }

    const charged = Boolean(consumeData.charged);
    if (typeof window !== 'undefined') {
      const labels: Record<BillableAction, string> = {
        manual_save: 'Documento salvo com sucesso.',
        download: 'Download concluído.'
      };
      window.dispatchEvent(
        new CustomEvent('rj-billable-success', {
          detail: {
            message: labels[context.action],
            toolId: context.toolId,
            action: context.action,
            charged
          }
        })
      );
    }
    return { allowed: true, result, charged };
  } finally {
    inFlightBillableKeys.delete(key);
  }
}

export function trackToolUse() {
  return getUsageState();
}

export function formatToolUsageLabel() {
  const progress = getToolUsageProgress();
  if (progress.unlimited) return 'Ilimitado';
  if (progress.remaining === 0) return 'Máximo de utilizações atingido';
  return 'Ferramentas liberadas';
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}
