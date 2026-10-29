# CuratePDF (curatepdf.site)

> **Professional PDFs, without the busywork.**  
> Create, customize, preview, and generate consistent documents using reusable templates and your own brand.

---

## Overview

CuratePDF is a high-craft document automation and PDF generation SaaS platform built for small-to-medium businesses, agencies, independent consultants, finance operations, and engineering teams. It eliminates manual formatting software by providing structured, reusable templates with real-time vector previews and client-side high-DPI rendering.

---

## Brand Identity & Design System

### Color Palette
- **Primary:**
  - Deep Forest: `#0F3D2E`
  - Sage Green: `#3A7D5F`
  - Soft Mint: `#A7C957`
- **Neutrals:**
  - Warm Paper: `#F7F6F2`
  - Pure White: `#FFFFFF`
  - Ink: `#1F2937`
  - Slate: `#6B7280`
  - Border: `#E5E7EB`
  - Subtle Surface: `#F0F0E9`

### Typography Tokens
- **Brand & Headings:** `Sora`
- **Application UI, Forms, Body & Data:** `Inter`
- **Code & API:** `JetBrains Mono`

---

## Application Structure & Routes

### Marketing & Public Website
- `/` — Homepage featuring interactive real-time document transformation showcase, 5-step workflow, and multi-industry use cases.
- `/templates` — Searchable public template discovery gallery with full-page modal previews.
- `/pricing` — Honest, straightforward pricing tiers and transparent FAQs.
- `/login` & `/register` — Authentication prototype with instant demo workspace loading.

### Authenticated Workspace Shell (`/app`)
- `/app` — Workspace Overview with quick document creation launcher, activity metrics, onboarding checklist, and recent document list.
- `/app/documents` — Full Document Library with search, status filters, sorting, list/grid views, renaming dialogs, duplication, and deletion.
- `/app/templates` — Template Gallery with 8 categorized layouts (Business Proposals, Invoices, Quarterly Reports, SOWs, Candidate Dossiers, Certificates, Marketing Briefs, MSAs).
- `/app/editor` — Core Document Creation & Live Editor workflow with dynamic structured fields, line-item calculations, brand palette overrides, A4/Letter page settings, zoom controls, and genuine client-side vector PDF download (`html2canvas` + `jsPDF`) and native print support.
- `/app/brand-kit` — Centralized brand identity manager with real-time live preview of brand tokens applied to documents.
- `/app/bulk` — Guided 4-step bulk generation automation workflow (Template selection → Record import → Validation & field mapping → Batch execution with animated progress & zip download).
- `/app/developer` — Developer portal featuring secret API key generation and revocation, curl / Node.js / Python request snippets, and generation logs.
- `/app/settings` — Account profile, workspace details, notification toggles, and JSON workspace backup export.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run production build
npm run build

# Preview production build
npm run preview
```
