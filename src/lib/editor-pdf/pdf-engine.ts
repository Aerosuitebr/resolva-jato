import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

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
}

export type WatermarkPosition = "diagonal" | "rodape";

export interface BuildOptions {
  pageNumbers: boolean;
  watermarkText: string;
  watermarkOpacity: number;
}

let pdfjsLibPromise: Promise<typeof import("pdfjs-dist")> | null = null;

async function getPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import("pdfjs-dist").then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";
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

/** Lê um arquivo PDF, gera 1 SourceFile + miniaturas (thumbnails) de todas as páginas. */
export async function loadPdfIntoPages(
  file: File,
): Promise<{ source: SourceFile; pages: PageItem[] }> {
  const bytes = await file.arrayBuffer();
  const pdfjs = await getPdfjs();
  const loadingTask = pdfjs.getDocument({ data: bytes.slice(0) });
  const doc = await loadingTask.promise;

  const sourceId = nextId("src");
  const pages: PageItem[] = [];

  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const thumbScale = Math.min(
      1,
      320 / Math.max(viewport.width, viewport.height),
    );
    const thumbViewport = page.getViewport({
      scale: Math.max(thumbScale, 0.25),
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(thumbViewport.width);
    canvas.height = Math.ceil(thumbViewport.height);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      await page.render({ canvasContext: ctx, viewport: thumbViewport })
        .promise;
    }

    pages.push({
      id: nextId("page"),
      sourceId,
      sourcePageIndex: i - 1,
      rotation: 0,
      thumbnail: canvas.toDataURL("image/jpeg", 0.72),
      selected: false,
      originalWidth: viewport.width,
      originalHeight: viewport.height,
    });
  }

  await doc.destroy();

  return {
    source: { id: sourceId, name: file.name, bytes, pageCount: doc.numPages },
    pages,
  };
}

/** Gera a miniatura de uma página em branco A4 para exibição no grid. */
export function blankPageThumbnail(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 240;
  canvas.height = 339; // proporção A4
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  }
  return canvas.toDataURL("image/png");
}

function wrapAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

/** Monta o PDF final aplicando ordem, rotações, páginas em branco, numeração e marca d'água. */
export async function buildFinalPdf(
  pages: PageItem[],
  sources: Map<string, SourceFile>,
  options: BuildOptions,
): Promise<Uint8Array> {
  const outDoc = await PDFDocument.create();
  const srcDocCache = new Map<string, PDFDocument>();

  for (const p of pages) {
    if (p.isBlank) {
      outDoc.addPage([595.28, 841.89]);
      continue;
    }
    let srcDoc = srcDocCache.get(p.sourceId);
    if (!srcDoc) {
      const source = sources.get(p.sourceId);
      if (!source) continue;
      srcDoc = await PDFDocument.load(source.bytes.slice(0));
      srcDocCache.set(p.sourceId, srcDoc);
    }
    const [copied] = await outDoc.copyPages(srcDoc, [p.sourcePageIndex]);
    if (p.rotation) {
      const current = copied.getRotation().angle;
      copied.setRotation(degrees(wrapAngle(current + p.rotation)));
    }
    outDoc.addPage(copied);
  }

  const total = outDoc.getPageCount();

  if (options.watermarkText.trim()) {
    const font = await outDoc.embedFont(StandardFonts.HelveticaBold);
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
        rotate: degrees(45),
      });
    });
  }

  if (options.pageNumbers) {
    const font = await outDoc.embedFont(StandardFonts.Helvetica);
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
        color: rgb(0.35, 0.35, 0.4),
      });
    });
  }

  return outDoc.save();
}

export function downloadBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
