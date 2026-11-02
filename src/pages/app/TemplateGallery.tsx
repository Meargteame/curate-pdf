import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Eye, 
  FileCode, 
  Layers, 
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { TemplateDefinition, DocumentCategory } from '../../types';
import { getStoredTemplates, getStoredBrandKit } from '../../utils/storage';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { LivePDFCanvas } from '../../components/document/LivePDFCanvas';

export const TemplateGallery: React.FC = () => {
  const navigate = useNavigate();
  const templates = getStoredTemplates();
  const brandKit = getStoredBrandKit();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);

  React.useEffect(() => {
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

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory = activeCategory === 'all' || tpl.category === activeCategory;
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Template Gallery</h1>
          <p className="text-xs text-slate-500">
            Choose from reusable, pre-composed document layouts engineered for consistency
          </p>
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
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-forest text-white shadow-2xs'
                    : 'bg-paper-subtle text-slate-600 hover:text-ink hover:bg-slate-200/60'
                }`}
              >
                {cat.label}
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
                className="w-48 h-38 bg-white rounded-sm shadow-[0_8px_20px_-3px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] p-3.5 flex flex-col justify-between transform group-hover:scale-105 transition-transform duration-300 relative"
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
                  {tpl.badge && (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {tpl.badge}
                    </span>
                  )}
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
                  onClick={() => setPreviewTemplate(tpl)}
                  className="text-xs text-slate-500 hover:text-ink font-medium"
                >
                  Inspect details
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/app/editor?template=${tpl.id}`)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="text-xs font-semibold"
                >
                  Use template
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
        description={`Category: ${previewTemplate?.category} • Standard layout`}
        maxWidth="4xl"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            {previewTemplate && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const id = previewTemplate.id;
                  setPreviewTemplate(null);
                  navigate(`/app/editor?template=${id}`);
                }}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Use this template
              </Button>
            )}
          </>
        }
      >
        {previewTemplate && (
          <div className="space-y-6">
            <p className="text-xs text-slate-600 leading-relaxed">
              {previewTemplate.description}
            </p>

            {/* Embedded Live Preview Canvas of this template */}
            <div className="bg-paper-subtle p-2 sm:p-6 rounded-lg border border-paper-border flex justify-center overflow-auto max-h-[65vh]">
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
                zoom={isMobile ? 0.40 : 0.70}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
