import { TransactionCategory } from "@/backend";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";
import { useNetWorth, useTransactions } from "@/hooks/useQueries";
import type { TransactionView } from "@/types";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  [TransactionCategory.Expense]: "#EF4444",
  [TransactionCategory.Income]: "#10B981",
  [TransactionCategory.Investment]: "#3B82F6",
  [TransactionCategory.Transfer]: "#8B5CF6",
  [TransactionCategory.Dividend]: "#F59E0B",
  [TransactionCategory.Interest]: "#06B6D4",
};

function toUsd(amount: bigint): number {
  return Number(amount) / 100;
}

function currentMonthTxns(txns: TransactionView[]): TransactionView[] {
  const now = new Date();
  return txns.filter((t) => {
    const d = new Date(Number(t.date) / 1_000_000);
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  });
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}
function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className="glass-sm flex flex-col gap-1 p-4">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span
        className="font-display text-xl font-bold"
        style={accent ? { color: accent } : {}}
      >
        {value}
      </span>
      {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

export function BudgetView() {
  const { data: txns, isLoading: lt } = useTransactions();
  const { data: netWorth, isLoading: ln } = useNetWorth();
  const { format } = useCurrency();

  if (lt || ln) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              className="h-20 rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          ))}
        </div>
        <Skeleton
          className="h-[180px] rounded-xl"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
      </div>
    );
  }

  const monthTxns = currentMonthTxns(txns ?? []);

  // Split income / expense
  const monthIncome = monthTxns
    .filter(
      (t) =>
        t.category === TransactionCategory.Income ||
        t.category === TransactionCategory.Dividend ||
        t.category === TransactionCategory.Interest,
    )
    .reduce((s, t) => s + toUsd(t.amount), 0);

  const monthExpense = monthTxns
    .filter((t) => t.category === TransactionCategory.Expense)
    .reduce((s, t) => s + Math.abs(toUsd(t.amount)), 0);

  const burnRate =
    monthIncome > 0 ? Math.min((monthExpense / monthIncome) * 100, 999) : 0;
  const savingsRatio =
    monthIncome > 0
      ? Math.max(((monthIncome - monthExpense) / monthIncome) * 100, 0)
      : 0;

  // Cash from netWorth
  const totalCash = netWorth?.liquidBalanceNgn ?? 0; // already in NGN — show directly
  const totalCashUsd = totalCash / (netWorth?.exchangeRateNgnPerUsd ?? 1600);

  // Category breakdown for donut
  const catTotals = new Map<string, number>();
  for (const t of monthTxns) {
    const cat = t.category as string;
    catTotals.set(cat, (catTotals.get(cat) ?? 0) + Math.abs(toUsd(t.amount)));
  }
  const donutData = Array.from(catTotals.entries())
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] ?? "#64748B",
    }));

  const burnAccent =
    burnRate > 80
      ? "var(--color-losses)"
      : burnRate > 60
        ? "var(--color-warning)"
        : "var(--color-gains)";
  const savingsAccent =
    savingsRatio >= 20
      ? "var(--color-gains)"
      : savingsRatio >= 10
        ? "var(--color-warning)"
        : "var(--color-losses)";

  return (
    <div data-ocid="budget_view" className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Burn Rate"
          value={`${burnRate.toFixed(1)}%`}
          sub="expenses / income"
          accent={burnAccent}
        />
        <StatCard
          label="Savings Ratio"
          value={`${savingsRatio.toFixed(1)}%`}
          sub="saved this month"
          accent={savingsAccent}
        />
        <StatCard
          label="Monthly Expense"
          value={format(monthExpense, { compact: true })}
          sub={`${monthTxns.filter((t) => t.category === TransactionCategory.Expense).length} transactions`}
        />
        <StatCard
          label="Total Cash"
          value={format(totalCashUsd, { compact: true })}
          sub="liquid balance"
        />
      </div>

      {/* Expense donut */}
      <div className="glass-sm p-4">
        <h3 className="mb-3 text-sm font-semibold">Monthly Breakdown</h3>
        {donutData.length === 0 ? (
          <div
            data-ocid="budget_view.empty_state"
            className="flex h-[150px] items-center justify-center text-muted-foreground text-sm"
          >
            No transactions this month
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-[140px] w-[140px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={64}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="truncate text-xs text-muted-foreground">
                    {d.name}
                  </span>
                  <span className="ml-auto text-xs font-semibold">
                    {format(d.value, { compact: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
