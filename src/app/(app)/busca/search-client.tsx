'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Bookmark,
  ClipboardList,
  ExternalLink,
  Scale,
  Search,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { useAuthRequired } from '@/components/auth/auth-required-provider';
import { SpotlightAnnouncements } from '@/components/busca/spotlight-announcements';
import { ToolsWatermark } from '@/components/brand/tools-watermark';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSession } from '@/lib/auth';
import {
  filterSearchResults,
  findCategorySuggestions,
  getPopularResources,
  getSearchCategory,
  publicSearchResources,
  searchCategories,
  type SearchCategoryId,
  type SearchResource
} from '@/lib/search-catalog';
import { loadSavedResourceKeys, makeResourceKey, toggleSavedResource } from '@/lib/search-prefs';
import { withoutDashes } from '@/lib/copy';
import { cn } from '@/lib/utils';

const popularResources = getPopularResources(6);

const RELATED_TOOLS = [
  { label: 'Cobrança Pix', href: '/ferramentas/pix' },
  { label: 'Orçamento', href: '/ferramentas/orcamentos' },
  { label: 'Contrato', href: '/ferramentas/contratos' }
] as const;

const TAG_LABELS: Record<string, string> = {
  AbrirMEI: 'Abrir MEI',
  BancoImagens: 'Banco de imagens',
  RedesSociais: 'Redes sociais',
  NotaFiscal: 'Nota fiscal',
  GuiaMensal: 'Guia mensal',
  Certificado: 'Certificado',
  Empreendedorismo: 'Empreendedorismo',
  Agendamento: 'Agendamento',
  Oficial: 'Oficial',
  Empresa: 'Empresa',
  Fotos: 'Fotos',
  Design: 'Design',
  Vídeos: 'Vídeos',
  Imagens: 'Imagens',
  Marketing: 'Marketing',
  Instagram: 'Instagram',
  Grátis: 'Grátis',
  CNPJ: 'CNPJ',
  MEI: 'MEI'
};

function resolveInitialCategory(raw: string | undefined): SearchCategoryId {
  const category = getSearchCategory(raw);
  if (category.requiresAuth) return 'todos';
  return category.id;
}

