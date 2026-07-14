import { PLANS, PLAN_ORDER, FEATURE_LABELS, getPlan } from './plans.js';
import {
  getCurrentPlan,
  getCurrentPlanId,
  setCurrentPlanId,
  getUsageState,
  formatLimitLabel,
  getLimitProgress,
  hasFeature
} from './billing.js';
import {
  getSession,
  isCloudReady,
  registerAccount,
  loginAccount,
  logoutAccount,
  pullCloudData,
  pushCloudData,
  exportLocalBackup,
  importLocalBackup
} from './account.js';

let upgradeContext = { targetPlanId: 'essencial', reason: '' };
let onPlanChanged = () => {};

export function initPlansUi(options = {}) {
  onPlanChanged = options.onPlanChanged || onPlanChanged;

  document.querySelector('#plans-grid')?.addEventListener('click', handlePlansGridClick);
  document.querySelector('#upgrade-modal')?.addEventListener('click', handleUpgradeModalClick);
  document.querySelector('#upgrade-form')?.addEventListener('submit', handleUpgradeSubmit);
  document.querySelector('#professional-plan-bar')?.addEventListener('click', handlePlanBarClick);
  document.addEventListener('click', handleUpgradeFeatureClick);

  renderPlansPage();
  renderProfessionalPlanBar();
  updateUsageMeters();
}

function handlePlanBarClick(event) {
  if (event.target.closest('[data-open-upgrade]')) {
    const plan = getCurrentPlan();
    openUpgradeModal({ targetPlanId: plan.id === 'gratis' ? 'essencial' : 'completo' });
    return;
  }

  if (event.target.closest('[data-view-target="planos"]')) {
    window.dispatchEvent(new CustomEvent('resolvajato:navigate', { detail: { view: 'planos' } }));
  }
}

function handleUpgradeFeatureClick(event) {
  const button = event.target.closest('[data-upgrade-feature]');
  if (!button) return;

  const featureKey = button.dataset.upgradeFeature;
  openUpgradeModal({
    featureKey,
    reason: `Desbloqueie ${FEATURE_LABELS[featureKey] || 'este recurso'} e organize seu trabalho com mais clareza.`
  });
}

export function openUpgradeModal({ targetPlanId = 'essencial', reason = '', featureKey = '' } = {}) {
  const modal = document.querySelector('#upgrade-modal');
  if (!modal) return;

  const resolvedTarget = featureKey ? getUpgradeTarget(featureKey) : targetPlanId;
  const plan = getPlan(resolvedTarget);

  upgradeContext = {
    targetPlanId: resolvedTarget,
    reason: reason || `Desbloqueie ${plan.name} e leve seu trabalho para o próximo nível.`
  };

  const reasonEl = modal.querySelector('#upgrade-reason');
  const planNameEl = modal.querySelector('#upgrade-plan-name');
  const planPriceEl = modal.querySelector('#upgrade-plan-price');
  const benefitsEl = modal.querySelector('#upgrade-benefits');

  if (reasonEl) reasonEl.textContent = upgradeContext.reason;
  if (planNameEl) planNameEl.textContent = plan.name;
  if (planPriceEl) planPriceEl.textContent = `${plan.priceLabel}${plan.period ? ` ${plan.period}` : ''}`;

  if (benefitsEl) {
    benefitsEl.innerHTML = plan.benefits.slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  }

  modal.hidden = false;
  document.body.classList.add('modal-open');
}

export function closeUpgradeModal() {
  const modal = document.querySelector('#upgrade-modal');
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('modal-open');
}

