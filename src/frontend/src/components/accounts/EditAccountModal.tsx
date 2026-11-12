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
import { useUpdateAccount } from "@/hooks/useQueries";
import type { AccountView } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditAccountModalProps {
  account: AccountView | null;
  onClose: () => void;
}

export function EditAccountModal({ account, onClose }: EditAccountModalProps) {
  const updateAccount = useUpdateAccount();

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState("NGN");

  useEffect(() => {
    if (account) {
      setName(account.name);
      setInstitution(account.institution);
      setBalance((Number(account.balance) / 100).toString());
      setCurrency(account.currency);
    }
  }, [account]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!account) return;
    if (!name.trim() || !institution.trim() || !balance) {
      toast.error("Please fill all required fields");
      return;
    }
    const balanceNum = Number.parseFloat(balance);
    if (Number.isNaN(balanceNum) || balanceNum < 0) {
      toast.error("Enter a valid balance");
      return;
    }
    const balanceKobo = BigInt(Math.round(balanceNum * 100));
    try {
      await updateAccount.mutateAsync({
        id: account.id,
        name: name.trim(),
        institution: institution.trim(),
        balance: balanceKobo,
        currency,
      });
      toast.success("Account updated");
      onClose();
    } catch {
      toast.error("Failed to update account");
    }
  }

  return (
    <Dialog open={!!account} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-[92vw] rounded-2xl border-white/10 p-5"
        style={{
          background: "rgba(15,15,20,0.97)",
          backdropFilter: "blur(20px)",
        }}
        data-ocid="accounts.edit_account_modal.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold">
            Edit Account
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-name"
              className="text-xs text-muted-foreground"
            >
              Account Name
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-white/10 bg-white/5 text-foreground"
              data-ocid="accounts.edit_account_modal.name_input"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-institution"
              className="text-xs text-muted-foreground"
            >
              Institution
            </Label>
            <Input
              id="edit-institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="border-white/10 bg-white/5 text-foreground"
              data-ocid="accounts.edit_account_modal.institution_input"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-balance"
              className="text-xs text-muted-foreground"
            >
              Balance (NGN)
            </Label>
            <Input
              id="edit-balance"
              type="number"
              min="0"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="border-white/10 bg-white/5 text-foreground"
              data-ocid="accounts.edit_account_modal.balance_input"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger
                className="border-white/10 bg-white/5 text-foreground"
                data-ocid="accounts.edit_account_modal.currency_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-background">
                <SelectItem value="NGN">🇳🇬 NGN — Nigerian Naira</SelectItem>
                <SelectItem value="USD">🇺🇸 USD — US Dollar</SelectItem>
                <SelectItem value="GBP">🇬🇧 GBP — British Pound</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/10 bg-white/5 hover:bg-white/10"
              onClick={onClose}
              data-ocid="accounts.edit_account_modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground"
              disabled={updateAccount.isPending}
              data-ocid="accounts.edit_account_modal.submit_button"
            >
              {updateAccount.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