function formatTagLabel(tag: string) {
  const raw = tag.replace(/^#/, '');
  if (TAG_LABELS[raw]) return TAG_LABELS[raw];
  const withSpaces = raw
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/Banco Imagens/i, 'Banco de imagens')
    .replace(/Redes Sociais/i, 'Redes sociais')
    .replace(/Nota Fiscal/i, 'Nota fiscal')
    .replace(/Guia Mensal/i, 'Guia mensal')
    .replace(/Abrir MEI/i, 'Abrir MEI');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function resourceActionLabel(name: string) {
  const clean = withoutDashes(name);
  if (clean.length > 28) return 'Acessar recurso';
  return `Acessar ${clean}`;
}

/** Ordem fixa: tipo → confiança → condição. Evita duplicar “Gratuito” nas tags. */
function resourceBadges(resource: SearchResource) {
  const tags = resource.tags.map((tag) => tag.toLowerCase());
  const badges: string[] = ['Recurso externo'];
  if (tags.some((tag) => tag.includes('oficial')) || resource.url.includes('gov.br')) {
    badges.push('Site oficial');
  }
  if (tags.some((tag) => tag.includes('grátis') || tag.includes('gratis'))) {
    badges.push('Gratuito');
  }
  return badges;
}

function visibleTags(resource: SearchResource, badges: string[]) {
  const hasGratuitoBadge = badges.includes('Gratuito');
  return resource.tags
    .filter((tag) => {
      const normalized = tag.replace(/^#/, '').toLowerCase();
      if (hasGratuitoBadge && (normalized.includes('grátis') || normalized.includes('gratis'))) return false;
      if (normalized.includes('oficial')) return false;
      return true;
    })
    .slice(0, 3);
}

function ResourceCard({
  resource,
  highlight,
  saved,
  onToggleSaved
}: {
  resource: SearchResource;
  highlight?: string;
  saved: boolean;
  onToggleSaved: () => void;
}) {
  const badges = resourceBadges(resource);
  const tags = visibleTags(resource, badges);
  const action = resourceActionLabel(resource.name);
  const name = withoutDashes(resource.name);
  const description = withoutDashes(resource.description);

  function renderHighlighted(text: string) {
    const term = highlight?.trim();
    if (!term || term.length < 2) return text;
    const index = text.toLowerCase().indexOf(term.toLowerCase());
    if (index < 0) return text;
    return (
      <>
        {text.slice(0, index)}
        <mark className="rounded bg-amber-100 px-0.5 text-inherit">{text.slice(index, index + term.length)}</mark>
        {text.slice(index + term.length)}
      </>
    );
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-sm focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
      <Link
        href={resource.url}
        target="_blank"
        rel="noreferrer"
        className="absolute inset-0 z-0 rounded-[22px]"
        aria-label={`${action} (abre em nova aba)`}
      />
      <div className="pointer-events-none relative z-10 flex h-full flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className={cn(
                  'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em]',
                  badge === 'Site oficial'
                    ? 'bg-emerald-50 text-emerald-800'
                    : badge === 'Recurso externo'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-sky-50 text-sky-800'
                )}
              >
                {badge === 'Site oficial' ? <ShieldCheck className="h-3 w-3" /> : null}
                {badge}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleSaved();
            }}
            className={cn(
              'pointer-events-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition',
              saved ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
            )}
            aria-label={saved ? 'Remover dos salvos' : 'Salvar recurso'}
            title={saved ? 'Remover dos salvos' : 'Salvar recurso'}
          >
            <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
          </button>
        </div>
        <h3 className="rj-display mt-3 text-lg font-bold leading-snug tracking-tight text-slate-900">
          {renderHighlighted(name)}
        </h3>
        <p className="mt-2 line-clamp-3 text-[15px] leading-6 text-slate-700">{renderHighlighted(description)}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200/80"
            >
              {formatTagLabel(tag)}
            </span>
          ))}
        </div>
        <p className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-sky-700">
          {action}
          <ExternalLink className="h-3.5 w-3.5" />
        </p>
      </div>
    </article>
  );
}

const toolPromos = [
  {
    id: 'orcamentos',
    eyebrow: 'Ferramenta Resolva Jato',
    title: 'Orçamento com link de aprovação',
    description: 'Envie ao cliente. Ele aprova ou pede ajuste no celular, sem criar conta.',
    href: '/ferramentas/orcamentos',
    icon: ClipboardList,
    cta: 'Criar orçamento'
  },
  {
    id: 'pix',
    eyebrow: 'Ferramenta Resolva Jato',
    title: 'Cobrança Pix com QR Code',
    description: 'Gere Copia e Cola e QR no navegador. Sem API bancária e sem burocracia.',
    href: '/ferramentas/pix',
    icon: Wallet,
    cta: 'Gerar cobrança Pix',
    badge: 'Mais usado'
  },
  {
    id: 'contratos',
    eyebrow: 'Ferramenta Resolva Jato',
    title: 'Contratos sob medida',
    description: 'Aluguel, serviços, trabalho e mais. Suas cláusulas, seu PDF.',
    href: '/ferramentas/contratos',
    icon: Scale,
    cta: 'Montar contrato'
  }
] as const;

