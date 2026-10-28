import React from 'react';
import { ClaimRecord } from '../types';
import { X, Printer, Download, BookOpen, CheckCircle } from 'lucide-react';
import { exportClaimsToExcel } from '../utils/excelExporter';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ClaimRecord[];
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, items }) => {
  if (!isOpen) return null;

  const employeeName = items[0]?.staff_name || 'Vigneshwaran A/L Suriyakumaran';
  const icNo = items[0]?.ic_no || '940512-14-5831';
  const claimMonth = items[0]?.claim_month || 'October 2026';

  const totalAmount = items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header - Not printed */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">
              EMO Book Services Sdn Bhd — Official Staff Claim Form Preview
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save as PDF
            </button>
            <button
              onClick={() => exportClaimsToExcel(items)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export Excel (.xlsx)
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans">
          {/* Company Title */}
          <div className="border-b-2 border-slate-900 pb-3 mb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-2xl tracking-tighter text-blue-800">EMO</span>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  EMO BOOK SERVICES SDN BHD
                </h1>
              </div>
              <p className="text-xs uppercase tracking-wider text-slate-600 font-bold mt-1">
                STAFF CLAIM FORM
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 border border-slate-300 rounded text-slate-800">
                FORM #EMO-CLM-2026
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Submission Date: {new Date().toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>

          {/* Header Metadata matching Section 3 */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-300 mb-6 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Staff Name
              </span>
              <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                {employeeName}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                IC No
              </span>
              <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">
                {icNo}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Claim For
              </span>
              <span className="font-extrabold text-blue-700 text-sm mt-0.5 block">
                {claimMonth}
              </span>
            </div>
          </div>

          {/* Itemized Table matching EMO claim layout */}
          <div className="border border-slate-400 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-200 text-slate-900 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 w-8 border-r border-slate-300">#</th>
                  <th className="py-2.5 px-3 min-w-[110px] border-r border-slate-300">CODE</th>
                  <th className="py-2.5 px-3 min-w-[160px] border-r border-slate-300">DETAILS</th>
                  <th className="py-2.5 px-3 min-w-[90px] border-r border-slate-300">DATE</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">REMARK (Vendor &amp; Description)</th>
                  <th className="py-2.5 px-3 min-w-[110px] text-right">AMOUNT (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {items.map((it, idx) => (
                  <tr key={it.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-2 px-3 text-slate-400 font-mono border-r border-slate-200">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-bold text-sky-800 border-r border-slate-200">{it.code}</td>
                    <td className="py-2 px-3 font-medium text-slate-800 border-r border-slate-200">{it.details}</td>
                    <td className="py-2 px-3 font-mono text-slate-600 border-r border-slate-200">{it.receipt_date}</td>
                    <td className="py-2 px-3 text-slate-700 border-r border-slate-200">
                      <span className="font-bold text-slate-900 mr-1.5">{it.merchant_name}:</span>
                      <span>{it.description}</span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {Number(it.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-200 font-bold border-t-2 border-slate-400">
                <tr>
                  <td colSpan={5} className="py-3 px-3 uppercase text-right text-slate-800 font-extrabold">
                    Total Amount (RM):
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-base text-emerald-800 font-black">
                    RM {totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Formal Sign-off Section for Emo Book Services */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-300 text-xs">
            <div className="space-y-6">
              <span className="font-bold text-slate-600 uppercase text-[10px] block">
                Claimed By:
              </span>
              <div className="h-12 border-b border-dashed border-slate-400" />
              <div>
                <p className="font-bold text-slate-900">{employeeName}</p>
                <p className="text-[10px] text-slate-500">Employee Signature &amp; Date</p>
              </div>
            </div>

            <div className="space-y-6">
              <span className="font-bold text-slate-600 uppercase text-[10px] block">
                Checked By:
              </span>
              <div className="h-12 border-b border-dashed border-slate-400" />
              <div>
                <p className="font-bold text-slate-900">Accounts &amp; Audit Dept</p>
                <p className="text-[10px] text-slate-500">Finance Auditor Sign-off</p>
              </div>
            </div>

            <div className="space-y-6">
              <span className="font-bold text-slate-600 uppercase text-[10px] block">
                Approved By:
              </span>
              <div className="h-12 border-b border-dashed border-slate-400" />
              <div>
                <p className="font-bold text-slate-900">Director / Managing Director</p>
                <p className="text-[10px] text-slate-500">Disbursement Approval</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
