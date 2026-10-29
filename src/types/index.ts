export type DocumentCategory = 
  | 'business' 
  | 'finance' 
  | 'reports' 
  | 'marketing' 
  | 'operations' 
  | 'personal' 
  | 'recruitment' 
  | 'certificates';

export type DocumentStatus = 'draft' | 'ready' | 'generated' | 'archived';

export interface BrandKitConfig {
  companyName: string;
  tagline: string;
  logoUrl?: string;
  primaryColor: string; // Deep Forest #0F3D2E default
  accentColor: string;  // Sage #3A7D5F or Mint #A7C957
  fontHeading: 'Sora' | 'Inter' | 'Serif' | 'Mono';
  fontBody: 'Inter' | 'System' | 'Serif';
  website: string;
  email: string;
  phone: string;
  address: string;
  footerText: string;
  showLogoInHeader: boolean;
  showPageNumbers: boolean;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxPercent?: number;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
}

export interface DocumentData {
  id: string;
  title: string;
  referenceNumber: string;
  templateId: string;
  category: DocumentCategory;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  date: string;
  dueDate?: string;
  
  // Entity info
  clientName?: string;
  clientCompany?: string;
  clientEmail?: string;
  clientAddress?: string;
  
  // Content blocks
  summary?: string;
  sections?: DocumentSection[];
  
  // Financial / table items
  lineItems?: LineItem[];
  subtotal?: number;
  taxTotal?: number;
  discountTotal?: number;
  total?: number;
  currency?: string;
  paymentTerms?: string;
  
  // Specific templates
  recipientName?: string;
  awardTitle?: string;
  candidateRole?: string;
  candidateExperienceYears?: number;
  candidateSkills?: string[];
  
  // Custom styling override per document
  customBranding?: Partial<BrandKitConfig>;
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margin: 'compact' | 'standard' | 'relaxed';
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: DocumentCategory;
  description: string;
  badge?: string;
  pageCount: number;
  defaultData: Partial<DocumentData>;
  previewAccent: string;
}

export interface BulkGenerationBatch {
  id: string;
  templateId: string;
  name: string;
  totalRecords: number;
  processedRecords: number;
  status: 'draft' | 'validating' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  records: Array<Record<string, any>>;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdDate: string;
  lastUsed: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}
