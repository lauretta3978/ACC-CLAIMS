import React from 'react';
import { User, ClaimRecord } from '../types';
import { FileSpreadsheet, ShieldAlert, Users, LogIn, LogOut, Sparkles, BookOpen } from 'lucide-react';
import { exportClaimsToExcel } from '../utils/excelExporter';

interface HeaderProps {
  currentUser: User | null;
  items: ClaimRecord[];
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAdminUsers: () => void;
  onOpenDiscrepancy: () => void;
  onOpenSpec: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  items,
  onOpenAuth,
  onLogout,
  onOpenAdminUsers,
  onOpenDiscrepancy,
  onOpenSpec,
}) => {
  const discrepancyCount = items.filter((it) => it.discrepancy || it.status === 'Flagged').length;

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-lg shadow-slate-900/10 font-black tracking-tight text-sm">
              CG
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-950">
                  ClaimGenius
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  <Sparkles className="w-2.5 h-2.5 mr-1 text-slate-900" /> gemini-3.8-flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                EMO Book Services Sdn Bhd • Intelligent Expense Automation
              </p>
            </div>
          </div>

          {/* Navigation & Action Controls */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* EMO Account Codes Modal */}
            <button
              onClick={onOpenSpec}
              className="hidden md:inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Claim Categories
            </button>

            {/* Discrepancy Report Button */}
            <button
              onClick={onOpenDiscrepancy}
              className={`inline-flex items-center px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                discrepancyCount > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/80 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className={`w-3.5 h-3.5 mr-1.5 ${discrepancyCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>Discrepancy Report</span>
              {discrepancyCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-600 text-white rounded-full text-[10px] font-black">
                  {discrepancyCount}
                </span>
              )}
            </button>

            {/* One-Click Excel Generation */}
            <button
              onClick={() => exportClaimsToExcel(items)}
              className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-white bg-slate-950 hover:bg-slate-900 rounded-xl shadow-md shadow-slate-950/10 transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              <span>Download Excel</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Admin Management (if Admin) */}
            {currentUser?.role === 'Admin' && (
              <button
                onClick={onOpenAdminUsers}
                className="inline-flex items-center px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
                title="Admin User Management Dashboard"
              >
                <Users className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                <span className="hidden sm:inline">User Admin</span>
              </button>
            )}

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="flex items-center space-x-2 pl-1">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {currentUser.role}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
