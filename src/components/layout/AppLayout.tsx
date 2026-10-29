import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Logo } from '../brand/Logo';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { ToastMessage } from '../../types';
import { ToastItem } from '../ui/Toast';

export interface AppLayoutProps {
  toasts?: ToastMessage[];
  onDismissToast?: (id: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  toasts = [], 
  onDismissToast = () => {} 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-paper-border shadow-2xs">
            <div className="w-7 h-7 rounded bg-forest text-white flex items-center justify-center font-display font-bold text-xs shrink-0">
              AC
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-ink truncate leading-tight">Acme Advisory Group</p>
              <p className="text-[10px] text-slate-500 truncate">curatepdf.site/acme</p>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="p-3">
          <Button 
            className="w-full justify-center shadow-xs" 
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/app/editor');
            }}
          >
            Create document
          </Button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {navSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-display">
                {sec.title}
              </p>
              <div className="space-y-0.5">
                {sec.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                      isActive
                        ? "bg-forest-50 text-forest font-semibold"
                        : "text-ink-subtle hover:text-ink hover:bg-slate-50"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Sidebar Footer */}
        <div className="p-3 border-t border-paper-border bg-paper-subtle/30 space-y-2">
          <NavLink
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-white hover:text-forest transition-colors border border-transparent hover:border-paper-border"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Public Website
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">curatepdf.site</span>
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
            <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-display font-semibold text-xs border border-forest-900 shadow-2xs">
              SJ
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismissToast} />
        ))}
      </div>
    </div>
  );
};
