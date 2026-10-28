import React, { useMemo } from 'react';
import { ClaimRecord } from '../types';
import { X, AlertTriangle, CheckCircle2, Download, ShieldAlert, FileText, ArrowUpRight } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DiscrepancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ClaimRecord[];
  onResolveDiscrepancy: (itemId: string, newStatus: ClaimRecord['status']) => void;
}

export const DiscrepancyModal: React.FC<DiscrepancyModalProps> = ({
  isOpen,
  onClose,
  items,
  onResolveDiscrepancy,
}) => {
  if (!isOpen) return null;

  // Compute all discrepancies dynamically
  const flaggedItems = useMemo(() => {
    // 1. Duplicate detection
    const keyMap: Record<string, string[]> = {};
    items.forEach((it) => {
      const k = `${it.merchant_name.toLowerCase().trim()}_${it.receipt_date}_${it.amount}`;
      if (!keyMap[k]) keyMap[k] = [];
      keyMap[k].push(it.id);
    });

    return items
      .map((it) => {
        const issues: string[] = [];
        if (it.discrepancy) {
          issues.push(it.discrepancy);
        }

        // Duplicate check
        const k = `${it.merchant_name.toLowerCase().trim()}_${it.receipt_date}_${it.amount}`;
        if (keyMap[k] && keyMap[k].length > 1) {
          issues.push('Potential duplicate receipt: identical merchant, date, and amount');
        }

        // High amount check
        if (it.amount > 500 && !issues.some((i) => i.includes('500'))) {
          issues.push('Expense exceeds RM 500: requires manager signoff');
        }

        // SST check on dining/services
        if (
          (it.details.toLowerCase().includes('dining') || it.details.toLowerCase().includes('hotel')) &&
          (!it.tax_amount || it.tax_amount === 0)
        ) {
          issues.push('Commercial hospitality/dining receipt has 0.00 SST tax breakdown');
        }

        return {
          ...it,
          computedIssues: issues,
        };
      })
      .filter((it) => it.computedIssues.length > 0 || it.status === 'Flagged');
  }, [items]);

  const handleExportDiscrepancyExcel = () => {
    const rows = flaggedItems.map((it, idx) => ({
      'Item #': idx + 1,
      'Staff Name': it.staff_name,
      'Merchant / Vendor': it.merchant_name,
      'Transaction Date': it.receipt_date,
      'Account Code': it.code,
      'Category': it.details,
      'Amount (RM)': it.amount,
      'Identified Discrepancy / Exception': it.computedIssues.join(' | '),
      'Audit Status': it.status,
      'Action Required': 'Auditor verification against physical receipt',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Status: 'All claims cleared without discrepancies.' }]);
    ws['!cols'] = [
      { wch: 8 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 14 },
      { wch: 45 },
      { wch: 15 },
      { wch: 35 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Discrepancy Audit');
    XLSX.writeFile(wb, 'ClaimGenius_Discrepancies_Report.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Discrepancies &amp; Audit Exceptions Report
              </h3>
              <p className="text-xs text-slate-500">
                Automated policy checks, tax consistency, and duplicate detection
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportDiscrepancyExcel}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Report (.xlsx)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 space-y-4">
          {flaggedItems.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">
                Zero Discrepancies Detected
              </h4>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                All receipts match verified account codes, contain valid invoice details, and adhere to EMO Book Services financial policies.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>{flaggedItems.length} item(s)</strong> flagged for auditor attention or policy review.
                  </span>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-white px-2.5 py-0.5 rounded-full border border-amber-200">
                  Audit Attention
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Merchant &amp; Details</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4 min-w-[260px]">Flagged Discrepancy</th>
                      <th className="py-3 px-4 text-right">Audit Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {flaggedItems.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{it.merchant_name}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">{it.description}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {it.receipt_date}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          {it.code}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          RM {it.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <ul className="space-y-1">
                            {it.computedIssues.map((issue, idx) => (
                              <li key={idx} className="flex items-start text-[11px] text-rose-700">
                                <span className="mr-1 text-rose-500">•</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => onResolveDiscrepancy(it.id, 'Verified')}
                              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                              title="Approve exception and mark as verified"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onResolveDiscrepancy(it.id, 'Flagged')}
                              className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                              title="Keep flagged for employee clarification"
                            >
                              Hold
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>EMO Financial Control Standard V2026</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:text-slate-950 transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
