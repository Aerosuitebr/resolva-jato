import { normalizeDocumentParty } from '@/lib/document-party';
import { getSession } from '@/lib/auth';
import { buildDefaultClauses } from './clauses';
import { createEmptyLegalDocument } from './defaults';
import type { LegalDocumentData, LegalParty } from './types';

const STORAGE_PREFIX = 'resolva-jato-juridicos';

function storageKey() {
  const email = getSession()?.user.email ?? 'guest';
  return `${STORAGE_PREFIX}:${email}`;
}

function normalizeParty(value?: Partial<LegalParty>): LegalParty {
  return normalizeDocumentParty(value) as LegalParty;
}

function normalizeDocument(value: LegalDocumentData): LegalDocumentData {
  const base = createEmptyLegalDocument(value.templateId ?? 'procuracao');
  const merged: LegalDocumentData = {
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

export function listLegalDocuments(): LegalDocumentData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LegalDocumentData[];
    return Array.isArray(parsed)
      ? parsed.map(normalizeDocument).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      : [];
  } catch {
    return [];
  }
}

export function saveLegalDocument(document: LegalDocumentData) {
  if (typeof window === 'undefined') return document;
  const next = normalizeDocument({ ...document, updatedAt: new Date().toISOString() });
  const items = listLegalDocuments();
  const index = items.findIndex((item) => item.id === next.id);
  const updated = index >= 0 ? items.map((item, i) => (i === index ? next : item)) : [next, ...items];
  localStorage.setItem(storageKey(), JSON.stringify(updated));
  return next;
}

export function deleteLegalDocument(documentId: string) {
  if (typeof window === 'undefined') return;
  const updated = listLegalDocuments().filter((item) => item.id !== documentId);
  localStorage.setItem(storageKey(), JSON.stringify(updated));
}
