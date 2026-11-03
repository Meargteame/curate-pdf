import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  Plus, 
  FileCode, 
  Download, 
  Edit3, 
  ArrowRight, 
  FileText, 
  Clock, 
  Layers, 
  Palette,
  FileCheck,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { 
  getStoredDocuments, 
  saveStoredDocuments,
  getStoredTemplates, 
  getStoredBrandKit,
  getStoredUserProfile,
  upsertDocument,
  DB_SYNC_EVENT
} from '../../utils/storage';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Badge';
import { Badge } from '../../components/ui/Badge';
import { generateAndDownloadPdf } from '../../utils/pdfGenerator';
import { DocumentData } from '../../types';

export const Overview: React.FC<{ onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void }> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentData[]>(() => getStoredDocuments());
  const [templates, setTemplates] = useState(() => getStoredTemplates());
  const [brandKit, setBrandKit] = useState(() => getStoredBrandKit());
  const [userProfile, setUserProfile] = useState(() => getStoredUserProfile());

  // Dynamic live fetch from server database on mount
  React.useEffect(() => {
    fetch('/api/v1/documents')
      .then(res => res.json())
      .then(json => {
        if (json.data && Array.isArray(json.data)) {
          setDocuments(json.data);
          saveStoredDocuments(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Live Reactive DB Sync listener
  React.useEffect(() => {
    const handleSync = () => {
      setDocuments(getStoredDocuments());
      setBrandKit(getStoredBrandKit());
      setTemplates(getStoredTemplates());
      setUserProfile(getStoredUserProfile());
    };

    window.addEventListener(DB_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(DB_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const recentDocs = documents.slice(0, 5);
  const generatedCount = documents.filter(d => d.status === 'generated').length;

  const handleDuplicate = (doc: DocumentData) => {
    const duplicated: DocumentData = {
      ...doc,
      id: `doc-${Date.now().toString(36)}`,
      title: `${doc.title} (Copy)`,
      referenceNumber: `${doc.referenceNumber}-COPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };
    const updated = upsertDocument(duplicated);
    setDocuments(updated);
    if (onShowToast) {
      onShowToast('Document duplicated', `Created copy of "${doc.title}"`, 'success');
    }
  };

  const handleQuickDownload = (doc: DocumentData) => {
    window.open(`/api/v1/documents/${doc.id}/pdf`, '_blank');
    if (onShowToast) {
      onShowToast('Downloading PDF', `Streaming vector PDF for "${doc.title}"`, 'info');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Workspace Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 pb-1">
        <div>
          <div className="mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink tracking-tight">
              Welcome back, {userProfile.name.split(' ')[0] || 'Sarah'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Design, compile, and batch-render print-ready vector PDFs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/app/templates')}
            leftIcon={<Layers className="w-4 h-4 text-slate-500" />}
            className="h-10 px-4 text-xs sm:text-sm font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs"
          >
            Browse Templates
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/app/editor')}
            leftIcon={<Plus className="w-4 h-4 text-white" />}
            className="h-10 px-4 text-xs sm:text-sm font-semibold shadow-xs"
          >
            Create PDF
          </Button>
        </div>
      </div>

      {/* Metrics / Workspace Activity summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-paper-border shadow-card hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-display">Total Documents</span>
            <div className="w-7 h-7 rounded-lg bg-forest-50 text-forest flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-display font-extrabold text-ink">{documents.length}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <span>+12%</span> <span className="text-slate-400 font-normal">from last cycle</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-paper-border shadow-card hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-display">Generated PDFs</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-display font-extrabold text-ink">{generatedCount}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Ready for export & print</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-paper-border shadow-card hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-display">Available Templates</span>
            <div className="w-7 h-7 rounded-lg bg-sage-50 text-sage flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-display font-extrabold text-ink">{templates.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">8 design categories</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-paper-border shadow-card hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-display">Brand Tokens</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-5 h-5 rounded-md border shadow-2xs" style={{ backgroundColor: brandKit.primaryColor }} />
            <span className="text-sm font-semibold text-ink font-display truncate">{brandKit.companyName}</span>
          </div>
          <NavLink to="/app/brand-kit" className="text-[11px] text-forest font-semibold hover:underline block mt-1">
            Configure Brand Kit →
          </NavLink>
        </div>
      </div>

      {/* Creative Production Workflows */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-display">
              Creation Pipelines & Workflows
            </h2>
            <p className="text-xs text-slate-500">
              Select your document authoring mode: real-time studio drafting, bulk spreadsheet merge, or brand design tokens.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Workflow 1: Live Visual Studio */}
          <div 
            onClick={() => navigate('/app/editor')}
            className="group p-5 bg-white rounded-card border border-paper-border hover:border-forest/50 hover:shadow-card transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest flex items-center justify-center group-hover:bg-forest group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-forest-50 text-forest border border-forest-100">
                  Visual Studio
                </span>
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-ink group-hover:text-forest transition-colors">
                  Live Interactive Drafting
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Craft publication-grade proposals and invoices with real-time vector rendering, margin guides, and layout switching.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-forest group-hover:translate-x-0.5 transition-transform">
              <span>Open Document Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Workflow 2: Bulk CSV Merge */}
          <div 
            onClick={() => navigate('/app/bulk')}
            className="group p-5 bg-white rounded-card border border-paper-border hover:border-emerald-600/50 hover:shadow-card transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Data Merge
                </span>
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-ink group-hover:text-emerald-700 transition-colors">
                  Bulk CSV Automation
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Upload spreadsheet rows, map columns to dynamic template tags, and generate hundreds of individualized client PDFs in one click.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
              <span>Launch Bulk Generator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Workflow 3: Brand Kit Sync */}
          <div 
            onClick={() => navigate('/app/brand-kit')}
            className="group p-5 bg-white rounded-card border border-paper-border hover:border-amber-600/50 hover:shadow-card transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-700 group-hover:text-white transition-colors">
                  <Palette className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                  Brand Tokens
                </span>
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-ink group-hover:text-amber-700 transition-colors">
                  Brand Kit Normalization
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Configure corporate primary colors, typography pairings, and company emblems automatically inherited across all documents.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700 group-hover:translate-x-0.5 transition-transform">
              <span>Configure Brand Tokens</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-ink">Recent Documents</h2>
            <p className="text-xs text-slate-500">Jump right back into editing or download latest revisions</p>
          </div>
          <NavLink
            to="/app/documents"
            className="text-xs font-semibold text-forest hover:text-forest-700 flex items-center gap-1 transition-colors"
          >
            View all documents <ChevronRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="bg-white rounded-card border border-paper-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper-subtle border-b border-paper-border text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Document</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Category</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Reference</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Updated</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border text-slate-700">
                {recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-paper-subtle/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-ink">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-forest-50 text-forest flex items-center justify-center shrink-0 border border-forest-100">
                          <FileCode className="w-4 h-4" />
                        </div>
                        <div>
                          <NavLink
                            to={`/app/editor?id=${doc.id}`}
                            className="font-semibold text-ink hover:text-forest transition-colors block"
                          >
                            {doc.title}
                          </NavLink>
                          <span className="text-[11px] text-slate-400">
                            {doc.clientCompany || doc.clientName || 'Acme Internal'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize text-slate-600">{doc.category}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {doc.referenceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={doc.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/app/editor?id=${doc.id}`)}
                          className="h-8 w-8 text-slate-500 hover:text-forest"
                          title="Edit Document"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(doc)}
                          className="h-8 w-8 text-slate-500 hover:text-ink"
                          title="Duplicate Document"
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleQuickDownload(doc)}
                          leftIcon={<Download className="w-3.5 h-3.5 text-forest" />}
                          className="h-8 px-2.5 text-xs text-forest"
                        >
                          Download PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommended Templates Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-ink">Popular Document Templates</h2>
            <p className="text-xs text-slate-500">Start from a professionally composed document structure</p>
          </div>
          <NavLink
            to="/app/templates"
            className="text-xs font-semibold text-forest hover:text-forest-700 flex items-center gap-1 transition-colors"
          >
            Explore all {templates.length} templates <ChevronRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.slice(0, 4).map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => navigate(`/app/editor?template=${tpl.id}`)}
              className="bg-white rounded-card border border-paper-border p-4 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest font-display bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                    {tpl.category}
                  </span>
                  {tpl.badge && (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {tpl.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-sm text-ink group-hover:text-forest transition-colors">
                  {tpl.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-paper-border flex items-center justify-between text-xs text-forest font-semibold">
                <span>Use template</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
