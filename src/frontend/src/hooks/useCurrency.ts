import { useCurrencyStore } from "@/store/useCurrencyStore";
import type { CurrencyCode } from "@/types";

/**
 * Format a USD amount to the currently active display currency.
 * amountUsd: the value in USD
 */
export function formatCurrency(
  amountUsd: number,
  currency: CurrencyCode,
  exchangeRate: number,
  options?: { compact?: boolean },
): string {
  const value = currency === "NGN" ? amountUsd * exchangeRate : amountUsd;
  const symbol = currency === "NGN" ? "₦" : "$";

  if (options?.compact) {
    if (Math.abs(value) >= 1_000_000_000) {
      return `${symbol}${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `${symbol}${(value / 1_000).toFixed(1)}K`;
    }
    return `${symbol}${value.toFixed(0)}`;
  }

  return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Hook wrapper — reads from store automatically */
export function useCurrency() {
  const { currency, exchangeRate, toggle, setCurrency } = useCurrencyStore();

  const format = (amountUsd: number, opts?: { compact?: boolean }) =>
    formatCurrency(amountUsd, currency, exchangeRate, opts);

  return { currency, exchangeRate, toggle, setCurrency, format };
}
