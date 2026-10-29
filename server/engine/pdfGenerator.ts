import puppeteer, { Browser } from 'puppeteer-core';
import { findSystemChromium } from './chromeDetector';
import { DocumentData, BrandKitConfig } from '../../src/types';
import { renderDocumentHtml } from './htmlRenderer';

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  const executablePath = findSystemChromium();
  if (!executablePath) {
    throw new Error('No compatible Chrome or Microsoft Edge executable found on this system.');
  }

  browserInstance = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
      '--disable-gpu',
    ],
  });

  return browserInstance;
}

export interface GeneratorResult {
  pdfBuffer: Buffer;
  pageCount: number;
  durationMs: number;
}

/**
 * Generates an authentic, high-resolution PDF buffer using headless Chromium.
 */
export async function generatePdf(
  doc: DocumentData,
  brandKit: BrandKitConfig
): Promise<GeneratorResult> {
  const startTime = Date.now();
  const htmlContent = renderDocumentHtml(doc, brandKit);
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set viewport for high-DPI crisp rendering
    await page.setViewport({
      width: doc.orientation === 'landscape' ? 1400 : 1000,
      height: doc.orientation === 'landscape' ? 1000 : 1400,
      deviceScaleFactor: 2,
    });

    // Load HTML content
    await page.setContent(htmlContent, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000,
    });

    // Generate PDF
    const isLandscape = doc.orientation === 'landscape';
    const format = (doc.pageSize || 'A4') as 'A4' | 'Letter';

    const pdfUint8 = await page.pdf({
      format: format,
      landscape: isLandscape,
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      preferCSSPageSize: true,
    });

    const pdfBuffer = Buffer.from(pdfUint8);
    const durationMs = Date.now() - startTime;

    return {
      pdfBuffer,
      pageCount: isLandscape ? 1 : 1,
      durationMs,
    };
  } finally {
    await page.close();
  }
}
