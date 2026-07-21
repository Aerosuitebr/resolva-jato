import type { OrcamentoItem } from './types';

export const ORCAMENTO_PREFS_KEY = 'resolva-jato-orcamento-prefs';

export interface OrcamentoPrefs {
  profissionalNome: string;
  profissionalWhatsapp: string;
  profissionalEmail: string;
}

export function createEmptyItem(): OrcamentoItem {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `item_${Date.now()}`,
    nome: '',
    quantidade: 1,
    valorUnitario: 0
  };
}

export function loadOrcamentoPrefs(): OrcamentoPrefs {
  if (typeof window === 'undefined') {
    return { profissionalNome: '', profissionalWhatsapp: '', profissionalEmail: '' };
  }
  try {
    const parsed = JSON.parse(localStorage.getItem(ORCAMENTO_PREFS_KEY) || '{}') as Partial<OrcamentoPrefs>;
    return {
      profissionalNome: parsed.profissionalNome || '',
      profissionalWhatsapp: parsed.profissionalWhatsapp || '',
      profissionalEmail: parsed.profissionalEmail || ''
    };
  } catch {
    return { profissionalNome: '', profissionalWhatsapp: '', profissionalEmail: '' };
  }
}

export function saveOrcamentoPrefs(prefs: OrcamentoPrefs) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ORCAMENTO_PREFS_KEY, JSON.stringify(prefs));
}
