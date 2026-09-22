/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AccountType, CreateAccountDTO } from '../models/types';
import { Bank } from '../models/Bank';
import { BankAccount } from '../models/BankAccount';
import {
  X,
  PiggyBank,
  Briefcase,
  Award,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { formatINR } from '../utils/indianCurrency';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: Bank;
  onAccountCreated: (account: BankAccount) => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  bank,
  onAccountCreated,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 9');
  const [address, setAddress] = useState('');
  const [governmentId, setGovernmentId] = useState('');
  const [accountType, setAccountType] = useState<AccountType>(AccountType.SAVINGS);
  const [initialDeposit, setInitialDeposit] = useState<string>('5000');
  const [customDailyLimit, setCustomDailyLimit] = useState<string>('');
  const [customOverdraft, setCustomOverdraft] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdSuccess, setCreatedSuccess] = useState<BankAccount | null>(null);

  if (!isOpen) return null;

  const minDepositRequired = accountType === AccountType.SAVINGS ? 1000 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const depositNum = parseFloat(initialDeposit);
    if (isNaN(depositNum) || depositNum < minDepositRequired) {
      setErrorMessage(
        `Initial deposit for ${accountType} must be at least ${formatINR(minDepositRequired)}`
      );
      return;
    }

    const dto: CreateAccountDTO = {
      fullName,
      email,
      phone,
      address: address || 'MG Road, Connaught Place, New Delhi - 110001',
      governmentId: governmentId || `AADHAAR-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      accountType,
      initialDeposit: depositNum,
      customDailyLimit: customDailyLimit ? parseFloat(customDailyLimit) : undefined,
      customOverdraft: customOverdraft ? parseFloat(customOverdraft) : undefined,
    };

    const result = bank.createAccount(dto);
    if (result.success && result.data) {
      setCreatedSuccess(result.data);
      onAccountCreated(result.data);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleResetAndClose = () => {
    setCreatedSuccess(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Open New Bank Account
            </h2>
            <p className="text-xs text-slate-500">
              State Bank of India &bull; Core Banking System
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {createdSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Account Created Successfully
              </h3>
              <p className="text-xs text-slate-500">Your account is active and ready to transact</p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Number:</span>
                  <span className="font-bold text-blue-900 font-mono text-sm">
                    {createdSuccess.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Holder:</span>
                  <span className="font-semibold text-slate-800">
                    {createdSuccess.customer.fullName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Type:</span>
                  <span className="font-semibold text-slate-800">
                    {createdSuccess.getAccountType()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Opening Balance:</span>
                  <span className="font-bold text-emerald-600">
                    {formatINR(createdSuccess.getBalance())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Daily Withdrawal Limit:</span>
                  <span className="font-bold text-slate-800">
                    {formatINR(createdSuccess.getDailyWithdrawalLimit())}
                  </span>
                </div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="mt-4 px-6 py-2 rounded-xl text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 transition-colors"
              >
                Go to Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Account Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Savings */}
                  <button
                    type="button"
                    onClick={() => {
                      setAccountType(AccountType.SAVINGS);
                      setInitialDeposit('5000');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      accountType === AccountType.SAVINGS
                        ? 'border-blue-700 bg-blue-50/50 ring-2 ring-blue-500/20 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <PiggyBank className="w-4 h-4 text-emerald-600 mb-1" />
                    <div className="font-bold text-slate-900">Savings</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      4% p.a. interest
                    </div>
                  </button>

                  {/* Current */}
                  <button
                    type="button"
                    onClick={() => {
                      setAccountType(AccountType.CURRENT);
                      setInitialDeposit('10000');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      accountType === AccountType.CURRENT
                        ? 'border-blue-700 bg-blue-50/50 ring-2 ring-blue-500/20 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-blue-700 mb-1" />
                    <div className="font-bold text-slate-900">Current</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      ₹2.5L Overdraft
                    </div>
                  </button>

                  {/* Salary */}
                  <button
                    type="button"
                    onClick={() => {
                      setAccountType(AccountType.SALARY);
                      setInitialDeposit('0');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      accountType === AccountType.SALARY
                        ? 'border-purple-700 bg-purple-50/50 ring-2 ring-purple-500/20 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Award className="w-4 h-4 text-purple-600 mb-1" />
                    <div className="font-bold text-slate-900">Salary</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Zero Balance
                    </div>
                  </button>
                </div>
              </div>

              {/* Customer Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Mobile Number (+91) *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    PAN / Aadhaar Number
                  </label>
                  <input
                    type="text"
                    value={governmentId}
                    onChange={(e) => setGovernmentId(e.target.value)}
                    placeholder="e.g. ABCDE1234F or 12-digit Aadhaar"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 402, Sector 62, Noida, UP"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                />
              </div>

              {/* Initial Deposit & Daily Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Initial Deposit (₹) *
                  </label>
                  <input
                    type="number"
                    step="100"
                    min={minDepositRequired}
                    required
                    value={initialDeposit}
                    onChange={(e) => setInitialDeposit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                  />
                  <span className="text-[10px] text-slate-500">
                    Minimum required: {formatINR(minDepositRequired)}
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Daily Withdrawal Limit (₹)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={customDailyLimit}
                    onChange={(e) => setCustomDailyLimit(e.target.value)}
                    placeholder={
                      accountType === AccountType.SAVINGS
                        ? 'Default: ₹50,000'
                        : accountType === AccountType.CURRENT
                        ? 'Default: ₹5,00,000'
                        : 'Default: ₹1,00,000'
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                  />
                  <span className="text-[10px] text-slate-500">
                    Leave blank for default limit
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Open Account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
