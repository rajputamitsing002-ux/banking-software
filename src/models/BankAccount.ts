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
} from './types';
import { Customer } from './Customer';
import { Transaction } from './Transaction';
import { DailyWithdrawalTracker } from './DailyWithdrawalTracker';
import { IDailyLimitPolicy, StandardDailyLimitPolicy } from './DailyLimitPolicy';
import { PassbookPrinter } from './PassbookPrinter';

/**
 * Abstract Base Class for all Bank Accounts.
 * Demonstrates:
 * - Abstraction: Abstract base class defining common banking templates & contracts
 * - Encapsulation: Strict private fields (#balance, #transactions, etc.), getters, and invariant protection
 * - Polymorphism: Abstract methods implemented uniquely by specialized account classes
 */
export abstract class BankAccount {
  readonly #accountNumber: string;
  readonly #customer: Customer;
  readonly #openedDate: Date;
  #balance: number;
  #status: AccountStatus;
  #transactions: Transaction[] = [];
  #withdrawalTracker: DailyWithdrawalTracker;

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

    this.#accountNumber = accountNumber;
    this.#customer = customer;
    this.#openedDate = openedDate;
    this.#status = AccountStatus.ACTIVE;
    this.#balance = 0;

    const limitPolicy: IDailyLimitPolicy = new StandardDailyLimitPolicy(dailyLimit);
    this.#withdrawalTracker = new DailyWithdrawalTracker(limitPolicy);

