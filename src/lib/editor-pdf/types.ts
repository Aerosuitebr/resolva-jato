export type PageFitMode = 'contain' | 'cover' | 'stretch' | 'none';

export type PageSizePreset = 'original' | 'a4' | 'letter' | 'a5' | 'square' | 'custom';

export interface PageSizeConfig {
  preset: PageSizePreset;
  width: number;
  height: number;
  fit: PageFitMode;
}

export type OverlayKind = 'text' | 'image' | 'rect' | 'highlight' | 'erase' | 'line';

export interface PageOverlay {
  id: string;
  kind: OverlayKind;
  /** Posição e tamanho em % da página (origem no topo-esquerdo). */
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  /** Texto original extraído do PDF (para saber se mudou). */
  originalText?: string;
  fontSize?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  /** Nome da fonte no PDF (cru). */
  pdfFontName?: string;
  /** Nome amigável detectado / escolhido. */
  fontLabel?: string;
  /** ID no catálogo EDITOR_FONTS. */
  fontId?: string;
  imageDataUrl?: string;
  fill?: string;
  /** Cor do traço (linhas). */
  stroke?: string;
  /** Espessura do traço em % da menor aresta da página. */
  strokeWidth?: number;
  opacity?: number;
  /** Veio do conteúdo do PDF — edição in-place. */
  fromPdf?: boolean;
  /** Usuário alterou posição/conteúdo — precisa redesenhar no export. */
  dirty?: boolean;
  /** Desenha fundo branco atrás (cobre o pixel original no export). */
  coverBackground?: boolean;
  /**
   * Região original a cobrir no preview/export (fixa ao mover).
   * Em % da página, igual a x/y/w/h na extração.
   */
  coverX?: number;
  coverY?: number;
  coverW?: number;
  coverH?: number;
  /** Cor amostrada do fundo do PDF para cobrir o glyph (evita mancha branca). */
  coverFill?: string;
}

export interface SourceFile {
  id: string;
  name: string;
  bytes: ArrayBuffer;
  pageCount: number;
}

export interface PageItem {
  id: string;
  sourceId: string;
  sourcePageIndex: number;
  rotation: number;
  thumbnail: string;
  selected: boolean;
  isBlank?: boolean;
  originalWidth: number;
  originalHeight: number;
  pageSize: PageSizeConfig;
  overlays: PageOverlay[];
  /** Já carregou a camada de texto editável do PDF. */
  textLayerReady?: boolean;
}

export interface BuildOptions {
  pageNumbers: boolean;
  watermarkText: string;
  watermarkOpacity: number;
}

export const PAGE_PRESETS: Record<
  Exclude<PageSizePreset, 'original' | 'custom'>,
  { label: string; width: number; height: number }
> = {
  a4: { label: 'A4 (210×297 mm)', width: 595.28, height: 841.89 },
  letter: { label: 'Letter (8.5×11 in)', width: 612, height: 792 },
  a5: { label: 'A5 (148×210 mm)', width: 419.53, height: 595.28 },
  square: { label: 'Quadrado', width: 595.28, height: 595.28 }
};

export function defaultPageSize(width: number, height: number): PageSizeConfig {
  return {
    preset: 'original',
    width,
    height,
    fit: 'contain'
  };
}

export function resolvePageSize(
  page: Pick<PageItem, 'originalWidth' | 'originalHeight' | 'pageSize' | 'rotation'>
): { width: number; height: number } {
  const rotated = page.rotation % 180 !== 0;
  const ow = rotated ? page.originalHeight : page.originalWidth;
  const oh = rotated ? page.originalWidth : page.originalHeight;
  if (page.pageSize.preset === 'original') {
    return { width: ow, height: oh };
  }
  return {
    width: Math.max(72, page.pageSize.width),
    height: Math.max(72, page.pageSize.height)
  };
}

/** Overlay do PDF ainda não alterado — deve só servir de hit-target. */
export function isFromPdfPristine(overlay: PageOverlay): boolean {
  return Boolean(overlay.fromPdf) && !overlay.dirty;
}
