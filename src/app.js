import { resources } from './resources.js';
import {
  applyRemoteUsageState,
  canCreateAppointment,
  canCreateClient,
  canDownloadDocument,
  getCurrentPlan,
  getCurrentPlanId,
  getUsageState,
  hasFeature,
  setCurrentPlanId,
  trackUsage
} from './billing.js';
import {
  initPlansUi,
  openUpgradeModal,
  pushProfessionalToCloud,
  renderProfessionalPlanBar,
  showToast,
  updateUsageMeters
} from './plans-ui.js';
import { exportLocalBackup, getSession, isCloudReady, loginAccount, pullCloudData, registerAccount } from './account.js';

const grid = document.querySelector('#resource-grid');
const emptyState = document.querySelector('#empty-state');
const searchInput = document.querySelector('#search');
const resultCount = document.querySelector('#result-count');
const filterButtons = [...document.querySelectorAll('.filter-button')];
const resourceViewButtons = [...document.querySelectorAll('[data-resource-view]')];
const themeToggles = [...document.querySelectorAll('.theme-toggle')];
const newsletterForm = document.querySelector('.newsletter-form');
const proposalForm = document.querySelector('#proposal-form');
const clearProposalButton = document.querySelector('#clear-proposal');
const downloadProposalButton = document.querySelector('#download-proposal');
const proposalPreviewText = document.querySelector('#proposal-preview-text');
const proposalPreviewCard = document.querySelector('#proposal-preview-card');
const proposalValueInput = document.querySelector('#proposal-value');
const clientForm = document.querySelector('#client-form');
const clientList = document.querySelector('#client-list');
const clientCount = document.querySelector('#client-count');
const clientWhatsappInput = document.querySelector('#client-whatsapp');
const saveClientButton = document.querySelector('#save-client');
const appointmentForm = document.querySelector('#appointment-form');
const appointmentList = document.querySelector('#appointment-list');
const appointmentClientSelect = document.querySelector('#appointment-client');
const appointmentNewClientField = document.querySelector('#appointment-new-client-field');
const saveAppointmentButton = document.querySelector('#save-appointment');
const receiptForm = document.querySelector('#receipt-form');
const receiptValueInput = document.querySelector('#receipt-value');
const receiptContactType = document.querySelector('#receipt-contact-type');
const receiptContactInput = document.querySelector('#receipt-contact');
const receiptContactFeedback = document.querySelector('#receipt-contact-feedback');
const receiptPreviewText = document.querySelector('#receipt-preview-text');
const receiptPreviewCard = document.querySelector('#receipt-preview-card');
const downloadReceiptButton = document.querySelector('#download-receipt');
const workOrderForm = document.querySelector('#work-order-form');
const workOrderPreviewText = document.querySelector('#work-order-preview-text');
const workOrderPreviewCard = document.querySelector('#work-order-preview-card');
const downloadWorkOrderButton = document.querySelector('#download-work-order');
const checklistForm = document.querySelector('#checklist-form');
const checklistPreviewText = document.querySelector('#checklist-preview-text');
const checklistPreviewCard = document.querySelector('#checklist-preview-card');
const downloadChecklistButton = document.querySelector('#download-checklist');
const pricingForm = document.querySelector('#pricing-form');
const pricingIncomeInput = document.querySelector('#pricing-income');
const pricingCostsInput = document.querySelector('#pricing-costs');
const pricingPreviewText = document.querySelector('#pricing-preview-text');
const pricingPreviewCard = document.querySelector('#pricing-preview-card');
const copyPricingSummaryButton = document.querySelector('#copy-pricing-summary');
const pixForm = document.querySelector('#pix-form');
const pixKeyType = document.querySelector('#pix-key-type');
const pixKeyInput = document.querySelector('#pix-key');
const pixKeyFeedback = document.querySelector('#pix-key-feedback');
const pixValueInput = document.querySelector('#pix-value');
const pixWhatsappInput = document.querySelector('#pix-whatsapp');
const pixPreviewText = document.querySelector('#pix-preview-text');
const pixPreviewCard = document.querySelector('#pix-preview-card');
const copyPixCodeButton = document.querySelector('#copy-pix-code');
const sendPixWhatsappButton = document.querySelector('#send-pix-whatsapp');
const warrantyForm = document.querySelector('#warranty-form');
const warrantyPreviewText = document.querySelector('#warranty-preview-text');
const warrantyPreviewCard = document.querySelector('#warranty-preview-card');
const downloadWarrantyButton = document.querySelector('#download-warranty');
const budgetForm = document.querySelector('#budget-form');
const budgetValueInput = document.querySelector('#budget-value');
const budgetPreviewText = document.querySelector('#budget-preview-text');
const budgetPreviewCard = document.querySelector('#budget-preview-card');
const downloadBudgetButton = document.querySelector('#download-budget');
const contractForm = document.querySelector('#contract-form');
const contractValueInput = document.querySelector('#contract-value');
const contractPreviewText = document.querySelector('#contract-preview-text');
const contractPreviewCard = document.querySelector('#contract-preview-card');
const downloadContractButton = document.querySelector('#download-contract');
const viewScreens = [...document.querySelectorAll('[data-view]')];
const viewButtons = [...document.querySelectorAll('[data-view-target]')];
const tabButtons = [...document.querySelectorAll('[data-tab-target]')];
const tabPanels = [...document.querySelectorAll('[data-tab-panel]')];
const tabList = document.querySelector('.tab-list');
const tabScrollButtons = [...document.querySelectorAll('[data-tab-scroll]')];
const clientProFields = document.querySelector('#client-pro-fields');
const clientProLock = document.querySelector('#client-pro-lock');
const appointmentCalendar = document.querySelector('#appointment-calendar');
const appointmentCalendarWrap = document.querySelector('#appointment-calendar-wrap');
const proposalPremiumFields = document.querySelector('#proposal-premium-fields');
const proposalPremiumLock = document.querySelector('#proposal-premium-lock');
const proposalLogoInput = document.querySelector('#proposal-logo');
const proposalSignatureInput = document.querySelector('#proposal-signature');
const proposalLogoPreview = document.querySelector('#proposal-logo-preview');
const proposalSignaturePreview = document.querySelector('#proposal-signature-preview');
const proposalClientWhatsappInput = document.querySelector('#proposal-client-whatsapp');
const proposalSendActions = document.querySelector('#proposal-send-actions');
const sendProposalEmailButton = document.querySelector('#send-proposal-email');
const sendProposalWhatsappButton = document.querySelector('#send-proposal-whatsapp');
const accessForm = document.querySelector('#access-form');
const accessNameField = document.querySelector('#access-name-field');
const accessToggleModeButton = document.querySelector('#access-toggle-mode');
const accessSubmitButton = document.querySelector('#access-submit');
const accessFeedback = document.querySelector('#access-feedback');

let activeCategory = 'todos';
let query = '';
let proposalReady = false;
let currentView = 'home';
let currentTab = 'proposta';
let calendarCursor = new Date();
let selectedCalendarDay = null;

const storageKey = 'resolva-jato-profissional';
const themeStorageKey = 'resolva-jato-theme';
const resourceViewStorageKey = 'resolva-jato-resource-view';
const maxReminderDelay = 2147483647;
const viewHashes = {
  home: '#top',
  login: '#login',
  planos: '#planos',
  profissional: '#profissional'
};
const viewHeadings = {
  home: '#hero-title',
  login: '#access-title',
  planos: '#plans-title',
  profissional: '#professional-title'
};

const professionalState = loadProfessionalState();
const appointmentReminderTimers = new Map();
let resourceView = localStorage.getItem(resourceViewStorageKey) || 'grid';

function getViewFromHash() {
  const hash = window.location.hash.replace('#', '');
  return ['profissional', 'planos', 'login'].includes(hash) ? hash : 'home';
}

currentView = getViewFromHash();

const reminderLabels = {
  none: 'Sem alerta',
  0: 'Alerta na hora',
  10: 'Alerta 10 min antes',
  30: 'Alerta 30 min antes',
  60: 'Alerta 1 hora antes'
};

const normalize = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const searchPlaceholders = {
  todos: 'Buscar por MEI, ABNT, currículo, PDF...',
  estudos: 'Buscar por ABNT, certificado, artigos, cronograma...',
  negocios: 'Buscar por MEI, nota fiscal, contrato, WhatsApp...',
  'utilidade-publica': 'Buscar por assinatura, CPF, Pix, certidão...',
  saude: 'Buscar por SUS, clínica da família, hospital, vacina, remédio...',
  ferramentas: 'Buscar por PDF, imagem, senha, arquivo, e-mail...',
  'inteligencia-artificial': 'Buscar por ChatGPT, Gemini, imagem, vídeo, código, música...'
};

function loadProfessionalState() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    return {
      proposal: stored?.proposal || {},
      clients: Array.isArray(stored?.clients) ? stored.clients : [],
      appointments: Array.isArray(stored?.appointments) ? stored.appointments : []
    };
  } catch {
    return {
      proposal: {},
      clients: [],
      appointments: []
    };
  }
}

function saveProfessionalState(options = {}) {
  localStorage.setItem(storageKey, JSON.stringify(professionalState));
  refreshBillingState();
  if (!options.skipCloudPush) {
    pushProfessionalToCloud(professionalState, getCurrentPlanId()).catch(() => {});
  }
}

function refreshBillingState() {
  updateUsageMeters(professionalState.clients.length);
  renderClientProFields();
  renderProposalPremiumFields();
  renderAppointmentCalendar();
  renderBusinessDashboard();
}

function handleUsageBlock(check) {
  if (check.accountRequired) {
    setView('login');
    showToast(check.reason);
    return true;
  }

  openUpgradeModal({ reason: check.reason, targetPlanId: 'essencial' });
  return true;
}

function gateDocumentDownload(action) {
  const check = canDownloadDocument();
  if (!check.allowed) {
    handleUsageBlock(check);
    return;
  }

  trackUsage('document');
  action();
  refreshBillingState();
}

function isPremiumDocuments() {
  return hasFeature('premiumLayouts');
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  themeToggles.forEach((button) => {
    button.setAttribute('aria-pressed', String(isDark));
    button.title = isDark ? 'Usar contraste claro' : 'Usar contraste escuro';
  });
}

function toggleTheme() {
  const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  localStorage.setItem(themeStorageKey, nextTheme);
  applyTheme(nextTheme);
}

function getReminderLabel(value) {
  return reminderLabels[String(value)] || reminderLabels.none;
}

async function ensureNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

function showAppAlert(title, message) {
  const alert = document.createElement('div');
  alert.className = 'app-alert';
  alert.setAttribute('role', 'status');
  alert.innerHTML = `
    <strong>${escapeHtml(title)}</strong>
    <span>${escapeHtml(message)}</span>
  `;
  document.body.append(alert);

  setTimeout(() => {
    alert.classList.add('visible');
  }, 20);

  setTimeout(() => {
    alert.classList.remove('visible');
    setTimeout(() => alert.remove(), 220);
  }, 7000);
}

function notifyAppointment(appointment) {
  const title = `Compromisso: ${appointment.title}`;
  const clientText = appointment.client ? ` com ${appointment.client}` : '';
  const message = `${formatDateTime(appointment.date)}${clientText}`;

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Resolva Jato', {
      body: `${title}\n${message}`
    });
  }

  showAppAlert(title, message);
}

function clearAppointmentReminder(id) {
  const timer = appointmentReminderTimers.get(id);
  if (!timer) return;

  clearTimeout(timer);
  appointmentReminderTimers.delete(id);
}

