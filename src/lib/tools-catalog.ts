import {
  BookOpen,
  Briefcase,
  Calculator,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  FileStack,
  FileText,
  Gavel,
  ImageOff,
  GraduationCap,
  PenLine,
  Receipt,
  Scale,
  Sparkles,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ToolCategoryId =
  "juridico" | "contabeis" | "negocios" | "carreira" | "organizacao";

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
  status: "available" | "beta" | "soon";
}

export const toolCategories: ToolCategory[] = [
  {
    id: "juridico",
    label: "Advogados e jurídico",
    shortLabel: "Jurídico",
    description: "Peças e contratos do dia a dia do escritório.",
    icon: Gavel,
    iconClass: "bg-amber-100 text-amber-900",
    accentBar: "bg-amber-400",
  },
  {
    id: "contabeis",
    label: "Contadores e despachantes",
    shortLabel: "Contabilidade",
    description:
      "Documentos dinâmicos para rotina contábil, fiscal e de despacho.",
    icon: Calculator,
    iconClass: "bg-cyan-100 text-cyan-900",
    accentBar: "bg-cyan-500",
  },
  {
    id: "negocios",
    label: "Autônomos e negócios",
    shortLabel: "Negócios",
    description: "Orçamentos, cobrança, propostas e recibos.",
    icon: Briefcase,
    iconClass: "bg-sky-100 text-sky-800",
    accentBar: "bg-sky-500",
  },
  {
    id: "carreira",
    label: "Estudantes e carreira",
    shortLabel: "Estudantes",
    description: "Currículos e capas no padrão acadêmico.",
    icon: GraduationCap,
    iconClass: "bg-teal-100 text-teal-800",
    accentBar: "bg-teal-500",
  },
  {
    id: "organizacao",
    label: "Organização",
    shortLabel: "Organização",
    description: "Agenda e rotina para não perder prazo.",
    icon: Users,
    iconClass: "bg-emerald-100 text-emerald-800",
    accentBar: "bg-emerald-500",
  },
];

