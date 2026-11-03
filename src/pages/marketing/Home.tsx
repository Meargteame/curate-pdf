import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  ArrowRight, 
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
  Check, 
  Briefcase, 
  Receipt, 
  BarChart3, 
  Award, 
  UserCheck, 
  ScrollText,
  Maximize2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { getStoredBrandKit, getStoredTemplates } from '../../utils/storage';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const brandKit = getStoredBrandKit();
  const templates = getStoredTemplates();

  const [activeApiTab, setActiveApiTab] = useState<'curl' | 'node' | 'python'>('curl');
  const [isCopied, setIsCopied] = useState(false);

  const apiSnippets = {
    curl: `curl -X POST https://api.curatepdf.site/v1/documents \\
  -H "Authorization: Bearer cp_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "templateId": "tpl-invoice-clean",
    "title": "Commercial Invoice",
    "referenceNumber": "INV-2026-904",
    "clientCompany": "Acme Global Corp",
    "lineItems": [
      { "description": "Cloud Architecture Retainer", "quantity": 1, "rate": 3500 }
    ],
    "pageSize": "A4"
  }'`,

    node: `import { CuratePDF } from '@curatepdf/sdk';

const curate = new CuratePDF({ apiKey: process.env.CURATEPDF_API_KEY });

const doc = await curate.documents.create({
  templateId: 'tpl-proposal-modern',
  title: 'Executive Architecture Proposal',
  clientCompany: 'Northwind Global',
  total: 32000,
  currency: 'USD',
  pageSize: 'A4',
});

// Download print-ready vector PDF buffer
const pdfBuffer = await curate.documents.downloadPdf(doc.id);`,

    python: `from curatepdf import CuratePDF

client = CuratePDF(api_key="cp_live_your_api_key_here")

pdf_stream = client.documents.create_and_download(
    template_id="tpl-invoice-clean",
    title="Commercial Statement",
    reference_number="INV-2026-8801",
    client_company="Stripe Global Services",
    total=4250,
    page_size="A4"
)

with open("statement.pdf", "wb") as f:
    f.write(pdf_stream)`
  };

  return (
    <div className="space-y-24 pb-20 relative overflow-hidden antialiased">
      {/* Ambient background glow & grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[520px] bg-forest-100/35 blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-dot-grid opacity-45 pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 pb-16 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        {/* Headline: Clean 2-Line Architectural Balance */}
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-ink max-w-3xl mx-auto leading-[1.1] mb-5">
          Professional PDFs, <br className="hidden sm:inline" />
          <span className="text-forest">engineered for precision.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6">
          Transform structured business data into publication-ready proposals, invoices, and executive reports. Centralized brand tokens, real-time vector canvas, and sub-100ms headless developer APIs.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/app/editor')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="h-12 px-8 text-sm sm:text-base font-bold shadow-md hover:shadow-xl w-full sm:w-auto justify-center"
          >
            Create your first PDF
          </Button>
        </div>

        {/* Trust micro-copy */}
        <p className="text-xs text-slate-400 font-medium ">
          Instant client-side vector engine • 100% free starter tier • Zero watermarks
        </p>
      </section>

      {/* Connected 5-Step Pipeline */}
      <section className="bg-white py-20 border-y border-paper-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-forest font-display">
              Intuitive Progression
            </span>
            <h2 className="text-3xl font-display font-extrabold text-ink tracking-tight">
              From structured input to finished document in seconds
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              CuratePDF standardizes document creation across your organization with a predictable, repeatable 5-step pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
            {[
              {
                step: '01',
                title: 'Choose a template',
                desc: 'Select from 8 publication-ready business, invoice, report, or certificate layouts.',
              },
              {
                step: '02',
                title: 'Add structured data',
                desc: 'Fill client particulars, line items, deliverables, and automated mathematical totals.',
              },
              {
                step: '03',
                title: 'Apply brand kit',
                desc: 'Centralized typography, primary hex accents, and company logo apply automatically.',
              },
              {
                step: '04',
                title: 'Inspect vector preview',
                desc: 'Simulate exact millimetric A4 page flow, table wrapping, and high-DPI rasterization.',
              },
              {
                step: '05',
                title: 'Export & distribute',
                desc: 'Download crisp 300 DPI vector PDFs instantly or stream batches via REST API.',
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="bg-paper-subtle/50 p-6 rounded-2xl border border-paper-border hover:border-forest/40 hover:bg-white hover:shadow-card transition-all duration-200 flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-forest bg-forest-100/70 border border-forest-200/60 px-2.5 py-1 rounded-lg">
                    {item.step}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-forest transition-colors">
                    Step {idx + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-ink group-hover:text-forest transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
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
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  {(['curl', 'node', 'python'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveApiTab(lang)}
                      className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                        activeApiTab === lang
                          ? 'bg-forest text-white'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(apiSnippets[activeApiTab]);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                <code>{apiSnippets[activeApiTab]}</code>
              </pre>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Endpoint Active
              </span>
              <span>200 OK • 76ms Latency</span>
            </div>
          </div>

          {/* Right: Response Payload & Metrics */}
          <div className="lg:col-span-5 p-6 bg-[#070A0C] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400">Response Payload (JSON)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  HTTP 201 Created
                </span>
              </div>
              <pre className="font-mono text-xs text-emerald-400 overflow-x-auto pt-3 leading-relaxed">
                <code>{`{
  "status": 201,
  "data": {
    "id": "doc-9482-a",
    "renderEngine": "VectorEngine 2.0",
    "renderTimeMs": 68,
    "pageSize": "A4",
    "dpi": 300,
    "downloadUrl": "/api/v1/documents/doc-9482-a/pdf"
  }
}`}</code>
              </pre>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
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
                <span className="font-mono text-white font-semibold">Direct Stream, ZIP, Webhooks</span>
              </div>
              <div className="pt-2">
                <NavLink
                  to="/app/developer"
                  className="w-full text-center py-2.5 rounded-xl bg-forest hover:bg-forest-900 text-white text-xs font-semibold block transition-colors shadow-2xs"
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
          <div 
            onClick={() => navigate('/templates?cat=business')}
            className="bg-white p-6 rounded-2xl border border-paper-border shadow-card space-y-4 hover:border-forest/40 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest border border-forest-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-ink group-hover:text-forest transition-colors">
                Business Proposals & SOWs
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                Present executive client pitches, milestone delivery schedules, and scope boundaries with clear structured sections.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-forest flex items-center gap-1">
              <span>View proposal templates</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div 
            onClick={() => navigate('/templates?cat=finance')}
            className="bg-white p-6 rounded-2xl border border-paper-border shadow-card space-y-4 hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-ink group-hover:text-emerald-800 transition-colors">
                Invoices & Financial Statements
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                Automatic line-item calculations, tax handling, payment terms, and remittance banking details with zero math errors.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <span>View invoice templates</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div 
            onClick={() => navigate('/templates?cat=reports')}
            className="bg-white p-6 rounded-2xl border border-paper-border shadow-card space-y-4 hover:border-sky-500/40 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-800 border border-sky-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-ink group-hover:text-sky-800 transition-colors">
                Executive & Operations Reports
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                Consolidate monthly velocity, quarterly objectives, and resource management statistics into clean readable tables.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-sky-800 flex items-center gap-1">
              <span>View report templates</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div 
            onClick={() => navigate('/templates?cat=certificates')}
            className="bg-white p-6 rounded-2xl border border-paper-border shadow-card space-y-4 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 border border-amber-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-ink group-hover:text-amber-800 transition-colors">
                Certificates & Accreditations
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                Award formal certificates of achievement, training completions, and compliance licenses with verification marks.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-amber-800 flex items-center gap-1">
              <span>View certificate templates</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div 
            onClick={() => navigate('/templates?cat=recruitment')}
            className="bg-white p-6 rounded-2xl border border-paper-border shadow-card space-y-4 hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-800 border border-purple-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-ink group-hover:text-purple-800 transition-colors">
                Candidate Profiles & Dossiers
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                Recruitment agencies and talent partners can assemble structured executive dossiers and track records quickly.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-purple-800 flex items-center gap-1">
              <span>View dossier templates</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div 
            onClick={() => navigate('/templates?cat=business')}
            className="bg-white p-6 rounded-2xl border border-paper-border shadow-card space-y-4 hover:border-slate-400 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <ScrollText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-ink group-hover:text-slate-900 transition-colors">
                Agreements & Legal Charters
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                Standardize master services agreements, non-disclosure contracts, and operational handbooks with formal clauses.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>View agreement templates</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Architecture & Technical Benchmarks */}
      <section className="bg-forest-950 text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-display">
              Infrastructure Specifications
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              Engineered for publication-grade vector fidelity
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Why leading consultancies, engineering teams, and financial institutions deploy CuratePDF.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-forest-900/60 border border-forest-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  300 DPI VECTOR
                </span>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-white">Sub-Millimeter PDF Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Unlike blurry HTML screenshot wrappers, our engine embeds true text vectors, calibrated font metrics, and print-safe margins with zero page-break wrapping bugs.
              </p>
              <div className="pt-2 border-t border-forest-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Rasterization DPI:</span>
                <span className="text-white font-semibold">Native 300 DPI</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-forest-900/60 border border-forest-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  DESIGN TOKENS
                </span>
                <Palette className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-white">Centralized Brand Kit</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Update your primary colors, monogram badges, and corporate typography once. All templates and bulk CSV exports immediately inherit exact brand compliance.
              </p>
              <div className="pt-2 border-t border-forest-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Palette Sync:</span>
                <span className="text-white font-semibold">Global Workspace</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-forest-900/60 border border-forest-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  HIGH THROUGHPUT
                </span>
                <Terminal className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-white">Sub-100ms API Execution</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trigger on-demand document generation or assemble ZIP archives of hundreds of client invoices in seconds with reliable server-side execution.
              </p>
              <div className="pt-2 border-t border-forest-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Average Render:</span>
                <span className="text-white font-semibold">68ms / page</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action Callout */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 text-center">
        <div className="bg-gradient-to-b from-white to-[#F8FAF9] rounded-3xl p-10 sm:p-16 border border-paper-border shadow-doc-lg space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-forest-100/50 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-forest font-display bg-forest-50 border border-forest-200/80 px-3.5 py-1.5 rounded-full shadow-2xs">
              Instant Setup • No Credit Card Required
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-ink tracking-tight">
              Start creating consistent, professional PDFs today
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed pt-1">
              Eliminate document formatting headaches. Jump into our live editor and produce your first publication-ready PDF in under two minutes.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 relative z-10">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/app/editor')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="h-12 px-7 text-sm sm:text-base font-bold shadow-md hover:shadow-xl w-full sm:w-auto justify-center"
            >
              Launch Document Editor
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/templates')}
              className="h-12 px-7 text-sm sm:text-base font-semibold w-full sm:w-auto justify-center border-paper-border hover:bg-slate-50"
            >
              Browse Template Gallery
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
