import { Router, Request, Response } from 'express';
import { Store } from '../db/store';

export const dbRouter = Router();

// GET /api/v1/db/stats
dbRouter.get('/stats', (req: Request, res: Response): void => {
  const stats = Store.getDatabaseStats();
  res.json({ data: stats });
});

// POST /api/v1/db/reset
dbRouter.post('/reset', (req: Request, res: Response): void => {
  const resetDb = Store.resetDatabase();
  res.json({ message: 'Database reset to initial schema', data: resetDb });
});

// POST /api/v1/db/clear-documents
dbRouter.post('/clear-documents', (req: Request, res: Response): void => {
  Store.clearDocuments();
  res.json({ message: 'All documents cleared from database', total: 0 });
});
