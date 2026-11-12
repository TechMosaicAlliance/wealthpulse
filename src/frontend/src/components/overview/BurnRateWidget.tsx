import { TransactionCategory } from "@/backend";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";
import { useTransactions } from "@/hooks/useQueries";
import { Flame } from "lucide-react";

function getMonthKey(ts: bigint) {
  const d = new Date(Number(ts / 1_000_000n));
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export function BurnRateWidget() {
  const { data: txns, isLoading } = useTransactions();
  const { format } = useCurrency();
  const { exchangeRate } = useCurrency();

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;

  const monthlyExpenses = (txns ?? [])
    .filter(
      (t) =>
        t.category === TransactionCategory.Expense &&
        getMonthKey(t.date) === thisMonthKey,
    )
    .reduce((sum, t) => sum + Number(t.amount) / 100, 0);

  const monthlyIncome = (txns ?? [])
    .filter(
      (t) =>
        (t.category === TransactionCategory.Income ||
          t.category === TransactionCategory.Dividend ||
          t.category === TransactionCategory.Interest) &&
        getMonthKey(t.date) === thisMonthKey,
    )
    .reduce((sum, t) => sum + Number(t.amount) / 100, 0);

  const savingsRatio =
    monthlyIncome > 0
      ? Math.max(0, ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
      : 0;

  // Convert NGN kobo amounts to USD for format()
  const expensesUsd = monthlyExpenses / exchangeRate;
  const incomeUsd = monthlyIncome / exchangeRate;

  const burnColor =
    savingsRatio >= 30
      ? "text-gains"
      : savingsRatio >= 10
        ? "text-warning"
        : "text-losses";

  return (
    <GlassCard data-ocid="overview.burn_rate_widget">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20">
          <Flame className="h-4 w-4 text-warning" />
        </div>
        <span className="font-body text-sm text-muted-foreground">
          Monthly Burn Rate
        </span>
      </div>

      {isLoading ? (
        <Skeleton
          className="h-8 w-32 rounded-lg"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
      ) : (
        <>
          <p className="font-display text-2xl font-bold text-foreground">
            {format(expensesUsd)}
          </p>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Income</span>
              <span className="text-gains">{format(incomeUsd)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Expenses</span>
              <span className="text-losses">{format(expensesUsd)}</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Savings Ratio</span>
              <span className={`font-semibold ${burnColor}`}>
                {savingsRatio.toFixed(0)}%
              </span>
            </div>
          </div>
          {/* Savings ratio bar */}
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gains transition-all duration-700"
              style={{ width: `${Math.min(savingsRatio, 100)}%` }}
            />
          </div>
        </>
      )}
    </GlassCard>
  );
}
