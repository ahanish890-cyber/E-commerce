/**
 * Shared Indian Rupee (INR) currency formatting utility.
 * Formats numerical values using the standard Indian numbering system (e.g., ₹1,499, ₹12,999, ₹1,50,000).
 */

export function formatINR(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(num)) return '₹0';

  const formatted = Math.round(num).toLocaleString('en-IN');
  return `₹${formatted}`;
}

export function formatINRNumber(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return '0';
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(num)) return '0';
  return Math.round(num).toLocaleString('en-IN');
}

export default formatINR;

