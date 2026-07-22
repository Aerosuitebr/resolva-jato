import { viralPdfFooterLabel, viralPdfFooterUrl } from '@/lib/viral-loop';

function stampViralFooter(
  pdf: InstanceType<typeof import('jspdf').jsPDF>,
  pageWidth: number,
  pageHeight: number
) {
  const label = viralPdfFooterLabel();
  const url = viralPdfFooterUrl();
  const footerY = pageHeight - 7;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text(label, pageWidth / 2, footerY, { align: 'center' });

  const textWidth = pdf.getTextWidth(label);
  const x = (pageWidth - textWidth) / 2;
  pdf.link(x, footerY - 3.5, textWidth, 5, { url });
}

export async function exportElementToPdf(element: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf')
  ]);

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
  stampViralFooter(pdf, pageWidth, pageHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imageHeight;
    pdf.addPage();
    pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight);
    stampViralFooter(pdf, pageWidth, pageHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
