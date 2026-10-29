import { PDFDocument } from 'pdf-lib';
import { DocumentData, BrandKitConfig } from '../../src/types';
import { generatePdf } from './pdfGenerator';

export interface CurationOptions {
  watermark?: string;
  embedMetadata?: boolean;
}

export interface CuratedDocumentResult {
  pdfBuffer: Buffer;
  fileName: string;
  durationMs: number;
  byteLength: number;
}

/**
 * Curates, compiles, and post-processes a document into a publication-ready PDF.
 */
export async function curateAndGeneratePdf(
  doc: DocumentData,
  brandKit: BrandKitConfig,
  options: CurationOptions = {}
): Promise<CuratedDocumentResult> {
  // 1. Data Normalization & Calculations
  const normalizedDoc: DocumentData = {
    ...doc,
    updatedAt: new Date().toISOString(),
  };

  if (normalizedDoc.lineItems && normalizedDoc.lineItems.length > 0) {
    const subtotal = normalizedDoc.lineItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
      0
    );
    normalizedDoc.subtotal = subtotal;
    const tax = normalizedDoc.taxTotal || 0;
    normalizedDoc.total = subtotal + tax;
  }

  // 2. Generate Base PDF via Headless Chromium
  const { pdfBuffer: rawBuffer, durationMs } = await generatePdf(normalizedDoc, brandKit);

  // 3. Post-Process via pdf-lib: Inject Document Metadata & Producer Tags
  const pdfDoc = await PDFDocument.load(rawBuffer);

  pdfDoc.setTitle(normalizedDoc.title || 'CuratePDF Document');
  pdfDoc.setAuthor(normalizedDoc.customBranding?.companyName || brandKit.companyName || 'CuratePDF');
  pdfDoc.setSubject(`${normalizedDoc.category.toUpperCase()} • Ref: ${normalizedDoc.referenceNumber}`);
  pdfDoc.setProducer('CuratePDF Engine v2.0 (curatepdf.site)');
  pdfDoc.setCreator('CuratePDF Automation Pipeline');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  const finalizedUint8 = await pdfDoc.save();
  const finalizedBuffer = Buffer.from(finalizedUint8);

  const cleanTitle = (normalizedDoc.title || 'document').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const fileName = `${cleanTitle}-${normalizedDoc.referenceNumber.toLowerCase()}.pdf`;

  return {
    pdfBuffer: finalizedBuffer,
    fileName,
    durationMs,
    byteLength: finalizedBuffer.length,
  };
}