export function renderPlansPage() {
  const grid = document.querySelector('#plans-grid');
  const compare = document.querySelector('#plans-compare-body');
  const currentId = getCurrentPlanId();

  if (grid) {
    grid.innerHTML = PLAN_ORDER.map((planId) => {
      const plan = PLANS[planId];
      const isCurrent = planId === currentId;
      const isUpgrade = PLAN_ORDER.indexOf(planId) > PLAN_ORDER.indexOf(currentId);

      return `
        <article class="plan-card ${plan.highlight ? 'plan-card--featured' : ''} ${isCurrent ? 'plan-card--current' : ''}" data-plan-id="${plan.id}">
          ${plan.highlight ? '<span class="plan-card__ribbon">Mais escolhido</span>' : ''}
          ${isCurrent ? '<span class="plan-card__badge">Seu plano</span>' : ''}
          <p class="plan-card__eyebrow">${escapeHtml(plan.tagline)}</p>
          ${plan.id === 'completo' ? '<p class="plan-card__spotlight">Propostas com logo, assinatura e envio por e-mail ou WhatsApp</p>' : ''}
          <h3>${escapeHtml(plan.name)}</h3>
          <div class="plan-card__price">
            <strong>${escapeHtml(plan.priceLabel)}</strong>
            <span>${escapeHtml(plan.period)}</span>
          </div>
          <ul class="plan-card__benefits">
            ${plan.benefits.map((benefit) => `<li>${escapeHtml(benefit)}</li>`).join('')}
          </ul>
          <button
            class="full-button ${isCurrent ? 'ghost-button' : ''}"
            type="button"
            data-plan-action="${isCurrent ? 'current' : isUpgrade ? 'upgrade' : 'downgrade'}"
            data-plan-id="${plan.id}"
            ${isCurrent ? 'disabled' : ''}
          >
            ${isCurrent ? 'Plano ativo' : isUpgrade ? `Subir para ${escapeHtml(plan.name)}` : `Usar ${escapeHtml(plan.name)}`}
          </button>
        </article>
      `;
    }).join('');
  }

  if (compare) {
    const featureKeys = Object.keys(FEATURE_LABELS);
    compare.innerHTML = featureKeys.map((key) => {
      const label = FEATURE_LABELS[key];
      const cells = PLAN_ORDER.map((planId) => {
        const enabled = PLANS[planId].features[key];
        return `<td>${enabled ? '<span class="plan-yes">Sim</span>' : '<span class="plan-no">Não</span>'}</td>`;
      }).join('');

      return `<tr><th scope="row">${escapeHtml(label)}</th>${cells}</tr>`;
    }).join('');
  }

  renderCloudPanel();
}

export function renderProfessionalPlanBar() {
  const bar = document.querySelector('#professional-plan-bar');
  if (!bar) return;

  const plan = getCurrentPlan();
  const usage = getUsageState();
  const clientCount = Number(bar.dataset.clientCount) || 0;
  const measuredClientCount = plan.id === 'gratis' ? Math.max(clientCount, usage.clientsCreatedMonth || 0) : clientCount;
  const isConnected = Boolean(getSession()?.token);

  bar.innerHTML = `
    <div class="plan-bar__identity">
      <span class="plan-pill plan-pill--${plan.id}">${escapeHtml(plan.name)}</span>
      <p>${escapeHtml(plan.tagline)}</p>
      ${plan.id === 'gratis' && !isConnected ? '<p class="plan-bar__risk">Entre com uma conta gratuita para manter seu limite de 30 dias mesmo limpando o navegador.</p>' : ''}
      ${plan.id === 'gratis' && isConnected ? '<p class="plan-bar__cloud">Conta gratuita conectada. Seu contador de uso fica salvo no servidor.</p>' : ''}
      ${plan.id !== 'gratis' && hasFeature('cloudSync') && !isCloudReady() ? '<p class="plan-bar__cloud">Ative sua conta na nuvem em Planos para proteger seus dados.</p>' : ''}
    </div>
    <div class="plan-bar__meters">
      <div class="usage-meter" title="Clientes salvos">
        <span>${plan.id === 'gratis' ? 'Clientes/30 dias' : 'Clientes'}</span>
        <strong>${formatLimitLabel('clients', measuredClientCount)}</strong>
        <div class="usage-meter__track"><i style="width:${Math.round(getLimitProgress('clients', measuredClientCount).ratio * 100)}%"></i></div>
      </div>
      <div class="usage-meter" title="Compromissos neste mês">
        <span>Agenda/30 dias</span>
        <strong>${formatLimitLabel('appointmentsMonth', usage.appointmentsCreatedMonth)}</strong>
        <div class="usage-meter__track"><i style="width:${Math.round(getLimitProgress('appointmentsMonth', usage.appointmentsCreatedMonth).ratio * 100)}%"></i></div>
      </div>
      <div class="usage-meter" title="Downloads neste mês">
        <span>Docs/30 dias</span>
        <strong>${formatLimitLabel('documentsMonth', usage.documentsMonth)}</strong>
        <div class="usage-meter__track"><i style="width:${Math.round(getLimitProgress('documentsMonth', usage.documentsMonth).ratio * 100)}%"></i></div>
      </div>
    </div>
    <div class="plan-bar__actions">
      ${plan.id === 'gratis' && !isConnected ? '<button class="promo-action" type="button" data-view-target="planos">Criar conta grátis</button>' : ''}
      ${plan.id !== 'completo' ? '<button class="promo-action" type="button" data-open-upgrade>Ver upgrade</button>' : ''}
      <button class="ghost-button" type="button" data-view-target="planos">Comparar planos</button>
    </div>
  `;
}

