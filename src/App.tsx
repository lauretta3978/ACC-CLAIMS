import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { KpiMetrics } from './components/KpiMetrics';
import { ClaimsTable } from './components/ClaimsTable';
import { DocumentViewer } from './components/DocumentViewer';
import { UploadModal } from './components/UploadModal';
import { EditClaimModal } from './components/EditClaimModal';
import { SpecModal } from './components/SpecModal';
import { ReportModal } from './components/ReportModal';
import { AuthModal } from './components/AuthModal';
import { AdminUsersModal } from './components/AdminUsersModal';
import { DiscrepancyModal } from './components/DiscrepancyModal';
import { ClaimRecord, UploadedDoc, User } from './types';
import { SAMPLE_CLAIM_PACKAGES } from './data/sampleClaims';
import { exportClaimsToExcel } from './utils/excelExporter';
import {
  Upload,
  FileSpreadsheet,
  Split,
  ShieldAlert,
  ArrowRight,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const initialSample = SAMPLE_CLAIM_PACKAGES[0];
  const [items, setItems] = useState<ClaimRecord[]>(initialSample.items);
  const [currentDoc, setCurrentDoc] = useState<UploadedDoc>({
    id: initialSample.id,
    name: `${initialSample.employee} - ${initialSample.month} Claim.pdf`,
    type: 'image/svg+xml',
    size: 45000,
    previewUrl: initialSample.docPreviewUrl,
    base64: initialSample.docPreviewUrl,
  });

  // User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr-admin-1',
    name: 'Finance Admin',
    email: 'admin@emobooks.com.my',
    role: 'Admin',
  });

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSpecOpen, setIsSpecOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminUsersOpen, setIsAdminUsersOpen] = useState(false);
  const [isDiscrepancyOpen, setIsDiscrepancyOpen] = useState(false);

  const [editingClaim, setEditingClaim] = useState<ClaimRecord | null>(null);
  const [showSplitView, setShowSplitView] = useState(true);

  // Categorized Subtotals
  const categorySubtotals = React.useMemo(() => {
    const map: Record<string, { code: string; details: string; amount: number; count: number }> = {};
    items.forEach((it) => {
      const key = `${it.code} - ${it.details}`;
      if (!map[key]) {
        map[key] = { code: it.code, details: it.details, amount: 0, count: 0 };
      }
      map[key].amount += Number(it.amount) || 0;
      map[key].count += 1;
    });
    return Object.values(map);
  }, [items]);

  const grandTotal = React.useMemo(() => {
    return items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [items]);

  const discrepanciesCount = React.useMemo(() => {
    return items.filter((it) => it.discrepancy || it.status === 'Flagged').length;
  }, [items]);

  // Handlers
  const handleClaimsExtracted = (newItems: ClaimRecord[], sourceDoc: UploadedDoc) => {
    setItems(newItems);
    setCurrentDoc(sourceDoc);
  };

  const handleUpdateItem = (updated: ClaimRecord) => {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleAddItem = () => {
    setEditingClaim(null);
    setIsEditOpen(true);
  };

  const handleOpenEditModal = (item: ClaimRecord) => {
    setEditingClaim(item);
    setIsEditOpen(true);
  };

  const handleSaveClaim = (claim: ClaimRecord) => {
    if (editingClaim) {
      handleUpdateItem(claim);
    } else {
      setItems((prev) => [claim, ...prev]);
    }
  };

  const handleBatchUpdateStatus = (status: ClaimRecord['status']) => {
    setItems((prev) => prev.map((it) => ({ ...it, status })));
  };

  const handleResolveDiscrepancy = (id: string, newStatus: ClaimRecord['status']) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, status: newStatus, discrepancy: newStatus === 'Verified' ? null : it.discrepancy } : it
      )
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Minimalist Header */}
      <Header
        currentUser={currentUser}
        items={items}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAdminUsers={() => setIsAdminUsersOpen(true)}
        onOpenDiscrepancy={() => setIsDiscrepancyOpen(true)}
        onOpenSpec={() => setIsSpecOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col">
        {/* Cinematic Hero & 3-Step Core Workflow Banner */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 border border-slate-200/80 text-slate-800 mb-4 shadow-2xs">
            <Sparkles className="w-3 h-3 mr-1.5 text-blue-600" />
            AI Expense Automation Engine • Google AI Studio <span className="font-mono font-bold ml-1">gemini-3.8-flash</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 mb-4 leading-tight">
            Streamlined Expense Claims. <br className="hidden sm:inline" />
            Zero Manual Data Entry.
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed max-w-2xl mx-auto">
            Ingest consolidated receipts, automatically segregate them according to EMO Book Services official account codes, detect discrepancies, and export audit-ready Excel reports.
          </p>

          {/* 3 Core Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-left">
            {/* Step 1 */}
            <div
              onClick={() => setIsUploadOpen(true)}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-900 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-slate-950 group-hover:text-white transition-colors flex items-center justify-center font-bold text-xs text-slate-800 mb-3">
                  1
                </div>
                <h3 className="font-extrabold text-sm text-slate-950 mb-1">
                  Upload Receipts
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Drag &amp; drop PDFs or images. Extracts vendors, dates, line items, and totals.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600 group-hover:text-slate-950">
                <span>Upload Document</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => exportClaimsToExcel(items)}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-900 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-slate-950 group-hover:text-white transition-colors flex items-center justify-center font-bold text-xs text-slate-800 mb-3">
                  2
                </div>
                <h3 className="font-extrabold text-sm text-slate-950 mb-1">
                  Download Excel File
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Segregated by official EMO categories with subtotals and overall grand total.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-600 group-hover:text-slate-950">
                <span>Export .xlsx</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setIsDiscrepancyOpen(true)}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-900 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-slate-950 group-hover:text-white transition-colors flex items-center justify-center font-bold text-xs text-slate-800 mb-3">
                  3
                </div>
                <h3 className="font-extrabold text-sm text-slate-950 mb-1 flex items-center justify-between">
                  <span>Discrepancies Report</span>
                  {discrepanciesCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {discrepanciesCount} flagged
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Highlights missing taxes, duplicate receipts, and unapproved policy exceptions.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-amber-700 group-hover:text-slate-950">
                <span>View Exceptions</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist Metrics Strip */}
        <KpiMetrics items={items} />

        {/* Official Segregated Subtotals Summary Matrix */}
        <div className="mb-8 p-6 rounded-3xl bg-slate-50/60 border border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                Official Category Segregation Summary
              </h3>
              <p className="text-xs text-slate-500">
                Subtotals mapped to official EMO claim codes for General Ledger posting
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Grand Total:</span>
              <span className="font-mono font-black text-lg text-slate-950">
                RM {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {categorySubtotals.map((cat) => (
              <div
                key={cat.code}
                className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-400 transition-colors"
              >
                <div className="font-mono font-bold text-[11px] text-blue-700 truncate">
                  {cat.code}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5" title={cat.details}>
                  {cat.details}
                </div>
                <div className="mt-2 font-mono font-black text-sm text-slate-900">
                  RM {cat.amount.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {cat.count} {cat.count === 1 ? 'item' : 'items'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Workspace Layout (Document Viewer + Live Datasheet) */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Audit &amp; Claims Workspace
              </h3>
              <span className="text-xs font-medium text-slate-500">
                ({items.length} itemized transactions)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSplitView(!showSplitView)}
                className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                  showSplitView
                    ? 'bg-slate-100 text-slate-900 border-slate-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Toggle side-by-side document preview"
              >
                <Split className="w-3.5 h-3.5 mr-1.5" />
                {showSplitView ? 'Hide Document' : 'Split View'}
              </button>

              <button
                onClick={() => setIsReportOpen(true)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-slate-950 rounded-xl transition-colors"
              >
                <FileCheck2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Print Voucher
              </button>
            </div>
          </div>

          {showSplitView && currentDoc.previewUrl ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Document Preview (5 cols) */}
              <div className="lg:col-span-5 sticky top-24">
                <DocumentViewer
                  currentPreviewUrl={currentDoc.previewUrl}
                  documentTitle={currentDoc.name}
                />
              </div>

              {/* Claims Table (7 cols) */}
              <div className="lg:col-span-7">
                <ClaimsTable
                  items={items}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                  onAddItem={handleAddItem}
                  onBatchUpdateStatus={handleBatchUpdateStatus}
                  onOpenEditModal={handleOpenEditModal}
                />
              </div>
            </div>
          ) : (
            <ClaimsTable
              items={items}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onAddItem={handleAddItem}
              onBatchUpdateStatus={handleBatchUpdateStatus}
              onOpenEditModal={handleOpenEditModal}
            />
          )}
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p>EMO Book Services Sdn Bhd • ClaimGenius Expense Automation Platform</p>
      </footer>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onClaimsExtracted={handleClaimsExtracted}
      />

      <EditClaimModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        claim={editingClaim}
        onSave={handleSaveClaim}
      />

      <SpecModal
        isOpen={isSpecOpen}
        onClose={() => setIsSpecOpen(false)}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        items={items}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => setCurrentUser(u)}
      />

      <AdminUsersModal
        isOpen={isAdminUsersOpen}
        onClose={() => setIsAdminUsersOpen(false)}
        currentUser={currentUser}
      />

      <DiscrepancyModal
        isOpen={isDiscrepancyOpen}
        onClose={() => setIsDiscrepancyOpen(false)}
        items={items}
        onResolveDiscrepancy={handleResolveDiscrepancy}
      />
    </div>
  );
}
