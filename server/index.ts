import express from 'express';
import cors from 'cors';
import { generateRouter } from './routes/generate';
import { documentsRouter } from './routes/documents';
import { templatesRouter } from './routes/templates';
import { brandKitRouter } from './routes/brandKit';
import { bulkRouter } from './routes/bulk';
import { keysRouter } from './routes/keys';
import { healthRouter } from './routes/health';
import { findSystemChromium } from './engine/chromeDetector';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount Engine Routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/generate', generateRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/templates', templatesRouter);
app.use('/api/v1/brand-kit', brandKitRouter);
app.use('/api/v1/bulk', bulkRouter);
app.use('/api/v1/keys', keysRouter);

// Root greeting
app.get('/api', (req, res) => {
  res.json({
    name: 'CuratePDF Engine API',
    version: '2.0.0',
    documentation: 'https://curatepdf.site/app/developer',
    endpoints: [
      'POST /api/v1/generate',
      'GET  /api/v1/documents',
      'POST /api/v1/documents',
      'GET  /api/v1/documents/:id/pdf',
      'GET  /api/v1/templates',
      'GET  /api/v1/brand-kit',
      'POST /api/v1/bulk/jobs',
      'GET  /api/v1/bulk/jobs/:id/download',
      'GET  /api/v1/health',
    ],
  });
});

app.listen(PORT, () => {
  const chromiumPath = findSystemChromium();
  console.log(`\n==================================================`);
  console.log(`🚀 CuratePDF Backend Engine running on port ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api/v1`);
  console.log(`🖨️  Chromium Engine: ${chromiumPath || 'WARNING: No browser binary found'}`);
  console.log(`==================================================\n`);
});

export default app;
