const SAVED_KEY = 'rj.search.savedResources';

function resourceKey(name: string, url: string) {
  return `${name}::${url}`;
}

function readKeys(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function writeKeys(keys: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(keys));
}

export function loadSavedResourceKeys(): string[] {
  return readKeys();
}

export function toggleSavedResource(name: string, url: string): string[] {
  const key = resourceKey(name, url);
  const current = readKeys();
  const next = current.includes(key) ? current.filter((item) => item !== key) : [key, ...current];
  writeKeys(next);
  return next;
}

export function makeResourceKey(name: string, url: string) {
  return resourceKey(name, url);
}