export function BuscaClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { requireAuth } = useAuthRequired();
  const initialCategory = searchParams.get('categoria') ?? undefined;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategoryId>(resolveInitialCategory(initialCategory));
  const [savedKeys, setSavedKeys] = useState<string[]>([]);

  useEffect(() => {
    setSavedKeys(loadSavedResourceKeys());
  }, []);

  const activeCategory = getSearchCategory(category);
  const results = useMemo(() => filterSearchResults(query, category), [category, query]);
  const suggestions = useMemo(
    () => (results.length === 0 ? findCategorySuggestions(query, category) : []),
    [results.length, query, category]
  );
  const globalHits = useMemo(
    () => (query.trim() ? filterSearchResults(query, 'todos').length : 0),
    [query]
  );

  const resultsSummary = query.trim()
    ? `${results.length} resultado${results.length === 1 ? '' : 's'} para “${query.trim()}”`
    : `${results.length} recurso${results.length === 1 ? '' : 's'} disponíveis`;

  function handleToggleSaved(resource: SearchResource) {
    setSavedKeys(toggleSavedResource(resource.name, resource.url));
  }

  function openToolsHub() {
    if (!getSession()) {
      requireAuth('/ferramentas');
      return;
    }
    router.push('/ferramentas');
  }

  function handleCategorySelect(next: SearchCategoryId) {
    const meta = getSearchCategory(next);
    if (meta.requiresAuth) {
      openToolsHub();
      return;
    }
    setCategory(next);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (category !== 'todos') setCategory('todos');
  }

  function applySuggestion(categoryId: SearchCategoryId) {
    setCategory(categoryId);
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const target = document.getElementById('catalogo-resultados');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="-mx-3 space-y-0 sm:-mx-5 lg:-mx-8">
      <section className="relative overflow-hidden bg-[linear-gradient(145deg,#020617_0%,#0f172a_45%,#0c4a6e_100%)] px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-8 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
          <ToolsWatermark className="opacity-40" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-300">
            Busca gratuita e inteligente
          </p>
          <h1 className="rj-display mt-4 text-[clamp(1.9rem,4.2vw,3.2rem)] font-extrabold leading-[1.08] tracking-tight">
            Digite o problema. A gente aponta a saída.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            Mais de {publicSearchResources.length} recursos gratuitos para consultar. Use também
            nossas ferramentas para gerar documentos profissionais — totalmente grátis.
          </p>

          <form
            onSubmit={submitSearch}
            className="mx-auto mt-8 w-full max-w-2xl rounded-2xl border border-white/15 bg-white/95 p-3 text-left shadow-2xl shadow-slate-950/30 sm:p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative block min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => handleQueryChange(event.target.value)}
                  placeholder="Buscar em todo o catálogo. Ex.: emprego, MEI, ABNT, IA..."
                  className="h-12 rounded-xl border-slate-200 pl-12 text-base shadow-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  aria-label="Busca global em todas as categorias"
                />
              </label>
              <Button type="submit" className="h-12 shrink-0 px-5 font-bold sm:min-w-[9.5rem]">
                Encontrar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 px-1 text-xs text-slate-500">
              A busca de links é gratuita. As ferramentas geram documentos profissionais em PDF —
              também de graça.
            </p>
          </form>

          <p className="mt-4 text-sm text-slate-300">
            {resultsSummary}
            {category !== 'todos' ? ` em ${activeCategory.label}` : ''}.
          </p>
        </div>
      </section>

      <div className="space-y-8 bg-[image:var(--rj-page-bg)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <SpotlightAnnouncements />

        <section className="mx-auto max-w-[1400px]">
          <div className="mb-3">
            <h2 className="rj-display text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Recursos gratuitos na internet
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Links selecionados e verificados para você encontrar serviços gratuitos — abrem em nova aba.
            </p>
          </div>

          <div className="sticky top-[var(--rj-chrome-top)] z-30 -mx-1 mb-4 rounded-2xl border border-slate-200/90 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur-xl sm:mx-0">
            <div className="mb-2 flex justify-end text-xs font-semibold text-slate-500">
              <span>{resultsSummary}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {searchCategories.map((item) => {
                const Icon = item.icon;
                const active = !item.requiresAuth && item.id === category;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCategorySelect(item.id)}
                    className={cn(
                      'inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors',
                      active
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section id="catalogo-resultados" className="mx-auto max-w-[1400px] scroll-mt-[var(--rj-section-scroll-mt)]">
          {query.trim() && results.length > 0 ? (
            <p className="mb-4 text-sm text-slate-600">
              Talvez você também precise de:{' '}
              {RELATED_TOOLS.map((tool, index) => (
                <span key={tool.href}>
                  {index > 0 ? ', ' : ''}
                  <AuthAwareLink href={tool.href} className="font-semibold text-sky-700 hover:underline">
                    {tool.label}
                  </AuthAwareLink>
                </span>
              ))}
              .
            </p>
          ) : null}

          {results.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {results.map((resource) => (
                <ResourceCard
                  key={`${resource.category}-${resource.name}`}
                  resource={resource}
                  highlight={query}
                  saved={savedKeys.includes(makeResourceKey(resource.name, resource.url))}
                  onToggleSaved={() => handleToggleSaved(resource)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <EmptyState
                title="Nenhum recurso encontrado com esses filtros"
                description={
                  query.trim()
                    ? category !== 'todos'
                      ? `Não encontramos “${query.trim()}” em ${activeCategory.label}${
                          globalHits > 0
                            ? `, mas há ${globalHits} resultado${globalHits === 1 ? '' : 's'} em outras categorias.`
                            : '.'
                        }`
                      : `Não encontramos “${query.trim()}” no catálogo. Tente outro termo ou explore os recursos populares abaixo.`
                    : 'Ajuste a busca ou explore um destaque acima.'
                }
                action={
                  suggestions.length > 0 ? (
                    <div className="mt-2 flex w-full max-w-lg flex-col gap-2">
                      {suggestions.slice(0, 3).map((suggestion) => (
                        <button
                          key={suggestion.categoryId}
                          type="button"
                          onClick={() => applySuggestion(suggestion.categoryId)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-800 transition-colors hover:bg-sky-100"
                        >
                          Ver {suggestion.count} em {suggestion.label}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      ))}
                      {category !== 'todos' && globalHits > 0 ? (
                        <button
                          type="button"
                          onClick={() => setCategory('todos')}
                          className="text-sm font-semibold text-slate-600 underline-offset-2 hover:underline"
                        >
                          Ver todos os {globalHits} resultados
                        </button>
                      ) : null}
                    </div>
                  ) : category !== 'todos' ? (
                    <Button type="button" variant="outline" onClick={() => setCategory('todos')}>
                      Buscar em todas as categorias
                    </Button>
                  ) : null
                }
              />

              <div>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="rj-display text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                      Continue explorando
                    </p>
                    <h3 className="rj-display mt-1 text-xl font-extrabold tracking-tight text-slate-900">
                      Recursos mais acessados
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setCategory('todos');
                    }}
                    className="text-sm font-semibold text-sky-700 hover:text-sky-800"
                  >
                    Limpar filtros
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {popularResources.map((resource) => (
                    <ResourceCard
                      key={`popular-${resource.name}`}
                      resource={resource}
                      saved={savedKeys.includes(makeResourceKey(resource.name, resource.url))}
                      onToggleSaved={() => handleToggleSaved(resource)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="mx-auto max-w-[1400px]">
          <div className="mb-4">
            <h2 className="rj-display text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Ferramentas Resolva Jato
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Soluções criadas na plataforma para gerar documentos profissionais — totalmente grátis.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {toolPromos.map((promo) => {
              const Icon = promo.icon;
              return (
                <article
                  key={promo.id}
                  className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  {'badge' in promo && promo.badge ? (
                    <span className="absolute right-5 top-5 rounded-md bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800">
                      {promo.badge}
                    </span>
                  ) : null}
                  <p className="rj-display text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
                    {promo.eyebrow}
                  </p>
                  <h3 className="rj-display mt-3 max-w-[18ch] text-2xl font-extrabold tracking-tight text-slate-900">
                    {promo.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{promo.description}</p>
                  <Button asChild className="mt-6" size="lg">
                    <AuthAwareLink href={promo.href}>
                      <Icon className="h-4 w-4" />
                      {promo.cta}
                    </AuthAwareLink>
                  </Button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px]">
          <div className="relative overflow-hidden rounded-[28px] bg-slate-950 px-6 py-10 text-white sm:px-10">
            <div className="pointer-events-none absolute -right-8 top-0 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="rj-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Encontrou o caminho? Agora conclua no Resolva Jato.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                  A busca de links continua grátis e sem limite. No Premium, contratos, orçamentos, recibos e
                  cobranças Pix saem sem a marca Resolva Jato.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-300">
                  <Link href="/conta?upgrade=premium">
                    Remover marca Resolva Jato
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/25 bg-transparent text-white hover:bg-white/10"
                >
                  <AuthAwareLink href="/ferramentas">Conhecer as ferramentas</AuthAwareLink>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
