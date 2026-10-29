import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastMessage } from './types';

// Layouts
import { MarketingLayout } from './components/layout/MarketingLayout';
import { AppLayout } from './components/layout/AppLayout';

// Public Marketing Pages
import { Home } from './pages/marketing/Home';
import { TemplatesPublic } from './pages/marketing/TemplatesPublic';
import { Pricing } from './pages/marketing/Pricing';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Workspace App Pages
import { Overview } from './pages/app/Overview';
import { DocumentLibrary } from './pages/app/DocumentLibrary';
import { TemplateGallery } from './pages/app/TemplateGallery';
import { DocumentEditor } from './pages/app/DocumentEditor';
import { BrandKit } from './pages/app/BrandKit';
import { BulkGeneration } from './pages/app/BulkGeneration';
import { DeveloperTools } from './pages/app/DeveloperTools';
import { Settings } from './pages/app/Settings';

export function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { id, title, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website Routes */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/templates" element={<TemplatesPublic />} />
          <Route path="/pricing" element={<Pricing />} />
        </Route>

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated Workspace App Routes */}
        <Route element={<AppLayout toasts={toasts} onDismissToast={dismissToast} />}>
          <Route path="/app" element={<Overview onShowToast={showToast} />} />
          <Route path="/app/documents" element={<DocumentLibrary onShowToast={showToast} />} />
          <Route path="/app/templates" element={<TemplateGallery />} />
          <Route path="/app/editor" element={<DocumentEditor onShowToast={showToast} />} />
          <Route path="/app/brand-kit" element={<BrandKit onShowToast={showToast} />} />
          <Route path="/app/bulk" element={<BulkGeneration onShowToast={showToast} />} />
          <Route path="/app/developer" element={<DeveloperTools onShowToast={showToast} />} />
          <Route path="/app/settings" element={<Settings onShowToast={showToast} />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
