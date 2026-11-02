import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Files, 
  FileCode, 
  Palette, 
  Layers, 
  Terminal, 
  Settings, 
  Plus, 
  Menu, 
  X, 
  ExternalLink, 
  ChevronRight, 
  Bell, 
  Sparkles, 
  LogOut, 
  User, 
  ShieldCheck, 
  ChevronDown,
  Search,
  Command,
  FileText
} from 'lucide-react';
import { Logo } from '../brand/Logo';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { cn } from '../../utils/cn';
import { ToastMessage, BrandKitConfig, UserProfile, DocumentData, TemplateDefinition } from '../../types';
import { ToastItem } from '../ui/Toast';
import { 
  getStoredBrandKit, 
  getStoredUserProfile, 
  getStoredDocuments, 
  getStoredTemplates 
} from '../../utils/storage';

export interface AppLayoutProps {
  toasts?: ToastMessage[];
  onDismissToast?: (id: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  toasts = [], 
  onDismissToast = () => {} 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKitConfig>(() => getStoredBrandKit());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredUserProfile());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const documents = getStoredDocuments();
  const templates = getStoredTemplates();

  // Keep brand kit and profile synced with workspace updates
  useEffect(() => {
    setUserProfile(getStoredUserProfile());
    fetch('/api/v1/brand-kit')
      .then(res => res.json())
      .then(json => {
        if (json.data) setBrandKit(json.data);
      })
      .catch(() => {});
  }, [location.pathname]);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isEditor = location.pathname.startsWith('/app/editor');

  const navSections = [
    {
      title: 'WORKSPACE',
      items: [
        { label: 'Overview', to: '/app', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
        { label: 'Documents', to: '/app/documents', icon: <Files className="w-4 h-4" /> },
        { label: 'Templates', to: '/app/templates', icon: <FileCode className="w-4 h-4" /> },
        { label: 'Brand Kit', to: '/app/brand-kit', icon: <Palette className="w-4 h-4" /> },
      ]
    },
    {
      title: 'AUTOMATION',
      items: [
        { label: 'Bulk Generation', to: '/app/bulk', icon: <Layers className="w-4 h-4" /> },
        { label: 'Developer Tools', to: '/app/developer', icon: <Terminal className="w-4 h-4" /> },
      ]
    },
    {
      title: 'PREFERENCES',
      items: [
        { label: 'Settings', to: '/app/settings', icon: <Settings className="w-4 h-4" /> },
      ]
    }
  ];

  // Helper to extract page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/app') return 'Workspace Overview';
    if (path.startsWith('/app/documents')) return 'Document Library';
    if (path.startsWith('/app/templates')) return 'Template Gallery';
    if (path.startsWith('/app/editor')) return 'Document Editor';
    if (path.startsWith('/app/brand-kit')) return 'Brand Kit';
    if (path.startsWith('/app/bulk')) return 'Bulk Generation';
    if (path.startsWith('/app/developer')) return 'Developer Tools';
    if (path.startsWith('/app/settings')) return 'Workspace Settings';
    return 'CuratePDF';
  };

