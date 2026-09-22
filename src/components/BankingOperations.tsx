/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BankAccount } from '../models/BankAccount';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { OperationResult } from '../models/types';
import { Transaction } from '../models/Transaction';
import { formatINR } from '../utils/indianCurrency';

interface BankingOperationsProps {
  account: BankAccount;
  currentDate: Date;
  onOperationComplete: (result: OperationResult<Transaction>) => void;
}

export const BankingOperations: React.FC<BankingOperationsProps> = ({
  account,
  currentDate,
  onOperationComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');

  // Form states with Indian standard denominations
  const [depositAmount, setDepositAmount] = useState<string>('2000');
  const [depositNarration, setDepositNarration] = useState<string>('Cash Deposit');

  const [withdrawAmount, setWithdrawAmount] = useState<string>('1000');
  const [withdrawNarration, setWithdrawNarration] = useState<string>('ATM Cash Withdrawal');

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    details?: string;
  } | null>(null);

  const balance = account.getBalance();
  const available = account.getAvailableBalance();
  const dailyLimit = account.getDailyWithdrawalLimit();
  const withdrawnToday = account.getDailyWithdrawnToday(currentDate);
  const remainingLimit = account.getRemainingDailyLimit(currentDate);

  const parsedWithdraw = parseFloat(withdrawAmount) || 0;
  const isWithdrawExceedingDailyLimit = parsedWithdraw > remainingLimit;

  // Operation (b): Deposit money
  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setFeedback({
        type: 'error',
        message: 'Invalid Amount',
        details: 'Deposit amount must be greater than zero.',
      });
      return;
    }

    const res = account.deposit(amount, depositNarration || 'Cash Deposit', currentDate);
    onOperationComplete(res);

    if (res.success && res.data) {
      setFeedback({
        type: 'success',
        message: 'Deposit Successful',
        details: `${res.message} • Ref No: ${res.data.referenceNumber}`,
      });
      setDepositAmount('1000');
    } else {
      setFeedback({
        type: 'error',
        message: 'Deposit Failed',
        details: res.message,
      });
    }
  };

  // Operation (c) & (d): Withdraw money & Honor daily withdrawal limit
  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setFeedback({
        type: 'error',
        message: 'Invalid Amount',
        details: 'Withdrawal amount must be greater than zero.',
      });
      return;
    }

    const res = account.withdraw(amount, withdrawNarration || 'ATM Cash Withdrawal', currentDate);
    onOperationComplete(res);

    if (res.success && res.data) {
      setFeedback({
        type: 'success',
        message: 'Withdrawal Successful',
        details: `${res.message} • Ref No: ${res.data.referenceNumber}`,
      });
      setWithdrawAmount('500');
    } else {
      setFeedback({
        type: 'error',
        message: res.errorCode === 'DAILY_LIMIT_EXCEEDED' ? 'Daily Limit Exceeded' : 'Withdrawal Declined',
        details: res.message,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1.5">
        <button
          id="tab-deposit"
          onClick={() => {
            setActiveTab('DEPOSIT');
            setFeedback(null);
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'DEPOSIT'
              ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          <span>Deposit Money</span>
        </button>
        <button
          id="tab-withdraw"
          onClick={() => {
            setActiveTab('WITHDRAW');
            setFeedback(null);
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'WITHDRAW'
              ? 'bg-white text-blue-900 shadow-2xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-blue-700" />
          <span>Withdraw Money</span>
        </button>
      </div>

      <div className="p-5 sm:p-6">
        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs mb-5 flex items-start gap-3 border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-red-50 text-red-900 border-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{feedback.message}</p>
              {feedback.details && (
                <p className="text-slate-600 mt-0.5 leading-relaxed">{feedback.details}</p>
              )}
            </div>
          </div>
        )}

        {/* DEPOSIT FORM */}
        {activeTab === 'DEPOSIT' && (
          <form onSubmit={handleDeposit} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Deposit Funds</h3>
                <p className="text-xs text-slate-500">
                  Credit funds directly to Account {account.accountNumber}
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                Current Balance: {formatINR(balance)}
              </span>
            </div>

            {/* Quick Amount Chips */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Quick Select Amount
              </label>
              <div className="flex flex-wrap gap-2">
                {[500, 1000, 2000, 5000, 10000, 25000].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setDepositAmount(String(amt))}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                      depositAmount === String(amt)
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    +{formatINR(amt, false)}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Deposit Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">
                  ₹
                </span>
                <input
                  id="input-deposit-amount"
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Narration input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Transaction Particulars / Narration
              </label>
              <input
                id="input-deposit-narration"
                type="text"
                value={depositNarration}
                onChange={(e) => setDepositNarration(e.target.value)}
                placeholder="e.g. Cash Deposit, UPI Transfer, Cheque Deposit"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <button
              id="btn-submit-deposit"
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors flex items-center justify-center gap-2"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Confirm Deposit of {formatINR(parseFloat(depositAmount || '0'))}
            </button>
          </form>
        )}

        {/* WITHDRAW FORM */}
        {activeTab === 'WITHDRAW' && (
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Withdraw Funds
                </h3>
                <p className="text-xs text-slate-500">
                  Debits funds while honoring daily limit and minimum balance policies
                </p>
              </div>
            </div>

            {/* Daily limit rule status box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  Daily Withdrawal Limit
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {formatINR(dailyLimit, false)} / day
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 block">Withdrawn Today:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {formatINR(withdrawnToday, false)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Remaining Today:</span>
                  <span
                    className={`font-bold font-mono ${
                      remainingLimit > 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {formatINR(remainingLimit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Quick Select Amount
              </label>
              <div className="flex flex-wrap gap-2">
                {[500, 1000, 2000, 5000, 10000, 20000].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setWithdrawAmount(String(amt))}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                      withdrawAmount === String(amt)
                        ? 'bg-blue-50 border-blue-600 text-blue-800 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {formatINR(amt, false)}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Withdrawal Amount (₹)
                </label>
                <span className="text-[11px] text-slate-500">
                  Available: {formatINR(available)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">
                  ₹
                </span>
                <input
                  id="input-withdraw-amount"
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 ${
                    isWithdrawExceedingDailyLimit
                      ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'
                  }`}
                />
              </div>

              {/* Warning if exceeding daily limit */}
              {isWithdrawExceedingDailyLimit && (
                <p className="text-[11px] text-red-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Notice: Amount exceeds today&apos;s remaining limit ({formatINR(remainingLimit)}).
                </p>
              )}
            </div>

            {/* Narration input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Transaction Particulars / Narration
              </label>
              <input
                id="input-withdraw-narration"
                type="text"
                value={withdrawNarration}
                onChange={(e) => setWithdrawNarration(e.target.value)}
                placeholder="e.g. ATM Cash, UPI QR Pay, Bill Payment"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <button
              id="btn-submit-withdraw"
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 shadow-2xs transition-colors flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              Confirm Withdrawal of {formatINR(parseFloat(withdrawAmount || '0'))}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
