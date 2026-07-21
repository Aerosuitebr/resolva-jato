import type { LucideIcon } from 'lucide-react';

export interface SeoPageBenefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface SeoPageStep {
  title: string;
  description: string;
}

export interface SeoPageExample {
  title: string;
  description: string;
  image: string;
  href: string;
}

export interface SeoPageFaqItem {
  question: string;
  answer: string;
}

export interface SeoPageRelatedTool {
  name: string;
  description: string;
  href: string;
}

export interface SeoPageQuickBadge {
  icon: LucideIcon;
  label: string;
}

export interface SeoPageContent {
  /** Slug sem barra, ex: "gerador-de-curriculo" */
  slug: string;
  /** Nome curto da ferramenta, ex: "Currículo" */
  toolName: string;
  /** H1 — deve conter a palavra-chave principal */
  h1: string;
  /** Subtítulo do hero — benefício principal em 1 frase */
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  /** Para onde o CTA principal leva (normalmente /cadastro?next=/ferramentas/x) */
  ctaHref: string;
  quickBadges: SeoPageQuickBadge[];
  benefits: SeoPageBenefit[];
  steps: SeoPageStep[];
  examples: SeoPageExample[];
  faq: SeoPageFaqItem[];
  article: {
    title: string;
    /** Parágrafos em HTML simples (já sanitizado, escrito por nós) */
    html: string;
  };
  relatedTools: SeoPageRelatedTool[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    breadcrumbLabel: string;
  };
}
