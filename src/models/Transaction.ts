/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ITransaction, TransactionType } from './types';

/**
 * Immutable Transaction record.
 * Demonstrates: Encapsulation, Factory methods, and Immutability.
 */
export class Transaction implements ITransaction {
  readonly #id: string;
  readonly #accountNumber: string;
  readonly #timestamp: Date;
  readonly #dateStr: string;
  readonly #type: TransactionType;
  readonly #amount: number;
  readonly #balanceAfter: number;
  readonly #narration: string;
  readonly #referenceNumber: string;

  constructor(
    accountNumber: string,
    type: TransactionType,
    amount: number,
    balanceAfter: number,
    narration: string,
    timestamp: Date = new Date(),
    id?: string,
    referenceNumber?: string
  ) {
    if (amount <= 0) {
      throw new Error('Transaction amount must be strictly greater than zero.');
    }

    this.#id = id || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.#accountNumber = accountNumber;
    this.#type = type;
    this.#amount = Math.round(amount * 100) / 100;
    this.#balanceAfter = Math.round(balanceAfter * 100) / 100;
    this.#narration = narration || `${type} transaction`;
    this.#timestamp = timestamp;
    this.#dateStr = timestamp.toISOString().split('T')[0];
    this.#referenceNumber =
      referenceNumber || `REF${timestamp.getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`;
  }

  public get id(): string {
    return this.#id;
  }

  public get accountNumber(): string {
    return this.#accountNumber;
  }

  public get timestamp(): Date {
    return new Date(this.#timestamp.getTime());
  }

  public get dateStr(): string {
    return this.#dateStr;
  }

  public get type(): TransactionType {
    return this.#type;
  }

  public get amount(): number {
    return this.#amount;
  }

  public get balanceAfter(): number {
    return this.#balanceAfter;
  }

  public get narration(): string {
    return this.#narration;
  }

  public get referenceNumber(): string {
    return this.#referenceNumber;
  }

  // Static Factory Methods
  public static createDeposit(
    accountNumber: string,
    amount: number,
    balanceAfter: number,
    narration: string = 'Cash Deposit',
    date: Date = new Date()
  ): Transaction {
    return new Transaction(
      accountNumber,
      TransactionType.DEPOSIT,
      amount,
      balanceAfter,
      narration,
      date
    );
  }

  public static createWithdrawal(
    accountNumber: string,
    amount: number,
    balanceAfter: number,
    narration: string = 'ATM / Cash Withdrawal',
    date: Date = new Date()
  ): Transaction {
    return new Transaction(
      accountNumber,
      TransactionType.WITHDRAWAL,
      amount,
      balanceAfter,
      narration,
      date
    );
  }

  public static createInterest(
    accountNumber: string,
    amount: number,
    balanceAfter: number,
    period: string,
    date: Date = new Date()
  ): Transaction {
    return new Transaction(
      accountNumber,
      TransactionType.INTEREST,
      amount,
      balanceAfter,
      `Interest Credited for ${period}`,
      date
    );
  }

  public toJSON(): ITransaction {
    return {
      id: this.#id,
      accountNumber: this.#accountNumber,
      timestamp: this.#timestamp,
      dateStr: this.#dateStr,
      type: this.#type,
      amount: this.#amount,
      balanceAfter: this.#balanceAfter,
      narration: this.#narration,
      referenceNumber: this.#referenceNumber,
    };
  }
}
