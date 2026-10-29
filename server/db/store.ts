import fs from 'fs';
import path from 'path';
import { DocumentData, BrandKitConfig, TemplateDefinition, ApiKeyItem } from '../../src/types';
import { DEFAULT_BRAND_KIT, INITIAL_TEMPLATES, INITIAL_DOCUMENTS } from '../../src/utils/storage';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  documents: DocumentData[];
  brandKit: BrandKitConfig;
  templates: TemplateDefinition[];
  apiKeys: ApiKeyItem[];
}

function loadInitialState(): DatabaseSchema {
  return {
    documents: INITIAL_DOCUMENTS,
    brandKit: DEFAULT_BRAND_KIT,
    templates: INITIAL_TEMPLATES,
    apiKeys: [
      { id: 'key-1', name: 'Production Backend API', keyPrefix: 'cp_live_9f81a7b...', createdDate: '2026-10-15', lastUsed: '5 minutes ago' },
      { id: 'key-2', name: 'Staging CI/CD Runner', keyPrefix: 'cp_test_3c44e1d...', createdDate: '2026-10-22', lastUsed: 'Yesterday' },
    ],
  };
}

let db: DatabaseSchema = loadInitialState();

function persistToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

// Initial load
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(raw);
  } else {
    persistToDisk();
  }
} catch (e) {
  console.warn('Using in-memory database store');
}

export const Store = {
  // Documents
  getDocuments: () => db.documents,
  getDocumentById: (id: string) => db.documents.find(d => d.id === id),
  upsertDocument: (doc: DocumentData) => {
    const idx = db.documents.findIndex(d => d.id === doc.id);
    if (idx >= 0) {
      db.documents[idx] = { ...doc, updatedAt: new Date().toISOString() };
    } else {
      db.documents.unshift(doc);
    }
    persistToDisk();
    return doc;
  },
  deleteDocument: (id: string) => {
    db.documents = db.documents.filter(d => d.id !== id);
    persistToDisk();
  },

  // Brand Kit
  getBrandKit: () => db.brandKit,
  updateBrandKit: (kit: BrandKitConfig) => {
    db.brandKit = { ...kit };
    persistToDisk();
    return db.brandKit;
  },

  // Templates
  getTemplates: () => db.templates,
  getTemplateById: (id: string) => db.templates.find(t => t.id === id),

  // API Keys
  getApiKeys: () => db.apiKeys,
  createApiKey: (name: string) => {
    const key: ApiKeyItem = {
      id: `key-${Date.now().toString(36)}`,
      name,
      keyPrefix: `cp_live_${Math.random().toString(36).substring(2, 9)}...`,
      createdDate: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
    };
    db.apiKeys.unshift(key);
    persistToDisk();
    return key;
  },
  deleteApiKey: (id: string) => {
    db.apiKeys = db.apiKeys.filter(k => k.id !== id);
    persistToDisk();
  },
};
