import { getPlan } from './plans.js';
import { getSession, pushUsageState } from './account.js';

const planStorageKey = 'resolva-jato-plan';
const usageStorageKey = 'resolva-jato-usage';
const usagePeriodDays = 30;
const usagePeriodMs = usagePeriodDays * 24 * 60 * 60 * 1000;

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function loadUsageState() {
  try {
    return JSON.parse(localStorage.getItem(usageStorageKey)) || {};
  } catch {
    return {};
  }
}

function saveUsageState(state) {
  localStorage.setItem(usageStorageKey, JSON.stringify(state));
}

function freshUsageState(startDate = new Date()) {
  return {
    periodStartedAt: startDate.toISOString(),
    monthKey: currentMonthKey(),
    clientsCreatedMonth: 0,
    documentsMonth: 0,
    appointmentsCreatedMonth: 0
  };
}

function isPeriodExpired(periodStartedAt) {
  const startedAt = Date.parse(periodStartedAt);
  if (!Number.isFinite(startedAt)) return true;
  return Date.now() - startedAt >= usagePeriodMs;
}

function normalizeUsageState(state) {
  const monthKey = currentMonthKey();

  if (!state || typeof state !== 'object') {
    return freshUsageState();
  }

  if (state.periodStartedAt && isPeriodExpired(state.periodStartedAt)) {
    return freshUsageState();
  }

  if (!state.periodStartedAt && state.monthKey && state.monthKey !== monthKey) {
    return freshUsageState();
  }

  return {
    periodStartedAt: state.periodStartedAt || new Date().toISOString(),
    monthKey: state.monthKey || monthKey,
    clientsCreatedMonth: Number(state.clientsCreatedMonth) || 0,
    documentsMonth: Number(state.documentsMonth) || 0,
    appointmentsCreatedMonth: Number(state.appointmentsCreatedMonth) || 0
  };
}

function syncUsageToAccount(state) {
  if (!getSession()?.token) return;
  pushUsageState(state).catch(() => {});
}

function freeAccountRequired() {
  return getCurrentPlanId() === 'gratis' && !getSession()?.token;
}

function accountRequiredResponse() {
  return {
    allowed: false,
    accountRequired: true,
    reason: 'Crie ou entre em uma conta gratuita para usar as ferramentas profissionais. Assim o limite de 30 dias continua valendo mesmo se o histórico do navegador for limpo.'
  };
}

export function getCurrentPlanId() {
  return localStorage.getItem(planStorageKey) || 'gratis';
}

export function getCurrentPlan() {
  return getPlan(getCurrentPlanId());
}

export function setCurrentPlanId(planId) {
  localStorage.setItem(planStorageKey, planId);
}

export function hasFeature(featureKey) {
  return Boolean(getCurrentPlan().features[featureKey]);
}

export function getUsageState() {
  const state = normalizeUsageState(loadUsageState());
  saveUsageState(state);
  return state;
}

export function applyRemoteUsageState(remoteState = {}) {
  if (remoteState?.periodStartedAt && isPeriodExpired(remoteState.periodStartedAt)) {
    const fresh = freshUsageState();
    saveUsageState(fresh);
    syncUsageToAccount(fresh);
    return fresh;
  }

  const localState = getUsageState();
  const remote = normalizeUsageState(remoteState);
  const localStart = Date.parse(localState.periodStartedAt);
  const remoteStart = Date.parse(remote.periodStartedAt);
  let merged = remote;

  if (Number.isFinite(localStart) && Number.isFinite(remoteStart) && localStart === remoteStart) {
    merged = {
      ...remote,
      clientsCreatedMonth: Math.max(remote.clientsCreatedMonth, localState.clientsCreatedMonth),
      documentsMonth: Math.max(remote.documentsMonth, localState.documentsMonth),
      appointmentsCreatedMonth: Math.max(remote.appointmentsCreatedMonth, localState.appointmentsCreatedMonth)
    };
  } else if (Number.isFinite(remoteStart) && !isPeriodExpired(remote.periodStartedAt)) {
    merged = remote;
  } else {
    merged = localState;
  }

  saveUsageState(merged);
  syncUsageToAccount(merged);
  return merged;
}

export function trackUsage(action) {
  const state = getUsageState();

  if (action === 'client') {
    state.clientsCreatedMonth += 1;
  }

  if (action === 'document') {
    state.documentsMonth += 1;
  }

  if (action === 'appointment') {
    state.appointmentsCreatedMonth += 1;
  }

  saveUsageState(state);
  syncUsageToAccount(state);
  return state;
}

export function getLimitProgress(limitKey, currentValue) {
  const plan = getCurrentPlan();
  const limit = plan.limits[limitKey];

  if (!Number.isFinite(limit)) {
    return { current: currentValue, limit: null, ratio: 0, unlimited: true };
  }

  const ratio = limit === 0 ? 1 : Math.min(currentValue / limit, 1);
  return { current: currentValue, limit, ratio, unlimited: false };
}

export function canCreateClient(currentCount) {
  if (freeAccountRequired()) return accountRequiredResponse();

  const state = getUsageState();
  const measuredCount = getCurrentPlanId() === 'gratis'
    ? Math.max(currentCount, state.clientsCreatedMonth)
    : currentCount;
  const { limit, unlimited } = getLimitProgress('clients', measuredCount);

  if (unlimited) return { allowed: true };
  if (measuredCount >= limit) {
    return {
      allowed: false,
      reason: `Seu plano ${getCurrentPlan().name} permite até ${limit} clientes a cada ${usagePeriodDays} dias. Faça upgrade para guardar mais contatos.`
    };
  }
  return { allowed: true };
}

export function canCreateAppointment() {
  if (freeAccountRequired()) return accountRequiredResponse();

  const state = getUsageState();
  const { limit, unlimited } = getLimitProgress('appointmentsMonth', state.appointmentsCreatedMonth);

  if (unlimited) return { allowed: true };
  if (state.appointmentsCreatedMonth >= limit) {
    return {
      allowed: false,
      reason: `Você atingiu ${limit} compromissos neste ciclo de ${usagePeriodDays} dias. Upgrade libera mais espaço na agenda.`
    };
  }
  return { allowed: true };
}

export function canDownloadDocument() {
  if (freeAccountRequired()) return accountRequiredResponse();

  const state = getUsageState();
  const { limit, unlimited } = getLimitProgress('documentsMonth', state.documentsMonth);

  if (unlimited) return { allowed: true };
  if (state.documentsMonth >= limit) {
    return {
      allowed: false,
      reason: `Limite de ${limit} downloads no ciclo de ${usagePeriodDays} dias atingido. Upgrade para documentos ilimitados e layouts premium.`
    };
  }
  return { allowed: true };
}

export function getUpgradeTargetForFeature(featureKey) {
  if (featureKey === 'cloudSync') return 'essencial';
  if (featureKey === 'clientTimeline' || featureKey === 'priorityCatalog' || featureKey === 'businessDashboard' || featureKey === 'premiumProposals') {
    return 'completo';
  }
  return 'essencial';
}

export function formatLimitLabel(limitKey, currentValue) {
  const state = getUsageState();
  const measuredValue = limitKey === 'clients' && getCurrentPlanId() === 'gratis'
    ? Math.max(currentValue, state.clientsCreatedMonth)
    : currentValue;
  const { limit, unlimited } = getLimitProgress(limitKey, measuredValue);

  if (unlimited) return 'Ilimitado';
  return `${measuredValue}/${limit}`;
}
