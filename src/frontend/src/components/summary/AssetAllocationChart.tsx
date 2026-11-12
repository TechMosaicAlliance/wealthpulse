import { AssetClass } from "@/backend";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssets, useHoldings } from "@/hooks/useQueries";
import type { AssetView, HoldingView } from "@/types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const SEGMENTS = [
  { key: "Stocks", color: "#3B82F6" },
  { key: "Crypto", color: "#EC4899" },
  { key: "Cash", color: "#10B981" },
];

function classifyAsset(a: AssetView): "Stocks" | "Crypto" | "Cash" | null {
  if (a.assetClass === AssetClass.Stock || a.assetClass === AssetClass.ETF)
    return "Stocks";
  if (a.assetClass === AssetClass.Crypto) return "Crypto";
  if (a.assetClass === AssetClass.Cash || a.assetClass === AssetClass.Bond)
    return "Cash";
  return null;
}

function holdingValue(asset: AssetView, holdings: HoldingView[]): number {
  return holdings
    .filter((h) => h.assetId === asset.id)
    .reduce((sum, h) => sum + h.quantity * h.purchasePrice, 0);
}

interface LegendDotProps {
  color: string;
  label: string;
  pct: number;
}
function LegendDot({ color, label, pct }: LegendDotProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="ml-auto text-xs font-semibold text-foreground">
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

interface TooltipPayload {
  name: string;
  value: number;
  payload: { color: string };
}
function GlassTooltip({
  active,
  payload,
}: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div
      style={{
        background: "rgba(15,15,25,0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "0.75rem",
        padding: "8px 12px",
        fontSize: 12,
        color: "#fff",
      }}
    >
      <p style={{ color: item.payload.color }} className="font-semibold">
        {item.name}
      </p>
      <p>{item.value.toFixed(1)}%</p>
    </div>
  );
}

export function AssetAllocationChart() {
  const { data: assets, isLoading: la } = useAssets();
  const { data: holdings, isLoading: lh } = useHoldings();

  if (la || lh) {
    return (
      <Skeleton
        className="h-[200px] w-full rounded-xl"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
    );
  }

  const totals: Record<string, number> = { Stocks: 0, Crypto: 0, Cash: 0 };

  for (const a of assets ?? []) {
    const seg = classifyAsset(a);
    if (seg) {
      totals[seg] += holdingValue(a, holdings ?? []);
    }
  }

  const total = Object.values(totals).reduce((s, v) => s + v, 0);

  if (total === 0) {
    return (
      <div
        data-ocid="allocation_chart.empty_state"
        className="flex h-[200px] items-center justify-center rounded-xl border border-white/8 bg-white/5 text-muted-foreground text-sm"
      >
        Add holdings to see allocation
      </div>
    );
  }

  const chartData = SEGMENTS.map((s) => ({
    name: s.key,
    value: total > 0 ? (totals[s.key] / total) * 100 : 0,
    color: s.color,
  })).filter((d) => d.value > 0);

  return (
    <div data-ocid="allocation_chart" className="flex items-center gap-4">
      {/* Donut */}
      <div className="h-[160px] w-[160px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={74}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<GlassTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-1 flex-col gap-3">
        {SEGMENTS.map((s) => (
          <LegendDot
            key={s.key}
            color={s.color}
            label={s.key}
            pct={total > 0 ? (totals[s.key] / total) * 100 : 0}
          />
        ))}
      </div>
    </div>
  );
}
