import { TransactionCategory } from "@/backend";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";
import {
  useNetWorth,
  useNetWorthHistory,
  useTransactions,
} from "@/hooks/useQueries";
import { BarChart2 } from "lucide-react";
import { motion } from "motion/react";

function PerfBadge({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: number | null;
  isLoading: boolean;
}) {
  const isPositive = (value ?? 0) >= 0;
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-white/5 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      {isLoading || value === null ? (
        <Skeleton
          className="h-6 w-16 rounded-md"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
      ) : (
        <span
          className={`font-display text-lg font-bold ${
            isPositive ? "text-gains" : "text-losses"
          }`}
        >
          {isPositive ? "+" : ""}
          {value.toFixed(2)}%
        </span>
      )}
    </div>
  );
}

export function PortfolioPerformanceCard() {
  const { data: netWorth, isLoading: loadingNW } = useNetWorth();
  const { data: history, isLoading: loadingHistory } = useNetWorthHistory();
  const { data: txns } = useTransactions();
  const { format } = useCurrency();

  const isLoading = loadingNW || loadingHistory;

  // All-time performance: compare earliest history value to current
  const sortedHistory = (history ?? [])
    .slice()
    .sort((a, b) => Number(a.timestamp - b.timestamp));

  const currentValueUsd = netWorth?.holdingsValueUsd ?? 0;
  const earliestUsd =
    sortedHistory.length > 0 ? sortedHistory[0].totalValueUsd : null;
  const allTimeReturn =
    earliestUsd && earliestUsd > 0
      ? ((currentValueUsd - earliestUsd) / earliestUsd) * 100
      : null;

  // Monthly return: compare 30-day-ago history point to now
  const thirtyDaysAgo =
    BigInt(Date.now() - 30 * 24 * 60 * 60 * 1000) * 1_000_000n;
  const monthlyHistory = sortedHistory.filter(
    (s) => s.timestamp >= thirtyDaysAgo,
  );
  const monthlyEarliestUsd =
    monthlyHistory.length > 0 ? monthlyHistory[0].totalValueUsd : null;
  const monthlyReturn =
    monthlyEarliestUsd && monthlyEarliestUsd > 0
      ? ((currentValueUsd - monthlyEarliestUsd) / monthlyEarliestUsd) * 100
      : null;

  // Total invested from investment transactions
  const totalInvested = (txns ?? [])
    .filter((t) => t.category === TransactionCategory.Investment)
    .reduce((sum, t) => sum + Number(t.amount) / 100, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
    >
      <div data-ocid="home.portfolio_performance_card">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
              <BarChart2 className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-display text-base font-semibold text-foreground">
              Investment Performance
            </h2>
          </div>
          {netWorth && !isLoading && (
            <span className="text-xs text-muted-foreground">
              {format(netWorth.holdingsValueUsd)} invested
            </span>
          )}
        </div>

        <GlassCard
          className="space-y-4"
          data-ocid="home.portfolio_performance_stats"
        >
          {/* Performance badges */}
          <div className="grid grid-cols-2 gap-3">
            <PerfBadge
              label="This Month"
              value={monthlyReturn}
              isLoading={isLoading}
            />
            <PerfBadge
              label="All Time"
              value={allTimeReturn}
              isLoading={isLoading}
            />
          </div>

          {/* Divider + value row */}
          <div className="border-t border-white/5 pt-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Portfolio Value</p>
                {isLoading ? (
                  <Skeleton
                    className="h-6 w-28 rounded-md"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                ) : (
                  <p className="font-display text-xl font-bold text-foreground">
                    {format(currentValueUsd)}
                  </p>
                )}
              </div>
              {!isLoading && totalInvested > 0 && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Cost Basis</p>
                  <p className="font-display text-sm font-semibold text-muted-foreground">
                    {format(
                      totalInvested / (netWorth?.exchangeRateNgnPerUsd ?? 1600),
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
