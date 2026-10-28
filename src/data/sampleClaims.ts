import { SampleClaimPackage } from '../types';

export const EMO_ACCOUNT_CODES = [
  { code: '400-00', details: 'Cash Purchase (for book / resell only)' },
  { code: '946-0000', details: 'License & Registration Fee' },
  { code: '939-0000', details: 'Medical Fee / Software Subscriptions' },
  { code: '920-0000', details: 'Petrol (RON95 / Diesel)' },
  { code: '921-0001', details: 'Parking' },
  { code: '921-0002', details: 'Toll' },
  { code: '910-0000', details: 'Printing & Stationery' },
  { code: '912-0000', details: 'Postage & Stamp' },
  { code: '926-0000', details: 'Staff Welfare' },
  { code: '906-0001', details: 'Upkeep of Motor Vehicle' },
  { code: '918-0000', details: 'Upkeep of Office' },
  { code: '617-0002', details: 'Packing Material (Bags / Plastic Bags)' },
  { code: '952-0001', details: 'Transportation (Delivery Expenses / Lalamove / Pos)' },
];

function generateEmoClaimDocSvg(employee: string, icNo: string, month: string, items: Array<{ code: string; details: string; merchant: string; date: string; desc: string; amount: string }>): string {
  const totalAmount = items.reduce((sum, it) => sum + parseFloat(it.amount), 0).toFixed(2);

  const rowsSvg = items.map((it, idx) => `
    <g transform="translate(30, ${260 + idx * 56})">
      <rect width="740" height="48" rx="4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.2" />
      <text x="15" y="22" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0F172A">${it.merchant}</text>
      <text x="15" y="38" font-family="Arial, sans-serif" font-size="10" fill="#64748B">${it.date} • ${it.desc}</text>
      <text x="380" y="22" font-family="Courier, monospace" font-size="11" font-weight="bold" fill="#0284C7">${it.code}</text>
      <text x="380" y="37" font-family="Arial, sans-serif" font-size="9" fill="#64748B">${it.details}</text>
      <text x="720" y="30" font-family="Courier, monospace" font-size="14" font-weight="bold" text-anchor="end" fill="#0F172A">RM ${it.amount}</text>
    </g>
  `).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 820" width="800" height="820">
    <rect width="800" height="820" fill="#FFFFFF" />
    
    <!-- Top Header: EMO Book Services Sdn Bhd -->
    <rect width="800" height="95" fill="#0F172A" />
    <rect x="30" y="24" width="46" height="46" rx="8" fill="#2563EB" />
    <text x="53" y="53" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle">EMO</text>
    <text x="90" y="44" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF">EMO BOOK SERVICES SDN BHD</text>
    <text x="90" y="62" font-family="Arial, sans-serif" font-size="11" fill="#94A3B8">CLAIMGENIUS AUTOMATED EXPENSE CLAIM &amp; DISCREPANCY AUDIT</text>
    <rect x="640" y="30" width="130" height="32" rx="4" fill="#1E293B" stroke="#334155" />
    <text x="705" y="51" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#38BDF8" text-anchor="middle">FORM #EMO-2026</text>

    <!-- Metadata Card -->
    <g transform="translate(30, 115)">
      <rect width="740" height="115" rx="6" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
      <line x1="260" y1="0" x2="260" y2="115" stroke="#F1F5F9" stroke-width="1" />
      <line x1="510" y1="0" x2="510" y2="115" stroke="#F1F5F9" stroke-width="1" />
      <line x1="0" y1="58" x2="740" y2="58" stroke="#F1F5F9" stroke-width="1" />

      <text x="20" y="24" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748B">STAFF NAME</text>
      <text x="20" y="45" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#0F172A">${employee}</text>

      <text x="280" y="24" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748B">IC NO</text>
      <text x="280" y="45" font-family="Courier, monospace" font-size="14" font-weight="bold" fill="#0F172A">${icNo}</text>

      <text x="530" y="24" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748B">CLAIM MONTH</text>
      <text x="530" y="45" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#2563EB">${month}</text>

      <text x="20" y="82" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748B">DEPARTMENT</text>
      <text x="20" y="101" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#0F172A">Operations &amp; Retail Book Fulfillment</text>

      <text x="280" y="82" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748B">TOTAL EXPENSE TRANSACTIONS</text>
      <text x="280" y="101" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0F172A">${items.length} verified receipts</text>

      <text x="530" y="82" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748B">TOTAL REIMBURSEMENT</text>
      <text x="530" y="101" font-family="Courier, monospace" font-size="16" font-weight="bold" fill="#059669">RM ${totalAmount}</text>
    </g>

    <text x="30" y="248" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#475569">MAPPED RECEIPTS &amp; INVOICES (OFFICIAL EMO ACCOUNT CODES)</text>

    <!-- Table of Receipts -->
    ${rowsSvg}

    <!-- Official Stamp Footer -->
    <g transform="translate(30, 735)">
      <rect width="740" height="60" rx="4" fill="#F8FAFC" stroke="#E2E8F0" />
      <text x="20" y="25" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#475569">AUDIT &amp; SETTLEMENT DECLARATION</text>
      <text x="20" y="42" font-family="Arial, sans-serif" font-size="11" fill="#64748B">Mapped to official EMO account codes. All receipts verified against general ledger requirements.</text>
      <circle cx="700" cy="30" r="20" fill="none" stroke="#2563EB" stroke-width="2" stroke-dasharray="2,2" />
      <text x="700" y="28" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#2563EB" text-anchor="middle">EMO</text>
      <text x="700" y="38" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#2563EB" text-anchor="middle">VERIFIED</text>
    </g>
  </svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export const SAMPLE_CLAIM_PACKAGES: SampleClaimPackage[] = [
  {
    id: 'vicky-claim-oct-2026',
    title: "Vicky's Claim - October 2026 (Consolidated EMO Claim Package)",
    employee: 'Vigneshwaran A/L Suriyakumaran',
    ic_no: '940512-14-5831',
    month: 'October 2026',
    category: 'Book Retail & Logistics Operations',
    description: "Consolidated package with fuel, Lalamove, Claude Pro AI subscription, book packing boxes, toll, and resale book acquisitions.",
    currency: 'MYR',
    totalAmount: 634.70,
    docType: 'image',
    docPreviewUrl: generateEmoClaimDocSvg(
      'Vigneshwaran A/L Suriyakumaran',
      '940512-14-5831',
      'October 2026',
      [
        { code: '920-0000', details: 'Petrol (RON95 / Diesel)', merchant: 'Shell Malaysia Trading', date: '03/10/2026', desc: 'Petrol RON95 fuel top-up for retail store delivery run', amount: '85.00' },
        { code: '952-0001', details: 'Transportation (Delivery Expenses / Lalamove / Pos)', merchant: 'Lalamove Malaysia Sdn Bhd', date: '06/10/2026', desc: 'Order #LLM-8921104 urgent textbook shipment to branch', amount: '46.00' },
        { code: '939-0000', details: 'Medical Fee / Software Subscriptions', merchant: 'Anthropic PBC (Claude Pro)', date: '10/10/2026', desc: 'Claude Pro AI copywriting tool monthly sub USD 20', amount: '94.80' },
        { code: '617-0002', details: 'Packing Material (Bags / Plastic Bags)', merchant: 'PackSmart Malaysia Sdn Bhd', date: '14/10/2026', desc: 'Heavy duty book bags, packing wraps & cartons', amount: '165.00' },
        { code: '952-0001', details: 'Transportation (Delivery Expenses / Lalamove / Pos)', merchant: 'Pos Laju / Pos Malaysia', date: '18/10/2026', desc: 'Tracking #ER98213459MY express book dispatch to Penang client', amount: '28.50' },
        { code: '910-0000', details: 'Printing & Stationery', merchant: 'Popular Book Co. (M) Sdn Bhd', date: '22/10/2026', desc: 'Thermal invoice rolls, barcode labels & permanent markers', amount: '62.40' },
        { code: '921-0002', details: 'Toll', merchant: 'Touch n Go eWallet (PLUS Toll)', date: '25/10/2026', desc: 'PLUS Highway toll during book distribution trip', amount: '35.00' },
        { code: '400-00', details: 'Cash Purchase (for book / resell only)', merchant: 'MPH Bookstores Sdn Bhd', date: '27/10/2026', desc: 'Special customer book order title acquisition for resale', amount: '118.00' },
      ]
    ),
    items: [
      {
        id: 'emo-v1',
        staff_name: 'Vigneshwaran A/L Suriyakumaran',
        ic_no: '940512-14-5831',
        claim_month: 'October 2026',
        code: '920-0000',
        details: 'Petrol (RON95 / Diesel)',
        merchant_name: 'Shell Malaysia Trading',
        receipt_date: '03/10/2026',
        description: 'Petrol RON95 fuel top-up for retail store delivery run (Receipt #SH-48912)',
        amount: 85.00,
        tax_amount: 0.00,
        status: 'Verified',
        source_file: "VICKY'S CLAIM.pdf",
      },
      {
        id: 'emo-v2',
        staff_name: 'Vigneshwaran A/L Suriyakumaran',
        ic_no: '940512-14-5831',
        claim_month: 'October 2026',
        code: '952-0001',
        details: 'Transportation (Delivery Expenses / Lalamove / Pos)',
        merchant_name: 'Lalamove Malaysia Sdn Bhd',
        receipt_date: '06/10/2026',
        description: 'Order #LLM-8921104 - Urgent textbook shipment dispatch to branch outlet',
        amount: 46.00,
        tax_amount: 0.00,
        status: 'Verified',
        source_file: "VICKY'S CLAIM.pdf",
      },
      {
        id: 'emo-v3',
        staff_name: 'Vigneshwaran A/L Suriyakumaran',
        ic_no: '940512-14-5831',
        claim_month: 'October 2026',
        code: '939-0000',
        details: 'Medical Fee / Software Subscriptions',
        merchant_name: 'Anthropic PBC (Claude Pro)',
        receipt_date: '10/10/2026',
        description: 'Claude Pro monthly subscription for automated catalogue copywriting (USD 20.00 settled in MYR)',
        amount: 94.80,
        tax_amount: 0.00,
        status: 'Verified',
        source_file: "VICKY'S CLAIM.pdf",
      },
      {
        id: 'emo-v4',
        staff_name: 'Vigneshwaran A/L Suriyakumaran',
        ic_no: '940512-14-5831',
        claim_month: 'October 2026',
        code: '617-0002',
        details: 'Packing Material (Bags / Plastic Bags)',
        merchant_name: 'PackSmart Malaysia Sdn Bhd',
        receipt_date: '14/10/2026',
        description: 'Heavy duty book bags, corrugated packing wraps & cartons (Inv #PS-7741)',
        amount: 165.00,
        tax_amount: 9.34,
        status: 'Verified',
        source_file: "VICKY'S CLAIM.pdf",
      },
      {
        id: 'emo-v5',
        staff_name: 'Vigneshwaran A/L Suriyakumaran',
        ic_no: '940512-14-5831',
        claim_month: 'October 2026',
        code: '952-0001',
        details: 'Transportation (Delivery Expenses / Lalamove / Pos)',
        merchant_name: 'Pos Laju / Pos Malaysia',
        receipt_date: '18/10/2026',
        description: 'Consignment Tracking #ER98213459MY express book orders dispatch to Penang school library',
        amount: 28.50,
        tax_amount: 0.00,
        status: 'Verified',
        source_file: "VICKY'S CLAIM.pdf",
      },
      {
        id: 'emo-v6',
        staff_name: 'Vigneshwaran A/L Suriyakumaran',
        ic_no: '940512-14-5831',
        claim_month: 'October 2026',
        code: '910-0000',
        details: 'Printing & Stationery',
        merchant_name: 'Popular Book Co. (M) Sdn Bhd',
        receipt_date: '22/10/2026',
        description: 'Thermal POS invoice receipt rolls, barcode sticker labels, packing tape & permanent markers',
        amount: 62.40,
        tax_amount: 3.53,
        status: 'Verified',
        source_file: "VICKY'S CLAIM.pdf",
      },
      {
        id: 'emo-v7',
        staff_name: 'Vigneshwaran A/L Suriyakumaran',
        ic_no: '940512-14-5831',
        claim_month: 'October 2026',
        code: '921-0002',
        details: 'Toll',
        merchant_name: 'Touch n Go eWallet (PLUS Toll)',
        receipt_date: '25/10/2026',
        description: 'PLUS Highway toll charges during corporate distributor drop-off',
        amount: 35.00,
        tax_amount: 0.00,
        status: 'Verified',
        source_file: "VICKY'S CLAIM.pdf",
      },
      {
        id: 'emo-v8',
        staff_name: 'Vigneshwaran A/L Suriyakumaran',
        ic_no: '940512-14-5831',
        claim_month: 'October 2026',
        code: '400-00',
        details: 'Cash Purchase (for book / resell only)',
        merchant_name: 'MPH Bookstores Sdn Bhd',
        receipt_date: '27/10/2026',
        description: 'Special customer book order title acquisition for direct resale (Receipt #MPH-0921)',
        amount: 118.00,
        tax_amount: 0.00,
        discrepancy: 'Customer cash purchase over RM 100 requires resale invoice attachment',
        status: 'Flagged',
        source_file: "VICKY'S CLAIM.pdf",
      },
    ],
  },
];
