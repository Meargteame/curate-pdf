import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { generateRouter } from './routes/generate';
import { documentsRouter } from './routes/documents';
import { templatesRouter } from './routes/templates';
import { brandKitRouter } from './routes/brandKit';
import { bulkRouter } from './routes/bulk';
import { keysRouter } from './routes/keys';
import { healthRouter } from './routes/health';
import { userRouter } from './routes/user';
import { dbRouter } from './routes/database';
import { findSystemChromium } from './engine/chromeDetector';

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
const distPath = path.join(process.cwd(), 'dist');

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
app.use('/api/v1/user', userRouter);
app.use('/api/v1/db', dbRouter);

// Root greeting for API
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

// Production: Serve static build assets and handle SPA routing fallback
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, { maxAge: isProduction ? '1d' : 0 }));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

const server = app.listen(PORT, () => {
  const chromiumPath = findSystemChromium();
  console.log(`\n==================================================`);
  console.log(`🚀 CuratePDF Backend Engine running on port ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api/v1`);
  console.log(`🖨️  Chromium Engine: ${chromiumPath || 'WARNING: No browser binary found'}`);
  if (fs.existsSync(distPath)) {
    console.log(`🌐 Serving Frontend SPA from: ${distPath}`);
  }
  console.log(`==================================================\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
