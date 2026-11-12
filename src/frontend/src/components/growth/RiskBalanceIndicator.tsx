import { Skeleton } from "@/components/ui/skeleton";
import { useRiskBalance } from "@/hooks/useQueries";
import { AlertTriangle, Shield, TrendingUp, X } from "lucide-react";
import { useState } from "react";

function RiskBar({
  fortressPct,
  growthPct,
}: { fortressPct: number; growthPct: number }) {
  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
        <span>Fortress</span>
        <span>Growth</span>
      </div>
      <div className="relative flex h-4 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${fortressPct}%`,
            background: "var(--color-fortress)",
          }}
        />
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${growthPct}%`,
            background: "var(--color-growth-accent)",
          }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-xs font-semibold">
        <span style={{ color: "var(--color-fortress)" }}>
          {fortressPct.toFixed(1)}%
        </span>
        <span style={{ color: "var(--color-growth-accent)" }}>
          {growthPct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export function RiskBalanceIndicator() {
  const { data: risk, isLoading } = useRiskBalance();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  if (isLoading) {
    return (
      <div data-ocid="risk_balance.loading_state">
        <Skeleton
          className="h-32 w-full rounded-xl"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
      </div>
    );
  }

  if (!risk) return null;

  const fortressPct = 100 - risk.growthPct;

  return (
    <div data-ocid="risk_balance.section">
      {/* Aggressive banner */}
      {risk.isAggressive && !bannerDismissed && (
        <div
          data-ocid="risk_balance.warning_banner"
          className="mb-3 flex items-start gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
          <p className="flex-1 text-xs leading-relaxed text-orange-200">
            <strong>Portfolio is aggressive</strong> — consider rebalancing to
            your Fortress assets for stability.
          </p>
          <button
            type="button"
            aria-label="Dismiss warning"
            className="text-orange-400 hover:text-orange-200"
            onClick={() => setBannerDismissed(true)}
            data-ocid="risk_balance.close_button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div
        className="rounded-xl border border-white/8 bg-white/5 px-4 py-4"
        style={{ backdropFilter: "blur(8px)" }}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Risk Balance</h2>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              background: risk.isAggressive
                ? "rgba(249,115,22,0.2)"
                : "rgba(59,130,246,0.2)",
              color: risk.isAggressive ? "#fb923c" : "#60a5fa",
            }}
          >
            {risk.isAggressive ? "Aggressive" : "Balanced"}
          </span>
        </div>

        <RiskBar fortressPct={fortressPct} growthPct={risk.growthPct} />

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <Shield className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-[10px] text-muted-foreground">Fortress</p>
              <p className="text-sm font-semibold text-blue-400">
                {fortressPct.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <TrendingUp className="h-4 w-4 text-orange-400" />
            <div>
              <p className="text-[10px] text-muted-foreground">Growth</p>
              <p className="text-sm font-semibold text-orange-400">
                {risk.growthPct.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