function scheduleAppointmentReminder(appointment) {
  clearAppointmentReminder(appointment.id);

  if (appointment.reminderMinutes === 'none' || appointment.reminderMinutes === undefined) return;

  const reminderMinutes = Number(appointment.reminderMinutes);
  if (!Number.isFinite(reminderMinutes)) return;

  const appointmentTime = new Date(appointment.date).getTime();
  if (!Number.isFinite(appointmentTime) || appointmentTime < Date.now()) return;

  const reminderTime = appointmentTime - reminderMinutes * 60000;
  const delay = Math.max(0, reminderTime - Date.now());

  const timer = setTimeout(() => {
    if (delay > maxReminderDelay) {
      scheduleAppointmentReminder(appointment);
      return;
    }

    appointmentReminderTimers.delete(appointment.id);
    notifyAppointment(appointment);
  }, Math.min(delay, maxReminderDelay));

  appointmentReminderTimers.set(appointment.id, timer);
}

function scheduleAllAppointmentReminders() {
  [...appointmentReminderTimers.keys()].forEach(clearAppointmentReminder);
  professionalState.appointments.forEach(scheduleAppointmentReminder);
}

function setActionState(button, isReady, readyText, waitingText) {
  button.disabled = !isReady;
  button.textContent = isReady ? readyText : waitingText;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDateTime(value) {
  if (!value) return 'Sem data definida';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
}

function sanitizePhone(value = '') {
  return value.replace(/\D/g, '');
}

function formatCurrencyBR(value = '') {
  const amount = sanitizePhone(value).slice(0, 12);
  if (!amount) return '';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(amount) / 100);
}

function parseCurrencyBR(value = '') {
  const digits = sanitizePhone(value);
  return digits ? Number(digits) / 100 : 0;
}

function formatMoneyValue(value = 0) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number.isFinite(value) ? value : 0);
}

