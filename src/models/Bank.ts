/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BankAccount } from './BankAccount';
import { Customer } from './Customer';
import { SavingsAccount } from './SavingsAccount';
import { CurrentAccount } from './CurrentAccount';
import { SalaryAccount } from './SalaryAccount';
import { AccountFactory } from './AccountFactory';
import {
  AccountType,
  CreateAccountDTO,
  IAccountInformation,
  IPassbookStatement,
  OperationResult,
} from './types';
import { Transaction } from './Transaction';

/**
 * Bank class acting as the Aggregate Root / Facade for all banking operations.
 * Demonstrates:
 * - Composition & Aggregation: Encapsulates collection of BankAccounts and Customers
 * - Facade Pattern: Coordinates all seven core operations requested:
 *   a. Create an account
 *   b. Deposit money
 *   c. Withdraw money
 *   d. Honor daily withdrawal limit
 *   e. Check the balance
 *   f. Display Account information
 *   g. Passbook Print (from to)
 */
export class Bank {
  readonly #bankName: string;
  readonly #branchCode: string;
  readonly #accounts: Map<string, BankAccount> = new Map();
  readonly #customers: Map<string, Customer> = new Map();

  constructor(bankName: string = 'State Bank of India', branchCode: string = 'SBIN0001048') {
    this.#bankName = bankName;
    this.#branchCode = branchCode;
  }

  public get bankName(): string {
    return this.#bankName;
  }

  public get branchCode(): string {
    return this.#branchCode;
  }

