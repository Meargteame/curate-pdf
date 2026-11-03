export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', symbol: '$', label: 'USD ($) - United States Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$) - Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$) - Australian Dollar' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥) - Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', label: 'CHF (CHF) - Swiss Franc' },
];

export function getCurrencySymbol(currencyCode?: string): string {
  if (!currencyCode) return '$';
  const matched = CURRENCY_OPTIONS.find(c => c.code.toUpperCase() === currencyCode.toUpperCase());
  if (matched) return matched.symbol;
  return currencyCode.toUpperCase() + ' ';
}

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const symbol = getCurrencySymbol(currencyCode);
  const isZeroDecimal = currencyCode.toUpperCase() === 'JPY';
  const formattedNumber = (amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  });
  return `${symbol}${formattedNumber}`;
}
