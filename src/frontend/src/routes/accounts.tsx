import { AccountType } from "@/backend";
import { AccountCard } from "@/components/accounts/AccountCard";
import { AddAccountModal } from "@/components/accounts/AddAccountModal";
import { EditAccountModal } from "@/components/accounts/EditAccountModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts, useDeleteAccount } from "@/hooks/useQueries";
import { useAppStore } from "@/store/useAppStore";
import type { AccountView } from "@/types";
import { createRoute } from "@tanstack/react-router";
import { Building2, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Route as rootRoute } from "./__root";

function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const deleteAccount = useDeleteAccount();
  const setModal = useAppStore((s) => s.setModal);

  const [editTarget, setEditTarget] = useState<AccountView | null>(null);

  const liquid = (accounts ?? []).filter(
    (a) => a.accountType === AccountType.Liquid,
  );
  const investment = (accounts ?? []).filter(
    (a) => a.accountType === AccountType.Investment,
  );

  async function handleDelete(id: bigint) {
    try {
      await deleteAccount.mutateAsync(id);
      toast.success("Account removed");
    } catch {
      toast.error("Could not delete account");
    }
  }

  function renderSection(
    title: string,
    icon: React.ReactNode,
    items: AccountView[],
    idxOffset: number,
  ) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-display text-base font-semibold text-foreground">
            {title}
          </h2>
          <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
            {items.length}
          </span>
        </div>
        {items.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 py-8 text-center"
            data-ocid={`accounts.${title.toLowerCase()}_empty_state`}
          >
            <p className="text-sm text-muted-foreground">
              No {title.toLowerCase()} accounts
            </p>
            <p className="text-xs text-muted-foreground/60">Tap + to add one</p>
          </div>
        ) : (
          items.map((a, i) => (
            <AccountCard
              key={String(a.id)}
              account={a}
              idx={idxOffset + i}
              onEdit={setEditTarget}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div
      data-ocid="accounts.page"
      className="min-h-screen space-y-6 pb-24 text-foreground"
    >
      {/* Header */}
      <div className="flex items-center justify-between py-1">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Accounts
        </h1>
        <Button
          type="button"
          size="sm"
          className="gap-1.5 bg-primary text-primary-foreground"
          onClick={() => setModal("addAccount", true)}
          data-ocid="accounts.add_account_button"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-28 w-full rounded-2xl"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          ))}
        </div>
      ) : (
        <>
          {renderSection(
            "Liquid",
            <Building2 className="h-4 w-4 text-primary" />,
            liquid,
            0,
          )}
          {renderSection(
            "Investment",
            <TrendingUp className="h-4 w-4 text-warning" />,
            investment,
            liquid.length,
          )}
        </>
      )}

      <AddAccountModal />
      <EditAccountModal
        account={editTarget}
        onClose={() => setEditTarget(null)}
      />
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accounts",
  component: AccountsPage,
});
