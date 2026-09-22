/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BankAccount } from '../models/BankAccount';
import { AccountType } from '../models/types';
import { PiggyBank, Briefcase, Award, Plus, CreditCard } from 'lucide-react';
import { formatINR } from '../utils/indianCurrency';

interface AccountSelectorProps {
  accounts: BankAccount[];
  selectedAccountNumber: string;
  onSelectAccount: (accountNumber: string) => void;
  onOpenCreateAccount: () => void;
  currentDate: Date;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccountNumber,
  onSelectAccount,
  onOpenCreateAccount,
  currentDate,
}) => {
  const getTypeIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.SAVINGS:
        return <PiggyBank className="w-4 h-4 text-emerald-600" />;
      case AccountType.CURRENT:
        return <Briefcase className="w-4 h-4 text-blue-700" />;
      case AccountType.SALARY:
        return <Award className="w-4 h-4 text-purple-600" />;
    }
  };

  const getTypeLabel = (type: AccountType) => {
    switch (type) {
      case AccountType.SAVINGS:
        return 'Savings Account';
      case AccountType.CURRENT:
        return 'Current Account';
      case AccountType.SALARY:
        return 'Salary Account';
    }
  };

  const getTypeBadge = (type: AccountType) => {
    switch (type) {
      case AccountType.SAVINGS:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case AccountType.CURRENT:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case AccountType.SALARY:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Accounts ({accounts.length})
          </h2>
        </div>
        <button
          id="btn-add-account-selector"
          onClick={onOpenCreateAccount}
          className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Open New Account
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {accounts.map((acc) => {
          const isSelected = acc.accountNumber === selectedAccountNumber;
          const balance = acc.getBalance();
          const limit = acc.getDailyWithdrawalLimit();
          const usedToday = acc.getDailyWithdrawnToday(currentDate);
          const percentUsed = Math.min(100, Math.round((usedToday / limit) * 100));

          return (
            <div
              key={acc.accountNumber}
              id={`account-card-${acc.accountNumber}`}
              onClick={() => onSelectAccount(acc.accountNumber)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-blue-700 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                    {getTypeIcon(acc.getAccountType())}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {acc.customer.fullName}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500">
                      {acc.accountNumber}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getTypeBadge(
                    acc.getAccountType()
                  )}`}
                >
                  {getTypeLabel(acc.getAccountType())}
                </span>
              </div>

              {/* Balance & Daily limit */}
              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                    Available Balance
                  </span>
                  <span className="text-base font-bold text-slate-900 tracking-tight">
                    {formatINR(balance)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-medium">
                    Today&apos;s Limit: {formatINR(usedToday, false)} / {formatINR(limit, false)}
                  </span>
                  <div className="w-20 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden ml-auto">
                    <div
                      className={`h-full rounded-full ${
                        percentUsed >= 100
                          ? 'bg-red-500'
                          : percentUsed >= 70
                          ? 'bg-amber-500'
                          : 'bg-blue-700'
                      }`}
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
