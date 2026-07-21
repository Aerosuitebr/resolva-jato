/** Fontes padrão de sistema — compatíveis com PDF/impressão e ATS. */

export type DocumentFontId =
  | 'calibri'
  | 'arial'
  | 'helvetica'
  | 'verdana'
  | 'times'
  | 'garamond'
  | 'georgia';

export type DocumentFontKind =
  | 'curriculo'
  | 'contrato'
  | 'recibo'
  | 'peticao'
  | 'academico'
  | 'contabil';

export interface DocumentFontMeta {
  id: DocumentFontId;
  name: string;
  /** Stack CSS com fallbacks liberados / Windows / macOS. */
  stack: string;
  category: 'sans' | 'serif';
  blurb: string;
}

export const DOCUMENT_FONTS: Record<DocumentFontId, DocumentFontMeta> = {
  calibri: {
    id: 'calibri',
    name: 'Calibri',
    stack: 'Calibri, Candara, Segoe UI, Optima, sans-serif',
    category: 'sans',
    blurb: 'Moderna e legível em tela — comum em currículos ATS.'
  },
  arial: {
    id: 'arial',
    name: 'Arial',
    stack: 'Arial, Helvetica, "Helvetica Neue", sans-serif',
    category: 'sans',
    blurb: 'Clara e universal — ótima para recibos e textos curtos.'
  },
  helvetica: {
    id: 'helvetica',
    name: 'Helvetica',
    stack: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
    category: 'sans',
    blurb: 'Visual limpo e profissional, muito usada em design.'
  },
  verdana: {
    id: 'verdana',
    name: 'Verdana',
    stack: 'Verdana, Geneva, Tahoma, sans-serif',
    category: 'sans',
    blurb: 'Alta legibilidade em tamanhos menores.'
  },
  times: {
    id: 'times',
    name: 'Times New Roman',
    stack: '"Times New Roman", Times, "Liberation Serif", "Nimbus Roman", serif',
    category: 'serif',
    blurb: 'Clássica em contratos, petições e normas ABNT.'
  },
  garamond: {
    id: 'garamond',
    name: 'Garamond',
    stack: 'Garamond, "Palatino Linotype", Palatino, "Book Antiqua", serif',
    category: 'serif',
    blurb: 'Elegante e formal — ótima para textos longos impressos.'
  },
  georgia: {
    id: 'georgia',
    name: 'Georgia',
    stack: 'Georgia, "Times New Roman", Times, serif',
    category: 'serif',
    blurb: 'Serifada pensada para tela, com boa leitura digital.'
  }
};

interface KindFontConfig {
  label: string;
  hint: string;
  defaultId: DocumentFontId;
  options: DocumentFontId[];
}

export const DOCUMENT_FONT_PRESETS: Record<DocumentFontKind, KindFontConfig> = {
  curriculo: {
    label: 'Fonte do currículo',
    hint: 'Sans-serif favorece ATS e leitura em tela. Corpo 10–12 pt; títulos 14–16 pt.',
    defaultId: 'calibri',
    options: ['calibri', 'arial', 'helvetica', 'garamond', 'verdana']
  },
  contrato: {
    label: 'Fonte do contrato',
    hint: 'Serifadas transmitem formalidade e leem bem em impressos longos.',
    defaultId: 'times',
    options: ['times', 'garamond', 'georgia']
  },
  recibo: {
    label: 'Fonte do recibo',
    hint: 'Sans-serif objetivas para leitura rápida em documentos curtos.',
    defaultId: 'arial',
    options: ['arial', 'calibri', 'verdana']
  },
  peticao: {
    label: 'Fonte do documento',
    hint: 'Tradicionais do meio jurídico — seriedade e autoridade.',
    defaultId: 'times',
    options: ['times', 'garamond']
  },
  academico: {
    label: 'Fonte da capa',
    hint: 'Alinhadas à ABNT e padrões acadêmicos (Times ou Arial).',
    defaultId: 'times',
    options: ['times', 'arial']
  },
  contabil: {
    label: 'Fonte do documento',
    hint: 'Formalidade profissional com boa legibilidade em PDF.',
    defaultId: 'times',
    options: ['times', 'arial', 'calibri']
  }
};

export function isDocumentFontId(value: unknown): value is DocumentFontId {
  return typeof value === 'string' && value in DOCUMENT_FONTS;
}

export function resolveDocumentFontId(
  kind: DocumentFontKind,
  fontId?: string | null
): DocumentFontId {
  const preset = DOCUMENT_FONT_PRESETS[kind];
  if (isDocumentFontId(fontId) && preset.options.includes(fontId)) return fontId;
  return preset.defaultId;
}

export function getDocumentFontStack(
  kind: DocumentFontKind,
  fontId?: string | null
): string {
  return DOCUMENT_FONTS[resolveDocumentFontId(kind, fontId)].stack;
}

export function getDocumentFontOptions(kind: DocumentFontKind): DocumentFontMeta[] {
  return DOCUMENT_FONT_PRESETS[kind].options.map((id) => DOCUMENT_FONTS[id]);
}
