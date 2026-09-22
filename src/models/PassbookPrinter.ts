/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BankAccount } from './BankAccount';
import { IPassbookEntry, IPassbookStatement, TransactionType } from './types';

/**
 * Passbook Printer utility class.
 * Enforces requirement (g): Passbook Print (from to).
 * Demonstrates: Single Responsibility Principle (SRP), Separation of Concerns, Formatter pattern.
 */
export class PassbookPrinter {
  private static readonly BANK_NAME = 'State Bank of India (भारतीय स्टेट बैंक)';
  private static readonly BRANCH_NAME = 'Connaught Place Main Branch, New Delhi';
  private static readonly IFSC_CODE = 'SBIN0001048';

  /**
   * Generates a formal passbook statement filtered between fromDate and toDate.
   */
  public static generateStatement(
    account: BankAccount,
    fromDate?: Date,
    toDate?: Date
  ): IPassbookStatement {
    const allTxns = account.transactions;

    // Normalize boundary dates
    const start = fromDate ? new Date(fromDate) : null;
    if (start) {
      start.setHours(0, 0, 0, 0);
    }

    const end = toDate ? new Date(toDate) : null;
    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    // Filter transactions within date window
    const filteredTxns = allTxns.filter((txn) => {
      const time = txn.timestamp.getTime();
      if (start && time < start.getTime()) return false;
      if (end && time > end.getTime()) return false;
      return true;
    });

    // Determine Opening Balance
    let openingBalance = 0;
    if (start && allTxns.length > 0) {
      // Find the last transaction prior to start date
      const priorTxns = allTxns.filter((t) => t.timestamp.getTime() < start.getTime());
      if (priorTxns.length > 0) {
        openingBalance = priorTxns[priorTxns.length - 1].balanceAfter;
      }
    }

    let totalDebits = 0;
    let totalCredits = 0;

    const entries: IPassbookEntry[] = filteredTxns.map((txn, index) => {
      const isDebit = txn.type === TransactionType.WITHDRAWAL || txn.type === TransactionType.FEE;
      const isCredit = txn.type === TransactionType.DEPOSIT || txn.type === TransactionType.INTEREST;

      const debit = isDebit ? txn.amount : null;
      const credit = isCredit ? txn.amount : null;

      if (debit) totalDebits += debit;
      if (credit) totalCredits += credit;

      return {
        entryNumber: index + 1,
        date: txn.dateStr,
        particulars: txn.narration,
        referenceNo: txn.referenceNumber,
        debit,
        credit,
        balance: txn.balanceAfter,
        balanceType: txn.balanceAfter >= 0 ? 'Cr' : 'Dr',
      };
    });

    const closingBalance =
      filteredTxns.length > 0
        ? filteredTxns[filteredTxns.length - 1].balanceAfter
        : openingBalance;

    const fromDateStr = start ? start.toISOString().split('T')[0] : (allTxns[0]?.dateStr || 'Inception');
    const toDateStr = end ? end.toISOString().split('T')[0] : (new Date().toISOString().split('T')[0]);

    return {
      accountNumber: account.accountNumber,
      accountHolder: account.customer.fullName,
      accountType: account.getAccountType(),
      currency: 'INR (₹)',
      branchName: PassbookPrinter.BRANCH_NAME,
      ifscCode: PassbookPrinter.IFSC_CODE,
      fromDate: fromDateStr,
      toDate: toDateStr,
      openingBalance: Math.round(openingBalance * 100) / 100,
      closingBalance: Math.round(closingBalance * 100) / 100,
      totalDebits: Math.round(totalDebits * 100) / 100,
      totalCredits: Math.round(totalCredits * 100) / 100,
      entries,
      generatedAt: new Date(),
    };
  }
}
