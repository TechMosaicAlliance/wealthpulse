import { TrendingDown, TrendingUp } from "lucide-react";

interface GainLossBadgeProps {
  pct: number;
  className?: string;
}

export function GainLossBadge({ pct, className = "" }: GainLossBadgeProps) {
  const isPositive = pct >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "text-gains" : "text-losses";
  const bgClass = isPositive
    ? "bg-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.25)]"
    : "bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.25)]";

  return (
    <span
      data-ocid="gain_loss_badge"
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${bgClass} ${colorClass} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {isPositive ? "+" : ""}
      {pct.toFixed(2)}%
    </span>
  );
}
