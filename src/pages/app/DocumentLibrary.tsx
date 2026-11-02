import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Edit3, 
  Trash2, 
  Copy, 
  Download, 
  FileCode, 
  FileText,
  MoreVertical,
  Check,
  FolderOpen,
  Tag,
  Archive,
  X,
  ExternalLink
} from 'lucide-react';
import { DocumentData, DocumentCategory, DocumentStatus } from '../../types';
import { 
  getStoredDocuments, 
  saveStoredDocuments, 
  deleteStoredDocument, 
  upsertDocument 
} from '../../utils/storage';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { EmptyState } from '../../components/ui/Toast';

export const DocumentLibrary: React.FC<{ onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void }> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentData[]>(() => getStoredDocuments());
  
  // Dynamic fetch from server database on mount
  React.useEffect(() => {
    fetch('/api/v1/documents')
      .then(res => res.json())
      .then(json => {
        if (json.data && Array.isArray(json.data)) {
          setDocuments(json.data);
          saveStoredDocuments(json.data);
        }
      })
      .catch(() => {});
  }, []);
  
  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'date'>('updated');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Dialog states for Rename & Delete confirmation
  const [docToRename, setDocToRename] = useState<DocumentData | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [docToDelete, setDocToDelete] = useState<DocumentData | null>(null);

  // Bulk deletion handler
  const handleBulkDelete = async () => {
    if (selectedDocIds.length === 0) return;
    for (const id of selectedDocIds) {
      try {
        await fetch(`/api/v1/documents/${id}`, { method: 'DELETE' });
      } catch {}
    }
    const updated = documents.filter(d => !selectedDocIds.includes(d.id));
    saveStoredDocuments(updated);
    setDocuments(updated);
    if (onShowToast) {
      onShowToast('Documents Deleted', `Removed ${selectedDocIds.length} documents from workspace.`, 'info');
    }
    setSelectedDocIds([]);
  };

  // Bulk ZIP download handler
  const handleBulkDownloadZip = async () => {
    if (selectedDocIds.length === 0) return;
    if (onShowToast) onShowToast('Compiling ZIP', `Packaging ${selectedDocIds.length} documents into an archive...`, 'info');
    try {
      const selectedDocs = documents.filter(d => selectedDocIds.includes(d.id));
      const records = selectedDocs.map(d => ({
        client: d.clientCompany || d.clientName || 'Internal Client',
        reference: d.referenceNumber,
        amount: d.total ? `$${d.total.toLocaleString()}` : '$0.00',
        date: d.date,
        summary: d.title,
      }));
      const res = await fetch('/api/v1/jobs/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedDocs[0]?.templateId || 'tpl-invoice-minimal',
          records,
        }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `curatepdf_export_${new Date().toISOString().split('T')[0]}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        if (onShowToast) onShowToast('ZIP Downloaded', `Successfully downloaded archive of ${selectedDocIds.length} documents.`, 'success');
      }
    } catch {
      if (onShowToast) onShowToast('Download Failed', 'Could not assemble ZIP archive.', 'error');
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocIds.length === filteredDocs.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredDocs.map(d => d.id));
    }
  };

  // Filter logic
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.clientCompany && doc.clientCompany.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (doc.clientName && doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Action handlers
  const handleDuplicate = async (doc: DocumentData) => {
    const copy: DocumentData = {
      ...doc,
      id: `doc-${Date.now().toString(36)}`,
      title: `${doc.title} (Copy)`,
      referenceNumber: `${doc.referenceNumber}-COPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };
    try {
      await fetch('/api/v1/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copy),
      });
    } catch {}
    const updated = upsertDocument(copy);
    setDocuments(updated);
    if (onShowToast) {
      onShowToast('Document duplicated', `Created copy of "${doc.title}"`, 'success');
    }
  };

  const handleOpenRename = (doc: DocumentData) => {
    setDocToRename(doc);
    setNewTitle(doc.title);
  };

  const handleConfirmRename = async () => {
    if (!docToRename || !newTitle.trim()) return;
    const updatedDoc = { ...docToRename, title: newTitle.trim(), updatedAt: new Date().toISOString() };
    try {
      await fetch(`/api/v1/documents/${docToRename.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDoc),
      });
    } catch {}
    const updated = upsertDocument(updatedDoc);
    setDocuments(updated);
    setDocToRename(null);
    if (onShowToast) {
      onShowToast('Document renamed', `Updated title to "${newTitle.trim()}"`, 'success');
    }
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    try {
      await fetch(`/api/v1/documents/${docToDelete.id}`, { method: 'DELETE' });
    } catch {}
    const updated = deleteStoredDocument(docToDelete.id);
    setDocuments(updated);
    setDocToDelete(null);
    if (onShowToast) {
      onShowToast('Document deleted', `Removed document from library.`, 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Document Library</h1>
          <p className="text-xs text-slate-500">Manage, search, edit, and export your generated PDF documents</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/app/editor')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create document
        </Button>
      </div>

      {/* Quick Status Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Documents', count: documents.length },
          { id: 'ready', label: 'Ready for Review', count: documents.filter(d => d.status === 'ready').length },
          { id: 'generated', label: 'Generated PDFs', count: documents.filter(d => d.status === 'generated').length },
          { id: 'draft', label: 'Drafts', count: documents.filter(d => d.status === 'draft').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shrink-0 ${
              selectedStatus === tab.id
                ? 'bg-forest text-white font-semibold shadow-xs'
                : 'bg-white border border-paper-border text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              selectedStatus === tab.id ? 'bg-forest-900/50 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-card border border-paper-border shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-72">
          <Input
            placeholder="Search documents or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9.5 px-3 rounded-lg border border-paper-border bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="business">Business</option>
            <option value="finance">Finance</option>
            <option value="reports">Reports</option>
            <option value="marketing">Marketing</option>
            <option value="operations">Operations</option>
            <option value="certificates">Certificates</option>
            <option value="recruitment">Recruitment</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9.5 px-3 rounded-lg border border-paper-border bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="ready">Ready</option>
            <option value="generated">Generated</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9.5 px-3 rounded-lg border border-paper-border bg-white text-xs font-medium text-slate-700"
          >
            <option value="updated">Recently Updated</option>
            <option value="date">Issue Date</option>
            <option value="title">Title (A-Z)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-paper-subtle p-1 rounded-lg border border-paper-border">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-2xs text-forest' : 'text-slate-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-2xs text-forest' : 'text-slate-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Listing */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-6 h-6" />}
          title="No documents found"
          description={
            searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'Your document library is currently empty. Start by creating a document or choosing a template.'
          }
          action={
            searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/app/editor')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create First Document
              </Button>
            )
          }
        />
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="bg-white rounded-card border border-paper-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper-subtle border-b border-paper-border text-slate-500">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input 
                      type="checkbox"
                      checked={filteredDocs.length > 0 && selectedDocIds.length === filteredDocs.length}
                      onChange={handleSelectAll}
                      className="rounded border-paper-border text-forest focus:ring-forest cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Title & Recipient</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Category</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Reference</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Total</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Modified</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border text-slate-700">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-paper-subtle/40 transition-colors">
                    <td className="py-3.5 px-4 w-10">
                      <input 
                        type="checkbox"
                        checked={selectedDocIds.includes(doc.id)}
                        onChange={() => handleToggleSelect(doc.id)}
                        className="rounded border-paper-border text-forest focus:ring-forest cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-ink">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-forest-50 text-forest flex items-center justify-center shrink-0 border border-forest-100">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <NavLink
                            to={`/app/editor?id=${doc.id}`}
                            className="font-semibold text-ink hover:text-forest transition-colors block text-sm"
                          >
                            {doc.title}
                          </NavLink>
                          <span className="text-[11px] text-slate-400">
                            {doc.clientCompany || doc.clientName || 'Internal Document'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize">{doc.category}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{doc.referenceNumber}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={doc.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-ink">
                      {doc.total ? `$${doc.total.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            window.open(`/api/v1/documents/${doc.id}/pdf`, '_blank');
                            if (onShowToast) onShowToast('Downloading PDF', `Streaming real vector PDF for "${doc.title}"`, 'info');
                          }}
                          className="h-8 w-8 text-forest hover:bg-forest-50"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/app/editor?id=${doc.id}`)}
                          className="h-8 w-8 text-slate-500 hover:text-forest"
                          title="Open & Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(doc)}
                          className="h-8 w-8 text-slate-500 hover:text-ink"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenRename(doc)}
                          className="h-8 w-8 text-slate-500 hover:text-ink"
                          title="Rename Document"
                        >
                          <Tag className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDocToDelete(doc)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-card border border-paper-border overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              {/* Top Document Paper Header Visual */}
              <div 
                className="h-28 bg-paper-subtle p-4 border-b border-paper-border flex flex-col justify-between relative cursor-pointer"
                onClick={() => navigate(`/app/editor?id=${doc.id}`)}
              >
                <div className="h-1.5 w-full rounded-full bg-forest" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {doc.referenceNumber}
                    </span>
                    <Badge status={doc.status} size="sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="capitalize">{doc.category}</span>
                  <span className="font-mono">{doc.pageSize}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <NavLink
                    to={`/app/editor?id=${doc.id}`}
                    className="font-display font-bold text-base text-ink group-hover:text-forest transition-colors block leading-tight"
                  >
                    {doc.title}
                  </NavLink>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {doc.summary || `Document prepared for ${doc.clientCompany || doc.clientName || 'Internal Client'}`}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-paper-border flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Recipient</span>
                    <span className="font-semibold text-ink truncate max-w-[150px]">
                      {doc.clientCompany || doc.clientName || 'Internal'}
                    </span>
                  </div>

                  {doc.total ? (
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Document Total</span>
                      <span className="font-bold text-forest font-mono text-sm">${doc.total.toLocaleString()}</span>
                    </div>
                  ) : null}
                </div>

                <div className="pt-3 border-t border-paper-border flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        window.open(`/api/v1/documents/${doc.id}/pdf`, '_blank');
                        onShowToast?.('Downloading PDF', `Streaming vector PDF for "${doc.title}"`, 'info');
                      }}
                      className="h-7 w-7 text-forest hover:bg-forest-50"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(doc)}
                      className="h-7 w-7 text-slate-500 hover:text-ink"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/app/editor?id=${doc.id}`)}
                      className="h-7 px-2.5 text-xs text-forest font-semibold"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename Document Dialog */}
      <Dialog
        isOpen={!!docToRename}
        onClose={() => setDocToRename(null)}
        title="Rename Document"
        description="Enter a new display title for this document."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDocToRename(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmRename}>
              Save Name
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Document Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDocToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
              Delete Document
            </Button>
          </>
        }
      >
        {docToDelete && (
          <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs">
            <strong>"{docToDelete.title}"</strong> ({docToDelete.referenceNumber}) will be permanently removed.
          </div>
        )}
      </Dialog>

      {/* Floating Bulk Action Bar */}
      {selectedDocIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-ink text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="text-xs font-semibold">
            {selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="h-4 w-px bg-slate-700" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDownloadZip}
            className="h-7 text-xs bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700 hover:text-white"
            leftIcon={<Archive className="w-3.5 h-3.5 text-sage" />}
          >
            Download ZIP
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDelete}
            className="h-7 text-xs bg-transparent text-red-400 border-red-500/50 hover:bg-red-950/40 hover:text-red-300"
          >
            Delete Selected
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDocIds([])}
            className="h-7 text-xs text-slate-300 hover:text-white"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};
