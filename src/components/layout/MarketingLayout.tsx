import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { Button } from '../ui/Button';

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
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-paper-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <Logo size="lg" />
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `transition-colors hover:text-forest ${
                    isActive ? 'text-forest font-semibold' : ''
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Header CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <NavLink
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-forest transition-colors px-2 py-1"
            >
              Sign in
            </NavLink>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/app')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create your first PDF
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-paper-border bg-white px-4 py-6 space-y-4 shadow-xl">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-slate-700 py-1"
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-700 py-1"
              >
                Sign in
              </NavLink>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/app');
                }}
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
              <Logo variant="dark" size="lg" />
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
