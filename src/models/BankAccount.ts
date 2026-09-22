/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AccountStatus,
  AccountType,
  IAccountInformation,
  IPassbookStatement,
  OperationResult,
  TransactionType,
} from './types';
import { Customer } from './Customer';
import { Transaction } from './Transaction';
import { PassbookPrinter } from './PassbookPrinter';

/**
 * Abstract Base Class BankAccount demonstrating OOP principles:
 * - Abstraction: Core contract for all account variations
 * - Encapsulation: Protected fields, controlled mutations, public getters
 * - Polymorphism: Overridden methods in SavingsAccount, CurrentAccount, and SalaryAccount
 */
export abstract class BankAccount {
  protected _accountNumber: string;
  protected _customer: Customer;
  protected _balance: number = 0;
  protected _dailyWithdrawalLimit: number;
  protected _openedDate: Date;
  protected _status: AccountStatus = AccountStatus.ACTIVE;
  protected _transactions: Transaction[] = [];

  constructor(
    accountNumber: string,
    customer: Customer,
    initialDeposit: number,
    dailyLimit: number,
    openedDate: Date = new Date()
  ) {
    if (!accountNumber) {
      throw new Error('Valid account number is required.');
    }
    if (!customer) {
      throw new Error('Valid account customer is required.');
    }

    this._accountNumber = accountNumber;
    this._customer = customer;
    this._dailyWithdrawalLimit = dailyLimit;
    this._openedDate = openedDate;

    // Operation (b): Initial deposit
    if (initialDeposit > 0) {
      this.deposit(initialDeposit, 'Initial Account Opening Deposit', openedDate);
    }
  }

  // --- Abstract Methods (Polymorphism) ---
  public abstract getAccountType(): AccountType;
  public abstract getMinimumBalance(): number;
  public abstract getOverdraftLimit(): number;
  public abstract getInterestRate(): number;
  protected abstract canWithdrawFunds(amount: number): { allowed: boolean; reason?: string };
  public abstract applyPeriodicInterest(date?: Date): OperationResult<Transaction>;

  // --- Encapsulated Getters ---
  public get accountNumber(): string {
    return this._accountNumber;
  }

  public get customer(): Customer {
    return this._customer;
  }

  public get openedDate(): Date {
    return new Date(this._openedDate.getTime());
  }

  public get status(): AccountStatus {
    return this._status;
  }

  public get transactions(): readonly Transaction[] {
    return Object.freeze([...this._transactions]);
  }

  // =========================================================================
  // Operation (e): Check the balance
  // =========================================================================
  public getBalance(): number {
    return Math.round(this._balance * 100) / 100;
  }

  public getAvailableBalance(): number {
    const raw = this._balance + this.getOverdraftLimit() - this.getMinimumBalance();
    return Math.max(0, Math.round(raw * 100) / 100);
  }

  // =========================================================================
  // Operation (d): Honor daily withdrawal limit
  // =========================================================================
  public getDailyWithdrawalLimit(): number {
    return this._dailyWithdrawalLimit;
  }

  public setDailyWithdrawalLimit(newLimit: number): void {
    this._dailyWithdrawalLimit = Math.max(0, newLimit);
  }

