/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { BankAccount } from '../models/BankAccount';
import { PassbookPrinter } from '../models/PassbookPrinter';
import {
  Printer,
  Download,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { formatINR } from '../utils/indianCurrency';

interface PassbookViewProps {
  account: BankAccount;
  currentDate: Date;
}

export const PassbookView: React.FC<PassbookViewProps> = ({ account, currentDate }) => {
  // Default to fromDate = 60 days ago, toDate = today
  const defaultTo = currentDate.toISOString().split('T')[0];
  const sixtyDaysAgo = new Date(currentDate);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const defaultFrom = sixtyDaysAgo.toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState<string>(defaultFrom);
  const [toDate, setToDate] = useState<string>(defaultTo);
  const [filterType, setFilterType] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Generate Statement using PassbookPrinter (Operation g)
  const statement = useMemo(() => {
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : undefined;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : undefined;
    return PassbookPrinter.generateStatement(account, from, to);
  }, [account, fromDate, toDate, account.transactions.length]);

  // Secondary search / type filtering on entries
  const filteredEntries = useMemo(() => {
    return statement.entries.filter((entry) => {
      if (filterType === 'DEBIT' && !entry.debit) return false;
      if (filterType === 'CREDIT' && !entry.credit) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesParticulars = entry.particulars.toLowerCase().includes(query);
        const matchesRef = entry.referenceNo.toLowerCase().includes(query);
        const matchesDate = entry.date.includes(query);
        if (!matchesParticulars && !matchesRef && !matchesDate) return false;
      }
      return true;
    });
  }, [statement.entries, filterType, searchQuery]);

  // Quick preset handlers
  const handlePreset = (days: number | 'all') => {
    if (days === 'all') {
      const firstTxn = account.transactions[0];
      setFromDate(firstTxn ? firstTxn.dateStr : defaultFrom);
      setToDate(currentDate.toISOString().split('T')[0]);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - days);
      setFromDate(d.toISOString().split('T')[0]);
      setToDate(currentDate.toISOString().split('T')[0]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Entry #', 'Date', 'Particulars', 'Reference No', 'Debit (INR)', 'Credit (INR)', 'Balance (INR)', 'Sign'];
    const rows = filteredEntries.map((e) => [
      e.entryNumber,
      e.date,
      `"${e.particulars.replace(/"/g, '""')}"`,
      e.referenceNo,
      e.debit !== null ? e.debit.toFixed(2) : '',
      e.credit !== null ? e.credit.toFixed(2) : '',
      e.balance.toFixed(2),
      e.balanceType,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SBI_Passbook_${account.accountNumber}_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
      {/* Passbook Header Toolbar (Hidden during print) */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-700" />
              Account Passbook &amp; Statement
            </h2>
            <p className="text-xs text-slate-500">
              Filter by date range, review debits and credits, or print the passbook
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" /> Download CSV
            </button>
            <button
              id="btn-print-passbook"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" /> Print Passbook
            </button>
          </div>
        </div>

        {/* Date Filters & Range Selection (from to) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* From Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              From Date
            </label>
            <input
              id="input-passbook-from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              To Date
            </label>
            <input
              id="input-passbook-to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Quick Filter Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Quick Range
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handlePreset(7)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => handlePreset(30)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => handlePreset('all')}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              >
                All
              </button>
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Transaction Type
            </label>
            <select
              id="select-passbook-filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'ALL' | 'DEBIT' | 'CREDIT')}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Transactions</option>
              <option value="CREDIT">Deposits Only (Cr)</option>
              <option value="DEBIT">Withdrawals Only (Dr)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actual Printable Passbook Sheet */}
      <div className="p-5 sm:p-8 space-y-6">
        {/* Passbook Header */}
        <div className="border-b-2 border-slate-900 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-800 text-white font-bold flex items-center justify-center text-xs">
                  SBI
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-slate-900">
                    State Bank of India
                  </h1>
                  <p className="text-xs font-medium text-slate-600">
                    {statement.branchName} &bull; IFSC: <span className="font-mono">{statement.ifscCode}</span>
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Account Statement &amp; Transaction Passbook
              </p>
            </div>
            <div className="sm:text-right text-xs">
              <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mb-1">
                A/C: {statement.accountNumber}
              </span>
              <p className="font-bold text-slate-800">{statement.accountHolder}</p>
              <p className="text-slate-500 text-[11px] uppercase tracking-wider">{statement.accountType} ACCOUNT</p>
            </div>
          </div>

          {/* Statement Period */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600">
            <span className="font-medium">
              Statement Period:{' '}
              <span className="font-bold text-slate-900 font-mono">
                {statement.fromDate} to {statement.toDate}
              </span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Generated: {new Date().toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Financial Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold block">
              Opening Balance
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {formatINR(statement.openingBalance)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold block">
              Total Deposits (Cr)
            </span>
            <span className="font-bold text-emerald-600 text-sm">
              +{formatINR(statement.totalCredits)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold block">
              Total Withdrawals (Dr)
            </span>
            <span className="font-bold text-red-600 text-sm">
              -{formatINR(statement.totalDebits)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold block">
              Closing Balance
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {formatINR(statement.closingBalance)}
            </span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 w-28">Date</th>
                <th className="py-2.5 px-3">Particulars</th>
                <th className="py-2.5 px-3 w-32 font-mono">Ref / Cheque No</th>
                <th className="py-2.5 px-3 w-28 text-right text-red-600">Debit (₹)</th>
                <th className="py-2.5 px-3 w-28 text-right text-emerald-600">Credit (₹)</th>
                <th className="py-2.5 px-3 w-32 text-right">Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No transactions found for the selected period ({statement.fromDate} to {statement.toDate}).
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr
                    key={`${entry.referenceNo}-${entry.entryNumber}`}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {entry.entryNumber}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {entry.date}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">
                      <div className="flex items-center gap-1.5">
                        {entry.debit ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        ) : (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                        <span>{entry.particulars}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {entry.referenceNo}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-red-600 whitespace-nowrap">
                      {entry.debit !== null ? formatINR(entry.debit) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-600 whitespace-nowrap">
                      {entry.credit !== null ? formatINR(entry.credit) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatINR(entry.balance)}{' '}
                      <span className="text-[10px] text-slate-500 font-normal">
                        {entry.balanceType}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Passbook Footer */}
        <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            <p className="font-medium text-slate-700">Computer Generated Passbook &bull; State Bank of India</p>
            <p className="text-[11px]">This is an electronically generated statement and does not require a physical signature.</p>
          </div>
          <div className="text-center sm:text-right">
            <span className="text-[11px] font-medium text-slate-600">
              Connaught Place Branch &bull; Core Banking System
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
