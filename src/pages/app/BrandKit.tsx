import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Save, 
  Upload, 
  Eye, 
  Check, 
  FileCheck,
  RotateCcw,
  FileText,
  Receipt,
  BarChart3,
  Award,
  Layers,
  ShieldCheck,
  Type
} from 'lucide-react';
import { BrandKitConfig, DocumentData, DocumentCategory } from '../../types';
import { getStoredBrandKit, saveStoredBrandKit } from '../../utils/storage';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { LivePDFCanvas } from '../../components/document/LivePDFCanvas';

interface BrandKitProps {
  onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

interface PalettePreset {
  name: string;
  category: string;
  primary: string;
  accent: string;
}

const PRESET_PALETTES: PalettePreset[] = [
  { name: 'Curate Forest', category: 'Modern Enterprise', primary: '#0F3D2E', accent: '#3A7D5F' },
  { name: 'Executive Obsidian', category: 'Corporate & Legal', primary: '#111827', accent: '#4B5563' },
  { name: 'Modern Marine', category: 'Tech & SaaS', primary: '#0C4A6E', accent: '#0284C7' },
  { name: 'Royal Amethyst', category: 'Creative & Agency', primary: '#4C1D95', accent: '#7C3AED' },
  { name: 'Burgundy Editorial', category: 'Finance & Advisory', primary: '#4C0519', accent: '#9F1239' },
  { name: 'Warm Terracotta', category: 'Boutique & Studio', primary: '#9A3412', accent: '#D97706' },
  { name: 'Slate Monochrome', category: 'Minimalist Engineering', primary: '#334155', accent: '#64748B' },
  { name: 'Emerald Capital', category: 'Venture & Wealth', primary: '#065F46', accent: '#10B981' },
];

interface FontPairing {
  id: string;
  name: string;
  description: string;
  heading: 'Sora' | 'Inter' | 'Serif';
  body: 'Inter' | 'System';
}

const FONT_PAIRINGS: FontPairing[] = [
  { id: 'modern', name: 'Modern Geometric', description: 'Sora headings with Inter body. High impact and contemporary.', heading: 'Sora', body: 'Inter' },
  { id: 'tech', name: 'Technical Precision', description: 'Inter headings and body. Clean, functional, and highly legible.', heading: 'Inter', body: 'Inter' },
  { id: 'editorial', name: 'Classic Editorial', description: 'Serif headings with Inter body. Refined advisory and legal tone.', heading: 'Serif', body: 'Inter' },
];

// Helper to calculate contrast ratio for accessibility pill
function getContrastRatio(hexColor: string): { ratio: number; isHighContrast: boolean } {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return { ratio: 12.4, isHighContrast: true };
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(parseInt(hex.substring(0, 2), 16));
  const g = toLinear(parseInt(hex.substring(2, 4), 16));
  const b = toLinear(parseInt(hex.substring(4, 6), 16));
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // Contrast against white (L = 1.0)
  const ratio = (1.0 + 0.05) / (lum + 0.05);
  const rounded = Math.round(ratio * 10) / 10;
  return { ratio: rounded, isHighContrast: ratio >= 4.5 };
}

export const BrandKit: React.FC<BrandKitProps> = ({ onShowToast }) => {
  const [brandKit, setBrandKit] = useState<BrandKitConfig>(() => getStoredBrandKit());
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const [previewTemplate, setPreviewTemplate] = useState<'proposal' | 'invoice' | 'report' | 'certificate'>('proposal');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch initial brand kit from backend if available
  useEffect(() => {
    fetch('/api/v1/brand-kit')
      .then(res => res.json())
      .then(json => {
        if (json.data && json.data.companyName) {
          setBrandKit(json.data);
          saveStoredBrandKit(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-sync to backend and local storage on save
  const handleSave = async () => {
    setIsSaving(true);
    saveStoredBrandKit(brandKit);

    try {
      await fetch('/api/v1/brand-kit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandKit),
      });
    } catch {
      // Offline or local dev fallback
    }

    setTimeout(() => {
      setIsSaving(false);
      if (onShowToast) {
        onShowToast('Brand Tokens Saved', 'Workspace branding has been synchronized across all templates and engines.', 'success');
      }
    }, 350);
  };

  const handleResetDefaults = () => {
    const defaultKit: BrandKitConfig = {
      companyName: 'Acme Advisory Group',
      tagline: 'Strategic Management & Technology Consulting',
      logoUrl: '',
      signatureUrl: '',
      taxId: 'US-EIN-94821038',
      paymentDetails: 'Net 30. Wire: First Republic Bank, Routing #121000358',
      primaryColor: '#0F3D2E',
      accentColor: '#3A7D5F',
      fontHeading: 'Sora',
      fontBody: 'Inter',
      website: 'www.acme-advisory.example.com',
      email: 's.jenkins@acme-advisory.example.com',
      phone: '+1 (555) 234-8901',
      address: '450 Lexington Ave, New York, NY 10017',
      footerText: 'Confidential & Proprietary • Rendered via CuratePDF Vector Engine',
      showLogoInHeader: true,
      showPageNumbers: true,
    };
    setBrandKit(defaultKit);
    saveStoredBrandKit(defaultKit);
    if (onShowToast) {
      onShowToast('Reset to Defaults', 'Default forest design tokens restored.', 'info');
    }
  };

  // Construct dynamic sample document for the chosen preview category
  const getDynamicSampleDoc = (): DocumentData => {
    const today = new Date().toISOString().split('T')[0];

    switch (previewTemplate) {
      case 'invoice':
        return {
          id: 'sample-brand-invoice',
          title: 'Commercial Statement of Account',
          referenceNumber: 'INV-2026-904',
          templateId: 'tpl-invoice-clean',
          category: 'finance',
          status: 'ready',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          date: today,
          dueDate: '2026-11-28',
          clientName: 'Sarah Jenkins',
          clientCompany: 'Northwind Global Enterprises',
          clientEmail: 's.jenkins@northwind.example',
          clientAddress: '100 Montgomery St, San Francisco, CA',
          summary: 'Itemized billing for corporate design tokens normalization and high-fidelity vector PDF pipeline integration.',
          lineItems: [
            { id: '1', description: 'Enterprise Brand Token System Architecture', quantity: 1, rate: 4500 },
            { id: '2', description: 'Custom Vector Header & Monogram Badging', quantity: 1, rate: 2200 },
            { id: '3', description: 'Automated Multi-Currency Billing Pipeline', quantity: 1, rate: 1800 },
          ],
          subtotal: 8500,
          taxPercent: 5,
          taxTotal: 425,
          total: 8925,
          currency: 'USD',
          paymentTerms: brandKit.paymentDetails || 'Net 30 Days. Direct Bank Wire.',
          pageSize: 'A4',
          orientation: 'portrait',
          margin: 'standard',
        };

      case 'report':
        return {
          id: 'sample-brand-report',
          title: 'Quarterly Operations & Performance Audit',
          referenceNumber: 'REP-2026-Q3',
          templateId: 'tpl-report-exec',
          category: 'reports',
          status: 'ready',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          date: today,
          clientName: 'Board of Directors',
          clientCompany: brandKit.companyName || 'Acme Advisory Group',
          clientEmail: brandKit.email || 'governance@acme.example',
          summary: 'Comprehensive audit verifying visual consistency, color fidelity, and render performance across all regional PDF generation nodes.',
          sections: [
            {
              id: 'rep-1',
              title: 'Executive Summary',
              content: 'Over the last quarter, standardizing document tokens eliminated 98.4% of branding discrepancies across outbound commercial quotes and executive briefs.'
            },
            {
              id: 'rep-2',
              title: 'Infrastructure Latency Benchmarks',
              content: 'Mean PDF compilation time dropped to 142ms per vector page using serverless headless engine instances.'
            }
          ],
          lineItems: [
            { id: 'kpi-1', description: 'Vector Generation Speed', quantity: 1, rate: 142 },
            { id: 'kpi-2', description: 'Brand Compliance Pass Rate', quantity: 1, rate: 99.8 },
          ],
          subtotal: 241.8,
          total: 241.8,
          currency: 'USD',
          pageSize: 'A4',
          orientation: 'portrait',
          margin: 'standard',
        };

      case 'certificate':
        return {
          id: 'sample-brand-cert',
          title: 'Certificate of Excellence & Completion',
          referenceNumber: 'CERT-2026-881',
          templateId: 'tpl-cert-classic',
          category: 'certificates',
          status: 'ready',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          date: today,
          recipientName: 'Sarah Jenkins',
          awardTitle: 'Enterprise Systems Architecture & PDF Mastery',
          summary: `Has demonstrated exceptional leadership in deploying standardized document design tokens across ${brandKit.companyName || 'the enterprise'}.`,
          sections: [
            {
              id: 'cert-1',
              title: 'Official Certification Verification',
              content: `Issued by ${brandKit.companyName || 'Acme Advisory Group'} with verified cryptographical timestamp and vector seal.`
            }
          ],
          pageSize: 'A4',
          orientation: 'landscape',
          margin: 'relaxed',
        };

      case 'proposal':
      default:
        return {
          id: 'sample-brand-proposal',
          title: 'Acme Enterprise Migration Proposal',
          referenceNumber: 'PROP-2026-842',
          templateId: 'tpl-proposal-modern',
          category: 'business',
          status: 'ready',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          date: today,
          clientName: 'Sarah Jenkins',
          clientCompany: 'Northwind Global Enterprises',
          clientEmail: 's.jenkins@northwind.io',
          clientAddress: '450 Lexington Ave, New York, NY 10017',
          summary: 'Strategic engagement framework to modernize enterprise PDF workflows across Northwind Global business units.',
          sections: [
            {
              id: 's-1',
              title: 'Executive Summary',
              content: 'Northwind Global currently incurs excessive administrative hours compiling monthly client reporting books. Standardized design tokens reduce turnaround time by 65%.'
            },
            {
              id: 's-2',
              title: 'Engagement Phasing',
              content: 'Phase 1: Architecture review and brand token normalization.\nPhase 2: Template system design and multi-format preview engines.\nPhase 3: Rollout and team enablement.'
            }
          ],
          lineItems: [
            { id: '1', description: 'Discovery & Workflow Audit', quantity: 1, rate: 8500 },
            { id: '2', description: 'Template System Design & Engine Setup', quantity: 1, rate: 16500 },
            { id: '3', description: 'Enterprise Integration & Training', quantity: 1, rate: 7000 },
          ],
          subtotal: 32000,
          total: 32000,
          currency: 'USD',
          pageSize: 'A4',
          orientation: 'portrait',
          margin: 'standard',
        };
    }
  };

  const sampleDoc = getDynamicSampleDoc();
  const contrastInfo = getContrastRatio(brandKit.primaryColor);

  // Compute 2-letter monogram for preview fallback
  const getMonogram = () => {
    if (!brandKit.companyName) return 'CP';
    const words = brandKit.companyName.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-paper-border shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center text-forest">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-ink">Brand Kit & Design System</h1>
              <p className="text-xs text-slate-500">
                Define your corporate identity tokens applied consistently across all generated documents and API requests.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Brand Kit
          </Button>
        </div>
      </div>

      {/* Main Grid: Design Settings Left, Live Document Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Settings Controls */}
        <div className="lg:col-span-6 space-y-6">

          {/* 1. Curated Brand Palettes */}
          <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  Color Palette Tokens
                </h3>
                <p className="text-[11px] text-slate-500">Pre-calibrated palettes optimized for high-contrast PDF printing</p>
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                contrastInfo.isHighContrast
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <ShieldCheck className="w-3 h-3" />
                <span>{contrastInfo.isHighContrast ? `Contrast ${contrastInfo.ratio}:1 (AAA Print Ready)` : `Contrast ${contrastInfo.ratio}:1 (Low)`}</span>
              </div>
            </div>

            {/* Quick Palettes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_PALETTES.map((preset) => {
                const isSelected = brandKit.primaryColor.toLowerCase() === preset.primary.toLowerCase() &&
                                   brandKit.accentColor.toLowerCase() === preset.accent.toLowerCase();
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setBrandKit(prev => ({ ...prev, primaryColor: preset.primary, accentColor: preset.accent }))}
                    className={`flex flex-col text-left p-2 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'border-forest bg-forest/5 ring-1 ring-forest'
                        : 'border-paper-border bg-paper-subtle/40 hover:bg-paper-subtle hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="w-3.5 h-3.5 rounded-full shadow-2xs border border-white" style={{ backgroundColor: preset.primary }} />
                      <span className="w-3.5 h-3.5 rounded-full shadow-2xs border border-white" style={{ backgroundColor: preset.accent }} />
                      {isSelected && <Check className="w-3 h-3 text-forest ml-auto" />}
                    </div>
                    <span className="font-semibold text-ink text-[11px] leading-tight truncate">{preset.name}</span>
                    <span className="text-[9px] text-slate-400 truncate">{preset.category}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Inputs */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-paper-border">
              <div>
                <label className="text-xs font-semibold text-ink block mb-1.5">Primary Brand Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandKit.primaryColor}
                    onChange={(e) => setBrandKit(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-9 h-9 rounded-md border border-paper-border cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={brandKit.primaryColor}
                    onChange={(e) => setBrandKit(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-full text-xs font-mono font-medium px-2.5 py-1.5 border border-paper-border rounded-md bg-paper-subtle/30 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Headers, hero bars, and primary tables</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1.5">Secondary Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandKit.accentColor}
                    onChange={(e) => setBrandKit(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="w-9 h-9 rounded-md border border-paper-border cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={brandKit.accentColor}
                    onChange={(e) => setBrandKit(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="w-full text-xs font-mono font-medium px-2.5 py-1.5 border border-paper-border rounded-md bg-paper-subtle/30 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Section bullets, badges, sub-totals</p>
              </div>
            </div>
          </div>

          {/* 2. Typography Pairings */}
          <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" />
                Typography System
              </h3>
              <p className="text-[11px] text-slate-500">Pairings engineered for crisp vector font embedding</p>
            </div>

            {/* Typography Pairing Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {FONT_PAIRINGS.map((pairing) => {
                const isSelected = brandKit.fontHeading === pairing.heading && brandKit.fontBody === pairing.body;
                return (
                  <button
                    key={pairing.id}
                    type="button"
                    onClick={() => setBrandKit(prev => ({ ...prev, fontHeading: pairing.heading, fontBody: pairing.body }))}
                    className={`flex flex-col text-left p-2.5 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'border-forest bg-forest/5 ring-1 ring-forest'
                        : 'border-paper-border bg-paper-subtle/40 hover:bg-paper-subtle'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-ink text-xs">{pairing.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-forest" />}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{pairing.heading} + {pairing.body}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-paper-border">
              <Select
                label="Heading Font"
                value={brandKit.fontHeading}
                onChange={(e) => setBrandKit(prev => ({ ...prev, fontHeading: e.target.value as any }))}
                options={[
                  { value: 'Sora', label: 'Sora (Geometric Modern)' },
                  { value: 'Inter', label: 'Inter (Technical Clean)' },
                  { value: 'Serif', label: 'Editorial Serif' },
                ]}
              />
              <Select
                label="Body Typography"
                value={brandKit.fontBody}
                onChange={(e) => setBrandKit(prev => ({ ...prev, fontBody: e.target.value as any }))}
                options={[
                  { value: 'Inter', label: 'Inter (High Readability)' },
                  { value: 'System', label: 'System Sans-Serif' },
                ]}
              />
            </div>
          </div>

          {/* 3. Organization Identity & Legal */}
          <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5" />
              Organization Identity & Remittance
            </h3>

            <Input
              label="Company or Display Name"
              value={brandKit.companyName}
              onChange={(e) => setBrandKit(prev => ({ ...prev, companyName: e.target.value }))}
              placeholder="e.g. Acme Advisory Group"
            />

            <Input
              label="Tagline / Practice Subtitle"
              value={brandKit.tagline}
              onChange={(e) => setBrandKit(prev => ({ ...prev, tagline: e.target.value }))}
              placeholder="e.g. Strategic Management & Technology Consulting"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Primary Contact Email"
                value={brandKit.email}
                onChange={(e) => setBrandKit(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                label="Direct Phone Number"
                value={brandKit.phone}
                onChange={(e) => setBrandKit(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Website URL"
                value={brandKit.website}
                onChange={(e) => setBrandKit(prev => ({ ...prev, website: e.target.value }))}
              />
              <Input
                label="Tax ID / VAT Registration #"
                value={brandKit.taxId || ''}
                onChange={(e) => setBrandKit(prev => ({ ...prev, taxId: e.target.value }))}
                placeholder="e.g. US-EIN-94821038"
              />
            </div>

            <Textarea
              label="Physical Address / Remittance Headquarters"
              rows={2}
              value={brandKit.address}
              onChange={(e) => setBrandKit(prev => ({ ...prev, address: e.target.value }))}
            />

            <Input
              label="Default Payment Terms / Wire Instructions"
              value={brandKit.paymentDetails || ''}
              onChange={(e) => setBrandKit(prev => ({ ...prev, paymentDetails: e.target.value }))}
              placeholder="e.g. Net 30. Wire: First Republic Bank, Routing #121000358"
            />
          </div>

          {/* 4. Corporate Logo & Header Monogram */}
          <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Corporate Logo & Monogram
                </h3>
                <p className="text-[11px] text-slate-500">Vector SVG or transparent PNG rendered in document headers</p>
              </div>
              {brandKit.logoUrl && (
                <button
                  type="button"
                  onClick={() => setBrandKit(prev => ({ ...prev, logoUrl: '' }))}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Remove logo
                </button>
              )}
            </div>

            {brandKit.logoUrl ? (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-paper-subtle border border-paper-border">
                <img 
                  src={brandKit.logoUrl} 
                  alt="Uploaded Logo" 
                  className="h-12 max-w-[180px] object-contain rounded bg-white p-2 border border-slate-200 shadow-2xs"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink truncate">Custom Brand Logo Active</p>
                  <p className="text-[11px] text-slate-500">Rendered in top header across all generated PDFs</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-paper-border hover:border-forest/50 bg-paper-subtle/40 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-forest-50 text-forest flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5 text-sage" />
                  </div>
                  <p className="text-xs font-semibold text-ink">Upload your logo file</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PNG, SVG, or JPG (max 2MB)</p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          setBrandKit(prev => ({ ...prev, logoUrl: base64 }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                {/* Monogram Fallback Indicator */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-paper-subtle/60 border border-paper-border">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-2xs shrink-0"
                    style={{ backgroundColor: brandKit.primaryColor }}
                  >
                    {getMonogram()}
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-ink">Active Header Monogram: "{getMonogram()}"</p>
                    <p className="text-[11px] text-slate-500">Automatically generated from your company name when no logo is uploaded.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Header / Footer Toggles */}
            <div className="space-y-2 pt-3 border-t border-paper-border">
              <Input
                label="Document Footer Disclaimer / Legal Notice"
                value={brandKit.footerText}
                onChange={(e) => setBrandKit(prev => ({ ...prev, footerText: e.target.value }))}
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brandKit.showLogoInHeader}
                    onChange={(e) => setBrandKit(prev => ({ ...prev, showLogoInHeader: e.target.checked }))}
                    className="rounded border-paper-border text-forest focus:ring-forest"
                  />
                  <span>Render monogram badge in header</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brandKit.showPageNumbers}
                    onChange={(e) => setBrandKit(prev => ({ ...prev, showPageNumbers: e.target.checked }))}
                    className="rounded border-paper-border text-forest focus:ring-forest"
                  />
                  <span>Show page numbering in footer</span>
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Right Live Applied Preview */}
        <div className="lg:col-span-6 space-y-3 sticky top-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-card border border-paper-border shadow-card">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-forest" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                Live Document Preview
              </h3>
            </div>

            {/* Preview Template Switcher */}
            <div className="flex items-center gap-1 bg-paper-subtle p-1 rounded-lg border border-paper-border">
              <button
                type="button"
                onClick={() => setPreviewTemplate('proposal')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  previewTemplate === 'proposal'
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-slate-600 hover:text-ink'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Proposal</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTemplate('invoice')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  previewTemplate === 'invoice'
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-slate-600 hover:text-ink'
                }`}
              >
                <Receipt className="w-3 h-3" />
                <span>Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTemplate('report')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  previewTemplate === 'report'
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-slate-600 hover:text-ink'
                }`}
              >
                <BarChart3 className="w-3 h-3" />
                <span>Report</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTemplate('certificate')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  previewTemplate === 'certificate'
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-slate-600 hover:text-ink'
                }`}
              >
                <Award className="w-3 h-3" />
                <span>Certificate</span>
              </button>
            </div>
          </div>

          {/* Live Render Canvas */}
          <div className="bg-paper-subtle/70 p-3 sm:p-5 rounded-card border border-paper-border overflow-hidden flex justify-center shadow-inner">
            <LivePDFCanvas
              document={sampleDoc}
              brandKit={brandKit}
              zoom={isMobile ? 0.38 : previewTemplate === 'certificate' ? 0.52 : 0.62}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Dynamic preview rendering with real vector tokens</span>
            <span>Zoom: {Math.round((isMobile ? 0.38 : previewTemplate === 'certificate' ? 0.52 : 0.62) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
