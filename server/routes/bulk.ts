import { Router, Request, Response } from 'express';
import { Store } from '../db/store';
import { executeBatchJob, getBatchJob, listBatchJobs } from '../engine/batchEngine';

export const bulkRouter = Router();

// POST /api/v1/bulk/jobs
bulkRouter.post('/jobs', async (req: Request, res: Response): Promise<void> => {
  const { templateId, records } = req.body;

  if (!templateId || !Array.isArray(records) || records.length === 0) {
    res.status(400).json({
      error: 'Invalid Request',
      message: 'templateId and a non-empty records array are required.',
    });
    return;
  }

  const template = Store.getTemplateById(templateId);
  if (!template) {
    res.status(404).json({ error: 'Template not found' });
    return;
  }

  const brandKit = Store.getBrandKit();
  const jobId = `batch-${Date.now().toString(36)}`;

  const job = await executeBatchJob(jobId, template, records, brandKit);

  res.status(202).json({
    message: 'Batch generation started',
    jobId: job.id,
    totalRecords: job.totalRecords,
    status: job.status,
  });
});

// GET /api/v1/bulk/jobs
bulkRouter.get('/jobs', (req: Request, res: Response): void => {
  res.json({ data: listBatchJobs() });
});

// GET /api/v1/bulk/jobs/:id
bulkRouter.get('/jobs/:id', (req: Request, res: Response): void => {
  const job = getBatchJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: 'Batch job not found' });
    return;
  }

  res.json({
    data: {
      id: job.id,
      name: job.name,
      templateId: job.templateId,
      status: job.status,
      totalRecords: job.totalRecords,
      processedRecords: job.processedRecords,
      progressPercent: Math.round((job.processedRecords / job.totalRecords) * 100),
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      error: job.error,
    },
  });
});

// GET /api/v1/bulk/jobs/:id/download
bulkRouter.get('/jobs/:id/download', (req: Request, res: Response): void => {
  const job = getBatchJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: 'Batch job not found' });
    return;
  }

  if (job.status !== 'completed' || !job.zipBuffer) {
    res.status(400).json({
      error: 'Job Incomplete',
      message: `Batch job is currently ${job.status}. Download is available once complete.`,
    });
    return;
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${job.id}-documents.zip"`);
  res.send(job.zipBuffer);
});
