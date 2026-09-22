/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Building2, Calendar, Plus } from 'lucide-react';

interface HeaderProps {
  currentDate: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
  onOpenCreateAccount: () => void;
  onOpenJavaCode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  onOpenCreateAccount,
  onOpenJavaCode,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Bank Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-800 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            <Building2 className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              State Bank of India
            </h1>
            <p className="text-xs text-slate-500">
              Connaught Place Branch &bull; IFSC: <span className="font-mono font-medium text-slate-700">SBIN0001048</span>
            </p>
          </div>
        </div>

        {/* Controls: Date Simulator & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Simulated Banking Date */}
          <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 transition-colors px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-700" />
            <span className="text-slate-500 font-medium">Date:</span>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              title="Set simulated date to test daily withdrawal limits across different days"
            />
          </div>

          {/* Java OOP Code View Action */}
          {onOpenJavaCode && (
            <button
              id="btn-view-java-code"
              onClick={onOpenJavaCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              title="View Java OOP Source Code"
            >
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Java OOP Code</span>
            </button>
          )}

          {/* Open Account Action */}
          <button
            id="btn-create-account-header"
            onClick={onOpenCreateAccount}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Open Account</span>
          </button>
        </div>
      </div>
    </header>
  );
};
