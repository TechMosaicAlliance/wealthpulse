import { AssetClass } from "@/backend";
import { AddAssetModal } from "@/components/growth/AddAssetModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssets, useDeleteAsset } from "@/hooks/useQueries";
import type { AssetView } from "@/types";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Shield,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CLASS_COLORS: Record<AssetClass, string> = {
  [AssetClass.Stock]: "#3b82f6",
  [AssetClass.ETF]: "#06b6d4",
  [AssetClass.Crypto]: "#ec4899",
  [AssetClass.Bond]: "#8b5cf6",
  [AssetClass.Cash]: "#10b981",
};

function AssetRow({ asset, idx }: { asset: AssetView; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const deleteAsset = useDeleteAsset();

  async function handleDelete() {
    try {
      await deleteAsset.mutateAsync(asset.id);
      toast.success(`${asset.ticker} removed`);
    } catch {
      toast.error("Failed to remove asset");
    }
  }

  return (
    <div
      data-ocid={`asset_list.item.${idx + 1}`}
      className="rounded-xl border border-white/8 bg-white/5 overflow-hidden transition-smooth"
    >
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {/* Icon */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
          style={{
            backgroundColor: `${CLASS_COLORS[asset.assetClass]}22`,
            color: CLASS_COLORS[asset.assetClass],
          }}
        >
          {asset.ticker.slice(0, 2)}
        </div>

        {/* Name/ticker */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{asset.ticker}</p>
          <p className="text-muted-foreground truncate text-xs">{asset.name}</p>
        </div>

        {/* Badges */}
        <div className="flex shrink-0 items-center gap-1.5">
          {asset.isFortress ? (
            <span className="flex items-center gap-0.5 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
              <Shield className="h-2.5 w-2.5" /> Fortress
            </span>
          ) : (
            <span className="flex items-center gap-0.5 rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
              <TrendingUp className="h-2.5 w-2.5" /> Growth
            </span>
          )}
          <Badge
            variant="outline"
            className="border-white/10 text-[10px]"
            style={{ color: CLASS_COLORS[asset.assetClass] }}
          >
            {asset.assetClass}
          </Badge>
          {expanded ? (
            <ChevronUp className="text-muted-foreground h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="text-muted-foreground h-3.5 w-3.5" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/8 bg-white/3 px-4 py-3">
          <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Asset Class</p>
              <p className="font-medium">{asset.assetClass}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expected Yield</p>
              <p className="font-medium text-gains">
                {asset.expectedYieldPct.toFixed(2)}% / yr
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Risk Type</p>
              <p className="font-medium">
                {asset.isFortress
                  ? "Fortress (Low Risk)"
                  : "Growth (High Risk)"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Demo</p>
              <p className="font-medium">{asset.isDemo ? "Yes" : "No"}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleDelete}
            disabled={deleteAsset.isPending}
            data-ocid={`asset_list.delete_button.${idx + 1}`}
          >
            <Trash2 className="h-3 w-3" />
            Remove Asset
          </Button>
        </div>
      )}
    </div>
  );
}

export function AssetTickerList() {
  const { data: assets, isLoading } = useAssets();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div data-ocid="asset_list.section">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">Assets</h2>
        <Button
          type="button"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => setAddOpen(true)}
          data-ocid="asset_list.add_button"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Asset
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-14 w-full rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          ))}
        </div>
      ) : !assets?.length ? (
        <div
          data-ocid="asset_list.empty_state"
          className="rounded-xl border border-white/8 bg-white/5 px-6 py-10 text-center"
        >
          <TrendingUp className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
          <p className="text-sm font-medium">No assets yet</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Add your first ticker to start tracking
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-4 gap-1.5"
            onClick={() => setAddOpen(true)}
            data-ocid="asset_list.empty_add_button"
          >
            <Plus className="h-3.5 w-3.5" /> Add Asset
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {assets.map((asset, idx) => (
            <AssetRow key={String(asset.id)} asset={asset} idx={idx} />
          ))}
        </div>
      )}

      <AddAssetModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