export const toolsCatalog: ToolDefinition[] = [
  {
    id: "juridicos",
    name: "Documentos Jurídicos",
    description:
      "Procuração, honorários, notificação e peças do dia a dia em PDF.",
    tip: "Substabelecimento: transferência de poderes de uma procuração a outro advogado.",
    href: "/ferramentas/juridicos",
    icon: Gavel,
    categoryId: "juridico",
    actionLabel: "Criar documento",
    keywords: [
      "procuração",
      "honorários",
      "substabelecimento",
      "hipossuficiência",
      "notificação",
      "advogado",
      "oab",
    ],
    status: "available",
  },
  {
    id: "contratos",
    name: "Contratos",
    description:
      "Aluguel, serviços, trabalho, compra e venda ou comodato em PDF.",
    tip: "Comodato: empréstimo gratuito de um bem, com devolução combinada.",
    href: "/ferramentas/contratos",
    icon: Scale,
    categoryId: "juridico",
    actionLabel: "Montar contrato",
    keywords: [
      "aluguel",
      "locação",
      "serviços",
      "trabalho",
      "compra",
      "venda",
      "comodato",
      "contrato",
    ],
    status: "available",
  },
  {
    id: "contabeis",
    name: "Docs Contábeis e Despacho",
    description: "Procuração, e-CAC, residência e cartas para rotina fiscal.",
    tip: "e-CAC: portal da Receita Federal para serviços digitais do contribuinte.",
    href: "/ferramentas/contabeis",
    icon: Calculator,
    categoryId: "contabeis",
    actionLabel: "Criar documento",
    keywords: [
      "contábil",
      "despachante",
      "e-cac",
      "residência",
      "responsabilidade",
      "fiscal",
    ],
    status: "available",
  },
  {
    id: "recibos",
    name: "Recibos",
    description:
      "Recibos simples ou personalizados, prontos para enviar ou imprimir.",
    href: "/ferramentas/recibos",
    icon: Receipt,
    categoryId: "contabeis",
    actionLabel: "Gerar recibo",
    keywords: ["recibo", "pagamento", "universitário", "quitação"],
    status: "beta",
  },
  {
    id: "orcamentos",
    name: "Orçamentos",
    description: "Orçamento com link para o cliente aprovar ou pedir ajuste.",
    href: "/ferramentas/orcamentos",
    icon: ClipboardList,
    categoryId: "negocios",
    actionLabel: "Criar orçamento",
    keywords: ["orçamento", "aprovação", "cliente", "proposta de valor"],
    status: "available",
  },
  {
    id: "pix",
    name: "Cobrança Pix",
    description: "QR Code e Pix Copia e Cola no navegador, sem taxa de API.",
    href: "/ferramentas/pix",
    icon: Wallet,
    categoryId: "negocios",
    actionLabel: "Gerar cobrança Pix",
    keywords: ["pix", "qr code", "cobrança", "pagamento", "copia e cola"],
    status: "available",
  },
  {
    id: "propostas",
    name: "Propostas Comerciais",
    description:
      "Proposta com identidade visual, envio e histórico organizado.",
    href: "/ferramentas/propostas",
    icon: FileText,
    categoryId: "negocios",
    actionLabel: "Criar proposta",
    keywords: ["proposta", "comercial", "venda", "agência"],
    status: "available",
  },
  {
    id: "curriculo",
    name: "Currículos",
    description:
      "Currículo universitário ou profissional, pronto em poucos minutos.",
    href: "/ferramentas/curriculo",
    icon: GraduationCap,
    categoryId: "carreira",
    actionLabel: "Montar currículo",
    keywords: ["currículo", "cv", "emprego", "vaga"],
    status: "available",
  },
  {
    id: "curriculo-lattes",
    name: "Lattes Inteligente",
    description:
      "Trajetória acadêmica organizada, com revisão e PDF para editais.",
    tip: "Não envia dados à Plataforma Lattes oficial — organiza o seu currículo acadêmico.",
    href: "/ferramentas/curriculo-lattes",
    icon: GraduationCap,
    categoryId: "carreira",
    actionLabel: "Criar currículo acadêmico",
    keywords: [
      "lattes",
      "cnpq",
      "acadêmico",
      "pesquisa",
      "orcid",
      "doi",
      "publicações",
    ],
    status: "beta",
  },
  {
    id: "trabalhos",
    name: "Capas de Trabalho",
    description:
      "Capas escolares e universitárias no padrão ABNT para imprimir.",
    tip: "ABNT: normas técnicas brasileiras para trabalhos acadêmicos.",
    href: "/ferramentas/trabalhos",
    icon: BookOpen,
    categoryId: "carreira",
    actionLabel: "Gerar capa",
    keywords: [
      "capa",
      "abnt",
      "trabalho",
      "escola",
      "faculdade",
      "folha de rosto",
    ],
    status: "available",
  },
  {
    id: "agenda",
    name: "Agenda",
    description: "Compromissos, lembretes e visão semanal dos seus prazos.",
    href: "/ferramentas/agenda",
    icon: CalendarDays,
    categoryId: "organizacao",
    actionLabel: "Abrir agenda",
    keywords: ["agenda", "calendário", "compromisso", "lembrete", "prazo"],
    premiumOnly: true,
    status: "beta",
  },
  {
    id: "rescisao",
    name: "Calculadora de Rescisão",
    description:
      "Saldo de salário, 13º, férias, aviso prévio e multa do FGTS em segundos.",
    tip: "Estimativa educativa: valores brutos, sem descontos de INSS/IRRF.",
    href: "/ferramentas/rescisao",
    icon: Scale,
    categoryId: "juridico",
    actionLabel: "Calcular rescisão",
    keywords: [
      "rescisão",
      "trabalhista",
      "demissão",
      "aviso prévio",
      "fgts",
      "13º",
      "férias",
      "clt",
    ],
    status: "beta",
  },
  {
    id: "mei-vs-clt",
    name: "MEI vs CLT",
    description:
      "Compare o líquido mensal como CLT com o lucro estimado como MEI.",
    href: "/ferramentas/mei-vs-clt",
    icon: Scale,
    categoryId: "contabeis",
    actionLabel: "Comparar cenários",
    keywords: [
      "mei",
      "clt",
      "autônomo",
      "simulador",
      "inss",
      "irrf",
      "das",
      "salário líquido",
    ],
    status: "beta",
  },
  {
    id: "precificacao",
    name: "Calculadora de Precificação",
    description:
      "Descubra o preço ideal do seu produto ou serviço com margem real.",
    href: "/ferramentas/precificacao",
    icon: Tag,
    categoryId: "negocios",
    actionLabel: "Calcular preço",
    keywords: ["precificação", "preço", "margem", "markup", "lucro", "custo"],
    status: "beta",
  },
  {
    id: "redacao-enem",
    name: "Corretor de Redação ENEM",
    description:
      "Estimativa de nota por competência, com pontos fortes e alertas.",
    tip: "Estimativa automática por heurísticas — não substitui a correção humana.",
    href: "/ferramentas/redacao-enem",
    icon: PenLine,
    categoryId: "carreira",
    actionLabel: "Corrigir redação",
    keywords: [
      "redação",
      "enem",
      "competência",
      "nota",
      "vestibular",
      "texto dissertativo",
    ],
    status: "beta",
  },
  {
    id: "cronograma-estudos",
    name: "Cronograma de Estudos",
    description:
      "Distribuição semanal automática por matéria, peso e tempo disponível.",
    href: "/ferramentas/cronograma-estudos",
    icon: CalendarRange,
    categoryId: "carreira",
    actionLabel: "Montar cronograma",
    keywords: [
      "cronograma",
      "estudos",
      "enem",
      "concurso",
      "vestibular",
      "plano de estudo",
    ],
    status: "beta",
  },
  {
    id: "divisor-conta",
    name: "Divisor de Conta em Grupo",
    description:
      "Rateie churrasco, restaurante ou viagem entre amigos, com taxa de serviço.",
    href: "/ferramentas/divisor-conta",
    icon: Users,
    categoryId: "organizacao",
    actionLabel: "Dividir conta",
    keywords: [
      "divisor",
      "conta",
      "rateio",
      "churrasco",
      "restaurante",
      "viagem",
      "amigos",
    ],
    status: "beta",
  },
  {
    id: "editor-pdf",
    name: "Editor de PDF",
    description:
      "Edite texto e imagens, redimensione páginas, junte, gire e extraia PDFs.",
    tip: "Tudo roda no seu navegador — o arquivo nunca é enviado para um servidor.",
    href: "/ferramentas/editor-pdf",
    icon: FileStack,
    categoryId: "organizacao",
    actionLabel: "Editar PDF",
    keywords: [
      "pdf",
      "editor",
      "texto",
      "redimensionar",
      "mesclar",
      "juntar",
      "unir",
      "dividir",
      "extrair",
      "girar",
      "página",
      "marca d\u0027água",
    ],
    status: "beta",
  },
  {
    id: "remover-fundo",
    name: "Removedor de Fundo de Imagem",
    description: "Recorte automático por IA e download em PNG transparente.",
    tip: "Processamento 100% local, direto no navegador.",
    href: "/ferramentas/remover-fundo",
    icon: ImageOff,
    categoryId: "organizacao",
    actionLabel: "Remover fundo",
    keywords: [
      "remover fundo",
      "imagem",
      "foto",
      "png",
      "transparente",
      "recorte",
      "background removal",
    ],
    status: "beta",
  },
];

