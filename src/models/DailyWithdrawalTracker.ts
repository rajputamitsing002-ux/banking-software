/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IDailyLimitPolicy } from './DailyLimitPolicy';

/**
 * Encapsulates the tracking of daily withdrawals across dates.
 * Enforces requirement (d): Honor daily withdrawal limit.
 * Demonstrates: Encapsulation, State Management, Invariant Enforcement.
 */
export class DailyWithdrawalTracker {
  // Map of date string (YYYY-MM-DD) -> total amount withdrawn on that day
  #dailyTotals: Map<string, number> = new Map();
  #policy: IDailyLimitPolicy;

  constructor(policy: IDailyLimitPolicy) {
    this.#policy = policy;
  }

  public get policy(): IDailyLimitPolicy {
    return this.#policy;
  }

  public setPolicy(newPolicy: IDailyLimitPolicy): void {
    this.#policy = newPolicy;
  }

  /**
   * Returns formatted date string (YYYY-MM-DD) in local context.
   */
  public static formatDateKey(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Retrieves the amount already withdrawn for a given date.
   */
  public getWithdrawnAmount(date: Date = new Date()): number {
    const key = DailyWithdrawalTracker.formatDateKey(date);
    return this.#dailyTotals.get(key) || 0;
  }

  /**
   * Returns remaining withdrawal limit allowed for the specified date.
   */
  public getRemainingLimit(date: Date = new Date()): number {
    const withdrawn = this.getWithdrawnAmount(date);
    return this.#policy.getRemainingLimit(withdrawn);
  }

  /**
   * Validates if the requested withdrawal amount is permissible under the daily limit.
   */
  public validateWithdrawal(amount: number, date: Date = new Date()): { allowed: boolean; reason?: string } {
    const withdrawn = this.getWithdrawnAmount(date);
    const limit = this.#policy.getLimit();
    const remaining = this.#policy.getRemainingLimit(withdrawn);

    if (!this.#policy.canWithdraw(withdrawn, amount)) {
      return {
        allowed: false,
        reason: `Daily withdrawal limit exceeded. Allowed limit: $${limit.toLocaleString()}, already withdrawn today: $${withdrawn.toLocaleString()}, remaining limit: $${remaining.toLocaleString()}. You requested: $${amount.toLocaleString()}.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Records a successful withdrawal against the specified date.
   */
  public recordWithdrawal(amount: number, date: Date = new Date()): void {
    const validation = this.validateWithdrawal(amount, date);
    if (!validation.allowed) {
      throw new Error(validation.reason);
    }

    const key = DailyWithdrawalTracker.formatDateKey(date);
    const current = this.getWithdrawnAmount(date);
    this.#dailyTotals.set(key, Math.round((current + amount) * 100) / 100);
  }

  /**
   * Exports history for inspection.
   */
  public getAllDailyHistory(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [dateKey, amount] of this.#dailyTotals.entries()) {
      result[dateKey] = amount;
    }
    return result;
  }
}
