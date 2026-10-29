import { DocumentData, BrandKitConfig } from '../../src/types';

/**
 * Renders document data and brand tokens into a complete, high-fidelity HTML document
 * engineered specifically for headless Chromium PDF rasterization.
 */
export function renderDocumentHtml(doc: DocumentData, brandKit: BrandKitConfig): string {
  const primaryColor = doc.customBranding?.primaryColor || brandKit.primaryColor || '#0F3D2E';
  const accentColor = doc.customBranding?.accentColor || brandKit.accentColor || '#3A7D5F';
  const companyName = doc.customBranding?.companyName || brandKit.companyName || 'CuratePDF Enterprise';
  const showLogo = doc.customBranding?.showLogoInHeader ?? brandKit.showLogoInHeader;
  const showPageNumbers = doc.customBranding?.showPageNumbers ?? brandKit.showPageNumbers;
  const footerText = doc.customBranding?.footerText || brandKit.footerText || `${companyName} • Confidential`;

  const isLandscape = doc.orientation === 'landscape';
  const isCertificate = doc.category === 'certificates';
  const pageSize = doc.pageSize || 'A4';
  const orientation = doc.orientation || 'portrait';

  // Margins
  const paddingMap = {
    compact: '24mm',
    standard: '30mm',
    relaxed: '38mm',
  };
  const pagePadding = paddingMap[doc.margin || 'standard'] || '30mm';

  // Line items math
  const lineItemsHtml = doc.lineItems && doc.lineItems.length > 0 ? `
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr style="background-color: ${primaryColor}; color: #ffffff;">
            <th style="width: 50%; text-align: left;">Description</th>
            <th style="width: 15%; text-align: center;">Qty</th>
            <th style="width: 15%; text-align: right;">Rate</th>
            <th style="width: 20%; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${doc.lineItems.map(item => `
            <tr>
              <td class="item-desc">${escapeHtml(item.description)}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">$${Number(item.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td class="text-right font-bold">$${(Number(item.quantity) * Number(item.rate)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals-area">
        <div class="totals-box">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>$${(doc.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          ${doc.taxTotal ? `
            <div class="totals-row">
              <span>Tax / VAT</span>
              <span>$${doc.taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          ` : ''}
          <div class="totals-row final-total" style="border-top: 2px solid #1f2937; color: ${primaryColor};">
            <span>Total (${doc.currency || 'USD'})</span>
            <span>$${(doc.total || doc.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      ${doc.paymentTerms ? `
        <div class="payment-terms">
          <strong>Payment Terms:</strong> ${escapeHtml(doc.paymentTerms)}
        </div>
      ` : ''}
    </div>
  ` : '';

  // Sections html
  const sectionsHtml = doc.sections && doc.sections.length > 0 ? `
    <div class="sections-container">
      ${doc.sections.map(sec => `
        <div class="section-block">
          <div class="section-title-wrap">
            <span class="section-bullet" style="background-color: ${accentColor};"></span>
            <h3 class="section-title">${escapeHtml(sec.title)}</h3>
          </div>
          <div class="section-body">${escapeHtml(sec.content).replace(/\n/g, '<br/>')}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  // Candidate skills html
  const skillsHtml = doc.category === 'recruitment' && doc.candidateSkills && doc.candidateSkills.length > 0 ? `
    <div class="skills-block">
      <h4 class="skills-heading">Core Competencies & Capabilities</h4>
      <div class="skills-list">
        ${doc.candidateSkills.map(s => `<span class="skill-badge">${escapeHtml(s)}</span>`).join('')}
      </div>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(doc.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  <style>
    @page {
      size: ${pageSize} ${orientation};
      margin: 0;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      color: #1F2937;
      background: #FFFFFF;
      font-size: 12px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .document-page {
      position: relative;
      width: 100%;
      min-height: 100vh;
      padding: ${pagePadding};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #FFFFFF;
    }

    .brand-top-strip {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background-color: ${primaryColor};
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 24px;
      border-bottom: 1px solid #E5E7EB;
      margin-bottom: 24px;
    }

    .company-logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .monogram-badge {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      background-color: ${primaryColor};
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Sora', sans-serif;
      font-weight: 700;
      font-size: 16px;
    }

    .company-name {
      font-family: 'Sora', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #0F3D2E;
    }

    .company-tagline {
      font-size: 11px;
      color: #6B7280;
    }

    .ref-block {
      text-align: right;
    }

    .category-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      background-color: ${primaryColor};
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .ref-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      color: #1F2937;
      margin-top: 6px;
    }

    .date-label {
      font-size: 11px;
      color: #6B7280;
    }

    .title-area {
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      gap: 24px;
    }

    .doc-title {
      font-family: 'Sora', sans-serif;
      font-size: 24px;
      font-weight: 800;
      color: #1F2937;
      line-height: 1.2;
    }

    .doc-summary {
      font-size: 12px;
      color: #4B5563;
      margin-top: 8px;
      max-width: 600px;
      line-height: 1.6;
    }

    .recipient-card {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 14px 18px;
      min-width: 220px;
      font-size: 11px;
    }

    .recipient-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #9CA3AF;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }

    .recipient-name {
      font-weight: 700;
      color: #1F2937;
      font-size: 12px;
    }

    .recipient-company {
      color: #374151;
    }

    .recipient-details {
      color: #6B7280;
      margin-top: 2px;
      white-space: pre-line;
    }

    /* Sections */
    .sections-container {
      margin-top: 18px;
      margin-bottom: 24px;
    }

    .section-block {
      margin-bottom: 18px;
    }

    .section-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .section-bullet {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .section-title {
      font-family: 'Sora', sans-serif;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #1F2937;
    }

    .section-body {
      padding-left: 14px;
      font-size: 11.5px;
      color: #374151;
      line-height: 1.6;
    }

    /* Data Table */
    .table-container {
      margin: 24px 0;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      border-radius: 6px;
      overflow: hidden;
      font-size: 11.5px;
    }

    .data-table th {
      padding: 10px 12px;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.05em;
    }

    .data-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #E5E7EB;
      color: #374151;
    }

    .item-desc {
      font-weight: 500;
      color: #1F2937;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }

    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .totals-box {
      width: 240px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 11.5px;
      color: #4B5563;
    }

    .final-total {
      font-size: 14px;
      font-weight: 800;
      margin-top: 6px;
      padding-top: 8px;
    }

    .payment-terms {
      margin-top: 16px;
      padding: 10px 14px;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 6px;
      font-size: 11px;
      color: #4B5563;
    }

    /* Skills block */
    .skills-block {
      margin: 16px 0;
      padding: 16px;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
    }

    .skills-heading {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #1F2937;
      margin-bottom: 8px;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .skill-badge {
      background: #FFFFFF;
      border: 1px solid #D1D5DB;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10.5px;
      font-weight: 500;
      color: #1F2937;
    }

    /* Certificate Variant */
    .certificate-wrap {
      border: 8px double ${accentColor};
      border-radius: 12px;
      padding: 48px;
      height: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .certificate-title {
      font-family: 'Sora', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: ${primaryColor};
      margin: 16px 0;
    }

    .recipient-awardee {
      font-family: 'Sora', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #0F3D2E;
      text-decoration: underline;
      text-decoration-color: #A7C957;
      margin: 20px 0;
    }

    .certificate-signoff {
      display: flex;
      justify-content: space-around;
      width: 100%;
      margin-top: 48px;
    }

    .sign-box {
      border-top: 1px solid #9CA3AF;
      padding-top: 8px;
      width: 180px;
      font-size: 10px;
      text-transform: uppercase;
      color: #6B7280;
    }

    /* Footer */
    .footer-bar {
      border-top: 1px solid #E5E7EB;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: #9CA3AF;
    }
  </style>
</head>
<body>
  <div class="document-page">
    <div class="brand-top-strip"></div>

    ${!isCertificate ? `
      <div>
        <div class="header-bar">
          <div class="company-logo">
            ${showLogo ? `
              <div class="monogram-badge">${escapeHtml(companyName.slice(0, 2).toUpperCase())}</div>
            ` : ''}
            <div>
              <div class="company-name">${escapeHtml(companyName)}</div>
              <div class="company-tagline">${escapeHtml(brandKit.tagline || brandKit.website)}</div>
            </div>
          </div>

          <div class="ref-block">
            <span class="category-badge">${escapeHtml(doc.category)}</span>
            <div class="ref-number">${escapeHtml(doc.referenceNumber)}</div>
            <div class="date-label">Date: ${escapeHtml(doc.date)}</div>
            ${doc.dueDate ? `<div class="date-label">Due: ${escapeHtml(doc.dueDate)}</div>` : ''}
          </div>
        </div>

        <div class="title-area">
          <div>
            <h1 class="doc-title">${escapeHtml(doc.title)}</h1>
            ${doc.summary ? `<p class="doc-summary">${escapeHtml(doc.summary)}</p>` : ''}
          </div>

          ${(doc.clientCompany || doc.clientName) ? `
            <div class="recipient-card">
              <div class="recipient-label">Prepared For</div>
              ${doc.clientName ? `<div class="recipient-name">${escapeHtml(doc.clientName)}</div>` : ''}
              ${doc.clientCompany ? `<div class="recipient-company">${escapeHtml(doc.clientCompany)}</div>` : ''}
              ${doc.clientEmail ? `<div class="recipient-details">${escapeHtml(doc.clientEmail)}</div>` : ''}
              ${doc.clientAddress ? `<div class="recipient-details">${escapeHtml(doc.clientAddress)}</div>` : ''}
            </div>
          ` : ''}
        </div>

        ${sectionsHtml}
        ${skillsHtml}
        ${lineItemsHtml}
      </div>
    ` : `
      <div class="certificate-wrap">
        <div style="text-transform: uppercase; letter-spacing: 0.2em; font-size: 11px; font-weight: 700; color: #6B7280;">
          Certificate of Excellence
        </div>
        <h1 class="certificate-title">${escapeHtml(doc.title)}</h1>
        <p style="font-size: 14px; font-style: italic; color: #4B5563;">This is proudly presented to</p>
        <div class="recipient-awardee">${escapeHtml(doc.recipientName || 'Alexandra Morgan')}</div>
        <p style="max-width: 600px; color: #4B5563; font-size: 12px; line-height: 1.7;">
          ${escapeHtml(doc.summary || 'For exceptional mastery and demonstrated excellence in document automation systems.')}
        </p>

        <div class="certificate-signoff">
          <div class="sign-box">
            <strong style="color: #1F2937; display: block; margin-bottom: 2px;">Sarah Jenkins</strong>
            Authorized Officer
          </div>
          <div class="sign-box">
            <strong style="color: #1F2937; display: block; margin-bottom: 2px;">${escapeHtml(doc.date)}</strong>
            Date of Verification
          </div>
        </div>
      </div>
    `}

    <div class="footer-bar">
      <div>${escapeHtml(footerText)}</div>
      <div>
        ${brandKit.email ? `<span>${escapeHtml(brandKit.email)} • </span>` : ''}
        ${showPageNumbers ? `<span>Page 1 of 1</span>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
