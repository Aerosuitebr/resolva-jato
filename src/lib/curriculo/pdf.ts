import { viralPdfFooterLabel, viralPdfFooterUrl } from '@/lib/viral-loop';

export type ExportPdfOptions = {
  /** Quando true (plano grátis), carimba logo + rodapé viral em cada página. */
  branded?: boolean;
};

type JsPdf = InstanceType<typeof import('jspdf').jsPDF>;

let cachedLogoDataUrl: string | null | undefined;

async function getLogoDataUrl(): Promise<string | null> {
  if (cachedLogoDataUrl !== undefined) return cachedLogoDataUrl;
  if (typeof window === 'undefined') {
    cachedLogoDataUrl = null;
    return null;
  }

  try {
    const response = await fetch('/favicon.svg');
    const svg = await response.text();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);

    const dataUrl = await new Promise<string | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.clearRect(0, 0, 128, 128);
        ctx.globalAlpha = 0.22;
        ctx.drawImage(img, 0, 0, 128, 128);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = objectUrl;
    });

    URL.revokeObjectURL(objectUrl);
    cachedLogoDataUrl = dataUrl;
    return dataUrl;
  } catch {
    cachedLogoDataUrl = null;
    return null;
  }
}

function stampViralFooter(pdf: JsPdf, pageWidth: number, pageHeight: number) {
  const label = viralPdfFooterLabel();
  const url = viralPdfFooterUrl();
  const footerY = pageHeight - 8;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  const lines = pdf.splitTextToSize(label, pageWidth - 24);
  pdf.text(lines, pageWidth / 2, footerY - (lines.length - 1) * 3.2, { align: 'center' });

  const widest = Math.max(...lines.map((line: string) => pdf.getTextWidth(line)), 0);
  const x = (pageWidth - widest) / 2;
  pdf.link(x, footerY - lines.length * 3.5, widest, lines.length * 4 + 2, { url });
}

async function stampBrandLogo(pdf: JsPdf, pageWidth: number) {
  const logo = await getLogoDataUrl();
  if (!logo) return;
  const size = 9;
  pdf.addImage(logo, 'PNG', pageWidth - size - 8, 6, size, size);
}

async function stampPageBrand(pdf: JsPdf, pageWidth: number, pageHeight: number) {
  await stampBrandLogo(pdf, pageWidth);
  stampViralFooter(pdf, pageWidth, pageHeight);
}

function setBrandNodesVisibility(element: HTMLElement, visible: boolean) {
  element.querySelectorAll<HTMLElement>('[data-rj-brand]').forEach((node) => {
    node.style.visibility = visible ? '' : 'hidden';
  });
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
    const imageHeight = (canvas.height * imageWidth) / canvas.width;

    let heightLeft = imageHeight;
    let position = 0;

    pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight);
    if (branded) await stampPageBrand(pdf, pageWidth, pageHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imageHeight;
      pdf.addPage();
      pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight);
      if (branded) await stampPageBrand(pdf, pageWidth, pageHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } finally {
    if (branded) setBrandNodesVisibility(element, true);
  }
}