  public getAllAccounts(): BankAccount[] {
    return Array.from(this.#accounts.values());
  }

  public getAccount(accountNumber: string): BankAccount | undefined {
    return this.#accounts.get(accountNumber);
  }

  // =========================================================================
  // Operation (a): Create an account
  // =========================================================================
  public createAccount(dto: CreateAccountDTO): OperationResult<BankAccount> {
    try {
      const account = AccountFactory.createAccount(dto);
      this.#accounts.set(account.accountNumber, account);
      this.#customers.set(account.customer.id, account.customer);

      return {
        success: true,
        message: `Account ${account.accountNumber} (${account.getAccountType()}) created successfully for ${account.customer.fullName}.`,
        data: account,
        timestamp: new Date(),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account.';
      return {
        success: false,
        message,
        timestamp: new Date(),
      };
    }
  }

  // =========================================================================
  // Operation (b): Deposit money
  // =========================================================================
  public depositMoney(
    accountNumber: string,
    amount: number,
    narration: string = 'Cash Deposit',
    date: Date = new Date()
  ): OperationResult<Transaction> {
    const account = this.#accounts.get(accountNumber);
    if (!account) {
      return {
        success: false,
        message: `Account ${accountNumber} does not exist.`,
        timestamp: new Date(),
      };
    }

    return account.deposit(amount, narration, date);
  }

  // =========================================================================
  // Operation (c) & (d): Withdraw money & Honor daily withdrawal limit
  // =========================================================================
  public withdrawMoney(
    accountNumber: string,
    amount: number,
    narration: string = 'Cash Withdrawal',
    date: Date = new Date()
  ): OperationResult<Transaction> {
    const account = this.#accounts.get(accountNumber);
    if (!account) {
      return {
        success: false,
        message: `Account ${accountNumber} does not exist.`,
        timestamp: new Date(),
      };
    }

    return account.withdraw(amount, narration, date);
  }

  // =========================================================================
  // Operation (e): Check the balance
  // =========================================================================
  public checkBalance(accountNumber: string): OperationResult<{ balance: number; available: number }> {
    const account = this.#accounts.get(accountNumber);
    if (!account) {
      return {
        success: false,
        message: `Account ${accountNumber} not found.`,
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      message: `Current balance for ${accountNumber} is $${account.getBalance().toFixed(2)}.`,
      data: {
        balance: account.getBalance(),
        available: account.getAvailableBalance(),
      },
      timestamp: new Date(),
    };
  }

  // =========================================================================
  // Operation (f): Display Account information
  // =========================================================================
  public displayAccountInformation(
    accountNumber: string,
    date: Date = new Date()
  ): OperationResult<IAccountInformation> {
    const account = this.#accounts.get(accountNumber);
    if (!account) {
      return {
        success: false,
        message: `Account ${accountNumber} not found.`,
        timestamp: new Date(),
      };
    }

    const info = account.getAccountInformation(date);
    return {
      success: true,
      message: `Account information retrieved for ${accountNumber}.`,
      data: info,
      timestamp: new Date(),
    };
  }

  // =========================================================================
  // Operation (g): Passbook Print (from to)
  // =========================================================================
  public printPassbook(
    accountNumber: string,
    fromDate?: Date,
    toDate?: Date
  ): OperationResult<IPassbookStatement> {
    const account = this.#accounts.get(accountNumber);
    if (!account) {
      return {
        success: false,
        message: `Account ${accountNumber} not found.`,
        timestamp: new Date(),
      };
    }

    const statement = account.printPassbook(fromDate, toDate);
    return {
      success: true,
      message: `Passbook statement generated for ${accountNumber}.`,
      data: statement,
      timestamp: new Date(),
    };
  }

  /**
   * Seeds realistic sample accounts with historical transactions across different dates.
   */
  public seedSampleData(): void {
    if (this.#accounts.size > 0) return;

    const today = new Date();
    const daysAgo = (days: number): Date => {
      const d = new Date(today);
      d.setDate(today.getDate() - days);
      return d;
    };

    // 1. Corporate Salary Account - Amit Singh Rajput (User)
    const cust1 = new Customer(
      'CUST-301',
      'Amit Singh Rajput',
      'rajputamitsing002@gmail.com',
      '+91 98765 43210',
      'Flat 402, Shanti Kunj, Sector 62, Noida, UP 201301',
      'PAN-BKPRS8124K',
      daysAgo(90)
    );
    const salary = new SalaryAccount(
      'SBIN-309481021',
      cust1,
      75000,
      'Tata Consultancy Services (TCS)',
      50000,
      daysAgo(75)
    );
    salary.deposit(65000, 'Monthly Salary Credit - TCS Payroll', daysAgo(35));
    salary.withdraw(18000, 'House Rent via UPI - Axis Bank', daysAgo(25));
    salary.withdraw(3200, 'Reliance Fresh Groceries UPI', daysAgo(18));
    salary.deposit(65000, 'Monthly Salary Credit - TCS Payroll', daysAgo(5));
    salary.withdraw(8500, 'ATM Cash Withdrawal (SBI Connaught Place)', today); // Today's withdrawal: ₹8,500 towards ₹50,000 limit
    salary.applyPeriodicInterest(daysAgo(1));
    this.#accounts.set(salary.accountNumber, salary);
    this.#customers.set(cust1.id, cust1);

    // 2. Savings Bank Account - Rahul Sharma
    const cust2 = new Customer(
      'CUST-101',
      'Rahul Sharma',
      'rahul.sharma@outlook.in',
      '+91 98112 34567',
      '14/B, Block C, Karol Bagh, New Delhi, Delhi 110005',
      'AADHAAR-4892-1094-8219',
      daysAgo(60)
    );
    const savings = new SavingsAccount('SBIN-100294812', cust2, 35000, 25000, daysAgo(50));
    savings.deposit(15000, 'Fixed Deposit Quarterly Interest', daysAgo(30));
    savings.withdraw(4500, 'Electricity Bill Payment - BSES Rajdhani', daysAgo(20));
    savings.withdraw(3000, 'Amazon India Online Shopping', daysAgo(10));
    savings.deposit(8000, 'Freelance Consulting Payment via NEFT', daysAgo(3));
    savings.withdraw(5000, 'ATM Cash Withdrawal (SBI Green Channel)', today); // Today's withdrawal: ₹5,000 towards ₹25,000 limit
    savings.applyPeriodicInterest(daysAgo(1));
    this.#accounts.set(savings.accountNumber, savings);
    this.#customers.set(cust2.id, cust2);

    // 3. Current Account - Priya Patel (Patel Enterprises)
    const cust3 = new Customer(
      'CUST-201',
      'Priya Patel (Patel Enterprises)',
      'accounts@patelenterprises.in',
      '+91 99201 88765',
      '301, Commercial Hub, Nariman Point, Mumbai, Maharashtra 400021',
      'GSTIN-27AABCP1234F1Z5',
      daysAgo(120)
    );
    const current = new CurrentAccount('SBIN-200481950', cust3, 150000, 200000, 100000, daysAgo(100));
    current.deposit(120000, 'Client RTGS Receipt - TexFab Ltd', daysAgo(40));
    current.withdraw(48000, 'Raw Material Vendor Payment via NEFT', daysAgo(25));
    current.withdraw(25000, 'Commercial Office Monthly Lease', daysAgo(12));
    current.deposit(95000, 'Export Invoice Settlement Payment', daysAgo(2));
    current.withdraw(20000, 'Commercial Logistics & Freight Clearing', today); // Today's withdrawal: ₹20,000 towards ₹2,00,000 limit
    this.#accounts.set(current.accountNumber, current);
    this.#customers.set(cust3.id, cust3);
  }
}
