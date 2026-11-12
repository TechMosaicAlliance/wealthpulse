import { AccountType } from "@/backend";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";
import { useAccounts, useNetWorth } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, TrendingUp, Wallet } from "lucide-react";
import { motion } from "motion/react";

export function NetWorthHeroCard() {
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
  const { data: netWorth, isLoading: loadingNW } = useNetWorth();
  const { format, currency } = useCurrency();
  const navigate = useNavigate();

  const isLoading = loadingAccounts || loadingNW;

  const totalAccounts = (accounts ?? []).length;
  const totalNetWorthUsd = netWorth?.totalUsd ?? 0;
  const totalNetWorthNgn =
    netWorth?.totalNgn ??
    (netWorth ? netWorth.totalUsd * netWorth.exchangeRateNgnPerUsd : 0);

  const displayPrimary =
    currency === "NGN"
      ? `₦${(totalNetWorthNgn).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : format(totalNetWorthUsd);
  const displaySecondary =
    currency === "NGN"
      ? `${totalNetWorthUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `₦${totalNetWorthNgn.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <GlassCard
        variant="strong"
        data-ocid="home.net_worth_hero_card"
        className="relative overflow-hidden"
        onClick={() => navigate({ to: "/accounts" })}
      >
        {/* Subtle glow bg */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              "radial-gradient(ellipse at 70% 10%, rgba(59,130,246,0.12) 0%, transparent 65%)",
          }}
        />

        {/* Header row */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Net Worth
              </p>
              {!isLoading && (
                <p className="text-xs text-muted-foreground">
                  {totalAccounts} account{totalAccounts !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs text-muted-foreground">
            <span>View accounts</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Main value */}
        <div className="relative mt-4">
          {isLoading ? (
            <>
              <Skeleton
                className="h-12 w-48 rounded-lg"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
              <Skeleton
                className="mt-2 h-4 w-28 rounded-md"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            </>
          ) : (
            <>
              <p
                className="font-display text-4xl font-bold tracking-tight text-foreground"
                data-ocid="home.net_worth_value"
              >
                {displayPrimary}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {displaySecondary}
              </p>
            </>
          )}
        </div>

        {/* Footer stats */}
        {netWorth && !isLoading && (
          <div className="relative mt-4 flex items-center gap-1.5 border-t border-white/5 pt-3">
            <TrendingUp className="h-3.5 w-3.5 text-gains" />
            <span className="text-xs text-muted-foreground">
              Liquid:{" "}
              <span className="font-semibold text-foreground">
                {format(
                  netWorth.liquidBalanceNgn / netWorth.exchangeRateNgnPerUsd,
                )}
              </span>
              <span className="mx-2 text-white/20">·</span>
              Invested:{" "}
              <span className="font-semibold text-foreground">
                {format(netWorth.holdingsValueUsd)}
              </span>
            </span>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
