import { createRequire } from 'module';
import { Writable } from 'stream';
import { DocumentData, BrandKitConfig, TemplateDefinition } from '../../src/types';
import { curateAndGeneratePdf } from './curator';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

export interface BatchJob {
  id: string;
  templateId: string;
  name: string;
  totalRecords: number;
  processedRecords: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  error?: string;
  zipBuffer?: Buffer;
}

const batchJobs = new Map<string, BatchJob>();

export function getBatchJob(id: string): BatchJob | undefined {
  return batchJobs.get(id);
}

export function listBatchJobs(): BatchJob[] {
  return Array.from(batchJobs.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Creates and asynchronously executes a bulk PDF generation batch, bundling
 * the completed documents into a ZIP archive.
 */
export async function executeBatchJob(
  jobId: string,
  template: TemplateDefinition,
  records: Array<Record<string, any>>,
  brandKit: BrandKitConfig
): Promise<BatchJob> {
  const job: BatchJob = {
    id: jobId,
    templateId: template.id,
    name: `${template.name} Batch (${records.length} docs)`,
    totalRecords: records.length,
    processedRecords: 0,
    status: 'processing',
    createdAt: new Date().toISOString(),
  };

  batchJobs.set(jobId, job);

  // Background execution
  (async () => {
    try {
      const generatedFiles: Array<{ name: string; buffer: Buffer }> = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const docId = `batch-doc-${jobId}-${i + 1}`;
        const refNumber = record.reference || `${template.defaultData.referenceNumber || 'DOC'}-${i + 101}`;

        // Merge record data onto template
        const docData: DocumentData = {
          ...template.defaultData,
          id: docId,
          title: record.title || `${template.name} - ${record.client || record.recipient || `Record ${i + 1}`}`,
          referenceNumber: refNumber,
          templateId: template.id,
          category: template.category,
          status: 'generated',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          date: record.date || new Date().toISOString().split('T')[0],
          dueDate: record.dueDate || template.defaultData.dueDate,
          clientName: record.client || record.clientName || template.defaultData.clientName,
          clientCompany: record.company || record.clientCompany || template.defaultData.clientCompany,
          clientEmail: record.email || record.clientEmail || template.defaultData.clientEmail,
          summary: record.summary || template.defaultData.summary,
          recipientName: record.recipient || record.recipientName || template.defaultData.recipientName,
          pageSize: template.defaultData.pageSize || 'A4',
          orientation: template.defaultData.orientation || 'portrait',
          margin: template.defaultData.margin || 'standard',
        };

        if (record.amount) {
          const numericAmount = parseFloat(String(record.amount).replace(/[^0-9.]/g, '')) || 1000;
          docData.lineItems = [
            { id: '1', description: `${template.name} Deliverables`, quantity: 1, rate: numericAmount }
          ];
          docData.subtotal = numericAmount;
          docData.total = numericAmount;
        }

        const result = await curateAndGeneratePdf(docData, brandKit);
        generatedFiles.push({
          name: `${refNumber}.pdf`,
          buffer: result.pdfBuffer,
        });

        job.processedRecords = i + 1;
      }

      // Package into ZIP
      const zipBuffer = await createZipArchive(generatedFiles);
      job.zipBuffer = zipBuffer;
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
    } catch (err: any) {
      console.error(`Batch job ${jobId} failed:`, err);
      job.status = 'failed';
      job.error = err?.message || 'Unknown batch generation error';
    }
  })();

  return job;
}

function createZipArchive(files: Array<{ name: string; buffer: Buffer }>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    const bufferStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      },
    });

    bufferStream.on('finish', () => {
      resolve(Buffer.concat(chunks));
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(bufferStream);

    for (const file of files) {
      archive.append(file.buffer, { name: file.name });
    }

    archive.finalize();
  });
}
