/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AccountType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
  SALARY = 'SALARY',
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  INTEREST = 'INTEREST',
  FEE = 'FEE',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  DORMANT = 'DORMANT',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export interface ICustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  governmentId: string;
  registeredAt: Date;
}

export interface ITransaction {
  id: string;
  accountNumber: string;
  timestamp: Date;
  dateStr: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  narration: string;
  referenceNumber: string;
}

export interface IPassbookEntry {
  entryNumber: number;
  date: string;
  particulars: string;
  referenceNo: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  balanceType: 'Cr' | 'Dr';
}

export interface IPassbookStatement {
  accountNumber: string;
  accountHolder: string;
  accountType: AccountType;
  currency: string;
  branchName: string;
  ifscCode: string;
  fromDate: string;
  toDate: string;
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  entries: IPassbookEntry[];
  generatedAt: Date;
}

export interface IAccountInformation {
  accountNumber: string;
  accountType: AccountType;
  status: AccountStatus;
  customer: ICustomer;
  currentBalance: number;
  availableBalance: number;
  minimumBalance: number;
  overdraftLimit: number;
  dailyWithdrawalLimit: number;
  dailyWithdrawnToday: number;
  remainingDailyLimit: number;
  annualInterestRate: number;
  openedDate: Date;
  totalTransactionsCount: number;
}

export interface CreateAccountDTO {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  governmentId: string;
  accountType: AccountType;
  initialDeposit: number;
  customDailyLimit?: number;
  customOverdraft?: number;
}

export interface OperationResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  timestamp: Date;
}
