/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BankAccount } from './BankAccount';
import { Customer } from './Customer';
import { AccountType, OperationResult } from './types';
import { Transaction } from './Transaction';

/**
 * Salary (Corporate Payroll) Account subclass.
 * Demonstrates:
 * - Inheritance: Extends BankAccount
 * - Polymorphism: Zero minimum balance requirement, payroll overdraft advance, salary interest calculation
 */
export class SalaryAccount extends BankAccount {
  private static readonly DEFAULT_DAILY_LIMIT = 50000.0; // ₹50,000 daily withdrawal limit
  private static readonly PAYROLL_OVERDRAFT_ADVANCE = 25000.0; // ₹25,000 salary advance buffer
  private static readonly ANNUAL_INTEREST_RATE = 3.5;
  #employerName: string;

  constructor(
    accountNumber: string,
    customer: Customer,
    initialDeposit: number,
    employerName: string = 'Tata Consultancy Services (TCS)',
    customDailyLimit?: number,
    openedDate: Date = new Date()
  ) {
    super(
      accountNumber,
      customer,
      Math.max(0, initialDeposit),
      customDailyLimit || SalaryAccount.DEFAULT_DAILY_LIMIT,
      openedDate
    );
    this.#employerName = employerName;
  }

  public getAccountType(): AccountType {
    return AccountType.SALARY;
  }

  public getMinimumBalance(): number {
    return 0; // True zero-balance account
  }

  public getOverdraftLimit(): number {
    return SalaryAccount.PAYROLL_OVERDRAFT_ADVANCE;
  }

  public getInterestRate(): number {
    return SalaryAccount.ANNUAL_INTEREST_RATE;
  }

  public get employerName(): string {
    return this.#employerName;
  }

  public set employerName(val: string) {
    if (val && val.trim().length > 0) this.#employerName = val.trim();
  }

  /**
   * Polymorphic fund check: allows zero balance and payroll overdraft advance.
   */
  protected canWithdrawFunds(amount: number): { allowed: boolean; reason?: string } {
    const currentBalance = this.getBalance();
    const totalAccessible = currentBalance + SalaryAccount.PAYROLL_OVERDRAFT_ADVANCE;

    if (amount > totalAccessible) {
      return {
        allowed: false,
        reason: `Salary Account withdrawal exceeds total accessible funds (Balance: ₹${currentBalance.toFixed(
          2
        )} + Payroll Advance: ₹${SalaryAccount.PAYROLL_OVERDRAFT_ADVANCE.toFixed(
          2
        )}). Maximum allowable: ₹${totalAccessible.toFixed(2)}.`,
      };
    }

    return { allowed: true };
  }

  public applyPeriodicInterest(date: Date = new Date()): OperationResult<Transaction> {
    const balance = this.getBalance();
    if (balance <= 0) {
      return {
        success: false,
        message: 'No interest applicable for zero balance.',
        timestamp: new Date(),
      };
    }

    const monthlyRate = (SalaryAccount.ANNUAL_INTEREST_RATE / 100) / 12;
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
      `Salary Tier Special Interest Credit (${SalaryAccount.ANNUAL_INTEREST_RATE}% p.a.)`,
      date
    );

    return {
      success: true,
      message: `Credited $${interestAmount.toFixed(2)} interest into Salary Account.`,
      data: txn,
      timestamp: new Date(),
    };
  }
}
