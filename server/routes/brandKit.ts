import { Router, Request, Response } from 'express';
import { Store } from '../db/store';

export const brandKitRouter = Router();

// GET /api/v1/brand-kit
brandKitRouter.get('/', (req: Request, res: Response): void => {
  const brandKit = Store.getBrandKit();
  res.json({ data: brandKit });
});

// PUT /api/v1/brand-kit
brandKitRouter.put('/', (req: Request, res: Response): void => {
  const updated = Store.updateBrandKit(req.body);
  res.json({ data: updated, message: 'Brand Kit updated successfully' });
});
