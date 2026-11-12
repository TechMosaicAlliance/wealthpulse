import type { AssetId } from "@/backend";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAssets,
  usePassiveIncome,
  useUpdateAsset,
} from "@/hooks/useQueries";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import type { PassiveIncomeEntry } from "@/types";
import { DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function formatCurrency(usd: number, currency: string, rate: number): string {
  const val = currency === "NGN" ? usd * rate : usd;
  const sym = currency === "NGN" ? "₦" : "$";
  return `${sym}${val.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

function YieldCell({ entry }: { entry: PassiveIncomeEntry }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(entry.expectedYieldPct.toFixed(2));
  const updateAsset = useUpdateAsset();
  const { data: assets } = useAssets();

  async function saveYield() {
    setEditing(false);
    const pct = Number.parseFloat(val);
    if (Number.isNaN(pct) || pct === entry.expectedYieldPct) return;
    const asset = assets?.find((a) => a.id === entry.assetId);
    if (!asset) return;
    try {
      await updateAsset.mutateAsync({
        id: asset.id as AssetId,
        ticker: asset.ticker,
        name: asset.name,
        assetClass: asset.assetClass,
        isFortress: asset.isFortress,
        expectedYieldPct: pct,
        linkedAccountId: asset.linkedAccountId,
      });
      toast.success(`Yield updated for ${asset.ticker}`);
    } catch {
      toast.error("Failed to update yield");
    }
  }

  if (editing) {
    return (
      <Input
        type="number"
        min="0"
        max="100"
        step="0.01"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={saveYield}
        autoFocus
        className="h-7 w-20 border-white/10 bg-white/5 px-2 text-right text-xs"
        data-ocid={`passive_income.yield_input.${entry.ticker}`}
      />
    );
  }

  return (
    <button
      type="button"
      className="text-gains text-xs font-semibold hover:underline"
      onClick={() => setEditing(true)}
      title="Click to edit yield"
      data-ocid={`passive_income.yield_edit.${entry.ticker}`}
    >
      {entry.expectedYieldPct.toFixed(2)}%
    </button>
  );
}

export function PassiveIncomeTable() {
  const { data: entries, isLoading } = usePassiveIncome();
  const { currency, exchangeRate } = useCurrencyStore();

  const totalMonthly = (entries ?? []).reduce(
    (s, e) => s + e.monthlyExpectedUsd,
    0,
  );
  const totalYtd = (entries ?? []).reduce((s, e) => s + e.receivedYtdUsd, 0);

  return (
    <div data-ocid="passive_income.section">
      <h2 className="font-display mb-3 text-base font-semibold">
        Passive Income
      </h2>

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/8 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <DollarSign className="h-3 w-3" /> Monthly Expected
          </div>
          <p className="mt-1 text-base font-bold text-gains">
            {isLoading
              ? "—"
              : formatCurrency(totalMonthly, currency, exchangeRate)}
          </p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <TrendingUp className="h-3 w-3" /> Received YTD
          </div>
          <p className="mt-1 text-base font-bold">
            {isLoading ? "—" : formatCurrency(totalYtd, currency, exchangeRate)}
          </p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2" data-ocid="passive_income.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-14 rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          ))}
        </div>
      ) : !entries?.length ? (
        <div
          data-ocid="passive_income.empty_state"
          className="rounded-xl border border-white/8 bg-white/5 py-10 text-center"
        >
          <DollarSign className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
          <p className="text-sm font-medium">No income data yet</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Add assets with an expected yield to track dividends
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/8 bg-white/5">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-b border-white/8 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Asset</span>
            <span className="text-right">Yield</span>
            <span className="text-right">Monthly</span>
            <span className="text-right">Rcvd YTD</span>
          </div>

          {entries.map((entry, idx) => (
            <div
              key={String(entry.assetId)}
              data-ocid={`passive_income.item.${idx + 1}`}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 border-b border-white/5 px-4 py-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{entry.ticker}</p>
                <p className="text-muted-foreground truncate text-[10px]">
                  {entry.assetName}
                </p>
              </div>
              <YieldCell entry={entry} />
              <span className="text-right text-xs font-medium">
                {formatCurrency(
                  entry.monthlyExpectedUsd,
                  currency,
                  exchangeRate,
                )}
              </span>
              <span className="text-muted-foreground text-right text-xs">
                {formatCurrency(entry.receivedYtdUsd, currency, exchangeRate)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
