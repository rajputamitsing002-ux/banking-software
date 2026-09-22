/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BankAccount } from './BankAccount';
import { Customer } from './Customer';
import { AccountType, OperationResult } from './types';
import { Transaction } from './Transaction';

/**
 * Current (Checking / Commercial) Account subclass.
 * Demonstrates:
 * - Inheritance: Extends BankAccount
 * - Polymorphism: Overdraft facility handling (negative balance allowance up to overdraftLimit), higher daily limit
 */
export class CurrentAccount extends BankAccount {
  private static readonly DEFAULT_OVERDRAFT_LIMIT = 100000.0; // ₹1,00,000 overdraft buffer
  private static readonly DEFAULT_DAILY_LIMIT = 200000.0; // ₹2,00,000 commercial daily limit
  #overdraftLimit: number;

  constructor(
    accountNumber: string,
    customer: Customer,
    initialDeposit: number,
    customDailyLimit?: number,
    customOverdraftLimit?: number,
    openedDate: Date = new Date()
  ) {
    if (initialDeposit < 0) {
      throw new Error('Initial deposit for Current Account cannot be negative.');
    }

    super(
      accountNumber,
      customer,
      initialDeposit,
      customDailyLimit || CurrentAccount.DEFAULT_DAILY_LIMIT,
      openedDate
    );

    this.#overdraftLimit =
      customOverdraftLimit !== undefined
        ? Math.max(0, customOverdraftLimit)
        : CurrentAccount.DEFAULT_OVERDRAFT_LIMIT;
  }

  public getAccountType(): AccountType {
    return AccountType.CURRENT;
  }

  public getMinimumBalance(): number {
    return 0; // Zero minimum balance required
  }

  public getOverdraftLimit(): number {
    return this.#overdraftLimit;
  }

  public setOverdraftLimit(newLimit: number): void {
    if (newLimit < 0) throw new Error('Overdraft limit cannot be negative.');
    this.#overdraftLimit = newLimit;
  }

  public getInterestRate(): number {
    return 0; // Checking / Current accounts generally earn 0% interest
  }

  /**
   * Polymorphic fund sufficiency check for Current Account:
   * Can spend up to (balance + overdraftLimit).
   */
  protected canWithdrawFunds(amount: number): { allowed: boolean; reason?: string } {
    const currentBalance = this.getBalance();
    const totalPurchasingPower = currentBalance + this.#overdraftLimit;

    if (amount > totalPurchasingPower) {
      return {
        allowed: false,
        reason: `Current Account withdrawal exceeds available liquidity including overdraft limit. Total purchasing power: ₹${totalPurchasingPower.toFixed(
          2
        )} (Balance: ₹${currentBalance.toFixed(2)} + Overdraft: ₹${this.#overdraftLimit.toFixed(
          2
        )}). You requested: ₹${amount.toFixed(2)}.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Periodic interest not applicable for standard Current Account.
   */
  public applyPeriodicInterest(): OperationResult<Transaction> {
    return {
      success: false,
      message: 'Current / Commercial accounts do not accrue credit interest.',
      timestamp: new Date(),
    };
  }
}
