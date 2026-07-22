export type PlanId = 'gratis' | 'premium';

export type PlanBenefitIcon =
  | 'search'
  | 'user'
  | 'gift'
  | 'tools'
  | 'test'
  | 'infinity'
  | 'zap'
  | 'sparkles'
  | 'calendar'
  | 'layout';

export interface PlanBenefit {
  icon: PlanBenefitIcon;
  title: string;
  text: string;
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  price: number;
  priceLabel: string;
  period: string;
  highlight: boolean;
  toolUsesLimit: number | null;
  benefits: PlanBenefit[];
}

export const PLANS: Record<PlanId, Plan> = {
  gratis: {
    id: 'gratis',
    name: 'Grátis',
    tagline: 'Comece sem pagar nada',
    price: 0,
    priceLabel: 'R$ 0',
    period: 'para sempre',
    highlight: false,
    toolUsesLimit: 5,
    benefits: [
      { icon: 'search', title: 'Busca ilimitada', text: 'Links úteis sempre grátis' },
      { icon: 'user', title: 'Conta gratuita', text: 'E-mail e senha em segundos' },
      { icon: 'gift', title: 'Ferramentas grátis', text: 'Teste sem custo para começar' },
      { icon: 'tools', title: 'Todas as ferramentas', text: 'Currículos, contratos, Pix e mais' },
      { icon: 'test', title: 'Sem cartão', text: 'Ideal para experimentar primeiro' }
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    tagline: 'Documentos limpos e uso ilimitado',
    price: 4.99,
    priceLabel: 'R$ 4,99',
    period: '/mês',
    highlight: true,
    toolUsesLimit: null,
    benefits: [
      { icon: 'sparkles', title: 'Sem marca Resolva Jato', text: 'PDF, WhatsApp e e-mail sem referências' },
      { icon: 'infinity', title: 'Uso ilimitado', text: 'Salve e baixe sem interrupção' },
      { icon: 'zap', title: '30 dias completos', text: 'Vigência clara na sua conta' },
      { icon: 'calendar', title: 'Agenda', text: 'Calendário e alertas' },
      { icon: 'layout', title: 'Layouts profissionais', text: 'Documentos com cara de escritório' },
      { icon: 'gift', title: 'Novidades primeiro', text: 'Prioridade em novos recursos' }
    ]
  }
};

export const PLAN_ORDER: PlanId[] = ['gratis', 'premium'];

export function getPlan(planId?: string | null): Plan {
  return PLANS[planId as PlanId] ?? PLANS.gratis;
}
