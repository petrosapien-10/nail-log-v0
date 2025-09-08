export const sanitizeAmount = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length === 1) return parts[0];
  const [integer, decimal] = parts;
  return `${integer}.${decimal.slice(0, 2)}`;
};