  public getDailyWithdrawnToday(date: Date = new Date()): number {
    const dateStr = date.toISOString().split('T')[0];
    return this._transactions
      .filter((t) => t.type === TransactionType.WITHDRAWAL && t.dateStr === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  public getRemainingDailyLimit(date: Date = new Date()): number {
    const withdrawnToday = this.getDailyWithdrawnToday(date);
    return Math.max(0, Math.round((this._dailyWithdrawalLimit - withdrawnToday) * 100) / 100);
  }

  // =========================================================================
  // Operation (b): Deposit money
  // =========================================================================
  public deposit(
    amount: number,
    narration: string = 'Cash Deposit',
    date: Date = new Date()
  ): OperationResult<Transaction> {
    if (this._status !== AccountStatus.ACTIVE) {
      return {
        success: false,
        message: `Deposit rejected: Account is ${this._status}.`,
        timestamp: new Date(),
      };
    }

    if (amount <= 0 || isNaN(amount)) {
      return {
        success: false,
        message: 'Deposit amount must be strictly positive.',
        timestamp: new Date(),
      };
    }

    const roundedAmount = Math.round(amount * 100) / 100;
    this._balance = Math.round((this._balance + roundedAmount) * 100) / 100;

    const txn = Transaction.createDeposit(
      this._accountNumber,
      roundedAmount,
      this._balance,
      narration,
      date
    );

    this._transactions.push(txn);

    return {
      success: true,
      message: `Successfully deposited ₹${roundedAmount.toLocaleString('en-IN')}. New balance: ₹${this._balance.toLocaleString('en-IN')}.`,
      data: txn,
      timestamp: new Date(),
    };
  }

  // =========================================================================
  // Operation (c) & (d): Withdraw money & Honor daily withdrawal limit
  // =========================================================================
  public withdraw(
    amount: number,
    narration: string = 'Cash Withdrawal',
    date: Date = new Date()
  ): OperationResult<Transaction> {
    if (this._status !== AccountStatus.ACTIVE) {
      return {
        success: false,
        message: `Withdrawal rejected: Account is ${this._status}.`,
        timestamp: new Date(),
      };
    }

    if (amount <= 0 || isNaN(amount)) {
      return {
        success: false,
        message: 'Withdrawal amount must be strictly positive.',
        timestamp: new Date(),
      };
    }

    const roundedAmount = Math.round(amount * 100) / 100;

    // Requirement (d): Honor daily withdrawal limit
    const remainingDaily = this.getRemainingDailyLimit(date);
    if (roundedAmount > remainingDaily) {
      return {
        success: false,
        message: `Daily withdrawal limit exceeded. Remaining limit today: ₹${remainingDaily.toLocaleString('en-IN')}, requested: ₹${roundedAmount.toLocaleString('en-IN')}.`,
        errorCode: 'DAILY_LIMIT_EXCEEDED',
        timestamp: new Date(),
      };
    }

    // Account-specific fund sufficiency check (Polymorphic)
    const fundsCheck = this.canWithdrawFunds(roundedAmount);
    if (!fundsCheck.allowed) {
      return {
        success: false,
        message: fundsCheck.reason || 'Insufficient funds.',
        errorCode: 'INSUFFICIENT_FUNDS',
        timestamp: new Date(),
      };
    }

    this._balance = Math.round((this._balance - roundedAmount) * 100) / 100;

    const txn = Transaction.createWithdrawal(
      this._accountNumber,
      roundedAmount,
      this._balance,
      narration,
      date
    );

    this._transactions.push(txn);

    return {
      success: true,
      message: `Successfully withdrew ₹${roundedAmount.toLocaleString('en-IN')}. New balance: ₹${this._balance.toLocaleString('en-IN')}.`,
      data: txn,
      timestamp: new Date(),
    };
  }

  // Internal interest / benefit credit
  protected recordSystemCredit(
    amount: number,
    narration: string,
    date: Date = new Date()
  ): Transaction {
    this._balance = Math.round((this._balance + amount) * 100) / 100;
    const txn = Transaction.createInterest(
      this._accountNumber,
      amount,
      this._balance,
      narration,
      date
    );
    this._transactions.push(txn);
    return txn;
  }

  // =========================================================================
  // Operation (f): Display Account information
  // =========================================================================
  public getAccountInformation(date: Date = new Date()): IAccountInformation {
    return {
      accountNumber: this._accountNumber,
      accountType: this.getAccountType(),
      status: this._status,
      customer: this._customer.toJSON(),
      currentBalance: this.getBalance(),
      availableBalance: this.getAvailableBalance(),
      minimumBalance: this.getMinimumBalance(),
      overdraftLimit: this.getOverdraftLimit(),
      dailyWithdrawalLimit: this.getDailyWithdrawalLimit(),
      dailyWithdrawnToday: this.getDailyWithdrawnToday(date),
      remainingDailyLimit: this.getRemainingDailyLimit(date),
      annualInterestRate: this.getInterestRate(),
      openedDate: this.openedDate,
      totalTransactionsCount: this._transactions.length,
    };
  }

  // =========================================================================
  // Operation (g): Passbook Print (from to)
  // =========================================================================
  public printPassbook(fromDate?: Date, toDate?: Date): IPassbookStatement {
    return PassbookPrinter.generateStatement(this, fromDate, toDate);
  }

  public setStatus(status: AccountStatus): void {
    this._status = status;
  }
}