    // Initial Deposit if greater than zero
    if (initialDeposit > 0) {
      this.deposit(initialDeposit, 'Initial Account Opening Deposit', openedDate);
    }
  }

  // --- Abstract Methods (Polymorphism) ---
  public abstract getAccountType(): AccountType;
  public abstract getMinimumBalance(): number;
  public abstract getOverdraftLimit(): number;
  public abstract getInterestRate(): number; // Annual % (e.g. 4.0)

  /**
   * Account-type specific fund sufficiency verification.
   * e.g., Savings checks minimum balance; Current checks overdraft buffer.
   */
  protected abstract canWithdrawFunds(amount: number): { allowed: boolean; reason?: string };

  /**
   * Periodic interest or benefit application (Polymorphic).
   */
  public abstract applyPeriodicInterest(date?: Date): OperationResult<Transaction>;

  // --- Encapsulated Getters ---
  public get accountNumber(): string {
    return this.#accountNumber;
  }

  public get customer(): Customer {
    return this.#customer;
  }

  public get openedDate(): Date {
    return new Date(this.#openedDate.getTime());
  }

  public get status(): AccountStatus {
    return this.#status;
  }

  public get transactions(): readonly Transaction[] {
    return Object.freeze([...this.#transactions]);
  }

  public get dailyWithdrawalTracker(): DailyWithdrawalTracker {
    return this.#withdrawalTracker;
  }

  /**
   * Operation (e): Check the balance.
   * Controlled accessor returning the current exact ledger balance.
   */
  public getBalance(): number {
    return Math.round(this.#balance * 100) / 100;
  }

  /**
   * Available funds including allowed overdraft buffer (if any) minus minimum required balance.
   */
  public getAvailableBalance(): number {
    const raw = this.#balance + this.getOverdraftLimit() - this.getMinimumBalance();
    return Math.max(0, Math.round(raw * 100) / 100);
  }

  public getDailyWithdrawalLimit(): number {
    return this.#withdrawalTracker.policy.getLimit();
  }

  public setDailyWithdrawalLimit(newLimit: number): void {
    this.#withdrawalTracker.policy.setLimit(newLimit);
  }

  public getDailyWithdrawnToday(date: Date = new Date()): number {
    return this.#withdrawalTracker.getWithdrawnAmount(date);
  }

  public getRemainingDailyLimit(date: Date = new Date()): number {
    return this.#withdrawalTracker.getRemainingLimit(date);
  }

  /**
   * Operation (b): Deposit money.
   * Invariant: Amount must be positive, account must be active.
   */
  public deposit(amount: number, narration: string = 'Cash Deposit', date: Date = new Date()): OperationResult<Transaction> {
    if (this.#status !== AccountStatus.ACTIVE) {
      return {
        success: false,
        message: `Deposit rejected: Account is currently ${this.#status}.`,
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
    this.#balance = Math.round((this.#balance + roundedAmount) * 100) / 100;

    const txn = Transaction.createDeposit(
      this.#accountNumber,
      roundedAmount,
      this.#balance,
      narration,
      date
    );

    this.#transactions.push(txn);

    return {
      success: true,
      message: `Successfully deposited $${roundedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} into Account ${this.#accountNumber}.`,
      data: txn,
      timestamp: new Date(),
    };
  }

  /**
   * Operation (c): Withdraw money.
   * Operation (d): Honor daily withdrawal limit.
   * Enforces:
   * 1. Account status is active.
   * 2. Amount > 0.
   * 3. Daily withdrawal limit is strictly respected.
   * 4. Account specific fund sufficiency (Savings min balance / Current overdraft).
   */
  public withdraw(
    amount: number,
    narration: string = 'Cash Withdrawal',
    date: Date = new Date()
  ): OperationResult<Transaction> {
    if (this.#status !== AccountStatus.ACTIVE) {
      return {
        success: false,
        message: `Withdrawal rejected: Account is ${this.#status}.`,
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

    // Operation (d): Honor daily withdrawal limit
    const dailyCheck = this.#withdrawalTracker.validateWithdrawal(roundedAmount, date);
    if (!dailyCheck.allowed) {
      return {
        success: false,
        message: dailyCheck.reason || 'Daily withdrawal limit exceeded.',
        errorCode: 'DAILY_LIMIT_EXCEEDED',
        timestamp: new Date(),
      };
    }

    // Account specific funds check (Polymorphic)
    const fundsCheck = this.canWithdrawFunds(roundedAmount);
    if (!fundsCheck.allowed) {
      return {
        success: false,
        message: fundsCheck.reason || 'Insufficient funds.',
        errorCode: 'INSUFFICIENT_FUNDS',
        timestamp: new Date(),
      };
    }

    // Deduct balance and record withdrawal limit consumption
    this.#balance = Math.round((this.#balance - roundedAmount) * 100) / 100;
    this.#withdrawalTracker.recordWithdrawal(roundedAmount, date);

    const txn = Transaction.createWithdrawal(
      this.#accountNumber,
      roundedAmount,
      this.#balance,
      narration,
      date
    );

    this.#transactions.push(txn);

    return {
      success: true,
      message: `Successfully withdrew $${roundedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}. New balance: $${this.#balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
      data: txn,
      timestamp: new Date(),
    };
  }

  /**
   * Internal protected method to add a system transaction (e.g., Interest crediting).
   */
  protected recordSystemCredit(amount: number, narration: string, date: Date = new Date()): Transaction {
    this.#balance = Math.round((this.#balance + amount) * 100) / 100;
    const txn = Transaction.createInterest(this.#accountNumber, amount, this.#balance, narration, date);
    this.#transactions.push(txn);
    return txn;
  }

  /**
   * Operation (f): Display Account information.
   * Returns a comprehensive snapshot of account details, customer identity, limits, and balance.
   */
  public getAccountInformation(date: Date = new Date()): IAccountInformation {
    return {
      accountNumber: this.#accountNumber,
      accountType: this.getAccountType(),
      status: this.#status,
      customer: this.#customer.toJSON(),
      currentBalance: this.getBalance(),
      availableBalance: this.getAvailableBalance(),
      minimumBalance: this.getMinimumBalance(),
      overdraftLimit: this.getOverdraftLimit(),
      dailyWithdrawalLimit: this.getDailyWithdrawalLimit(),
      dailyWithdrawnToday: this.getDailyWithdrawnToday(date),
      remainingDailyLimit: this.getRemainingDailyLimit(date),
      annualInterestRate: this.getInterestRate(),
      openedDate: this.openedDate,
      totalTransactionsCount: this.#transactions.length,
    };
  }

  /**
   * Operation (g): Passbook Print (from to).
   * Delegates to PassbookPrinter service object with full date-range filtering.
   */
  public printPassbook(fromDate?: Date, toDate?: Date): IPassbookStatement {
    return PassbookPrinter.generateStatement(this, fromDate, toDate);
  }

  public setStatus(status: AccountStatus): void {
    this.#status = status;
  }
}
