import { AccountType, TransactionCategory } from "@/backend";
import {
  type AccountFilter,
  AccountTypeSwitcher,
} from "@/components/summary/AccountTypeSwitcher";
import { MiniVolatilityHeatmap } from "@/components/summary/MiniVolatilityHeatmap";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";
import {
  useConvertTrade,
  useDetectedTrades,
  useDismissTrade,
} from "@/hooks/useEmailScan";
import {
  useAccounts,
  useNetWorth,
  useNetWorthHistory,
  usePassiveIncome,
  useTransactions,
} from "@/hooks/useQueries";
import { useAppStore } from "@/store/useAppStore";
import { createRoute } from "@tanstack/react-router";
import { Bot, CheckCircle2, ChevronDown, Mail, X } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Route as rootRoute } from "./__root";

/* ── helpers ── */
function formatShort(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

const DONUT_COLORS = {
  Stocks: "#3b82f6",
  ETF: "#06b6d4",
  Crypto: "#ec4899",
  Bonds: "#8b5cf6",
  Cash: "#10b981",
};

/* ── sub-components ── */
function NetWorthChart() {
  const { data: history, isLoading } = useNetWorthHistory();
  const { format, currency } = useCurrency();

  const chartData = (history ?? []).map((s, i) => ({
    name:
      i === 0
        ? "Jan"
        : new Date(Number(s.timestamp / 1_000_000n)).toLocaleDateString(
            "en-NG",
            {
              month: "short",
            },
          ),
    value: currency === "NGN" ? s.totalValueNgn : s.totalValueUsd,
  }));

  if (isLoading) {
    return (
      <Skeleton
        className="h-48 w-full rounded-xl"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No history yet — add assets to start tracking
      </div>
    );
  }

  const first = chartData[0]?.value ?? 0;
  const last = chartData[chartData.length - 1]?.value ?? 0;
  const gainPct = first > 0 ? ((last - first) / first) * 100 : 0;
  const isGain = gainPct >= 0;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-bold tracking-tight">
          {format(last)}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            isGain ? "bg-gains/10 text-gains" : "bg-losses/10 text-losses"
          }`}
        >
          {isGain ? "+" : ""}
          {gainPct.toFixed(1)}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 0, left: -24, bottom: 0 }}
        >
          <defs>
            <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isGain ? "#10b981" : "#ef4444"}
                stopOpacity={0.35}
              />
              <stop
                offset="95%"
                stopColor={isGain ? "#10b981" : "#ef4444"}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatShort}
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15,15,20,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "0.75rem",
              fontSize: "12px",
            }}
            formatter={(v: number) => [format(v), "Net Worth"]}
            labelStyle={{ color: "rgba(255,255,255,0.5)" }}
            itemStyle={{ color: isGain ? "#10b981" : "#ef4444" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={isGain ? "#10b981" : "#ef4444"}
            strokeWidth={2}
            fill="url(#nwGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function AllocationDonut() {
  const { data: netWorth, isLoading } = useNetWorth();
  const { format } = useCurrency();

  if (isLoading) {
    return (
      <Skeleton
        className="mx-auto h-40 w-40 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
    );
  }

  if (!netWorth) return null;

  const slices = [
    {
      name: "Liquid",
      value: netWorth.liquidBalanceNgn,
      color: DONUT_COLORS.Cash,
    },
    {
      name: "Holdings",
      value: netWorth.holdingsValueNgn,
      color: DONUT_COLORS.Stocks,
    },
  ].filter((s) => s.value > 0);

  if (!slices.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No allocation data yet
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={slices}
            cx="50%"
            cy="50%"
            innerRadius={44}
            outerRadius={64}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {slices.map((s) => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {slices.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-xs text-muted-foreground">{s.name}</span>
            <span className="ml-auto text-xs font-semibold text-foreground">
              {format(s.value / (netWorth?.exchangeRateNgnPerUsd ?? 1600))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetView() {
  const { data: txns, isLoading } = useTransactions();
  const { format, exchangeRate } = useCurrency();

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;

  function getMonthKey(ts: bigint) {
    const d = new Date(Number(ts / 1_000_000n));
    return `${d.getFullYear()}-${d.getMonth()}`;
  }

  const expenses = (txns ?? [])
    .filter(
      (t) =>
        t.category === TransactionCategory.Expense &&
        getMonthKey(t.date) === thisMonthKey,
    )
    .reduce((s, t) => s + Number(t.amount) / 100, 0);

  const income = (txns ?? [])
    .filter(
      (t) =>
        (t.category === TransactionCategory.Income ||
          t.category === TransactionCategory.Dividend ||
          t.category === TransactionCategory.Interest) &&
        getMonthKey(t.date) === thisMonthKey,
    )
    .reduce((s, t) => s + Number(t.amount) / 100, 0);

  const savingsRatio = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const expensesUsd = expenses / exchangeRate;
  const incomeUsd = income / exchangeRate;

  if (isLoading) {
    return (
      <Skeleton
        className="h-32 w-full rounded-xl"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="mt-1 font-display text-lg font-bold text-gains">
            {format(incomeUsd)}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-muted-foreground">Expenses</p>
          <p className="mt-1 font-display text-lg font-bold text-losses">
            {format(expensesUsd)}
          </p>
        </div>
      </div>
      <div className="rounded-xl bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Savings Ratio</span>
          <span
            className={`text-sm font-semibold ${
              savingsRatio >= 30
                ? "text-gains"
                : savingsRatio >= 10
                  ? "text-warning"
                  : "text-losses"
            }`}
          >
            {savingsRatio.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gains transition-all duration-700"
            style={{ width: `${Math.min(Math.max(savingsRatio, 0), 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function PassiveIncomeSummary() {
  const { data: income, isLoading } = usePassiveIncome();
  const { format } = useCurrency();

  if (isLoading) {
    return (
      <Skeleton
        className="h-20 w-full rounded-xl"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
    );
  }

  const totalMonthly = (income ?? []).reduce(
    (s, e) => s + e.monthlyExpectedUsd,
    0,
  );
  const totalAnnual = (income ?? []).reduce(
    (s, e) => s + e.annualExpectedUsd,
    0,
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-white/5 p-3">
        <p className="text-xs text-muted-foreground">Monthly Dividends</p>
        <p className="mt-1 font-display text-xl font-bold text-gains">
          {format(totalMonthly)}
        </p>
      </div>
      <div className="rounded-xl bg-white/5 p-3">
        <p className="text-xs text-muted-foreground">Annual Expected</p>
        <p className="mt-1 font-display text-xl font-bold text-foreground">
          {format(totalAnnual)}
        </p>
      </div>
    </div>
  );
}

/* ── ConfidenceBar ── */
function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? "#22c55e" : pct >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground">{pct}%</span>
    </div>
  );
}

/* ── DetectedTradesSection ── */
function DetectedTradesSection() {
  const { trades, refresh: refreshTrades } = useDetectedTrades();
  const { dismiss } = useDismissTrade();
  const { convert, isPending: isConverting } = useConvertTrade();
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();

  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<bigint | null>(null);

  const investmentAccounts = (accounts ?? []).filter(
    (a) => a.accountType === AccountType.Investment,
  );
  const defaultAccountId = selectedAccount ?? investmentAccounts[0]?.id ?? null;

  async function handleConvert(id: string) {
    if (!defaultAccountId) return;
    const trade = trades.find((t) => t.id === id);
    if (!trade) return;
    setConvertingId(id);
    try {
      await convert(trade, defaultAccountId);
      refreshTrades();
    } finally {
      setConvertingId(null);
    }
  }

  function handleDismiss(id: string) {
    dismiss(id);
    refreshTrades();
  }

  return (
    <GlassCard data-ocid="summary.detected_trades_card">
      <div className="mb-3 flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-xl"
          style={{ background: "rgba(120,80,255,0.18)" }}
        >
          <Bot className="h-3.5 w-3.5 text-primary" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          AI Detected Trades
        </p>
        {trades.length > 0 && (
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: "rgba(120,80,255,0.18)", color: "#a78bfa" }}
          >
            {trades.length} pending
          </span>
        )}
      </div>

      {investmentAccounts.length > 1 && (
        <div className="mb-3">
          <label
            htmlFor="summary-account-sel"
            className="mb-1 block text-[11px] text-muted-foreground"
          >
            Add trades to account
          </label>
          <div className="relative">
            <select
              id="summary-account-sel"
              data-ocid="summary.trades.account_select"
              value={defaultAccountId?.toString() ?? ""}
              onChange={(e) => setSelectedAccount(BigInt(e.target.value))}
              className="w-full appearance-none rounded-xl border border-white/10 px-3 py-2.5 pr-8 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {investmentAccounts.map((acc) => (
                <option
                  key={acc.id.toString()}
                  value={acc.id.toString()}
                  style={{ background: "#0f0f14" }}
                >
                  {acc.name} — {acc.institution}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      )}

      {loadingAccounts && (
        <Skeleton
          className="mb-3 h-8 w-full rounded-xl"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
      )}

      {trades.length === 0 ? (
        <div
          data-ocid="summary.trades.empty_state"
          className="flex flex-col items-center gap-2 py-6 text-center"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <Mail className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            No trades detected yet
          </p>
          <p className="text-[11px] text-muted-foreground/60">
            Enable AI scan in Settings to auto-parse trade emails
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {trades.map((trade, idx) => (
            <div
              key={trade.id}
              data-ocid={`summary.trades.item.${idx + 1}`}
              className="rounded-xl border border-white/8 p-3"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Badge
                    className="shrink-0 px-1.5 py-0 text-[10px]"
                    style={{
                      background:
                        trade.tradeType === "Buy"
                          ? "rgba(34,197,94,0.18)"
                          : "rgba(239,68,68,0.18)",
                      color: trade.tradeType === "Buy" ? "#22c55e" : "#ef4444",
                      border: "none",
                    }}
                  >
                    {trade.tradeType}
                  </Badge>
                  <span className="truncate text-xs font-semibold text-foreground">
                    {trade.assetName}
                  </span>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {trade.assetClass}
                </span>
              </div>

              <p className="mb-1.5 text-[11px] text-muted-foreground">
                {trade.amount} units ×{" "}
                <span className="font-mono">
                  $
                  {trade.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                {" = "}
                <span className="font-semibold text-foreground">
                  $
                  {(trade.amount * trade.price).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </p>

              <div className="mb-2">
                <p className="mb-0.5 text-[10px] text-muted-foreground">
                  Detection confidence
                </p>
                <ConfidenceBar value={trade.confidence} />
              </div>

              <p
                className="mb-3 truncate rounded-lg px-2 py-1.5 font-mono text-[10px] text-muted-foreground"
                style={{ background: "rgba(255,255,255,0.04)" }}
                title={trade.rawText}
              >
                {trade.rawText}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  data-ocid={`summary.trades.add_button.${idx + 1}`}
                  onClick={() => handleConvert(trade.id)}
                  disabled={
                    (isConverting && convertingId === trade.id) ||
                    !defaultAccountId
                  }
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-semibold transition-smooth active:scale-95 disabled:opacity-40"
                  style={{
                    background: "rgba(120,80,255,0.22)",
                    color: "#a78bfa",
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {isConverting && convertingId === trade.id
                    ? "Adding…"
                    : "Add to Portfolio"}
                </button>
                <button
                  type="button"
                  data-ocid={`summary.trades.dismiss_button.${idx + 1}`}
                  onClick={() => handleDismiss(trade.id)}
                  className="flex items-center justify-center rounded-xl px-3 py-2 text-[11px] transition-smooth active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                  aria-label="Dismiss trade"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

/* ── page ── */
function SummaryPage() {
  const summaryView = useAppStore((s) => s.summaryView);
  const setSummaryView = useAppStore((s) => s.setSummaryView);
  const [accountFilter, setAccountFilter] = useState<AccountFilter>("all");

  const activeFilterLabel = accountFilter !== "all" ? accountFilter : null;

  return (
    <div
      data-ocid="summary.page"
      className="min-h-screen space-y-5 pb-24 text-foreground"
    >
      {/* Account Type Switcher — top of page */}
      <AccountTypeSwitcher
        selected={accountFilter}
        onChange={setAccountFilter}
      />

      {/* Filter feedback subtitle */}
      {activeFilterLabel && (
        <div
          className="-mt-1 flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-medium text-primary"
          data-ocid="summary.filter_label"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Showing {activeFilterLabel} accounts
        </div>
      )}

      {/* Header + toggle */}
      <div className="flex items-center justify-between py-1">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {activeFilterLabel ? `${activeFilterLabel} Summary` : "Summary"}
        </h1>
        <div
          className="flex rounded-full bg-white/5 p-0.5"
          data-ocid="summary.view_toggle"
        >
          {(["budget", "networth"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setSummaryView(v)}
              data-ocid={`summary.${v}_tab`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                summaryView === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "budget" ? "Budget" : "Net Worth"}
            </button>
          ))}
        </div>
      </div>

      {summaryView === "budget" ? (
        <>
          <GlassCard>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              This Month
            </p>
            <BudgetView />
          </GlassCard>

          <GlassCard data-ocid="summary.passive_income_card">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Passive Income
            </p>
            <PassiveIncomeSummary />
          </GlassCard>
        </>
      ) : (
        <>
          <GlassCard data-ocid="summary.net_worth_chart">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net Worth — 12 Month Trend
            </p>
            <NetWorthChart />
          </GlassCard>

          <GlassCard data-ocid="summary.allocation_card">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Asset Allocation
            </p>
            <AllocationDonut />
          </GlassCard>

          <GlassCard data-ocid="summary.volatility_heatmap_card">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Volatility Heatmap
            </p>
            <MiniVolatilityHeatmap />
          </GlassCard>

          <DetectedTradesSection />
        </>
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/summary",
  component: SummaryPage,
});
