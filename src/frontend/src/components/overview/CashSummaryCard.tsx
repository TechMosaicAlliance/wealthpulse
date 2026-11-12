import { AccountType } from "@/backend";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";
import { useAccounts, useNetWorth } from "@/hooks/useQueries";
import { TrendingUp, Wallet } from "lucide-react";

export function CashSummaryCard() {
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
  const { data: netWorth, isLoading: loadingNW } = useNetWorth();
  const { format } = useCurrency();

  const liquidAccounts = (accounts ?? []).filter(
    (a) => a.accountType === AccountType.Liquid,
  );
  const totalLiquid = liquidAccounts.reduce(
    (sum, a) => sum + Number(a.balance) / 100,
    0,
  );

  const isLoading = loadingAccounts || loadingNW;

  return (
    <GlassCard className="space-y-3" data-ocid="overview.cash_summary_card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <span className="font-body text-sm text-muted-foreground">
            Liquid Cash
          </span>
        </div>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
          {liquidAccounts.length} account
          {liquidAccounts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <Skeleton
          className="h-9 w-40 rounded-lg"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
      ) : (
        <p
          className="font-display text-3xl font-bold tracking-tight text-foreground"
          data-ocid="overview.liquid_balance"
        >
          {format(totalLiquid / (netWorth?.exchangeRateNgnPerUsd ?? 1600), {
            compact: false,
          })}
        </p>
      )}

      {netWorth && !isLoading && (
        <div className="flex items-center gap-1.5 border-t border-white/5 pt-2">
          <TrendingUp className="h-3.5 w-3.5 text-gains" />
          <span className="text-xs text-muted-foreground">
            Total Net Worth:{" "}
            <span className="font-semibold text-foreground">
              {format(netWorth.totalUsd, { compact: true })}
            </span>
          </span>
        </div>
      )}
    </GlassCard>
  );
}
