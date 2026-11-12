import { useAppStore } from "@/store/useAppStore";
import type { SummaryView } from "@/types";

const OPTIONS: { value: SummaryView; label: string }[] = [
  { value: "budget", label: "Budget" },
  { value: "networth", label: "Net Worth" },
];

export function ViewToggle() {
  const summaryView = useAppStore((s) => s.summaryView);
  const setSummaryView = useAppStore((s) => s.setSummaryView);

  return (
    <div
      data-ocid="summary.view_toggle"
      className="glass-sm mx-auto flex w-full max-w-xs rounded-full p-1"
    >
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          data-ocid={`summary.view_toggle.${value}`}
          onClick={() => setSummaryView(value)}
          className={[
            "flex-1 rounded-full py-2 text-sm font-semibold transition-smooth",
            summaryView === value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
