import { AssetClass } from "@/backend";
import { useAssets } from "@/hooks/useQueries";
import type { AssetView } from "@/types";

export type AccountFilter = "all" | string;

const ASSET_CLASS_LABELS: Record<string, string> = {
  [AssetClass.Stock]: "Stocks",
  [AssetClass.ETF]: "ETF",
  [AssetClass.Crypto]: "Crypto",
  [AssetClass.Bond]: "Bonds",
  [AssetClass.Cash]: "Cash",
};

export function getAssetFilterLabel(asset: AssetView): string {
  return ASSET_CLASS_LABELS[asset.assetClass as string] ?? "Other";
}

interface AccountTypeSwitcherProps {
  selected: AccountFilter;
  onChange: (filter: AccountFilter) => void;
}

export function AccountTypeSwitcher({
  selected,
  onChange,
}: AccountTypeSwitcherProps) {
  const { data: assets } = useAssets();

  // Build unique filter options from actual asset classes
  const filterOptions: AccountFilter[] = ["all"];
  const seen = new Set<string>();
  for (const a of assets ?? []) {
    const label = getAssetFilterLabel(a);
    if (!seen.has(label)) {
      seen.add(label);
      filterOptions.push(label);
    }
  }

  return (
    <div
      data-ocid="summary.account_switcher"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none"
      style={{ scrollbarWidth: "none" }}
    >
      {filterOptions.map((filter) => {
        const isActive = selected === filter;
        return (
          <button
            key={filter}
            type="button"
            data-ocid={`summary.account_filter.${filter === "all" ? "all" : filter.toLowerCase()}`}
            onClick={() => onChange(filter)}
            className={[
              "flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "border border-white/10 bg-white/5 text-muted-foreground backdrop-blur-sm hover:border-white/20 hover:bg-white/10 hover:text-foreground",
            ].join(" ")}
          >
            {filter === "all" ? "All Accounts" : filter}
          </button>
        );
      })}
    </div>
  );
}
