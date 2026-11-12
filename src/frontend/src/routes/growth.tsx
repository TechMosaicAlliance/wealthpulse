import { AssetTickerList } from "@/components/growth/AssetTickerList";
import { PassiveIncomeTable } from "@/components/growth/PassiveIncomeTable";
import { RiskBalanceIndicator } from "@/components/growth/RiskBalanceIndicator";
import { VolatilityHeatmap } from "@/components/growth/VolatilityHeatmap";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssets, useFetchPrices } from "@/hooks/useQueries";
import { createRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Route as rootRoute } from "./__root";

function GrowthPage() {
  const { data: assets, isLoading } = useAssets();
  const fetchPrices = useFetchPrices();

  async function handleRefreshPrices() {
    const tickers = (assets ?? []).map((a) => a.ticker);
    if (!tickers.length) {
      toast.info("No assets to refresh");
      return;
    }
    try {
      await fetchPrices.mutateAsync(tickers);
      toast.success("Prices refreshed");
    } catch {
      toast.error("Failed to refresh prices");
    }
  }

  return (
    <div
      data-ocid="growth.page"
      className="min-h-screen space-y-5 px-4 pb-24 pt-4 text-foreground"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Growth
        </h1>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5 border-white/10 bg-white/5 text-xs hover:bg-white/10"
          onClick={handleRefreshPrices}
          disabled={fetchPrices.isPending || isLoading}
          data-ocid="growth.refresh_button"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${fetchPrices.isPending ? "animate-spin" : ""}`}
          />
          {fetchPrices.isPending ? "Refreshing…" : "Refresh Prices"}
        </Button>
      </div>

      {/* Risk Balance */}
      {isLoading ? (
        <Skeleton
          className="h-36 w-full rounded-xl"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
      ) : (
        <RiskBalanceIndicator />
      )}

      {/* Volatility Heatmap */}
      <div
        className="rounded-xl border border-white/8 bg-white/5 p-4"
        style={{ backdropFilter: "blur(8px)" }}
        data-ocid="growth.heatmap_card"
      >
        <VolatilityHeatmap />
      </div>

      {/* Asset Ticker List */}
      <AssetTickerList />

      {/* Passive Income */}
      <PassiveIncomeTable />
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/growth",
  component: GrowthPage,
});
