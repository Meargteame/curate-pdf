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
  ChevronRight, 
  Bell, 
  LogOut, 
  User, 
  ShieldCheck, 
  ChevronDown,
  Search,
  Command,
  FileText,
  Edit3,
  PanelLeftClose,
  PanelLeftOpen
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
  getStoredTemplates,
  DB_SYNC_EVENT,
  syncFromBackendDb
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
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('curate_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('curate_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKitConfig>(() => getStoredBrandKit());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredUserProfile());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [documents, setDocuments] = useState<DocumentData[]>(() => getStoredDocuments());
  const [templates, setTemplates] = useState<TemplateDefinition[]>(() => getStoredTemplates());

  // Initial 2-way sync with backend database
  useEffect(() => {
    syncFromBackendDb().then(data => {
      setDocuments(data.documents);
      setBrandKit(data.brandKit);
      setTemplates(data.templates);
      setUserProfile(data.userProfile);
    });
  }, []);

  // Reactive DB sync listener across all components & tabs
  useEffect(() => {
    const handleDbSync = () => {
      setDocuments(getStoredDocuments());
      setBrandKit(getStoredBrandKit());
      setTemplates(getStoredTemplates());
      setUserProfile(getStoredUserProfile());
    };

    window.addEventListener(DB_SYNC_EVENT, handleDbSync);
    window.addEventListener('storage', handleDbSync);
    return () => {
      window.removeEventListener(DB_SYNC_EVENT, handleDbSync);
      window.removeEventListener('storage', handleDbSync);
    };
  }, []);

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

  const navItems = [
    { 
      label: 'Overview', 
      to: '/app', 
      icon: <LayoutDashboard className="w-4 h-4" />, 
      end: true,
      badge: null,
      description: 'Workspace activity & metrics'
    },
    { 
      label: 'Documents', 
      to: '/app/documents', 
      icon: <Files className="w-4 h-4" />,
      badge: documents.length > 0 ? String(documents.length) : null,
      description: 'PDF archive & revision history'
    },
    { 
      label: 'Templates', 
      to: '/app/templates', 
      icon: <FileCode className="w-4 h-4" />,
      badge: templates.length > 0 ? String(templates.length) : null,
      description: '8 vector document schemas'
    },
    { 
      label: 'Document Editor', 
      to: '/app/editor', 
      icon: <Edit3 className="w-4 h-4" />,
      badge: 'Live',
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
      description: 'Interactive visual vector studio'
    },
    { 
      label: 'Brand Kit', 
      to: '/app/brand-kit', 
      icon: <Palette className="w-4 h-4" />,
      badge: null,
      description: 'Color tokens, typography & logo'
    },
    { 
      label: 'Bulk Generation', 
      to: '/app/bulk', 
      icon: <Layers className="w-4 h-4" />,
      badge: 'CSV',
      badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200/80',
      description: 'Batch spreadsheet merge engine'
    },
    { 
      label: 'Developer Tools', 
      to: '/app/developer', 
      icon: <Terminal className="w-4 h-4" />,
      badge: 'API',
      badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/80',
      description: 'REST API, SDKs & Webhooks'
    },
    { 
      label: 'Settings', 
      to: '/app/settings', 
      icon: <Settings className="w-4 h-4" />,
      badge: null,
      description: 'Workspace preferences & security'
    },
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
        "fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-paper-border flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0",
        isCollapsed ? "w-20" : "w-64",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Header */}
        <div className={cn(
          "h-16 flex items-center border-b border-paper-border px-4 transition-all shrink-0",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <NavLink 
            to="/" 
            className="inline-flex items-center focus:outline-hidden" 
            onClick={() => setMobileMenuOpen(false)}
            title="CuratePDF Home"
          >
            {isCollapsed ? (
              <Logo variant="icon" size="md" />
            ) : (
              <Logo size="md" />
            )}
          </NavLink>
          {!isCollapsed && (
            <div className="flex items-center gap-1">
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Collapse sidebar (⌘B)"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
              <button 
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-ink"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navItems.map((item) => (
            !isCollapsed ? (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                title={item.description}
                className={({ isActive }) => cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-forest-50/90 text-forest shadow-2xs font-bold"
                    : "text-slate-600 hover:text-ink hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 transition-transform group-hover:scale-105">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 font-mono",
                    item.badgeColor || "bg-slate-100 text-slate-600"
                  )}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ) : (
              <div key={item.to} className="relative group flex justify-center py-0.5">
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "w-11 h-10 rounded-xl flex items-center justify-center transition-all",
                    isActive
                      ? "bg-forest text-white shadow-xs"
                      : "text-slate-500 hover:text-ink hover:bg-slate-100"
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                </NavLink>

                {/* Sleek Floating Hover Popover / Tooltip */}
                <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col gap-0.5 px-3 py-1.5 bg-ink text-white rounded-lg shadow-xl z-50 pointer-events-none whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-150">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-white">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-300 font-normal">{item.description}</span>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Sleek Sidebar Footer */}
        <div className="p-3 border-t border-paper-border shrink-0">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1 text-slate-500">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    className="w-6 h-6 rounded-md text-white flex items-center justify-center font-display font-bold text-[10px] shrink-0 shadow-2xs"
                    style={{ backgroundColor: brandKit.primaryColor || '#0F3D2E' }}
                  >
                    {getWorkspaceInitials()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink truncate leading-tight">
                      {brandKit.companyName || userProfile.company || 'CuratePDF'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {userProfile.planStatus || 'Pro Workspace'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleCollapse}
                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-ink hover:bg-slate-100 transition-colors"
                title="Collapse sidebar (⌘B)"
              >
                <PanelLeftClose className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Collapse Sidebar</span>
                <kbd className="ml-auto font-mono text-[9px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded">⌘B</kbd>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-display font-bold text-xs shrink-0 shadow-2xs"
                style={{ backgroundColor: brandKit.primaryColor || '#0F3D2E' }}
                title={`${brandKit.companyName || userProfile.company} (${userProfile.planStatus || 'Pro'})`}
              >
                {getWorkspaceInitials()}
              </div>
              <button
                onClick={toggleCollapse}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-forest hover:bg-forest-50 transition-colors"
                title="Expand sidebar (⌘B)"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden transition-all duration-300 ease-in-out",
        isCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-paper-border sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 hover:bg-paper-warm"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={isCollapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-forest" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500">
              <NavLink to="/app" className="hover:text-forest transition-colors hidden xs:inline">Workspace</NavLink>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden xs:inline" />
              <span className="font-semibold text-ink font-display truncate max-w-[110px] xs:max-w-[180px] sm:max-w-none">{getPageTitle()}</span>
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
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-ink hover:bg-paper-warm"
              aria-label="Quick search"
              title="Search (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex text-xs h-8"
              onClick={() => navigate('/app/templates')}
              leftIcon={<FileCode className="w-3.5 h-3.5 text-forest" />}
            >
              Browse templates
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="text-xs h-8 px-2.5 sm:px-3"
              onClick={() => navigate('/app/editor')}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              <span className="hidden xs:inline">New </span>PDF
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
        <main className={cn("flex-1 min-w-0 w-full max-w-full", isEditor ? "h-[calc(100vh-4rem)] overflow-hidden p-0" : "p-4 sm:p-8")}>
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
                      <FileCode className="w-3.5 h-3.5 text-forest shrink-0" />
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