/** Atalhos do wizard inicial (“O que você precisa?”). */
export const toolIntentOptions: Array<{
  id: string;
  label: string;
  hint: string;
  toolId: string;
}> = [
  {
    id: "contrato",
    label: "Contrato",
    hint: "Aluguel, serviços, comodato…",
    toolId: "contratos",
  },
  {
    id: "recibo",
    label: "Recibo",
    hint: "Comprovar um pagamento",
    toolId: "recibos",
  },
  {
    id: "curriculo",
    label: "Currículo",
    hint: "CV ou Lattes",
    toolId: "curriculo",
  },
  {
    id: "orcamento",
    label: "Orçamento",
    hint: "Enviar valor ao cliente",
    toolId: "orcamentos",
  },
  { id: "pix", label: "Cobrar no Pix", hint: "QR Code na hora", toolId: "pix" },
  {
    id: "juridico",
    label: "Doc. jurídico",
    hint: "Procuração e afins",
    toolId: "juridicos",
  },
];

export function getToolsByCategory(categoryId: ToolCategoryId) {
  return toolsCatalog.filter((tool) => tool.categoryId === categoryId);
}

export function getToolCategory(categoryId: ToolCategoryId) {
  return (
    toolCategories.find((item) => item.id === categoryId) ?? toolCategories[0]
  );
}

export function getToolById(toolId: string) {
  return toolsCatalog.find((tool) => tool.id === toolId) ?? null;
}

export function searchTools(query: string): ToolDefinition[] {
  const normalized = query
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!normalized) return toolsCatalog;

  return toolsCatalog.filter((tool) => {
    const category = getToolCategory(tool.categoryId);
    const haystack = [
      tool.name,
      tool.description,
      tool.actionLabel,
      category.label,
      category.shortLabel,
      ...tool.keywords,
    ]
      .join(" ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return (
      haystack.includes(normalized) ||
      normalized.split(/\s+/).every((token) => haystack.includes(token))
    );
  });
}

export const valueHighlights = [
  {
    title: "Busca sempre gratuita",
    description: "Explore centenas de links úteis sem cadastro e sem custo.",
    icon: Sparkles,
  },
  {
    title: "Documentos profissionais",
    description: "Orçamentos, Pix, recibos, contratos e currículo em PDF.",
    icon: FileText,
  },
  {
    title: "Totalmente grátis",
    description: "Cadastre-se com e-mail e gere documentos sem pagar nada.",
    icon: GraduationCap,
  },
  {
    title: "Pronto para o WhatsApp",
    description: "Links, QR Pix e PDFs pensados para enviar na hora.",
    icon: CalendarDays,
  },
];
