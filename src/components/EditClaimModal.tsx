import React, { useState, useEffect } from 'react';
import { ClaimRecord } from '../types';
import { X, Check, Calendar, Building, Tag, FileText, User } from 'lucide-react';
import { EMO_ACCOUNT_CODES } from '../data/sampleClaims';

interface EditClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: ClaimRecord | null;
  onSave: (updated: ClaimRecord) => void;
}

export const EditClaimModal: React.FC<EditClaimModalProps> = ({
  isOpen,
  onClose,
  claim,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<ClaimRecord>>({
    staff_name: 'Vigneshwaran A/L Suriyakumaran',
    ic_no: '940512-14-5831',
    claim_month: 'October 2026',
    code: '920-0000',
    details: 'Petrol - RON95 / Diesel',
    merchant_name: '',
    receipt_date: '',
    description: '',
    amount: 0.00,
    status: 'Verified',
  });

  useEffect(() => {
    if (claim) {
      setFormData(claim);
    } else {
      setFormData({
        id: `emo-claim-${Date.now()}`,
        staff_name: 'Vigneshwaran A/L Suriyakumaran',
        ic_no: '940512-14-5831',
        claim_month: 'October 2026',
        code: '920-0000',
        details: 'Petrol - RON95 / Diesel',
        merchant_name: '',
        receipt_date: new Date().toLocaleDateString('en-GB'),
        description: '',
        amount: 0.00,
        status: 'Verified',
      });
    }
  }, [claim, isOpen]);

  if (!isOpen) return null;

  const handleCodeChange = (selectedCode: string) => {
    const match = EMO_ACCOUNT_CODES.find((c) => c.code === selectedCode);
    setFormData({
      ...formData,
      code: selectedCode,
      details: match ? match.details : formData.details,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.merchant_name || !formData.staff_name) {
      alert('Please fill in Staff Name and Merchant Name.');
      return;
    }

    onSave({
      id: formData.id || `emo-claim-${Date.now()}`,
      staff_name: formData.staff_name || 'Vigneshwaran A/L Suriyakumaran',
      ic_no: formData.ic_no || 'N/A',
      claim_month: formData.claim_month || 'October 2026',
      code: formData.code || '910-0000',
      details: formData.details || 'Printing & Stationery',
      merchant_name: formData.merchant_name || '',
      receipt_date: formData.receipt_date || '',
      description: formData.description || '',
      amount: Number(formData.amount || 0),
      status: formData.status || 'Verified',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">
              {claim?.id ? 'Edit EMO Claim Record' : 'Add EMO Expense Record'}
            </h3>
            <p className="text-xs text-slate-400">Emo Book Services Sdn Bhd Official Form</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Staff Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Staff Name *
              </label>
              <input
                type="text"
                required
                value={formData.staff_name || ''}
                onChange={(e) => setFormData({ ...formData, staff_name: e.target.value })}
                placeholder="e.g. Vigneshwaran A/L Suriyakumaran"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            {/* IC No */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                IC Number
              </label>
              <input
                type="text"
                value={formData.ic_no || ''}
                onChange={(e) => setFormData({ ...formData, ic_no: e.target.value })}
                placeholder="e.g. 940512-14-5831"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* Claim Month */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Claim Month &amp; Period
              </label>
              <input
                type="text"
                value={formData.claim_month || ''}
                onChange={(e) => setFormData({ ...formData, claim_month: e.target.value })}
                placeholder="e.g. October 2026"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Receipt Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Transaction Date (DD/MM/YYYY)
              </label>
              <input
                type="text"
                value={formData.receipt_date || ''}
                onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })}
                placeholder="DD/MM/YYYY"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* Merchant / Vendor Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Merchant / Vendor Name *
              </label>
              <input
                type="text"
                required
                value={formData.merchant_name || ''}
                onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                placeholder="e.g. Shell / Lalamove / Claude Pro"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Audit Status
              </label>
              <select
                value={formData.status || 'Verified'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Verified">Verified</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Approved">Approved</option>
                <option value="Flagged">Flagged</option>
              </select>
            </div>
          </div>

          {/* Account Code & Category Details Selector */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2.5">
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1 flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1 text-blue-600" />
                Official EMO Account Code &amp; Category *
              </label>
              <select
                value={formData.code || '920-0000'}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-blue-300 rounded-lg font-mono font-bold text-blue-900 cursor-pointer"
              >
                {EMO_ACCOUNT_CODES.map((acc) => (
                  <option key={acc.code} value={acc.code}>
                    {acc.code} — {acc.details}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Mapped Category Description (DETAILS)
              </label>
              <input
                type="text"
                readOnly
                value={formData.details || ''}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium"
              />
            </div>
          </div>

          {/* Description / Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Description / Remarks (Order ID, Invoice #, Item Purpose)
            </label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Order #LLM-8921104 book dispatch to client"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Amount (RM) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Total Amount in Malaysian Ringgit (RM)
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-500 text-xs">RM</span>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount ?? 0}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-28 px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-right"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Save to Claim Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
