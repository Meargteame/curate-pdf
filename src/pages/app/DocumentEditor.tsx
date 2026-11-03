import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  Printer, 
  Save, 
  ArrowLeft, 
  Eye, 
  Sliders, 
  FileText, 
  Plus, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Minimize2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileDown,
  ExternalLink,
  Layers,
  Sun,
  Moon,
  Copy,
  Loader2,
  MoreHorizontal,
  FileCode
} from 'lucide-react';
import { DocumentData, LineItem, DocumentSection } from '../../types';
import { 
  getStoredDocumentById, 
  getStoredTemplates, 
  getStoredBrandKit, 
  upsertDocument 
} from '../../utils/storage';
import { generateAndDownloadPdf, triggerNativePrint } from '../../utils/pdfGenerator';
import { LivePDFCanvas } from '../../components/document/LivePDFCanvas';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Toast';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { Upload } from 'lucide-react';
import { formatCurrency, getCurrencySymbol, CURRENCY_OPTIONS } from '../../utils/formatters';

export const DocumentEditor: React.FC<{ onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void }> = ({ onShowToast }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const docId = searchParams.get('id');
  const templateId = searchParams.get('template') || 'tpl-proposal-modern';

  const brandKit = getStoredBrandKit();
  const templates = getStoredTemplates();

  // Initialize document state
  const [doc, setDoc] = useState<DocumentData>(() => {
    if (docId) {
      const existing = getStoredDocumentById(docId);
      if (existing) return existing;
    }
    // Load from chosen template or default
    const matchedTemplate = templates.find(t => t.id === templateId) || templates[0];
    const newDocId = `doc-${Date.now().toString(36)}`;
    return {
      id: newDocId,
      title: matchedTemplate.defaultData.title || 'Untitled Document',
      referenceNumber: matchedTemplate.defaultData.referenceNumber || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      templateId: matchedTemplate.id,
      category: matchedTemplate.category,
      status: 'ready',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      dueDate: matchedTemplate.defaultData.dueDate,
      clientName: matchedTemplate.defaultData.clientName || '',
      clientCompany: matchedTemplate.defaultData.clientCompany || '',
      clientEmail: matchedTemplate.defaultData.clientEmail || '',
      clientAddress: matchedTemplate.defaultData.clientAddress || '',
      summary: matchedTemplate.defaultData.summary || '',
      sections: matchedTemplate.defaultData.sections || [
        { id: '1', title: 'Scope & Objectives', content: 'Detailed scope of engagement and milestones.' }
      ],
      lineItems: matchedTemplate.defaultData.lineItems || [
        { id: '1', description: 'Professional Services', quantity: 1, rate: 2500 }
      ],
      subtotal: matchedTemplate.defaultData.subtotal || 2500,
      taxTotal: matchedTemplate.defaultData.taxTotal || 0,
      total: matchedTemplate.defaultData.total || 2500,
      currency: matchedTemplate.defaultData.currency || 'USD',
      paymentTerms: matchedTemplate.defaultData.paymentTerms || '',
      recipientName: matchedTemplate.defaultData.recipientName || '',
      awardTitle: matchedTemplate.defaultData.awardTitle || '',
      candidateRole: matchedTemplate.defaultData.candidateRole || '',
      candidateSkills: matchedTemplate.defaultData.candidateSkills || [],
      pageSize: matchedTemplate.defaultData.pageSize || 'A4',
      orientation: matchedTemplate.defaultData.orientation || 'portrait',
      margin: matchedTemplate.defaultData.margin || 'standard',
    };
  });

  // UI States
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'export'>('content');
  const [mobileMode, setMobileMode] = useState<'edit' | 'preview'>('edit');
  const [zoom, setZoom] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 0.42;
      if (window.innerWidth < 1024) return 0.65;
    }
    return 0.85;
  });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState<boolean>(false);
  const [saveState, setSaveState] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [showSafetyGuides, setShowSafetyGuides] = useState<boolean>(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState<boolean>(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [deskTheme, setDeskTheme] = useState<'dark' | 'light'>('dark');
  const [lastSavedTime, setLastSavedTime] = useState<string>('just now');
  const isFirstRender = React.useRef(true);

  // Auto-fit zoom on window resize if user hasn't heavily customized it
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setZoom(prev => (prev > 0.55 ? 0.42 : prev));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global hotkeys (Ctrl+S to save, Ctrl+P to print)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        triggerNativePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [doc]);

  // Debounced Auto-Save
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaveState('unsaved');
    const timer = setTimeout(async () => {
      setSaveState('saving');
      upsertDocument(doc);
      try {
        await fetch(`/api/v1/documents/${doc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(doc),
        });
      } catch {
        try {
          await fetch('/api/v1/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doc),
          });
        } catch {}
      }
      setSaveState('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1200);

    return () => clearTimeout(timer);
  }, [doc]);

  // Warn before leaving if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveState === 'unsaved') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveState]);

  // Quick Duplicate Current Document
  const handleDuplicateDocument = () => {
    const newId = `doc-${Date.now().toString(36)}`;
    const duplicated: DocumentData = {
      ...doc,
      id: newId,
      title: `${doc.title} (Copy)`,
      referenceNumber: `${doc.referenceNumber}-COPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };
    upsertDocument(duplicated);
    if (onShowToast) {
      onShowToast('Document Duplicated', `Created "${duplicated.title}"`, 'success');
    }
    navigate(`/app/editor?id=${newId}`);
  };

  // Live fetch from backend API if docId is provided
  useEffect(() => {
    if (docId) {
      fetch(`/api/v1/documents/${docId}`)
        .then(res => res.json())
        .then(json => {
          if (json.data) {
            setDoc(json.data);
          }
        })
        .catch(() => {});
    }
  }, [docId]);

  // Template Switching & Blank Document
  const [keepContentOnSwitch, setKeepContentOnSwitch] = useState<boolean>(true);

  const handleSwitchTemplate = (tplId: string, keepContent: boolean = keepContentOnSwitch) => {
    const matched = templates.find(t => t.id === tplId);
    if (!matched) return;
    setDoc(prev => ({
      ...prev,
      templateId: matched.id,
      category: matched.category,
      title: keepContent && prev.title ? prev.title : (matched.defaultData.title || matched.name),
      referenceNumber: prev.referenceNumber || matched.defaultData.referenceNumber || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      sections: keepContent && prev.sections && prev.sections.length > 0 ? prev.sections : (matched.defaultData.sections || []),
      lineItems: keepContent && prev.lineItems && prev.lineItems.length > 0 ? prev.lineItems : (matched.defaultData.lineItems || []),
      subtotal: keepContent && prev.subtotal !== undefined ? prev.subtotal : (matched.defaultData.subtotal || 0),
      total: keepContent && prev.total !== undefined ? prev.total : (matched.defaultData.total || 0),
      pageSize: matched.defaultData.pageSize || prev.pageSize,
      orientation: matched.defaultData.orientation || prev.orientation,
    }));
    setIsTemplatePickerOpen(false);
    if (onShowToast) {
      onShowToast('Template Applied', `Switched layout to "${matched.name}".`, 'info');
    }
  };

  const handleStartBlank = () => {
    setDoc(prev => ({
      ...prev,
      title: 'Untitled Document',
      referenceNumber: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      summary: '',
      clientName: '',
      clientCompany: '',
      clientEmail: '',
      clientAddress: '',
      sections: [{ id: '1', title: 'Main Section', content: 'Type your custom content here...' }],
      lineItems: [],
      subtotal: 0,
      total: 0,
      status: 'draft',
    }));
    setIsTemplatePickerOpen(false);
    if (onShowToast) {
      onShowToast('Blank Document', 'Cleared sections to start from scratch.', 'info');
    }
  };

  // Export & Import Document Schema (JSON)
  const handleExportJson = () => {
    const dataStr = JSON.stringify(doc, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(doc.title || 'document').toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) {
      onShowToast('JSON Exported', 'Document data downloaded as JSON.', 'success');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.title) {
          setDoc(parsed);
          if (onShowToast) {
            onShowToast('Document Imported', `Loaded "${parsed.title}".`, 'success');
          }
        }
      } catch {
        if (onShowToast) {
          onShowToast('Import Failed', 'Selected file is not valid document JSON.', 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  // Recalculate totals whenever lineItems, taxPercent, or discountPercent change
  useEffect(() => {
    if (doc.lineItems && doc.lineItems.length > 0) {
      const sub = doc.lineItems.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
      const discount = doc.discountPercent ? Math.round((sub * doc.discountPercent) / 100) : (doc.discountTotal || 0);
      const afterDiscount = Math.max(0, sub - discount);
      const tax = doc.taxPercent ? Math.round((afterDiscount * doc.taxPercent) / 100) : (doc.taxTotal || 0);
      const grandTotal = afterDiscount + tax;
      setDoc(prev => ({
        ...prev,
        subtotal: sub,
        discountTotal: discount,
        taxTotal: tax,
        total: grandTotal,
      }));
    }
  }, [
    doc.lineItems?.map(i => `${i.quantity}-${i.rate}`).join(','),
    doc.taxPercent,
    doc.discountPercent,
  ]);

  // Handlers for Line Items
  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: 'New Deliverable or Service',
      quantity: 1,
      rate: 500,
    };
    setDoc(prev => ({
      ...prev,
      lineItems: [...(prev.lineItems || []), newItem],
    }));
    setSaveState('unsaved');
  };

  const handleMoveLineItem = (index: number, direction: 'up' | 'down') => {
    if (!doc.lineItems) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= doc.lineItems.length) return;
    const updated = [...doc.lineItems];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    setDoc(prev => ({ ...prev, lineItems: updated }));
    setSaveState('unsaved');
  };

  const handleUpdateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setDoc(prev => ({
      ...prev,
      lineItems: (prev.lineItems || []).map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      }),
    }));
  };

  const handleRemoveLineItem = (id: string) => {
    setDoc(prev => ({
      ...prev,
      lineItems: (prev.lineItems || []).filter(item => item.id !== id),
    }));
  };

  // Handlers for Sections
  const handleAddSection = () => {
    const newSec: DocumentSection = {
      id: Date.now().toString(),
      title: 'Additional Section',
      content: 'Enter section details here...',
    };
    setDoc(prev => ({
      ...prev,
      sections: [...(prev.sections || []), newSec],
    }));
    setSaveState('unsaved');
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!doc.sections) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= doc.sections.length) return;
    const updated = [...doc.sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    setDoc(prev => ({ ...prev, sections: updated }));
    setSaveState('unsaved');
  };

  const handleUpdateSection = (id: string, field: keyof DocumentSection, value: string) => {
    setDoc(prev => ({
      ...prev,
      sections: (prev.sections || []).map(sec => {
        if (sec.id === id) {
          return { ...sec, [field]: value };
        }
        return sec;
      }),
    }));
    setSaveState('unsaved');
  };

  const handleRemoveSection = (id: string) => {
    setDoc(prev => ({
      ...prev,
      sections: (prev.sections || []).filter(sec => sec.id !== id),
    }));
    setSaveState('unsaved');
  };

  // Save Document
  const handleSave = async () => {
    setIsSaving(true);
    setSaveState('saving');
    try {
      const exists = getStoredDocumentById(doc.id);
      if (exists) {
        await fetch(`/api/v1/documents/${doc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(doc),
        });
      } else {
        await fetch('/api/v1/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(doc),
        });
      }
    } catch {}
    upsertDocument(doc);
    setIsSaving(false);
    setSaveState('saved');
    if (onShowToast) {
      onShowToast('Document saved', `"${doc.title}" has been saved successfully.`, 'success');
    }
  };

  // Generate & Download PDF
  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    // Auto-save state
    upsertDocument({ ...doc, status: 'generated' });

    try {
      const fileName = `${doc.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
      const success = await generateAndDownloadPdf({
        fileName,
        pageSize: doc.pageSize,
        orientation: doc.orientation,
        documentData: doc,
      });

      if (success) {
        if (onShowToast) {
          onShowToast('PDF Generated Successfully', `Downloaded ${fileName}`, 'success');
        }
      }
    } catch (err) {
      console.error(err);
      if (onShowToast) {
        onShowToast('Generation Error', 'Fallback printing opened.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-paper overflow-hidden">
      {/* Top Action Subheader */}
      <div className="bg-white border-b border-paper-border px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/app/documents')}
            className="text-slate-500 hover:text-ink -ml-1 sm:-ml-2 h-8 px-2 sm:px-2.5 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline text-xs font-semibold">Documents</span>
          </Button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={doc.title}
                onChange={(e) => {
                  setDoc({ ...doc, title: e.target.value });
                  setSaveState('unsaved');
                }}
                className="font-display font-bold text-sm sm:text-base text-ink bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-forest/20 focus:border-forest px-2 py-0.5 rounded-lg border border-transparent hover:border-slate-200 transition-colors w-32 xs:w-44 sm:w-72 truncate"
                placeholder="Document Title"
              />
              <Badge status={doc.status} size="sm" className="hidden md:inline-flex" />
              
              {/* Auto-Save Status Pill */}
              {saveState === 'saved' && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>Saved {lastSavedTime}</span>
                </span>
              )}
              {saveState === 'unsaved' && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-amber-700 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Unsaved changes</span>
                </span>
              )}
              {saveState === 'saving' && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-forest font-semibold bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200/80">
                  <Loader2 className="w-3 h-3 animate-spin text-forest" />
                  <span>Saving...</span>
                </span>
              )}
            </div>
            
            {/* Crisp Breadcrumb Subtitle */}
            <div className="flex items-center gap-1.5 pl-2 text-[11px] text-slate-500">
              <span className="font-mono text-slate-400">{doc.referenceNumber}</span>
              <span className="text-slate-300">•</span>
              <span className="capitalize font-medium text-slate-600">{doc.category}</span>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => setIsTemplatePickerOpen(true)}
                className="inline-flex items-center gap-1 font-semibold text-forest hover:text-forest-900 transition-colors cursor-pointer hover:underline"
              >
                <Layers className="w-3 h-3" />
                <span>Change Layout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Document Currency Selector */}
          <div className="hidden lg:flex items-center">
            <select
              value={doc.currency || 'USD'}
              onChange={(e) => {
                setDoc({ ...doc, currency: e.target.value });
                setSaveState('unsaved');
              }}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-forest/20"
              title="Change Document Currency"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Safety Margins Guide Toggle */}
          <button
            type="button"
            onClick={() => setShowSafetyGuides(!showSafetyGuides)}
            className={`h-8 px-2.5 rounded-lg border text-xs font-medium hidden xl:inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              showSafetyGuides 
                ? 'bg-forest-50 border-forest text-forest font-semibold' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-ink hover:border-slate-300 shadow-2xs'
            }`}
            title="Toggle print safety margin guides"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Margins</span>
          </button>

          {/* Mobile Edit/Preview switch */}
          <div className="lg:hidden flex bg-paper-subtle p-0.5 rounded-lg border border-paper-border">
            <button
              onClick={() => setMobileMode('edit')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${mobileMode === 'edit' ? 'bg-white shadow-2xs text-forest' : 'text-slate-500'}`}
            >
              Edit
            </button>
            <button
              onClick={() => setMobileMode('preview')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${mobileMode === 'preview' ? 'bg-white shadow-2xs text-forest' : 'text-slate-500'}`}
            >
              Preview
            </button>
          </div>

          {/* Save Draft Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSave}
            loading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5 text-slate-600" />}
            className="text-xs font-semibold h-8 hidden sm:inline-flex border-slate-200 hover:bg-slate-50"
          >
            Save Draft
          </Button>

          {/* Download PDF Split Dropdown */}
          <div className="relative">
            <div className="inline-flex rounded-lg shadow-xs">
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadPDF}
                loading={isGenerating}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="text-xs font-bold h-8 rounded-r-none px-3 bg-forest hover:bg-forest-900"
              >
                <span className="hidden sm:inline">Export </span>PDF
              </Button>
              <button
                type="button"
                onClick={() => {
                  setIsDownloadMenuOpen(!isDownloadMenuOpen);
                  setIsMoreMenuOpen(false);
                }}
                className="px-2 bg-forest hover:bg-forest-900 text-mint border-l border-forest-800 rounded-r-lg flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Download options"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {isDownloadMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsDownloadMenuOpen(false);
                    handleDownloadPDF();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-ink group-hover:text-forest">Client Vector PDF</p>
                    <p className="text-[11px] text-slate-400">Instant in-browser rendering (2× DPI)</p>
                  </div>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-forest" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDownloadMenuOpen(false);
                    upsertDocument({ ...doc, status: 'generated' });
                    window.open(`/api/v1/documents/${doc.id}/pdf`, '_blank');
                    onShowToast?.('PDF Streaming', `Opened server vector PDF for ${doc.title}`, 'success');
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between group border-t border-slate-100 cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-ink group-hover:text-forest">Server Vector PDF</p>
                    <p className="text-[11px] text-slate-400">Backend engine, print-ready 300 DPI</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-forest" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDownloadMenuOpen(false);
                    triggerNativePrint();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between group border-t border-slate-100 cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-ink group-hover:text-forest">System Print Dialog</p>
                    <p className="text-[11px] text-slate-400">Save to PDF or send to local printer</p>
                  </div>
                  <Printer className="w-3.5 h-3.5 text-slate-400 group-hover:text-forest" />
                </button>
              </div>
            )}
          </div>

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(!isMoreMenuOpen);
                setIsDownloadMenuOpen(false);
              }}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-ink flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="More Actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    handleDuplicateDocument();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 group cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-forest" />
                  <span className="font-medium group-hover:text-ink">Duplicate Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    triggerNativePrint();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 group cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400 group-hover:text-forest" />
                  <span className="font-medium group-hover:text-ink">Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setShowSafetyGuides(!showSafetyGuides);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-forest" />
                    <span className="font-medium group-hover:text-ink">Print Margin Guides</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${showSafetyGuides ? 'bg-forest-50 text-forest' : 'text-slate-400'}`}>
                    {showSafetyGuides ? 'ON' : 'OFF'}
                  </span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    handleExportJson();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 group cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-400 group-hover:text-forest" />
                  <span className="font-medium group-hover:text-ink">Export JSON Schema</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    handleStartBlank();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 group cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span className="font-medium">Clear / Start Blank</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Split Body: Editor Left + Live Preview Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Editing Controls Panel */}
        <div className={`w-full lg:w-[480px] xl:w-[520px] bg-white border-r border-paper-border flex flex-col shrink-0 ${mobileMode === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Tabs header */}
          <div className="p-3 border-b border-paper-border bg-paper-subtle/40">
            <Tabs
              variant="segmented"
              activeTab={activeTab}
              onChange={(tab) => setActiveTab(tab as any)}
              tabs={[
                { id: 'content', label: '1. Content & Data', icon: <FileText className="w-3.5 h-3.5" /> },
                { id: 'style', label: '2. Brand & Style', icon: <Sliders className="w-3.5 h-3.5" /> },
                { id: 'export', label: '3. Page Settings', icon: <Eye className="w-3.5 h-3.5" /> },
              ]}
            />
          </div>

          {/* Tab 1: Content & Data Form */}
          {activeTab === 'content' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Document Metadata */}
              <div className="space-y-3 pb-4 border-b border-paper-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                  Core Document Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Reference Number"
                    value={doc.referenceNumber}
                    onChange={(e) => setDoc({ ...doc, referenceNumber: e.target.value })}
                  />
                  <Input
                    label="Issue Date"
                    type="date"
                    value={doc.date}
                    onChange={(e) => setDoc({ ...doc, date: e.target.value })}
                  />
                </div>
                {doc.category === 'finance' && (
                  <Input
                    label="Payment Due Date"
                    type="date"
                    value={doc.dueDate || ''}
                    onChange={(e) => setDoc({ ...doc, dueDate: e.target.value })}
                  />
                )}
                <Textarea
                  label="Executive Summary or Notes"
                  rows={2}
                  value={doc.summary || ''}
                  onChange={(e) => setDoc({ ...doc, summary: e.target.value })}
                  placeholder="Brief overview or cover remarks..."
                />
              </div>

              {/* Recipient / Client Entity */}
              {doc.category !== 'certificates' && (
                <div className="space-y-3 pb-4 border-b border-paper-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                    Recipient / Client Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Client Contact Name"
                      value={doc.clientName || ''}
                      onChange={(e) => setDoc({ ...doc, clientName: e.target.value })}
                      placeholder="e.g. Sarah Jenkins"
                    />
                    <Input
                      label="Company Name"
                      value={doc.clientCompany || ''}
                      onChange={(e) => setDoc({ ...doc, clientCompany: e.target.value })}
                      placeholder="e.g. Northwind Enterprises"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Email Address"
                      value={doc.clientEmail || ''}
                      onChange={(e) => setDoc({ ...doc, clientEmail: e.target.value })}
                      placeholder="client@example.com"
                    />
                    <Input
                      label="Physical Address / Location"
                      value={doc.clientAddress || ''}
                      onChange={(e) => setDoc({ ...doc, clientAddress: e.target.value })}
                      placeholder="City, State, Country"
                    />
                  </div>
                </div>
              )}

              {/* Certificate Specific Fields */}
              {doc.category === 'certificates' && (
                <div className="space-y-3 pb-4 border-b border-paper-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                    Certificate Details
                  </h4>
                  <Input
                    label="Recipient Full Name"
                    value={doc.recipientName || ''}
                    onChange={(e) => setDoc({ ...doc, recipientName: e.target.value })}
                  />
                  <Input
                    label="Award / Certification Title"
                    value={doc.awardTitle || ''}
                    onChange={(e) => setDoc({ ...doc, awardTitle: e.target.value })}
                  />
                </div>
              )}

              {/* Line Items Table (Invoices & Proposals) */}
              {doc.lineItems && (
                <div className="space-y-3 pb-4 border-b border-paper-border">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                      Line Items & Pricing Table
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddLineItem}
                      leftIcon={<Plus className="w-3 h-3" />}
                      className="text-xs h-7"
                    >
                      Add Row
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {doc.lineItems.map((item, idx) => (
                      <div key={item.id} className="p-3 rounded-xl border border-paper-border bg-paper-subtle/50 space-y-2 hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveLineItem(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded text-slate-400 hover:text-ink disabled:opacity-30 disabled:pointer-events-none"
                              title="Move up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveLineItem(idx, 'down')}
                              disabled={idx === (doc.lineItems?.length || 1) - 1}
                              className="p-1 rounded text-slate-400 hover:text-ink disabled:opacity-30 disabled:pointer-events-none"
                              title="Move down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                            placeholder="Deliverable or item description"
                            className="flex-1 text-xs font-semibold bg-white border border-paper-border rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-forest"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs items-end pt-1">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Quantity</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full text-xs bg-white border border-paper-border rounded-lg px-2 py-1 mt-0.5 focus:outline-hidden focus:ring-1 focus:ring-forest font-mono"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Rate ({getCurrencySymbol(doc.currency)})</span>
                            <input
                              type="number"
                              min="0"
                              step="10"
                              value={item.rate}
                              onChange={(e) => handleUpdateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                              className="w-full text-xs bg-white border border-paper-border rounded-lg px-2 py-1 mt-0.5 focus:outline-hidden focus:ring-1 focus:ring-forest font-mono"
                            />
                          </div>
                          <div className="text-right pb-1">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Line Total</span>
                            <span className="font-mono font-bold text-ink text-xs">
                              {formatCurrency((Number(item.quantity) || 0) * (Number(item.rate) || 0), doc.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calculations & Adjustments */}
                  <div className="bg-paper-subtle p-3.5 rounded-xl border border-paper-border space-y-3 mt-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Discount Rate (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={doc.discountPercent || 0}
                          onChange={(e) => {
                            setDoc({ ...doc, discountPercent: parseFloat(e.target.value) || 0 });
                            setSaveState('unsaved');
                          }}
                          className="w-full text-xs bg-white border border-paper-border rounded-lg px-2.5 py-1 font-mono"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tax / VAT Rate (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={doc.taxPercent || 0}
                          onChange={(e) => {
                            setDoc({ ...doc, taxPercent: parseFloat(e.target.value) || 0 });
                            setSaveState('unsaved');
                          }}
                          className="w-full text-xs bg-white border border-paper-border rounded-lg px-2.5 py-1 font-mono"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-paper-border space-y-1 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal:</span>
                        <span className="font-mono font-medium">{formatCurrency(doc.subtotal || 0, doc.currency)}</span>
                      </div>
                      {(doc.discountTotal || 0) > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Discount ({doc.discountPercent}%):</span>
                          <span className="font-mono font-medium">-{formatCurrency(doc.discountTotal || 0, doc.currency)}</span>
                        </div>
                      )}
                      {(doc.taxTotal || 0) > 0 && (
                        <div className="flex justify-between text-slate-500">
                          <span>Tax / VAT ({doc.taxPercent}%):</span>
                          <span className="font-mono font-medium">+{formatCurrency(doc.taxTotal || 0, doc.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-ink text-sm pt-1 border-t border-slate-200">
                        <span>Grand Total ({doc.currency || 'USD'}):</span>
                        <span className="font-mono text-forest">{formatCurrency(doc.total || 0, doc.currency)}</span>
                      </div>
                    </div>
                  </div>

                  {doc.category === 'finance' && (
                    <div className="pt-2">
                      <Input
                        label="Payment Terms / Wire Instructions"
                        value={doc.paymentTerms || ''}
                        onChange={(e) => setDoc({ ...doc, paymentTerms: e.target.value })}
                        placeholder="e.g. Net 30 Days. Wire to routing #..."
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Sections (Scope, Terms, Overview) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                    Document Text Sections
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddSection}
                    leftIcon={<Plus className="w-3 h-3" />}
                    className="text-xs h-7"
                  >
                    Add Section
                  </Button>
                </div>

                <div className="space-y-3">
                  {(doc.sections || []).map((sec, idx) => (
                    <div key={sec.id} className="p-3.5 rounded-xl border border-paper-border bg-white shadow-2xs space-y-2.5 hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-0.5 text-slate-400">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSection(idx, 'up')}
                            className="p-1 hover:text-ink disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-slate-100 cursor-pointer"
                            title="Move section up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (doc.sections || []).length - 1}
                            onClick={() => handleMoveSection(idx, 'down')}
                            className="p-1 hover:text-ink disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-slate-100 cursor-pointer"
                            title="Move section down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => handleUpdateSection(sec.id, 'title', e.target.value)}
                          placeholder="Section Title"
                          className="flex-1 text-xs font-bold text-ink bg-slate-50 focus:bg-white border border-paper-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(sec.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={sec.content}
                        onChange={(e) => handleUpdateSection(sec.id, 'content', e.target.value)}
                        placeholder="Section content..."
                        className="w-full text-xs text-slate-700 bg-slate-50 focus:bg-white border border-paper-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-forest resize-y leading-relaxed transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Brand & Style Controls */}
          {activeTab === 'style' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                  Document Brand Palette
                </h4>

                {/* 1-Click Preset Palettes */}
                <div>
                  <label className="text-xs font-semibold text-ink block mb-2">Preset Brand Palettes</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Curate Forest', primary: '#0F3D2E', accent: '#3A7D5F' },
                      { name: 'Midnight Obsidian', primary: '#0F172A', accent: '#334155' },
                      { name: 'Deep Marine', primary: '#0C4A6E', accent: '#0284C7' },
                      { name: 'Warm Terracotta', primary: '#7C2D12', accent: '#C2410C' },
                      { name: 'Burgundy Editorial', primary: '#4C0519', accent: '#9F1239' },
                    ].map(p => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setDoc(prev => ({
                            ...prev,
                            customBranding: { ...prev.customBranding, primaryColor: p.primary, accentColor: p.accent }
                          }));
                          setSaveState('unsaved');
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-paper-subtle hover:bg-slate-200/70 border border-paper-border transition-colors cursor-pointer"
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.primary }} />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink block mb-2">Primary Header Accent</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={doc.customBranding?.primaryColor || brandKit.primaryColor}
                      onChange={(e) => setDoc({
                        ...doc,
                        customBranding: { ...doc.customBranding, primaryColor: e.target.value }
                      })}
                      className="w-10 h-10 rounded border border-paper-border cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-mono font-semibold text-ink">
                        {doc.customBranding?.primaryColor || brandKit.primaryColor}
                      </span>
                      <p className="text-[11px] text-slate-500">Used for headers, borders, and dominant marks</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink block mb-2">Secondary Accent</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={doc.customBranding?.accentColor || brandKit.accentColor}
                      onChange={(e) => setDoc({
                        ...doc,
                        customBranding: { ...doc.customBranding, accentColor: e.target.value }
                      })}
                      className="w-10 h-10 rounded border border-paper-border cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-mono font-semibold text-ink">
                        {doc.customBranding?.accentColor || brandKit.accentColor}
                      </span>
                      <p className="text-[11px] text-slate-500">Used for bullets, sub-marks, and tags</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink block mb-2">Typography & Font Family</label>
                  <Select
                    value={doc.customBranding?.fontHeading || brandKit.fontHeading || 'Sora'}
                    onChange={(e) => {
                      setDoc({
                        ...doc,
                        customBranding: { ...doc.customBranding, fontHeading: e.target.value as any }
                      });
                      setSaveState('unsaved');
                    }}
                    options={[
                      { value: 'Sora', label: 'Sora — Geometric Modern Display' },
                      { value: 'Inter', label: 'Inter — Technical Neutral Standard' },
                      { value: 'Serif', label: 'Playfair / Georgia — Classic Editorial' },
                      { value: 'Mono', label: 'JetBrains / SF Mono — Monospaced Structure' },
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-paper-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                  Entity Brand Information
                </h4>
                <Input
                  label="Display Organization Name"
                  value={doc.customBranding?.companyName || brandKit.companyName}
                  onChange={(e) => setDoc({
                    ...doc,
                    customBranding: { ...doc.customBranding, companyName: e.target.value }
                  })}
                />
                <Input
                  label="Document Footer Text"
                  value={doc.customBranding?.footerText || brandKit.footerText}
                  onChange={(e) => setDoc({
                    ...doc,
                    customBranding: { ...doc.customBranding, footerText: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-paper-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                  Header & Footer Visibility
                </h4>
                <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doc.customBranding?.showLogoInHeader ?? brandKit.showLogoInHeader}
                    onChange={(e) => setDoc({
                      ...doc,
                      customBranding: { ...doc.customBranding, showLogoInHeader: e.target.checked }
                    })}
                    className="rounded border-paper-border text-forest focus:ring-forest"
                  />
                  <span>Display organization monogram in header</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doc.customBranding?.showPageNumbers ?? brandKit.showPageNumbers}
                    onChange={(e) => setDoc({
                      ...doc,
                      customBranding: { ...doc.customBranding, showPageNumbers: e.target.checked }
                    })}
                    className="rounded border-paper-border text-forest focus:ring-forest"
                  />
                  <span>Display page numbers in footer</span>
                </label>
              </div>
            </div>
          )}

          {/* Tab 3: Page Settings & Dimensions */}
          {activeTab === 'export' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                  Canvas Format & Dimensions
                </h4>
                <Select
                  label="Standard Page Format"
                  value={doc.pageSize}
                  onChange={(e) => setDoc({ ...doc, pageSize: e.target.value as any })}
                  options={[
                    { value: 'A4', label: 'ISO A4 (210 × 297 mm) — Global Standard' },
                    { value: 'Letter', label: 'US Letter (8.5 × 11 in) — North America' },
                  ]}
                />
                <Select
                  label="Orientation"
                  value={doc.orientation}
                  onChange={(e) => setDoc({ ...doc, orientation: e.target.value as any })}
                  options={[
                    { value: 'portrait', label: 'Portrait (Standard vertical reading)' },
                    { value: 'landscape', label: 'Landscape (Wide format / Certificates)' },
                  ]}
                />
                <Select
                  label="Document Margins"
                  value={doc.margin}
                  onChange={(e) => setDoc({ ...doc, margin: e.target.value as any })}
                  options={[
                    { value: 'compact', label: 'Compact Margins (High information density)' },
                    { value: 'standard', label: 'Standard Margins (Balanced elegance)' },
                    { value: 'relaxed', label: 'Relaxed Margins (Generous executive spacing)' },
                  ]}
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-paper-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                  Schema Portability
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportJson}
                    leftIcon={<Download className="w-3.5 h-3.5 text-forest" />}
                    className="text-xs flex-1"
                  >
                    Export JSON
                  </Button>
                  <label className="flex-1">
                    <span className="inline-flex items-center justify-center w-full h-8 px-3 text-xs rounded-md font-medium border border-paper-border hover:bg-paper-warm text-ink cursor-pointer">
                      <Upload className="w-3.5 h-3.5 mr-1.5 text-forest" /> Import JSON
                    </span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-forest-50 border border-forest-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-forest">
                  <CheckCircle className="w-4 h-4 text-forest" />
                  <span>Real Vector PDF Rendering</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  When you click <strong>Download PDF</strong>, CuratePDF rasterizes vector typography at 2× pixel density directly in your browser. All text, lines, and calculations remain pixel-crisp for printing or email attachments.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Live Document Preview Viewport */}
        <div className={`flex-1 overflow-auto relative flex flex-col transition-colors duration-200 ${
          deskTheme === 'dark' ? 'bg-[#151D28]' : 'bg-[#F1F5F9]'
        } ${mobileMode === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Subtle desk ambient texture */}
          {deskTheme === 'dark' ? (
            <>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-forest-500/10 blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-dot-grid-dark opacity-25 pointer-events-none" />
            </>
          ) : (
            <div className="absolute inset-0 bg-dot-grid opacity-35 pointer-events-none" />
          )}

          {/* Zoom & Viewport controls bar */}
          <div className={`sticky top-0 z-10 px-4 py-2 flex items-center justify-between border-b transition-colors ${
            deskTheme === 'dark'
              ? 'bg-[#1B2636]/95 backdrop-blur-md border-slate-700/60 text-slate-200'
              : 'bg-white/95 backdrop-blur-sm border-slate-200 text-slate-600 shadow-2xs'
          }`}>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className={`font-display font-semibold ${deskTheme === 'dark' ? 'text-white' : 'text-ink'}`}>Page 1</span>
              <span className="opacity-40 hidden sm:inline">•</span>
              <span className="uppercase text-[11px] font-mono opacity-75 hidden sm:inline">{doc.pageSize} • {doc.orientation}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Studio Desk Mode Switcher */}
              <button
                type="button"
                onClick={() => setDeskTheme(deskTheme === 'dark' ? 'light' : 'dark')}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  deskTheme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-750'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title={`Switch to ${deskTheme === 'dark' ? 'Light' : 'Dark'} Studio Desk`}
              >
                {deskTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-medium hidden sm:inline">{deskTheme === 'dark' ? 'Dark Desk' : 'Light Desk'}</span>
              </button>

              <div className={`flex items-center gap-1.5 p-1 rounded-lg border ${
                deskTheme === 'dark' ? 'bg-slate-800/90 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-600 shadow-2xs'
              }`}>
                <button
                  onClick={() => setZoom(prev => Math.max(0.25, Number((prev - 0.1).toFixed(2))))}
                  className="p-1 rounded hover:bg-white/20 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-medium px-1.5 min-w-[42px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(prev => Math.min(1.5, Number((prev + 0.1).toFixed(2))))}
                  className="p-1 rounded hover:bg-white/20 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(window.innerWidth < 640 ? 0.42 : window.innerWidth < 1024 ? 0.65 : 0.85)}
                  className="p-1 rounded hover:bg-white/20 text-[11px] font-semibold px-1"
                  title="Reset zoom to screen fit"
                >
                  Fit
                </button>
                <div className="h-3.5 w-px bg-slate-700 mx-0.5" />
                <button
                  type="button"
                  onClick={() => setIsFullscreenPreview(true)}
                  className="p-1 rounded hover:bg-white/20"
                  title="Fullscreen Preview"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Scroll Area */}
          <div className="flex-1 p-2 sm:p-6 lg:p-10 flex justify-center items-start overflow-auto relative z-0">
            <div className={`transition-all duration-300 ${
              deskTheme === 'dark'
                ? 'shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)]'
                : 'shadow-[0_20px_45px_rgba(15,23,42,0.12),0_0_0_1px_rgba(15,23,42,0.05)]'
            }`}>
              <LivePDFCanvas
                document={doc}
                brandKit={brandKit}
                zoom={zoom}
                showSafetyGuides={showSafetyGuides}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Starting Point / Change Layout Modal */}
      <Dialog
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
        title="Choose a Starting Point"
        description="Select a structured template layout or start with a clean document."
        maxWidth="2xl"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setIsTemplatePickerOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-paper-border">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={keepContentOnSwitch}
                onChange={(e) => setKeepContentOnSwitch(e.target.checked)}
                className="rounded border-paper-border text-forest focus:ring-forest cursor-pointer"
              />
              <span className="font-medium">Preserve my current client details & line items</span>
            </label>
          </div>

          <div className="p-3.5 rounded-xl border border-dashed border-paper-border hover:border-forest/50 bg-paper-subtle/50 flex items-center justify-between transition-colors">
            <div>
              <h4 className="font-display font-bold text-sm text-ink">Blank Document</h4>
              <p className="text-xs text-slate-500">Start with minimal fields and build your document from scratch</p>
            </div>
            <Button variant="primary" size="sm" onClick={handleStartBlank}>
              Start Blank
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handleSwitchTemplate(tpl.id, keepContentOnSwitch)}
                className="p-3.5 rounded-xl border border-paper-border hover:border-forest hover:bg-forest-50/20 cursor-pointer transition-all space-y-1.5 shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest font-display bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                    {tpl.category}
                  </span>
                  <span className="text-[11px] font-semibold text-forest group-hover:underline">Apply →</span>
                </div>
                <h5 className="font-display font-bold text-xs text-ink">{tpl.name}</h5>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{tpl.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Dialog>

      {/* Fullscreen Preview Modal */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex flex-col antialiased">
          <div className="h-14 bg-white/10 px-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3 text-white">
              <span className="font-display font-bold text-sm">{doc.title}</span>
              <span className="text-xs text-white/60">• Fullscreen Preview</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadPDF}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download PDF
              </Button>
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(false)}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Exit Fullscreen"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
            <LivePDFCanvas
              document={doc}
              brandKit={brandKit}
              zoom={1.0}
              showSafetyGuides={showSafetyGuides}
            />
          </div>
        </div>
      )}
    </div>
  );
};
