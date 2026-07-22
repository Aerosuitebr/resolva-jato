import rjEscuro from '@/assets/RJ_escuro.png';
import { viralPdfFooterLabel, viralPdfFooterUrl } from '@/lib/viral-loop';

export type ExportPdfOptions = {
  /** Quando true (plano grátis), carimba logo + rodapé viral em cada página. */
  branded?: boolean;
};

type JsPdf = InstanceType<typeof import('jspdf').jsPDF>;

type KeepRangeMm = { start: number; end: number };

/** Margem inferior segura para impressão (mm) — alinhada ao preview. */
const PRINT_FOOTER_MARGIN_MM = 18;
/** Última página com menos que isso = órfão (ex.: só assinaturas). */
const ORPHAN_LAST_PAGE_MM = 78;
/** Escala mínima ao tentar caber o excedente na página anterior. */
const MAX_SQUEEZE = 0.9;
/** Progresso mínimo na página antes de antecipar quebra por bloco keep. */
const MIN_PAGE_FILL = 0.3;

let cachedWatermark: { dataUrl: string; aspect: number } | null | undefined;

function logoSrc(): string {
  return typeof rjEscuro === 'string' ? rjEscuro : rjEscuro.src;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Falha ao carregar logo'));
    img.src = src;
  });
}

/** Logo Resolva Jato no centro da página (marca d’água). */
async function getWatermarkDataUrl(): Promise<{ dataUrl: string; aspect: number } | null> {
  if (cachedWatermark !== undefined) return cachedWatermark;
  if (typeof window === 'undefined') {
    cachedWatermark = null;
    return null;
  }

  try {
    const img = await loadImage(logoSrc());
    const angle = (-18 * Math.PI) / 180;
    const drawW = 720;
    const drawH = (img.height / img.width) * drawW;
    const cos = Math.abs(Math.cos(angle));
    const sin = Math.abs(Math.sin(angle));
    const canvasW = Math.ceil(drawW * cos + drawH * sin);
    const canvasH = Math.ceil(drawW * sin + drawH * cos);
    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      cachedWatermark = null;
      return null;
    }
    ctx.translate(canvasW / 2, canvasH / 2);
    ctx.rotate(angle);
    ctx.globalAlpha = 0.17;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    cachedWatermark = {
      dataUrl: canvas.toDataURL('image/png'),
      aspect: canvasH / canvasW
    };
    return cachedWatermark;
  } catch {
    cachedWatermark = null;
    return null;
  }
}

function stampViralFooter(pdf: JsPdf, pageWidth: number, pageHeight: number) {
  const label = viralPdfFooterLabel();
  const url = viralPdfFooterUrl();
  const footerY = pageHeight - PRINT_FOOTER_MARGIN_MM;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(148, 163, 184);
  const lines = pdf.splitTextToSize(label, pageWidth - 28);
  const lineH = 3.4;
  const blockH = lines.length * lineH;
  pdf.text(lines, pageWidth / 2, footerY - blockH + lineH, { align: 'center' });

  const widest = Math.max(...lines.map((line: string) => pdf.getTextWidth(line)), 0);
  const x = (pageWidth - widest) / 2;
  pdf.link(x, footerY - blockH, widest, blockH + 2, { url });
}

async function stampWatermark(pdf: JsPdf, pageWidth: number, pageHeight: number) {
  const mark = await getWatermarkDataUrl();
  if (!mark) return;
  // ~48% da largura da página — destaque sem cobrir o texto
  const markW = pageWidth * 0.48;
  const markH = markW * mark.aspect;
  const x = (pageWidth - markW) / 2;
  const y = (pageHeight - markH) / 2;
  pdf.addImage(mark.dataUrl, 'PNG', x, y, markW, markH);
}

async function stampPageBrand(pdf: JsPdf, pageWidth: number, pageHeight: number) {
  await stampWatermark(pdf, pageWidth, pageHeight);
  stampViralFooter(pdf, pageWidth, pageHeight);
}

function setBrandNodesVisibility(element: HTMLElement, visible: boolean) {
  element.querySelectorAll<HTMLElement>('[data-rj-brand]').forEach((node) => {
    // display:none remove o espaço do rodapé no canvas — o carimbo do PDF cuida disso
    node.style.display = visible ? '' : 'none';
  });
}

/** Mede blocos `[data-rj-keep]` em mm, relativos ao topo do elemento exportado. */
function measureKeepRanges(root: HTMLElement, contentHeightMm: number): KeepRangeMm[] {
  const rootRect = root.getBoundingClientRect();
  if (rootRect.height <= 0) return [];

  const pxToMm = contentHeightMm / rootRect.height;
  return Array.from(root.querySelectorAll<HTMLElement>('[data-rj-keep]'))
    .map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        start: Math.max(0, (rect.top - rootRect.top) * pxToMm),
        end: Math.min(contentHeightMm, (rect.bottom - rootRect.top) * pxToMm)
      };
    })
    .filter((range) => range.end - range.start > 2)
    .sort((a, b) => a.start - b.start);
}

function avoidKeepSplit(
  y: number,
  idealEnd: number,
  usable: number,
  keepRanges: KeepRangeMm[]
): number {
  let breakAt = idealEnd;
  for (const range of keepRanges) {
    if (range.start < breakAt && range.end > breakAt) {
      const minBreak = y + usable * MIN_PAGE_FILL;
      if (range.start > minBreak) {
        breakAt = range.start;
      }
      break;
    }
  }
  return breakAt;
}

