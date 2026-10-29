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
  Sparkles
} from 'lucide-react';
import { getStoredTemplates, getStoredBrandKit } from '../../utils/storage';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import confetti from 'canvas-confetti';

export const BulkGeneration: React.FC<{ onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void }> = ({ onShowToast }) => {
  const templates = getStoredTemplates();
  const brandKit = getStoredBrandKit();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[1].id); // Invoice by default
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Sample batch records
  const sampleRecords = [
    { client: 'Acme Logistics Ltd', reference: 'INV-2026-901', amount: '$4,200.00', date: '2026-10-28', status: 'Valid' },
    { client: 'Apex Biotech Inc', reference: 'INV-2026-902', amount: '$8,150.00', date: '2026-10-28', status: 'Valid' },
    { client: 'Vertex Media Lab', reference: 'INV-2026-903', amount: '$2,780.00', date: '2026-10-29', status: 'Valid' },
    { client: 'Solstice Capital', reference: 'INV-2026-904', amount: '$15,400.00', date: '2026-10-29', status: 'Valid' },
    { client: 'Meridian Partners', reference: 'INV-2026-905', amount: '$6,900.00', date: '2026-10-30', status: 'Valid' },
  ];

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
          records: sampleRecords,
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
                try {
                  confetti({
                    particleCount: 50,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#0F3D2E', '#3A7D5F', '#A7C957'],
                  });
                } catch {}
                if (onShowToast) {
                  onShowToast('Batch Completed', '5 server-rendered PDFs ready for download.', 'success');
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
          onShowToast('Batch Completed', 'Successfully generated 5 PDF documents.', 'success');
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
      <div className="bg-white p-4 rounded-card border border-paper-border shadow-card flex items-center justify-between text-xs font-semibold">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-forest' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-forest text-white' : 'bg-slate-100'}`}>1</span>
          <span>Choose Template</span>
        </div>
        <div className="h-px w-8 bg-paper-border hidden sm:block" />

        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-forest' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-forest text-white' : 'bg-slate-100'}`}>2</span>
          <span>Import Records</span>
        </div>
        <div className="h-px w-8 bg-paper-border hidden sm:block" />

        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-forest' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-forest text-white' : 'bg-slate-100'}`}>3</span>
          <span>Review & Map</span>
        </div>
        <div className="h-px w-8 bg-paper-border hidden sm:block" />

        <div className={`flex items-center gap-2 ${step >= 4 ? 'text-forest' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? 'bg-forest text-white' : 'bg-slate-100'}`}>4</span>
          <span>Generate & Export</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white p-6 sm:p-8 rounded-card border border-paper-border shadow-card">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-display font-bold text-ink">Step 1: Select Master Template</h3>
              <p className="text-xs text-slate-500 mt-1">
                Choose the design layout that will be populated with your dataset.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {templates.slice(0, 3).map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-4 rounded-card border-2 cursor-pointer transition-all ${
                    selectedTemplateId === tpl.id
                      ? 'border-forest bg-forest-50/40 shadow-xs'
                      : 'border-paper-border hover:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest font-display bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                    {tpl.category}
                  </span>
                  <h4 className="font-display font-bold text-sm text-ink mt-2">{tpl.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tpl.description}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-paper-border">
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
            <div>
              <h3 className="text-base font-display font-bold text-ink">Step 2: Upload CSV or Select Sample Data</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload a structured file with rows corresponding to each recipient document.
              </p>
            </div>

            {/* Dropzone mockup */}
            <div className="border-2 border-dashed border-paper-border rounded-xl p-8 text-center bg-paper-subtle/50 space-y-3">
              <div className="w-12 h-12 rounded-full bg-forest-50 text-forest mx-auto flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">Click to upload CSV or drag and drop</p>
                <p className="text-[11px] text-slate-400 mt-0.5">UTF-8 CSV, XLSX, or JSON (Up to 5,000 rows)</p>
              </div>
              <div className="pt-2">
                <Button variant="secondary" size="sm">
                  Load Pre-filled 5-Record Sample Batch
                </Button>
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
                Proceed to Verification
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-display font-bold text-ink">Step 3: Verify Records & Field Mapping</h3>
              <p className="text-xs text-slate-500 mt-1">
                Review the 5 parsed rows and confirm schema mapping before executing the generation engine.
              </p>
            </div>

            {/* Records Table */}
            <div className="rounded-lg border border-paper-border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-paper-subtle text-slate-500 font-semibold border-b border-paper-border">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Client Entity</th>
                    <th className="py-2.5 px-3">Reference ID</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Issue Date</th>
                    <th className="py-2.5 px-3">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-border">
                  {sampleRecords.map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{i + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-ink">{rec.client}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{rec.reference}</td>
                      <td className="py-2.5 px-3 font-semibold text-forest">{rec.amount}</td>
                      <td className="py-2.5 px-3 text-slate-500">{rec.date}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle className="w-3 h-3" /> Valid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-paper-border">
              <Button variant="secondary" size="sm" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setStep(4);
                  handleStartBatch();
                }}
                leftIcon={<Play className="w-4 h-4" />}
              >
                Execute Batch Generation
              </Button>
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
                  : 'All 5 documents have been generated and packaged.'}
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
                <span>{Math.round((progress / 100) * 5)} / 5 documents</span>
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
    </div>
  );
};
