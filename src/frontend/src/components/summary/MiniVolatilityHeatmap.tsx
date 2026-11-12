import { Skeleton } from "@/components/ui/skeleton";
import { useAssets, useHoldings } from "@/hooks/useQueries";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import type { AssetView, HoldingView } from "@/types";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Shield, TrendingUp } from "lucide-react";

const MAX_BLOCKS = 6;

function calcValue(asset: AssetView, holdings: HoldingView[]): number {
  return holdings
    .filter((h) => h.assetId === asset.id)
    .reduce((sum, h) => sum + h.quantity * h.purchasePrice, 0);
}

function formatCompact(n: number, currency: string, rate: number): string {
  const val = currency === "NGN" ? n * rate : n;
  const sym = currency === "NGN" ? "₦" : "$";
  if (val >= 1_000_000) return `${sym}${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${sym}${(val / 1_000).toFixed(1)}K`;
  return `${sym}${val.toFixed(0)}`;
}

export function MiniVolatilityHeatmap() {
  const { data: assets, isLoading: la } = useAssets();
  const { data: holdings, isLoading: lh } = useHoldings();
  const { currency, exchangeRate } = useCurrencyStore();

  const isLoading = la || lh;

  const blocks = (assets ?? [])
    .map((a) => ({ asset: a, value: calcValue(a, holdings ?? []) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_BLOCKS);

  const totalBlocks = (assets ?? []).length;
  const hasMore = totalBlocks > MAX_BLOCKS;

  return (
    <div data-ocid="summary.mini_heatmap">
      {/* Header row */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: "var(--color-fortress)" }}
            />
            Fortress
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: "var(--color-growth-accent)" }}
            />
            Growth
          </div>
        </div>
        <Link
          to="/growth"
          data-ocid="summary.mini_heatmap.view_full_link"
          className="flex items-center gap-0.5 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          View Full Heatmap
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Blocks */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="h-[60px] rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          ))}
        </div>
      ) : !blocks.length ? (
        <div
          data-ocid="summary.mini_heatmap.empty_state"
          className="rounded-xl border border-white/8 bg-white/5 py-5 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Add assets to see your heatmap
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {blocks.map((b, i) => {
              const cls = b.asset.isFortress
                ? "heatmap-fortress"
                : "heatmap-growth";
              return (
                <div
                  key={String(b.asset.id)}
                  data-ocid={`summary.mini_heatmap.item.${i + 1}`}
                  className={`${cls} flex min-h-[60px] flex-col items-center justify-center gap-0.5 p-2 text-center`}
                >
                  <span className="text-[11px] font-bold text-white drop-shadow">
                    {b.asset.ticker}
                  </span>
                  <span className="text-[9px] text-white/75">
                    {formatCompact(b.value, currency, exchangeRate)}
                  </span>
                  {b.asset.isFortress ? (
                    <Shield className="h-2.5 w-2.5 text-white/50" />
                  ) : (
                    <TrendingUp className="h-2.5 w-2.5 text-white/50" />
                  )}
                </div>
              );
            })}
          </div>
          {hasMore && (
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              +{totalBlocks - MAX_BLOCKS} more assets on the Growth page
            </p>
          )}
        </>
      )}
    </div>
  );
}
