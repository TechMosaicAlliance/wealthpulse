import { AccountType } from "@/backend";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";
import { useAccounts, useNetWorth } from "@/hooks/useQueries";
import { Banknote } from "lucide-react";
import { motion } from "motion/react";

export function LiquidCashCard() {
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
  const { data: netWorth, isLoading: loadingNW } = useNetWorth();
  const { format } = useCurrency();

  const isLoading = loadingAccounts || loadingNW;

  const liquidAccounts = (accounts ?? []).filter(
    (a) => a.accountType === AccountType.Liquid,
  );
  const liquidUsd = netWorth
    ? netWorth.liquidBalanceNgn / netWorth.exchangeRateNgnPerUsd
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
    >
      <GlassCard
        data-ocid="home.liquid_cash_card"
        className="flex items-center gap-4"
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
          <Banknote className="h-5 w-5 text-gains" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Available Cash
          </p>
          {isLoading ? (
            <Skeleton
              className="mt-1 h-7 w-32 rounded-md"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          ) : (
            <p
              className="font-display text-2xl font-bold text-foreground"
              data-ocid="home.liquid_cash_value"
            >
              {format(liquidUsd)}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-muted-foreground">
            {liquidAccounts.length} bank{liquidAccounts.length !== 1 ? "s" : ""}
          </span>
        </div>
      </GlassCard>
    </motion.div>
  );
}
