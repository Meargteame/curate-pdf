import { Router, Request, Response } from 'express';
import { Store } from '../db/store';

export const templatesRouter = Router();

// GET /api/v1/templates
templatesRouter.get('/', (req: Request, res: Response): void => {
  const { category } = req.query;
  let templates = Store.getTemplates();

  if (category && category !== 'all' && typeof category === 'string') {
    templates = templates.filter(t => t.category === category);
  }

  res.json({ data: templates, total: templates.length });
});

// GET /api/v1/templates/:id
templatesRouter.get('/:id', (req: Request, res: Response): void => {
  const template = Store.getTemplateById(req.params.id);
  if (!template) {
    res.status(404).json({ error: 'Template not found' });
    return;
  }
  res.json({ data: template });
});
