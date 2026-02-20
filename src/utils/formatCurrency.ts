export function formatCurrency(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `€ ${value.toFixed(decimals)}`;
}

export function formatNumber(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return value.toFixed(decimals);
}
