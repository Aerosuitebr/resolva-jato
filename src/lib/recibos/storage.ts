import type { ReceiptData } from './types';
import { getSession } from '@/lib/auth';
import { normalizeSignature } from '@/lib/signatures/types';

function normalizeReceipt(receipt: ReceiptData): ReceiptData {
  return {
    ...receipt,
    inkSaver: Boolean(receipt.inkSaver),
    signature: normalizeSignature(receipt.signature, receipt.receiver?.name ?? '')
  };
}

const STORAGE_PREFIX = 'resolva-jato-recibos';

function storageKey() {
  const email = getSession()?.user.email ?? 'guest';
  return `${STORAGE_PREFIX}:${email}`;
}

export function listReceipts(): ReceiptData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReceiptData[];
    return Array.isArray(parsed)
      ? parsed.map(normalizeReceipt).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      : [];
  } catch {
    return [];
  }
}

export function saveReceipt(receipt: ReceiptData) {
  if (typeof window === 'undefined') return receipt;
  const receipts = listReceipts();
  const next = normalizeReceipt({ ...receipt, updatedAt: new Date().toISOString() });
  const index = receipts.findIndex((item) => item.id === next.id);
  const updated = index >= 0 ? receipts.map((item, i) => (i === index ? next : item)) : [next, ...receipts];
  localStorage.setItem(storageKey(), JSON.stringify(updated));
  return next;
}

export function deleteReceipt(receiptId: string) {
  if (typeof window === 'undefined') return;
  const updated = listReceipts().filter((item) => item.id !== receiptId);
  localStorage.setItem(storageKey(), JSON.stringify(updated));
}
