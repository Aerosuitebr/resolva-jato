import rjEscuro from '@/assets/RJ_escuro.png';
import { buildResolvaJatoDownloadName } from '@/lib/download-filename';
import { viralPdfFooterLabel, viralPdfFooterUrl } from '@/lib/viral-loop';

export type ExportPdfOptions = {
  /** Quando true (plano grátis), carimba logo + rodapé viral em cada página. */
  branded?: boolean;
};

type JsPdf = InstanceType<typeof import('jspdf').jsPDF>;

type KeepRangeMm = { start: number; end: number };

/**
 * html2canvas 1.4.x: text-align computado como "start" (padrão nos browsers modernos)
 * dispara renderização letra a letra e gera espaçamento irregular no PDF.
 * Também estabiliza letter-spacing / ligaduras / font-feature-settings herdados do app.
 */
function normalizeCloneTextForPdf(root: HTMLElement) {
  root.style.textAlign = 'left';
  root.style.letterSpacing = 'normal';
  root.style.wordSpacing = 'normal';
  root.style.fontFeatureSettings = 'normal';
  root.style.setProperty('font-variant-ligatures', 'none');

  root.querySelectorAll('*').forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const cls = typeof el.className === 'string' ? el.className : '';

    // Só sobrescreve alinhamento quando a classe pede — senão herda (ex.: assinatura centralizada).
    if (/\btext-center\b/.test(cls)) el.style.textAlign = 'center';
    else if (/\btext-right\b/.test(cls)) el.style.textAlign = 'right';
    else if (/\btext-justify\b/.test(cls) || /\btext-left\b/.test(cls)) el.style.textAlign = 'left';

    if (!/\btracking-/.test(cls) && !cls.includes('rj-signature-moderno')) {
      el.style.letterSpacing = 'normal';
    }
    el.style.wordSpacing = 'normal';
    el.style.fontFeatureSettings = 'normal';
    el.style.setProperty('font-variant-ligatures', 'none');
  });
}

/** Margem inferior do carimbo do rodapé (mm) — overlay, não reduz a área útil da página. */
const PRINT_FOOTER_MARGIN_MM = 18;
/** Última página com conteúdo real abaixo disso = órfão (assinaturas sozinhas). */
const ORPHAN_LAST_PAGE_MM = 78;
/** Página final com menos que isso = desnecessária (só marca d’água). */
const EMPTY_TRAILING_MM = 28;
/** Escala mínima ao comprimir para evitar página sobrando. */
const MAX_SQUEEZE = 0.85;
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
 * Evita partir blocos keep, páginas órfãs e páginas finais vazias (só marca).
 */
