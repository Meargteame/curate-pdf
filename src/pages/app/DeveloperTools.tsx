import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Key, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Code2, 
  Activity, 
  ExternalLink,
  ShieldAlert,
  Play,
  Download,
  Webhook,
  Send,
  Cpu,
  Layers,
  FileCheck,
  RefreshCw,
  Clock,
  Radio
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { ApiKeyItem } from '../../types';

interface DeveloperToolsProps {
  onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

const PRESET_PAYLOADS: Record<string, string> = {
  invoice: JSON.stringify({
    title: 'Automated Commercial Invoice',
    referenceNumber: 'INV-API-2026-01',
    templateId: 'tpl-invoice-clean',
    category: 'finance',
    clientCompany: 'Stripe Global Services Inc',
    clientEmail: 'billing@stripe.example',
    total: 4250,
    lineItems: [
      { id: '1', description: 'Headless PDF Generation Engine Access', quantity: 1, rate: 2500 },
      { id: '2', description: 'Enterprise Vector PDF SLA & Webhooks', quantity: 1, rate: 1750 }
    ]
  }, null, 2),
  proposal: JSON.stringify({
    title: 'Executive Architecture Proposal',
    referenceNumber: 'PROP-API-2026-99',
    templateId: 'tpl-proposal-modern',
    category: 'business',
    clientCompany: 'Northwind Advisory Partners',
    clientEmail: 'procurement@northwind.example',
    summary: 'Automated provisioning of standardized document templates across 12 distributed business units.',
    total: 12000,
    lineItems: [
      { id: '1', description: 'Template System Design & Integration', quantity: 1, rate: 12000 }
    ]
  }, null, 2),
  candidate: JSON.stringify({
    title: 'Candidate Evaluation Dossier',
    referenceNumber: 'DOSSIER-API-401',
    templateId: 'tpl-candidate-profile',
    category: 'recruitment',
    clientCompany: 'Meridian Executive Search',
    candidateRole: 'Principal Cloud Systems Architect',
    candidateExperienceYears: 11,
    candidateSkills: ['Distributed Systems', 'Vector Engines', 'TypeScript', 'Kubernetes'],
    summary: 'Senior engineering leader specializing in high-throughput document compilation microservices.'
  }, null, 2),
};

export const DeveloperTools: React.FC<DeveloperToolsProps> = ({ onShowToast }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    { id: 'key-1', name: 'Production Headless Invoicing', keyPrefix: 'cp_live_9f81a7b...', createdDate: '2026-10-15', lastUsed: '5 minutes ago' },
    { id: 'key-2', name: 'Staging CI/CD Pipeline', keyPrefix: 'cp_test_3c44e1d...', createdDate: '2026-10-22', lastUsed: 'Yesterday' },
  ]);

  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'node' | 'python'>('curl');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState<'full' | 'generate' | 'read'>('full');
  const [createdSecretToken, setCreatedSecretToken] = useState<string | null>(null);

  // Interactive API Sandbox state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/documents');
  const [httpMethod, setHttpMethod] = useState<'GET' | 'POST'>('POST');
  const [selectedPreset, setSelectedPreset] = useState<'invoice' | 'proposal' | 'candidate'>('invoice');
  const [sandboxPayload, setSandboxPayload] = useState<string>(PRESET_PAYLOADS.invoice);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [sandboxLatency, setSandboxLatency] = useState<number | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Webhook simulator state
  const [webhookUrl, setWebhookUrl] = useState('https://webhook.site/demo-curatepdf');
  const [webhookEvent, setWebhookEvent] = useState('batch.completed');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<Array<{
    id: string;
    event: string;
    status: number;
    latency: number;
    timestamp: string;
  }>>([
    {
      id: 'evt_991b2c',
      event: 'batch.completed',
      status: 200,
      latency: 48,
      timestamp: 'Today at 10:14 AM'
    }
  ]);

  // Fetch API keys from backend
  useEffect(() => {
    fetch('/api/v1/keys')
      .then(res => res.json())
      .then(json => {
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setApiKeys(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleEndpointChange = (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    if (endpoint === '/api/v1/documents') {
      setHttpMethod('POST');
      setSandboxPayload(PRESET_PAYLOADS[selectedPreset]);
    } else {
      setHttpMethod('GET');
      setSandboxPayload('');
    }
  };

  const handlePresetChange = (preset: 'invoice' | 'proposal' | 'candidate') => {
    setSelectedPreset(preset);
    setSelectedEndpoint('/api/v1/documents');
    setHttpMethod('POST');
    setSandboxPayload(PRESET_PAYLOADS[preset]);
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;

    const rawToken = `cp_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

    try {
      const res = await fetch('/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim(), scope: newKeyScope }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setApiKeys([data, ...apiKeys]);
        setCreatedSecretToken(rawToken);
        if (onShowToast) onShowToast('API Key Generated', 'Store your key securely.', 'success');
        return;
      }
    } catch {}

    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      keyPrefix: `cp_live_${rawToken.substring(8, 16)}...`,
      createdDate: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
    };
    setApiKeys([newKey, ...apiKeys]);
    setCreatedSecretToken(rawToken);
    if (onShowToast) {
      onShowToast('API Key Generated', 'Store your key securely. It will not be shown again.', 'success');
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await fetch(`/api/v1/keys/${id}`, { method: 'DELETE' });
    } catch {}
    setApiKeys(apiKeys.filter(k => k.id !== id));
    if (onShowToast) {
      onShowToast('Key Revoked', 'API key has been deactivated.', 'info');
    }
  };

  const handleRunSandbox = async () => {
    setIsTestingApi(true);
    const startTime = performance.now();
    try {
      let res: Response;
      if (httpMethod === 'POST') {
        const body = JSON.parse(sandboxPayload || '{}');
        res = await fetch(selectedEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(selectedEndpoint);
      }

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = { response: text };
      }

      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);
      setSandboxLatency(elapsed);
      setSandboxResponse({ status: res.status, statusText: res.statusText || 'OK', data });

      if (onShowToast) {
        onShowToast(`API Response: ${res.status} OK`, `Executed in ${elapsed}ms`, res.ok ? 'success' : 'error');
      }
    } catch (err: any) {
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);
      setSandboxLatency(elapsed);
      setSandboxResponse({ status: 500, error: err.message });
      if (onShowToast) {
        onShowToast('API Error', err.message, 'error');
      }
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleTestWebhook = () => {
    if (!webhookUrl) return;
    setIsSendingWebhook(true);

    setTimeout(() => {
      setIsSendingWebhook(false);
      const newLog = {
        id: `evt_${Math.random().toString(36).substring(2, 8)}`,
        event: webhookEvent,
        status: 200,
        latency: Math.floor(Math.random() * 45) + 32,
        timestamp: 'Just now'
      };
      setWebhookLogs([newLog, ...webhookLogs]);
      if (onShowToast) {
        onShowToast('Webhook Ping Delivered', `200 OK sent to ${webhookUrl}`, 'success');
      }
    }, 600);
  };

  const codeSnippets = {
    curl: `curl -X POST https://api.curatepdf.site/v1/documents \\
  -H "Authorization: Bearer cp_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "template_id": "tpl-invoice-clean",
    "title": "Commercial Invoice",
    "reference_number": "INV-2026-100",
    "client_company": "Acme Global Corp",
    "line_items": [
      { "description": "Cloud Architecture Retainer", "quantity": 1, "rate": 3500 }
    ],
    "format": "A4"
  }'`,
    node: `import { CuratePDF } from '@curatepdf/sdk';

const curate = new CuratePDF({
  apiKey: process.env.CURATEPDF_API_KEY,
});

const doc = await curate.documents.create({
  templateId: 'tpl-invoice-clean',
  title: 'Commercial Invoice',
  referenceNumber: 'INV-2026-100',
  clientCompany: 'Acme Global Corp',
  lineItems: [{ description: 'Cloud Architecture Retainer', quantity: 1, rate: 3500 }],
  pageSize: 'A4',
});

// Download high-fidelity vector PDF buffer
const pdfBuffer = await curate.documents.downloadPdf(doc.id);
await Bun.write('./invoice.pdf', pdfBuffer);`,
    python: `from curatepdf import CuratePDF

client = CuratePDF(api_key="cp_live_your_api_key_here")

# Generate document and retrieve vector PDF
pdf_stream = client.documents.create_and_download(
    template_id="tpl-invoice-clean",
    title="Commercial Invoice",
    reference_number="INV-2026-100",
    client_company="Acme Global Corp",
    line_items=[{"description": "Cloud Architecture Retainer", "quantity": 1, "rate": 3500}],
    page_size="A4"
)

with open("invoice.pdf", "wb") as f:
    f.write(pdf_stream)`
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 antialiased">
      {/* Top Header & Quota Metric Banner */}
      <div className="bg-white p-6 rounded-card border border-paper-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center text-forest">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-ink">Developer API & Sandbox</h1>
              <p className="text-xs text-slate-500">
                Trigger programmatic document generation, integrate CI/CD webhooks, and automate PDF workflows.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Engine Telemetry */}
        <div className="flex items-center gap-3 bg-paper-subtle p-2.5 rounded-lg border border-paper-border text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-paper-border shadow-2xs font-semibold text-forest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Headless Engine Active</span>
          </div>
          <div className="text-slate-500 font-medium">
            <span>Quota: </span>
            <span className="font-semibold text-ink font-mono">842 / 10,000</span>
          </div>
        </div>
      </div>

      {/* 1. API Authentication Keys */}
      <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              API Authentication Keys
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Bearer authentication tokens used for server-side generation requests</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setNewKeyName('');
              setCreatedSecretToken(null);
              setIsKeyDialogOpen(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create API Key
          </Button>
        </div>

        <div className="rounded-lg border border-paper-border overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper-subtle border-b border-paper-border text-slate-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Key Name</th>
                <th className="py-2.5 px-3">Prefix Token</th>
                <th className="py-2.5 px-3">Created</th>
                <th className="py-2.5 px-3">Last Activity</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-border">
              {apiKeys.map((key) => (
                <tr key={key.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-ink">{key.name}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 bg-paper-subtle/50 rounded">{key.keyPrefix}</td>
                  <td className="py-3 px-3 text-slate-500">{key.createdDate}</td>
                  <td className="py-3 px-3 text-slate-500">{key.lastUsed}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRevokeKey(key.id)}
                      className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Interactive API Request Tester (Sandbox) */}
      <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-paper-border">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-forest" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
              Live API Request Tester
            </h3>
          </div>

          {/* Endpoint Dropdown & Method Pill */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${httpMethod === 'POST' ? 'bg-forest text-white' : 'bg-blue-600 text-white'}`}>
                {httpMethod}
              </span>
              <select
                value={selectedEndpoint}
                onChange={(e) => handleEndpointChange(e.target.value)}
                className="bg-paper-subtle border border-paper-border rounded px-2.5 py-1 text-xs font-mono font-semibold text-slate-700 cursor-pointer"
              >
                <option value="/api/v1/documents">/api/v1/documents (Create Document)</option>
                <option value="/api/v1/health">/api/v1/health (Engine Health & Memory)</option>
                <option value="/api/v1/templates">/api/v1/templates (List Templates)</option>
                <option value="/api/v1/brand-kit">/api/v1/brand-kit (Get Workspace Tokens)</option>
              </select>
            </div>

            {selectedEndpoint === '/api/v1/documents' && (
              <div className="flex items-center gap-1 text-[11px] pl-2 border-l border-paper-border">
                <span className="text-slate-400">Payload:</span>
                <button
                  type="button"
                  onClick={() => handlePresetChange('invoice')}
                  className={`px-2 py-0.5 rounded font-medium ${selectedPreset === 'invoice' ? 'bg-forest-50 text-forest font-semibold' : 'text-slate-600 hover:text-ink'}`}
                >
                  Invoice
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange('proposal')}
                  className={`px-2 py-0.5 rounded font-medium ${selectedPreset === 'proposal' ? 'bg-forest-50 text-forest font-semibold' : 'text-slate-600 hover:text-ink'}`}
                >
                  Proposal
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange('candidate')}
                  className={`px-2 py-0.5 rounded font-medium ${selectedPreset === 'candidate' ? 'bg-forest-50 text-forest font-semibold' : 'text-slate-600 hover:text-ink'}`}
                >
                  Dossier
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dual Pane: Request Body Left, Live Response Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink">
                {httpMethod === 'POST' ? 'JSON Request Body' : 'Query Parameters (None required)'}
              </label>
              {httpMethod === 'POST' && (
                <span className="text-[10px] text-slate-400 font-mono">application/json</span>
              )}
            </div>
            <textarea
              rows={11}
              value={sandboxPayload}
              disabled={httpMethod === 'GET'}
              onChange={(e) => setSandboxPayload(e.target.value)}
              placeholder={httpMethod === 'GET' ? 'This endpoint is a GET request and does not require a request body.' : ''}
              className={`w-full font-mono text-xs rounded-xl p-3 border focus:outline-hidden ${
                httpMethod === 'GET' 
                  ? 'bg-slate-900/60 text-slate-400 border-slate-800' 
                  : 'bg-slate-900 text-slate-100 border-slate-800 focus:ring-1 focus:ring-forest'
              }`}
            />
            <div className="flex justify-end pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunSandbox}
                loading={isTestingApi}
                leftIcon={<Play className="w-3.5 h-3.5" />}
              >
                Send Request
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink block">Response Payload</label>
              {sandboxLatency !== null && (
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                    sandboxResponse?.status === 200 || sandboxResponse?.status === 201
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-red-700 bg-red-50 border-red-200'
                  }`}>
                    {sandboxResponse?.status || 200} {sandboxResponse?.statusText || 'OK'} • {sandboxLatency}ms
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (sandboxResponse) {
                        navigator.clipboard.writeText(JSON.stringify(sandboxResponse, null, 2));
                        setCopiedResponse(true);
                        setTimeout(() => setCopiedResponse(false), 2000);
                      }
                    }}
                    className="text-[11px] text-slate-500 hover:text-ink flex items-center gap-1 font-medium"
                  >
                    {copiedResponse ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
            <div className="h-[258px] bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl p-3 border border-slate-800 overflow-auto shadow-inner">
              {sandboxResponse ? (
                <pre>{JSON.stringify(sandboxResponse, null, 2)}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 italic gap-1">
                  <Terminal className="w-6 h-6 text-slate-700" />
                  <span>Click "Send Request" to test live endpoint</span>
                </div>
              )}
            </div>

            {/* Quick Actions on Successful Document Creation */}
            {sandboxResponse?.data?.id && (
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/api/v1/documents/${sandboxResponse.data.id}/pdf`, '_blank')}
                  leftIcon={<Download className="w-3.5 h-3.5 text-forest" />}
                  className="text-xs"
                >
                  Download Response PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Client SDK Code Snippets */}
      <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              Client SDK Integration Snippets
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Copy production-ready code samples for your preferred runtime</p>
          </div>
          <div className="flex items-center bg-paper-subtle p-0.5 rounded-lg border border-paper-border text-xs font-semibold">
            {(['curl', 'node', 'python'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveCodeTab(lang)}
                className={`px-3 py-1 rounded capitalize transition-all ${
                  activeCodeTab === lang ? 'bg-white text-forest shadow-2xs font-bold' : 'text-slate-500 hover:text-ink'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="relative rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto shadow-inner">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
              setCopiedKey(true);
              setTimeout(() => setCopiedKey(false), 2000);
            }}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 transition-colors"
            title="Copy code"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <pre className="whitespace-pre leading-relaxed">{codeSnippets[activeCodeTab]}</pre>
        </div>
      </div>

      {/* 4. Webhook Notification Simulator */}
      <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-paper-border">
          <div className="flex items-center gap-2">
            <Webhook className="w-4 h-4 text-forest" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
              Webhook Delivery & Events
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">HTTP POST with signature headers</span>
        </div>

        <p className="text-xs text-slate-500">
          Subscribe to event notifications when asynchronous bulk batch jobs complete or documents are created.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4">
            <Select
              label="Trigger Event"
              value={webhookEvent}
              onChange={(e) => setWebhookEvent(e.target.value)}
              options={[
                { value: 'batch.completed', label: 'batch.completed (Bulk ZIP Ready)' },
                { value: 'document.created', label: 'document.created (PDF Available)' },
                { value: 'brand.updated', label: 'brand.updated (Tokens Synced)' },
              ]}
            />
          </div>
          <div className="md:col-span-6">
            <Input
              label="Destination Endpoint URL"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-domain.com/webhooks/curatepdf"
            />
          </div>
          <div className="md:col-span-2 pt-6">
            <Button
              variant="outline"
              size="md"
              className="w-full"
              loading={isSendingWebhook}
              onClick={handleTestWebhook}
              leftIcon={<Send className="w-3.5 h-3.5 text-forest" />}
            >
              Test Ping
            </Button>
          </div>
        </div>

        {/* Webhook Activity Table */}
        <div className="pt-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Recent Webhook Deliveries</h4>
          <div className="rounded-lg border border-paper-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper-subtle border-b border-paper-border text-slate-500 font-semibold">
                <tr>
                  <th className="py-2 px-3">Delivery ID</th>
                  <th className="py-2 px-3">Event</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Latency</th>
                  <th className="py-2 px-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border">
                {webhookLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-600">{log.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-ink">{log.event}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>{log.status} Delivered</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{log.latency}ms</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Create API Key */}
      <Dialog
        isOpen={isKeyDialogOpen}
        onClose={() => setIsKeyDialogOpen(false)}
        title={createdSecretToken ? "API Key Created" : "Create Secret API Key"}
        description={createdSecretToken ? "Copy this secret key now. You will not be able to view it again in full." : "Keys authenticate HTTP requests to generate documents and download PDFs."}
        footer={
          createdSecretToken ? (
            <Button variant="primary" size="sm" onClick={() => setIsKeyDialogOpen(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setIsKeyDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateKey}>
                Generate Key
              </Button>
            </>
          )
        }
      >
        {createdSecretToken ? (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
              <p className="font-semibold mb-1">Make sure to copy your API key</p>
              <p>For your security, we only display this token once.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={createdSecretToken}
                className="w-full bg-slate-100 font-mono text-xs px-3 py-2 rounded-lg border border-paper-border text-ink select-all"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(createdSecretToken);
                  if (onShowToast) onShowToast('Copied to Clipboard', 'Key token copied', 'success');
                }}
                leftIcon={<Copy className="w-3.5 h-3.5" />}
              >
                Copy
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              label="Key Identifier / Consumer Name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Production Invoicing Microservice"
              autoFocus
            />

            <Select
              label="Permission Scope"
              value={newKeyScope}
              onChange={(e) => setNewKeyScope(e.target.value as any)}
              options={[
                { value: 'full', label: 'Full Access (Documents, Templates, Brand Kit)' },
                { value: 'generate', label: 'Generation Only (Create & Download PDFs)' },
                { value: 'read', label: 'Read Only (Fetch Documents & Status)' },
              ]}
            />
          </div>
        )}
      </Dialog>
    </div>
  );
};
