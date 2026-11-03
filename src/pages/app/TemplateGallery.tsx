import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Eye, 
  FileCode, 
  Layers, 
  CheckCircle,
  FileCheck,
  Copy,
  Layout,
  Maximize2
} from 'lucide-react';
import { TemplateDefinition, DocumentCategory, DocumentData } from '../../types';
import { getStoredTemplates, getStoredBrandKit, upsertDocument } from '../../utils/storage';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { LivePDFCanvas } from '../../components/document/LivePDFCanvas';

export const TemplateGallery: React.FC<{ onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void }> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const templates = getStoredTemplates();
  const brandKit = getStoredBrandKit();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);
  const [previewZoom, setPreviewZoom] = useState<number>(0.70);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Templates' },
    { id: 'business', label: 'Business' },
    { id: 'finance', label: 'Finance' },
    { id: 'reports', label: 'Reports' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'operations', label: 'Operations' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'recruitment', label: 'Recruitment' },
  ];

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return templates.length;
    return templates.filter(t => t.category === catId).length;
  };

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory = activeCategory === 'all' || tpl.category === activeCategory;
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateFromTemplate = async (tpl: TemplateDefinition) => {
    const newDoc: DocumentData = {
      id: `doc-${Date.now().toString(36)}`,
      title: tpl.defaultData.title || tpl.name,
      referenceNumber: `${tpl.category.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(Math.random() * 800 + 100)}`,
      templateId: tpl.id,
      category: tpl.category,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      dueDate: tpl.defaultData.dueDate,
      clientName: tpl.defaultData.clientName,
      clientCompany: tpl.defaultData.clientCompany,
      clientEmail: tpl.defaultData.clientEmail,
      summary: tpl.defaultData.summary,
      sections: tpl.defaultData.sections,
      lineItems: tpl.defaultData.lineItems,
      subtotal: tpl.defaultData.subtotal,
      total: tpl.defaultData.total,
      paymentTerms: tpl.defaultData.paymentTerms,
      recipientName: tpl.defaultData.recipientName,
      awardTitle: tpl.defaultData.awardTitle,
      candidateRole: tpl.defaultData.candidateRole,
      candidateSkills: tpl.defaultData.candidateSkills,
      pageSize: tpl.defaultData.pageSize || 'A4',
      orientation: tpl.defaultData.orientation || 'portrait',
      margin: tpl.defaultData.margin || 'standard',
    };

    try {
      await fetch('/api/v1/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      });
    } catch {}

    upsertDocument(newDoc);
    if (onShowToast) {
      onShowToast('Document Created', `Started new document from "${tpl.name}"`, 'success');
    }
    navigate(`/app/editor?id=${newDoc.id}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-paper-border shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center text-forest">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-ink">Template Gallery</h1>
              <p className="text-xs text-slate-500">
                Choose from pre-engineered, publication-grade document layouts calibrated for vector rendering
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-card border border-paper-border shadow-card">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search templates by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-forest text-white shadow-2xs'
                    : 'bg-paper-subtle text-slate-600 hover:text-ink hover:bg-slate-200/60'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeCategory === cat.id ? 'bg-forest-900/50 text-white' : 'bg-slate-200/60 text-slate-500'
                }`}>
                  {getCategoryCount(cat.id)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-2xl border border-paper-border overflow-hidden shadow-card hover:shadow-[0_16px_36px_-6px_rgba(15,61,46,0.16)] hover:-translate-y-1 hover:border-forest/40 transition-all duration-300 flex flex-col justify-between group"
          >
            {/* Template Top Mini Preview Frame */}
            <div 
              className="h-48 bg-gradient-to-b from-slate-50 to-slate-100/80 p-5 relative flex items-center justify-center border-b border-paper-border cursor-pointer overflow-hidden"
              onClick={() => setPreviewTemplate(tpl)}
            >
              <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />

              {/* Scaled paper mockup visual */}
              <div 
                className={`bg-white rounded-sm shadow-[0_8px_20px_-3px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] p-3.5 flex flex-col justify-between transform group-hover:scale-105 transition-transform duration-300 relative ${
                  tpl.defaultData.orientation === 'landscape' ? 'w-56 h-36' : 'w-44 h-38'
                }`}
              >
                {/* Top strip */}
                <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: tpl.previewAccent }} />
                
                <div className="space-y-1.5 my-auto">
                  <div className="h-2 w-3/4 bg-slate-800 rounded-xs" />
                  <div className="h-1.5 w-1/2 bg-slate-300 rounded-xs" />
                  <div className="pt-2 space-y-1">
                    <div className="h-1 w-full bg-slate-200 rounded-xs" />
                    <div className="h-1 w-5/6 bg-slate-200 rounded-xs" />
                    <div className="h-1 w-4/6 bg-slate-200 rounded-xs" />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-1 w-10 bg-slate-300 rounded-xs" />
                  <div className="h-1.5 w-6 rounded-xs" style={{ backgroundColor: tpl.previewAccent }} />
                </div>
              </div>

              {/* Hover inspect pill */}
              <div className="absolute inset-0 bg-forest-950/25 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white text-forest text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                  <Eye className="w-3.5 h-3.5 text-sage" /> Quick Inspect
                </span>
              </div>
            </div>

            {/* Template Info Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest font-display bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                    {tpl.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500 bg-paper-subtle px-1.5 py-0.5 rounded border border-paper-border">
                      {tpl.defaultData.orientation === 'landscape' ? 'A4 Landscape' : 'A4 Portrait'}
                    </span>
                    {tpl.badge && (
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {tpl.badge}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="font-display font-bold text-base text-ink group-hover:text-forest transition-colors">
                  {tpl.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                  {tpl.description}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-paper-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(tpl)}
                  className="text-xs text-slate-500 hover:text-ink font-medium"
                >
                  Inspect details
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCreateFromTemplate(tpl)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="text-xs font-semibold"
                >
                  Use Template
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Large Template Preview Modal */}
      <Dialog
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate?.name || 'Template Preview'}
        description={`Category: ${previewTemplate?.category} • ${previewTemplate?.defaultData.orientation === 'landscape' ? 'A4 Landscape' : 'A4 Portrait'}`}
        maxWidth="4xl"
        footer={
          <>
            <div className="flex items-center gap-2 mr-auto">
              <span className="text-xs text-slate-500 font-medium">Zoom:</span>
              <button
                type="button"
                onClick={() => setPreviewZoom(0.55)}
                className={`px-2 py-0.5 rounded text-xs ${previewZoom === 0.55 ? 'bg-forest text-white font-semibold' : 'bg-slate-100 text-slate-600'}`}
              >
                55%
              </button>
              <button
                type="button"
                onClick={() => setPreviewZoom(0.70)}
                className={`px-2 py-0.5 rounded text-xs ${previewZoom === 0.70 ? 'bg-forest text-white font-semibold' : 'bg-slate-100 text-slate-600'}`}
              >
                70%
              </button>
              <button
                type="button"
                onClick={() => setPreviewZoom(0.85)}
                className={`px-2 py-0.5 rounded text-xs ${previewZoom === 0.85 ? 'bg-forest text-white font-semibold' : 'bg-slate-100 text-slate-600'}`}
              >
                85%
              </button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            {previewTemplate && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const tpl = previewTemplate;
                  setPreviewTemplate(null);
                  handleCreateFromTemplate(tpl);
                }}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Create from Template
              </Button>
            )}
          </>
        }
      >
        {previewTemplate && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              {previewTemplate.description}
            </p>

            {/* Embedded Live Preview Canvas of this template */}
            <div className="bg-paper-subtle p-2 sm:p-5 rounded-lg border border-paper-border flex justify-center overflow-auto max-h-[65vh] shadow-inner">
              <LivePDFCanvas
                document={{
                  id: 'preview-modal-doc',
                  title: previewTemplate.defaultData.title || previewTemplate.name,
                  referenceNumber: previewTemplate.defaultData.referenceNumber || 'PREVIEW-001',
                  templateId: previewTemplate.id,
                  category: previewTemplate.category,
                  status: 'ready',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  date: new Date().toISOString().split('T')[0],
                  dueDate: previewTemplate.defaultData.dueDate,
                  clientName: previewTemplate.defaultData.clientName,
                  clientCompany: previewTemplate.defaultData.clientCompany,
                  clientEmail: previewTemplate.defaultData.clientEmail,
                  summary: previewTemplate.defaultData.summary,
                  sections: previewTemplate.defaultData.sections,
                  lineItems: previewTemplate.defaultData.lineItems,
                  subtotal: previewTemplate.defaultData.subtotal,
                  total: previewTemplate.defaultData.total,
                  paymentTerms: previewTemplate.defaultData.paymentTerms,
                  recipientName: previewTemplate.defaultData.recipientName,
                  awardTitle: previewTemplate.defaultData.awardTitle,
                  candidateRole: previewTemplate.defaultData.candidateRole,
                  candidateSkills: previewTemplate.defaultData.candidateSkills,
                  pageSize: previewTemplate.defaultData.pageSize || 'A4',
                  orientation: previewTemplate.defaultData.orientation || 'portrait',
                  margin: previewTemplate.defaultData.margin || 'standard',
                }}
                brandKit={brandKit}
                zoom={isMobile ? 0.38 : previewZoom}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
