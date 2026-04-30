import { useState, useEffect } from 'react';
import { EXCHANGE_RATES, BASE_CURRENCY } from '../data/mock-data';

/**
 * Converts an amount from one currency to the base currency (USD).
 */
export function convertToBase(amount: number, fromCurrency: string): number {
  const rate = EXCHANGE_RATES[fromCurrency] ?? 1;
  return Math.round(amount * rate * 100) / 100;
}

/**
 * Formats a number as currency string.
 */
export function formatCurrency(amount: number, currency = BASE_CURRENCY): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Hook for real-time currency conversion.
 */
export function useCurrencyConversion(amount: number, fromCurrency: string) {
  const [converted, setConverted] = useState<number>(0);

  useEffect(() => {
    if (!amount || isNaN(amount)) {
      setConverted(0);
      return;
    }
    setConverted(convertToBase(amount, fromCurrency));
  }, [amount, fromCurrency]);

  return { converted, baseCurrency: BASE_CURRENCY };
}