function planPageStarts(
  contentHeightMm: number,
  pageHeightMm: number,
  keepRanges: KeepRangeMm[]
): { pageStarts: number[]; scale: number } {
  // Cabe em uma página A4 (docs usam min-h 297mm — não reservar rodapé aqui)
  if (contentHeightMm <= pageHeightMm + 0.75) {
    return { pageStarts: [0], scale: 1 };
  }

  const rawPages = Math.ceil(contentHeightMm / pageHeightMm);
  const lastPageH = contentHeightMm - (rawPages - 1) * pageHeightMm;

  // Excedente pequeno ou última fatia quase vazia → comprime e elimina a página extra
  if (rawPages > 1 && lastPageH < ORPHAN_LAST_PAGE_MM) {
    const fitScale = ((rawPages - 1) * pageHeightMm) / contentHeightMm;
    if (fitScale >= MAX_SQUEEZE) {
      return {
        pageStarts: Array.from({ length: rawPages - 1 }, (_, i) => i * pageHeightMm),
        scale: fitScale
      };
    }
  }

  const pageStarts: number[] = [0];
  let y = 0;

  while (y + pageHeightMm < contentHeightMm - 0.75) {
    let breakAt = avoidKeepSplit(y, y + pageHeightMm, pageHeightMm, keepRanges);

    const remaining = contentHeightMm - breakAt;
    if (remaining > 0 && remaining < ORPHAN_LAST_PAGE_MM) {
      const desiredRemaining = Math.min(
        ORPHAN_LAST_PAGE_MM,
        contentHeightMm - y - pageHeightMm * MIN_PAGE_FILL
      );
      let earlier = contentHeightMm - desiredRemaining;
      earlier = avoidKeepSplit(y, earlier, pageHeightMm, keepRanges);
      if (earlier > y + pageHeightMm * MIN_PAGE_FILL && earlier < breakAt) {
        breakAt = earlier;
      }
    }

    if (breakAt <= y + 2) {
      breakAt = y + pageHeightMm;
    }

    // Não abrir página se o restante for só “folga” de min-height / padding
    if (contentHeightMm - breakAt < EMPTY_TRAILING_MM) {
      const pagesWithoutExtra = pageStarts.length;
      const squeeze = (pagesWithoutExtra * pageHeightMm) / contentHeightMm;
      if (squeeze >= MAX_SQUEEZE) {
        return {
          pageStarts: Array.from({ length: pagesWithoutExtra }, (_, i) => i * pageHeightMm),
          scale: squeeze
        };
      }
      break;
    }

    pageStarts.push(breakAt);
    y = breakAt;

    if (pageStarts.length > 40) break;
  }

  // Segurança final: se a última página ficou sem conteúdo útil, comprime
  if (pageStarts.length > 1) {
    const lastStart = pageStarts[pageStarts.length - 1];
    const trailing = contentHeightMm - lastStart;
    if (trailing < EMPTY_TRAILING_MM) {
      const n = pageStarts.length - 1;
      const squeeze = (n * pageHeightMm) / contentHeightMm;
      if (squeeze >= MAX_SQUEEZE) {
        return {
          pageStarts: Array.from({ length: n }, (_, i) => i * pageHeightMm),
          scale: squeeze
        };
      }
      pageStarts.pop();
    }
  }

  return { pageStarts, scale: 1 };
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
  _filename: string,
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
      logging: false,
      /**
       * html2canvas 1.4.x trata text-align:start (padrão moderno) como renderização
       * letra a letra e gera espaços irregulares / gaps antes de pontuação.
       * Forçamos left/center/right explícitos e métricas de fonte estáveis.
       */
      onclone: (_doc, cloned) => {
        normalizeCloneTextForPdf(cloned);
      }
    });

    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageWidth = pageWidth;
    const contentHeightMm = (canvas.height * imageWidth) / canvas.width;

    // Usa a altura cheia da A4. Reservar rodapé aqui gerava página 2 em branco
    // (docs têm min-h 297mm e o rodapé é carimbado por cima).
    const keepRanges = measureKeepRanges(element, contentHeightMm);
    const plan = planPageStarts(contentHeightMm, pageHeight, keepRanges);

    let pageImage = imageData;
    let finalWidth = imageWidth;
    let finalHeight = contentHeightMm;
    let pageStarts = plan.pageStarts;

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
        const fittedPages = Math.max(1, Math.ceil(finalHeight / pageHeight - 1e-6));
        pageStarts = Array.from({ length: fittedPages }, (_, i) => i * pageHeight);
        // Se ainda sobrar fatia minúscula por arredondamento, descarta
        while (pageStarts.length > 1) {
          const last = pageStarts[pageStarts.length - 1];
          if (finalHeight - last >= EMPTY_TRAILING_MM) break;
          pageStarts.pop();
        }
      }
    }

    // Remove fatias finais sem conteúdo útil antes de gerar páginas
    while (pageStarts.length > 1) {
      const last = pageStarts[pageStarts.length - 1];
      if (finalHeight - last >= EMPTY_TRAILING_MM) break;
      pageStarts.pop();
    }

    for (let i = 0; i < pageStarts.length; i++) {
      if (i > 0) pdf.addPage();
      const start = pageStarts[i];
      const next = pageStarts[i + 1] ?? finalHeight;
      paintPageSlice(pdf, pageImage, pageWidth, pageHeight, finalWidth, finalHeight, start, next);
      if (branded) await stampPageBrand(pdf, pageWidth, pageHeight);
    }

    pdf.save(buildResolvaJatoDownloadName('pdf'));
  } finally {
    if (branded) setBrandNodesVisibility(element, true);
  }
}
