import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Eye, 
  Award, 
  Receipt, 
  FileText, 
  BarChart3, 
  UserCheck, 
  Briefcase,
  FileCode,
  Layers,
  ChevronRight
} from 'lucide-react';
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
  const [previewZoom, setPreviewZoom] = useState<number>(0.70);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'business', label: 'Proposals' },
    { id: 'finance', label: 'Invoices' },
    { id: 'reports', label: 'Reports' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'recruitment', label: 'Recruitment' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'operations', label: 'Operations' },
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

  // Distinct Archetype Visual Thumbnail Mockup Renderer
  const renderTemplateVisualMockup = (tpl: TemplateDefinition) => {
    const accent = tpl.previewAccent || '#0F3D2E';
    const isLandscape = tpl.defaultData.orientation === 'landscape';

    if (tpl.category === 'certificates') {
      return (
        <div className="w-56 h-36 bg-white rounded-sm shadow-md p-3 border-2 border-dashed border-amber-600/40 flex flex-col justify-between items-center text-center transform group-hover:scale-105 transition-transform duration-300 relative">
          <div className="h-1 w-20 rounded-full bg-amber-700/60" />
          <div className="space-y-1">
            <div className="h-2 w-32 bg-slate-800 rounded-xs mx-auto" />
            <div className="h-1.5 w-24 bg-amber-700/80 rounded-xs mx-auto" />
            <div className="h-1 w-40 bg-slate-300 rounded-xs mx-auto pt-0.5" />
          </div>
          <div className="flex items-center justify-between w-full px-2 pt-1 border-t border-slate-100">
            <div className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            </div>
            <div className="h-1 w-14 bg-slate-300 rounded-xs" />
          </div>
        </div>
      );
    }

    if (tpl.category === 'finance') {
      return (
        <div className="w-44 h-38 bg-white rounded-sm shadow-md p-3 flex flex-col justify-between transform group-hover:scale-105 transition-transform duration-300 relative">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div className="h-2 w-16 bg-slate-800 rounded-xs" />
            <span className="text-[8px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1 rounded">INV</span>
          </div>
          <div className="space-y-1.5 py-1">
            <div className="h-2.5 w-full bg-slate-900 rounded-xs" style={{ backgroundColor: accent }} />
            <div className="flex items-center justify-between gap-1">
              <div className="h-1 w-20 bg-slate-200 rounded-xs" />
              <div className="h-1 w-8 bg-slate-300 rounded-xs" />
            </div>
            <div className="flex items-center justify-between gap-1">
              <div className="h-1 w-24 bg-slate-200 rounded-xs" />
              <div className="h-1 w-8 bg-slate-300 rounded-xs" />
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <div className="h-1 w-10 bg-slate-300 rounded-xs" />
            <div className="h-2 w-12 bg-emerald-700 rounded-xs" />
          </div>
        </div>
      );
    }

    if (tpl.category === 'reports') {
      return (
        <div className="w-44 h-38 bg-white rounded-sm shadow-md p-3 flex flex-col justify-between transform group-hover:scale-105 transition-transform duration-300 relative">
          <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: accent }} />
          <div className="space-y-1">
            <div className="h-2 w-28 bg-slate-800 rounded-xs" />
            <div className="grid grid-cols-2 gap-1 pt-1">
              <div className="p-1 rounded bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="h-1 w-6 bg-slate-300 rounded-xs" />
                <div className="h-1.5 w-10 bg-slate-700 rounded-xs" />
              </div>
              <div className="p-1 rounded bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="h-1 w-6 bg-slate-300 rounded-xs" />
                <div className="h-1.5 w-10 bg-emerald-700 rounded-xs" />
              </div>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-6 pt-1">
            <div className="flex-1 bg-slate-200 h-2 rounded-xs" />
            <div className="flex-1 bg-slate-300 h-3 rounded-xs" />
            <div className="flex-1 bg-slate-400 h-4 rounded-xs" />
            <div className="flex-1 h-5 rounded-xs" style={{ backgroundColor: accent }} />
          </div>
        </div>
      );
    }

    if (tpl.category === 'recruitment') {
      return (
        <div className="w-44 h-38 bg-white rounded-sm shadow-md p-3 flex flex-col justify-between transform group-hover:scale-105 transition-transform duration-300 relative">
          <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
            <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[9px]">
              JD
            </div>
            <div className="space-y-0.5">
              <div className="h-1.5 w-16 bg-slate-800 rounded-xs" />
              <div className="h-1 w-12 bg-purple-600 rounded-xs" />
            </div>
          </div>
          <div className="space-y-1 py-1">
            <div className="flex gap-1">
              <span className="h-1.5 w-8 rounded-full bg-slate-100 border border-slate-200" />
              <span className="h-1.5 w-10 rounded-full bg-slate-100 border border-slate-200" />
              <span className="h-1.5 w-7 rounded-full bg-slate-100 border border-slate-200" />
            </div>
            <div className="h-1 w-full bg-slate-200 rounded-xs" />
            <div className="h-1 w-4/5 bg-slate-200 rounded-xs" />
          </div>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <div className="h-1 w-12 bg-slate-300 rounded-xs" />
            <div className="h-1.5 w-8 rounded-xs" style={{ backgroundColor: accent }} />
          </div>
        </div>
      );
    }

    // Default: Business Proposal / SOW / Brief
    return (
      <div className="w-44 h-38 bg-white rounded-sm shadow-md p-3.5 flex flex-col justify-between transform group-hover:scale-105 transition-transform duration-300 relative">
        <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: accent }} />
        <div className="space-y-1.5 my-auto">
          <div className="h-2 w-3/4 bg-slate-800 rounded-xs" />
          <div className="h-1.5 w-1/2 bg-slate-400 rounded-xs" />
          <div className="pt-1 space-y-1">
            <div className="h-1 w-full bg-slate-200 rounded-xs" />
            <div className="h-1 w-5/6 bg-slate-200 rounded-xs" />
            <div className="h-1 w-4/6 bg-slate-200 rounded-xs" />
          </div>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="h-1 w-10 bg-slate-300 rounded-xs" />
          <div className="h-1.5 w-6 rounded-xs" style={{ backgroundColor: accent }} />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-10 relative overflow-hidden">
      {/* Ambient background glow & grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-forest-200/25 via-mint-subtle/30 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest text-xs font-semibold shadow-2xs">
          <FileCode className="w-3.5 h-3.5" />
          <span>Curated Document Template System</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-ink tracking-tight">
          Publication-Ready Document Templates
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Inspect production-grade layouts engineered for client proposals, billing statements, executive reports, and certifications.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-paper-border shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search templates by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Clean, Non-Truncating Segmented Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-forest text-white shadow-xs'
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

      {/* Grid with Distinct Archetype Mockups */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-2xl border border-paper-border overflow-hidden shadow-card hover:shadow-[0_16px_36px_-6px_rgba(15,61,46,0.16)] hover:-translate-y-1 hover:border-forest/40 transition-all duration-300 flex flex-col justify-between group"
          >
            {/* Template Top Visual Frame */}
            <div 
              className="h-48 bg-gradient-to-b from-slate-50 to-slate-100/80 p-5 relative flex items-center justify-center border-b border-paper-border cursor-pointer overflow-hidden"
              onClick={() => setPreviewTemplate(tpl)}
            >
              <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />

              {/* Archetype Specific Preview Rendering */}
              {renderTemplateVisualMockup(tpl)}

              {/* Hover inspect pill */}
              <div className="absolute inset-0 bg-forest-950/25 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white text-forest text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                  <Eye className="w-3.5 h-3.5 text-sage" /> Full Preview
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
                  onClick={() => navigate(`/app/editor?template=${tpl.id}`)}
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
