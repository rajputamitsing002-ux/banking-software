/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BankAccount } from './BankAccount';
import { Customer } from './Customer';
import { AccountType, OperationResult } from './types';
import { Transaction } from './Transaction';

/**
 * Savings Account subclass.
 * Demonstrates:
 * - Inheritance: Extends BankAccount
 * - Polymorphism: Custom withdrawal validation enforcing Minimum Balance, Interest computation
 */
export class SavingsAccount extends BankAccount {
  private static readonly MINIMUM_BALANCE = 1000.0; // ₹1,000 minimum required balance
  private static readonly ANNUAL_INTEREST_RATE = 4.0; // 4.0% annual interest
  private static readonly DEFAULT_DAILY_LIMIT = 25000.0; // ₹25,000 default daily withdrawal limit

  constructor(
    accountNumber: string,
    customer: Customer,
    initialDeposit: number,
    customDailyLimit?: number,
    openedDate: Date = new Date()
  ) {
    if (initialDeposit < SavingsAccount.MINIMUM_BALANCE) {
      throw new Error(
        `Savings Account requires an initial deposit of at least ₹${SavingsAccount.MINIMUM_BALANCE}. Received: ₹${initialDeposit}`
      );
    }

    super(
      accountNumber,
      customer,
      initialDeposit,
      customDailyLimit || SavingsAccount.DEFAULT_DAILY_LIMIT,
      openedDate
    );
  }

  public getAccountType(): AccountType {
    return AccountType.SAVINGS;
  }

  public getMinimumBalance(): number {
    return SavingsAccount.MINIMUM_BALANCE;
  }

  public getOverdraftLimit(): number {
    return 0; // Savings accounts do not permit overdraft
  }

  public getInterestRate(): number {
    return SavingsAccount.ANNUAL_INTEREST_RATE;
  }

  /**
   * Polymorphic fund sufficiency check for Savings Account:
   * Must preserve the $100 minimum balance buffer.
   */
  protected canWithdrawFunds(amount: number): { allowed: boolean; reason?: string } {
    const currentBalance = this.getBalance();
    const remainingAfterWithdrawal = currentBalance - amount;

    if (remainingAfterWithdrawal < SavingsAccount.MINIMUM_BALANCE) {
      return {
        allowed: false,
        reason: `Savings Account requires maintaining a minimum balance of ₹${SavingsAccount.MINIMUM_BALANCE.toFixed(
          2
        )}. Current balance: ₹${currentBalance.toFixed(2)}, requested: ₹${amount.toFixed(
          2
        )}. Max allowable withdrawal: ₹${Math.max(0, currentBalance - SavingsAccount.MINIMUM_BALANCE).toFixed(2)}.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Polymorphic periodic interest application for Savings Account.
   * Credits monthly interest (AnnualRate / 12).
   */
  public applyPeriodicInterest(date: Date = new Date()): OperationResult<Transaction> {
    const balance = this.getBalance();
    if (balance <= 0) {
      return {
        success: false,
        message: 'No interest applicable for zero or negative balance.',
        timestamp: new Date(),
      };
    }

    const monthlyRate = (SavingsAccount.ANNUAL_INTEREST_RATE / 100) / 12;
    const interestAmount = Math.round(balance * monthlyRate * 100) / 100;

    if (interestAmount <= 0) {
      return {
        success: false,
        message: 'Accrued interest is less than 1 cent.',
        timestamp: new Date(),
      };
    }

    const txn = this.recordSystemCredit(
      interestAmount,
      `Monthly Interest Credit (${SavingsAccount.ANNUAL_INTEREST_RATE}% p.a.)`,
      date
    );

    return {
      success: true,
      message: `Credited $${interestAmount.toFixed(2)} interest into Savings Account.`,
      data: txn,
      timestamp: new Date(),
    };
  }
}