export function updateUsageMeters(clientCount = 0) {
  const bar = document.querySelector('#professional-plan-bar');
  if (bar) {
    bar.dataset.clientCount = String(clientCount);
    renderProfessionalPlanBar();
  }
}

export function renderCloudPanel() {
  const panel = document.querySelector('#cloud-panel');
  if (!panel) return;

  const session = getSession();
  const plan = getCurrentPlan();
  const cloudEnabled = hasFeature('cloudSync');

  panel.innerHTML = `
    <div class="cloud-panel__copy">
      <p class="eyebrow">Conta e controle de uso</p>
      <h3>${cloudEnabled ? 'Sua nuvem Resolva Jato' : session ? 'Conta gratuita conectada' : 'Crie uma conta gratuita para usar o painel'}</h3>
      <p>${cloudEnabled
    ? 'Seus clientes, agenda, propostas e contador de uso ficam salvos na nuvem. Mesmo limpando o histórico ou trocando de dispositivo, tudo volta.'
    : session
      ? 'Seu contador de uso de 30 dias fica salvo no servidor. Para salvar clientes e agenda na nuvem, suba para o Essencial.'
      : 'A conta gratuita impede que o limite mensal seja apagado ao limpar o navegador. No Essencial, seus clientes e agenda também ficam protegidos na nuvem.'}
      </p>
    </div>
    <div class="cloud-panel__body">
      ${session ? `
          <p class="cloud-session">Conectado como <strong>${escapeHtml(session.name || session.email)}</strong></p>
          <div class="cloud-actions">
            <button id="cloud-sync-now" class="full-button" type="button">${cloudEnabled ? 'Sincronizar agora' : 'Restaurar contador de uso'}</button>
            <button id="cloud-logout" class="ghost-button" type="button">Sair da conta</button>
          </div>
        ` : `
          <form id="cloud-auth-form" class="cloud-auth-form">
            <label>Nome<input name="name" type="text" placeholder="Seu nome" required /></label>
            <label>E-mail<input name="email" type="email" placeholder="voce@email.com" required /></label>
            <label>Senha<input name="password" type="password" minlength="6" placeholder="Mínimo 6 caracteres" required /></label>
            <div class="cloud-actions">
              <button class="full-button" type="submit" data-auth-mode="register">${cloudEnabled ? 'Criar conta na nuvem' : 'Criar conta gratuita'}</button>
              <button class="ghost-button" type="submit" data-auth-mode="login">Entrar</button>
            </div>
          </form>
        `}
      ${!cloudEnabled ? '<button class="full-button" type="button" data-plan-action="upgrade" data-plan-id="essencial">Proteger clientes e agenda no Essencial</button>' : ''}
      ${hasFeature('exportBackup') ? `
        <div class="backup-actions">
          <button id="export-backup" class="ghost-button" type="button">Exportar backup</button>
          <label class="ghost-button import-label">
            Importar backup
            <input id="import-backup" type="file" accept="application/json,.json" hidden />
          </label>
        </div>
      ` : ''}
      <p id="cloud-feedback" class="cloud-feedback" role="status" aria-live="polite"></p>
    </div>
  `;

  panel.querySelector('#cloud-auth-form')?.addEventListener('submit', handleCloudAuthSubmit);
  panel.querySelector('#cloud-logout')?.addEventListener('click', handleCloudLogout);
  panel.querySelector('#cloud-sync-now')?.addEventListener('click', handleCloudSync);
  panel.querySelector('#export-backup')?.addEventListener('click', handleExportBackup);
  panel.querySelector('#import-backup')?.addEventListener('change', handleImportBackup);
  panel.querySelector('[data-plan-action="upgrade"]')?.addEventListener('click', () => {
    openUpgradeModal({ targetPlanId: 'essencial', reason: 'No Essencial seus clientes e agenda ficam na nuvem. Você não perde seu histórico.' });
  });
}

