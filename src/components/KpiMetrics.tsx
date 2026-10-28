import React from 'react';
import { ClaimRecord } from '../types';
import { Receipt, ShieldCheck, Tag, CreditCard } from 'lucide-react';

interface KpiMetricsProps {
  items: ClaimRecord[];
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({ items }) => {
  const totalItems = items.length;
  const verifiedCount = items.filter((i) => i.status === 'Verified' || i.status === 'Approved').length;
  const pendingCount = items.filter((i) => i.status === 'Pending Verification').length;
  const flaggedCount = items.filter((i) => i.status === 'Flagged').length;

  const totalAmount = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

  // Group by Code
  const codeBreakdown: Record<string, number> = {};
  items.forEach((it) => {
    const c = it.code || 'Other';
    codeBreakdown[c] = (codeBreakdown[c] || 0) + (Number(it.amount) || 0);
  });
  const topCodes = Object.entries(codeBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  const verificationRate = totalItems > 0 ? Math.round((verifiedCount / totalItems) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Claim Reimbursable (RM) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:border-slate-900 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Claim Amount
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            RM
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            RM {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {items[0]?.staff_name || 'Staff Member'} ({items[0]?.claim_month || 'October 2026'})
        </p>
      </div>

      {/* 2. Top Account Codes */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:border-slate-900 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Primary Account Codes
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
        </div>
        {topCodes.length > 0 ? (
          <div className="space-y-1">
            {topCodes.map(([code, amt]) => (
              <div key={code} className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-sky-800 truncate max-w-[130px]">{code}</span>
                <span className="font-mono font-bold text-slate-800">RM {amt.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No account codes mapped yet</p>
        )}
      </div>

      {/* 3. Receipts & Invoices Processed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:border-slate-900 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Receipts Extracted
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {totalItems}
          </span>
          <span className="text-xs font-medium text-slate-500">transactions</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-600 mt-1">
          <span className="text-emerald-600 font-semibold">{verifiedCount} verified</span>
          <span>•</span>
          <span className="text-amber-600 font-medium">{pendingCount} pending</span>
          {flaggedCount > 0 && (
            <>
              <span>•</span>
              <span className="text-rose-600 font-medium">{flaggedCount} flagged</span>
            </>
          )}
        </div>
      </div>

      {/* 4. Audit Clearance Rate */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:border-slate-900 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Form Audit Clearance
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            verificationRate === 100
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-amber-50 text-amber-600'
          }`}>
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {verificationRate}%
          </span>
          <span className="text-xs font-medium text-slate-500">cleared for GL</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              verificationRate === 100 ? 'bg-emerald-500' : 'bg-blue-600'
            }`}
            style={{ width: `${verificationRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};
