import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { DocumentData } from '../types';

export interface GenerationOptions {
  fileName?: string;
  elementId?: string;
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  documentData?: DocumentData;
}

/**
 * Generates and downloads a PDF.
 * Attempts server-side Chromium generation first for maximum vector fidelity.
 * Seamlessly falls back to client-side canvas+jspdf if backend is offline.
 */
export async function generateAndDownloadPdf(options: GenerationOptions = {}): Promise<boolean> {
  const {
    fileName = 'document.pdf',
    elementId = 'printable-document-canvas',
    pageSize = 'A4',
    orientation = 'portrait',
    documentData,
  } = options;

  const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  // 1. Attempt Server-Side High-Fidelity Chromium Generation
  if (documentData) {
    try {
      const response = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: documentData }),
      });

      if (response.ok && response.headers.get('content-type')?.includes('application/pdf')) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = cleanFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        triggerConfetti();
        return true;
      }
    } catch {
      // Backend unavailable; seamlessly proceed to client-side fallback
    }
  }

  // 2. Client-Side High-Res Fallback Engine (Zero network dependency)
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Document canvas element with id "${elementId}" not found.`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageSize.toLowerCase() as 'a4' | 'letter',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasRatio = canvas.height / canvas.width;
    const imgHeight = pdfWidth * canvasRatio;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 5) {
      position = position - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    pdf.save(cleanFileName);
    triggerConfetti();
    return true;
  } catch (error) {
    console.error('Error in client fallback generator:', error);
    window.print();
    return true;
  }
}

function triggerConfetti(): void {
  try {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#0F3D2E', '#3A7D5F', '#A7C957', '#F0F0E9'],
    });
  } catch {
    // ignore
  }
}

export function triggerNativePrint(): void {
  window.print();
}
