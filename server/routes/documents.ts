import { Router, Request, Response } from 'express';
import { Store } from '../db/store';
import { curateAndGeneratePdf } from '../engine/curator';
import { DocumentData } from '../../src/types';

export const documentsRouter = Router();

// GET /api/v1/documents
documentsRouter.get('/', (req: Request, res: Response): void => {
  const { search, category, status } = req.query;
  let docs = Store.getDocuments();

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    docs = docs.filter(d => 
      d.title.toLowerCase().includes(q) ||
      d.referenceNumber.toLowerCase().includes(q) ||
      (d.clientCompany && d.clientCompany.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'all' && typeof category === 'string') {
    docs = docs.filter(d => d.category === category);
  }

  if (status && status !== 'all' && typeof status === 'string') {
    docs = docs.filter(d => d.status === status);
  }

  res.json({ data: docs, total: docs.length });
});

// POST /api/v1/documents
documentsRouter.post('/', (req: Request, res: Response): void => {
  const body = req.body;
  const newDoc: DocumentData = {
    ...body,
    id: body.id || `doc-${Date.now().toString(36)}`,
    createdAt: body.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  Store.upsertDocument(newDoc);
  res.status(201).json({ data: newDoc });
});

// GET /api/v1/documents/:id
documentsRouter.get('/:id', (req: Request, res: Response): void => {
  const doc = Store.getDocumentById(req.params.id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  res.json({ data: doc });
});

// PUT /api/v1/documents/:id
documentsRouter.put('/:id', (req: Request, res: Response): void => {
  const existing = Store.getDocumentById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  const updated: DocumentData = {
    ...existing,
    ...req.body,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };

  Store.upsertDocument(updated);
  res.json({ data: updated });
});

// DELETE /api/v1/documents/:id
documentsRouter.delete('/:id', (req: Request, res: Response): void => {
  const existing = Store.getDocumentById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  Store.deleteDocument(req.params.id);
  res.json({ message: 'Document deleted successfully', id: req.params.id });
});

// GET /api/v1/documents/:id/pdf
documentsRouter.get('/:id/pdf', async (req: Request, res: Response): Promise<void> => {
  const doc = Store.getDocumentById(req.params.id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  try {
    const brandKit = Store.getBrandKit();
    const result = await curateAndGeneratePdf(doc, brandKit);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${result.fileName}"`);
    res.setHeader('X-Generation-Time-Ms', result.durationMs.toString());

    res.send(result.pdfBuffer);
  } catch (error: any) {
    console.error('Error generating document PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error?.message });
  }
});
