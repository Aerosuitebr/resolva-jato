import { normalizeDocumentParty } from '@/lib/document-party';
import { getSession } from '@/lib/auth';
import { buildDefaultClauses } from './clauses';
import { createEmptyContabilDocument } from './defaults';
import type { ContabilDocumentData, ContabilParty } from './types';

const STORAGE_PREFIX = 'resolva-jato-contabeis';

function storageKey() {
  const email = getSession()?.user.email ?? 'guest';
  return `${STORAGE_PREFIX}:${email}`;
}

function normalizeParty(value?: Partial<ContabilParty>): ContabilParty {
  return normalizeDocumentParty(value) as ContabilParty;
}

function normalizeDocument(value: ContabilDocumentData): ContabilDocumentData {
  const base = createEmptyContabilDocument(value.templateId ?? 'servicos-contabeis');
  const merged: ContabilDocumentData = {
    ...base,
    ...value,
    partyA: normalizeParty(value.partyA),
    partyB: normalizeParty(value.partyB),
    clauses: Array.isArray(value.clauses) && value.clauses.length > 0 ? value.clauses : []
  };
  if (!merged.clauses.length) {
    merged.clauses = buildDefaultClauses(merged);
  }
  return merged;
}

export function listContabilDocuments(): ContabilDocumentData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ContabilDocumentData[];
    return Array.isArray(parsed)
      ? parsed.map(normalizeDocument).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      : [];
  } catch {
    return [];
  }
}

export function saveContabilDocument(document: ContabilDocumentData) {
  if (typeof window === 'undefined') return document;
  const next = normalizeDocument({ ...document, updatedAt: new Date().toISOString() });
  const items = listContabilDocuments();
  const index = items.findIndex((item) => item.id === next.id);
  const updated = index >= 0 ? items.map((item, i) => (i === index ? next : item)) : [next, ...items];
  localStorage.setItem(storageKey(), JSON.stringify(updated));
  return next;
}

export function deleteContabilDocument(documentId: string) {
  if (typeof window === 'undefined') return;
  const updated = listContabilDocuments().filter((item) => item.id !== documentId);
  localStorage.setItem(storageKey(), JSON.stringify(updated));
}
