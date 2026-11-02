import React, { useState } from 'react';
import { 
  Palette, 
  Save, 
  Upload, 
  Eye, 
  Check, 
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { BrandKitConfig, DocumentData } from '../../types';
import { getStoredBrandKit, saveStoredBrandKit } from '../../utils/storage';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { LivePDFCanvas } from '../../components/document/LivePDFCanvas';

export const BrandKit: React.FC<{ onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void }> = ({ onShowToast }) => {
  const [brandKit, setBrandKit] = useState<BrandKitConfig>(() => getStoredBrandKit());
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dynamic fetch from server API
  React.useEffect(() => {
    fetch('/api/v1/brand-kit')
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setBrandKit(json.data);
          saveStoredBrandKit(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Sample document to visualize real-time brand application
  const sampleDoc: DocumentData = {
    id: 'sample-brand-doc',
    title: 'Enterprise Architecture Proposal',
    referenceNumber: 'PROP-2026-PREVIEW',
    templateId: 'tpl-proposal-modern',
    category: 'business',
    status: 'ready',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    clientName: 'Sarah Jenkins',
    clientCompany: 'Global Logistics Corp',
    clientEmail: 's.jenkins@globallogistics.example.com',
    summary: 'Demonstration of how your brand tokens dynamically format headers, table headers, monograms, and footer details across generated PDFs.',
    sections: [
      {
        id: 's-1',
        title: 'Brand Consistency Verification',
        content: 'Notice how the primary color anchors the top accent line and table header, while the secondary accent highlights bullets and sub-marks cleanly.'
      }
    ],
    lineItems: [
      { id: '1', description: 'Enterprise Brand Kit Integration', quantity: 1, rate: 3500 },
      { id: '2', description: 'Centralized Template Provisioning', quantity: 2, rate: 1200 },
    ],
    subtotal: 5900,
    total: 5900,
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 'standard',
  };

  const handleSave = () => {
    setIsSaving(true);
    saveStoredBrandKit(brandKit);
    setTimeout(() => {
      setIsSaving(false);
      if (onShowToast) {
        onShowToast('Brand Kit Updated', 'Your brand tokens have been saved across your workspace.', 'success');
      }
    }, 400);
  };

  const presetPalettes = [
    { name: 'Curate Forest (Default)', primary: '#0F3D2E', accent: '#3A7D5F' },
    { name: 'Executive Obsidian', primary: '#111827', accent: '#4B5563' },
    { name: 'Modern Marine', primary: '#0C4A6E', accent: '#0284C7' },
    { name: 'Burgundy Editorial', primary: '#4C0519', accent: '#9F1239' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Brand Kit</h1>
          <p className="text-xs text-slate-500">
            Define your organization’s identity tokens applied to all generated documents
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          loading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Brand Kit
        </Button>
      </div>

      {/* Grid: Settings Left, Live Document Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Settings Panel */}
        <div className="lg:col-span-6 space-y-6">
          {/* Identity Section */}
          <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
              Organization Identity
            </h3>

            <Input
              label="Company or Personal Display Name"
              value={brandKit.companyName}
              onChange={(e) => setBrandKit({ ...brandKit, companyName: e.target.value })}
              placeholder="e.g. Acme Advisory Group"
            />

            <Input
              label="Tagline / Practice Subtitle"
              value={brandKit.tagline}
              onChange={(e) => setBrandKit({ ...brandKit, tagline: e.target.value })}
              placeholder="e.g. Strategic Management & Technology Consulting"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Primary Contact Email"
                value={brandKit.email}
                onChange={(e) => setBrandKit({ ...brandKit, email: e.target.value })}
              />
              <Input
                label="Direct Phone Number"
                value={brandKit.phone}
                onChange={(e) => setBrandKit({ ...brandKit, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Website URL"
                value={brandKit.website}
                onChange={(e) => setBrandKit({ ...brandKit, website: e.target.value })}
              />
              <Input
                label="Tax ID / VAT Registration #"
                value={brandKit.taxId || ''}
                onChange={(e) => setBrandKit({ ...brandKit, taxId: e.target.value })}
                placeholder="e.g. US-EIN-94821038"
              />
            </div>

            <Textarea
              label="Physical Address / Remittance Headquarters"
              rows={2}
              value={brandKit.address}
              onChange={(e) => setBrandKit({ ...brandKit, address: e.target.value })}
            />

            <Input
              label="Default Payment Terms / Bank Wire"
              value={brandKit.paymentDetails || ''}
              onChange={(e) => setBrandKit({ ...brandKit, paymentDetails: e.target.value })}
              placeholder="e.g. Net 30. Wire: First Republic Bank, Routing #121000358"
            />
          </div>

          {/* Logo Upload Section */}
          <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                  Corporate Logo
                </h3>
                <p className="text-xs text-slate-500">Vector SVG or transparent PNG rendered in document headers</p>
              </div>
              {brandKit.logoUrl && (
                <button
                  type="button"
                  onClick={() => setBrandKit({ ...brandKit, logoUrl: '' })}
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
                  <p className="text-[11px] text-slate-500">Rendered across all generated PDFs and previews</p>
                </div>
              </div>
            ) : (
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
            )}
          </div>

          {/* Color Palettes Section */}
          <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                Brand Palette Tokens
              </h3>
              <span className="text-[11px] text-slate-400">HEX colors</span>
            </div>

            {/* Quick Palettes */}
            <div className="flex flex-wrap gap-2 pb-2">
              {presetPalettes.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setBrandKit({ ...brandKit, primaryColor: preset.primary, accentColor: preset.accent })}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-paper-subtle hover:bg-slate-200/70 text-slate-700 transition-colors"
                >
                  <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: preset.primary }} />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-paper-border">
              <div>
                <label className="text-xs font-semibold text-ink block mb-1.5">Primary Brand Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandKit.primaryColor}
                    onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded border border-paper-border cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={brandKit.primaryColor}
                    onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })}
                    className="w-full text-xs font-mono font-medium px-2 py-1.5 border border-paper-border rounded"
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
                    onChange={(e) => setBrandKit({ ...brandKit, accentColor: e.target.value })}
                    className="w-10 h-10 rounded border border-paper-border cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={brandKit.accentColor}
                    onChange={(e) => setBrandKit({ ...brandKit, accentColor: e.target.value })}
                    className="w-full text-xs font-mono font-medium px-2 py-1.5 border border-paper-border rounded"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Section bullets, badges, sub-totals</p>
              </div>
            </div>
          </div>

          {/* Typography and Footer Section */}
          <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
              Typography & Header Preferences
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Heading Typography"
                value={brandKit.fontHeading}
                onChange={(e) => setBrandKit({ ...brandKit, fontHeading: e.target.value as any })}
                options={[
                  { value: 'Sora', label: 'Sora (Geometric Modern)' },
                  { value: 'Inter', label: 'Inter (Technical Clean)' },
                  { value: 'Serif', label: 'Editorial Serif' },
                ]}
              />
              <Select
                label="Body Typography"
                value={brandKit.fontBody}
                onChange={(e) => setBrandKit({ ...brandKit, fontBody: e.target.value as any })}
                options={[
                  { value: 'Inter', label: 'Inter (High Readability)' },
                  { value: 'System', label: 'System Sans-Serif' },
                ]}
              />
            </div>

            <Input
              label="Standard Document Footer Disclaimer"
              value={brandKit.footerText}
              onChange={(e) => setBrandKit({ ...brandKit, footerText: e.target.value })}
            />

            <div className="space-y-2 pt-2 border-t border-paper-border">
              <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={brandKit.showLogoInHeader}
                  onChange={(e) => setBrandKit({ ...brandKit, showLogoInHeader: e.target.checked })}
                  className="rounded border-paper-border text-forest focus:ring-forest"
                />
                <span>Include company monogram badge in document header</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={brandKit.showPageNumbers}
                  onChange={(e) => setBrandKit({ ...brandKit, showPageNumbers: e.target.checked })}
                  className="rounded border-paper-border text-forest focus:ring-forest"
                />
                <span>Show automatic pagination in footer</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Live Applied Preview */}
        <div className="lg:col-span-6 space-y-3 sticky top-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-forest" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                Real-Time Document Preview
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Live preview of your brand tokens</span>
          </div>

          <div className="bg-paper-subtle/70 p-3 sm:p-6 rounded-card border border-paper-border overflow-hidden flex justify-center">
            <LivePDFCanvas
              document={sampleDoc}
              brandKit={brandKit}
              zoom={isMobile ? 0.40 : 0.65}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
