/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a number to Indian Rupee (INR) format with the ₹ symbol.
 * Example: 150000 -> ₹1,50,000.00
 */
export function formatINR(amount: number, includeDecimals: boolean = true): string {
  if (isNaN(amount)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Formats a number in Indian style without currency symbol.
 * Example: 150000 -> 1,50,000
 */
export function formatIndianNumber(amount: number): string {
  if (isNaN(amount)) return '0';
  return new Intl.NumberFormat('en-IN').format(amount);
}
