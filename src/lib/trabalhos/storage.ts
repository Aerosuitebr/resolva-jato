import { getSession } from '@/lib/auth';
import { createEmptyTrabalho } from './defaults';
import type { TrabalhoData } from './types';

const STORAGE_PREFIX = 'resolva-jato-trabalhos';

function storageKey() {
  const email = getSession()?.user.email ?? 'guest';
  return `${STORAGE_PREFIX}:${email}`;
}

function normalizeTrabalho(value: TrabalhoData): TrabalhoData {
  return {
    ...createEmptyTrabalho(value.templateId ?? 'escolar'),
    ...value,
    year: value.year || String(new Date().getFullYear()),
    workNature:
      value.workNature ||
      'Trabalho apresentado como requisito parcial da disciplina.'
  };
}

export function listTrabalhos(): TrabalhoData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TrabalhoData[];
    return Array.isArray(parsed)
      ? parsed.map(normalizeTrabalho).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      : [];
  } catch {
    return [];
  }
}

export function saveTrabalho(trabalho: TrabalhoData) {
  if (typeof window === 'undefined') return trabalho;
  const next = normalizeTrabalho({ ...trabalho, updatedAt: new Date().toISOString() });
  const items = listTrabalhos();
  const index = items.findIndex((item) => item.id === next.id);
  const updated = index >= 0 ? items.map((item, i) => (i === index ? next : item)) : [next, ...items];
  localStorage.setItem(storageKey(), JSON.stringify(updated));
  return next;
}

export function deleteTrabalho(trabalhoId: string) {
  if (typeof window === 'undefined') return;
  const updated = listTrabalhos().filter((item) => item.id !== trabalhoId);
  localStorage.setItem(storageKey(), JSON.stringify(updated));
}
