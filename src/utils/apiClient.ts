import { DocumentData, BrandKitConfig, TemplateDefinition, ApiKeyItem } from '../types';

const API_BASE = '/api/v1';

export const ApiClient = {
  // Documents
  async getDocuments(params?: { search?: string; category?: string; status?: string }): Promise<DocumentData[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.status && params.status !== 'all') query.set('status', params.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/documents${qs}`);
    if (!res.ok) throw new Error(`Failed to fetch documents: ${res.statusText}`);
    const json = await res.json();
    return json.data || [];
  },

  async getDocumentById(id: string): Promise<DocumentData | null> {
    const res = await fetch(`${API_BASE}/documents/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch document ${id}: ${res.statusText}`);
    const json = await res.json();
    return json.data || null;
  },

  async createDocument(doc: DocumentData): Promise<DocumentData> {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    if (!res.ok) throw new Error(`Failed to create document: ${res.statusText}`);
    const json = await res.json();
    return json.data;
  },

  async updateDocument(id: string, doc: Partial<DocumentData>): Promise<DocumentData> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    if (!res.ok) throw new Error(`Failed to update document: ${res.statusText}`);
    const json = await res.json();
    return json.data;
  },

  async deleteDocument(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  // Brand Kit
  async getBrandKit(): Promise<BrandKitConfig> {
    const res = await fetch(`${API_BASE}/brand-kit`);
    if (!res.ok) throw new Error(`Failed to fetch brand kit: ${res.statusText}`);
    const json = await res.json();
    return json.data;
  },

  async updateBrandKit(brandKit: BrandKitConfig): Promise<BrandKitConfig> {
    const res = await fetch(`${API_BASE}/brand-kit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brandKit),
    });
    if (!res.ok) throw new Error(`Failed to update brand kit: ${res.statusText}`);
    const json = await res.json();
    return json.data;
  },

  // Templates
  async getTemplates(): Promise<TemplateDefinition[]> {
    const res = await fetch(`${API_BASE}/templates`);
    if (!res.ok) throw new Error(`Failed to fetch templates: ${res.statusText}`);
    const json = await res.json();
    return json.data || [];
  },

  // API Keys
  async getApiKeys(): Promise<ApiKeyItem[]> {
    const res = await fetch(`${API_BASE}/keys`);
    if (!res.ok) throw new Error(`Failed to fetch API keys: ${res.statusText}`);
    const json = await res.json();
    return json.data || [];
  },

  async createApiKey(name: string): Promise<ApiKeyItem> {
    const res = await fetch(`${API_BASE}/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`Failed to create API key: ${res.statusText}`);
    const json = await res.json();
    return json.data;
  },

  async deleteApiKey(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/keys/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  // Bulk Generation
  async startBulkJob(templateId: string, records: any[]): Promise<{ jobId: string }> {
    const res = await fetch(`${API_BASE}/bulk/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, records }),
    });
    if (!res.ok) throw new Error(`Failed to start bulk job: ${res.statusText}`);
    const json = await res.json();
    return { jobId: json.jobId };
  },

  async getBulkJobStatus(jobId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/bulk/jobs/${jobId}`);
    if (!res.ok) throw new Error(`Failed to fetch bulk job status: ${res.statusText}`);
    const json = await res.json();
    return json.data;
  },

  getBulkDownloadUrl(jobId: string): string {
    return `${API_BASE}/bulk/jobs/${jobId}/download`;
  },
};