  const getWorkspaceInitials = () => {
    const name = brandKit.companyName || userProfile.company || 'CuratePDF';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Filtered search results
  const matchingDocs = documents.filter(d => 
    d.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    d.referenceNumber.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    (d.clientCompany && d.clientCompany.toLowerCase().includes(globalSearchQuery.toLowerCase()))
  ).slice(0, 4);

  const matchingTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(globalSearchQuery.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-paper flex text-ink antialiased">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-paper-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-paper-border">
          <NavLink to="/" className="inline-block" onClick={() => setMobileMenuOpen(false)}>
            <Logo size="md" />
          </NavLink>
          <button 
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-ink"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Switcher / Info */}
        <div className="p-3 border-b border-paper-border bg-paper-subtle/40">
          <NavLink
            to="/app/brand-kit"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-2 rounded-lg bg-white border border-paper-border shadow-2xs hover:border-forest-300 transition-colors group"
          >
            <div 
              className="w-7 h-7 rounded text-white flex items-center justify-center font-display font-bold text-xs shrink-0 shadow-xs"
              style={{ backgroundColor: brandKit.primaryColor || '#0F3D2E' }}
            >
              {getWorkspaceInitials()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-ink truncate leading-tight group-hover:text-forest transition-colors">
                {brandKit.companyName || userProfile.company || 'CuratePDF Workspace'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-500 font-medium">Pro Workspace</span>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">
                {section.title}
              </h3>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                      isActive
                        ? "bg-forest-50 text-forest border border-forest-200/60 shadow-2xs"
                        : "text-slate-600 hover:text-ink hover:bg-paper-warm"
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Link */}
        <div className="p-3 border-t border-paper-border bg-paper-subtle/30">
          <NavLink
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-ink hover:bg-white border border-transparent hover:border-paper-border transition-all"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Public Website
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">curatepdf.site</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-paper-border sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-paper-warm"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <NavLink to="/app" className="hover:text-forest transition-colors">Workspace</NavLink>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-semibold text-ink font-display">{getPageTitle()}</span>
            </div>
          </div>

          {/* Center Search Trigger Bar */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-paper-border bg-paper-subtle/60 text-xs text-slate-400 hover:text-ink hover:bg-white transition-colors w-64 justify-between"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search docs, templates...</span>
            </span>
            <kbd className="font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex text-xs h-8"
              onClick={() => navigate('/app/templates')}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-sage" />}
            >
              Browse templates
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="text-xs h-8"
              onClick={() => navigate('/app/editor')}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New PDF
            </Button>
            
            <div className="h-5 w-px bg-paper-border hidden sm:block" />

            {/* User Profile Dropdown Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-hidden"
                aria-label="User profile options"
              >
                <div 
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center font-display font-semibold text-xs shadow-2xs border border-white"
                  style={{ backgroundColor: brandKit.primaryColor || '#0F3D2E' }}
                >
                  {getWorkspaceInitials()}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-paper-border py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-paper-border">
                    <p className="text-xs font-semibold text-ink truncate">{userProfile.name || brandKit.companyName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{userProfile.email || brandKit.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-forest bg-forest-50 px-1.5 py-0.5 rounded border border-forest-100">
                      <ShieldCheck className="w-3 h-3 text-sage" /> {userProfile.planStatus || 'Professional Trial'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/app/brand-kit'); }}
                      className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Palette className="w-3.5 h-3.5 text-slate-400" /> Brand Identity Kit
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/app/developer'); }}
                      className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Terminal className="w-3.5 h-3.5 text-slate-400" /> API Keys & Webhooks
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/app/settings'); }}
                      className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" /> Workspace Settings
                    </button>
                  </div>

                  <div className="pt-1 border-t border-paper-border">
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/login'); }}
                      className="w-full text-left px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Routed Page Content */}
        <main className={cn("flex-1", isEditor ? "h-[calc(100vh-4rem)] overflow-hidden p-0" : "p-4 sm:p-8")}>
          <Outlet />
        </main>
      </div>

      {/* Global Cmd+K Quick Search Dialog */}
      <Dialog
        isOpen={isSearchOpen}
        onClose={() => { setIsSearchOpen(false); setGlobalSearchQuery(''); }}
        title="Quick Find"
        description="Jump to documents, templates, or workspace pages instantly."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search documents, reference codes, templates..."
              className="w-full pl-9 pr-4 py-2 bg-paper-subtle rounded-xl text-sm border border-paper-border focus:bg-white focus:ring-2 focus:ring-forest focus:outline-hidden"
              autoFocus
            />
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {/* Matching Documents */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Documents ({matchingDocs.length})
              </p>
              {matchingDocs.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-1">No matching documents</p>
              ) : (
                <div className="space-y-1">
                  {matchingDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate(`/app/editor?id=${doc.id}`);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-forest-50/50 flex items-center justify-between text-xs transition-colors group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-forest shrink-0" />
                        <span className="font-semibold text-ink group-hover:text-forest truncate">{doc.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">{doc.referenceNumber}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Matching Templates */}
            <div className="pt-2 border-t border-paper-border">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Templates ({matchingTemplates.length})
              </p>
              <div className="space-y-1">
                {matchingTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate(`/app/editor?template=${tpl.id}`);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-forest-50/50 flex items-center justify-between text-xs transition-colors group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Sparkles className="w-3.5 h-3.5 text-sage shrink-0" />
                      <span className="font-semibold text-ink group-hover:text-forest truncate">{tpl.name}</span>
                    </div>
                    <span className="text-[10px] text-forest bg-forest-50 px-1.5 py-0.5 rounded capitalize shrink-0">{tpl.category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Floating Global Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={onDismissToast} />
          </div>
        ))}
      </div>
    </div>
  );
};