function formatPhoneBR(value = '') {
  const digits = sanitizePhone(value).slice(0, 11);

  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCpf(value = '') {
  const digits = sanitizePhone(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatCnpj(value = '') {
  const digits = sanitizePhone(value).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function validateCpf(value = '') {
  const cpf = sanitizePhone(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const calculateDigit = (base) => {
    const sum = base.split('').reduce((total, digit, index) => total + Number(digit) * (base.length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(cpf.slice(0, 9)) === Number(cpf[9])
    && calculateDigit(cpf.slice(0, 10)) === Number(cpf[10]);
}

function validateCnpj(value = '') {
  const cnpj = sanitizePhone(value);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calculateDigit = (base, weights) => {
    const sum = base.split('').reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
}

function validatePhoneBR(value = '') {
  const phone = sanitizePhone(value);
  const withoutCountry = phone.startsWith('55') && phone.length > 11 ? phone.slice(2) : phone;
  return /^\d{10,11}$/.test(withoutCountry) && Number(withoutCountry.slice(0, 2)) >= 11;
}

function validateEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function sanitizePixText(value = '', maxLength = 25) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 $%*+\-./:]/g, '')
    .trim()
    .slice(0, maxLength)
    .toUpperCase();
}

function getReceiptContactRules(type = receiptContactType.value) {
  const rules = {
    cpf: {
      placeholder: '000.000.000-00',
      inputMode: 'numeric',
      label: 'CPF',
      help: 'Informe um CPF válido.',
      mask: formatCpf,
      validate: validateCpf
    },
    cnpj: {
      placeholder: '00.000.000/0000-00',
      inputMode: 'numeric',
      label: 'CNPJ',
      help: 'Informe um CNPJ válido.',
      mask: formatCnpj,
      validate: validateCnpj
    },
    phone: {
      placeholder: '(00) 00000-0000',
      inputMode: 'tel',
      label: 'telefone',
      help: 'Informe um telefone brasileiro válido com DDD.',
      mask: formatPhoneBR,
      validate: validatePhoneBR
    },
    email: {
      placeholder: 'nome@email.com',
      inputMode: 'email',
      label: 'e-mail',
      help: 'Informe um e-mail válido.',
      mask: (value) => value.trim().toLowerCase(),
      validate: validateEmail
    }
  };

  return rules[type] || rules.cpf;
}

function validateReceiptContact({ showFeedback = true } = {}) {
  const rules = getReceiptContactRules();
  const value = receiptContactInput.value.trim();
  const isEmpty = value.length === 0;
  const isValid = !isEmpty && rules.validate(value);
  const message = isValid ? `${rules.label} válido.` : rules.help;

  receiptContactInput.setCustomValidity(isValid ? '' : rules.help);
  receiptContactFeedback.textContent = message;
  receiptContactFeedback.classList.toggle('valid', isValid);
  receiptContactFeedback.classList.toggle('invalid', showFeedback && !isValid && !isEmpty);

  return isValid;
}

function updateReceiptContactField({ clearValue = false } = {}) {
  const rules = getReceiptContactRules();
  receiptContactInput.placeholder = rules.placeholder;
  receiptContactInput.inputMode = rules.inputMode;

  if (clearValue) {
    receiptContactInput.value = '';
  } else {
    receiptContactInput.value = rules.mask(receiptContactInput.value);
  }

  receiptContactFeedback.textContent = rules.help;
  validateReceiptContact({ showFeedback: false });
}

function getBrazilWhatsappNumber(value = '') {
  const phone = sanitizePhone(value).slice(0, 13);
  if (!phone) return '';

  return phone.startsWith('55') ? phone : `55${phone}`;
}

function buildWhatsappUrl(phone, clientName = '', status = '') {
  const normalizedName = clientName.trim();
  const normalizedStatus = status.trim();
  const statusText = normalizedStatus ? ` Status atual: ${normalizedStatus}.` : '';
  const message = normalizedName
    ? `Olá, ${normalizedName}! Estou entrando em contato sobre o seu serviço.${statusText}`
    : `Olá! Estou entrando em contato sobre o seu serviço.${statusText}`;

  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
}

function openInNewTab(url) {
  const openedWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (openedWindow) return true;

  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.append(link);
  link.click();
  link.remove();

  return true;
}

function getProposalData() {
  const data = Object.fromEntries(new FormData(proposalForm).entries());
  data.proposalValue = formatCurrencyBR(data.proposalValue) || '';
  data.clientWhatsapp = formatPhoneBR(data.clientWhatsapp || '');
  data.logoDataUrl = professionalState.proposal.logoDataUrl || '';
  data.signatureDataUrl = professionalState.proposal.signatureDataUrl || '';
  return data;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

function renderProposalPremiumPreviews() {
  if (proposalLogoPreview) {
    proposalLogoPreview.innerHTML = professionalState.proposal.logoDataUrl
      ? `<img src="${professionalState.proposal.logoDataUrl}" alt="Logo enviada" />`
      : 'Nenhuma logo enviada';
  }

  if (proposalSignaturePreview) {
    proposalSignaturePreview.innerHTML = professionalState.proposal.signatureDataUrl
      ? `<img src="${professionalState.proposal.signatureDataUrl}" alt="Assinatura enviada" />`
      : 'Nenhuma assinatura enviada';
  }
}

function renderProposalPremiumFields() {
  if (!proposalPremiumFields) return;

  const unlocked = hasFeature('premiumProposals');
  proposalPremiumFields.classList.toggle('is-locked', !unlocked);
  if (proposalPremiumLock) proposalPremiumLock.hidden = unlocked;
  if (proposalSendActions) proposalSendActions.hidden = false;
  renderProposalPremiumPreviews();
}

function getFormData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function fillProposalForm() {
  Object.entries(professionalState.proposal).forEach(([key, value]) => {
    if (key === 'logoDataUrl' || key === 'signatureDataUrl') return;
    const field = proposalForm.elements[key];
    if (!field) return;
    field.value = key === 'proposalValue' ? formatCurrencyBR(value) : value;
  });
  renderProposalPremiumPreviews();
}

function updateProposalPreview(data = getProposalData()) {
  const professional = data.professionalName?.trim() || 'Seu nome ou empresa';
  const client = data.clientName?.trim() || 'Cliente';
  const service = data.serviceTitle?.trim() || 'Serviço proposto';
  const value = formatCurrencyBR(data.proposalValue) || 'Valor a definir';
  const premiumProposal = hasFeature('premiumProposals');
  const hasEmail = Boolean(data.clientEmail?.trim());
  const hasWhatsapp = getBrazilWhatsappNumber(data.clientWhatsapp).length >= 12;

  proposalReady = Boolean(data.professionalName && data.clientName && data.serviceTitle);
  setActionState(
    downloadProposalButton,
    proposalReady,
    premiumProposal ? '↓ Baixar proposta premium' : '↓ Baixar proposta pronta',
    'Preencha profissional, cliente e serviço'
  );

  if (!premiumProposal) {
    if (sendProposalEmailButton) {
      setActionState(
        sendProposalEmailButton,
        true,
        '✉ Desbloquear envio por e-mail',
        'Envio por e-mail no Completo'
      );
    }

    if (sendProposalWhatsappButton) {
      setActionState(
        sendProposalWhatsappButton,
        true,
        '☎ Desbloquear envio no WhatsApp',
        'Envio por WhatsApp no Completo'
      );
    }
  } else {
  if (sendProposalEmailButton) {
    setActionState(
      sendProposalEmailButton,
      proposalReady && hasEmail,
      '✉ Enviar por e-mail',
      hasEmail ? 'Preencha profissional, cliente e serviço' : 'Informe o e-mail do cliente'
    );
  }

  if (sendProposalWhatsappButton) {
    setActionState(
      sendProposalWhatsappButton,
      proposalReady && hasWhatsapp,
      '☎ Enviar no WhatsApp',
      hasWhatsapp ? 'Preencha profissional, cliente e serviço' : 'Informe o WhatsApp do cliente'
    );
  }
  }

  proposalPreviewText.textContent = proposalReady
    ? premiumProposal
      ? 'Proposta premium pronta. Baixe, envie por e-mail ou anexe no WhatsApp.'
      : 'Documento pronto para baixar e enviar ao cliente.'
    : 'Preencha pelo menos profissional, cliente e serviço.';

  const brandNote = premiumProposal && (data.logoDataUrl || data.signatureDataUrl)
    ? '<small>Logo e assinatura incluídas no documento.</small>'
    : premiumProposal
      ? '<small>Adicione logo e assinatura para uma proposta de alto padrão.</small>'
      : '';

  proposalPreviewCard.innerHTML = `
    <strong>${escapeHtml(service)}</strong>
    <span>${escapeHtml(professional)} para ${escapeHtml(client)}</span>
    <span>${escapeHtml(value)}</span>
    ${brandNote}
  `;
}

function buildProposalDocument(data) {
  const today = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date());
  const description = escapeHtml(data.serviceDescription || 'Serviço descrito conforme alinhamento entre as partes.').replace(/\n/g, '<br />');
  const proposalValue = formatCurrencyBR(data.proposalValue) || 'A definir';
  const premium = isPremiumDocuments();
  const premiumProposal = hasFeature('premiumProposals');
  const brandName = escapeHtml(data.professionalName || 'Sua marca');
  const logoBlock = premiumProposal && data.logoDataUrl
    ? `<img class="brand-logo" src="${data.logoDataUrl}" alt="Logo ${brandName}" />`
    : '<div class="mark">RJ</div>';
  const signatureBlock = premiumProposal && data.signatureDataUrl
    ? `<section class="signature-block"><img src="${data.signatureDataUrl}" alt="Assinatura" /><span>${brandName}</span></section>`
    : '';

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Proposta comercial - ${escapeHtml(data.clientName || 'Cliente')}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: ${premiumProposal ? '#f3f6ff' : premium ? '#eef2ff' : '#f6f7f9'};
        color: #111318;
        font-family: Inter, Arial, sans-serif;
        line-height: 1.55;
      }
      main {
        width: min(820px, calc(100% - 32px));
        margin: 32px auto;
        border: 1px solid ${premiumProposal ? '#b9c9ff' : premium ? '#c7d2fe' : '#dde2e8'};
        border-radius: ${premiumProposal ? '18px' : premium ? '16px' : '8px'};
        background: #fff;
        padding: 42px;
        ${premiumProposal ? 'box-shadow: 0 28px 70px rgba(36, 91, 219, 0.16);' : premium ? 'box-shadow: 0 24px 60px rgba(36, 91, 219, 0.12);' : ''}
      }
      header {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        border-bottom: 2px solid ${premiumProposal ? '#245bdb' : premium ? '#245bdb' : '#111318'};
        padding-bottom: 24px;
        align-items: center;
      }
      .mark {
        display: grid;
        width: 48px;
        height: 48px;
        place-items: center;
        border-radius: 8px;
        background: ${premium ? 'linear-gradient(135deg, #245bdb, #4f8cff)' : '#111318'};
        color: #fff;
        font-weight: 800;
      }
      .brand-logo {
        max-height: 64px;
        max-width: 220px;
        object-fit: contain;
      }
      .hero-band {
        margin: 20px 0 0;
        padding: 14px 18px;
        border-radius: 12px;
        background: linear-gradient(90deg, #245bdb, #4f8cff);
        color: #fff;
        font-weight: 700;
      }
      h1 {
        margin: 28px 0 10px;
        font-size: ${premiumProposal ? '2.55rem' : '2.4rem'};
        line-height: 1;
      }
      h2 {
        margin: 28px 0 10px;
        font-size: 1.2rem;
      }
      p { margin: 0; }
      .muted { color: #606875; }
      .meta {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin: 26px 0;
      }
      .box {
        border: 1px solid #dde2e8;
        border-radius: 8px;
        padding: 14px;
        ${premiumProposal ? 'background: #f8faff;' : ''}
      }
      .box span {
        display: block;
        color: #606875;
        font-size: 0.76rem;
        font-weight: 800;
        text-transform: uppercase;
      }
      .box strong {
        display: block;
        margin-top: 4px;
        font-size: 1.05rem;
      }
      .description {
        border: 1px solid #dde2e8;
        border-radius: 8px;
        padding: 18px;
        ${premiumProposal ? 'background: #fcfdff;' : ''}
      }
      .signature-block {
        margin-top: 36px;
        padding-top: 24px;
        border-top: 1px dashed #c7d2fe;
        display: grid;
        gap: 8px;
        justify-items: start;
      }
      .signature-block img {
        max-height: 72px;
        max-width: 220px;
        object-fit: contain;
      }
      .signature-block span {
        color: #606875;
        font-size: 0.9rem;
      }
      footer {
        margin-top: 36px;
        border-top: 1px solid #dde2e8;
        padding-top: 18px;
        color: #606875;
        font-size: 0.86rem;
      }
      @media print {
        body { background: #fff; }
        main { width: 100%; margin: 0; border: 0; }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div>
          ${logoBlock}
          <p class="muted" style="margin-top: 12px;">Proposta gerada em ${today}</p>
        </div>
        <div style="text-align: right;">
          <strong>${brandName}</strong>
          <p class="muted">Proposta comercial${premiumProposal ? ' · Alto padrão' : ''}</p>
        </div>
      </header>
      ${premiumProposal ? `<div class="hero-band">Proposta comercial personalizada para ${escapeHtml(data.clientName || 'Cliente')}</div>` : ''}

      <h1>${escapeHtml(data.serviceTitle || 'Serviço proposto')}</h1>
      <p class="muted">Preparada para ${escapeHtml(data.clientName || 'Cliente')}</p>

      <section class="meta">
        <div class="box">
          <span>Valor</span>
          <strong>${escapeHtml(proposalValue)}</strong>
        </div>
        <div class="box">
          <span>Prazo</span>
          <strong>${escapeHtml(data.deliveryTime || 'A combinar')}</strong>
        </div>
        <div class="box">
          <span>Pagamento</span>
          <strong>${escapeHtml(data.paymentTerms || 'A combinar')}</strong>
        </div>
        <div class="box">
          <span>Validade</span>
          <strong>7 dias</strong>
        </div>
      </section>

      <h2>Escopo do serviço</h2>
      <div class="description">${description}</div>

      <h2>Próximos passos</h2>
      <p>Após a aprovação, o trabalho será iniciado conforme prazo e condições combinadas nesta proposta.</p>

      ${signatureBlock}

      <footer>
        ${premiumProposal ? `Proposta comercial de alto padrão · ${brandName} · Resolva Jato Completo.` : premium ? 'Documento premium Resolva Jato Essencial+. Para salvar em PDF, use a opção de imprimir do navegador.' : 'Gerado gratuitamente no Resolva Jato. Para salvar em PDF, use a opção de imprimir do navegador.'}
      </footer>
    </main>
  </body>
</html>`;
}

function downloadProposalFile(data = getProposalData()) {
  const documentHtml = buildProposalDocument(data);
  const blob = new Blob([documentHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const clientSlug = normalize(data.clientName || 'cliente').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cliente';

  link.href = url;
  link.download = `proposta-${clientSlug}-resolva-jato.html`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  const proposalWindow = window.open('', '_blank');
  if (proposalWindow) {
    proposalWindow.document.write(documentHtml);
    proposalWindow.document.close();
    proposalWindow.focus();
  }
}

function buildProposalShareMessage(data = getProposalData()) {
  return [
    `Olá, ${data.clientName || 'cliente'}!`,
    '',
    `Segue nossa proposta comercial para *${data.serviceTitle || 'serviço'}*.`,
    `Valor: *${formatCurrencyBR(data.proposalValue) || 'a definir'}*`,
    `Prazo: ${data.deliveryTime || 'a combinar'}`,
    `Pagamento: ${data.paymentTerms || 'a combinar'}`,
    '',
    'O arquivo da proposta segue anexo para sua análise.',
    '',
    `Atenciosamente,`,
    data.professionalName || 'Equipe'
  ].join('\n');
}

function sendProposalByEmail() {
  if (!hasFeature('premiumProposals')) {
    openUpgradeModal({ featureKey: 'premiumProposals', reason: 'Envie propostas de alto padrão por e-mail com logo e assinatura no plano Completo.' });
    return;
  }

  const data = getProposalData();
  if (!proposalReady || sendProposalEmailButton?.disabled) return;

  gateDocumentDownload(() => {
    downloadProposalFile(data);
    const subject = encodeURIComponent(`Proposta comercial - ${data.serviceTitle || 'Serviço'}`);
    const body = encodeURIComponent(buildProposalShareMessage(data));
    window.location.href = `mailto:${data.clientEmail?.trim()}?subject=${subject}&body=${body}`;
  });
}

function sendProposalByWhatsapp() {
  if (!hasFeature('premiumProposals')) {
    openUpgradeModal({ featureKey: 'premiumProposals', reason: 'Envie propostas anexadas no WhatsApp com uma experiência profissional no plano Completo.' });
    return;
  }

  const data = getProposalData();
  const phone = getBrazilWhatsappNumber(data.clientWhatsapp);
  if (!proposalReady || !phone || sendProposalWhatsappButton?.disabled) return;

  gateDocumentDownload(() => {
    downloadProposalFile(data);
    const message = `${buildProposalShareMessage(data)}\n\nBaixei a proposta para você anexar nesta conversa.`;
    openInNewTab(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`);
  });
}

function downloadProposal() {
  if (!proposalReady) return;

  gateDocumentDownload(() => {
    downloadProposalFile();
  });
}

function buildUtilityDocument({ title, subtitle, blocks, footer = 'Gerado gratuitamente no Resolva Jato.' }) {
  const today = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date());
  const premium = isPremiumDocuments();
  const blockHtml = blocks.map((block) => `
    <section class="block">
      <span>${escapeHtml(block.label)}</span>
      <div>${block.html}</div>
    </section>
  `).join('');

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: ${premium ? '#eef2ff' : '#f6f7f9'};
        color: #111318;
        font-family: Inter, Arial, sans-serif;
        line-height: 1.55;
      }
      main {
        width: min(820px, calc(100% - 32px));
        margin: 32px auto;
        border: 1px solid #dde2e8;
        border-radius: 8px;
        background: #fff;
        padding: 42px;
      }
      header {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        border-bottom: 2px solid #111318;
        padding-bottom: 24px;
      }
      .mark {
        display: grid;
        width: 48px;
        height: 48px;
        place-items: center;
        border-radius: 8px;
        background: #111318;
        color: #fff;
        font-weight: 800;
      }
      h1 {
        margin: 30px 0 8px;
        font-size: 2.2rem;
        line-height: 1;
      }
      p { margin: 0; }
      .muted { color: #606875; }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin: 26px 0;
      }
      .block {
        border: 1px solid #dde2e8;
        border-radius: 8px;
        padding: 14px;
      }
      .block span {
        display: block;
        margin-bottom: 6px;
        color: #606875;
        font-size: 0.76rem;
        font-weight: 800;
        text-transform: uppercase;
      }
      .block div {
        font-weight: 700;
      }
      .wide { grid-column: 1 / -1; }
      ul {
        margin: 0;
        padding-left: 18px;
      }
      li { margin: 8px 0; }
      .signature {
        margin-top: 48px;
        padding-top: 18px;
        border-top: 1px solid #111318;
        text-align: center;
      }
      footer {
        margin-top: 36px;
        border-top: 1px solid #dde2e8;
        padding-top: 18px;
        color: #606875;
        font-size: 0.86rem;
      }
      @media print {
        body { background: #fff; }
        main { width: 100%; margin: 0; border: 0; }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div>
          <div class="mark">RJ</div>
          <p class="muted" style="margin-top: 12px;">Documento gerado em ${today}</p>
        </div>
        <div style="text-align: right;">
          <strong>Resolva Jato</strong>
          <p class="muted">Documento profissional</p>
        </div>
      </header>
      <h1>${escapeHtml(title)}</h1>
      <p class="muted">${escapeHtml(subtitle)}</p>
      <div class="grid">${blockHtml}</div>
      <div class="signature">Assinatura</div>
      <footer>${escapeHtml(footer)}</footer>
    </main>
  </body>
</html>`;
}

function downloadHtmlDocument(documentHtml, fileName) {
  const blob = new Blob([documentHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  const documentWindow = window.open('', '_blank');
  if (documentWindow) {
    documentWindow.document.write(documentHtml);
    documentWindow.document.close();
    documentWindow.focus();
  }
}

function getReceiptData() {
  const data = getFormData(receiptForm);
  data.receiptValue = formatCurrencyBR(data.receiptValue) || '';
  data.receiptContactLabel = getReceiptContactRules(data.receiptContactType).label;
  return data;
}

function updateReceiptPreview(data = getReceiptData()) {
  const payer = data.payerName?.trim() || 'Pagador';
  const receiver = data.receiverName?.trim() || 'Recebedor';
  const value = formatCurrencyBR(data.receiptValue) || 'Valor a definir';
  const reference = data.receiptDescription?.trim() || 'Referência do pagamento';
  const contactIsValid = validateReceiptContact({ showFeedback: false });
  const receiptReady = Boolean(data.payerName && data.receiverName && data.receiptValue && contactIsValid);

  setActionState(
    downloadReceiptButton,
    receiptReady,
    '↓ Baixar recibo pronto',
    'Preencha os dados para liberar o download'
  );

  receiptPreviewText.textContent = data.payerName && data.receiverName
    ? contactIsValid ? 'Recibo pronto para baixar e imprimir.' : 'Revise o documento/contato para liberar o recibo.'
    : 'Preencha pagador, recebedor e valor para deixar o recibo completo.';

  receiptPreviewCard.innerHTML = `
    <strong>${escapeHtml(value)}</strong>
    <span>${escapeHtml(receiver)} recebeu de ${escapeHtml(payer)}</span>
    <span>${escapeHtml(data.receiptContactLabel)}: ${escapeHtml(data.payerDocument || 'não informado')}</span>
    <span>${escapeHtml(reference)}</span>
  `;
}

function downloadReceipt() {
  const data = getReceiptData();
  if (downloadReceiptButton.disabled) return;

  if (!validateReceiptContact()) {
    receiptContactInput.reportValidity();
    return;
  }

  gateDocumentDownload(() => {
    const date = data.receiptDate
      ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(`${data.receiptDate}T00:00:00`))
      : 'Data a definir';
    const documentHtml = buildUtilityDocument({
      title: 'Recibo',
      subtitle: `Declaro o recebimento de ${data.receiptValue || 'valor a definir'}.`,
      blocks: [
        { label: 'Recebi de', html: escapeHtml(data.payerName || 'Pagador') },
        { label: 'Quem recebeu', html: escapeHtml(data.receiverName || 'Recebedor') },
        { label: 'Valor', html: escapeHtml(data.receiptValue || 'A definir') },
        { label: 'Forma de pagamento', html: escapeHtml(data.paymentMethod || 'A definir') },
        { label: 'Data', html: escapeHtml(date) },
        { label: data.receiptContactLabel, html: escapeHtml(data.payerDocument) },
        { label: 'Referente a', html: escapeHtml(data.receiptDescription || 'Pagamento conforme combinado.').replace(/\n/g, '<br />') }
      ]
    });
    const slug = normalize(data.payerName || 'recibo').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'recibo';
    downloadHtmlDocument(documentHtml, `recibo-${slug}-resolva-jato.html`);
  });
}

function getWorkOrderData() {
  return getFormData(workOrderForm);
}

function updateWorkOrderPreview(data = getWorkOrderData()) {
  const hasService = Boolean(data.orderService?.trim());
  const hasClient = Boolean(data.orderClient?.trim());
  const service = hasService ? data.orderService.trim() : 'Título do Serviço';
  const client = data.orderClient?.trim() || 'Cliente';
  const priority = data.orderPriority || 'Normal';
  const location = data.orderLocation?.trim() || 'Local a definir';
  const workOrderReady = hasClient && hasService;

  setActionState(
    downloadWorkOrderButton,
    workOrderReady,
    '↓ Baixar ordem de serviço pronta',
    'Preencha cliente e serviço para liberar'
  );

  workOrderPreviewText.textContent = workOrderReady
    ? 'Ordem de serviço pronta para baixar.'
    : 'Preencha cliente e serviço para montar a OS.';

  workOrderPreviewCard.innerHTML = `
    <strong class="${hasService ? '' : 'preview-placeholder'}">${escapeHtml(service)}</strong>
    <span>${escapeHtml(client)} · ${escapeHtml(location)}</span>
    <span>Prioridade ${escapeHtml(priority)}</span>
  `;
}

function downloadWorkOrder() {
  if (downloadWorkOrderButton.disabled) return;

  gateDocumentDownload(() => {
    const data = getWorkOrderData();
    const date = data.orderDate
      ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(`${data.orderDate}T00:00:00`))
      : 'Data a definir';
    const documentHtml = buildUtilityDocument({
      title: 'Ordem de Serviço',
      subtitle: data.orderService || 'Registro de solicitação e execução de serviço.',
      blocks: [
        { label: 'Cliente', html: escapeHtml(data.orderClient || 'Cliente') },
        { label: 'Responsável', html: escapeHtml(data.orderOwner || 'Responsável') },
        { label: 'Serviço', html: escapeHtml(data.orderService || 'Serviço') },
        { label: 'Local', html: escapeHtml(data.orderLocation || 'A definir') },
        { label: 'Data prevista', html: escapeHtml(date) },
        { label: 'Prioridade', html: escapeHtml(data.orderPriority || 'Normal') },
        { label: 'Descrição', html: escapeHtml(data.orderDescription || 'Solicitação conforme combinado.').replace(/\n/g, '<br />') }
      ]
    });
    const slug = normalize(data.orderClient || 'ordem-servico').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ordem-servico';
    downloadHtmlDocument(documentHtml, `ordem-servico-${slug}-resolva-jato.html`);
  });
}

function getChecklistData() {
  return getFormData(checklistForm);
}

function getChecklistItems(value = '') {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

function updateChecklistPreview(data = getChecklistData()) {
  const project = data.checklistProject?.trim() || 'Projeto ou cliente';
  const items = getChecklistItems(data.checklistItems);
  const visibleItems = items.slice(0, 5);
  const checklistReady = items.length > 0;

  setActionState(
    downloadChecklistButton,
    checklistReady,
    '↓ Baixar checklist pronto',
    'Adicione itens para liberar o download'
  );

  checklistPreviewText.textContent = items.length > 0
    ? `${items.length} item(ns) prontos para conferência.`
    : 'Adicione os itens que precisam ser conferidos na entrega.';

  checklistPreviewCard.classList.toggle('is-empty', !checklistReady);
  checklistPreviewCard.innerHTML = checklistReady
    ? `
      <strong>${escapeHtml(project)}</strong>
      <ul>
        ${visibleItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    `
    : `
      <strong class="preview-placeholder">${escapeHtml(project)}</strong>
      <div class="skeleton-lines" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
}

function downloadChecklist() {
  if (downloadChecklistButton.disabled) return;

  gateDocumentDownload(() => {
    const data = getChecklistData();
    const items = getChecklistItems(data.checklistItems);
    const itemHtml = items.length > 0
      ? `<ul>${items.map((item) => `<li>[ ] ${escapeHtml(item)}</li>`).join('')}</ul>`
      : 'Nenhum item informado.';
    const documentHtml = buildUtilityDocument({
      title: 'Checklist de Entrega',
      subtitle: data.checklistProject || 'Lista de conferência do serviço.',
      blocks: [
        { label: 'Cliente ou projeto', html: escapeHtml(data.checklistProject || 'Projeto') },
        { label: 'Responsável', html: escapeHtml(data.checklistOwner || 'Responsável') },
        { label: 'Itens da entrega', html: itemHtml },
        { label: 'Observações finais', html: escapeHtml(data.checklistNotes || 'Sem observações.').replace(/\n/g, '<br />') }
      ],
      footer: 'Use este checklist para conferir a entrega antes de finalizar o atendimento.'
    });
    const slug = normalize(data.checklistProject || 'checklist').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'checklist';
    downloadHtmlDocument(documentHtml, `checklist-${slug}-resolva-jato.html`);
  });
}

function getPricingData() {
  const data = getFormData(pricingForm);
  const numberOrZero = (value) => {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return {
    income: parseCurrencyBR(data.pricingIncome),
    costs: parseCurrencyBR(data.pricingCosts),
    hoursDay: numberOrZero(data.pricingHoursDay),
    daysWeek: numberOrZero(data.pricingDaysWeek),
    projectHours: numberOrZero(data.pricingProjectHours),
    profit: numberOrZero(data.pricingProfit)
  };
}

function calculatePricing() {
  const data = getPricingData();
  const monthlyHours = data.hoursDay * data.daysWeek * 4.33;
  const baseHour = monthlyHours > 0 ? (data.income + data.costs) / monthlyHours : 0;
  const hourWithProfit = baseHour * (1 + data.profit / 100);
  const projectValue = hourWithProfit * data.projectHours;
  const isReady = data.income > 0 && data.hoursDay > 0 && data.daysWeek > 0;

  return { ...data, monthlyHours, baseHour, hourWithProfit, projectValue, isReady };
}

function updatePricingPreview() {
  const data = calculatePricing();

  setActionState(
    copyPricingSummaryButton,
    data.isReady,
    '⧉ Copiar resumo da precificação',
    'Preencha os dados para copiar o resumo'
  );

  pricingPreviewText.textContent = data.monthlyHours > 0
    ? `${data.monthlyHours.toFixed(0)} horas produtivas estimadas por mês.`
    : 'Informe horas e dias de trabalho para calcular.';

  pricingPreviewCard.innerHTML = `
    <strong>${formatMoneyValue(data.hourWithProfit)}/h</strong>
    <span>Hora mínima com margem de ${Number.isFinite(data.profit) ? data.profit : 0}%</span>
    <span>Projeto: ${formatMoneyValue(data.projectValue)}</span>
    <small>Custo mensal considerado: ${formatMoneyValue(data.income + data.costs)}</small>
  `;
}

function buildPricingSummary() {
  const data = calculatePricing();
  return [
    'Resumo da precificação',
    `Meta mensal: ${formatMoneyValue(data.income)}`,
    `Custos fixos: ${formatMoneyValue(data.costs)}`,
    `Horas produtivas/mês: ${data.monthlyHours.toFixed(0)}`,
    `Margem de lucro: ${data.profit}%`,
    `Valor sugerido da hora: ${formatMoneyValue(data.hourWithProfit)}`,
    `Projeto estimado: ${formatMoneyValue(data.projectValue)}`
  ].join('\n');
}

async function copyPricingSummary() {
  if (copyPricingSummaryButton.disabled) return;

  await copyTextToClipboard(buildPricingSummary());
  copyPricingSummaryButton.textContent = 'Resumo copiado';
  setTimeout(() => {
    copyPricingSummaryButton.textContent = '⧉ Copiar resumo da precificação';
  }, 1600);
}

function getPixKeyRules(type = pixKeyType.value) {
  const rules = {
    cpf: {
      placeholder: '000.000.000-00',
      inputMode: 'numeric',
      help: 'Informe um CPF válido.',
      mask: formatCpf,
      validate: validateCpf,
      normalize: (value) => sanitizePhone(value)
    },
    cnpj: {
      placeholder: '00.000.000/0000-00',
      inputMode: 'numeric',
      help: 'Informe um CNPJ válido.',
      mask: formatCnpj,
      validate: validateCnpj,
      normalize: (value) => sanitizePhone(value)
    },
    phone: {
      placeholder: '(00) 00000-0000',
      inputMode: 'tel',
      help: 'Informe um telefone brasileiro válido com DDD.',
      mask: formatPhoneBR,
      validate: validatePhoneBR,
      normalize: (value) => {
        const digits = sanitizePhone(value);
        return digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
      }
    },
    email: {
      placeholder: 'nome@email.com',
      inputMode: 'email',
      help: 'Informe um e-mail válido.',
      mask: (value) => value.trim().toLowerCase(),
      validate: validateEmail,
      normalize: (value) => value.trim().toLowerCase()
    },
    random: {
      placeholder: 'Chave aleatória Pix',
      inputMode: 'text',
      help: 'Informe uma chave aleatória Pix válida.',
      mask: (value) => value.trim(),
      validate: (value) => /^[A-Za-z0-9-]{32,77}$/.test(value.trim()),
      normalize: (value) => value.trim()
    }
  };

  return rules[type] || rules.cpf;
}

function validatePixKey({ showFeedback = true } = {}) {
  const rules = getPixKeyRules();
  const value = pixKeyInput.value.trim();
  const isValid = value.length > 0 && rules.validate(value);

  pixKeyInput.setCustomValidity(isValid ? '' : rules.help);
  pixKeyFeedback.textContent = isValid ? 'Chave Pix válida.' : rules.help;
  pixKeyFeedback.classList.toggle('valid', isValid);
  pixKeyFeedback.classList.toggle('invalid', showFeedback && !isValid && value.length > 0);

  return isValid;
}

function updatePixKeyField({ clearValue = false } = {}) {
  const rules = getPixKeyRules();
  pixKeyInput.placeholder = rules.placeholder;
  pixKeyInput.inputMode = rules.inputMode;
  pixKeyInput.value = clearValue ? '' : rules.mask(pixKeyInput.value);
  pixKeyFeedback.textContent = rules.help;
  validatePixKey({ showFeedback: false });
}

function tlv(id, value) {
  const content = String(value);
  return `${id}${String(content.length).padStart(2, '0')}${content}`;
}

function crc16(payload) {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function buildPixPayload() {
  const data = getFormData(pixForm);
  const rules = getPixKeyRules(data.pixKeyType);
  const key = rules.normalize(data.pixKey);
  const amount = parseCurrencyBR(data.pixValue).toFixed(2);
  const merchant = sanitizePixText(data.pixMerchant || 'RESOLVA JATO', 25) || 'RESOLVA JATO';
  const city = sanitizePixText(data.pixCity || 'BRASIL', 15) || 'BRASIL';
  const description = sanitizePixText(data.pixDescription || data.pixClient || 'COBRANCA', 25);
  const merchantAccount = tlv('00', 'br.gov.bcb.pix') + tlv('01', key) + (description ? tlv('02', description) : '');
  const txid = sanitizePixText(`RJ${Date.now().toString().slice(-8)}`, 25);
  const withoutCrc = [
    tlv('00', '01'),
    tlv('26', merchantAccount),
    tlv('52', '0000'),
    tlv('53', '986'),
    amount !== '0.00' ? tlv('54', amount) : '',
    tlv('58', 'BR'),
    tlv('59', merchant),
    tlv('60', city),
    tlv('62', tlv('05', txid)),
    '6304'
  ].join('');

  return `${withoutCrc}${crc16(withoutCrc)}`;
}

function updatePixPreview() {
  const isKeyValid = validatePixKey({ showFeedback: false });
  const data = getFormData(pixForm);

  if (!isKeyValid) {
    setActionState(copyPixCodeButton, false, '⧉ Copiar Pix', 'Informe uma chave Pix válida');
    setActionState(sendPixWhatsappButton, false, '☏ Enviar pelo WhatsApp', 'Gere o Pix para enviar');
    pixPreviewText.textContent = 'Preencha uma chave Pix válida para gerar a cobrança.';
    pixPreviewCard.dataset.pixPayload = '';
    pixPreviewCard.innerHTML = '<strong>Código Pix</strong><span>O código aparecerá aqui pronto para copiar.</span>';
    return;
  }

  const payload = buildPixPayload();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(payload)}`;
  setActionState(copyPixCodeButton, true, '⧉ Copiar Pix', 'Informe uma chave Pix válida');
  setActionState(sendPixWhatsappButton, true, '☏ Enviar pelo WhatsApp', 'Gere o Pix para enviar');
  pixPreviewCard.dataset.pixPayload = payload;
  pixPreviewText.textContent = `${data.pixClient || 'Cliente'} · ${formatCurrencyBR(data.pixValue) || 'valor aberto'}`;
  pixPreviewCard.innerHTML = `
    <strong>Pix pronto</strong>
    <img class="pix-qr" src="${qrCodeUrl}" alt="QR Code Pix para pagamento" />
    <button class="pix-copy-block" type="button" aria-label="Copiar Pix Copia e Cola">
      <code>${escapeHtml(payload)}</code>
      <span class="copy-hint">Clique no bloco para copiar</span>
      <span class="copy-toast" aria-live="polite">Copiado!</span>
    </button>
  `;
}

async function copyTextToClipboard(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const temporaryInput = document.createElement('textarea');
    temporaryInput.value = value;
    temporaryInput.style.position = 'fixed';
    temporaryInput.style.opacity = '0';
    document.body.append(temporaryInput);
    temporaryInput.select();
    document.execCommand('copy');
    temporaryInput.remove();
  }
}

function buildPixWhatsappMessage() {
  const data = getFormData(pixForm);
  const payload = buildPixPayload();
  const client = data.pixClient?.trim();
  const value = formatCurrencyBR(data.pixValue) || 'valor combinado';
  const description = (data.pixDescription?.trim() || 'serviço')
    .replace(/^referente\s+(a|ao|à|aos|às)\s+/i, '')
    .replace(/^referente\s+/i, '');

  return [
    client ? `Olá, ${client}!` : 'Olá!',
    `Segue a cobrança Pix de ${value}.`,
    `Descrição: ${description}.`,
    '',
    'Copie somente o código entre as linhas abaixo:',
    '----- PIX COPIA E COLA -----',
    payload,
    '----- FIM DO PIX -----'
  ].join('\n');
}

function sendPixByWhatsapp() {
  if (!validatePixKey()) {
    pixKeyInput.reportValidity();
    return;
  }

  sendPixWhatsappButton.disabled = true;
  const phone = getBrazilWhatsappNumber(pixWhatsappInput.value);
  const message = buildPixWhatsappMessage();
  const whatsappUrl = phone
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  openInNewTab(whatsappUrl);

  setTimeout(() => {
    sendPixWhatsappButton.disabled = false;
  }, 1800);
}

async function copyPixCode() {
  if (!validatePixKey()) {
    pixKeyInput.reportValidity();
    return;
  }

  const payload = buildPixPayload();
  await copyTextToClipboard(payload);

  copyPixCodeButton.textContent = 'Pix copiado';
  setTimeout(() => {
    copyPixCodeButton.textContent = '⧉ Copiar Pix';
  }, 1600);
}

async function copyPixFromPreview() {
  const payload = pixPreviewCard.dataset.pixPayload;
  if (!payload) return;

  await copyTextToClipboard(payload);
  const copyBlock = pixPreviewCard.querySelector('.pix-copy-block');
  copyBlock?.classList.add('copied');
  setTimeout(() => {
    copyBlock?.classList.remove('copied');
  }, 1400);
}

function getWarrantyData() {
  return getFormData(warrantyForm);
}

function updateWarrantyPreview(data = getWarrantyData()) {
  const hasService = Boolean(data.warrantyService?.trim());
  const hasClient = Boolean(data.warrantyClient?.trim());
  const service = hasService ? data.warrantyService.trim() : 'Serviço concluído';
  const client = hasClient ? data.warrantyClient.trim() : 'Cliente';
  const days = data.warrantyDays?.trim();
  const warrantyLabel = days ? `Garantia de ${days} dias` : 'Garantia a definir';
  const warrantyReady = hasClient && hasService;

  setActionState(
    downloadWarrantyButton,
    warrantyReady,
    '↓ Baixar termo pronto',
    'Preencha cliente e serviço para liberar'
  );

  warrantyPreviewText.textContent = warrantyReady
    ? 'Termo pronto para baixar e coletar aceite.'
    : 'Preencha cliente e serviço para montar o termo.';

  warrantyPreviewCard.innerHTML = `
    <strong>${escapeHtml(service)}</strong>
    <span>${escapeHtml(client)}</span>
    <span>${escapeHtml(warrantyLabel)}</span>
  `;
}

function downloadWarranty() {
  if (downloadWarrantyButton.disabled) return;

  gateDocumentDownload(() => {
    const data = getWarrantyData();
    const date = data.warrantyDate
      ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(`${data.warrantyDate}T00:00:00`))
      : 'Data a definir';
    const documentHtml = buildUtilityDocument({
      title: 'Termo de Serviço Concluído e Garantia',
      subtitle: data.warrantyService || 'Registro de conclusão de serviço.',
      blocks: [
        { label: 'Profissional ou empresa', html: escapeHtml(data.warrantyProfessional || 'Profissional') },
        { label: 'Cliente', html: escapeHtml(data.warrantyClient || 'Cliente') },
        { label: 'Serviço concluído', html: escapeHtml(data.warrantyService || 'Serviço') },
        { label: 'Data de conclusão', html: escapeHtml(date) },
        { label: 'Prazo de garantia', html: data.warrantyDays ? `${escapeHtml(data.warrantyDays)} dias` : 'Garantia a definir' },
        { label: 'Canal de aceite', html: escapeHtml(data.warrantyAcceptance || 'Assinatura do cliente') },
        { label: 'Escopo entregue', html: escapeHtml(data.warrantyScope || 'Serviço entregue conforme combinado.').replace(/\n/g, '<br />') }
      ],
      footer: 'Este termo registra a conclusão do serviço e os limites de garantia informados pelo profissional.'
    });
    const slug = normalize(data.warrantyClient || 'termo-garantia').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'termo-garantia';
    downloadHtmlDocument(documentHtml, `termo-garantia-${slug}-resolva-jato.html`);
  });
}

function getBudgetData() {
  const data = getFormData(budgetForm);
  data.budgetValue = formatCurrencyBR(data.budgetValue) || '';
  return data;
}

function updateBudgetPreview(data = getBudgetData()) {
  const hasService = Boolean(data.budgetService?.trim());
  const hasClient = Boolean(data.budgetClient?.trim());
  const service = hasService ? data.budgetService.trim() : 'Serviço orçado';
  const client = hasClient ? data.budgetClient.trim() : 'Cliente';
  const value = data.budgetValue || 'Valor a definir';
  const budgetReady = hasClient && hasService && Boolean(data.budgetValue);

  setActionState(
    downloadBudgetButton,
    budgetReady,
    '↓ Baixar orçamento pronto',
    'Preencha cliente, serviço e valor para liberar'
  );

  budgetPreviewText.textContent = budgetReady
    ? 'Orçamento pronto para baixar e enviar.'
    : 'Preencha cliente, serviço e valor para montar o orçamento.';

  budgetPreviewCard.innerHTML = `
    <strong>${escapeHtml(service)}</strong>
    <span>${escapeHtml(client)} · ${escapeHtml(value)}</span>
    <span>Validade: ${escapeHtml(data.budgetValidity || '7 dias')}</span>
  `;
}

function downloadBudget() {
  if (downloadBudgetButton.disabled) return;

  gateDocumentDownload(() => {
    const data = getBudgetData();
    const documentHtml = buildUtilityDocument({
      title: 'Orçamento',
      subtitle: data.budgetService || 'Proposta de preço para serviço.',
      blocks: [
        { label: 'Prestador', html: escapeHtml(data.budgetProfessional || 'Profissional') },
        { label: 'Cliente', html: escapeHtml(data.budgetClient || 'Cliente') },
        { label: 'Serviço', html: escapeHtml(data.budgetService || 'Serviço') },
        { label: 'Valor', html: escapeHtml(data.budgetValue || 'A definir') },
        { label: 'Prazo', html: escapeHtml(data.budgetDeadline || 'A combinar') },
        { label: 'Validade', html: escapeHtml(data.budgetValidity || '7 dias') },
        { label: 'Detalhes', html: escapeHtml(data.budgetDescription || 'Serviço conforme descrito neste orçamento.').replace(/\n/g, '<br />') }
      ],
      footer: 'Este orçamento não substitui contrato formal. Valores sujeitos a confirmação após análise final.'
    });
    const slug = normalize(data.budgetClient || 'orcamento').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'orcamento';
    downloadHtmlDocument(documentHtml, `orcamento-${slug}-resolva-jato.html`);
  });
}

function getContractData() {
  const data = getFormData(contractForm);
  data.contractValue = formatCurrencyBR(data.contractValue) || '';
  return data;
}

function updateContractPreview(data = getContractData()) {
  const hasService = Boolean(data.contractService?.trim());
  const hasClient = Boolean(data.contractClient?.trim());
  const hasProvider = Boolean(data.contractProvider?.trim());
  const service = hasService ? data.contractService.trim() : 'Serviço contratado';
  const client = hasClient ? data.contractClient.trim() : 'Cliente';
  const provider = hasProvider ? data.contractProvider.trim() : 'Prestador';
  const contractReady = hasClient && hasService && hasProvider;

  setActionState(
    downloadContractButton,
    contractReady,
    '↓ Baixar contrato pronto',
    'Preencha prestador, cliente e serviço para liberar'
  );

  contractPreviewText.textContent = contractReady
    ? 'Contrato pronto para baixar e coletar assinaturas.'
    : 'Preencha prestador, cliente e serviço para montar o contrato.';

  contractPreviewCard.innerHTML = `
    <strong>${escapeHtml(service)}</strong>
    <span>${escapeHtml(provider)} → ${escapeHtml(client)}</span>
    <span>${escapeHtml(data.contractValue || 'Valor a definir')}</span>
  `;
}

function downloadContract() {
  if (downloadContractButton.disabled) return;

  gateDocumentDownload(() => {
    const data = getContractData();
    const documentHtml = buildUtilityDocument({
      title: 'Contrato de Prestação de Serviço',
      subtitle: data.contractService || 'Formalização de serviço entre prestador e contratante.',
      blocks: [
        { label: 'Prestador', html: escapeHtml(data.contractProvider || 'Prestador') },
        { label: 'Contratante', html: escapeHtml(data.contractClient || 'Cliente') },
        { label: 'Objeto do contrato', html: escapeHtml(data.contractService || 'Serviço') },
        { label: 'Valor', html: escapeHtml(data.contractValue || 'A combinar') },
        { label: 'Prazo de execução', html: escapeHtml(data.contractDeadline || 'A combinar') },
        { label: 'Pagamento', html: escapeHtml(data.contractPayment || 'A combinar') },
        { label: 'Escopo e condições', html: escapeHtml(data.contractScope || 'Serviço executado conforme combinado entre as partes.').replace(/\n/g, '<br />') }
      ],
      footer: 'Modelo simplificado para uso entre particulares. Consulte um advogado para casos complexos ou valores elevados.'
    });
    const slug = normalize(data.contractClient || 'contrato').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'contrato';
    downloadHtmlDocument(documentHtml, `contrato-${slug}-resolva-jato.html`);
  });
}

function renderBusinessDashboard() {
  const panel = document.querySelector('#business-dashboard');
  if (!panel) return;

  const plan = getCurrentPlan();

  if (!hasFeature('businessDashboard')) {
    if (plan.id === 'essencial') {
      panel.hidden = false;
      panel.innerHTML = `
        <div class="dashboard-teaser">
          <div>
            <strong>Painel de métricas no Completo</strong>
            <p>Clientes ativos, compromissos da semana e documentos gerados em um só lugar.</p>
          </div>
          <button type="button" class="promo-action" data-upgrade-feature="businessDashboard">Ver Completo</button>
        </div>
      `;
      return;
    }

    panel.hidden = true;
    panel.innerHTML = '';
    return;
  }

  const usage = getUsageState();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const weekAppointments = professionalState.appointments.filter((appointment) => {
    const date = new Date(appointment.date);
    return date >= weekStart && date < weekEnd;
  }).length;

  const activeClients = professionalState.clients.filter((client) => client.status !== 'Finalizado').length;
  const leads = professionalState.clients.filter((client) => client.status === 'Lead').length;

  panel.hidden = false;
  panel.innerHTML = `
    <div class="business-dashboard__head">
      <p class="eyebrow">Painel Completo</p>
      <h3>Resumo do seu negócio</h3>
    </div>
    <div class="business-dashboard__grid">
      <article class="metric-card">
        <span>Clientes ativos</span>
        <strong>${activeClients}</strong>
      </article>
      <article class="metric-card">
        <span>Leads na carteira</span>
        <strong>${leads}</strong>
      </article>
      <article class="metric-card">
        <span>Compromissos esta semana</span>
        <strong>${weekAppointments}</strong>
      </article>
      <article class="metric-card">
        <span>Documentos este mês</span>
        <strong>${usage.documentsMonth}</strong>
      </article>
    </div>
  `;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function renderClientProFields() {
  if (!clientProFields) return;

  const unlocked = hasFeature('clientProfileFull');
  clientProFields.classList.toggle('is-locked', !unlocked);
  if (clientProLock) clientProLock.hidden = unlocked;
}

function getAppointmentsForDay(date) {
  const key = toDateKey(date);
  return professionalState.appointments.filter((appointment) => appointment.date?.slice(0, 10) === key);
}

function renderAppointmentCalendar() {
  if (!appointmentCalendar || !appointmentCalendarWrap) return;

  const unlocked = hasFeature('calendarAgenda');
  appointmentCalendarWrap.classList.toggle('is-locked', !unlocked);

  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(calendarCursor);
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toDateKey(new Date());

  let cells = weekdays.map((day) => `<span class="calendar-weekday">${day}</span>`).join('');

  for (let i = 0; i < startOffset; i += 1) {
    cells += '<span class="calendar-day is-muted" aria-hidden="true"></span>';
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const key = toDateKey(date);
    const hasEvents = getAppointmentsForDay(date).length > 0;
    const classes = [
      'calendar-day',
      key === todayKey ? 'is-today' : '',
      selectedCalendarDay === key ? 'is-selected' : '',
      hasEvents ? 'has-events' : ''
    ].filter(Boolean).join(' ');

    cells += `<button type="button" class="${classes}" data-calendar-day="${key}">${day}</button>`;
  }

  appointmentCalendar.innerHTML = `
    <div class="calendar-head">
      <button type="button" class="ghost-button" data-calendar-nav="prev" aria-label="Mês anterior">‹</button>
      <strong>${monthLabel}</strong>
      <button type="button" class="ghost-button" data-calendar-nav="next" aria-label="Próximo mês">›</button>
    </div>
    <div class="calendar-grid">${cells}</div>
  `;

  const existingLock = appointmentCalendarWrap.querySelector('.calendar-lock');
  existingLock?.remove();

  if (!unlocked) {
    appointmentCalendarWrap.insertAdjacentHTML('beforeend', `
      <div class="calendar-lock">
        <strong>Agenda em calendário no Essencial</strong>
        <p>Visualize compromissos por dia, identifique semanas cheias e organize entregas com clareza.</p>
        <button type="button" class="promo-action" data-upgrade-feature="calendarAgenda">Desbloquear calendário</button>
      </div>
    `);
    appointmentCalendarWrap.querySelector('[data-upgrade-feature="calendarAgenda"]')?.addEventListener('click', () => {
      openUpgradeModal({ featureKey: 'calendarAgenda', reason: 'Veja sua agenda em calendário visual. Fica muito mais fácil planejar a semana.' });
    });
    return;
  }

  appointmentCalendar.querySelector('[data-calendar-nav="prev"]')?.addEventListener('click', () => {
    calendarCursor = new Date(year, month - 1, 1);
    renderAppointmentCalendar();
  });

  appointmentCalendar.querySelector('[data-calendar-nav="next"]')?.addEventListener('click', () => {
    calendarCursor = new Date(year, month + 1, 1);
    renderAppointmentCalendar();
  });

  appointmentCalendar.querySelectorAll('[data-calendar-day]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedCalendarDay = button.dataset.calendarDay;
      renderAppointmentCalendar();
      renderAppointments();
    });
  });
}

function renderClients() {
  clientCount.textContent = String(professionalState.clients.length);
  renderAppointmentClientOptions();

  if (professionalState.clients.length === 0) {
    clientList.innerHTML = '<div class="compact-item"><span>Nenhum cliente salvo ainda.</span></div>';
    return;
  }

  clientList.innerHTML = professionalState.clients.map((client) => {
    const phone = getBrazilWhatsappNumber(client.whatsapp);
    const formattedPhone = formatPhoneBR(client.whatsapp);
    const meta = [
      client.document ? `Doc: ${escapeHtml(client.document)}` : '',
      client.email ? escapeHtml(client.email) : '',
      client.address ? escapeHtml(client.address) : ''
    ].filter(Boolean).join(' · ');
    const timeline = hasFeature('clientTimeline') && client.notes
      ? `<p class="client-timeline">${escapeHtml(client.notes).replace(/\n/g, '<br />')}</p>`
      : '';

    return `
      <article class="compact-item client-card">
        <strong>${escapeHtml(client.name)}</strong>
        <span>${escapeHtml(client.status)}${phone ? ` · ${escapeHtml(formattedPhone)}` : ''}</span>
        ${meta ? `<div class="client-card__meta">${meta}</div>` : ''}
        ${timeline}
        <div class="compact-actions">
          ${phone ? `<button class="whatsapp-action" type="button" data-whatsapp-phone="${phone}" data-client-name="${escapeHtml(client.name)}" data-client-status="${escapeHtml(client.status)}" aria-label="Abrir WhatsApp de ${escapeHtml(client.name)} com mensagem pronta">☎ WhatsApp</button>` : ''}
          <button type="button" data-delete-client="${client.id}">Remover</button>
        </div>
      </article>
    `;
  }).join('');

  refreshBillingState();
}

function renderAppointmentClientOptions() {
  const currentValue = appointmentClientSelect.value;
  const clientOptions = professionalState.clients.map((client) => `
    <option value="${escapeHtml(client.name)}">${escapeHtml(client.name)}</option>
  `).join('');

  appointmentClientSelect.innerHTML = `
    <option value="">Nenhum / Uso Geral</option>
    <option value="__new_client__">+ Cadastrar novo cliente</option>
    ${clientOptions}
  `;

  appointmentClientSelect.value = [...appointmentClientSelect.options].some((option) => option.value === currentValue)
    ? currentValue
    : '';
  syncAppointmentNewClientField();
}

function syncAppointmentNewClientField() {
  const isCreatingClient = appointmentClientSelect.value === '__new_client__';
  const fields = [...appointmentNewClientField.querySelectorAll('input')];
  appointmentNewClientField.hidden = !isCreatingClient;
  fields.forEach((field) => {
    field.required = isCreatingClient;
  });
}

function renderAppointments() {
  let appointments = [...professionalState.appointments].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (selectedCalendarDay && hasFeature('calendarAgenda')) {
    appointments = appointments.filter((appointment) => appointment.date?.slice(0, 10) === selectedCalendarDay);
  }

  if (appointments.length === 0) {
    appointmentList.innerHTML = `<div class="compact-item timeline-empty"><span>${selectedCalendarDay ? 'Nenhum compromisso neste dia.' : 'Nenhum compromisso salvo ainda.'}</span></div>`;
    return;
  }

  appointmentList.innerHTML = appointments.map((appointment) => {
    const date = new Date(appointment.date);
    const time = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
    const day = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short'
    }).format(date).replace('.', '');

    return `
    <article class="compact-item timeline-item">
      <div class="timeline-time">
        <strong>${escapeHtml(time)}</strong>
        <span>${escapeHtml(day)}</span>
      </div>
      <div class="timeline-content">
        <strong>${escapeHtml(appointment.title)}</strong>
        <span>${appointment.client ? escapeHtml(appointment.client) : 'Nenhum / Uso Geral'}</span>
        <small class="reminder-badge">${escapeHtml(getReminderLabel(appointment.reminderMinutes))}</small>
        <div class="compact-actions">
          <button type="button" data-delete-appointment="${appointment.id}">Concluir</button>
        </div>
      </div>
    </article>
  `;
  }).join('');
}

function updateClientActionState() {
  const data = getFormData(clientForm);
  const isReady = Boolean(data.clientName?.trim());
  setActionState(saveClientButton, isReady, '+ Salvar cliente', 'Preencha o nome para salvar');
}

function updateAppointmentActionState() {
  const data = getFormData(appointmentForm);
  const isCreatingClient = data.appointmentClient === '__new_client__';
  const hasNewClientName = Boolean(data.appointmentNewClient?.trim());
  const hasNewClientPhone = sanitizePhone(data.appointmentNewClientPhone || '').length >= 10;
  const isReady = Boolean(data.appointmentTitle?.trim() && data.appointmentDate && (!isCreatingClient || (hasNewClientName && hasNewClientPhone)));
  const waitingText = isCreatingClient && (!hasNewClientName || !hasNewClientPhone)
    ? 'Digite nome e telefone do cliente'
    : 'Preencha compromisso e data';

  setActionState(saveAppointmentButton, isReady, '+ Adicionar compromisso', waitingText);
}

function getFilteredResources() {
  const normalizedQuery = normalize(query);

  return resources.filter((resource) => {
    const matchesCategory = activeCategory === 'todos' || resource.category === activeCategory;
    const searchable = normalize([
      resource.name,
      resource.categoryLabel,
      resource.description,
      ...resource.tags
    ].join(' '));

    return matchesCategory && searchable.includes(normalizedQuery);
  });
}

function renderResources() {
  const filtered = getFilteredResources();
  const groupedResources = filtered.reduce((groups, resource) => {
    if (!groups.has(resource.category)) {
      groups.set(resource.category, {
        label: resource.categoryLabel,
        items: []
      });
    }

    groups.get(resource.category).items.push(resource);
    return groups;
  }, new Map());
  resultCount.textContent = String(filtered.length);
  emptyState.hidden = filtered.length > 0;
  grid.classList.toggle('list-view', resourceView === 'list');
  resourceViewButtons.forEach((button) => {
    const isActive = button.dataset.resourceView === resourceView;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  const renderResourceCard = (resource) => `
    <article class="resource-card">
      <div class="resource-card__topline">
        <span>${resource.categoryLabel}</span>
      </div>
      <h3>${resource.name}</h3>
      <p>${resource.description}</p>
      <div class="tag-list">
        ${resource.tags.map((tag) => `<span>${tag}</span>`).join('')}
      </div>
      <a href="${resource.url}" target="_blank" rel="noopener noreferrer">Acessar recurso</a>
    </article>
  `;

  grid.innerHTML = [...groupedResources.entries()].map(([category, group], index) => `
    <details class="resource-category-section" data-resource-category="${category}" ${index === 0 ? 'open' : ''}>
      <summary class="resource-category-divider">
        <span>${group.label}</span>
        <small>${group.items.length} recursos</small>
      </summary>
      <div class="resource-category-items">
        ${[...group.items]
          .sort((firstResource, secondResource) => firstResource.name.localeCompare(secondResource.name, 'pt-BR'))
          .map(renderResourceCard)
          .join('')}
      </div>
    </details>
  `).join('');

  const gridRemainder = filtered.length % 3;

  if (filtered.length > 0 && gridRemainder !== 0) {
    grid.insertAdjacentHTML('beforeend', `
      <article class="resource-card suggest-card">
        <div class="resource-card__topline">
          <span>Comunidade</span>
        </div>
        <h3>Falta algo aqui?</h3>
        <p>Indique um recurso gratuito e confiável para a próxima rodada de validação. Ex: nota fiscal, compressor de fotos, contrato simples.</p>
        <a href="mailto:sugestoes@resolvajato.local?subject=Sugestão de recurso gratuito">Sugerir recurso</a>
      </article>
    `);
  }
}

function setResourceView(view) {
  resourceView = view === 'list' ? 'list' : 'grid';
  localStorage.setItem(resourceViewStorageKey, resourceView);
  renderResources();
}

function focusCurrentViewHeading() {
  const heading = document.querySelector(viewHeadings[currentView]);
  if (!heading) return;

  if (!heading.hasAttribute('tabindex')) {
    heading.setAttribute('tabindex', '-1');
  }

  requestAnimationFrame(() => {
    heading.focus({ preventScroll: true });
  });
}

function setView(view, options = {}) {
  const { updateHistory = true, focusHeading = true } = options;
  const shouldRequireLogin = view === 'profissional' && !getSession()?.token;
  currentView = shouldRequireLogin ? 'login' : view;
  viewScreens.forEach((screen) => {
    screen.hidden = screen.dataset.view !== currentView;
  });
  if (currentView === 'home') {
    renderResources();
  } else if (currentView === 'login' && shouldRequireLogin) {
    setAccessMode('login');
  } else if (currentView === 'profissional') {
    scheduleTabScrollUpdate();
    renderProfessionalPlanBar();
    refreshBillingState();
  }
  document.body.dataset.view = currentView;
  const hash = viewHashes[currentView] || '#top';
  if (updateHistory && window.location.hash !== hash) {
    history.pushState({ view: currentView }, '', hash);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (focusHeading) {
    focusCurrentViewHeading();
  }
}

function setAccessMode(mode) {
  if (!accessForm || !accessNameField || !accessSubmitButton || !accessToggleModeButton) return;

  const isRegister = mode === 'register';
  accessForm.dataset.mode = isRegister ? 'register' : 'login';
  accessNameField.hidden = !isRegister;
  accessNameField.querySelector('input').required = isRegister;
  accessSubmitButton.textContent = isRegister ? 'Criar conta e entrar' : 'Entrar no painel';
  accessToggleModeButton.textContent = isRegister ? 'Já tenho conta. Entrar' : 'Não tenho conta. Criar conta grátis';
  if (accessFeedback) accessFeedback.textContent = '';
}

async function restoreAccountState() {
  const payload = await pullCloudData().catch(() => null);

  if (payload?.planId) {
    setCurrentPlanId(payload.planId);
  }

  if (payload?.usage || payload?.data?.usage) {
    applyRemoteUsageState(payload.usage || payload.data.usage);
  }

  window.dispatchEvent(new CustomEvent('resolvajato:cloud-pull', { detail: payload || {} }));
}

async function handleAccessSubmit(event) {
  event.preventDefault();

  const mode = accessForm.dataset.mode || 'login';
  const data = Object.fromEntries(new FormData(accessForm).entries());

  if (accessFeedback) accessFeedback.textContent = mode === 'register' ? 'Criando conta...' : 'Entrando...';
  accessSubmitButton.disabled = true;

  try {
    const payload = mode === 'register'
      ? await registerAccount({ name: data.name, email: data.email, password: data.password, planId: getCurrentPlanId() })
      : await loginAccount({ email: data.email, password: data.password });

    if (payload?.planId) {
      setCurrentPlanId(payload.planId);
    }

    await restoreAccountState();
    accessForm.reset();
    setAccessMode('login');
    showToast('Acesso liberado. Bem-vindo ao painel profissional.');
    setView('profissional');
  } catch (error) {
    if (accessFeedback) accessFeedback.textContent = error.message || 'Não foi possível entrar.';
  } finally {
    accessSubmitButton.disabled = false;
  }
}

function setTab(tab) {
  currentTab = tab;
  syncToolNumbers();
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tabTarget === currentTab;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });
  tabPanels.forEach((panel) => {
    const isActive = panel.dataset.tabPanel === currentTab;
    panel.classList.toggle('active', isActive);
    panel.hidden = !isActive;
  });
  updateTabScrollButtons();
}

function syncToolNumbers() {
  tabButtons.forEach((button, index) => {
    const panel = document.querySelector(`[data-tab-panel="${button.dataset.tabTarget}"]`);
    const numberBadge = panel?.querySelector('.tool-panel__head > span');
    if (numberBadge) {
      numberBadge.textContent = String(index + 1).padStart(2, '0');
    }
  });
}

function updateTabScrollButtons() {
  const maxScroll = tabList.scrollWidth - tabList.clientWidth;
  const canScroll = maxScroll > 4;

  tabScrollButtons.forEach((button) => {
    const direction = button.dataset.tabScroll;
    const shouldHide = !canScroll
      || (direction === 'left' && tabList.scrollLeft <= 4)
      || (direction === 'right' && tabList.scrollLeft >= maxScroll - 4);

    button.hidden = shouldHide;
  });
}

function scheduleTabScrollUpdate() {
  requestAnimationFrame(() => {
    updateTabScrollButtons();
    setTimeout(updateTabScrollButtons, 80);
  });
}

function initHeroMessages() {
  const messages = [...document.querySelectorAll('[data-hero-message]')];
  if (messages.length < 2) return;

  const motions = ['rise', 'slide', 'zoom', 'tilt'];
  let activeMessage = 0;

  messages.forEach((message, index) => {
    message.dataset.motion = motions[index % motions.length];
    message.setAttribute('aria-hidden', String(index !== activeMessage));
  });

  setInterval(() => {
    const previousMessage = messages[activeMessage];
    activeMessage = (activeMessage + 1) % messages.length;
    const nextMessage = messages[activeMessage];

    previousMessage.classList.remove('is-active');
    previousMessage.classList.add('is-leaving');
    previousMessage.setAttribute('aria-hidden', 'true');
    nextMessage.classList.remove('is-leaving');
    nextMessage.classList.add('is-active');
    nextMessage.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      previousMessage.classList.remove('is-leaving');
    }, 900);
  }, 8200);
}

function initPromoShowcase() {
  const slides = [...document.querySelectorAll('[data-promo-slide]')];
  const dots = [...document.querySelectorAll('[data-promo-dot]')];
  const resourcesTotal = document.querySelector('#promo-stat-resources');
  const categoriesTotal = document.querySelector('#promo-stat-categories');
  const aiTotal = document.querySelector('#promo-stat-ai');
  const scrollButton = document.querySelector('[data-promo-scroll="search"]');

  if (!slides.length) return;

  const categoryCount = new Set(resources.map((resource) => resource.category)).size;
  const aiCount = resources.filter((resource) => resource.category === 'inteligencia-artificial').length;

  if (resourcesTotal) resourcesTotal.textContent = String(resources.length);
  if (categoriesTotal) categoriesTotal.textContent = String(categoryCount);
  if (aiTotal) aiTotal.textContent = String(aiCount);

  let activeSlide = 0;
  let promoTimer;

  const showSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  };

  const restartPromoTimer = () => {
    clearInterval(promoTimer);
    promoTimer = setInterval(() => {
      showSlide(activeSlide + 1);
    }, 5200);
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.promoDot));
      restartPromoTimer();
    });
  });

  scrollButton?.addEventListener('click', () => {
    searchInput?.focus();
    searchInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  showSlide(0);
  restartPromoTimer();
}

tabScrollButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const direction = button.dataset.tabScroll === 'left' ? -1 : 1;
    tabList.scrollBy({ left: direction * 150, behavior: 'smooth' });
  });
});

tabList.addEventListener('scroll', updateTabScrollButtons);
window.addEventListener('resize', updateTabScrollButtons);

viewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setView(button.dataset.viewTarget);
  });
});

window.addEventListener('popstate', () => {
  setView(getViewFromHash(), { updateHistory: false });
});

accessToggleModeButton?.addEventListener('click', () => {
  setAccessMode(accessForm.dataset.mode === 'register' ? 'login' : 'register');
});

accessForm?.addEventListener('submit', handleAccessSubmit);

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setTab(button.dataset.tabTarget);
  });
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    searchInput.placeholder = searchPlaceholders[activeCategory];
    renderResources();
  });
});

resourceViewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setResourceView(button.dataset.resourceView);
  });
});

grid.addEventListener('toggle', (event) => {
  const openedSection = event.target.closest('.resource-category-section');
  if (!openedSection?.open) return;

  grid.querySelectorAll('.resource-category-section[open]').forEach((section) => {
    if (section !== openedSection) {
      section.open = false;
    }
  });

  requestAnimationFrame(() => {
    openedSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
}, true);

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  renderResources();
});

themeToggles.forEach((button) => {
  button.addEventListener('click', toggleTheme);
});

newsletterForm.addEventListener('submit', (event) => {
  event.preventDefault();
  newsletterForm.classList.add('submitted');
  newsletterForm.querySelector('button').textContent = 'Inscrito';
});

proposalForm.addEventListener('input', (event) => {
  if (event.target === proposalValueInput) {
    proposalValueInput.value = formatCurrencyBR(proposalValueInput.value);
  }

  if (event.target === proposalClientWhatsappInput) {
    proposalClientWhatsappInput.value = formatPhoneBR(proposalClientWhatsappInput.value);
  }

  professionalState.proposal = getProposalData();
  saveProfessionalState();
  updateProposalPreview(professionalState.proposal);
});

proposalForm.addEventListener('submit', (event) => {
  event.preventDefault();
  professionalState.proposal = getProposalData();
  saveProfessionalState();
  updateProposalPreview(professionalState.proposal);
});

clearProposalButton.addEventListener('click', () => {
  proposalForm.reset();
  if (proposalLogoInput) proposalLogoInput.value = '';
  if (proposalSignatureInput) proposalSignatureInput.value = '';
  professionalState.proposal = {};
  saveProfessionalState();
  renderProposalPremiumPreviews();
  updateProposalPreview({});
});

downloadProposalButton.addEventListener('click', downloadProposal);
sendProposalEmailButton?.addEventListener('click', sendProposalByEmail);
sendProposalWhatsappButton?.addEventListener('click', sendProposalByWhatsapp);

proposalLogoInput?.addEventListener('change', async (event) => {
  if (!hasFeature('premiumProposals')) {
    openUpgradeModal({ featureKey: 'premiumProposals' });
    event.target.value = '';
    return;
  }

  const file = event.target.files?.[0];
  if (!file) return;

  professionalState.proposal.logoDataUrl = await readFileAsDataUrl(file);
  professionalState.proposal = { ...getProposalData(), logoDataUrl: professionalState.proposal.logoDataUrl };
  saveProfessionalState();
  renderProposalPremiumPreviews();
  updateProposalPreview();
});

proposalSignatureInput?.addEventListener('change', async (event) => {
  if (!hasFeature('premiumProposals')) {
    openUpgradeModal({ featureKey: 'premiumProposals' });
    event.target.value = '';
    return;
  }

  const file = event.target.files?.[0];
  if (!file) return;

  professionalState.proposal.signatureDataUrl = await readFileAsDataUrl(file);
  professionalState.proposal = { ...getProposalData(), signatureDataUrl: professionalState.proposal.signatureDataUrl };
  saveProfessionalState();
  renderProposalPremiumPreviews();
  updateProposalPreview();
});

receiptForm.addEventListener('input', (event) => {
  if (event.target === receiptValueInput) {
    receiptValueInput.value = formatCurrencyBR(receiptValueInput.value);
  }

  if (event.target === receiptContactInput) {
    const rules = getReceiptContactRules();
    receiptContactInput.value = rules.mask(receiptContactInput.value);
    validateReceiptContact();
  }

  updateReceiptPreview();
});

receiptContactType.addEventListener('change', () => {
  updateReceiptContactField({ clearValue: true });
  updateReceiptPreview();
  receiptContactInput.focus();
});

downloadReceiptButton.addEventListener('click', downloadReceipt);

workOrderForm.addEventListener('input', () => {
  updateWorkOrderPreview();
});

downloadWorkOrderButton.addEventListener('click', downloadWorkOrder);

checklistForm.addEventListener('input', () => {
  updateChecklistPreview();
});

downloadChecklistButton.addEventListener('click', downloadChecklist);

pricingForm.addEventListener('input', (event) => {
  if (event.target === pricingIncomeInput || event.target === pricingCostsInput) {
    event.target.value = formatCurrencyBR(event.target.value);
  }

  updatePricingPreview();
});

copyPricingSummaryButton.addEventListener('click', copyPricingSummary);

pixForm.addEventListener('input', (event) => {
  if (event.target === pixKeyInput) {
    const rules = getPixKeyRules();
    pixKeyInput.value = rules.mask(pixKeyInput.value);
    validatePixKey();
  }

  if (event.target === pixValueInput) {
    pixValueInput.value = formatCurrencyBR(pixValueInput.value);
  }

  if (event.target === pixWhatsappInput) {
    pixWhatsappInput.value = formatPhoneBR(pixWhatsappInput.value);
  }

  updatePixPreview();
});

pixKeyType.addEventListener('change', () => {
  updatePixKeyField({ clearValue: true });
  updatePixPreview();
  pixKeyInput.focus();
});

copyPixCodeButton.addEventListener('click', () => {
  copyPixCode();
});

pixPreviewCard.addEventListener('click', (event) => {
  if (!event.target.closest('.pix-copy-block')) return;
  copyPixFromPreview();
});

sendPixWhatsappButton.addEventListener('click', sendPixByWhatsapp);

warrantyForm.addEventListener('input', () => {
  updateWarrantyPreview();
});

downloadWarrantyButton.addEventListener('click', downloadWarranty);

budgetForm.addEventListener('input', (event) => {
  if (event.target === budgetValueInput) {
    budgetValueInput.value = formatCurrencyBR(budgetValueInput.value);
  }

  updateBudgetPreview();
});

downloadBudgetButton.addEventListener('click', downloadBudget);

contractForm.addEventListener('input', (event) => {
  if (event.target === contractValueInput) {
    contractValueInput.value = formatCurrencyBR(contractValueInput.value);
  }

  updateContractPreview();
});

downloadContractButton.addEventListener('click', downloadContract);

clientWhatsappInput.addEventListener('input', () => {
  clientWhatsappInput.value = formatPhoneBR(clientWhatsappInput.value);
});

clientForm.addEventListener('input', updateClientActionState);

clientForm.addEventListener('submit', (event) => {
  event.preventDefault();
  updateClientActionState();
  if (saveClientButton.disabled) return;

  const clientCheck = canCreateClient(professionalState.clients.length);
  if (!clientCheck.allowed) {
    handleUsageBlock(clientCheck);
    return;
  }

  const data = Object.fromEntries(new FormData(clientForm).entries());

  professionalState.clients.unshift({
    id: crypto.randomUUID(),
    name: data.clientName.trim(),
    whatsapp: formatPhoneBR(data.clientWhatsapp),
    status: data.clientStatus,
    document: hasFeature('clientProfileFull') ? data.clientDocument?.trim() || '' : '',
    email: hasFeature('clientProfileFull') ? data.clientEmail?.trim() || '' : '',
    address: hasFeature('clientProfileFull') ? data.clientAddress?.trim() || '' : '',
    notes: hasFeature('clientProfileFull') ? data.clientNotes?.trim() || '' : ''
  });
  trackUsage('client');

  clientForm.reset();
  saveProfessionalState();
  renderClients();
  updateClientActionState();
});

clientList.addEventListener('click', (event) => {
  const whatsappButton = event.target.closest('[data-whatsapp-phone]');
  if (whatsappButton) {
    const whatsappUrl = buildWhatsappUrl(
      whatsappButton.dataset.whatsappPhone,
      whatsappButton.dataset.clientName,
      whatsappButton.dataset.clientStatus
    );
    openInNewTab(whatsappUrl);

    return;
  }

  const deleteButton = event.target.closest('[data-delete-client]');
  if (!deleteButton) return;

  professionalState.clients = professionalState.clients.filter((client) => client.id !== deleteButton.dataset.deleteClient);
  saveProfessionalState();
  renderClients();
});

appointmentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  updateAppointmentActionState();
  appointmentForm.classList.toggle('was-submitted', saveAppointmentButton.disabled);
  if (saveAppointmentButton.disabled) return;

  const appointmentCheck = canCreateAppointment();
  if (!appointmentCheck.allowed) {
    handleUsageBlock(appointmentCheck);
    return;
  }

  const data = Object.fromEntries(new FormData(appointmentForm).entries());
  const newClientName = data.appointmentNewClient?.trim() || '';
  const newClientPhone = formatPhoneBR(data.appointmentNewClientPhone || '');
  const isCreatingClient = data.appointmentClient === '__new_client__';
  const appointmentClient = isCreatingClient ? newClientName : data.appointmentClient;

  if (isCreatingClient) {
    const existingClient = professionalState.clients.find((client) => normalize(client.name) === normalize(newClientName));

    if (existingClient) {
      existingClient.whatsapp = existingClient.whatsapp || newClientPhone;
    } else {
      const clientCheck = canCreateClient(professionalState.clients.length);
      if (!clientCheck.allowed) {
        handleUsageBlock(clientCheck);
        return;
      }

      professionalState.clients.unshift({
        id: crypto.randomUUID(),
        name: newClientName,
        whatsapp: newClientPhone,
        status: 'Lead'
      });
      trackUsage('client');
    }
  }

  const appointment = {
    id: crypto.randomUUID(),
    title: data.appointmentTitle,
    date: data.appointmentDate,
    client: appointmentClient,
    reminderMinutes: data.appointmentReminder
  };

  professionalState.appointments.push(appointment);
  trackUsage('appointment');

  if (appointment.reminderMinutes !== 'none') {
    await ensureNotificationPermission();
    scheduleAppointmentReminder(appointment);
  }

  appointmentForm.reset();
  appointmentForm.classList.remove('was-submitted');
  saveProfessionalState();
  renderClients();
  renderAppointments();
  updateAppointmentActionState();
});

appointmentForm.addEventListener('input', () => {
  const newClientPhoneInput = appointmentForm.elements.appointmentNewClientPhone;
  if (document.activeElement === newClientPhoneInput) {
    newClientPhoneInput.value = formatPhoneBR(newClientPhoneInput.value);
  }

  updateAppointmentActionState();
  if (!saveAppointmentButton.disabled) {
    appointmentForm.classList.remove('was-submitted');
  }
});

appointmentClientSelect.addEventListener('change', () => {
  syncAppointmentNewClientField();
  updateAppointmentActionState();
});

appointmentList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('[data-delete-appointment]');
  if (!deleteButton) return;

  clearAppointmentReminder(deleteButton.dataset.deleteAppointment);
  professionalState.appointments = professionalState.appointments.filter((appointment) => appointment.id !== deleteButton.dataset.deleteAppointment);
  saveProfessionalState();
  renderAppointments();
});

fillProposalForm();
applyTheme(localStorage.getItem(themeStorageKey) || 'light');
updateReceiptContactField();
updateProposalPreview(professionalState.proposal);
updateReceiptPreview();
updateWorkOrderPreview();
updateChecklistPreview();
updatePricingPreview();
updatePixKeyField();
updatePixPreview();
updateWarrantyPreview();
updateBudgetPreview();
updateContractPreview();
updateClientActionState();
updateAppointmentActionState();
setAccessMode('login');
renderClients();
renderAppointments();
scheduleAllAppointmentReminders();
renderResources();
initHeroMessages();
initPromoShowcase();
setTab(currentTab);
setView(currentView, { updateHistory: false, focusHeading: false });
scheduleTabScrollUpdate();

initPlansUi({
  onPlanChanged: () => {
    refreshBillingState();
    renderClients();
    renderAppointments();
  }
});

window.addEventListener('resolvajato:navigate', (event) => {
  if (event.detail?.view) setView(event.detail.view);
});

window.addEventListener('resolvajato:cloud-pull', (event) => {
  const payload = event.detail;
  if (payload?.usage || payload?.data?.usage) {
    applyRemoteUsageState(payload.usage || payload.data.usage);
    refreshBillingState();
  }

  if (!hasFeature('cloudSync') || !payload?.data?.professional) return;

  professionalState.proposal = payload.data.professional.proposal || {};
  professionalState.clients = payload.data.professional.clients || [];
  professionalState.appointments = payload.data.professional.appointments || [];
  saveProfessionalState({ skipCloudPush: true });
  fillProposalForm();
  updateProposalPreview(professionalState.proposal);
  renderClients();
  renderAppointments();
  scheduleAllAppointmentReminders();
});

window.addEventListener('resolvajato:export-backup', () => {
  exportLocalBackup({
    professional: professionalState,
    usage: getUsageState(),
    planId: getCurrentPlanId(),
    exportedAt: new Date().toISOString()
  });
});

window.addEventListener('resolvajato:import-backup', (event) => {
  const data = event.detail;
  if (!data?.professional) return;

  if (data.usage) {
    applyRemoteUsageState(data.usage);
  }

  professionalState.proposal = data.professional.proposal || {};
  professionalState.clients = data.professional.clients || [];
  professionalState.appointments = data.professional.appointments || [];
  saveProfessionalState();
  fillProposalForm();
  updateProposalPreview(professionalState.proposal);
  renderClients();
  renderAppointments();
  scheduleAllAppointmentReminders();
});
