import { Router, Request, Response } from 'express';
import { Store } from '../db/store';
import { TemplateDefinition } from '../../src/types';

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

// POST /api/v1/templates
templatesRouter.post('/', (req: Request, res: Response): void => {
  const tpl: TemplateDefinition = {
    ...req.body,
    id: req.body.id || `tpl-custom-${Date.now().toString(36)}`,
  };
  Store.upsertTemplate(tpl);
  res.status(201).json({ data: tpl });
});

// PUT /api/v1/templates/:id
templatesRouter.put('/:id', (req: Request, res: Response): void => {
  const existing = Store.getTemplateById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Template not found' });
    return;
  }
  const updated: TemplateDefinition = {
    ...existing,
    ...req.body,
    id: existing.id,
  };
  Store.upsertTemplate(updated);
  res.json({ data: updated });
});

// DELETE /api/v1/templates/:id
templatesRouter.delete('/:id', (req: Request, res: Response): void => {
  Store.deleteTemplate(req.params.id);
  res.json({ message: 'Template removed', id: req.params.id });
});
