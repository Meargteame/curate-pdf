import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

export const MarketingLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Overview', to: '/' },
    { label: 'Templates', to: '/templates' },
    { label: 'Pricing', to: '/pricing' },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col antialiased">
      {/* Sticky Marketing Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-paper-border/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-[72px] flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 group">
            <Logo size="md" withBadge={true} />
          </NavLink>

          {/* Desktop Nav: Floating Segmented Island */}
          <nav className="hidden md:flex items-center gap-1 bg-paper-subtle/80 p-1 rounded-xl border border-paper-border/80 text-xs font-semibold">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-1.5 rounded-lg transition-all",
                    isActive
                      ? "bg-white text-forest shadow-2xs font-bold"
                      : "text-slate-600 hover:text-ink hover:bg-white/60"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right Header CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <NavLink
              to="/login"
              className="text-xs font-semibold text-slate-600 hover:text-forest transition-colors px-3 py-2 rounded-lg hover:bg-paper-subtle"
            >
              Sign in
            </NavLink>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/app')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="h-9 px-4 text-xs font-semibold shadow-xs"
            >
              Open Studio
            </Button>
          </div>

          {/* Mobile Right Controls: 1-Tap Studio button + Styled Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => navigate('/app')}
              className="h-8 px-2.5 rounded-lg bg-gradient-to-b from-forest to-[#0A2B20] text-white text-xs font-bold shadow-2xs hover:brightness-105 active:scale-95 transition-all flex items-center gap-1"
            >
              <span>Studio</span>
              <ArrowRight className="w-3 h-3 text-mint" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-paper-border shadow-2xs transition-all active:scale-95 flex items-center justify-center focus:outline-hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-forest" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Sheet */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-paper-border bg-white/98 backdrop-blur-xl px-4 py-5 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              {[
                { label: 'Overview', to: '/', desc: 'Core platform features and vector rendering' },
                { label: 'Templates', to: '/templates', desc: 'Browse 8 curated publication layouts', badge: '8 Ready' },
                { label: 'Pricing', to: '/pricing', desc: 'Flexible developer and enterprise tiers' },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center justify-between p-3 rounded-xl transition-all",
                    isActive ? "bg-forest-50 border border-forest-200/60" : "hover:bg-slate-50 border border-transparent"
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-bold text-forest bg-forest-100/70 px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </NavLink>
              ))}
            </div>

            <div className="pt-3 border-t border-paper-border flex flex-col gap-2">
              <NavLink
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-paper-border text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Sign in to your account
              </NavLink>
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/app');
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create your first PDF
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-forest-950 text-slate-300 border-t border-forest-900 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-forest-800/80">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <Logo variant="dark" size="lg" withBadge={true} />
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Professional PDFs, without the busywork. Create, customize, preview, and generate consistent documents using reusable templates and your own brand.
              </p>
              <div className="flex items-center gap-2 text-xs text-mint font-medium pt-2">
                <ShieldCheck className="w-4 h-4 text-mint" />
                <span>Client-side high-fidelity vector rendering</span>
              </div>
            </div>

            {/* Links columns */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-display mb-3">
                Product
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><NavLink to="/templates" className="hover:text-white transition-colors">Template Gallery</NavLink></li>
                <li><NavLink to="/app/editor" className="hover:text-white transition-colors">Document Editor</NavLink></li>
                <li><NavLink to="/app/brand-kit" className="hover:text-white transition-colors">Brand Kit Engine</NavLink></li>
                <li><NavLink to="/app/bulk" className="hover:text-white transition-colors">Bulk Generation</NavLink></li>
                <li><NavLink to="/app/developer" className="hover:text-white transition-colors">Developer API</NavLink></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-display mb-3">
                Document Types
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><NavLink to="/templates?cat=business" className="hover:text-white transition-colors">Business Proposals</NavLink></li>
                <li><NavLink to="/templates?cat=finance" className="hover:text-white transition-colors">Commercial Invoices</NavLink></li>
                <li><NavLink to="/templates?cat=reports" className="hover:text-white transition-colors">Executive Reports</NavLink></li>
                <li><NavLink to="/templates?cat=certificates" className="hover:text-white transition-colors">Certificates & Awards</NavLink></li>
                <li><NavLink to="/templates?cat=recruitment" className="hover:text-white transition-colors">Candidate Profiles</NavLink></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-display mb-3">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><NavLink to="/pricing" className="hover:text-white transition-colors">Plans & Pricing</NavLink></li>
                <li><NavLink to="/login" className="hover:text-white transition-colors">Sign In</NavLink></li>
                <li><NavLink to="/app" className="hover:text-white transition-colors">Enter Workspace</NavLink></li>
                <li className="pt-2 text-[11px] text-slate-500 font-mono">Domain: curatepdf.site</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} CuratePDF (curatepdf.site). Built for precision document automation.</p>
            <div className="flex items-center gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
