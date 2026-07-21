'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Crown,
  MessageSquarePlus,
  Pin,
  Search,
  Sparkles,
  Star
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { PageHero } from '@/components/shared/page-hero';
import {
  ToolsEngagementStrip,
  ToolsIntentWizard,
  ToolTipButton
} from '@/components/tools/tools-hub-extras';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import { getToolsEngagement } from '@/lib/tools-engagement';
import {
  getToolById,
  getToolCategory,
  getToolsByCategory,
  searchTools,
  toolCategories,
  type ToolCategoryId,
  type ToolDefinition
} from '@/lib/tools-catalog';
import {
  dismissToolsWizard,
  isToolsWizardDismissed,
  loadCollapsedCategoryIds,
  loadFavoriteToolIds,
  loadMostUsedToolIds,
  loadPinnedCategoryId,
  loadRecentToolIds,
  pushRecentToolId,
  reopenToolsWizard,
  setPinnedCategoryId,
  toggleCollapsedCategoryId,
  toggleFavoriteToolId
} from '@/lib/tools-prefs';
import { cn } from '@/lib/utils';

export default function FerramentasPage() {
  const { usage } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [spyCategory, setSpyCategory] = useState<ToolCategoryId | 'todas'>('todas');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [mostUsed, setMostUsed] = useState<string[]>([]);
  const [pinnedCategory, setPinnedCategory] = useState<ToolCategoryId | null>(null);
  const [collapsed, setCollapsed] = useState<ToolCategoryId[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [engagement, setEngagement] = useState(() => getToolsEngagement());
  const [prefsReady, setPrefsReady] = useState(false);
  const sectionRefs = useRef<Partial<Record<ToolCategoryId, HTMLElement | null>>>({});
  const ignoreSpyUntil = useRef(0);

  useEffect(() => {
    setFavorites(loadFavoriteToolIds());
    setRecent(loadRecentToolIds());
    setMostUsed(loadMostUsedToolIds(3));
    setPinnedCategory(loadPinnedCategoryId());
    setCollapsed(loadCollapsedCategoryIds());
    setShowWizard(!isToolsWizardDismissed());
    setEngagement(getToolsEngagement());
    setPrefsReady(true);
  }, []);

  const searchResults = useMemo(() => searchTools(query), [query]);
  const isSearching = query.trim().length > 0;

  const orderedCategories = useMemo(() => {
    if (!pinnedCategory) return toolCategories;
    const pinned = toolCategories.find((item) => item.id === pinnedCategory);
    if (!pinned) return toolCategories;
    return [pinned, ...toolCategories.filter((item) => item.id !== pinnedCategory)];
  }, [pinnedCategory]);

  const sections = useMemo(
    () =>
      orderedCategories
        .map((category) => ({
          category,
          tools: getToolsByCategory(category.id).filter((tool) =>
            isSearching ? searchResults.some((hit) => hit.id === tool.id) : true
          )
        }))
        .filter((section) => section.tools.length > 0),
    [isSearching, orderedCategories, searchResults]
  );

  const recentTools = useMemo(
    () => recent.map((id) => getToolById(id)).filter(Boolean) as ToolDefinition[],
    [recent]
  );
  const favoriteTools = useMemo(
    () => favorites.map((id) => getToolById(id)).filter(Boolean) as ToolDefinition[],
    [favorites]
  );
  const mostUsedTools = useMemo(() => {
    const recentSet = new Set(recent);
    return mostUsed
      .filter((id) => !recentSet.has(id))
      .map((id) => getToolById(id))
      .filter(Boolean) as ToolDefinition[];
  }, [mostUsed, recent]);

  useEffect(() => {
    if (isSearching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < ignoreSpyUntil.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target.id) return;
        const id = visible.target.id.replace('cat-', '') as ToolCategoryId;
        if (toolCategories.some((category) => category.id === id)) {
          setSpyCategory(id);
        }
      },
      { rootMargin: '-28% 0px -55% 0px', threshold: [0.2, 0.4, 0.6] }
    );

    orderedCategories.forEach((category) => {
      const node = sectionRefs.current[category.id];
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [isSearching, orderedCategories, sections.length]);

  function scrollToCategory(id: ToolCategoryId | 'todas') {
    ignoreSpyUntil.current = Date.now() + 700;
    setSpyCategory(id);
    if (id === 'todas') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleOpenTool(toolId: string) {
    const nextRecent = pushRecentToolId(toolId);
    setRecent(nextRecent);
    setMostUsed(loadMostUsedToolIds(3));
    const tool = getToolById(toolId);
    if (tool) toast(`Abrindo ${tool.name}…`);
  }

  function handleToggleFavorite(toolId: string) {
    const next = toggleFavoriteToolId(toolId);
    setFavorites(next);
    const tool = getToolById(toolId);
    const added = next.includes(toolId);
    toast(
      added
        ? `${tool?.name || 'Ferramenta'} adicionada aos favoritos`
        : `${tool?.name || 'Ferramenta'} removida dos favoritos`
    );
  }

  function handlePinCategory(categoryId: ToolCategoryId) {
    const next = pinnedCategory === categoryId ? null : categoryId;
    setPinnedCategory(setPinnedCategoryId(next));
    toast(next ? 'Categoria fixada no início' : 'Categoria desafixada');
  }

  function handleToggleCollapse(categoryId: ToolCategoryId) {
    setCollapsed(toggleCollapsedCategoryId(categoryId));
  }

  function handleDismissWizard() {
    dismissToolsWizard();
    setShowWizard(false);
  }

  return (
    <AuthGate
      title="Ferramentas profissionais"
      description="Cadastre-se gratuitamente para acessar currículos, recibos, propostas, contratos e agenda — com qualidade profissional."
    >
      <div className="space-y-5">
        <PageHero
          title="O que você precisa resolver hoje?"
          subtitle="Busque por nome, escolha um atalho ou continue de onde parou."
          icon={Sparkles}
          actions={
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <p className="rj-display text-base font-bold text-sky-100">
                {usage.unlimited ? 'Uso ilimitado' : 'Ferramentas profissionais'}
              </p>
              <p className="text-xs font-medium leading-5 text-slate-300">
                {usage.unlimited
                  ? usage.premiumExpiresAt
                    ? `Ativo até ${new Date(usage.premiumExpiresAt).toLocaleDateString('pt-BR')}`
                    : 'Salve e baixe à vontade'
                  : usage.remaining === 0
                    ? 'Suas 5 utilizações gratuitas acabaram'
                    : 'Crie e baixe documentos com qualidade profissional'}
              </p>
              {usage.unlimited ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-bold text-emerald-200">
                  Premium ativo
                </span>
              ) : usage.remaining === 0 ? (
                <Button asChild size="sm" className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-300">
                  <Link href="/conta?upgrade=premium">Liberar ilimitado por 30 dias</Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-300">
                  <Link href="/conta">Minha conta</Link>
                </Button>
              )}
            </div>
          }
        />

        {prefsReady && showWizard ? (
          <ToolsIntentWizard onPick={handleOpenTool} onDismiss={handleDismissWizard} />
        ) : prefsReady ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                reopenToolsWizard();
                setShowWizard(true);
              }}
              className="text-xs font-semibold text-sky-700 underline-offset-2 hover:underline"
            >
              Mostrar atalhos rápidos
            </button>
          </div>
        ) : null}

        {prefsReady ? <ToolsEngagementStrip engagement={engagement} /> : null}

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar contrato, recibo, orçamento ou ferramenta..."
            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-base font-medium text-slate-900 shadow-sm outline-none ring-sky-200 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4"
            aria-label="Buscar ferramentas"
          />
        </div>

        {prefsReady && (recentTools.length > 0 || mostUsedTools.length > 0 || favoriteTools.length > 0) ? (
          <section className="space-y-4" aria-label="Atalhos personalizados">
            {recentTools.length > 0 ? (
              <QuickRow
                title="Continue de onde parou"
                tools={recentTools}
                favorites={favorites}
                onFavorite={handleToggleFavorite}
                onOpen={handleOpenTool}
              />
            ) : null}
            {mostUsedTools.length > 0 ? (
              <QuickRow
                title="Mais usadas por você"
                tools={mostUsedTools}
                favorites={favorites}
                onFavorite={handleToggleFavorite}
                onOpen={handleOpenTool}
              />
            ) : null}
            {favoriteTools.length > 0 ? (
              <QuickRow
                title="Favoritas"
                tools={favoriteTools}
                favorites={favorites}
                onFavorite={handleToggleFavorite}
                onOpen={handleOpenTool}
              />
            ) : null}
          </section>
        ) : null}

        <nav
          className="sticky top-[var(--rj-chrome-top)] z-30 -mx-1 rounded-2xl border border-slate-200/90 bg-white/95 px-2 py-2 shadow-sm backdrop-blur-xl sm:mx-0 sm:px-3"
          aria-label="Categorias de ferramentas"
        >
          <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <CategoryChip
              label="Todas"
              active={!isSearching && spyCategory === 'todas'}
              onClick={() => {
                setQuery('');
                scrollToCategory('todas');
              }}
            />
            {toolCategories.map((category) => (
              <CategoryChip
                key={category.id}
                label={category.shortLabel}
                active={!isSearching && spyCategory === category.id}
                onClick={() => {
                  setQuery('');
                  scrollToCategory(category.id);
                }}
              />
            ))}
          </div>
        </nav>

        {isSearching ? (
          <p className="text-sm font-medium text-slate-600" role="status">
            {searchResults.length === 0
              ? `Nenhuma ferramenta para “${query.trim()}”.`
              : `${searchResults.length} resultado${searchResults.length === 1 ? '' : 's'} para “${query.trim()}”.`}
          </p>
        ) : null}

        <div className="space-y-4">
          {sections.map(({ category, tools }) => {
            const CategoryIcon = category.icon;
            const isCollapsed = collapsed.includes(category.id) && !isSearching;
            const isPinned = pinnedCategory === category.id;

            return (
              <section
                key={category.id}
                id={`cat-${category.id}`}
                ref={(node) => {
                  sectionRefs.current[category.id] = node;
                }}
                className="scroll-mt-[var(--rj-section-scroll-mt)] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                aria-labelledby={`heading-${category.id}`}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        'relative grid h-11 w-11 shrink-0 place-items-center rounded-xl',
                        category.iconClass
                      )}
                    >
                      <span
                        className={cn('absolute left-0 top-1.5 h-8 w-1 rounded-r-full', category.accentBar)}
                        aria-hidden
                      />
                      <CategoryIcon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h2
                        id={`heading-${category.id}`}
                        className="rj-display text-lg font-bold text-slate-900 sm:text-xl"
                      >
                        {category.label}
                      </h2>
                      <p className="mt-0.5 text-sm font-medium leading-5 text-slate-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handlePinCategory(category.id)}
                      className={cn(
                        'rj-press inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition',
                        isPinned
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      )}
                      title={isPinned ? 'Desafixar do início' : 'Fixar no início'}
                      aria-pressed={isPinned}
                    >
                      <Pin className="h-3.5 w-3.5" aria-hidden />
                      {isPinned ? 'Fixada' : 'Fixar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleCollapse(category.id)}
                      className="rj-press inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                      aria-expanded={!isCollapsed}
                      aria-label={isCollapsed ? 'Expandir categoria' : 'Recolher categoria'}
                    >
                      <ChevronDown className={cn('h-4 w-4 transition', isCollapsed && '-rotate-90')} aria-hidden />
                    </button>
                  </div>
                </div>

                {!isCollapsed ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {tools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        favorite={favorites.includes(tool.id)}
                        highlighted={isSearching}
                        onFavorite={() => handleToggleFavorite(tool.id)}
                        onOpen={() => handleOpenTool(tool.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-500">{tools.length} ferramentas recolhidas</p>
                )}
              </section>
            );
          })}
        </div>

        <footer className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-5 py-6 text-center">
          <p className="rj-display text-lg font-bold text-slate-800">Não encontrou o que precisava?</p>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Sugira uma ferramenta e ajudamos a priorizar o próximo módulo.
          </p>
          <Button asChild variant="outline" className="mt-4 min-h-11">
            <a href="mailto:contato@resolvajato.com.br?subject=Sugest%C3%A3o%20de%20ferramenta">
              <MessageSquarePlus className="h-4 w-4" aria-hidden />
              Sugerir uma ferramenta
            </a>
          </Button>
        </footer>
      </div>
    </AuthGate>
  );
}

