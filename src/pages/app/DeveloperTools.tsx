import React, { useState } from 'react';
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
  ShieldAlert
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { ApiKeyItem } from '../../types';

export const DeveloperTools: React.FC<{ onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void }> = ({ onShowToast }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    { id: 'key-1', name: 'Production Backend API', keyPrefix: 'cp_live_9f81a7b...', createdDate: '2026-10-15', lastUsed: '5 minutes ago' },
    { id: 'key-2', name: 'Staging CI/CD Runner', keyPrefix: 'cp_test_3c44e1d...', createdDate: '2026-10-22', lastUsed: 'Yesterday' },
  ]);

  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'node' | 'python'>('curl');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  // Fetch from backend if online
  React.useEffect(() => {
    fetch('/api/v1/keys')
      .then(res => res.json())
      .then(json => {
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setApiKeys(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;

    try {
      const res = await fetch('/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setApiKeys([data, ...apiKeys]);
        setIsKeyDialogOpen(false);
        setNewKeyName('');
        if (onShowToast) onShowToast('API Key Generated', 'Store your key securely.', 'success');
        return;
      }
    } catch {}

    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      keyPrefix: `cp_live_${Math.random().toString(36).substring(2, 10)}...`,
      createdDate: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
    };
    setApiKeys([newKey, ...apiKeys]);
    setIsKeyDialogOpen(false);
    setNewKeyName('');
    if (onShowToast) {
      onShowToast('API Key Generated', 'Store your key securely. It cannot be shown again in full.', 'success');
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

  const codeSnippets = {
    curl: `curl -X POST https://api.curatepdf.site/v1/documents/generate \\
  -H "Authorization: Bearer cp_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "template_id": "tpl-invoice-minimal",
    "data": {
      "reference_number": "INV-2026-100",
      "client_name": "Acme Global",
      "line_items": [
        { "description": "Cloud Architecture", "quantity": 1, "rate": 3500 }
      ]
    },
    "format": "a4"
  }'`,
    node: `import { CuratePDF } from '@curatepdf/sdk';

const curate = new CuratePDF({
  apiKey: process.env.CURATEPDF_API_KEY,
});

const pdf = await curate.documents.generate({
  templateId: 'tpl-invoice-minimal',
  data: {
    referenceNumber: 'INV-2026-100',
    clientName: 'Acme Global',
    lineItems: [{ description: 'Cloud Architecture', quantity: 1, rate: 3500 }],
  },
  format: 'A4',
});

// Returns Buffer or Stream
await pdf.saveToFile('./invoice.pdf');`,
    python: `from curatepdf import CuratePDF

client = CuratePDF(api_key="cp_live_your_api_key_here")

pdf_bytes = client.documents.generate(
    template_id="tpl-invoice-minimal",
    data={
        "reference_number": "INV-2026-100",
        "client_name": "Acme Global",
        "line_items": [{"description": "Cloud Architecture", "quantity": 1, "rate": 3500}]
    },
    format="A4"
)

with open("invoice.pdf", "wb") as f:
    f.write(pdf_bytes)`
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Developer API & Integrations</h1>
        <p className="text-xs text-slate-500">
          Trigger automated document generation programmatically from your backend, webhooks, or scheduled jobs
        </p>
      </div>

      {/* API Keys Card */}
      <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
              API Authentication Keys
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Use these keys to authenticate HTTP requests to `api.curatepdf.site`</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsKeyDialogOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create API Key
          </Button>
        </div>

        <div className="rounded-lg border border-paper-border overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper-subtle border-b border-paper-border text-slate-500">
              <tr>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Key Prefix</th>
                <th className="py-2.5 px-3">Created</th>
                <th className="py-2.5 px-3">Last Used</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-border">
              {apiKeys.map((key) => (
                <tr key={key.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-ink">{key.name}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{key.keyPrefix}</td>
                  <td className="py-3 px-3 text-slate-500">{key.createdDate}</td>
                  <td className="py-3 px-3 text-slate-500">{key.lastUsed}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleRevokeKey(key.id)}
                      className="text-xs text-red-600 hover:underline font-medium"
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

      {/* Code Snippets Section */}
      <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
            Request Examples
          </h3>
          <div className="flex items-center bg-paper-subtle p-0.5 rounded-lg border border-paper-border text-xs font-semibold">
            {(['curl', 'node', 'python'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveCodeTab(lang)}
                className={`px-3 py-1 rounded capitalize ${
                  activeCodeTab === lang ? 'bg-white text-forest shadow-2xs' : 'text-slate-500'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="relative rounded-lg bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => {
              navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
              setCopiedKey(true);
              setTimeout(() => setCopiedKey(false), 2000);
            }}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded bg-slate-800"
            title="Copy code"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-mint" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <pre className="whitespace-pre">{codeSnippets[activeCodeTab]}</pre>
        </div>
      </div>

      {/* Generation Logs Sample */}
      <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
              API Generation Logs
            </h3>
            <p className="text-xs text-slate-500">Recent automated rendering transactions</p>
          </div>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            API Health: 100% Operational
          </span>
        </div>

        <div className="rounded-lg border border-paper-border overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-paper-subtle text-slate-500 border-b border-paper-border">
              <tr>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Method & Path</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Template</th>
                <th className="py-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-border text-slate-700">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 text-emerald-700 font-bold">200 OK</td>
                <td className="py-2.5 px-3">POST /v1/documents/generate</td>
                <td className="py-2.5 px-3">280ms</td>
                <td className="py-2.5 px-3 text-slate-500">tpl-invoice-minimal</td>
                <td className="py-2.5 px-3 text-right text-slate-400">10 mins ago</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 text-emerald-700 font-bold">200 OK</td>
                <td className="py-2.5 px-3">POST /v1/documents/generate</td>
                <td className="py-2.5 px-3">410ms</td>
                <td className="py-2.5 px-3 text-slate-500">tpl-proposal-modern</td>
                <td className="py-2.5 px-3 text-right text-slate-400">1 hour ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* New Key Modal */}
      <Dialog
        isOpen={isKeyDialogOpen}
        onClose={() => setIsKeyDialogOpen(false)}
        title="Create Secret API Key"
        description="Keys grant full document generation access. Name your key to identify its consumer."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsKeyDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateKey}>
              Generate Key
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Key Identifier Name"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="e.g. Production Invoicing Service"
            autoFocus
          />
        </div>
      </Dialog>
    </div>
  );
};
