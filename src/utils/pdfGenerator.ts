import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';

export interface GenerationOptions {
  fileName?: string;
  elementId?: string;
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

/**
 * Renders the HTML element with id `elementId` to a real downloadable PDF using html2canvas + jsPDF.
 */
export async function generateAndDownloadPdf(options: GenerationOptions = {}): Promise<boolean> {
  const {
    fileName = 'document.pdf',
    elementId = 'printable-document-canvas',
    pageSize = 'A4',
    orientation = 'portrait',
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Document canvas element with id "${elementId}" not found.`);
    return false;
  }

  try {
    // 1. Capture the exact high-res canvas (scale 2 for retina / high-DPI crisp print resolution)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // 2. Setup jsPDF instance
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageSize.toLowerCase() as 'a4' | 'letter',
    });

    // Dimensions in mm
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate image dimensions to fit page width
    const canvasRatio = canvas.height / canvas.width;
    const imgHeight = pdfWidth * canvasRatio;

    // Handle single or multi-page slicing
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Add extra pages if long document
    while (heightLeft > 5) { // 5mm threshold to prevent blank page
      position = position - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    // 3. Save the PDF directly to user's downloads
    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);

    // 4. Subtle celebratory confetti for smooth feedback
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0F3D2E', '#3A7D5F', '#A7C957', '#F0F0E9']
      });
    } catch {
      // ignore
    }

    return true;
  } catch (error) {
    console.error('Error generating client-side PDF:', error);
    // Fallback: prompt print dialog if canvas rendering fails
    window.print();
    return true;
  }
}

/**
 * Triggers native browser print dialog, optimized for CSS print stylesheets.
 */
export function triggerNativePrint(): void {
  window.print();
}
