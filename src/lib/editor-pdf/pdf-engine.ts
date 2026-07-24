import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import {
  defaultPageSize,
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

export { PAGE_PRESETS, defaultPageSize, resolvePageSize } from '@/lib/editor-pdf/types';

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
    const scaleX = Math.hypot(tx[0], tx[1]) || 1;
    const width = Math.max(fontHeight * 0.35, (item.width || 0) * scaleX);
    const height = Math.max(fontHeight * 0.85, fontHeight);
    // Origem do transform = baseline; sobe pela altura da fonte.
    const xPdf = tx[4];
    const yPdf = tx[5] - height * 0.8;

    const padX = Math.max(0.6, width * 0.04);
    const padY = Math.max(0.5, height * 0.12);
    const x = ((xPdf - padX) / viewport.width) * 100;
    const y = ((yPdf - padY) / viewport.height) * 100;
    const w = ((width + padX * 2) / viewport.width) * 100;
    const h = ((height + padY * 2) / viewport.height) * 100;

    if (w <= 0.05 || h <= 0.05) continue;

    overlays.push({
      id: nextId('txt'),
      kind: 'text',
      x: clamp(x, -2, 100),
      y: clamp(y, -2, 100),
      w: clamp(w, 0.2, 105),
      h: clamp(h, 0.3, 20),
      text: str,
      originalText: str,
      fontSize: Math.max(7, height * 0.92),
      color: '#0f172a',
      bold: /bold|black|heavy/i.test(item.fontName || ''),
      fromPdf: true,
      coverBackground: true,
      align: 'left'
    });
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
  fonts: { regular: PDFFont; bold: PDFFont }
) {
  const { width, height } = page.getSize();

  for (const overlay of overlays) {
    const x = (overlay.x / 100) * width;
    const w = Math.max(1, (overlay.w / 100) * width);
    const h = Math.max(1, (overlay.h / 100) * height);
    const yTop = (overlay.y / 100) * height;
    const y = height - yTop - h;
    const opacity = overlay.opacity ?? 1;

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
      if (overlay.coverBackground || overlay.fromPdf) {
        const pad = 1.2;
        page.drawRectangle({
          x: x - pad,
          y: y - pad,
          width: w + pad * 2,
          height: h + pad * 2,
          color: rgb(1, 1, 1),
          opacity: 1
        });
      }

      if (!overlay.text.trim()) continue;

      const font = overlay.bold ? fonts.bold : fonts.regular;
      const fontSize = Math.max(6, overlay.fontSize || h * 0.75);
      const color = hexToRgb(overlay.color || '#0f172a');
      const lines = overlay.text.replace(/\r/g, '').split('\n');
      const lineHeight = fontSize * 1.2;
      lines.forEach((line, idx) => {
        const textWidth = font.widthOfTextAtSize(line || ' ', fontSize);
        let drawX = x;
        if (overlay.align === 'center') drawX = x + (w - textWidth) / 2;
        if (overlay.align === 'right') drawX = x + w - textWidth;
        page.drawText(line || ' ', {
          x: Math.max(0, drawX),
          y: Math.max(0, y + h - fontSize - idx * lineHeight - 1),
          size: fontSize,
          font,
          color: rgb(color.r, color.g, color.b),
          opacity,
          maxWidth: Math.max(fontSize, w)
        });
      });
      continue;
    }
  }
}

/** Monta o PDF final com ordem, rotação, tamanho, overlays, numeração e marca d'água. */
export async function buildFinalPdf(
  pages: PageItem[],
  sources: Map<string, SourceFile>,
  options: BuildOptions
): Promise<Uint8Array> {
  const outDoc = await PDFDocument.create();
  const srcDocCache = new Map<string, PDFDocument>();
  const fonts = {
    regular: await outDoc.embedFont(StandardFonts.Helvetica),
    bold: await outDoc.embedFont(StandardFonts.HelveticaBold)
  };

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
