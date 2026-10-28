export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff';
  token?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface ClaimRecord {
  id: string;
  staff_name: string;
  ic_no?: string;
  claim_month: string;
  code: string; // EMO official account code, e.g. 920-0000, 952-0001
  details: string; // Official category details
  merchant_name: string;
  receipt_date: string; // DD/MM/YYYY
  description: string; // Line items, remarks, invoice/order IDs
  amount: number; // In RM (MYR)
  tax_amount?: number;
  discrepancy?: string | null; // e.g. "Missing SST on hotel invoice", "Duplicate receipt detected"
  status: 'Pending Verification' | 'Verified' | 'Flagged' | 'Approved' | 'Rejected';
  source_file?: string;
  confidence?: number;
  auditNotes?: string[];
  receiptPreviewUrl?: string;
}

export interface UploadedDoc {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl: string;
  base64: string;
  pages?: number;
}

export interface SampleClaimPackage {
  id: string;
  title: string;
  employee: string;
  ic_no?: string;
  month: string;
  category: string;
  description: string;
  currency: string;
  totalAmount: number;
  docPreviewUrl: string;
  docType: 'pdf' | 'image';
  items: ClaimRecord[];
}
