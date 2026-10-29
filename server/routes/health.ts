import { Router, Request, Response } from 'express';
import { findSystemChromium } from '../engine/chromeDetector';

export const healthRouter = Router();

// GET /api/v1/health
healthRouter.get('/', (req: Request, res: Response): void => {
  const chromiumPath = findSystemChromium();
  const mem = process.memoryUsage();

  res.json({
    status: 'healthy',
    product: 'CuratePDF Engine',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    chromium: {
      available: !!chromiumPath,
      executablePath: chromiumPath,
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      rssMemoryMb: Math.round(mem.rss / 1024 / 1024),
    },
  });
});
