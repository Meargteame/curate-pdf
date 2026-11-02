import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  Plus, 
  FileCode, 
  Download, 
  Edit3, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Palette,
  FileCheck,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { 
  getStoredDocuments, 
  saveStoredDocuments,
  getStoredTemplates, 
  getStoredBrandKit,
  getStoredUserProfile,
  upsertDocument
} from '../../utils/storage';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Badge';
import { Badge } from '../../components/ui/Badge';
import { generateAndDownloadPdf } from '../../utils/pdfGenerator';
import { DocumentData } from '../../types';

export const Overview: React.FC<{ onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void }> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentData[]>(() => getStoredDocuments());
  const templates = getStoredTemplates();
  const brandKit = getStoredBrandKit();
  const userProfile = getStoredUserProfile();

  // Dynamic live fetch from server database
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

  const handleQuickDownload = async (doc: DocumentData) => {
    // Open in editor or download
    navigate(`/app/editor?id=${doc.id}`);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#07241A] via-forest-900 to-[#0F3D2E] text-white border border-forest-800/80 rounded-2xl p-6 sm:p-8 shadow-doc-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative brand motif & ambient glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-mint/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-dot-grid-dark opacity-20 pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/70 border border-forest-600/60 text-mint text-xs font-semibold shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-mint" />
            </span>
            <span>{brandKit.companyName || userProfile.company} • {userProfile.planStatus || 'Pro Workspace'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white">
            Welcome back, {userProfile.name.split(' ')[0] || 'there'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            High-precision document automation engine. Build, preview in real time, and batch-render print-ready vector PDFs.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Button
            variant="glass"
            size="md"
            onClick={() => navigate('/app/templates')}
            leftIcon={<FileCode className="w-4 h-4 text-forest-300" />}
            className="text-white border-white/20 hover:bg-white/10"
          >
            Browse templates
          </Button>
          <Button
            variant="mint"
            size="md"
            onClick={() => navigate('/app/editor')}
            leftIcon={<Plus className="w-4 h-4 text-forest-950" />}
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

      {/* Onboarding Checklist for Users */}
      <div className="bg-paper-subtle/80 border border-paper-border rounded-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
            Quick Start Workflow
          </h3>
          <span className="text-xs text-slate-500 font-medium">4 easy steps</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div 
            onClick={() => navigate('/app/templates')}
            className="p-3 bg-white rounded-lg border border-paper-border hover:border-forest/40 hover:shadow-2xs transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between text-forest font-bold font-display">
              <span>1. Choose Template</span>
              <CheckCircle2 className="w-4 h-4 text-sage" />
            </div>
            <p className="text-slate-500 text-[11px]">Select from business, invoice, report, or certificate layouts.</p>
          </div>

          <div 
            onClick={() => navigate('/app/brand-kit')}
            className="p-3 bg-white rounded-lg border border-paper-border hover:border-forest/40 hover:shadow-2xs transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between text-forest font-bold font-display">
              <span>2. Set Up Brand Kit</span>
              <CheckCircle2 className="w-4 h-4 text-sage" />
            </div>
            <p className="text-slate-500 text-[11px]">Apply your logo, brand colors, typography, and contact info.</p>
          </div>

          <div 
            onClick={() => navigate('/app/editor')}
            className="p-3 bg-white rounded-lg border border-paper-border hover:border-forest/40 hover:shadow-2xs transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between text-forest font-bold font-display">
              <span>3. Live PDF Preview</span>
              <CheckCircle2 className="w-4 h-4 text-sage" />
            </div>
            <p className="text-slate-500 text-[11px]">Edit structured fields and inspect real-time A4 page layout.</p>
          </div>

          <div 
            onClick={() => navigate('/app/editor')}
            className="p-3 bg-white rounded-lg border border-paper-border hover:border-forest/40 hover:shadow-2xs transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between text-forest font-bold font-display">
              <span>4. Download PDF</span>
              <CheckCircle2 className="w-4 h-4 text-sage" />
            </div>
            <p className="text-slate-500 text-[11px]">Client-side crisp PDF generation with zero watermark.</p>
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
                          className="h-8 px-2.5 text-xs text-forest"
                        >
                          Open & Download
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
