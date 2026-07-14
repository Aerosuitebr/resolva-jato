export const PLANS = {
  gratis: {
    id: 'gratis',
    name: 'Grátis',
    tagline: 'Comece a resolver hoje',
    price: 0,
    priceLabel: 'R$ 0',
    period: 'para sempre',
    highlight: false,
    limits: {
      clients: 5,
      appointmentsMonth: 10,
      documentsMonth: 8
    },
    tools: ['proposta', 'recibo', 'pix'],
    features: {
      calendarAgenda: false,
      clientProfileFull: false,
      cloudSync: false,
      exportBackup: false,
      premiumLayouts: false,
      clientTimeline: false,
      advancedReminders: false,
      priorityCatalog: false,
      businessDashboard: false,
      premiumProposals: false
    },
    benefits: [
      '3 ferramentas profissionais essenciais',
      'Até 5 clientes salvos só neste navegador',
      'Agenda em lista com 10 compromissos/mês',
      '8 downloads de documentos por mês',
      'Catálogo completo de links gratuitos',
      'Dados podem ser perdidos ao limpar histórico'
    ]
  },
  essencial: {
    id: 'essencial',
    name: 'Essencial',
    tagline: 'Seus dados salvos, trabalho organizado',
    price: 14.9,
    priceLabel: 'R$ 14,90',
    period: '/mês',
    highlight: true,
    limits: {
      clients: 40,
      appointmentsMonth: 60,
      documentsMonth: 40
    },
    tools: 'all',
    features: {
      calendarAgenda: true,
      clientProfileFull: true,
      cloudSync: true,
      exportBackup: true,
      premiumLayouts: true,
      clientTimeline: false,
      advancedReminders: true,
      priorityCatalog: false,
      businessDashboard: false,
      premiumProposals: false
    },
    benefits: [
      'Todas as 11 ferramentas profissionais',
      'Conta na nuvem com dados seguros ao limpar o navegador',
      'Agenda em calendário visual',
      'Cadastro completo de clientes (CPF, e-mail, endereço)',
      'Layouts premium e backup exportável',
      'Até 40 clientes e 60 compromissos/mês'
    ]
  },
  completo: {
    id: 'completo',
    name: 'Completo',
    tagline: 'Propostas que impressionam, negócio que escala',
    price: 29.9,
    priceLabel: 'R$ 29,90',
    period: '/mês',
    highlight: false,
    limits: {
      clients: Infinity,
      appointmentsMonth: Infinity,
      documentsMonth: Infinity
    },
    tools: 'all',
    features: {
      calendarAgenda: true,
      clientProfileFull: true,
      cloudSync: true,
      exportBackup: true,
      premiumLayouts: true,
      clientTimeline: true,
      advancedReminders: true,
      priorityCatalog: true,
      businessDashboard: true,
      premiumProposals: true
    },
    benefits: [
      'Propostas de alto padrão com logo, assinatura e envio por e-mail ou WhatsApp',
      'Tudo do Essencial, sem limites de uso',
      'Painel de métricas do seu negócio',
      'Histórico e linha do tempo por cliente',
      'Catálogo premium curado',
      'Suporte prioritário na plataforma'
    ]
  }
};

export const PLAN_ORDER = ['gratis', 'essencial', 'completo'];

export const FEATURE_LABELS = {
  calendarAgenda: 'Agenda em calendário',
  clientProfileFull: 'Cadastro completo de clientes',
  cloudSync: 'Nuvem e dados protegidos',
  exportBackup: 'Backup exportável',
  premiumLayouts: 'Layouts premium de documentos',
  clientTimeline: 'Histórico por cliente',
  advancedReminders: 'Lembretes avançados',
  priorityCatalog: 'Catálogo premium curado',
  businessDashboard: 'Painel de métricas',
  premiumProposals: 'Propostas comerciais de alto padrão'
};

export function getPlan(planId) {
  return PLANS[planId] || PLANS.gratis;
}

export function planIncludesTool(plan, toolId) {
  if (plan.tools === 'all') return true;
  return plan.tools.includes(toolId);
}