/**
 * Planeja os pontos de corte do canvas.
 * Evita partir blocos keep e última página quase vazia (assinaturas órfãs).
 */
function planPageStarts(
  contentHeightMm: number,
  usablePageMm: number,
  keepRanges: KeepRangeMm[]
): { pageStarts: number[]; scale: number; drawHeightMm: number } {
  if (contentHeightMm <= usablePageMm) {
    return { pageStarts: [0], scale: 1, drawHeightMm: contentHeightMm };
  }

  const rawPages = Math.ceil(contentHeightMm / usablePageMm);
  const lastPageH = contentHeightMm - (rawPages - 1) * usablePageMm;

  // Excedente pequeno: encolhe levemente e cabe em N-1 páginas
  if (rawPages > 1 && lastPageH < ORPHAN_LAST_PAGE_MM) {
    const fitScale = ((rawPages - 1) * usablePageMm) / contentHeightMm;
    if (fitScale >= MAX_SQUEEZE) {
      return {
        pageStarts: Array.from({ length: rawPages - 1 }, (_, i) => i * usablePageMm),
        scale: fitScale,
        drawHeightMm: contentHeightMm * fitScale
      };
    }
  }

  const scale = 1;
  const drawHeightMm = contentHeightMm;
  const scaledKeeps = keepRanges;

  const pageStarts: number[] = [0];
  let y = 0;

  while (y + usablePageMm < drawHeightMm - 1) {
    let breakAt = avoidKeepSplit(y, y + usablePageMm, usablePageMm, scaledKeeps);

    const remaining = drawHeightMm - breakAt;
    // Antecipa a quebra se a próxima página ficaria órfã
    if (remaining > 0 && remaining < ORPHAN_LAST_PAGE_MM) {
      const desiredRemaining = Math.min(ORPHAN_LAST_PAGE_MM, drawHeightMm - y - usablePageMm * MIN_PAGE_FILL);
      let earlier = drawHeightMm - desiredRemaining;
      earlier = avoidKeepSplit(y, earlier, usablePageMm, scaledKeeps);
      if (earlier > y + usablePageMm * MIN_PAGE_FILL && earlier < breakAt) {
        breakAt = earlier;
      }
    }

    if (breakAt <= y + 2) {
      breakAt = y + usablePageMm;
    }

    pageStarts.push(breakAt);
    y = breakAt;

    // Segurança: não criar páginas infinitas
    if (pageStarts.length > 40) break;
  }

  return { pageStarts, scale, drawHeightMm };
}

function paintPageSlice(
  pdf: JsPdf,
  imageData: string,
  pageWidth: number,
  pageHeight: number,
  imageWidth: number,
  drawHeightMm: number,
  pageStartMm: number,
  nextStartMm: number
) {
  const yOffset = -pageStartMm;
  pdf.addImage(imageData, 'PNG', 0, yOffset, imageWidth, drawHeightMm);

  // Cobrir o pedaço que pertence à próxima página (quebra antecipada)
  const contentOnPage = Math.min(nextStartMm, drawHeightMm) - pageStartMm;
  if (contentOnPage < pageHeight - 0.5) {
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, Math.max(0, contentOnPage), pageWidth, pageHeight - contentOnPage + 1, 'F');
  }
}

export async function exportElementToPdf(
  element: HTMLElement,
  filename: string,
  options: ExportPdfOptions = {}
) {
  const branded = options.branded !== false;
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf')
  ]);

  // Preview mostra a marca; no capture ocultamos para carimbar por página no PDF.
  if (branded) setBrandNodesVisibility(element, false);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageWidth = pageWidth;
    const contentHeightMm = (canvas.height * imageWidth) / canvas.width;

    // Reserva espaço do rodapé viral para não sobrepor assinaturas
    const footerReserve = branded ? PRINT_FOOTER_MARGIN_MM + 6 : 8;
    const usablePageMm = Math.max(pageHeight - footerReserve, pageHeight * 0.85);

    // Mede blocos keep com o mesmo layout do canvas (marca oculta)
    const keepRanges = measureKeepRanges(element, contentHeightMm);
    const plan = planPageStarts(contentHeightMm, usablePageMm, keepRanges);

    let pageImage = imageData;
    let finalWidth = imageWidth;
    let finalHeight = contentHeightMm;
    let pageStarts = plan.pageStarts;

    // Squeeze leve: redimensiona o canvas para caber sem página órfã
    if (plan.scale < 1) {
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = Math.max(1, Math.round(canvas.width * plan.scale));
      scaledCanvas.height = Math.max(1, Math.round(canvas.height * plan.scale));
      const ctx = scaledCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
        ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
        pageImage = scaledCanvas.toDataURL('image/png');
        finalWidth = pageWidth;
        finalHeight = (scaledCanvas.height * finalWidth) / scaledCanvas.width;
        pageStarts = Array.from(
          { length: Math.max(1, Math.ceil(finalHeight / usablePageMm)) },
          (_, i) => i * usablePageMm
        );
      }
    }

    for (let i = 0; i < pageStarts.length; i++) {
      if (i > 0) pdf.addPage();
      const start = pageStarts[i];
      const next = pageStarts[i + 1] ?? finalHeight;
      paintPageSlice(pdf, pageImage, pageWidth, pageHeight, finalWidth, finalHeight, start, next);
      if (branded) await stampPageBrand(pdf, pageWidth, pageHeight);
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } finally {
    if (branded) setBrandNodesVisibility(element, true);
  }
}
