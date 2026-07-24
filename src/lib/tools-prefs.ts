import type { ToolCategoryId } from '@/lib/tools-catalog';

export interface ServerToolsPrefs {
  favoriteToolIds: string[];
  recentToolIds: string[];
  openCounts: Record<string, number>;
  pinnedCategoryId: string | null;
  collapsedCategories: string[];
  sectionsCustomized: boolean;
  wizardDismissed: boolean;
}

const FAVORITES_KEY = 'rj.tools.favorites';
const RECENT_KEY = 'rj.tools.recent';
const PINNED_CATEGORY_KEY = 'rj.tools.pinnedCategory';
const COLLAPSED_KEY = 'rj.tools.collapsedCategories';
const SECTIONS_CUSTOMIZED_KEY = 'rj.tools.sectionsCustomized';
const OPEN_COUNTS_KEY = 'rj.tools.openCounts';
const WIZARD_DISMISSED_KEY = 'rj.tools.wizardDismissed';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/** Busca as preferências salvas na conta do usuário (fonte de verdade entre dispositivos). */
export async function fetchServerToolsPrefs(): Promise<ServerToolsPrefs | null> {
  try {
    const res = await fetch('/api/tools-prefs', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { authenticated: boolean; prefs: ServerToolsPrefs };
    return data.authenticated ? data.prefs : null;
  } catch {
    return null;
  }
}

/** Envia (fire-and-forget) as preferências alteradas para persistir na conta do usuário. */
export function syncServerToolsPrefs(partial: Partial<ServerToolsPrefs>) {
  if (typeof window === 'undefined') return;
  fetch('/api/tools-prefs', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(partial)
  }).catch(() => undefined);
}

/** Espelha o snapshot completo do servidor no cache local (localStorage) para carregamento instantâneo. */
export function hydrateLocalFromServer(prefs: ServerToolsPrefs) {
  writeJson(FAVORITES_KEY, prefs.favoriteToolIds);
  writeJson(RECENT_KEY, prefs.recentToolIds);
  writeJson(OPEN_COUNTS_KEY, prefs.openCounts);
  writeJson(PINNED_CATEGORY_KEY, prefs.pinnedCategoryId);
  writeJson(COLLAPSED_KEY, prefs.collapsedCategories);
  writeJson(SECTIONS_CUSTOMIZED_KEY, prefs.sectionsCustomized);
  writeJson(WIZARD_DISMISSED_KEY, prefs.wizardDismissed);
}

export function loadFavoriteToolIds(): string[] {
  return readJson<string[]>(FAVORITES_KEY, []);
}

export function toggleFavoriteToolId(toolId: string): string[] {
  const current = loadFavoriteToolIds();
  const next = current.includes(toolId) ? current.filter((id) => id !== toolId) : [toolId, ...current];
  writeJson(FAVORITES_KEY, next);
  syncServerToolsPrefs({ favoriteToolIds: next });
  return next;
}

export function loadRecentToolIds(): string[] {
  return readJson<string[]>(RECENT_KEY, []);
}

export function loadToolOpenCounts(): Record<string, number> {
  return readJson<Record<string, number>>(OPEN_COUNTS_KEY, {});
}

export function pushRecentToolId(toolId: string): string[] {
  const next = [toolId, ...loadRecentToolIds().filter((id) => id !== toolId)].slice(0, 6);
  writeJson(RECENT_KEY, next);
  const counts = loadToolOpenCounts();
  counts[toolId] = (counts[toolId] || 0) + 1;
  writeJson(OPEN_COUNTS_KEY, counts);
  syncServerToolsPrefs({ recentToolIds: next, openCounts: counts });
  return next;
}

/** Ferramentas mais abertas pelo usuário (exclui as já listadas em recent se quiser). */
export function loadMostUsedToolIds(limit = 3): string[] {
  const counts = loadToolOpenCounts();
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

export function isToolsWizardDismissed(): boolean {
  return Boolean(readJson<boolean>(WIZARD_DISMISSED_KEY, false));
}

export function dismissToolsWizard() {
  writeJson(WIZARD_DISMISSED_KEY, true);
  syncServerToolsPrefs({ wizardDismissed: true });
}

export function reopenToolsWizard() {
  writeJson(WIZARD_DISMISSED_KEY, false);
  syncServerToolsPrefs({ wizardDismissed: false });
}

export function loadPinnedCategoryId(): ToolCategoryId | null {
  return readJson<ToolCategoryId | null>(PINNED_CATEGORY_KEY, null);
}

export function setPinnedCategoryId(categoryId: ToolCategoryId | null): ToolCategoryId | null {
  writeJson(PINNED_CATEGORY_KEY, categoryId);
  syncServerToolsPrefs({ pinnedCategoryId: categoryId });
  return categoryId;
}

export function loadCollapsedCategoryIds(): ToolCategoryId[] {
  return readJson<ToolCategoryId[]>(COLLAPSED_KEY, []);
}

export function toggleCollapsedCategoryId(categoryId: ToolCategoryId): ToolCategoryId[] {
  const current = loadCollapsedCategoryIds();
  const next = current.includes(categoryId)
    ? current.filter((id) => id !== categoryId)
    : [...current, categoryId];
  writeJson(COLLAPSED_KEY, next);
  writeJson(SECTIONS_CUSTOMIZED_KEY, true);
  syncServerToolsPrefs({ collapsedCategories: next, sectionsCustomized: true });
  return next;
}

/** Define de uma vez a lista de categorias recolhidas (usado no cálculo do estado inicial "recolhido por padrão"). */
export function setCollapsedCategoryIds(categoryIds: ToolCategoryId[]): ToolCategoryId[] {
  writeJson(COLLAPSED_KEY, categoryIds);
  syncServerToolsPrefs({ collapsedCategories: categoryIds });
  return categoryIds;
}

export function hasCustomizedSections(): boolean {
  return Boolean(readJson<boolean>(SECTIONS_CUSTOMIZED_KEY, false));
}
