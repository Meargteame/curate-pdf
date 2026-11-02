import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  ArrowRight, 
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
  Zap,
  Copy,
  Check
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
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const heroDocuments = INITIAL_DOCUMENTS;
  const currentHeroDoc = heroDocuments[selectedHeroIndex] || heroDocuments[0];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activeApiTab, setActiveApiTab] = useState<'curl' | 'node' | 'python'>('curl');
  const [isCopied, setIsCopied] = useState(false);

  const apiSnippets = {
    curl: `curl -X POST https://curatepdf.site/api/v1/jobs/bulk \\
  -H "Authorization: Bearer cur_live_948a2..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "templateId": "tpl-invoice-minimal",
    "records": [
      {
        "client": "Acme Global Tech",
        "reference": "INV-2026-001",
        "amount": "$4,250.00",
        "date": "2026-11-02"
      }
    ]
  }' \\
  --output invoice_batch.zip`,

    node: `import { CuratePDF } from '@curatepdf/sdk';

const curate = new CuratePDF({ apiKey: process.env.CURATEPDF_API_KEY });

const pdfStream = await curate.documents.generate({
  templateId: 'tpl-proposal-modern',
  data: {
    clientCompany: 'Northwind Global',
    total: 32000,
    currency: 'USD',
    sections: [{ title: 'Executive Scope', content: 'Milestones and delivery plan.' }]
  },
  format: 'A4',
  dpi: 192
});`,

    python: `from curatepdf import CuratePDF

client = CuratePDF(api_key="cur_live_948a2...")

document = client.documents.create(
    template_id="tpl-invoice-minimal",
    data={
        "client": "Stripe Global Services",
        "reference": "INV-2026-8801",
        "subtotal": 12500,
        "tax_rate": 8.5
    },
    page_size="A4",
    export_format="pdf"
)

document.save("invoice.pdf")`
  };

  return (
    <div className="space-y-24 pb-20 relative overflow-hidden">
      {/* Ambient background glow & grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-forest-100/40 blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-dot-grid opacity-50 pointer-events-none -z-10" />

      {/* Hero Section: Centered, Expansive & Architectural */}
      <section className="pt-8 sm:pt-16 px-4 sm:px-8 max-w-7xl mx-auto text-center">
        {/* Subtle, restrained Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-50/90 border border-forest-200/60 text-forest text-xs font-semibold shadow-2xs mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-forest" />
          <span>Vector PDF Infrastructure & Enterprise Brand Engine</span>
        </div>

        {/* Commanding Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-ink max-w-4xl mx-auto leading-[1.08] mb-6">
          Professional PDFs,{' '}
          <span className="text-forest">engineered for precision.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Transform structured business data into publication-ready proposals, invoices, and executive reports. Centralized brand tokens, real-time vector canvas, and headless developer APIs.
        </p>

        {/* Primary and Secondary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/app/editor')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="h-12 px-7 text-sm sm:text-base font-bold shadow-md hover:shadow-xl w-full sm:w-auto justify-center"
          >
            Create your first PDF
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/templates')}
            leftIcon={<FileCode className="w-4 h-4 text-forest" />}
            className="h-12 px-7 text-sm sm:text-base font-semibold w-full sm:w-auto justify-center border-paper-border hover:bg-slate-50"
          >
            Explore 8 templates
          </Button>
        </div>

        {/* Value Proposition Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-slate-500 mb-12">
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
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest" />
            <span>Sub-100ms REST API</span>
          </div>
        </div>

        {/* Interactive Studio Workspace Window */}
        <div className="max-w-5xl mx-auto w-full relative">
          <div className="bg-white rounded-2xl border border-paper-border shadow-card hover:shadow-card-hover transition-all overflow-hidden text-left">
            {/* Window Chrome Toolbar */}
            <div className="bg-slate-50/95 border-b border-paper-border px-4 py-3 flex items-center justify-between gap-4">
              {/* Window Controls + File Label */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/40" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/40" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/40" />
                </div>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <span className="font-mono text-xs font-semibold text-slate-700 truncate max-w-[140px] sm:max-w-none">
                  {currentHeroDoc.title || 'Executive_Proposal.pdf'}
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200/60 text-slate-600 font-medium">
                  A4 • 300 DPI
                </span>
              </div>

              {/* Integrated Document Template Switcher */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-paper-border shadow-2xs overflow-x-auto">
                {heroDocuments.slice(0, 4).map((doc, idx) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedHeroIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedHeroIndex === idx
                        ? 'bg-forest text-white shadow-2xs'
                        : 'text-slate-600 hover:text-ink hover:bg-slate-50'
                    }`}
                  >
                    {doc.category === 'business'
                      ? 'Proposal'
                      : doc.category === 'finance'
                      ? 'Invoice'
                      : doc.category === 'reports'
                      ? 'Report'
                      : 'Dossier'}
                  </button>
                ))}
              </div>

              {/* Direct Studio Launch CTA */}
              <button
                onClick={() => navigate(`/app/editor?id=${currentHeroDoc.id}`)}
                className="hidden sm:inline-flex px-3.5 py-1.5 bg-forest text-white hover:bg-forest-800 text-xs font-bold rounded-lg transition-colors items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
              >
                <span>Edit in Studio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Studio Canvas Workbench */}
            <div className="relative bg-[#F8FAF9] py-8 sm:py-12 px-4 flex justify-center items-center overflow-hidden min-h-[500px] sm:min-h-[620px]">
              {/* Subtle background dot grid */}
              <div className="absolute inset-0 bg-dot-grid opacity-35 pointer-events-none" />

              {/* Floating Feature Card: Brand Kit Synchronization */}
              <div className="hidden lg:flex absolute left-8 top-12 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-paper-border shadow-card items-center gap-3 pointer-events-none z-20">
                <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center text-white shadow-2xs">
                  <Palette className="w-4 h-4" />
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-ink">Brand Kit Synced</div>
                  <div className="text-slate-500 font-mono text-[10px]">{brandKit.companyName || 'Acme'} • #0F3D2E</div>
                </div>
              </div>

              {/* Floating Feature Card: Millimetric Fidelity */}
              <div className="hidden lg:flex absolute right-8 bottom-14 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-paper-border shadow-card items-center gap-3 pointer-events-none z-20">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-ink">Vector Precision</div>
                  <div className="text-slate-500 text-[10px]">Zero page-split glitches</div>
                </div>
              </div>

              {/* The Crisp Live Document Sheet */}
              <div className="relative z-10 shadow-[0_20px_50px_-15px_rgba(15,61,46,0.18),0_6px_16px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)] rounded-sm overflow-hidden bg-white transition-all duration-300">
                <LivePDFCanvas
                  document={currentHeroDoc}
                  brandKit={brandKit}
                  zoom={isMobile ? 0.38 : 0.60}
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

      {/* Developer API & Headless Engine Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-forest font-display">
            Developer & Headless Engine
          </span>
          <h2 className="text-3xl font-display font-bold text-ink">
            Render publication-grade PDFs directly from your stack
          </h2>
          <p className="text-sm text-slate-500">
            Trigger on-demand document generation or bulk archives via standard REST endpoints with sub-100ms vector execution.
          </p>
        </div>

        <div className="bg-[#0B0F12] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Code Snippet */}
          <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
            <div>
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    {(['curl', 'node', 'python'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveApiTab(tab)}
                        className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
                          activeApiTab === tab
                            ? 'bg-slate-800 text-white shadow-2xs font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab === 'curl' ? 'cURL' : tab === 'node' ? 'Node.js' : 'Python'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(apiSnippets[activeApiTab]);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Copy Code"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Code Area */}
              <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-2 leading-relaxed selection:bg-forest selection:text-white">
                <code>{apiSnippets[activeApiTab]}</code>
              </pre>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Endpoint Active
              </span>
              <span>200 OK • 76ms latency</span>
            </div>
          </div>

          {/* Right: Response Payload & Specs */}
          <div className="lg:col-span-5 p-6 bg-[#0E151A]/60 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 text-xs">
                <span className="font-mono text-slate-400">Response Payload (JSON)</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  HTTP 200 OK
                </span>
              </div>
              <pre className="font-mono text-[11px] text-emerald-300/90 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 overflow-x-auto leading-relaxed">
{`{
  "status": "success",
  "documentId": "doc-9482-a",
  "renderEngine": "VectorPrint 2.0",
  "renderTimeMs": 76,
  "pages": 1,
  "pageSize": "ISO-A4",
  "dpi": 192,
  "checksum": "sha256:d8a2...3f1",
  "downloadUrl": "/api/v1/documents/doc-9482-a/pdf"
}`}
              </pre>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Batch Throughput</span>
                <span className="font-mono text-white font-semibold">1,000 PDFs / 42 sec</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Color Calibration</span>
                <span className="font-mono text-white font-semibold">sRGB & CMYK Print Safe</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Delivery Channels</span>
                <span className="font-mono text-white font-semibold">Stream, ZIP, S3 Webhook</span>
              </div>
              <div className="pt-2">
                <NavLink
                  to="/app/developer"
                  className="w-full text-center py-2 rounded-xl bg-forest hover:bg-forest-900 text-white text-xs font-semibold block transition-colors shadow-2xs"
                >
                  Explore Developer Sandbox & API Keys →
                </NavLink>
              </div>
            </div>
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
