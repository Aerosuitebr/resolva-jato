import {
  BookOpen,
  Briefcase,
  Calculator,
  CalendarDays,
  ClipboardList,
  FileText,
  Gavel,
  GraduationCap,
  Receipt,
  Scale,
  Sparkles,
  Users,
  Wallet
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ToolCategoryId = 'juridico' | 'contabeis' | 'negocios' | 'carreira' | 'organizacao';

export interface ToolCategory {
  id: ToolCategoryId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  accentBar: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  /** Texto curto padronizado (~1 linha) para cards da hub. */
  description: string;
  /** Ajuda contextual (tooltip / leitor de tela). */
  tip?: string;
  href: string;
  icon: LucideIcon;
  categoryId: ToolCategoryId;
  actionLabel: string;
  keywords: string[];
  premiumOnly?: boolean;
  status: 'available' | 'beta' | 'soon';
}

export const toolCategories: ToolCategory[] = [
  {
    id: 'juridico',
    label: 'Advogados e jurídico',
    shortLabel: 'Jurídico',
    description: 'Peças e contratos do dia a dia do escritório.',
    icon: Gavel,
    iconClass: 'bg-amber-100 text-amber-900',
    accentBar: 'bg-amber-400'
  },
  {
    id: 'contabeis',
    label: 'Contadores e despachantes',
    shortLabel: 'Contabilidade',
    description: 'Documentos dinâmicos para rotina contábil, fiscal e de despacho.',
    icon: Calculator,
    iconClass: 'bg-cyan-100 text-cyan-900',
    accentBar: 'bg-cyan-500'
  },
  {
    id: 'negocios',
    label: 'Autônomos e negócios',
    shortLabel: 'Negócios',
    description: 'Orçamentos, cobrança, propostas e recibos.',
    icon: Briefcase,
    iconClass: 'bg-sky-100 text-sky-800',
    accentBar: 'bg-sky-500'
  },
  {
    id: 'carreira',
    label: 'Estudantes e carreira',
    shortLabel: 'Estudantes',
    description: 'Currículos e capas no padrão acadêmico.',
    icon: GraduationCap,
    iconClass: 'bg-teal-100 text-teal-800',
    accentBar: 'bg-teal-500'
  },
  {
    id: 'organizacao',
    label: 'Organização',
    shortLabel: 'Organização',
    description: 'Agenda e rotina para não perder prazo.',
    icon: Users,
    iconClass: 'bg-emerald-100 text-emerald-800',
    accentBar: 'bg-emerald-500'
  }
];

export const toolsCatalog: ToolDefinition[] = [
  {
    id: 'juridicos',
    name: 'Documentos Jurídicos',
    description: 'Procuração, honorários, notificação e peças do dia a dia em PDF.',
    tip: 'Substabelecimento: transferência de poderes de uma procuração a outro advogado.',
    href: '/ferramentas/juridicos',
    icon: Gavel,
    categoryId: 'juridico',
    actionLabel: 'Criar documento',
    keywords: ['procuração', 'honorários', 'substabelecimento', 'hipossuficiência', 'notificação', 'advogado', 'oab'],
    status: 'available'
  },
  {
    id: 'contratos',
    name: 'Contratos',
    description: 'Aluguel, serviços, trabalho, compra e venda ou comodato em PDF.',
    tip: 'Comodato: empréstimo gratuito de um bem, com devolução combinada.',
    href: '/ferramentas/contratos',
    icon: Scale,
    categoryId: 'juridico',
    actionLabel: 'Montar contrato',
    keywords: ['aluguel', 'locação', 'serviços', 'trabalho', 'compra', 'venda', 'comodato', 'contrato'],
    status: 'available'
  },
  {
    id: 'contabeis',
    name: 'Docs Contábeis e Despacho',
    description: 'Procuração, e-CAC, residência e cartas para rotina fiscal.',
    tip: 'e-CAC: portal da Receita Federal para serviços digitais do contribuinte.',
    href: '/ferramentas/contabeis',
    icon: Calculator,
    categoryId: 'contabeis',
    actionLabel: 'Criar documento',
    keywords: ['contábil', 'despachante', 'e-cac', 'residência', 'responsabilidade', 'fiscal'],
    status: 'available'
  },
  {
    id: 'recibos',
    name: 'Recibos',
    description: 'Recibos simples ou personalizados, prontos para enviar ou imprimir.',
    href: '/ferramentas/recibos',
    icon: Receipt,
    categoryId: 'contabeis',
    actionLabel: 'Gerar recibo',
    keywords: ['recibo', 'pagamento', 'universitário', 'quitação'],
    status: 'beta'
  },
  {
    id: 'orcamentos',
    name: 'Orçamentos',
    description: 'Orçamento com link para o cliente aprovar ou pedir ajuste.',
    href: '/ferramentas/orcamentos',
    icon: ClipboardList,
    categoryId: 'negocios',
    actionLabel: 'Criar orçamento',
    keywords: ['orçamento', 'aprovação', 'cliente', 'proposta de valor'],
    status: 'available'
  },
  {
    id: 'pix',
    name: 'Cobrança Pix',
    description: 'QR Code e Pix Copia e Cola no navegador, sem taxa de API.',
    href: '/ferramentas/pix',
    icon: Wallet,
    categoryId: 'negocios',
    actionLabel: 'Gerar cobrança Pix',
    keywords: ['pix', 'qr code', 'cobrança', 'pagamento', 'copia e cola'],
    status: 'available'
  },
  {
    id: 'propostas',
    name: 'Propostas Comerciais',
    description: 'Proposta com identidade visual, envio e histórico organizado.',
    href: '/ferramentas/propostas',
    icon: FileText,
    categoryId: 'negocios',
    actionLabel: 'Criar proposta',
    keywords: ['proposta', 'comercial', 'venda', 'agência'],
    status: 'available'
  },
  {
    id: 'curriculo',
    name: 'Currículos',
    description: 'Currículo universitário ou profissional, pronto em poucos minutos.',
    href: '/ferramentas/curriculo',
    icon: GraduationCap,
    categoryId: 'carreira',
    actionLabel: 'Montar currículo',
    keywords: ['currículo', 'cv', 'emprego', 'vaga'],
    status: 'available'
  },
  {
    id: 'curriculo-lattes',
    name: 'Lattes Inteligente',
    description: 'Trajetória acadêmica organizada, com revisão e PDF para editais.',
    tip: 'Não envia dados à Plataforma Lattes oficial — organiza o seu currículo acadêmico.',
    href: '/ferramentas/curriculo-lattes',
    icon: GraduationCap,
    categoryId: 'carreira',
    actionLabel: 'Criar currículo acadêmico',
    keywords: ['lattes', 'cnpq', 'acadêmico', 'pesquisa', 'orcid', 'doi', 'publicações'],
    status: 'beta'
  },
  {
    id: 'trabalhos',
    name: 'Capas de Trabalho',
    description: 'Capas escolares e universitárias no padrão ABNT para imprimir.',
    tip: 'ABNT: normas técnicas brasileiras para trabalhos acadêmicos.',
    href: '/ferramentas/trabalhos',
    icon: BookOpen,
    categoryId: 'carreira',
    actionLabel: 'Gerar capa',
    keywords: ['capa', 'abnt', 'trabalho', 'escola', 'faculdade', 'folha de rosto'],
    status: 'available'
  },
  {
    id: 'agenda',
    name: 'Agenda Premium',
    description: 'Compromissos, lembretes e visão semanal dos seus prazos.',
    href: '/ferramentas/agenda',
    icon: CalendarDays,
    categoryId: 'organizacao',
    actionLabel: 'Abrir agenda',
    keywords: ['agenda', 'calendário', 'compromisso', 'lembrete', 'prazo'],
    premiumOnly: true,
    status: 'beta'
  }
];

/** Atalhos do wizard inicial (“O que você precisa?”). */
export const toolIntentOptions: Array<{
  id: string;
  label: string;
  hint: string;
  toolId: string;
}> = [
  { id: 'contrato', label: 'Contrato', hint: 'Aluguel, serviços, comodato…', toolId: 'contratos' },
  { id: 'recibo', label: 'Recibo', hint: 'Comprovar um pagamento', toolId: 'recibos' },
  { id: 'curriculo', label: 'Currículo', hint: 'CV ou Lattes', toolId: 'curriculo' },
  { id: 'orcamento', label: 'Orçamento', hint: 'Enviar valor ao cliente', toolId: 'orcamentos' },
  { id: 'pix', label: 'Cobrar no Pix', hint: 'QR Code na hora', toolId: 'pix' },
  { id: 'juridico', label: 'Doc. jurídico', hint: 'Procuração e afins', toolId: 'juridicos' }
];

export function getToolsByCategory(categoryId: ToolCategoryId) {
  return toolsCatalog.filter((tool) => tool.categoryId === categoryId);
}

export function getToolCategory(categoryId: ToolCategoryId) {
  return toolCategories.find((item) => item.id === categoryId) ?? toolCategories[0];
}

export function getToolById(toolId: string) {
  return toolsCatalog.find((tool) => tool.id === toolId) ?? null;
}

export function searchTools(query: string): ToolDefinition[] {
  const normalized = query.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!normalized) return toolsCatalog;

  return toolsCatalog.filter((tool) => {
    const category = getToolCategory(tool.categoryId);
    const haystack = [
      tool.name,
      tool.description,
      tool.actionLabel,
      category.label,
      category.shortLabel,
      ...tool.keywords
    ]
      .join(' ')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return haystack.includes(normalized) || normalized.split(/\s+/).every((token) => haystack.includes(token));
  });
}

export const valueHighlights = [
  {
    title: 'Busca sempre gratuita',
    description: 'Explore centenas de links úteis sem cadastro, sem limite e sem custo.',
    icon: Sparkles
  },
  {
    title: 'Ferramentas que resolvem',
    description: 'Orçamentos, Pix, documentos e agenda para a rotina de quem trabalha por conta.',
    icon: FileText
  },
  {
    title: 'Comece com 5 usos grátis',
    description: 'Cadastre-se com e-mail e teste as ferramentas antes de decidir assinar.',
    icon: GraduationCap
  },
  {
    title: 'Premium por R$ 4,99/mês',
    description: 'Quando fizer sentido, desbloqueie uso ilimitado e recursos avançados.',
    icon: CalendarDays
  }
];
