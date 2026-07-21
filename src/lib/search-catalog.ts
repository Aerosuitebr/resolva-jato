import { BookOpen, Bot, BriefcaseBusiness, HeartPulse, Search, Sparkles, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { resources } from '@/resources';

export type SearchCategoryId = 'todos' | 'negocios' | 'estudos' | 'utilidade-publica' | 'ferramentas' | 'saude' | 'inteligencia-artificial';

export interface SearchCategory {
  id: SearchCategoryId;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Se true, o chip não filtra o catálogo — leva ao hub de ferramentas (exige login). */
  requiresAuth?: boolean;
  href?: string;
}

export interface SearchResource {
  name: string;
  category: Exclude<SearchCategoryId, 'todos'>;
  categoryLabel: string;
  description: string;
  url: string;
  tags: string[];
}

export const searchCategories: SearchCategory[] = [
  {
    id: 'todos',
    label: 'Todas as buscas',
    description: 'Catálogo completo de recursos gratuitos.',
    icon: Search
  },
  {
    id: 'negocios',
    label: 'Negócios',
    description: 'MEI, vendas, cobrança, marketing e gestão.',
    icon: BriefcaseBusiness
  },
  {
    id: 'estudos',
    label: 'Estudos',
    description: 'Pesquisa, ABNT, cursos, idiomas e produtividade acadêmica.',
    icon: BookOpen
  },
  {
    id: 'utilidade-publica',
    label: 'Utilidade pública',
    description: 'Serviços oficiais, documentos, direitos e canais públicos.',
    icon: Sparkles
  },
  {
    id: 'ferramentas',
    label: 'Ferramentas',
    description: 'Orçamentos, Pix, contratos, documentos jurídicos e contábeis, capas e mais. Exige conta.',
    icon: Wrench,
    requiresAuth: true,
    href: '/ferramentas'
  },
  {
    id: 'saude',
    label: 'Saúde',
    description: 'Orientações, consultas, prevenção e bem-estar.',
    icon: HeartPulse
  },
  {
    id: 'inteligencia-artificial',
    label: 'Inteligência artificial',
    description: 'Chats, imagem, vídeo, código, automação e pesquisa com IA.',
    icon: Bot
  }
];

export const searchResources = resources as SearchResource[];

/** Categorias que filtram o catálogo público (exclui o atalho autenticado de Ferramentas). */
export const searchableCategories = searchCategories.filter((category) => !category.requiresAuth);

/** Recursos do catálogo público (sem a categoria legada "ferramentas" de links externos). */
export const publicSearchResources = searchResources.filter((resource) => resource.category !== 'ferramentas');

const POPULAR_RESOURCE_NAMES = [
  'ChatGPT',
  'Google Gemini',
  'Canva Currículos',
  'LinkedIn Currículo',
  'Google Acadêmico',
  'Receita Federal',
  'Gov.br',
  'Perplexity',
  'Khan Academy',
  'NotebookLM',
  'Carteira de Trabalho Digital',
  'Portal do Empreendedor'
] as const;

export function getPopularResources(limit = 6): SearchResource[] {
  const byName = new Map(publicSearchResources.map((resource) => [resource.name, resource]));
  const curated = POPULAR_RESOURCE_NAMES.map((name) => byName.get(name)).filter(
    (resource): resource is SearchResource => Boolean(resource)
  );
  if (curated.length >= limit) return curated.slice(0, limit);
  const extras = publicSearchResources.filter((resource) => !curated.includes(resource));
  return [...curated, ...extras].slice(0, limit);
}

export function getSearchCategory(categoryId: string | undefined) {
  return searchCategories.find((category) => category.id === categoryId) ?? searchCategories[0];
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Sinônimos para temas do dia a dia — evita zero resultado por termo literal. */
const SEARCH_ALIASES: Record<string, string[]> = {
  emprego: ['emprego', 'vaga', 'vagas', 'carreira', 'curriculo', 'trabalho', 'linkedin'],
  curriculo: ['curriculo', 'emprego', 'carreira', 'linkedin', 'vaga'],
  imposto: ['imposto', 'impostos', 'tribut', 'receita', 'irpf', 'das'],
  impostos: ['imposto', 'impostos', 'tribut', 'receita', 'irpf', 'das'],
  contrato: ['contrato', 'contratos', 'clausula', 'modelo'],
  documento: ['documento', 'documentos', 'certidao', 'gov', 'oficial'],
  curso: ['curso', 'cursos', 'aula', 'aprend', 'certificado'],
  saude: ['saude', 'sus', 'medico', 'hospital', 'vacina'],
  mei: ['mei', 'cnpj', 'empreendedor', 'formaliza']
};

function expandToken(token: string) {
  return SEARCH_ALIASES[token] ?? [token];
}

function tokenMatchesHaystack(token: string, haystack: string, tags: string[], words: string[]) {
  const variants = expandToken(token);
  return variants.some((variant) => {
    if (variant.length <= 2) {
      return tags.includes(variant) || words.includes(variant);
    }
    return haystack.includes(variant);
  });
}

/** Busca por tokens (AND). Termos curtos (ex.: IA) batem em tags/#IA ou palavra inteira. */
export function resourceMatchesQuery(resource: SearchResource, query: string) {
  const tokens = normalizeSearchText(query)
    .split(/\s+/)
    .map((token) => token.replace(/^#/, ''))
    .filter(Boolean);
  if (tokens.length === 0) return true;

  const haystack = normalizeSearchText(
    `${resource.name} ${resource.categoryLabel} ${resource.description} ${resource.tags.join(' ')}`
  );
  const tags = resource.tags.map((tag) => normalizeSearchText(tag.replace(/^#/, '')));
  const words = haystack.split(/[^a-z0-9]+/).filter(Boolean);

  return tokens.every((token) => tokenMatchesHaystack(token, haystack, tags, words));
}

export function filterSearchResults(query: string, category: SearchCategoryId) {
  return publicSearchResources.filter((resource) => {
    const matchesCategory = category === 'todos' || resource.category === category;
    return matchesCategory && resourceMatchesQuery(resource, query);
  });
}

export interface CategorySuggestion {
  categoryId: Exclude<SearchCategoryId, 'todos' | 'ferramentas'>;
  label: string;
  count: number;
}

/** Quando a categoria atual zera, sugere outras com resultados para o mesmo termo. */
export function findCategorySuggestions(
  query: string,
  currentCategory: SearchCategoryId
): CategorySuggestion[] {
  if (!query.trim()) return [];

  const counts = new Map<Exclude<SearchCategoryId, 'todos' | 'ferramentas'>, number>();
  for (const resource of publicSearchResources) {
    if (!resourceMatchesQuery(resource, query)) continue;
    if (resource.category === currentCategory) continue;
    if (resource.category === 'ferramentas') continue;
    counts.set(resource.category, (counts.get(resource.category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([categoryId, count]) => ({
      categoryId,
      label: getSearchCategory(categoryId).label,
      count
    }))
    .sort((a, b) => b.count - a.count);
}