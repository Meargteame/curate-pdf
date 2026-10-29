import { Router, Request, Response } from 'express';
import { Store } from '../db/store';

export const keysRouter = Router();

// GET /api/v1/keys
keysRouter.get('/', (req: Request, res: Response): void => {
  res.json({ data: Store.getApiKeys() });
});

// POST /api/v1/keys
keysRouter.post('/', (req: Request, res: Response): void => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Key name is required' });
    return;
  }

  const key = Store.createApiKey(name);
  res.status(201).json({ data: key, message: 'API key created successfully' });
});

// DELETE /api/v1/keys/:id
keysRouter.delete('/:id', (req: Request, res: Response): void => {
  Store.deleteApiKey(req.params.id);
  res.json({ message: 'API key revoked', id: req.params.id });
});
