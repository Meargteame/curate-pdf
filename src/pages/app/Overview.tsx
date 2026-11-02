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
      <div className="bg-white border border-paper-border rounded-card p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative brand motif */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-forest-50/70 rounded-full pointer-events-none -z-0" />

        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-forest text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-sage" />
            <span>CuratePDF Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Welcome back to CuratePDF
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted max-w-xl">
            Create, customize, preview, and generate professional documents from reusable templates and your own brand kit.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/app/templates')}
            leftIcon={<FileCode className="w-4 h-4 text-forest" />}
          >
            Browse templates
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/app/editor')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create document
          </Button>
        </div>
      </div>

      {/* Metrics / Workspace Activity summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-card border border-paper-border shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">Total Documents</span>
            <FileCheck className="w-4 h-4 text-forest" />
          </div>
          <p className="text-2xl font-display font-bold text-ink">{documents.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Across all workspace folders</p>
        </div>

        <div className="bg-white p-4.5 rounded-card border border-paper-border shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">Generated PDFs</span>
            <Download className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-display font-bold text-ink">{generatedCount}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Ready for distribution</p>
        </div>

        <div className="bg-white p-4.5 rounded-card border border-paper-border shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">Available Templates</span>
            <FileCode className="w-4 h-4 text-sage" />
          </div>
          <p className="text-2xl font-display font-bold text-ink">{templates.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">8 categories configured</p>
        </div>

        <div className="bg-white p-4.5 rounded-card border border-paper-border shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">Brand Kit</span>
            <Palette className="w-4 h-4 text-mint-dark" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-5 h-5 rounded border" style={{ backgroundColor: brandKit.primaryColor }} />
            <span className="text-sm font-semibold text-ink font-display">{brandKit.companyName}</span>
          </div>
          <NavLink to="/app/brand-kit" className="text-[11px] text-forest font-medium hover:underline block mt-1">
            Customize Brand →
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