function QuickRow({
  title,
  tools,
  favorites,
  onFavorite,
  onOpen
}: {
  title: string;
  tools: ToolDefinition[];
  favorites: string[];
  onFavorite: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard
            key={`${title}-${tool.id}`}
            tool={tool}
            favorite={favorites.includes(tool.id)}
            compact
            onFavorite={() => onFavorite(tool.id)}
            onOpen={() => onOpen(tool.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rj-press h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition',
        active
          ? 'bg-slate-900 text-white shadow-sm'
          : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      )}
    >
      {label}
    </button>
  );
}

function ToolCard({
  tool,
  favorite,
  highlighted,
  compact,
  onFavorite,
  onOpen
}: {
  tool: ToolDefinition;
  favorite: boolean;
  highlighted?: boolean;
  compact?: boolean;
  onFavorite: () => void;
  onOpen: () => void;
}) {
  const Icon = tool.icon;
  const category = getToolCategory(tool.categoryId);
  const showPremium = Boolean(tool.premiumOnly);
  const showBeta = tool.status === 'beta';

  return (
    <article
      className={cn(
        'group relative flex h-full min-h-[11.5rem] flex-col rounded-2xl border bg-white p-4 transition',
        'border-slate-200 hover:border-sky-400 hover:shadow-md',
        'focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100',
        highlighted && 'border-sky-300 bg-sky-50/40 ring-1 ring-sky-200',
        compact && 'min-h-[8.5rem]'
      )}
    >
      <Link
        href={tool.href}
        onClick={onOpen}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`${tool.actionLabel}: ${tool.name}. ${tool.description}`}
      />

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-white">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <h3 className="rj-display text-base font-bold leading-snug text-slate-900">{tool.name}</h3>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">{category.shortLabel}</p>
              </div>
              <div className="flex shrink-0 items-center">
                {tool.tip ? <ToolTipButton tip={tool.tip} /> : null}
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onFavorite();
                  }}
                  className={cn(
                    'pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-xl transition',
                    favorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
                  )}
                  aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  aria-pressed={favorite}
                >
                  <Star className={cn('h-4 w-4', favorite && 'fill-current')} aria-hidden />
                </button>
              </div>
            </div>

            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {showPremium ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                  <Crown className="h-3 w-3" aria-hidden />
                  {showBeta ? 'Premium · Beta' : 'Premium'}
                </span>
              ) : showBeta ? (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-900">
                  Beta
                </span>
              ) : null}
            </div>

            {!compact ? (
              <p className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm font-medium leading-5 text-slate-600">
                {tool.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-auto flex justify-end pt-3">
          <span className="rj-press inline-flex h-11 min-w-[10rem] items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white shadow-sm transition group-hover:bg-sky-500">
            <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            {tool.actionLabel}
          </span>
        </div>
      </div>
    </article>
  );
}
