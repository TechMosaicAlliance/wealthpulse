import { AccountType } from "@/backend";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/useCurrency";
import type { AccountView } from "@/types";
import { Building2, Pencil, Trash2, TrendingUp } from "lucide-react";

interface AccountCardProps {
  account: AccountView;
  idx: number;
  onEdit: (account: AccountView) => void;
  onDelete: (id: bigint) => void;
}

export function AccountCard({
  account,
  idx,
  onEdit,
  onDelete,
}: AccountCardProps) {
  const { format, exchangeRate } = useCurrency();
  // balance is in kobo (NGN cents); convert to NGN then to USD for format()
  const balanceNgn = Number(account.balance) / 100;
  const balanceUsd = balanceNgn / exchangeRate;
  const isLiquid = account.accountType === AccountType.Liquid;

  return (
    <GlassCard
      className="space-y-3"
      data-ocid={`accounts.account_card.item.${idx + 1}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
              isLiquid ? "bg-primary/20" : "bg-orange-500/20"
            }`}
          >
            {isLiquid ? (
              <Building2
                className="h-4.5 w-4.5 text-primary"
                style={{ width: "18px", height: "18px" }}
              />
            ) : (
              <TrendingUp
                className="text-warning"
                style={{ width: "18px", height: "18px" }}
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {account.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {account.institution}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-white/10"
            onClick={() => onEdit(account)}
            data-ocid={`accounts.edit_button.${idx + 1}`}
            aria-label="Edit account"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-red-500/10"
            onClick={() => onDelete(account.id)}
            data-ocid={`accounts.delete_button.${idx + 1}`}
            aria-label="Delete account"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-white/5 pt-2">
        <div>
          <p className="font-display text-xl font-bold text-foreground">
            {format(balanceUsd)}
          </p>
          <p className="text-xs text-muted-foreground">
            ₦{balanceNgn.toLocaleString("en-NG", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={`text-xs ${
            isLiquid
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-orange-500/30 bg-orange-500/10 text-warning"
          }`}
        >
          {account.accountType}
        </Badge>
      </div>

      {account.isDemo && (
        <p className="text-xs text-muted-foreground/50">Demo data</p>
      )}
    </GlassCard>
  );
}
