import React from 'react';
import { DocumentData, BrandKitConfig } from '../../types';
import { cn } from '../../utils/cn';
import { ShieldCheck, Award } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface LivePDFCanvasProps {
  document: DocumentData;
  brandKit: BrandKitConfig;
  zoom?: number; // 0.75, 1, 1.25
  showSafetyGuides?: boolean;
  className?: string;
  id?: string;
}

export const LivePDFCanvas: React.FC<LivePDFCanvasProps> = ({
  document: doc,
  brandKit,
  zoom = 1,
  showSafetyGuides = false,
  className,
  id = 'printable-document-canvas',
}) => {
  // Brand color overrides
  const primaryColor = doc.customBranding?.primaryColor || brandKit.primaryColor || '#0F3D2E';
  const accentColor = doc.customBranding?.accentColor || brandKit.accentColor || '#3A7D5F';
  const companyName = doc.customBranding?.companyName || brandKit.companyName || 'CuratePDF Org';
  const showLogo = doc.customBranding?.showLogoInHeader ?? brandKit.showLogoInHeader;
  const showPageNumbers = doc.customBranding?.showPageNumbers ?? brandKit.showPageNumbers;
  const footerText = doc.customBranding?.footerText || brandKit.footerText || `${companyName} • Confidential`;

  const isLandscape = doc.orientation === 'landscape';
  const isCertificate = doc.category === 'certificates';

  // Base canvas dimensions: A4 aspect ratio
  // In pixels at ~96 DPI: A4 Portrait is 794px x 1123px, Landscape is 1123px x 794px
  const baseWidth = isLandscape ? 1040 : 780;
  const minHeight = isLandscape ? 740 : 1080;

  return (
    <div 
      className={cn("transition-all duration-150 relative shrink-0 overflow-hidden", className)}
      style={{ 
        width: `${baseWidth * zoom}px`,
        height: `${minHeight * zoom}px`,
      }}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          width: `${baseWidth}px`,
          minHeight: `${minHeight}px`,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {/* Page 1 Canvas */}
        <div
          id={id}
          className={cn(
            "bg-white text-ink shadow-sheet border border-slate-200/80 rounded-sm relative flex flex-col justify-between print-page",
            doc.margin === 'compact' ? 'p-8 sm:p-10' : doc.margin === 'relaxed' ? 'p-14 sm:p-16' : 'p-10 sm:p-12'
          )}
          style={{
            width: `${baseWidth}px`,
            minHeight: `${minHeight}px`,
            boxSizing: 'border-box',
          }}
        >
        {/* Top Decorative Brand Accent Strip */}
        <div 
          className="absolute top-0 left-0 right-0 h-1.5" 
          style={{ backgroundColor: primaryColor }} 
        />

        {/* Certificate Border Design */}
        {isCertificate && (
          <div 
            className="absolute inset-4 border-4 border-double rounded-lg pointer-events-none"
            style={{ borderColor: accentColor }}
          />
        )}

        {/* Print Safety Margin Guides Overlay */}
        {showSafetyGuides && (
          <div className="absolute inset-8 sm:inset-10 border border-dashed border-emerald-500/60 pointer-events-none z-30 flex items-start justify-end p-2">
            <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50/90 px-1.5 py-0.5 rounded border border-emerald-300 shadow-2xs">
              Safe Margin Area (15mm)
            </span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          {!isCertificate ? (
            <div className="flex items-start justify-between pb-8 border-b border-slate-200">
              <div className="flex items-center gap-3">
                {showLogo && (
                  (doc.customBranding?.logoUrl || brandKit.logoUrl) ? (
                    <img 
                      src={doc.customBranding?.logoUrl || brandKit.logoUrl} 
                      alt={companyName}
                      className="h-10 max-w-[140px] object-contain rounded"
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-display font-bold text-lg shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {companyName.slice(0, 2).toUpperCase()}
                    </div>
                  )
                )}
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-ink font-display">{companyName}</h2>
                  <p className="text-[11px] text-slate-500">{brandKit.tagline || brandKit.website}</p>
                </div>
              </div>

              {/* Document Reference Block */}
              <div className="text-right">
                <span 
                  className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {doc.category.toUpperCase()}
                </span>
                <p className="text-sm font-semibold font-mono text-ink mt-1.5">{doc.referenceNumber}</p>
                <p className="text-xs text-slate-500">Date: {doc.date}</p>
                {doc.dueDate && <p className="text-xs text-slate-500">Due: {doc.dueDate}</p>}
              </div>
            </div>
          ) : (
            /* Certificate Header */
            <div className="text-center pt-8 pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest-50 border-2 border-forest/30 mb-4 text-forest">
                <Award className="w-9 h-9" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500 font-display">Official Certificate of Achievement</p>
              <h1 className="text-3xl font-display font-bold text-forest mt-2">{doc.title}</h1>
            </div>
          )}

          {/* Document Title & Client Info (For Standard Documents) */}
          {!isCertificate && (
            <div className="pt-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div>
                  <h1 className="text-2xl font-bold font-display tracking-tight text-ink">
                    {doc.title}
                  </h1>
                  {doc.summary && (
                    <p className="text-xs text-slate-600 mt-2 max-w-xl leading-relaxed">
                      {doc.summary}
                    </p>
                  )}
                </div>

                {/* Recipient / Client Block */}
                {(doc.clientCompany || doc.clientName) && (
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/70 text-xs min-w-[220px]">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Prepared For</p>
                    {doc.clientName && <p className="font-semibold text-ink mt-0.5">{doc.clientName}</p>}
                    {doc.clientCompany && <p className="text-slate-700">{doc.clientCompany}</p>}
                    {doc.clientEmail && <p className="text-slate-500 text-[11px] mt-0.5">{doc.clientEmail}</p>}
                    {doc.clientAddress && <p className="text-slate-500 text-[11px] whitespace-pre-line mt-0.5">{doc.clientAddress}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Body Sections (Proposals, Reports, MSA, Candidate) */}
          {doc.sections && doc.sections.length > 0 && (
            <div className="space-y-6 my-4">
              {doc.sections.map((sec, idx) => (
                <div key={sec.id || idx} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                    <h3 className="text-sm font-bold font-display text-ink uppercase tracking-wider">
                      {sec.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pl-3.5 whitespace-pre-line">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Candidate Profile Skills Block */}
          {doc.category === 'recruitment' && doc.candidateSkills && (
            <div className="my-4 p-4 rounded-lg bg-paper-subtle border border-paper-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-2">Core Competencies & Expertise</h4>
              <div className="flex flex-wrap gap-1.5">
                {doc.candidateSkills.map((skill, i) => (
                  <span 
                    key={i} 
                    className="text-[11px] font-medium px-2.5 py-1 rounded bg-white border border-slate-200 text-ink shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Line Items Table (Invoices, Quotations, Proposals) */}
          {doc.lineItems && doc.lineItems.length > 0 && (
            <div className="my-6">
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead style={{ backgroundColor: primaryColor }} className="text-white">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[11px]">Description</th>
                      <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[11px] text-center w-20">Qty</th>
                      <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[11px] text-right w-28">Rate</th>
                      <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[11px] text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {doc.lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-medium text-ink">{item.description}</td>
                        <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right">{formatCurrency(item.rate, doc.currency)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-ink">
                          {formatCurrency((item.quantity || 0) * (item.rate || 0), doc.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="flex justify-end mt-4">
                <div className="w-72 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(doc.subtotal || 0, doc.currency)}</span>
                  </div>
                  {doc.discountTotal !== undefined && doc.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount {doc.discountPercent ? `(${doc.discountPercent}%)` : ''}</span>
                      <span>-{formatCurrency(doc.discountTotal, doc.currency)}</span>
                    </div>
                  )}
                  {doc.taxTotal !== undefined && doc.taxTotal > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Tax {doc.taxPercent ? `(${doc.taxPercent}%)` : ''}</span>
                      <span>+{formatCurrency(doc.taxTotal, doc.currency)}</span>
                    </div>
                  )}
                  <div 
                    className="flex justify-between items-center pt-2 border-t-2 border-slate-900 font-bold text-sm text-ink"
                  >
                    <span>Total Due ({doc.currency || 'USD'})</span>
                    <span className="text-base" style={{ color: primaryColor }}>
                      {formatCurrency(doc.total || doc.subtotal || 0, doc.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              {doc.paymentTerms && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-[11px] text-slate-600">
                  <span className="font-semibold text-ink">Payment Terms: </span>
                  {doc.paymentTerms}
                </div>
              )}
            </div>
          )}

          {/* Certificate Body */}
          {isCertificate && (
            <div className="text-center my-auto py-8 px-12 space-y-4">
              <p className="text-sm text-slate-600 italic">This is proudly presented to</p>
              <h2 className="text-3xl font-display font-bold text-forest underline decoration-mint decoration-4 underline-offset-8">
                {doc.recipientName || 'Alexandra Morgan'}
              </h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed pt-2">
                {doc.summary}
              </p>
              
              <div className="pt-10 flex items-center justify-around">
                <div className="text-center w-48">
                  <div className="border-b border-slate-400 pb-1 mb-1 text-xs font-mono font-semibold text-ink">
                    Sarah Jenkins
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Authorized Officer</p>
                </div>

                {/* Digital Verification Seal */}
                <div className="flex flex-col items-center justify-center p-2 rounded-full border border-forest/30 bg-forest/5 text-forest">
                  <ShieldCheck className="w-7 h-7" />
                  <span className="text-[8px] font-mono font-bold mt-0.5">VERIFIED</span>
                </div>

                <div className="text-center w-48">
                  <div className="border-b border-slate-400 pb-1 mb-1 text-xs font-mono font-semibold text-ink">
                    {doc.date}
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Date of Issuance</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 mt-8 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
          <div>
            <span>{footerText}</span>
          </div>
          <div className="flex items-center gap-4">
            {brandKit.email && <span>{brandKit.email}</span>}
            {showPageNumbers && (
              <span className="font-mono text-slate-500 font-semibold">Page 1 of {doc.pageSize === 'A4' ? 1 : 1}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
