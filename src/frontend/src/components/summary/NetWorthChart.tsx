import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";
import { useNetWorthHistory } from "@/hooks/useQueries";
import type { NetWorthSnapshot } from "@/types";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function snapshotToPoint(
  s: NetWorthSnapshot,
  currency: string,
  _exchangeRate: number,
) {
  const ms = Number(s.timestamp) / 1_000_000;
  const d = new Date(ms);
  const month = MONTHS[d.getMonth()];
  const value = currency === "NGN" ? s.totalValueNgn : s.totalValueUsd;
  return { month, value, ts: ms };
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function GlassTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(15,15,25,0.82)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "0.75rem",
        padding: "8px 14px",
        fontSize: 12,
        color: "#fff",
      }}
    >
      <p className="font-semibold mb-0.5">{label}</p>
      <p style={{ color: "var(--color-stocks)" }}>
        {typeof payload[0]?.value === "number"
          ? payload[0].value >= 1_000_000
            ? `${payload[0].value >= 0 ? "" : "-"}${Math.abs(payload[0].value / 1_000_000).toFixed(2)}M`
            : payload[0].value >= 1_000
              ? `${payload[0].value >= 0 ? "" : "-"}${Math.abs(payload[0].value / 1_000).toFixed(1)}K`
              : payload[0].value.toFixed(0)
          : "—"}
      </p>
    </div>
  );
}

export function NetWorthChart() {
  const { data: history, isLoading } = useNetWorthHistory();
  const { currency, exchangeRate } = useCurrency();

  if (isLoading) {
    return (
      <Skeleton
        className="h-[220px] w-full rounded-xl"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
    );
  }

  const raw = history ?? [];
  // deduplicate by month label, keep last per month
  const byMonth = new Map<string, { month: string; value: number }>();
  for (const s of raw) {
    const pt = snapshotToPoint(s, currency, exchangeRate);
    byMonth.set(pt.month, pt);
  }
  const data = MONTHS.filter((m) => byMonth.has(m)).map((m) => byMonth.get(m)!);

  if (!data.length) {
    return (
      <div
        data-ocid="net_worth_chart.empty_state"
        className="flex h-[220px] items-center justify-center rounded-xl border border-white/8 bg-white/5 text-muted-foreground text-sm"
      >
        No history yet — snapshots build over time
      </div>
    );
  }

  return (
    <div data-ocid="net_worth_chart" className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="rgba(255,255,255,0.07)"
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) =>
              v >= 1_000_000
                ? `${(v / 1_000_000).toFixed(1)}M`
                : v >= 1_000
                  ? `${(v / 1_000).toFixed(0)}K`
                  : `${v}`
            }
          />
          <Tooltip content={<GlassTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 4,
              fill: "#3B82F6",
              stroke: "#0a0a0a",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
