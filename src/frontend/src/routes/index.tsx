import { LiquidCashCard } from "@/components/overview/LiquidCashCard";
import { NetWorthHeroCard } from "@/components/overview/NetWorthHeroCard";
import { PortfolioPerformanceCard } from "@/components/overview/PortfolioPerformanceCard";
import { QuickAddModal } from "@/components/overview/QuickAddModal";
import { TransactionList } from "@/components/overview/TransactionList";
import { useLoadDemoData } from "@/hooks/useQueries";
import { useAppStore } from "@/store/useAppStore";
import { createRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Route as rootRoute } from "./__root";

function DemoPromptCard() {
  const { mutate: loadDemo, isPending } = useLoadDemoData();
  return (
    <div
      data-ocid="demo.prompt_card"
      className="glass rounded-2xl p-4"
      style={{ border: "1px solid rgba(120,80,255,0.25)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-foreground">
            ✨ See your portfolio in action
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Load ₦50,000 in sample assets and transactions
          </p>
        </div>
        <button
          type="button"
          data-ocid="demo.prompt_card.load_button"
          onClick={() => loadDemo()}
          disabled={isPending}
          className="flex-shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg transition-smooth active:scale-95 disabled:opacity-50"
          style={{ boxShadow: "0 4px 16px rgba(120,80,255,0.35)" }}
        >
          {isPending ? "Loading…" : "Try Sample Data"}
        </button>
      </div>
    </div>
  );
}

function OverviewPage() {
  const setModal = useAppStore((s) => s.setModal);
  const isDemoMode = useAppStore((s) => s.isDemoMode);

  return (
    <div
      data-ocid="overview.page"
      className="min-h-screen space-y-4 pb-24 text-foreground"
    >
      {/* Page header */}
      <div className="flex items-center justify-between py-1">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Home
          </h1>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-NG", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Demo card */}
      {!isDemoMode && <DemoPromptCard />}

      {/* Net Worth Hero — tappable → Accounts */}
      <NetWorthHeroCard />

      {/* Available Liquid Cash */}
      <LiquidCashCard />

      {/* Investment Portfolio Performance */}
      <PortfolioPerformanceCard />

      {/* Recent investment activity */}
      <TransactionList />

      {/* Quick Add FAB */}
      <button
        type="button"
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:scale-95"
        style={{ boxShadow: "0 4px 24px rgba(120,80,255,0.45)" }}
        onClick={() => setModal("addTransaction", true)}
        aria-label="Add transaction"
        data-ocid="overview.add_transaction_button"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </button>

      <QuickAddModal />
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: OverviewPage,
});
