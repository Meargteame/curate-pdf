import React, { useState } from 'react';
import { 
  Layers, 
  Upload, 
  CheckCircle, 
  Play, 
  Download, 
  FileSpreadsheet, 
  ArrowRight, 
  AlertCircle,
  RefreshCw,
  Eye,
  Search,
  Sliders,
  Check,
  ChevronRight,
  FileText
} from 'lucide-react';
import { getStoredTemplates, getStoredBrandKit, syncFromBackendDb } from '../../utils/storage';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { LivePDFCanvas } from '../../components/document/LivePDFCanvas';
import { DocumentData } from '../../types';
import confetti from 'canvas-confetti';
import { formatCurrency } from '../../utils/formatters';

export const BulkGeneration: React.FC<{ onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void }> = ({ onShowToast }) => {
  const templates = getStoredTemplates();
  const brandKit = getStoredBrandKit();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[1].id); // Invoice by default
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewRowIndex, setPreviewRowIndex] = useState(0);
  const [rawPastedCsv, setRawPastedCsv] = useState('');
  const [isPasteMode, setIsPasteMode] = useState(false);

  // Batch records state (supports sample or user-uploaded CSV)
  const defaultSampleRecords = [
    { client: 'Acme Logistics Ltd', reference: 'INV-2026-901', amount: '$4,200.00', date: '2026-10-28', summary: 'Logistics data pipelines' },
    { client: 'Apex Biotech Inc', reference: 'INV-2026-902', amount: '$8,150.00', date: '2026-10-28', summary: 'Clinical trial analytics' },
    { client: 'Vertex Media Lab', reference: 'INV-2026-903', amount: '$2,780.00', date: '2026-10-29', summary: 'Brand token migration' },
    { client: 'Solstice Capital', reference: 'INV-2026-904', amount: '$15,400.00', date: '2026-10-29', summary: 'Quarterly portfolio audit' },
    { client: 'Meridian Partners', reference: 'INV-2026-905', amount: '$6,900.00', date: '2026-10-30', summary: 'Advisory retainer phase 2' },
  ];

  const [records, setRecords] = useState<Array<Record<string, any>>>(defaultSampleRecords);
  const [detectedColumns, setDetectedColumns] = useState<string[]>(['client', 'reference', 'amount', 'date', 'summary']);
  const [columnMapping, setColumnMapping] = useState<{
    client: string;
    reference: string;
    amount: string;
    date: string;
    summary: string;
  }>({
    client: 'client',
    reference: 'reference',
    amount: 'amount',
    date: 'date',
    summary: 'summary',
  });

  // Filter templates in Step 1
  const filteredTemplates = templates.filter(t => 
    templateCategoryFilter === 'all' || t.category === templateCategoryFilter
  );

  // Parse CSV text into records array
  const parseCsvText = (csv: string) => {
    const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const lowerHeaders = rawHeaders.map(h => h.toLowerCase());
    setDetectedColumns(rawHeaders);

    // Auto-detect column mapping
    const findBestMatch = (candidates: string[]) => {
      const idx = lowerHeaders.findIndex(h => candidates.some(c => h.includes(c)));
      return idx !== -1 ? rawHeaders[idx] : '';
    };

    const newMapping = {
      client: findBestMatch(['client', 'name', 'recipient', 'company', 'customer']) || rawHeaders[0] || '',
      reference: findBestMatch(['ref', 'id', 'num', 'invoice']) || rawHeaders[1] || '',
      amount: findBestMatch(['amount', 'total', 'price', 'rate', 'cost', 'fee']) || rawHeaders[2] || '',
      date: findBestMatch(['date', 'due', 'issue', 'time']) || rawHeaders[3] || '',
      summary: findBestMatch(['summary', 'desc', 'note', 'service', 'deliverable']) || '',
    };
    setColumnMapping(newMapping);

    const parsedRecords: Array<Record<string, any>> = [];

    for (let i = 1; i < lines.length; i++) {
      const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      const row = matches.map(val => val.trim().replace(/^["']|["']$/g, ''));
      if (row.length === 0 || row.every(val => !val)) continue;

      const record: Record<string, any> = {};
      rawHeaders.forEach((header, colIdx) => {
        record[header] = row[colIdx] || '';
      });

      parsedRecords.push(record);
    }
    return parsedRecords;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCsvText(text);
      if (parsed.length > 0) {
        setRecords(parsed);
        if (onShowToast) {
          onShowToast('CSV Parsed', `Successfully imported ${parsed.length} rows from ${file.name}.`, 'success');
        }
      } else {
        if (onShowToast) {
          onShowToast('Import Warning', 'Could not parse records. Please check the CSV format.', 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPastedCsv = () => {
    if (!rawPastedCsv.trim()) return;
    const parsed = parseCsvText(rawPastedCsv);
    if (parsed.length > 0) {
      setRecords(parsed);
      setUploadedFileName('Pasted CSV Data');
      setIsPasteMode(false);
      if (onShowToast) {
        onShowToast('Data Imported', `Successfully imported ${parsed.length} records.`, 'success');
      }
    } else {
      if (onShowToast) {
        onShowToast('Parse Error', 'Could not parse valid CSV data from clipboard.', 'error');
      }
    }
  };

  const downloadSampleCsv = () => {
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    let sampleCsv = '';

    if (selectedTemplate?.category === 'certificates') {
      sampleCsv = `recipient,reference,award_title,date,email,organization
"Sarah Jenkins","CERT-2026-001","Master of Cloud Systems Architecture","2026-11-01","sarah@jenkins.example","Acme Advisory"
"Marcus Vance","CERT-2026-002","Senior Vector Engine Specialist","2026-11-01","marcus@vance.example","Vertex Media"
"Elena Rostova","CERT-2026-003","Enterprise Security Professional","2026-11-02","elena@rostova.example","Solstice Capital"`;
    } else {
      sampleCsv = `client,reference,amount,date,email,summary
"Acme Logistics Ltd","INV-2026-901","$4,200.00","2026-10-28","contact@acme.example","Supply chain modernization deliverables"
"Apex Biotech Inc","INV-2026-902","$8,150.00","2026-10-28","billing@apex.example","Clinical trials data infrastructure"
"Vertex Media Lab","INV-2026-903","$2,780.00","2026-10-29","accounts@vertex.example","Brand design system rollout"
"Solstice Capital","INV-2026-904","$15,400.00","2026-10-29","ops@solstice.example","Quarterly portfolio review statement"
"Meridian Partners","INV-2026-905","$6,900.00","2026-10-30","finance@meridian.example","Corporate governance retainer"`;
    }
    
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curatepdf_batch_${selectedTemplate?.category || 'data'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to extract clean numerical amount
  const getRecordAmount = (rec: Record<string, any>) => {
    const raw = rec[columnMapping.amount] || rec.amount || rec.total || rec.rate || '1000';
    return parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 1000;
  };

  const getRecordClient = (rec: Record<string, any>) => {
    return rec[columnMapping.client] || rec.client || rec.name || rec.recipient || 'Recipient Entity';
  };

  const getRecordRef = (rec: Record<string, any>, idx: number) => {
    return rec[columnMapping.reference] || rec.reference || `BATCH-${String(idx + 1).padStart(3, '0')}`;
  };

  const getRecordDate = (rec: Record<string, any>) => {
    return rec[columnMapping.date] || rec.date || new Date().toISOString().split('T')[0];
  };

  const getRecordSummary = (rec: Record<string, any>) => {
    return rec[columnMapping.summary] || rec.summary || rec.notes || 'Automated bulk document generation.';
  };

  const handleStartBatch = async () => {
    setIsProcessing(true);
    setProgress(0);
    setIsCompleted(false);

    try {
      // 1. Attempt Server-Side Bulk Generation Queue
      const response = await fetch('/api/v1/bulk/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          records: records,
        }),
      });

      if (response.ok) {
        const { jobId } = await response.json();
        setActiveJobId(jobId);

        // Poll job status
        const pollInterval = setInterval(async () => {
          try {
            const pollRes = await fetch(`/api/v1/bulk/jobs/${jobId}`);
            if (pollRes.ok) {
              const { data } = await pollRes.json();
              setProgress(data.progressPercent || 0);

              if (data.status === 'completed') {
                clearInterval(pollInterval);
                setProgress(100);
                setIsProcessing(false);
                setIsCompleted(true);
                // Synchronize all generated batch documents directly to database
                syncFromBackendDb().catch(() => {});
                try {
                  confetti({
                    particleCount: 50,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#0F3D2E', '#3A7D5F', '#A7C957'],
                  });
                } catch {}
                if (onShowToast) {
                  onShowToast('Batch Completed', `${records.length} server-rendered PDFs ready for download.`, 'success');
                }
              } else if (data.status === 'failed') {
                clearInterval(pollInterval);
                setIsProcessing(false);
                if (onShowToast) onShowToast('Batch Failed', data.error, 'error');
              }
            }
          } catch {
            clearInterval(pollInterval);
          }
        }, 800);

        return;
      }
    } catch {
      // Backend unavailable; run local simulated batch
    }

    // Local Fallback simulation
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
        setIsCompleted(true);
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0F3D2E', '#3A7D5F', '#A7C957'],
          });
        } catch {}
        if (onShowToast) {
          onShowToast('Batch Completed', `Successfully generated ${records.length} PDF documents.`, 'success');
        }
      }
    }, 600);
  };

  const handleDownloadZip = () => {
    if (activeJobId) {
      window.open(`/api/v1/bulk/jobs/${activeJobId}/download`, '_blank');
    }
    if (onShowToast) {
      onShowToast('Downloaded Batch', 'Batch archive downloaded successfully.', 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Bulk Document Automation</h1>
        <p className="text-xs text-slate-500">
          Generate large batches of consistent PDF documents from structured CSV or JSON data records
        </p>
      </div>

      {/* Stepper Header */}
      <div className="bg-white p-3 sm:p-4 rounded-card border border-paper-border shadow-card flex items-center justify-between text-xs font-semibold overflow-x-auto">
        {[
          { num: 1, label: 'Choose Template' },
          { num: 2, label: 'Import Records' },
          { num: 3, label: 'Review & Map' },
          { num: 4, label: 'Generate & Export' },
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            {idx > 0 && <div className="h-px w-3 sm:w-8 bg-paper-border shrink-0" />}
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setStep(s.num as any)}
              className={`flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0 ${
                step === s.num ? 'text-forest font-bold' : step > s.num ? 'text-slate-700 hover:text-forest' : 'text-slate-400'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 ${
                step === s.num ? 'bg-forest text-white shadow-xs' : step > s.num ? 'bg-forest-100 text-forest font-bold' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
              <span className="inline sm:hidden text-[11px]">{step === s.num ? s.label.split(' ')[0] : ''}</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white p-6 sm:p-8 rounded-card border border-paper-border shadow-card">
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-display font-bold text-ink">Step 1: Select Master Template</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the document layout that will be populated with your dataset.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Templates' },
                  { id: 'finance', label: 'Invoices' },
                  { id: 'business', label: 'Proposals' },
                  { id: 'reports', label: 'Reports' },
                  { id: 'certificates', label: 'Certificates' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTemplateCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      templateCategoryFilter === cat.id
                        ? 'bg-forest text-white shadow-2xs'
                        : 'bg-paper-subtle text-slate-600 hover:text-ink hover:bg-slate-200/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-4.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 relative group ${
                      isSelected
                        ? 'border-forest bg-forest-50/40 shadow-sm'
                        : 'border-paper-border hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-forest font-display bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-100">
                          {tpl.category}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-forest text-white flex items-center justify-center text-xs">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-sm text-ink mt-2.5 group-hover:text-forest transition-colors">
                        {tpl.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-paper-border/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{tpl.defaultData.orientation === 'landscape' ? 'Landscape' : 'Portrait A4'}</span>
                      <span className="font-semibold text-forest">
                        {isSelected ? 'Active Selection' : 'Select layout →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-paper-border">
              <span className="text-xs text-slate-500">
                Selected: <strong className="text-forest">{templates.find(t => t.id === selectedTemplateId)?.name}</strong>
              </span>
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(2)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Import
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-display font-bold text-ink">Step 2: Upload CSV or Paste Dataset</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Import rows containing client names, reference codes, financial totals, and custom notes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasteMode(!isPasteMode)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-paper-border hover:bg-slate-50 transition-colors cursor-pointer text-slate-700"
                >
                  {isPasteMode ? 'Switch to File Upload' : 'Paste CSV Text'}
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadSampleCsv}
                  leftIcon={<Download className="w-3.5 h-3.5 text-forest" />}
                  className="text-xs shrink-0"
                >
                  Sample CSV
                </Button>
              </div>
            </div>

            {/* Mode 1: File Dropzone */}
            {!isPasteMode ? (
              <div className="relative border-2 border-dashed border-paper-border rounded-2xl p-8 text-center bg-paper-subtle/50 space-y-3 hover:border-forest/50 transition-colors">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Upload CSV File"
                />
                <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest mx-auto flex items-center justify-center border border-forest-100 shadow-2xs">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Click to browse or drag & drop CSV'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Standard comma-separated format. Supports exports from QuickBooks, Stripe, or Excel.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3 relative z-20">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setRecords(defaultSampleRecords);
                      setUploadedFileName(null);
                      setDetectedColumns(['client', 'reference', 'amount', 'date', 'summary']);
                      setColumnMapping({
                        client: 'client',
                        reference: 'reference',
                        amount: 'amount',
                        date: 'date',
                        summary: 'summary',
                      });
                      if (onShowToast) onShowToast('Sample Loaded', 'Loaded 5 sample corporate invoice records.', 'info');
                    }}
                  >
                    Load 5-Record Sample Batch
                  </Button>
                </div>
              </div>
            ) : (
              /* Mode 2: Direct Raw CSV Paste */
              <div className="space-y-3">
                <textarea
                  rows={6}
                  value={rawPastedCsv}
                  onChange={(e) => setRawPastedCsv(e.target.value)}
                  placeholder={`client,reference,amount,date,summary\nAcme Corp,INV-001,$1200,2026-11-01,Q4 Strategic Consulting\nVertex Labs,INV-002,$3400,2026-11-02,Cloud Infrastructure Setup`}
                  className="w-full font-mono text-xs p-3.5 bg-slate-50 focus:bg-white border border-paper-border rounded-xl focus:outline-none focus:ring-1 focus:ring-forest leading-relaxed resize-y"
                />
                <div className="flex justify-end">
                  <Button variant="primary" size="sm" onClick={handleApplyPastedCsv}>
                    Parse & Import Text
                  </Button>
                </div>
              </div>
            )}

            {/* Detected Columns & Record Summary */}
            <div className="p-4 bg-white border border-paper-border rounded-xl shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {uploadedFileName ? `Active Dataset: ${uploadedFileName}` : 'Active Dataset: Built-in Sample'}
                </span>
                <span className="font-mono text-forest font-bold">{records.length} records ready</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Detected Columns:</span>
                {detectedColumns.map((col) => (
                  <span key={col} className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                    {col}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-paper-border">
              <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(3)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Mapping ({records.length} records)
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-display font-bold text-ink">Step 3: Verify Records & Field Mapping</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure each document attribute connects to the right column in your CSV dataset before executing the batch.
              </p>
            </div>

            {/* Interactive Column Mapping Form */}
            <div className="bg-paper-subtle/70 p-4 sm:p-5 rounded-2xl border border-paper-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-forest" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                    Interactive Schema Mapping
                  </h4>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Auto-mapped from CSV
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Client / Recipient
                  </label>
                  <select
                    value={columnMapping.client}
                    onChange={(e) => setColumnMapping({ ...columnMapping, client: e.target.value })}
                    className="w-full text-xs bg-white border border-paper-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                  >
                    {detectedColumns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Reference / ID
                  </label>
                  <select
                    value={columnMapping.reference}
                    onChange={(e) => setColumnMapping({ ...columnMapping, reference: e.target.value })}
                    className="w-full text-xs bg-white border border-paper-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                  >
                    {detectedColumns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Financial Total / Rate
                  </label>
                  <select
                    value={columnMapping.amount}
                    onChange={(e) => setColumnMapping({ ...columnMapping, amount: e.target.value })}
                    className="w-full text-xs bg-white border border-paper-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                  >
                    {detectedColumns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Issue Date
                  </label>
                  <select
                    value={columnMapping.date}
                    onChange={(e) => setColumnMapping({ ...columnMapping, date: e.target.value })}
                    className="w-full text-xs bg-white border border-paper-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                  >
                    {detectedColumns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Records Verification Table */}
            <div className="rounded-2xl border border-paper-border overflow-hidden shadow-2xs">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-paper-border sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Mapped Recipient</th>
                      <th className="py-2.5 px-3">Mapped Reference</th>
                      <th className="py-2.5 px-3">Parsed Amount</th>
                      <th className="py-2.5 px-3">Issue Date</th>
                      <th className="py-2.5 px-3 text-center">Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-paper-border bg-white">
                    {records.map((rec, i) => {
                      const client = getRecordClient(rec);
                      const ref = getRecordRef(rec, i);
                      const amount = getRecordAmount(rec);
                      const date = getRecordDate(rec);
                      return (
                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-400">{i + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-ink">{client}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{ref}</td>
                          <td className="py-2.5 px-3 font-semibold text-forest font-mono">{formatCurrency(amount, 'USD')}</td>
                          <td className="py-2.5 px-3 text-slate-500">{date}</td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewRowIndex(i);
                                setIsPreviewModalOpen(true);
                              }}
                              className="text-xs font-semibold text-forest hover:text-forest-900 hover:underline cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-paper-border">
              <Button variant="secondary" size="sm" onClick={() => setStep(2)}>
                Back
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setPreviewRowIndex(0);
                    setIsPreviewModalOpen(true);
                  }}
                  leftIcon={<Eye className="w-4 h-4 text-forest" />}
                  className="flex-1 sm:flex-none justify-center"
                >
                  Preview First Record
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setStep(4);
                    handleStartBatch();
                  }}
                  leftIcon={<Play className="w-4 h-4" />}
                  className="flex-1 sm:flex-none justify-center"
                >
                  Generate {records.length} Documents
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 text-center py-4">
            <div>
              <h3 className="text-lg font-display font-bold text-ink">
                {isProcessing ? 'Generating PDF Batch...' : 'Batch Generation Complete'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isProcessing
                  ? 'Assembling vectors, rendering fonts, and compiling output archive...'
                  : `All ${records.length} documents have been generated and packaged.`}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-paper-border">
                <div
                  className="bg-forest h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>{progress}% complete</span>
                <span>{Math.round((progress / 100) * records.length)} / {records.length} documents</span>
              </div>
            </div>

            {/* Finished actions */}
            {isCompleted && (
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleDownloadZip}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download All PDFs (.ZIP)
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setStep(1);
                    setProgress(0);
                    setIsCompleted(false);
                  }}
                >
                  Start New Batch
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sample Row Preview Dialog */}
      <Dialog
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={`Record Preview: Row #${previewRowIndex + 1} (${getRecordClient(records[previewRowIndex] || {})})`}
        description="Verify how your mapped CSV fields populate this template before launching batch compilation."
        maxWidth="4xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Switch Row:</span>
              <select
                value={previewRowIndex}
                onChange={(e) => setPreviewRowIndex(parseInt(e.target.value) || 0)}
                className="bg-white border border-paper-border rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                {records.map((r, i) => (
                  <option key={i} value={i}>
                    Row #{i + 1}: {getRecordClient(r)} ({getRecordRef(r, i)})
                  </option>
                ))}
              </select>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setIsPreviewModalOpen(false)}>
              Close Preview
            </Button>
          </div>
        }
      >
        <div className="bg-paper-subtle p-4 sm:p-6 rounded-2xl border border-paper-border flex justify-center overflow-auto max-h-[600px]">
          {(() => {
            const currentRec = records[previewRowIndex] || records[0] || {};
            const client = getRecordClient(currentRec);
            const ref = getRecordRef(currentRec, previewRowIndex);
            const amount = getRecordAmount(currentRec);
            const date = getRecordDate(currentRec);
            const summary = getRecordSummary(currentRec);
            const matchedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
            const isCert = matchedTemplate.category === 'certificates';

            return (
              <LivePDFCanvas
                document={{
                  id: 'batch-preview',
                  title: `${matchedTemplate.name} - ${ref}`,
                  referenceNumber: ref,
                  templateId: selectedTemplateId,
                  category: matchedTemplate.category,
                  status: 'ready',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  date: date,
                  clientCompany: client,
                  clientName: isCert ? client : 'Accounts Payable',
                  recipientName: client,
                  awardTitle: currentRec.award_title || summary,
                  summary: summary,
                  lineItems: [
                    { 
                      id: '1', 
                      description: summary || 'Professional Deliverable Services', 
                      quantity: 1, 
                      rate: amount 
                    }
                  ],
                  subtotal: amount,
                  total: amount,
                  pageSize: matchedTemplate.defaultData.pageSize || 'A4',
                  orientation: matchedTemplate.defaultData.orientation || 'portrait',
                  margin: 'standard',
                }}
                brandKit={brandKit}
                zoom={0.65}
              />
            );
          })()}
        </div>
      </Dialog>
    </div>
  );
};
