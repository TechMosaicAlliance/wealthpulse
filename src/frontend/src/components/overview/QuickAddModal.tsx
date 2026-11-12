import { AccountType, TransactionCategory } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts, useCreateTransaction } from "@/hooks/useQueries";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: TransactionCategory.Income, label: "Income" },
  { value: TransactionCategory.Expense, label: "Expense" },
  { value: TransactionCategory.Investment, label: "Investment" },
  { value: TransactionCategory.Transfer, label: "Transfer" },
  { value: TransactionCategory.Dividend, label: "Dividend" },
  { value: TransactionCategory.Interest, label: "Interest" },
];

export function QuickAddModal() {
  const open = useAppStore((s) => s.modalStates.addTransaction);
  const setModal = useAppStore((s) => s.setModal);
  const isDemoMode = useAppStore((s) => s.isDemoMode);
  const { data: accounts } = useAccounts();
  const createTx = useCreateTransaction();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TransactionCategory>(
    TransactionCategory.Expense,
  );
  const [accountId, setAccountId] = useState("");

  function handleClose() {
    setModal("addTransaction", false);
    setDescription("");
    setAmount("");
    setCategory(TransactionCategory.Expense);
    setAccountId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !amount || !accountId) {
      toast.error("Please fill all fields");
      return;
    }
    const amountNum = Number.parseFloat(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    // Amount stored as kobo (NGN cents × 100)
    const amountKobo = BigInt(Math.round(amountNum * 100));
    try {
      await createTx.mutateAsync({
        description: description.trim(),
        amount: amountKobo,
        category,
        accountId: BigInt(accountId),
        date: BigInt(Date.now()) * 1_000_000n,
        isDemo: isDemoMode,
      });
      toast.success("Transaction added");
      handleClose();
    } catch {
      toast.error("Failed to add transaction");
    }
  }

  const liquidAccounts = (accounts ?? []).filter(
    (a) => a.accountType === AccountType.Liquid,
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-w-[92vw] rounded-2xl border-white/10 p-5"
        style={{
          background: "rgba(15,15,20,0.97)",
          backdropFilter: "blur(20px)",
        }}
        data-ocid="overview.quick_add_modal.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold">
            Quick Add Transaction
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="qa-desc" className="text-xs text-muted-foreground">
              Description
            </Label>
            <Input
              id="qa-desc"
              placeholder="e.g. Grocery run"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50"
              data-ocid="overview.quick_add_modal.description_input"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="qa-amount"
              className="text-xs text-muted-foreground"
            >
              Amount (NGN)
            </Label>
            <Input
              id="qa-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50"
              data-ocid="overview.quick_add_modal.amount_input"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as TransactionCategory)}
            >
              <SelectTrigger
                className="border-white/10 bg-white/5 text-foreground"
                data-ocid="overview.quick_add_modal.category_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-background">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger
                className="border-white/10 bg-white/5 text-foreground"
                data-ocid="overview.quick_add_modal.account_select"
              >
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-background">
                {liquidAccounts.length === 0 ? (
                  <SelectItem value="" disabled>
                    No accounts yet
                  </SelectItem>
                ) : (
                  liquidAccounts.map((a) => (
                    <SelectItem key={String(a.id)} value={String(a.id)}>
                      {a.name} — {a.institution}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/10 bg-white/5 hover:bg-white/10"
              onClick={handleClose}
              data-ocid="overview.quick_add_modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground"
              disabled={createTx.isPending}
              data-ocid="overview.quick_add_modal.submit_button"
            >
              {createTx.isPending ? "Adding…" : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
