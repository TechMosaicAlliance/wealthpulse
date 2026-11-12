import { TransactionCategory } from "@/backend";
import { useCreateTransaction } from "@/hooks/useQueries";
import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScanFrequency = 15 | 30 | 60 | 120 | 240;

export interface EmailScanSettings {
  scanIntervalMinutes: ScanFrequency;
  lastScanAt: Date | null;
  isEnabled: boolean;
}

export interface DetectedTrade {
  id: string;
  tradeType: "Buy" | "Sell";
  assetName: string;
  assetClass: "Stock" | "Crypto" | "ETF" | "Bond" | "MutualFund";
  amount: number;
  price: number;
  currency: "USD" | "NGN";
  confidence: number;
  rawText: string;
  detectedAt: Date;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FREQUENCY_OPTIONS: { value: ScanFrequency; label: string }[] = [
  { value: 15, label: "Every 15 minutes" },
  { value: 30, label: "Every 30 minutes" },
  { value: 60, label: "Every hour" },
  { value: 120, label: "Every 2 hours" },
  { value: 240, label: "Every 4 hours" },
];

const SETTINGS_KEY = "wealthpulse-email-scan";
const TRADES_KEY = "wealthpulse-detected-trades";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readSettings(): EmailScanSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw)
      return { scanIntervalMinutes: 60, lastScanAt: null, isEnabled: false };
    const parsed = JSON.parse(raw) as {
      scanIntervalMinutes: ScanFrequency;
      lastScanAt: string | null;
      isEnabled: boolean;
    };
    return {
      ...parsed,
      lastScanAt: parsed.lastScanAt ? new Date(parsed.lastScanAt) : null,
    };
  } catch {
    return { scanIntervalMinutes: 60, lastScanAt: null, isEnabled: false };
  }
}

function writeSettings(s: EmailScanSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function readTrades(): DetectedTrade[] {
  try {
    const raw = localStorage.getItem(TRADES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<
      DetectedTrade & { detectedAt: string }
    >;
    return parsed.map((t) => ({ ...t, detectedAt: new Date(t.detectedAt) }));
  } catch {
    return [];
  }
}

function writeTrades(trades: DetectedTrade[]) {
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
}

function generateMockTrades(): DetectedTrade[] {
  const now = new Date();
  const templates: DetectedTrade[] = [
    {
      id: `trade-${Date.now()}-1`,
      tradeType: "Buy",
      assetName: "Apple Inc. (AAPL)",
      assetClass: "Stock",
      amount: 10,
      price: 185.2,
      currency: "USD",
      confidence: 0.94,
      rawText:
        "Trade confirmation: Bought 10 shares of AAPL at $185.20. Total: $1,852.00. Order #TRD-88421.",
      detectedAt: now,
    },
    {
      id: `trade-${Date.now()}-2`,
      tradeType: "Sell",
      assetName: "Bitcoin (BTC)",
      assetClass: "Crypto",
      amount: 0.05,
      price: 43200.0,
      currency: "USD",
      confidence: 0.89,
      rawText:
        "Binance alert: Sold 0.05 BTC at $43,200.00. Proceeds: $2,160.00. Tx ID: 0x8f3a…c12d.",
      detectedAt: new Date(now.getTime() - 3_600_000),
    },
    {
      id: `trade-${Date.now()}-3`,
      tradeType: "Buy",
      assetName: "ARM Holdings ETF",
      assetClass: "ETF",
      amount: 25,
      price: 62.4,
      currency: "USD",
      confidence: 0.78,
      rawText:
        "Fidelity order filled: Purchase 25 units of ARM ETF at $62.40/unit. Settlement: T+2.",
      detectedAt: new Date(now.getTime() - 7_200_000),
    },
  ];
  return templates;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useEmailScanSettings() {
  const [settings, setSettings] = useState<EmailScanSettings>(readSettings);

  const update = useCallback((patch: Partial<EmailScanSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      writeSettings(next);
      return next;
    });
  }, []);

  return { settings, update };
}

export function useDetectedTrades() {
  const [trades, setTrades] = useState<DetectedTrade[]>(readTrades);

  // Re-read from localStorage when component mounts to stay in sync
  useEffect(() => {
    setTrades(readTrades());
  }, []);

  const refresh = useCallback(() => setTrades(readTrades()), []);

  return { trades, refresh };
}

export function useSimulateEmailScan() {
  const [isPending, setIsPending] = useState(false);

  const scan = useCallback(async (): Promise<DetectedTrade[]> => {
    setIsPending(true);
    // Simulate async email parsing delay
    await new Promise((res) => setTimeout(res, 1800));

    const mock = generateMockTrades();
    const existing = readTrades();
    // Avoid duplicates by id prefix matching (re-scans get fresh IDs)
    const merged = [...existing, ...mock];
    writeTrades(merged);

    // Update lastScanAt
    const s = readSettings();
    writeSettings({ ...s, lastScanAt: new Date() });

    setIsPending(false);
    return mock;
  }, []);

  return { scan, isPending };
}

export function useDismissTrade() {
  const dismiss = useCallback((id: string) => {
    const trades = readTrades().filter((t) => t.id !== id);
    writeTrades(trades);
  }, []);

  return { dismiss };
}

export function useConvertTrade() {
  const createTx = useCreateTransaction();

  const convert = useCallback(
    async (trade: DetectedTrade, accountId: bigint) => {
      const sign = trade.tradeType === "Sell" ? -1n : 1n;
      const totalUsd = trade.amount * trade.price;
      // Store as integer cents (USD * 100) cast to bigint for backend
      const amountBigint = sign * BigInt(Math.round(totalUsd * 100));

      await createTx.mutateAsync({
        accountId,
        date: BigInt(Date.now()) * 1_000_000n, // nanoseconds
        description: `${trade.tradeType} ${trade.amount} ${trade.assetName} @ $${trade.price.toLocaleString()}`,
        isDemo: false,
        category: TransactionCategory.Investment,
        amount: amountBigint,
      });

      // Remove from detected trades after conversion
      const remaining = readTrades().filter((t) => t.id !== trade.id);
      writeTrades(remaining);
    },
    [createTx],
  );

  return { convert, isPending: createTx.isPending };
}
