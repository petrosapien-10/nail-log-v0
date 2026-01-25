/**
 * Formats a number as currency with Euro symbol
 * Returns "--" for null, undefined, NaN, or invalid values
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string or "--"
 */
export function formatCurrency(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `€ ${value.toFixed(decimals)}`;
}

/**
 * Formats a numeric value with specified decimal places
 * Returns "--" for null, undefined, NaN, or invalid values
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string or "--"
 */
export function formatNumber(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return value.toFixed(decimals);
}