function getUpgradeTarget(featureKey) {
  if (featureKey === 'cloudSync') return 'essencial';
  if (featureKey === 'clientTimeline' || featureKey === 'priorityCatalog' || featureKey === 'businessDashboard' || featureKey === 'premiumProposals') {
    return 'completo';
  }
  return 'essencial';
}

function handlePlansGridClick(event) {
  const button = event.target.closest('[data-plan-action]');
  if (!button || button.disabled) return;

  const planId = button.dataset.planId;
  const action = button.dataset.planAction;

  if (action === 'upgrade') {
    openUpgradeModal({ targetPlanId: planId });
    return;
  }

  if (action === 'downgrade') {
    setCurrentPlanId(planId);
    notifyPlanChange();
    showToast(`Plano alterado para ${getPlan(planId).name}.`);
    return;
  }

  openUpgradeModal({ targetPlanId: planId });
}

function handleUpgradeModalClick(event) {
  if (event.target.closest('[data-close-upgrade]')) {
    closeUpgradeModal();
  }
}

function handleUpgradeSubmit(event) {
  event.preventDefault();
  setCurrentPlanId(upgradeContext.targetPlanId);
  closeUpgradeModal();
  notifyPlanChange();
  showToast(`Plano ${getPlan(upgradeContext.targetPlanId).name} ativado. Aproveite os novos recursos!`);
}

async function handleCloudAuthSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitter = event.submitter;
  const mode = submitter?.dataset.authMode || 'register';
  const data = Object.fromEntries(new FormData(form).entries());
  const feedback = document.querySelector('#cloud-feedback');

  try {
    let payload;
    if (mode === 'login') {
      payload = await loginAccount({ email: data.email, password: data.password });
    } else {
      payload = await registerAccount({ name: data.name, email: data.email, password: data.password, planId: getCurrentPlanId() });
    }

    if (payload?.planId) {
      setCurrentPlanId(payload.planId);
    }

    if (feedback) feedback.textContent = 'Conta conectada. Sincronizando seus dados...';
    await handleCloudSync();
    renderCloudPanel();
  } catch (error) {
    if (feedback) feedback.textContent = error.message;
  }
}

function handleCloudLogout() {
  logoutAccount();
  renderCloudPanel();
  showToast('Sessão encerrada.');
}

async function handleCloudSync() {
  const feedback = document.querySelector('#cloud-feedback');
  if (!isCloudReady()) return;

  try {
    const payload = await pullCloudData();
    window.dispatchEvent(new CustomEvent('resolvajato:cloud-pull', { detail: payload }));
    if (feedback) feedback.textContent = 'Dados restaurados da nuvem.';
  } catch (error) {
    if (feedback) feedback.textContent = error.message;
  }
}

function handleExportBackup() {
  window.dispatchEvent(new CustomEvent('resolvajato:export-backup'));
  showToast('Backup exportado.');
}

async function handleImportBackup(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const data = await importLocalBackup(file);
    window.dispatchEvent(new CustomEvent('resolvajato:import-backup', { detail: data }));
    showToast('Backup importado com sucesso.');
  } catch (error) {
    showToast(error.message);
  }

  event.target.value = '';
}

function notifyPlanChange() {
  renderPlansPage();
  onPlanChanged();
}

function showToast(message) {
  let toast = document.querySelector('#app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'app-toast';
    document.body.append(toast);
  }

  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function pushProfessionalToCloud(professionalState, planId) {
  if (!hasFeature('cloudSync') || !isCloudReady()) return;
  const usage = getUsageState();
  await pushCloudData({ data: { professional: professionalState, planId, usage }, usage, planId });
}

export { showToast };
