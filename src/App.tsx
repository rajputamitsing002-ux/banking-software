/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Bank } from './models/Bank';
import { BankAccount } from './models/BankAccount';
import { Header } from './components/Header';
import { AccountSelector } from './components/AccountSelector';
import { AccountDetailCard } from './components/AccountDetailCard';
import { BankingOperations } from './components/BankingOperations';
import { PassbookView } from './components/PassbookView';
import { CreateAccountModal } from './components/CreateAccountModal';
import { JavaCodeViewerModal } from './components/JavaCodeViewerModal';
import { OperationResult } from './models/types';
import { Transaction } from './models/Transaction';
import {
  ArrowDownLeft,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  PhoneCall,
  Clock,
} from 'lucide-react';

export default function App() {
  // Initialize Bank Aggregate
  const bank = useMemo(() => {
    const b = new Bank('State Bank of India', 'SBIN0001048');
    b.seedSampleData();
    return b;
  }, []);

  // Revision state to trigger reactive re-renders
  const [revision, setRevision] = useState<number>(0);
  const triggerRefresh = useCallback(() => setRevision((r) => r + 1), []);

  // Accounts list
  const accounts = useMemo(() => bank.getAllAccounts(), [bank, revision]);

  // Active account selection
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>(
    accounts[0]?.accountNumber || ''
  );

  // Date simulation state (allows testing requirement d: daily withdrawal limits resetting per date)
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  const currentDate = useMemo(() => {
    return new Date(`${currentDateStr}T12:00:00`);
  }, [currentDateStr]);

  // Active UI View: Operations vs Passbook
  const [activeTab, setActiveTab] = useState<'OPERATIONS' | 'PASSBOOK'>('OPERATIONS');

  // Modal state
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isJavaCodeOpen, setIsJavaCodeOpen] = useState(false);

  // Notification toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const selectedAccount: BankAccount | undefined = useMemo(() => {
    return bank.getAccount(selectedAccountNumber) || accounts[0];
  }, [bank, selectedAccountNumber, revision, accounts]);

  const handleAccountCreated = (newAccount: BankAccount) => {
    triggerRefresh();
    setSelectedAccountNumber(newAccount.accountNumber);
    showToast('success', `Account ${newAccount.accountNumber} opened successfully.`);
  };

  const handleOperationComplete = (result: OperationResult<Transaction>) => {
    triggerRefresh();
    if (result.success) {
      showToast('success', result.message);
    } else {
      showToast('error', result.message);
    }
  };

  const handleApplyInterest = () => {
    if (!selectedAccount) return;
    const res = selectedAccount.applyPeriodicInterest(currentDate);
    triggerRefresh();
    if (res.success) {
      showToast('success', res.message);
    } else {
      showToast('info', res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-800 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs flex items-center gap-2.5 max-w-md ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-blue-800 text-white border-blue-900'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
            )}
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white/60 hover:text-white"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        currentDate={currentDateStr}
        onDateChange={setCurrentDateStr}
        onOpenCreateAccount={() => setIsCreateAccountOpen(true)}
        onOpenJavaCode={() => setIsJavaCodeOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Account Selector */}
        <AccountSelector
          accounts={accounts}
          selectedAccountNumber={selectedAccount?.accountNumber || ''}
          onSelectAccount={(accNum) => setSelectedAccountNumber(accNum)}
          onOpenCreateAccount={() => setIsCreateAccountOpen(true)}
          currentDate={currentDate}
        />

        {selectedAccount ? (
          <>
            {/* Account Detail Card */}
            <AccountDetailCard
              account={selectedAccount}
              currentDate={currentDate}
              onQuickDeposit={() => setActiveTab('OPERATIONS')}
              onQuickWithdraw={() => setActiveTab('OPERATIONS')}
              onViewPassbook={() => setActiveTab('PASSBOOK')}
              onApplyInterest={handleApplyInterest}
            />

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-6">
              <button
                id="tab-view-operations"
                onClick={() => setActiveTab('OPERATIONS')}
                className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 ${
                  activeTab === 'OPERATIONS'
                    ? 'text-blue-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                Transactions (Deposit &amp; Withdraw)
                {activeTab === 'OPERATIONS' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-800 rounded-full" />
                )}
              </button>

              <button
                id="tab-view-passbook"
                onClick={() => setActiveTab('PASSBOOK')}
                className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 ${
                  activeTab === 'PASSBOOK'
                    ? 'text-blue-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Account Passbook &amp; Statement
                {activeTab === 'PASSBOOK' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-800 rounded-full" />
                )}
              </button>
            </div>

            {/* View Panels */}
            {activeTab === 'OPERATIONS' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <BankingOperations
                    account={selectedAccount}
                    currentDate={currentDate}
                    onOperationComplete={handleOperationComplete}
                  />
                </div>

                {/* Practical Bank Quick Information Widget */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-800" />
                      Banking Information
                    </h3>
                    <div className="space-y-3 text-xs text-slate-600">
                      <div className="flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">Daily Limit Reset</p>
                          <p className="text-[11px] text-slate-500">
                            Withdrawal limits renew automatically at 00:00 every banking day.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">Minimum Balance Policy</p>
                          <p className="text-[11px] text-slate-500">
                            Savings accounts require a minimum balance of ₹1,000 to remain active.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
                        <PhoneCall className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">Customer Helpline</p>
                          <p className="text-[11px] text-slate-500">
                            Toll Free: 1800 1234 / 1800 2100 (24x7 SBI Helpline)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <PassbookView
                account={selectedAccount}
                currentDate={currentDate}
              />
            )}
          </>
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <p className="text-slate-500">No active accounts found.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <p>
              State Bank of India &bull; Core Banking System
            </p>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setIsJavaCodeOpen(true)}
              className="text-blue-700 hover:text-blue-900 font-semibold underline underline-offset-2"
            >
              View Java OOP Source Code
            </button>
          </div>
          <p className="text-slate-400 text-[11px]">
            Connaught Place Branch &bull; New Delhi &bull; IFSC: SBIN0001048
          </p>
        </div>
      </footer>

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={isCreateAccountOpen}
        onClose={() => setIsCreateAccountOpen(false)}
        bank={bank}
        onAccountCreated={handleAccountCreated}
      />

      {/* Java OOP Code Viewer Modal */}
      <JavaCodeViewerModal
        isOpen={isJavaCodeOpen}
        onClose={() => setIsJavaCodeOpen(false)}
      />
    </div>
  );
}
