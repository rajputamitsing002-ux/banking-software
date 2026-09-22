/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Strategy pattern interface for Daily Withdrawal Limits.
 */
export interface IDailyLimitPolicy {
  getLimit(): number;
  setLimit(newLimit: number): void;
  canWithdraw(currentWithdrawnToday: number, requestedAmount: number): boolean;
  getRemainingLimit(currentWithdrawnToday: number): number;
}

/**
 * Standard implementation of the Daily Limit Policy.
 * Demonstrates: Strategy pattern, encapsulation, and parameter validation.
 */
export class StandardDailyLimitPolicy implements IDailyLimitPolicy {
  #limit: number;

  constructor(limit: number) {
    if (limit <= 0) {
      throw new Error('Daily withdrawal limit must be greater than zero.');
    }
    this.#limit = Math.round(limit * 100) / 100;
  }

  public getLimit(): number {
    return this.#limit;
  }

  public setLimit(newLimit: number): void {
    if (newLimit <= 0) {
      throw new Error('New daily withdrawal limit must be greater than zero.');
    }
    this.#limit = Math.round(newLimit * 100) / 100;
  }

  public canWithdraw(currentWithdrawnToday: number, requestedAmount: number): boolean {
    return currentWithdrawnToday + requestedAmount <= this.#limit + 0.0001;
  }

  public getRemainingLimit(currentWithdrawnToday: number): number {
    const remaining = this.#limit - currentWithdrawnToday;
    return remaining > 0 ? Math.round(remaining * 100) / 100 : 0;
  }
}
