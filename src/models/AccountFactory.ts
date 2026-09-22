/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BankAccount } from './BankAccount';
import { Customer } from './Customer';
import { SavingsAccount } from './SavingsAccount';
import { CurrentAccount } from './CurrentAccount';
import { SalaryAccount } from './SalaryAccount';
import { AccountType, CreateAccountDTO } from './types';

/**
 * Factory Design Pattern for instantiating specialized BankAccount instances.
 * Enforces requirement (a): Create an account.
 * Demonstrates: Factory Pattern, Polymorphism, Centralized Invariant Validation.
 */
export class AccountFactory {
  private static accountNumberSequence = 30948000;

  public static generateAccountNumber(): string {
    AccountFactory.accountNumberSequence += Math.floor(11 + Math.random() * 89);
    return `SBIN-${AccountFactory.accountNumberSequence}`;
  }

  public static createAccount(params: CreateAccountDTO, customer?: Customer): BankAccount {
    const cust =
      customer ||
      new Customer(
        `CUST-${Date.now().toString().slice(-6)}`,
        params.fullName,
        params.email,
        params.phone,
        params.address || 'Connaught Place, New Delhi, Delhi 110001',
        params.governmentId || `AADHAAR-XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`
      );

    const accNumber = AccountFactory.generateAccountNumber();

    switch (params.accountType) {
      case AccountType.SAVINGS:
        return new SavingsAccount(
          accNumber,
          cust,
          params.initialDeposit,
          params.customDailyLimit
        );

      case AccountType.CURRENT:
        return new CurrentAccount(
          accNumber,
          cust,
          params.initialDeposit,
          params.customDailyLimit,
          params.customOverdraft
        );

      case AccountType.SALARY:
        return new SalaryAccount(
          accNumber,
          cust,
          params.initialDeposit,
          'Tata Consultancy Services (TCS)',
          params.customDailyLimit
        );

      default:
        throw new Error(`Unsupported account type: ${params.accountType}`);
    }
  }
}
