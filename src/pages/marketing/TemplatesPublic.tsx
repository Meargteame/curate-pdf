import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { getStoredTemplates, getStoredBrandKit } from '../../utils/storage';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { LivePDFCanvas } from '../../components/document/LivePDFCanvas';
import { TemplateDefinition } from '../../types';

export const TemplatesPublic: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'all';

  const templates = getStoredTemplates();
  const brandKit = getStoredBrandKit();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'business', label: 'Business & Proposals' },
    { id: 'finance', label: 'Finance & Invoices' },
    { id: 'reports', label: 'Reports & Operations' },
    { id: 'certificates', label: 'Certificates & Awards' },
    { id: 'recruitment', label: 'Recruitment Dossiers' },
    { id: 'marketing', label: 'Marketing Briefs' },
  ];

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory = activeCategory === 'all' || tpl.category === activeCategory;
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-12 relative overflow-hidden">
      {/* Ambient background glow & grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-forest-200/25 via-mint-subtle/30 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-forest font-display bg-forest-50 border border-forest-200 px-3 py-1 rounded-full shadow-2xs">
          Document Template Library
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-ink tracking-tight">
          Curated Reusable Document Templates
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Select any template to inspect its composition or launch directly into the live studio editor with your branding applied.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-card border border-paper-border shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search templates by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-2xl border border-paper-border overflow-hidden shadow-card hover:shadow-[0_16px_36px_-6px_rgba(15,61,46,0.16)] hover:-translate-y-1 hover:border-forest/40 transition-all duration-300 flex flex-col justify-between group"
          >
            {/* Visual Mini Mockup */}
            <div 
              className="h-48 bg-gradient-to-b from-slate-50 to-slate-100/80 p-5 relative flex items-center justify-center border-b border-paper-border cursor-pointer overflow-hidden"
              onClick={() => setPreviewTemplate(tpl)}
            >
              <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />

              <div className="w-48 h-38 bg-white rounded-sm shadow-[0_8px_20px_-3px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] p-3.5 flex flex-col justify-between transform group-hover:scale-105 transition-transform duration-300">
                <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: tpl.previewAccent }} />
                <div className="space-y-1.5 my-auto">
                  <div className="h-2 w-3/4 bg-slate-800 rounded-xs" />
                  <div className="h-1.5 w-1/2 bg-slate-300 rounded-xs" />
                  <div className="pt-2 space-y-1">
                    <div className="h-1 w-full bg-slate-200 rounded-xs" />
                    <div className="h-1 w-5/6 bg-slate-200 rounded-xs" />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-1 w-10 bg-slate-300 rounded-xs" />
                  <div className="h-1.5 w-6 rounded-xs" style={{ backgroundColor: tpl.previewAccent }} />
                </div>
              </div>

              <div className="absolute inset-0 bg-forest-950/25 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white text-forest text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                  <Eye className="w-3.5 h-3.5 text-sage" /> Full Preview
                </span>
              </div>
            </div>

            {/* Template Info */}
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

      {/* Large Preview Modal */}
      <Dialog
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate?.name || 'Template Preview'}
        description={`Category: ${previewTemplate?.category}`}
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
                Launch with this template
              </Button>
            )}
          </>
        }
      >
        {previewTemplate && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              {previewTemplate.description}
            </p>
            <div className="bg-paper-subtle p-2 sm:p-6 rounded-lg border border-paper-border flex justify-center overflow-auto max-h-[65vh]">
              <LivePDFCanvas
                document={{
                  id: 'preview-public-modal',
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
