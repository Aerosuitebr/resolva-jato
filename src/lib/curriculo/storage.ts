import type { ResumeData } from './types';
import { normalizeResume } from './defaults';
import { getSession } from '@/lib/auth';

const STORAGE_PREFIX = 'resolva-jato-resumes';

function storageKey() {
  const email = getSession()?.user.email ?? 'guest';
  return `${STORAGE_PREFIX}:${email}`;
}

export function listResumes(): ResumeData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeResume(item as Partial<ResumeData> & Record<string, unknown>))
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  } catch {
    return [];
  }
}

export function saveResume(resume: ResumeData) {
  if (typeof window === 'undefined') return resume;
  const resumes = listResumes();
  const next = normalizeResume({ ...resume, updatedAt: new Date().toISOString() });
  const index = resumes.findIndex((item) => item.id === next.id);
  const updated = index >= 0 ? resumes.map((item, i) => (i === index ? next : item)) : [next, ...resumes];
  localStorage.setItem(storageKey(), JSON.stringify(updated));
  return next;
}

export function deleteResume(resumeId: string) {
  if (typeof window === 'undefined') return;
  const updated = listResumes().filter((item) => item.id !== resumeId);
  localStorage.setItem(storageKey(), JSON.stringify(updated));
}

export function getResume(resumeId: string) {
  return listResumes().find((item) => item.id === resumeId) ?? null;
}
