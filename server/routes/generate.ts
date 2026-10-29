import { Router, Request, Response } from 'express';
import { curateAndGeneratePdf } from '../engine/curator';
import { Store } from '../db/store';
import { DocumentData } from '../../src/types';

export const generateRouter = Router();

/**
 * POST /api/v1/generate
 * One-shot PDF compilation and generation.
 */
generateRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const docData: DocumentData = req.body.document || req.body;
    const brandKit = req.body.brandKit || Store.getBrandKit();

    if (!docData || !docData.title) {
      res.status(400).json({
        error: 'Invalid Request',
        message: 'Request body must contain document data with at least a title.',
      });
      return;
    }

    const result = await curateAndGeneratePdf(docData, brandKit);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.setHeader('X-Generation-Time-Ms', result.durationMs.toString());
    res.setHeader('X-Document-Length-Bytes', result.byteLength.toString());

    res.send(result.pdfBuffer);
  } catch (error: any) {
    console.error('API PDF Generation Error:', error);
    res.status(500).json({
      error: 'Generation Failed',
      message: error?.message || 'Failed to render PDF using headless Chromium engine.',
    });
  }
});
