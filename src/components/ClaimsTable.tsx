import React, { useState, useMemo } from 'react';
import { ClaimRecord } from '../types';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Edit2,
  Check,
  Tag,
  Building,
} from 'lucide-react';
import { exportClaimsToExcel, exportClaimsToCsv, copyClaimsToTsv } from '../utils/excelExporter';
import { EMO_ACCOUNT_CODES } from '../data/sampleClaims';

interface ClaimsTableProps {
  items: ClaimRecord[];
  onUpdateItem: (updated: ClaimRecord) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: () => void;
  onBatchUpdateStatus: (status: ClaimRecord['status']) => void;
  onOpenEditModal: (item: ClaimRecord) => void;
}

export const ClaimsTable: React.FC<ClaimsTableProps> = ({
  items,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onOpenEditModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [codeFilter, setCodeFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Quick inline editing cell state
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof ClaimRecord } | null>(null);
  const [cellValue, setCellValue] = useState<string>('');

  // Unique codes present in data
  const availableCodes = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.code) set.add(it.code);
    });
    return Array.from(set);
  }, [items]);

  // Filtered rows
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchesSearch =
        it.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.details.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCode = codeFilter === 'ALL' || it.code === codeFilter;

      return matchesSearch && matchesCode;
    });
  }, [items, searchTerm, codeFilter]);

  // Total summary
  const totalAmount = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [filteredItems]);

  const handleCopyTsv = async () => {
    const success = await copyClaimsToTsv(filteredItems);
    if (success) {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const startInlineEdit = (id: string, field: keyof ClaimRecord, currentVal: any) => {
    setEditingCell({ id, field });
    setCellValue(String(currentVal ?? ''));
  };

  const saveInlineEdit = (item: ClaimRecord) => {
    if (!editingCell) return;
    const { field } = editingCell;
    let updatedVal: any = cellValue;
    if (field === 'amount') {
      updatedVal = parseFloat(cellValue) || 0.00;
    }
    onUpdateItem({
      ...item,
      [field]: updatedVal,
    });
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: ClaimRecord) => {
    if (e.key === 'Enter') {
      saveInlineEdit(item);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const toggleStatus = (item: ClaimRecord) => {
    const statusCycle: ClaimRecord['status'][] = [
      'Pending Verification',
      'Verified',
      'Approved',
      'Flagged',
    ];
    const currentIndex = statusCycle.indexOf(item.status);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    onUpdateItem({ ...item, status: nextStatus });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search & Code Filter */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendor, description, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <select
              value={codeFilter}
              onChange={(e) => setCodeFilter(e.target.value)}
              aria-label="Filter by EMO Account Code"
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Account Codes</option>
              {availableCodes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-1.5 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
              <span className="text-xs font-bold text-blue-800">
                {selectedIds.length} selected
              </span>
              <button
                onClick={() => {
                  selectedIds.forEach((id) => {
                    const found = items.find((it) => it.id === id);
                    if (found) onUpdateItem({ ...found, status: 'Verified' });
                  });
                  setSelectedIds([]);
                }}
                className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                Verify
              </button>
              <button
                onClick={() => {
                  selectedIds.forEach((id) => onDeleteItem(id));
                  setSelectedIds([]);
                }}
                className="px-2 py-0.5 text-[11px] font-semibold bg-rose-600 text-white rounded hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onAddItem}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Add Row
          </button>

          <button
            onClick={handleCopyTsv}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
            title="Copy all rows in TSV format for direct Excel/Google Sheets paste"
          >
            {copiedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span className="text-emerald-700">Copied TSV!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Copy for Sheets
              </>
            )}
          </button>

          <button
            onClick={() => exportClaimsToCsv(filteredItems)}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
            CSV
          </button>

          <button
            onClick={() => exportClaimsToExcel(filteredItems)}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs"
            title="Export official Emo Book Services Staff Claim Form (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            Export EMO Claim (.xlsx)
          </button>
        </div>
      </div>

      {/* Main Tabular View */}
      <div className="overflow-x-auto flex-1 max-h-[620px] relative">
        <table className="w-full text-left border-collapse text-xs">
          {/* Table Header matching Emo Book Services Staff Claim Form */}
          <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider text-[11px] font-bold sticky top-0 z-10 border-b border-slate-200 backdrop-blur-xs">
            <tr>
              <th className="py-3 px-3 w-8">
                <input
                  type="checkbox"
                  checked={
                    filteredItems.length > 0 && selectedIds.length === filteredItems.length
                  }
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 min-w-[140px]">Staff Name</th>
              <th className="py-3 px-3 min-w-[100px]">Claim Month</th>
              <th className="py-3 px-3 min-w-[120px]">CODE</th>
              <th className="py-3 px-3 min-w-[190px]">DETAILS</th>
              <th className="py-3 px-3 min-w-[170px]">Merchant / Vendor Name</th>
              <th className="py-3 px-3 min-w-[100px]">Transaction Date</th>
              <th className="py-3 px-3 min-w-[240px]">Description / Remarks</th>
              <th className="py-3 px-3 min-w-[110px] text-right">Amount (RM)</th>
              <th className="py-3 px-3 min-w-[130px]">Status</th>
              <th className="py-3 px-3 min-w-[80px] text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <p className="text-sm font-semibold">No expense records found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload Vicky's Claim PDF or choose a sample to populate Emo Book Services claims.
                  </p>
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isSelected ? 'bg-blue-50/60' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(item.id)}
                        aria-label={`Select row for ${item.merchant_name}`}
                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Staff Name */}
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {editingCell?.id === item.id && editingCell.field === 'staff_name' ? (
                        <input
                          autoFocus
                          type="text"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={() => saveInlineEdit(item)}
                          onKeyDown={(e) => handleKeyDown(e, item)}
                          className="w-full px-2 py-1 text-xs border border-blue-500 rounded bg-white shadow-inner focus:outline-none"
                        />
                      ) : (
                        <span
                          onClick={() => startInlineEdit(item.id, 'staff_name', item.staff_name)}
                          className="cursor-pointer hover:underline decoration-dotted"
                          title="Click to edit staff name"
                        >
                          {item.staff_name}
                        </span>
                      )}
                    </td>

                    {/* Claim Month */}
                    <td className="py-2.5 px-3 text-slate-600">
                      {item.claim_month}
                    </td>

                    {/* CODE */}
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-700">
                      <span className="inline-block px-2 py-0.5 rounded bg-sky-50 border border-sky-200">
                        {item.code}
                      </span>
                    </td>

                    {/* DETAILS */}
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {item.details}
                    </td>

                    {/* Merchant / Vendor Name */}
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {editingCell?.id === item.id && editingCell.field === 'merchant_name' ? (
                        <input
                          autoFocus
                          type="text"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={() => saveInlineEdit(item)}
                          onKeyDown={(e) => handleKeyDown(e, item)}
                          className="w-full px-2 py-1 text-xs border border-blue-500 rounded bg-white"
                        />
                      ) : (
                        <span
                          onClick={() => startInlineEdit(item.id, 'merchant_name', item.merchant_name)}
                          className="cursor-pointer hover:text-blue-600"
                        >
                          {item.merchant_name}
                        </span>
                      )}
                    </td>

                    {/* Transaction Date */}
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {item.receipt_date}
                    </td>

                    {/* Description / Remarks */}
                    <td className="py-2.5 px-3 text-slate-600 max-w-[280px]">
                      {editingCell?.id === item.id && editingCell.field === 'description' ? (
                        <input
                          autoFocus
                          type="text"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={() => saveInlineEdit(item)}
                          onKeyDown={(e) => handleKeyDown(e, item)}
                          className="w-full px-2 py-1 text-xs border border-blue-500 rounded bg-white"
                        />
                      ) : (
                        <span
                          onClick={() => startInlineEdit(item.id, 'description', item.description)}
                          className="cursor-pointer hover:text-slate-900 block truncate"
                          title={item.description}
                        >
                          {item.description}
                        </span>
                      )}
                    </td>

                    {/* Amount (RM) */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {editingCell?.id === item.id && editingCell.field === 'amount' ? (
                        <input
                          autoFocus
                          type="number"
                          step="0.01"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={() => saveInlineEdit(item)}
                          onKeyDown={(e) => handleKeyDown(e, item)}
                          className="w-20 px-1 py-0.5 text-xs text-right border border-blue-500 rounded bg-white font-mono"
                        />
                      ) : (
                        <span
                          onClick={() => startInlineEdit(item.id, 'amount', item.amount)}
                          className="cursor-pointer hover:text-blue-600"
                        >
                          {Number(item.amount).toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => toggleStatus(item)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                          item.status === 'Verified' || item.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : item.status === 'Flagged'
                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="Click to cycle status"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        {item.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onOpenEditModal(item)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit claim details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete line item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Footer with Corporate Totals */}
          {filteredItems.length > 0 && (
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900 sticky bottom-0">
              <tr>
                <td className="py-3 px-3"></td>
                <td className="py-3 px-3 uppercase text-[11px] text-slate-500">
                  TOTAL
                </td>
                <td className="py-3 px-3 text-slate-500"></td>
                <td className="py-3 px-3 text-slate-500"></td>
                <td className="py-3 px-3 text-slate-700">
                  {filteredItems.length} claim items
                </td>
                <td className="py-3 px-3 text-slate-500 text-[11px]">
                  EMO Book Services Staff Claim
                </td>
                <td className="py-3 px-3 text-slate-500"></td>
                <td className="py-3 px-3 text-right uppercase text-[11px] text-slate-600">
                  Total Reimbursable:
                </td>
                <td className="py-3 px-3 text-right font-mono text-sm text-emerald-700">
                  RM {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td colSpan={2} className="py-3 px-3 text-xs text-slate-500">
                  Verified for GL
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
