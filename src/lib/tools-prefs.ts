import type { ToolCategoryId } from '@/lib/tools-catalog';

const FAVORITES_KEY = 'rj.tools.favorites';
const RECENT_KEY = 'rj.tools.recent';
const PINNED_CATEGORY_KEY = 'rj.tools.pinnedCategory';
const COLLAPSED_KEY = 'rj.tools.collapsedCategories';
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

export function loadFavoriteToolIds(): string[] {
  return readJson<string[]>(FAVORITES_KEY, []);
}

export function toggleFavoriteToolId(toolId: string): string[] {
  const current = loadFavoriteToolIds();
  const next = current.includes(toolId) ? current.filter((id) => id !== toolId) : [toolId, ...current];
  writeJson(FAVORITES_KEY, next);
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
}

export function reopenToolsWizard() {
  writeJson(WIZARD_DISMISSED_KEY, false);
}

export function loadPinnedCategoryId(): ToolCategoryId | null {
  return readJson<ToolCategoryId | null>(PINNED_CATEGORY_KEY, null);
}

export function setPinnedCategoryId(categoryId: ToolCategoryId | null): ToolCategoryId | null {
  writeJson(PINNED_CATEGORY_KEY, categoryId);
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
  return next;
}
