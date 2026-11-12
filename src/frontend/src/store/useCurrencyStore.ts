import type { CurrencyCode } from "@/types";
import { create } from "zustand";

interface CurrencyState {
  currency: CurrencyCode;
  exchangeRate: number /* NGN per 1 USD */;
  setCurrency: (c: CurrencyCode) => void;
  setExchangeRate: (rate: number) => void;
  toggle: () => void;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: "NGN",
  exchangeRate: 1600 /* fallback until API responds */,

  setCurrency: (currency) => set({ currency }),
  setExchangeRate: (exchangeRate) => set({ exchangeRate }),
  toggle: () => set({ currency: get().currency === "NGN" ? "USD" : "NGN" }),
}));
