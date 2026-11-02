import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Palette, 
  FileCode, 
  Terminal, 
  Download, 
  Eye, 
  ShieldCheck,
  ChevronRight,
  Printer,
  FileCheck,
  Zap
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LivePDFCanvas } from '../../components/document/LivePDFCanvas';
import { getStoredBrandKit, getStoredTemplates, INITIAL_DOCUMENTS } from '../../utils/storage';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const brandKit = getStoredBrandKit();
  const templates = getStoredTemplates();

  // Selected preview doc in hero
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(0);
  const heroDocuments = INITIAL_DOCUMENTS;
  const currentHeroDoc = heroDocuments[selectedHeroIndex] || heroDocuments[0];

  return (
    <div className="space-y-24 pb-20 relative overflow-hidden">
      {/* Ambient background glow & grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-forest-200/30 via-mint-subtle/40 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-dot-grid opacity-50 pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50/80 backdrop-blur-md border border-forest-200/80 text-forest text-xs font-semibold shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-forest" />
              </span>
              <span>CuratePDF 2.0 • Real Vector PDF Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-ink leading-[1.08]">
              Professional PDFs,{' '}
              <span className="bg-gradient-to-r from-forest via-emerald-700 to-mint-dark bg-clip-text text-transparent">
                engineered for precision.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Transform structured data into publication-ready documents. Apply your enterprise brand kit, preview every millimeter in real-time, and download crisp vector PDFs instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/app/editor')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="justify-center shadow-lg hover:shadow-xl"
              >
                Create your first PDF
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/templates')}
                leftIcon={<FileCode className="w-4 h-4 text-forest" />}
                className="justify-center bg-white/60 backdrop-blur-sm"
              >
                Explore 8 templates
              </Button>
            </div>

            <div className="pt-6 border-t border-paper-border flex flex-wrap items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest" />
                <span>Instant Vector Rendering (2× DPI)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest" />
                <span>Centralized Brand Tokens</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest" />
                <span>Bulk CSV Batch Generator</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Real-Time Document Showcase in Studio Desk */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Interactive Document Switcher Pill Bar */}
            <div className="w-full mb-3 flex items-center justify-between bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-paper-border shadow-2xs overflow-x-auto">
              {heroDocuments.slice(0, 4).map((doc, idx) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedHeroIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedHeroIndex === idx
                      ? 'bg-forest text-white shadow-2xs'
                      : 'text-slate-600 hover:text-ink hover:bg-slate-100'
                  }`}
                >
                  {doc.category === 'business' ? 'Executive Proposal' : doc.category === 'finance' ? 'Commercial Invoice' : doc.category === 'reports' ? 'Quarterly Report' : 'Executive Dossier'}
                </button>
              ))}
            </div>

            {/* Document Preview Frame: Cool Studio Workbench */}
            <div className="w-full bg-[#0E151A] rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[580px] sm:min-h-[660px]">
              {/* Top spotlight glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/15 blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-dot-grid-dark opacity-40 pointer-events-none" />

              {/* Floating top bar on workbench */}
              <div className="w-full flex items-center justify-between mb-4 text-slate-400 text-xs px-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[11px] text-slate-300">Live Canvas Rendering</span>
                </div>
                <button
                  onClick={() => navigate(`/app/editor?id=${currentHeroDoc.id}`)}
                  className="text-mint hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Edit in Studio</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Document Sheet */}
              <div className="relative z-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] rounded-sm overflow-hidden transition-all duration-300">
                <LivePDFCanvas
                  document={currentHeroDoc}
                  brandKit={brandKit}
                  zoom={0.56}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Product Demonstration */}
      <section className="bg-white py-20 border-y border-paper-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-forest font-display">
              Intuitive Progression
            </span>
            <h2 className="text-3xl font-display font-bold text-ink">
              From structured input to finished document in seconds
            </h2>
            <p className="text-sm text-slate-500">
              CuratePDF standardizes document creation across your entire team with a simple, repeatable 5-step workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-paper-subtle p-5 rounded-card border border-paper-border space-y-3 relative">
              <span className="text-xs font-bold font-mono text-forest bg-forest-100 px-2 py-0.5 rounded">01</span>
              <h3 className="font-display font-bold text-sm text-ink">Choose a template</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Start from a proven business proposal, invoice, executive brief, or certificate layout.
              </p>
            </div>

            <div className="bg-paper-subtle p-5 rounded-card border border-paper-border space-y-3 relative">
              <span className="text-xs font-bold font-mono text-forest bg-forest-100 px-2 py-0.5 rounded">02</span>
              <h3 className="font-display font-bold text-sm text-ink">Add structured data</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter recipient details, deliverables, itemized rates, dates, and calculated totals easily.
              </p>
            </div>

            <div className="bg-paper-subtle p-5 rounded-card border border-paper-border space-y-3 relative">
              <span className="text-xs font-bold font-mono text-forest bg-forest-100 px-2 py-0.5 rounded">03</span>
              <h3 className="font-display font-bold text-sm text-ink">Customize design</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apply your Brand Kit colors, logo monogram, font presets, and header/footer configurations.
              </p>
            </div>

            <div className="bg-paper-subtle p-5 rounded-card border border-paper-border space-y-3 relative">
              <span className="text-xs font-bold font-mono text-forest bg-forest-100 px-2 py-0.5 rounded">04</span>
              <h3 className="font-display font-bold text-sm text-ink">Preview live PDF</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inspect an exact pixel-crisp A4 or Letter page simulation with zoom controls and page breaks.
              </p>
            </div>

            <div className="bg-paper-subtle p-5 rounded-card border border-paper-border space-y-3 relative">
              <span className="text-xs font-bold font-mono text-forest bg-forest-100 px-2 py-0.5 rounded">05</span>
              <h3 className="font-display font-bold text-sm text-ink">Generate & export</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download high-resolution PDFs instantly or trigger native print stylesheets for distribution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix: Manual Layouts vs CuratePDF */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-forest font-display">
            The Better Way
          </span>
          <h2 className="text-3xl font-display font-bold text-ink">
            Stop wrestling with Word margins and broken table wraps
          </h2>
          <p className="text-sm text-slate-500">
            Compare manual document drafting with CuratePDF’s structured automation engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Manual Approach */}
          <div className="bg-white p-7 rounded-2xl border border-red-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 text-red-600 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Traditional Document Creation</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span><strong>40+ minutes per document:</strong> Constant re-adjusting of table borders, spacing, and page splits.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span><strong>Broken math formulas:</strong> Manual recalculation of subtotals, tax brackets, and line item discounts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span><strong>Brand inconsistency:</strong> Team members using wrong hex colors, mismatched fonts, and outdated logos.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span><strong>No programmatic path:</strong> Impossible to hook into backend databases or trigger via API endpoints.</span>
              </li>
            </ul>
          </div>

          {/* CuratePDF Method */}
          <div className="bg-forest-50/60 p-7 rounded-2xl border-2 border-forest/30 shadow-card space-y-5">
            <div className="flex items-center gap-2.5 text-forest font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-forest" />
              <span>The CuratePDF Standard</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="text-forest font-bold shrink-0">✓</span>
                <span><strong>Under 60 seconds:</strong> Clean structured form input instantly generates publication-ready output.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-forest font-bold shrink-0">✓</span>
                <span><strong>Real-time dynamic arithmetic:</strong> Live calculations for subtotals, tax rates, and currencies.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-forest font-bold shrink-0">✓</span>
                <span><strong>Centralized Brand Tokens:</strong> Workspace palette and corporate typography apply automatically.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-forest font-bold shrink-0">✓</span>
                <span><strong>Developer REST API & Bulk ZIP:</strong> Generate 1 or 1,000 PDFs programmatically via secure endpoints.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Broad Use Cases Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-forest font-display">
            Versatile Applications
          </span>
          <h2 className="text-3xl font-display font-bold text-ink">
            Engineered for every professional document need
          </h2>
          <p className="text-sm text-slate-500">
            From agency client proposals to finance statements and certificates, CuratePDF eliminates repetitive manual document assembly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-3 hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-forest-50 text-forest flex items-center justify-center font-bold">
              BP
            </div>
            <h3 className="font-display font-bold text-base text-ink">Business Proposals & Statements of Work</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Present executive client pitches, milestone delivery schedules, and scope boundaries with clear structured sections.
            </p>
          </div>

          <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-3 hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              IN
            </div>
            <h3 className="font-display font-bold text-base text-ink">Invoices & Financial Statements</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automatic line-item calculations, tax handling, payment terms, and remittance banking details with zero math errors.
            </p>
          </div>

          <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-3 hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-800 flex items-center justify-center font-bold">
              RP
            </div>
            <h3 className="font-display font-bold text-base text-ink">Executive Operations & KPI Reports</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consolidate monthly velocity, quarterly objectives, and resource management statistics into clean readable tables.
            </p>
          </div>

          <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-3 hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              CT
            </div>
            <h3 className="font-display font-bold text-base text-ink">Certificates & Awards</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Award formal certificates of achievement, training completions, and compliance licenses with verification marks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-3 hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-forest-50 text-forest flex items-center justify-center font-bold">
              CP
            </div>
            <h3 className="font-display font-bold text-base text-ink">Candidate Profiles & Portfolios</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Recruitment agencies and talent partners can assemble structured executive dossiers and track records quickly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-3 hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              SA
            </div>
            <h3 className="font-display font-bold text-base text-ink">Agreements & Operational Charters</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standardize master services agreements, non-disclosure contracts, and operational handbooks with formal clauses.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="bg-forest-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-mint font-display">
              Enterprise Craft
            </span>
            <h2 className="text-3xl font-display font-bold text-white">
              Built for speed, fidelity, and reliability
            </h2>
            <p className="text-sm text-slate-300">
              Everything you need to automate and elevate your organization's document output.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-card bg-forest-900/50 border border-forest-800 space-y-3">
              <Palette className="w-6 h-6 text-mint" />
              <h3 className="font-display font-bold text-base text-white">Unified Brand Kit</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Define your primary colors, accent tokens, typography hierarchy, and corporate footer once. All templates inherit and maintain compliance.
              </p>
            </div>

            <div className="p-6 rounded-card bg-forest-900/50 border border-forest-800 space-y-3">
              <Eye className="w-6 h-6 text-mint" />
              <h3 className="font-display font-bold text-base text-white">Real-Time Responsive Canvas</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                No guessing how your export will look. Every field update immediately re-renders the live A4 preview with accurate typography and margins.
              </p>
            </div>

            <div className="p-6 rounded-card bg-forest-900/50 border border-forest-800 space-y-3">
              <Layers className="w-6 h-6 text-mint" />
              <h3 className="font-display font-bold text-base text-white">Bulk Dataset Processing</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Upload CSV or JSON records to generate hundreds of invoices or certificates in a single batch with real progress tracking.
              </p>
            </div>

            <div className="p-6 rounded-card bg-forest-900/50 border border-forest-800 space-y-3">
              <Terminal className="w-6 h-6 text-mint" />
              <h3 className="font-display font-bold text-base text-white">Developer REST API</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trigger programmatic document rendering via secure API tokens. Integrate effortlessly with Node.js, Python, or curl pipelines.
              </p>
            </div>

            <div className="p-6 rounded-card bg-forest-900/50 border border-forest-800 space-y-3">
              <Download className="w-6 h-6 text-mint" />
              <h3 className="font-display font-bold text-base text-white">Client-Side Vector Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generates high-DPI PDFs right in your browser with zero latency, zero cloud leaks, and immediate file downloads.
              </p>
            </div>

            <div className="p-6 rounded-card bg-forest-900/50 border border-forest-800 space-y-3">
              <ShieldCheck className="w-6 h-6 text-mint" />
              <h3 className="font-display font-bold text-base text-white">Confidential & Private</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your financial numbers, client names, and contracts stay on your device or secure endpoints without third-party tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action Callout */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 text-center">
        <div className="bg-white rounded-2xl p-10 sm:p-14 border border-paper-border shadow-doc-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-sage" />
            <span>Ready for your team</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-ink">
            Start creating consistent, professional PDFs today.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Eliminate document formatting headaches. Jump into our live editor and produce your first publication-ready PDF in under two minutes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/app/editor')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Launch Document Editor
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/templates')}
            >
              Browse Template Gallery
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
