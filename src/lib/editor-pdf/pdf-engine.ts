import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import {
  fetchFontTtf,
  getFontOptionById,
  isBoldPdfFont,
  resolveFontFromPdfName
} from '@/lib/editor-pdf/fonts';
import {
  defaultPageSize,
  isFromPdfPristine,
  resolvePageSize,
  type BuildOptions,
  type PageItem,
  type PageOverlay,
  type SourceFile
} from '@/lib/editor-pdf/types';

export type {
  BuildOptions,
  PageFitMode,
  PageItem,
  PageOverlay,
  PageSizeConfig,
  PageSizePreset,
  SourceFile
} from '@/lib/editor-pdf/types';

export { PAGE_PRESETS, defaultPageSize, isFromPdfPristine, resolvePageSize } from '@/lib/editor-pdf/types';

let pdfjsLibPromise: Promise<typeof import('pdfjs-dist')> | null = null;

async function getPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import('pdfjs-dist').then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js';
      return mod;
    });
  }
  return pdfjsLibPromise;
}

let idCounter = 0;
export function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function hexToRgb(hex: string) {
  const raw = hex.replace('#', '').trim();
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw.padEnd(6, '0').slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return { r: 0.1, g: 0.1, b: 0.1 };
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255
  };
}

function loadImageElement(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Falha ao carregar preview'));
    img.src = url;
  });
}

/**
 * Amostra a cor de fundo sob cada texto do PDF (borda da caixa)
 * para cobrir o glyph sem mancha branca em headers coloridos.
 */
export async function sampleCoverFillsFromPreview(
  previewUrl: string,
  overlays: PageOverlay[]
): Promise<PageOverlay[]> {
  if (!previewUrl || overlays.length === 0) return overlays;
  try {
    const img = await loadImageElement(previewUrl);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || !canvas.width || !canvas.height) return overlays;
    ctx.drawImage(img, 0, 0);

    return overlays.map((overlay) => {
      if (overlay.kind !== 'text' || !overlay.fromPdf) return overlay;
      const fill = sampleOverlayBackground(ctx, canvas.width, canvas.height, overlay);
      return fill ? { ...overlay, coverFill: fill } : overlay;
    });
  } catch {
    return overlays;
  }
}

function sampleOverlayBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  overlay: PageOverlay
) {
  const cx = overlay.coverX ?? overlay.x;
  const cy = overlay.coverY ?? overlay.y;
  const cw = overlay.coverW ?? overlay.w;
  const ch = overlay.coverH ?? overlay.h;
  const pts: Array<[number, number]> = [
    [cx + cw * 0.08, cy + ch * 0.1],
    [cx + cw * 0.5, cy + ch * 0.06],
    [cx + cw * 0.92, cy + ch * 0.1],
    [cx + cw * 0.04, cy + ch * 0.5],
    [cx + cw * 0.96, cy + ch * 0.5]
  ];

  const samples: Array<{ r: number; g: number; b: number; lum: number }> = [];
  for (const [px, py] of pts) {
    const x = Math.min(width - 1, Math.max(0, Math.round((px / 100) * width)));
    const y = Math.min(height - 1, Math.max(0, Math.round((py / 100) * height)));
    const data = ctx.getImageData(x, y, 1, 1).data;
    const r = data[0];
    const g = data[1];
    const b = data[2];
    samples.push({ r, g, b, lum: 0.299 * r + 0.587 * g + 0.114 * b });
  }

  // Evita amostrar o próprio glyph (quase preto).
  const bg = samples.filter((s) => s.lum > 35);
  const pool = bg.length >= 2 ? bg : samples;
  const sum = pool.reduce(
    (acc, s) => ({ r: acc.r + s.r, g: acc.g + s.g, b: acc.b + s.b }),
    { r: 0, g: 0, b: 0 }
  );
  const n = pool.length || 1;
  const toHex = (v: number) =>
    Math.round(v / n)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(sum.r)}${toHex(sum.g)}${toHex(sum.b)}`;
}

/** Lê um arquivo PDF, gera 1 SourceFile + miniaturas de todas as páginas. */
export async function loadPdfIntoPages(file: File): Promise<{ source: SourceFile; pages: PageItem[] }> {
  const bytes = await file.arrayBuffer();
  const pdfjs = await getPdfjs();
  const loadingTask = pdfjs.getDocument({ data: bytes.slice(0) });
  const doc = await loadingTask.promise;

  const sourceId = nextId('src');
  const pages: PageItem[] = [];

  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const thumbScale = Math.min(1, 320 / Math.max(viewport.width, viewport.height));
    const thumbViewport = page.getViewport({
      scale: Math.max(thumbScale, 0.25)
    });

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(thumbViewport.width);
    canvas.height = Math.ceil(thumbViewport.height);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      await page.render({ canvasContext: ctx, viewport: thumbViewport }).promise;
    }

    pages.push({
      id: nextId('page'),
      sourceId,
      sourcePageIndex: i - 1,
      rotation: 0,
      thumbnail: canvas.toDataURL('image/jpeg', 0.72),
      selected: false,
      originalWidth: viewport.width,
      originalHeight: viewport.height,
      pageSize: defaultPageSize(viewport.width, viewport.height),
      overlays: []
    });
  }

  await doc.destroy();

  return {
    source: { id: sourceId, name: file.name, bytes, pageCount: pages.length },
    pages
  };
}

/** Renderiza uma página fonte em data URL (para o editor de canvas). */
export async function renderPagePreview(
  source: SourceFile,
  pageIndex: number,
  rotation = 0,
  maxEdge = 1400
): Promise<string> {
  const pdfjs = await getPdfjs();
  const doc = await pdfjs.getDocument({ data: source.bytes.slice(0) }).promise;
  const page = await doc.getPage(pageIndex + 1);
  const base = page.getViewport({ scale: 1, rotation: rotation });
  const scale = Math.min(2.2, maxEdge / Math.max(base.width, base.height));
  const viewport = page.getViewport({ scale, rotation });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    await page.render({ canvasContext: ctx, viewport }).promise;
  }
  const url = canvas.toDataURL('image/jpeg', 0.92);
  await doc.destroy();
  return url;
}

/**
 * Extrai os trechos de texto da página com posição, para edição in-place.
 * Cada item vira um overlay editável que cobre o glyph original.
 */
export async function extractPageTextOverlays(
  source: SourceFile,
  pageIndex: number,
  rotation = 0
): Promise<PageOverlay[]> {
  const pdfjs = await getPdfjs();
  const doc = await pdfjs.getDocument({ data: source.bytes.slice(0) }).promise;
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale: 1, rotation });
  const textContent = await page.getTextContent();
  const overlays: PageOverlay[] = [];

  for (const raw of textContent.items) {
    if (!raw || typeof raw !== 'object' || !('str' in raw)) continue;
    const item = raw as {
      str: string;
      transform: number[];
      width: number;
      height?: number;
      fontName?: string;
    };
    const str = item.str;
    if (!str || !str.trim()) continue;

    const tx = pdfjs.Util.transform(viewport.transform, item.transform);
    const fontHeight = Math.hypot(tx[2], tx[3]) || Math.hypot(tx[0], tx[1]) || 12;
    // item.width já vem em unidades de usuário do PDF (não multiplicar pelo fontSize).
    const viewportScaleX = Math.hypot(viewport.transform[0], viewport.transform[1]) || 1;
    const reportedWidth = Math.max(0, (item.width || 0) * viewportScaleX);
    const estimatedWidth = Math.max(str.trim().length, 1) * fontHeight * 0.56;
    let width = reportedWidth > 0 ? reportedWidth : estimatedWidth;
    if (reportedWidth > 0 && estimatedWidth > 0) {
      // Se o width reportado destoar demais da estimativa, prefere a estimativa.
      if (width > estimatedWidth * 1.8) width = estimatedWidth * 1.08;
      if (width < estimatedWidth * 0.4) width = estimatedWidth;
    }
    // Baseline → topo da caixa (viewport já tem Y para baixo).
    // Caixa justa no glifo para não invadir a linha de baixo.
    const height = fontHeight * 0.88;
    const xPdf = tx[4];
    const yPdf = tx[5] - fontHeight * 0.78;

    const padX = Math.max(0.15, fontHeight * 0.03);
    const padY = Math.max(0.06, fontHeight * 0.02);
    const x = ((xPdf - padX) / viewport.width) * 100;
    const y = ((yPdf - padY) / viewport.height) * 100;
    let w = ((width + padX * 2) / viewport.width) * 100;
    let h = ((height + padY * 2) / viewport.height) * 100;
    // Mínimo clicável sem “comer” a linha seguinte.
    h = Math.max(h, 0.72);
    w = Math.max(w, 0.9);

    if (w <= 0.05 || h <= 0.05) continue;
    // Descarta caixas patológicas.
    if (w > 55 && str.trim().length <= 20) continue;
    if (w > 80) continue;

    const resolved = resolveFontFromPdfName(item.fontName);
    const bold = isBoldPdfFont(item.fontName);
    const box = normalizeOverlayBox(x, y, w, h);

    overlays.push({
      id: nextId('txt'),
      kind: 'text',
      ...box,
      ...coverFromBox(box),
      text: str,
      originalText: str,
      fontSize: Math.max(7, height * 0.9),
      color: '#0f172a',
      bold,
      pdfFontName: item.fontName || '',
      fontLabel: resolved.displayName,
      fontId: resolved.option.id,
      fromPdf: true,
      coverBackground: true,
      align: 'left'
    });
  }

  await doc.destroy();
  return overlays;
}

type Matrix = [number, number, number, number, number, number];

function multiplyMatrix(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5]
  ];
}

function applyMatrix(m: Matrix, x: number, y: number) {
  return {
    x: m[0] * x + m[2] * y + m[4],
    y: m[1] * x + m[3] * y + m[5]
  };
}

function normalizeOverlayBox(x: number, y: number, w: number, h: number) {
  const nx = clamp(x, 0, 99.5);
  const ny = clamp(y, 0, 99.5);
  return {
    x: nx,
    y: ny,
    w: clamp(w, 0.15, 100 - nx),
    h: clamp(h, 0.15, 100 - ny)
  };
}

function coverFromBox(box: { x: number; y: number; w: number; h: number }) {
  return {
    coverX: box.x,
    coverY: box.y,
    coverW: box.w,
    coverH: box.h
  };
}

function boxFromUserQuad(
  viewport: { width: number; height: number; transform: number[] },
  pdfjs: typeof import('pdfjs-dist'),
  ctm: Matrix,
  x0: number,
  y0: number,
  x1: number,
  y1: number
) {
  const corners = [
    applyMatrix(ctm, x0, y0),
    applyMatrix(ctm, x1, y0),
    applyMatrix(ctm, x0, y1),
    applyMatrix(ctm, x1, y1)
  ].map((p) => {
    const v = pdfjs.Util.applyTransform([p.x, p.y], viewport.transform);
    return { x: v[0], y: v[1] };
  });
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return normalizeOverlayBox(
    (minX / viewport.width) * 100,
    (minY / viewport.height) * 100,
    ((maxX - minX) / viewport.width) * 100,
    ((maxY - minY) / viewport.height) * 100
  );
}

function rgbToHex(r: number, g: number, b: number) {
  const to = (n: number) =>
    Math.round(clamp(n, 0, 1) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/**
 * Extrai imagens e linhas/retângulos finos da página (operator list do pdf.js)
 * para seleção e movimentação no editor.
 */
export async function extractPageGraphicOverlays(
  source: SourceFile,
  pageIndex: number,
  rotation = 0
): Promise<PageOverlay[]> {
  const pdfjs = await getPdfjs();
  const doc = await pdfjs.getDocument({ data: source.bytes.slice(0) }).promise;
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale: 1, rotation });
  const opList = await page.getOperatorList();
  const { OPS } = pdfjs;

  const overlays: PageOverlay[] = [];
  const ctmStack: Matrix[] = [];
  let ctm: Matrix = [1, 0, 0, 1, 0, 0];
  let strokeRgb = { r: 0, g: 0, b: 0 };
  let fillRgb = { r: 0, g: 0, b: 0 };
  let lineWidth = 1;
  let pendingRect: { x: number; y: number; w: number; h: number } | null = null;
  let pathPoints: Array<{ x: number; y: number }> = [];
  let pathStart: { x: number; y: number } | null = null;

  const pushImageSlot = () => {
    // Imagem PDF: quadrado unitário transformado pelo CTM.
    const box = boxFromUserQuad(viewport, pdfjs, ctm, 0, 0, 1, 1);
    const areaPct = (box.w * box.h) / 100; // % da área da página (0–100)
    // Fundos rasterizados (ex.: DANFE/comprovante em página inteira) não podem
    // virar overlay — cobrem 100% e roubam o clique do texto.
    if (areaPct > 35 || (box.w > 85 && box.h > 85)) return;
    if (areaPct < 0.2 || box.w < 0.5 || box.h < 0.5) return;
    if (overlays.some((o) => o.kind === 'image' && Math.abs(o.x - box.x) < 0.35 && Math.abs(o.y - box.y) < 0.35)) {
      return;
    }
    overlays.push({
      id: nextId('img'),
      kind: 'image',
      ...box,
      ...coverFromBox(box),
      fromPdf: true,
      coverBackground: true,
      opacity: 1
    });
  };

  const pushThinShape = (ux: number, uy: number, uw: number, uh: number, color: string) => {
    // Linhas de tabela no PDF costumam ser rect finos com fill (não só stroke).
    const absW = Math.abs(uw) < 0.05 ? Math.max(lineWidth, 0.4) : uw;
    const absH = Math.abs(uh) < 0.05 ? Math.max(lineWidth, 0.4) : uh;
    const box = boxFromUserQuad(viewport, pdfjs, ctm, ux, uy, ux + absW, uy + absH);
    const minSide = Math.min(box.w, box.h);
    const maxSide = Math.max(box.w, box.h);
    if (maxSide < 8) return;
    const isLine = minSide <= 2.2 && maxSide >= 8 && minSide / maxSide < 0.085;
    if (!isLine) return;
    // Evita duplicar o mesmo separador.
    if (
      overlays.some(
        (o) =>
          o.kind === 'line' &&
          Math.abs((o.coverY ?? o.y) - box.y) < 0.5 &&
          Math.abs((o.coverX ?? o.x) - box.x) < 1.2 &&
          Math.abs((o.coverW ?? o.w) - box.w) < 3
      )
    ) {
      return;
    }
    // Área de clique maior que o traço visual (difícil acertar 1px).
    const hitPad = 1.25;
    const hitBox =
      box.w >= box.h
        ? {
            x: box.x,
            y: box.y - (hitPad - box.h) / 2,
            w: box.w,
            h: Math.max(box.h, hitPad)
          }
        : {
            x: box.x - (hitPad - box.w) / 2,
            y: box.y,
            w: Math.max(box.w, hitPad),
            h: box.h
          };
    const normalized = normalizeOverlayBox(hitBox.x, hitBox.y, hitBox.w, hitBox.h);
    overlays.push({
      id: nextId('ln'),
      kind: 'line',
      ...normalized,
      ...coverFromBox(box),
      stroke: color,
      fill: color,
      strokeWidth: Math.max(0.12, minSide),
      fromPdf: true,
      coverBackground: true,
      opacity: 1
    });
  };

  for (let i = 0; i < opList.fnArray.length; i += 1) {
    const fn = opList.fnArray[i];
    const args = opList.argsArray[i] as unknown[];

    if (fn === OPS.save) {
      ctmStack.push(ctm.slice() as Matrix);
      continue;
    }
    if (fn === OPS.restore) {
      ctm = ctmStack.pop() || ([1, 0, 0, 1, 0, 0] as Matrix);
      pendingRect = null;
      pathPoints = [];
      pathStart = null;
      continue;
    }
    if (fn === OPS.transform && args?.length >= 6) {
      ctm = multiplyMatrix(ctm, args as Matrix);
      continue;
    }
    if (fn === OPS.setLineWidth && typeof args?.[0] === 'number') {
      lineWidth = Math.max(0.2, args[0] as number);
      continue;
    }
    if (fn === OPS.setStrokeRGBColor && args?.length >= 3) {
      strokeRgb = { r: args[0] as number, g: args[1] as number, b: args[2] as number };
      continue;
    }
    if (fn === OPS.setFillRGBColor && args?.length >= 3) {
      fillRgb = { r: args[0] as number, g: args[1] as number, b: args[2] as number };
      continue;
    }
    if (fn === OPS.setStrokeGray && typeof args?.[0] === 'number') {
      const g = args[0] as number;
      strokeRgb = { r: g, g, b: g };
      continue;
    }
    if (fn === OPS.setFillGray && typeof args?.[0] === 'number') {
      const g = args[0] as number;
      fillRgb = { r: g, g, b: g };
      continue;
    }
    if (fn === OPS.rectangle && args?.length >= 4) {
      pendingRect = {
        x: args[0] as number,
        y: args[1] as number,
        w: args[2] as number,
        h: args[3] as number
      };
      pathPoints = [];
      pathStart = null;
      continue;
    }
    if (fn === OPS.moveTo && args?.length >= 2) {
      pathStart = { x: args[0] as number, y: args[1] as number };
      pathPoints = [pathStart];
      pendingRect = null;
      continue;
    }
    if (fn === OPS.lineTo && args?.length >= 2) {
      pathPoints.push({ x: args[0] as number, y: args[1] as number });
      continue;
    }
    if (fn === OPS.closePath && pathStart) {
      pathPoints.push(pathStart);
      continue;
    }
    if (
      fn === OPS.stroke ||
      fn === OPS.closeStroke ||
      fn === OPS.fillStroke ||
      fn === OPS.closeFillStroke
    ) {
      const color = rgbToHex(strokeRgb.r, strokeRgb.g, strokeRgb.b);
      if (pendingRect) {
        const { x, y, w, h } = pendingRect;
        // Se a altura/largura do rect for ~0, usar lineWidth.
        const rw = Math.abs(w) < 0.01 ? lineWidth : w;
        const rh = Math.abs(h) < 0.01 ? lineWidth : h;
        pushThinShape(x, y, rw, rh, color);
        pendingRect = null;
      } else if (pathPoints.length >= 2) {
        for (let p = 1; p < pathPoints.length; p += 1) {
          const a = pathPoints[p - 1];
          const b = pathPoints[p];
          const minX = Math.min(a.x, b.x);
          const minY = Math.min(a.y, b.y);
          const dx = Math.abs(a.x - b.x);
          const dy = Math.abs(a.y - b.y);
          if (dx < 0.01 && dy < 0.01) continue;
          if (dy <= dx * 0.08) {
            pushThinShape(minX, minY - lineWidth / 2, Math.max(dx, 0.5), lineWidth, color);
          } else if (dx <= dy * 0.08) {
            pushThinShape(minX - lineWidth / 2, minY, lineWidth, Math.max(dy, 0.5), color);
          }
        }
      }
      pathPoints = [];
      pathStart = null;
      continue;
    }
    if (fn === OPS.fill || fn === OPS.eoFill) {
      const color = rgbToHex(fillRgb.r, fillRgb.g, fillRgb.b);
      if (pendingRect) {
        pushThinShape(pendingRect.x, pendingRect.y, pendingRect.w, pendingRect.h, color);
        pendingRect = null;
      } else if (pathPoints.length >= 2) {
        // Path fechado fino (às vezes usado como linha).
        for (let p = 1; p < pathPoints.length; p += 1) {
          const a = pathPoints[p - 1];
          const b = pathPoints[p];
          const minX = Math.min(a.x, b.x);
          const minY = Math.min(a.y, b.y);
          const dx = Math.abs(a.x - b.x);
          const dy = Math.abs(a.y - b.y);
          if (dx < 0.01 && dy < 0.01) continue;
          if (dy <= dx * 0.08) {
            pushThinShape(minX, minY - lineWidth / 2, Math.max(dx, 0.5), lineWidth, color);
          } else if (dx <= dy * 0.08) {
            pushThinShape(minX - lineWidth / 2, minY, lineWidth, Math.max(dy, 0.5), color);
          }
        }
      }
      pathPoints = [];
      pathStart = null;
      continue;
    }
    if (fn === OPS.paintImageXObject || fn === OPS.paintImageMaskXObject) {
      pushImageSlot();
      continue;
    }
    if (fn === OPS.paintInlineImageXObject) {
      pushImageSlot();
      continue;
    }
    if (fn === OPS.constructPath && Array.isArray(args) && args.length >= 2) {
      // pdf.js moderno: [ops, coords]
      const subOps = args[0] as number[];
      const coords = args[1] as number[];
      let ci = 0;
      let localPoints: Array<{ x: number; y: number }> = [];
      let localStart: { x: number; y: number } | null = null;
      let localRect: { x: number; y: number; w: number; h: number } | null = null;
      for (const op of subOps) {
        if (op === OPS.rectangle) {
          localRect = {
            x: coords[ci++],
            y: coords[ci++],
            w: coords[ci++],
            h: coords[ci++]
          };
        } else if (op === OPS.moveTo) {
          localStart = { x: coords[ci++], y: coords[ci++] };
          localPoints = [localStart];
        } else if (op === OPS.lineTo) {
          localPoints.push({ x: coords[ci++], y: coords[ci++] });
        } else if (op === OPS.closePath && localStart) {
          localPoints.push(localStart);
        } else if (op === OPS.curveTo) {
          ci += 6;
        } else if (op === OPS.curveTo2 || op === OPS.curveTo3) {
          ci += 4;
        }
      }
      if (localRect) pendingRect = localRect;
      if (localPoints.length) {
        pathPoints = localPoints;
        pathStart = localStart;
      }
    }
  }

  // Recorta bitmaps do raster da página (fiel ao preview; evita máscaras quebradas).
  const imageOverlays = overlays.filter((o) => o.kind === 'image');
  if (imageOverlays.length > 0) {
    const scale = Math.min(2.5, 1600 / Math.max(viewport.width, viewport.height));
    const renderViewport = page.getViewport({ scale, rotation });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(renderViewport.width);
    canvas.height = Math.ceil(renderViewport.height);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;
      for (const ov of imageOverlays) {
        const sx = Math.floor((ov.x / 100) * canvas.width);
        const sy = Math.floor((ov.y / 100) * canvas.height);
        const sw = Math.max(1, Math.ceil((ov.w / 100) * canvas.width));
        const sh = Math.max(1, Math.ceil((ov.h / 100) * canvas.height));
        const crop = document.createElement('canvas');
        crop.width = sw;
        crop.height = sh;
        const cctx = crop.getContext('2d');
        if (!cctx) continue;
        cctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
        ov.imageDataUrl = crop.toDataURL('image/png');
      }
    }
  }

  await doc.destroy();
  return overlays;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Gera a miniatura de uma página em branco A4. */
export function blankPageThumbnail(width = 595.28, height = 841.89): string {
  const canvas = document.createElement('canvas');
  const ratio = height / Math.max(width, 1);
  canvas.width = 240;
  canvas.height = Math.round(240 * ratio);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  }
  return canvas.toDataURL('image/png');
}

function wrapAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function fitRect(
  contentW: number,
  contentH: number,
  boxW: number,
  boxH: number,
  fit: PageItem['pageSize']['fit']
) {
  if (fit === 'stretch') {
    return { x: 0, y: 0, width: boxW, height: boxH };
  }
  if (fit === 'none') {
    return { x: 0, y: boxH - contentH, width: contentW, height: contentH };
  }
  const scale =
    fit === 'cover'
      ? Math.max(boxW / contentW, boxH / contentH)
      : Math.min(boxW / contentW, boxH / contentH);
  const width = contentW * scale;
  const height = contentH * scale;
  return {
    x: (boxW - width) / 2,
    y: (boxH - height) / 2,
    width,
    height
  };
}

async function drawOverlays(
  page: PDFPage,
  overlays: PageOverlay[],
  fonts: {
    regular: PDFFont;
    bold: PDFFont;
    times: PDFFont;
    timesBold: PDFFont;
    courier: PDFFont;
    courierBold: PDFFont;
    custom: Map<string, PDFFont>;
  }
) {
  const { width, height } = page.getSize();

  for (const overlay of overlays) {
    // Mantém o PDF original intacto até o usuário alterar o overlay.
    if (isFromPdfPristine(overlay)) continue;

    const x = (overlay.x / 100) * width;
    const w = Math.max(1, (overlay.w / 100) * width);
    const h = Math.max(1, (overlay.h / 100) * height);
    const yTop = (overlay.y / 100) * height;
    const y = height - yTop - h;
    const opacity = overlay.opacity ?? 1;

    if (
      overlay.fromPdf &&
      overlay.coverX != null &&
      overlay.coverY != null &&
      overlay.coverW != null &&
      overlay.coverH != null
    ) {
      const cx = (overlay.coverX / 100) * width;
      const cw = Math.max(1, (overlay.coverW / 100) * width);
      const ch = Math.max(1, (overlay.coverH / 100) * height);
      const cyTop = (overlay.coverY / 100) * height;
      const cy = height - cyTop - ch;
      const pad = 1.2;
      const cover = hexToRgb(overlay.coverFill || '#ffffff');
      page.drawRectangle({
        x: cx - pad,
        y: cy - pad,
        width: cw + pad * 2,
        height: ch + pad * 2,
        color: rgb(cover.r, cover.g, cover.b),
        opacity: 1
      });
    }

    if (overlay.kind === 'erase' || overlay.kind === 'rect' || overlay.kind === 'highlight') {
      const fill = hexToRgb(overlay.fill || (overlay.kind === 'erase' ? '#ffffff' : '#0ea5e9'));
      page.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        color: rgb(fill.r, fill.g, fill.b),
        opacity: overlay.kind === 'highlight' ? Math.min(opacity, 0.45) : opacity
      });
      continue;
    }

    if (overlay.kind === 'line') {
      const stroke = hexToRgb(overlay.stroke || overlay.fill || '#0f172a');
      page.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        color: rgb(stroke.r, stroke.g, stroke.b),
        opacity
      });
      continue;
    }

    if (overlay.kind === 'image' && overlay.imageDataUrl) {
      try {
        const raw = overlay.imageDataUrl;
        const base64 = raw.split(',')[1] || raw;
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const image = raw.includes('image/png')
          ? await page.doc.embedPng(bytes)
          : await page.doc.embedJpg(bytes);
        page.drawImage(image, { x, y, width: w, height: h, opacity });
      } catch {
        // ignora imagem inválida
      }
      continue;
    }

    if (overlay.kind === 'text' && overlay.text != null) {
      if (
        (overlay.coverBackground || overlay.fromPdf) &&
        (overlay.coverX == null || overlay.coverY == null)
      ) {
        const pad = 1.2;
        const cover = hexToRgb(overlay.coverFill || '#ffffff');
        page.drawRectangle({
          x: x - pad,
          y: y - pad,
          width: w + pad * 2,
          height: h + pad * 2,
          color: rgb(cover.r, cover.g, cover.b),
          opacity: 1
        });
      }

      if (!overlay.text.trim()) continue;

      const option = getFontOptionById(overlay.fontId || 'inter');
      const weightKey = overlay.bold ? '700' : '400';
      const customKey = `${option.id}-${weightKey}`;
      let font = fonts.custom.get(customKey);
      if (!font) {
        if (option.standard === 'TimesRoman') {
          font = overlay.bold ? fonts.timesBold : fonts.times;
        } else if (option.standard === 'Courier') {
          font = overlay.bold ? fonts.courierBold : fonts.courier;
        } else {
          font = overlay.bold ? fonts.bold : fonts.regular;
        }
      }

      const fontSize = Math.max(6, overlay.fontSize || h * 0.75);
      const color = hexToRgb(overlay.color || '#0f172a');
      const lines = overlay.text.replace(/\r/g, '').split('\n');
      const lineHeight = fontSize * 1.2;
      lines.forEach((line, idx) => {
        const textWidth = font!.widthOfTextAtSize(line || ' ', fontSize);
        let drawX = x;
        if (overlay.align === 'center') drawX = x + (w - textWidth) / 2;
        if (overlay.align === 'right') drawX = x + w - textWidth;
        page.drawText(line || ' ', {
          x: Math.max(0, drawX),
          y: Math.max(0, y + h - fontSize - idx * lineHeight - 1),
          size: fontSize,
          font: font!,
          color: rgb(color.r, color.g, color.b),
          opacity,
          maxWidth: Math.max(fontSize, w)
        });
      });
    }
  }
}

async function buildFontKit(outDoc: PDFDocument, overlays: PageOverlay[]) {
  const fonts = {
    regular: await outDoc.embedFont(StandardFonts.Helvetica),
    bold: await outDoc.embedFont(StandardFonts.HelveticaBold),
    times: await outDoc.embedFont(StandardFonts.TimesRoman),
    timesBold: await outDoc.embedFont(StandardFonts.TimesRomanBold),
    courier: await outDoc.embedFont(StandardFonts.Courier),
    courierBold: await outDoc.embedFont(StandardFonts.CourierBold),
    custom: new Map<string, PDFFont>()
  };

  const needed = new Map<string, { optionId: string; bold: boolean }>();
  for (const o of overlays) {
    if (o.kind !== 'text') continue;
    const option = getFontOptionById(o.fontId || 'inter');
    const bold = Boolean(o.bold);
    needed.set(`${option.id}-${bold ? '700' : '400'}`, { optionId: option.id, bold });
  }

  for (const [key, meta] of needed) {
    const option = getFontOptionById(meta.optionId);
    const buf = await fetchFontTtf(option, meta.bold ? 700 : 400);
    if (!buf) continue;
    try {
      const embedded = await outDoc.embedFont(buf, { subset: true });
      fonts.custom.set(key, embedded);
    } catch {
      // fallback StandardFonts
    }
  }

  return fonts;
}

/** Monta o PDF final com ordem, rotação, tamanho, overlays, numeração e marca d'água. */
export async function buildFinalPdf(
  pages: PageItem[],
  sources: Map<string, SourceFile>,
  options: BuildOptions
): Promise<Uint8Array> {
  const outDoc = await PDFDocument.create();
  const srcDocCache = new Map<string, PDFDocument>();
  const allOverlays = pages.flatMap((p) => p.overlays);
  const fonts = await buildFontKit(outDoc, allOverlays);

  for (const p of pages) {
    const target = resolvePageSize(p);

    if (p.isBlank) {
      const blank = outDoc.addPage([target.width, target.height]);
      await drawOverlays(blank, p.overlays, fonts);
      continue;
    }

    let srcDoc = srcDocCache.get(p.sourceId);
    if (!srcDoc) {
      const source = sources.get(p.sourceId);
      if (!source) continue;
      srcDoc = await PDFDocument.load(source.bytes.slice(0));
      srcDocCache.set(p.sourceId, srcDoc);
    }

    const sourcePage = srcDoc.getPage(p.sourcePageIndex);
    const srcSize = sourcePage.getSize();
    const baseRotation = wrapAngle(sourcePage.getRotation().angle);
    const totalRotation = wrapAngle(baseRotation + p.rotation);
    const contentW = totalRotation % 180 === 0 ? srcSize.width : srcSize.height;
    const contentH = totalRotation % 180 === 0 ? srcSize.height : srcSize.width;

    const needsRebuild =
      p.overlays.length > 0 ||
      p.pageSize.preset !== 'original' ||
      Math.abs(target.width - contentW) > 0.5 ||
      Math.abs(target.height - contentH) > 0.5 ||
      p.rotation !== 0;

    if (!needsRebuild) {
      const [copied] = await outDoc.copyPages(srcDoc, [p.sourcePageIndex]);
      outDoc.addPage(copied);
      continue;
    }

    const [embedded] = await outDoc.embedPages([sourcePage]);
    const page = outDoc.addPage([target.width, target.height]);
    const box = fitRect(contentW, contentH, target.width, target.height, p.pageSize.fit);
    page.drawPage(embedded, {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      rotate: degrees(p.rotation || 0)
    });
    await drawOverlays(page, p.overlays, fonts);
  }

  const total = outDoc.getPageCount();

  if (options.watermarkText.trim()) {
    const font = fonts.bold;
    const text = options.watermarkText.trim();
    outDoc.getPages().forEach((page) => {
      const { width, height } = page.getSize();
      const size = Math.max(24, Math.min(width, height) / 8);
      const textWidth = font.widthOfTextAtSize(text, size);
      page.drawText(text, {
        x: width / 2 - textWidth / 2,
        y: height / 2,
        size,
        font,
        color: rgb(0.55, 0.55, 0.58),
        opacity: options.watermarkOpacity,
        rotate: degrees(45)
      });
    });
  }

  if (options.pageNumbers) {
    const font = fonts.regular;
    outDoc.getPages().forEach((page, idx) => {
      const { width } = page.getSize();
      const label = `${idx + 1} / ${total}`;
      const size = 10;
      const textWidth = font.widthOfTextAtSize(label, size);
      page.drawText(label, {
        x: width / 2 - textWidth / 2,
        y: 18,
        size,
        font,
        color: rgb(0.35, 0.35, 0.4)
      });
    });
  }

  return outDoc.save();
}

export function downloadBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
