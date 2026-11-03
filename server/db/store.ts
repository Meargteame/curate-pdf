import fs from 'fs';
import path from 'path';
import { DocumentData, BrandKitConfig, TemplateDefinition, ApiKeyItem, UserProfile } from '../../src/types';
import { DEFAULT_BRAND_KIT, INITIAL_TEMPLATES, INITIAL_DOCUMENTS, DEFAULT_USER_PROFILE } from '../../src/utils/storage';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface DatabaseSchema {
  documents: DocumentData[];
  brandKit: BrandKitConfig;
  templates: TemplateDefinition[];
  apiKeys: ApiKeyItem[];
  userProfile: UserProfile;
  teamMembers: TeamMember[];
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
    userProfile: DEFAULT_USER_PROFILE,
    teamMembers: [
      { id: '1', name: DEFAULT_USER_PROFILE.name, email: DEFAULT_USER_PROFILE.email, role: 'Owner', status: 'Active' },
      { id: '2', name: 'Alex Rivera', email: 'a.rivera@example.com', role: 'Editor', status: 'Active' },
      { id: '3', name: 'Elena Rostova', email: 'e.rostova@example.com', role: 'Viewer', status: 'Invited' },
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
    const parsed = JSON.parse(raw);
    db = {
      ...loadInitialState(),
      ...parsed,
      documents: parsed.documents || INITIAL_DOCUMENTS,
      brandKit: parsed.brandKit || DEFAULT_BRAND_KIT,
      templates: parsed.templates || INITIAL_TEMPLATES,
      apiKeys: parsed.apiKeys || [],
      userProfile: parsed.userProfile || DEFAULT_USER_PROFILE,
      teamMembers: parsed.teamMembers || [
        { id: '1', name: DEFAULT_USER_PROFILE.name, email: DEFAULT_USER_PROFILE.email, role: 'Owner', status: 'Active' },
        { id: '2', name: 'Alex Rivera', email: 'a.rivera@example.com', role: 'Editor', status: 'Active' },
      ],
    };
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
      db.documents.unshift({
        ...doc,
        createdAt: doc.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    persistToDisk();
    return doc;
  },
  deleteDocument: (id: string) => {
    db.documents = db.documents.filter(d => d.id !== id);
    persistToDisk();
  },
  clearDocuments: () => {
    db.documents = [];
    persistToDisk();
  },

  // Brand Kit
  getBrandKit: () => db.brandKit,
  updateBrandKit: (kit: BrandKitConfig) => {
    db.brandKit = { ...kit };
    persistToDisk();
    return db.brandKit;
  },

  // User Profile
  getUserProfile: () => db.userProfile,
  updateUserProfile: (profile: Partial<UserProfile>) => {
    db.userProfile = { ...db.userProfile, ...profile };
    persistToDisk();
    return db.userProfile;
  },

  // Team Members
  getTeamMembers: () => db.teamMembers,
  addTeamMember: (member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: `member-${Date.now().toString(36)}`,
    };
    db.teamMembers.push(newMember);
    persistToDisk();
    return newMember;
  },
  deleteTeamMember: (id: string) => {
    db.teamMembers = db.teamMembers.filter(m => m.id !== id);
    persistToDisk();
  },

  // Templates
  getTemplates: () => db.templates,
  getTemplateById: (id: string) => db.templates.find(t => t.id === id),
  upsertTemplate: (tpl: TemplateDefinition) => {
    const idx = db.templates.findIndex(t => t.id === tpl.id);
    if (idx >= 0) {
      db.templates[idx] = tpl;
    } else {
      db.templates.push(tpl);
    }
    persistToDisk();
    return tpl;
  },
  deleteTemplate: (id: string) => {
    db.templates = db.templates.filter(t => t.id !== id);
    persistToDisk();
  },

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

  // Full Database Reset & Statistics
  resetDatabase: () => {
    db = loadInitialState();
    persistToDisk();
    return db;
  },
  getDatabaseStats: () => {
    const totalDocs = db.documents.length;
    const generatedDocs = db.documents.filter(d => d.status === 'generated').length;
    const readyDocs = db.documents.filter(d => d.status === 'ready').length;
    const draftDocs = db.documents.filter(d => d.status === 'draft').length;
    const templatesCount = db.templates.length;
    const keysCount = db.apiKeys.length;

    return {
      totalDocuments: totalDocs,
      generatedDocuments: generatedDocs,
      readyDocuments: readyDocs,
      draftDocuments: draftDocs,
      totalTemplates: templatesCount,
      activeApiKeys: keysCount,
      brandName: db.brandKit.companyName,
      lastUpdated: new Date().toISOString(),
    };
  },
};
