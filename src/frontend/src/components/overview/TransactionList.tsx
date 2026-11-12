import { TransactionCategory } from "@/backend";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";
import { useLoadDemoData, useTransactions } from "@/hooks/useQueries";
import type { TransactionView } from "@/types";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  Percent,
  Repeat2,
  TrendingUp,
} from "lucide-react";

const CATEGORY_META: Record<
  TransactionCategory,
  { label: string; icon: React.ElementType; color: string }
> = {
  [TransactionCategory.Expense]: {
    label: "Expense",
    icon: ArrowUpRight,
    color: "text-losses",
  },
  [TransactionCategory.Income]: {
    label: "Income",
    icon: ArrowDownLeft,
    color: "text-gains",
  },
  [TransactionCategory.Transfer]: {
    label: "Transfer",
    icon: Repeat2,
    color: "text-muted-foreground",
  },
  [TransactionCategory.Investment]: {
    label: "Investment",
    icon: TrendingUp,
    color: "text-primary",
  },
  [TransactionCategory.Dividend]: {
    label: "Dividend",
    icon: Percent,
    color: "text-gains",
  },
  [TransactionCategory.Interest]: {
    label: "Interest",
    icon: Coins,
    color: "text-gains",
  },
};

function formatDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
}

function TxRow({ tx, idx }: { tx: TransactionView; idx: number }) {
  const { format, exchangeRate } = useCurrency();
  const meta = CATEGORY_META[tx.category];
  const Icon = meta.icon;
  const amountUsd = Number(tx.amount) / 100 / exchangeRate;
  const isDebit =
    tx.category === TransactionCategory.Expense ||
    tx.category === TransactionCategory.Transfer;

  return (
    <div
      className="flex items-center gap-3 py-2.5"
      data-ocid={`overview.transaction.item.${idx + 1}`}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/5">
        <Icon className={`h-4 w-4 ${meta.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {tx.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {meta.label} · {formatDate(tx.date)}
        </p>
      </div>
      <span
        className={`flex-shrink-0 text-sm font-semibold ${
          isDebit ? "text-losses" : "text-gains"
        }`}
      >
        {isDebit ? "-" : "+"}
        {format(Math.abs(amountUsd))}
      </span>
    </div>
  );
}

function EmptyTransactions() {
  const { mutate: loadDemo, isPending } = useLoadDemoData();
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 p-8 text-center"
      data-ocid="overview.transaction_list.empty_state"
    >
      <TrendingUp className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">
        No investment purchases yet
      </p>
      <button
        type="button"
        data-ocid="overview.transaction_list.load_demo_button"
        onClick={() => loadDemo()}
        disabled={isPending}
        className="mt-1 rounded-xl bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-smooth hover:bg-primary/25 disabled:opacity-50"
      >
        {isPending ? "Loading…" : "Try with Sample Data"}
      </button>
    </div>
  );
}

export function TransactionList() {
  const { data: txns, isLoading } = useTransactions();

  const investmentTxns = (txns ?? []).filter(
    (tx) => tx.category === TransactionCategory.Investment,
  );

  const recent = investmentTxns
    .slice()
    .sort((a, b) => Number(b.date - a.date))
    .slice(0, 10);

  return (
    <div data-ocid="overview.transaction_list">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-foreground">
          Recent Investment Activity
        </h2>
        <span className="text-xs text-muted-foreground">
          {investmentTxns.length} investment
          {investmentTxns.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="glass rounded-2xl">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-12 w-full rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyTransactions />
        ) : (
          <div className="divide-y divide-white/5 px-4">
            {recent.map((tx, i) => (
              <TxRow key={String(tx.id)} tx={tx} idx={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
