import { Skeleton } from "@/components/ui/skeleton";
import { useAssets, useHoldings } from "@/hooks/useQueries";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import type { AssetView, HoldingView } from "@/types";
import { Shield, TrendingUp } from "lucide-react";

function calcHoldingValue(asset: AssetView, holdings: HoldingView[]): number {
  const linked = holdings.filter((h) => h.assetId === asset.id);
  if (!linked.length) return 0;
  return linked.reduce((sum, h) => sum + h.quantity * h.purchasePrice, 0);
}

function formatCompact(n: number, currency: string, rate: number): string {
  const val = currency === "NGN" ? n * rate : n;
  const sym = currency === "NGN" ? "₦" : "$";
  if (val >= 1_000_000) return `${sym}${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${sym}${(val / 1_000).toFixed(1)}K`;
  return `${sym}${val.toFixed(0)}`;
}

interface AssetBlock {
  asset: AssetView;
  value: number;
}

function HeatBlock({
  block,
  currency,
  rate,
  rank,
}: { block: AssetBlock; currency: string; rate: number; rank: number }) {
  const cls = block.asset.isFortress ? "heatmap-fortress" : "heatmap-growth";
  return (
    <div
      data-ocid={`heatmap.item.${rank}`}
      className={`${cls} flex min-h-[72px] flex-col items-center justify-center gap-1 p-2 text-center cursor-default`}
    >
      <span className="text-xs font-bold text-white drop-shadow">
        {block.asset.ticker}
      </span>
      <span className="text-[10px] text-white/80">
        {formatCompact(block.value, currency, rate)}
      </span>
      {block.asset.isFortress ? (
        <Shield className="h-3 w-3 text-white/60" />
      ) : (
        <TrendingUp className="h-3 w-3 text-white/60" />
      )}
    </div>
  );
}

export function VolatilityHeatmap() {
  const { data: assets, isLoading: loadingAssets } = useAssets();
  const { data: holdings, isLoading: loadingHoldings } = useHoldings();
  const { currency, exchangeRate } = useCurrencyStore();

  const isLoading = loadingAssets || loadingHoldings;

  const blocks: AssetBlock[] = (assets ?? []).map((a) => ({
    asset: a,
    value: calcHoldingValue(a, holdings ?? []),
  }));

  // Sort: largest value first so bigger blocks feel more prominent
  blocks.sort((a, b) => b.value - a.value);

  const fortressCount = blocks.filter((b) => b.asset.isFortress).length;
  const growthCount = blocks.length - fortressCount;

  return (
    <div data-ocid="heatmap.section">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">
          Volatility Heatmap
        </h2>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-[var(--color-fortress)]" />
            Fortress ({fortressCount})
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-[var(--color-growth-accent)]" />
            Growth ({growthCount})
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="h-[72px] rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          ))}
        </div>
      ) : !blocks.length ? (
        <div
          data-ocid="heatmap.empty_state"
          className="rounded-xl border border-white/8 bg-white/5 py-8 text-center"
        >
          <p className="text-muted-foreground text-sm">
            Add assets to see your heatmap
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {blocks.map((b, i) => (
            <HeatBlock
              key={String(b.asset.id)}
              block={b}
              currency={currency}
              rate={exchangeRate}
              rank={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
