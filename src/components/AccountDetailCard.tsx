/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BankAccount } from '../models/BankAccount';
import {
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  RefreshCw,
  Building2,
  Percent,
} from 'lucide-react';
import { formatINR } from '../utils/indianCurrency';
import { AccountType } from '../models/types';

interface AccountDetailCardProps {
  account: BankAccount;
  currentDate: Date;
  onQuickDeposit: () => void;
  onQuickWithdraw: () => void;
  onViewPassbook: () => void;
  onApplyInterest: () => void;
}

export const AccountDetailCard: React.FC<AccountDetailCardProps> = ({
  account,
  currentDate,
  onQuickDeposit,
  onQuickWithdraw,
  onViewPassbook,
  onApplyInterest,
}) => {
  const [lastCheckedTime, setLastCheckedTime] = useState<string>('Just now');
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Operation (f): Display Account information
  const info = account.getAccountInformation(currentDate);

  // Operation (e): Check the balance
  const handleCheckBalance = () => {
    setIsChecking(true);
    setTimeout(() => {
      setLastCheckedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsChecking(false);
    }, 250);
  };

  const dailyPercent = Math.min(
    100,
    Math.round((info.dailyWithdrawnToday / info.dailyWithdrawalLimit) * 100)
  );

  const getAccountTypeName = (type: AccountType) => {
    switch (type) {
      case AccountType.SAVINGS:
        return 'Savings Account';
      case AccountType.CURRENT:
        return 'Current Account';
      case AccountType.SALARY:
        return 'Salary Account';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Banner with Account Overview */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono tracking-wider text-amber-300 font-bold">
                {info.accountNumber}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                {getAccountTypeName(info.accountType)}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {info.status}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {info.customer.fullName}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-amber-300" /> State Bank of India &bull; Connaught Place Branch &bull; IFSC: SBIN0001048
            </p>
          </div>

          {/* Balance & Verification */}
          <div className="bg-white/10 p-4 rounded-xl border border-white/15 min-w-[240px]">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-300 font-medium">
                Current Balance
              </span>
              <button
                id="btn-check-balance"
                onClick={handleCheckBalance}
                title="Refresh balance"
                className="text-amber-300 hover:text-white bg-white/10 px-2 py-0.5 rounded transition-colors flex items-center gap-1 text-[11px] font-medium"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                <span>Check</span>
              </button>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-300">
              {formatINR(info.currentBalance)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-200 mt-1 pt-1.5 border-t border-white/10">
              <span>Available to withdraw:</span>
              <span className="font-semibold text-emerald-300">
                {formatINR(info.availableBalance)}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 text-right mt-0.5 font-mono">
              Verified: {lastCheckedTime}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/10">
          <button
            id="btn-quick-deposit"
            onClick={onQuickDeposit}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Deposit
          </button>
          <button
            id="btn-quick-withdraw"
            onClick={onQuickWithdraw}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
          </button>
          <button
            id="btn-quick-passbook"
            onClick={onViewPassbook}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center gap-1.5 border border-white/20"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" /> Passbook
          </button>
          {info.annualInterestRate > 0 && (
            <button
              id="btn-apply-interest"
              onClick={onApplyInterest}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Percent className="w-3.5 h-3.5" /> Calculate Interest
            </button>
          )}
        </div>
      </div>

      {/* Account Information Details Grid */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1: Account Terms */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-700" />
            Account Information
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Account Type</span>
              <span className="font-semibold text-slate-800">{getAccountTypeName(info.accountType)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Interest Rate</span>
              <span className="font-semibold text-emerald-600">
                {info.annualInterestRate > 0 ? `${info.annualInterestRate}% p.a.` : '0% (Non-interest bearing)'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Minimum Balance</span>
              <span className="font-semibold text-slate-800">
                {formatINR(info.minimumBalance)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Overdraft Limit</span>
              <span className="font-semibold text-blue-700">
                {formatINR(info.overdraftLimit)}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Total Transactions</span>
              <span className="font-semibold text-slate-800 font-mono">
                {info.totalTransactionsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Daily Withdrawal Limit */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-700" />
            Daily Withdrawal Limit
          </h3>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">Today&apos;s Usage:</span>
              <span className="font-bold text-slate-900">
                {formatINR(info.dailyWithdrawnToday, false)} / {formatINR(info.dailyWithdrawalLimit, false)}
              </span>
            </div>

            {/* Visual Gauge */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  dailyPercent >= 100
                    ? 'bg-red-500'
                    : dailyPercent >= 75
                    ? 'bg-amber-500'
                    : 'bg-blue-700'
                }`}
                style={{ width: `${dailyPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-slate-600 font-medium">Remaining Limit Today:</span>
              <span
                className={`font-bold ${
                  info.remainingDailyLimit > 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {formatINR(info.remainingDailyLimit)}
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Limit resets daily at midnight. Use the date selector in the top bar to test limit renewal across dates.
            </p>
          </div>
        </div>

        {/* Column 3: Customer Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-700" />
            Customer &amp; KYC Details
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 py-1 text-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{info.customer.email}</span>
            </div>
            <div className="flex items-center gap-2 py-1 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium">{info.customer.phone}</span>
            </div>
            <div className="flex items-start gap-2 py-1 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="text-slate-600 leading-snug">{info.customer.address}</span>
            </div>
            <div className="flex items-center gap-2 py-1 text-slate-700">
              <span className="text-slate-500">KYC ID:</span>
              <span className="font-mono text-[11px] bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded font-semibold">
                {info.customer.governmentId}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
