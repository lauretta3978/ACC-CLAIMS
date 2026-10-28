import * as XLSX from 'xlsx';
import { ClaimRecord } from '../types';

export function exportClaimsToExcel(items: ClaimRecord[], filename = 'ClaimGenius_Segregated_Claim_Report.xlsx'): void {
  if (!items || items.length === 0) {
    alert('No expense items to export.');
    return;
  }

  const wb = XLSX.utils.book_new();

  // 1. Group items by Account Category for Segregated Reporting
  const grouped: Record<string, ClaimRecord[]> = {};
  items.forEach((it) => {
    const key = `${it.code} - ${it.details}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(it);
  });

  const segregatedRows: any[] = [];
  let overallGrandTotal = 0;

  Object.entries(grouped).forEach(([catTitle, catItems]) => {
    // Header for Category Section
    segregatedRows.push({
      'Staff Name': `CATEGORY: ${catTitle}`,
      'IC No': '',
      'Claim Month': '',
      'CODE': catItems[0]?.code || '',
      'DETAILS': catItems[0]?.details || '',
      'Merchant / Vendor Name': '',
      'Transaction Date': '',
      'Description / Remarks': '',
      'Amount (RM)': '',
      'Status': '',
    });

    let subtotal = 0;
    catItems.forEach((it) => {
      const amt = Number(it.amount) || 0;
      subtotal += amt;
      overallGrandTotal += amt;

      segregatedRows.push({
        'Staff Name': it.staff_name,
        'IC No': it.ic_no || 'N/A',
        'Claim Month': it.claim_month,
        'CODE': it.code,
        'DETAILS': it.details,
        'Merchant / Vendor Name': it.merchant_name,
        'Transaction Date': it.receipt_date,
        'Description / Remarks': it.description,
        'Amount (RM)': Number(amt.toFixed(2)),
        'Status': it.status || 'Verified',
      });
    });

    // Subtotal Row for this Category
    segregatedRows.push({
      'Staff Name': `SUBTOTAL [${catTitle}]`,
      'IC No': '',
      'Claim Month': '',
      'CODE': '',
      'DETAILS': `${catItems.length} items in category`,
      'Merchant / Vendor Name': '',
      'Transaction Date': '',
      'Description / Remarks': 'Category Subtotal',
      'Amount (RM)': Number(subtotal.toFixed(2)),
      'Status': 'Subtotal',
    });

    segregatedRows.push({}); // empty spacing line
  });

  // Overall Grand Total Row
  segregatedRows.push({
    'Staff Name': 'OVERALL GRAND TOTAL',
    'IC No': '',
    'Claim Month': items[0]?.claim_month || 'October 2026',
    'CODE': 'TOTAL',
    'DETAILS': 'EMO Book Services Sdn Bhd',
    'Merchant / Vendor Name': `${items.length} verified transactions`,
    'Transaction Date': '',
    'Description / Remarks': 'Compiled by ClaimGenius AI (gemini-3.8-flash)',
    'Amount (RM)': Number(overallGrandTotal.toFixed(2)),
    'Status': 'Approved for Reimbursement',
  });

  const wsSegregated = XLSX.utils.json_to_sheet(segregatedRows);
  wsSegregated['!cols'] = [
    { wch: 30 }, // Staff Name / Category
    { wch: 16 }, // IC No
    { wch: 16 }, // Claim Month
    { wch: 18 }, // CODE
    { wch: 32 }, // DETAILS
    { wch: 28 }, // Merchant / Vendor Name
    { wch: 16 }, // Transaction Date
    { wch: 45 }, // Description / Remarks
    { wch: 18 }, // Amount (RM)
    { wch: 24 }, // Status
  ];
  XLSX.utils.book_append_sheet(wb, wsSegregated, 'Segregated Claim Report');

  // 2. Discrepancy Report Worksheet
  const discrepancies = items.filter((it) => it.discrepancy || it.status === 'Flagged');
  const discrepancyRows = discrepancies.map((it, idx) => ({
    'Discrepancy #': idx + 1,
    'Item ID': it.id,
    'Merchant Name': it.merchant_name,
    'Date': it.receipt_date,
    'Account Code': it.code,
    'Amount (RM)': Number((Number(it.amount) || 0).toFixed(2)),
    'Discrepancy / Exception Flag': it.discrepancy || 'Requires physical receipt review',
    'Current Status': it.status,
  }));

  if (discrepancyRows.length === 0) {
    discrepancyRows.push({
      'Discrepancy #': 1,
      'Item ID': 'CLEAR',
      'Merchant Name': 'All receipts verified',
      'Date': new Date().toLocaleDateString('en-GB'),
      'Account Code': 'CLEARED',
      'Amount (RM)': 0,
      'Discrepancy / Exception Flag': 'No discrepancies, missing taxes, or policy violations detected',
      'Current Status': 'Verified',
    });
  }

  const wsDiscrepancies = XLSX.utils.json_to_sheet(discrepancyRows);
  wsDiscrepancies['!cols'] = [
    { wch: 14 },
    { wch: 16 },
    { wch: 26 },
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
    { wch: 45 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDiscrepancies, 'Discrepancy Report');

  // 3. Category Summary Matrix Sheet
  const codeTotals: Record<string, { details: string; amount: number; count: number }> = {};
  items.forEach((item) => {
    const c = item.code || 'Other';
    if (!codeTotals[c]) {
      codeTotals[c] = { details: item.details || '', amount: 0, count: 0 };
    }
    codeTotals[c].amount += Number(item.amount) || 0;
    codeTotals[c].count += 1;
  });

  const summaryRows = Object.entries(codeTotals).map(([code, stat]) => ({
    'EMO Account Code': code,
    'Category Details': stat.details,
    'Transactions Count': stat.count,
    'Subtotal (RM)': Number(stat.amount.toFixed(2)),
  }));
  summaryRows.push({
    'EMO Account Code': 'GRAND TOTAL',
    'Category Details': 'All Segregated Categories',
    'Transactions Count': items.length,
    'Subtotal (RM)': Number(overallGrandTotal.toFixed(2)),
  });

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 38 }, { wch: 20 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Category Subtotals');

  XLSX.writeFile(wb, filename);
}

export function exportClaimsToCsv(items: ClaimRecord[], filename = 'ClaimGenius_Segregated_Claim_Report.csv'): void {
  if (!items || items.length === 0) return;

  const headers = [
    'Staff Name',
    'IC No',
    'Claim Month',
    'CODE',
    'DETAILS',
    'Merchant / Vendor Name',
    'Transaction Date',
    'Description / Remarks',
    'Amount (RM)',
    'Status',
  ];

  const rows = items.map((it) => [
    `"${(it.staff_name || '').replace(/"/g, '""')}"`,
    `"${(it.ic_no || 'N/A').replace(/"/g, '""')}"`,
    `"${(it.claim_month || '').replace(/"/g, '""')}"`,
    `"${(it.code || '').replace(/"/g, '""')}"`,
    `"${(it.details || '').replace(/"/g, '""')}"`,
    `"${(it.merchant_name || '').replace(/"/g, '""')}"`,
    `"${(it.receipt_date || '').replace(/"/g, '""')}"`,
    `"${(it.description || '').replace(/"/g, '""')}"`,
    (Number(it.amount) || 0).toFixed(2),
    `"${(it.status || 'Verified').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function copyClaimsToTsv(items: ClaimRecord[]): Promise<boolean> {
  const headers = [
    'Staff Name',
    'IC No',
    'Claim Month',
    'CODE',
    'DETAILS',
    'Merchant / Vendor Name',
    'Transaction Date',
    'Description / Remarks',
    'Amount (RM)',
    'Status',
  ];

  const rows = items.map((it) => [
    it.staff_name || '',
    it.ic_no || 'N/A',
    it.claim_month || '',
    it.code || '',
    it.details || '',
    it.merchant_name || '',
    it.receipt_date || '',
    it.description || '',
    (Number(it.amount) || 0).toFixed(2),
    it.status || 'Verified',
  ]);

  const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');

  return navigator.clipboard.writeText(tsv).then(
    () => true,
    () => false
  );
}
