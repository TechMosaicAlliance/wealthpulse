import { AccountType } from "@/backend";
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
import { useCreateAccount } from "@/hooks/useQueries";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { toast } from "sonner";

export function AddAccountModal() {
  const open = useAppStore((s) => s.modalStates.addAccount);
  const setModal = useAppStore((s) => s.setModal);
  const isDemoMode = useAppStore((s) => s.isDemoMode);
  const createAccount = useCreateAccount();

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [balance, setBalance] = useState("");
  const [accountType, setAccountType] = useState<AccountType>(
    AccountType.Liquid,
  );
  const [currency, setCurrency] = useState("NGN");

  function handleClose() {
    setModal("addAccount", false);
    setName("");
    setInstitution("");
    setBalance("");
    setAccountType(AccountType.Liquid);
    setCurrency("NGN");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !institution.trim() || !balance) {
      toast.error("Please fill all required fields");
      return;
    }
    const balanceNum = Number.parseFloat(balance);
    if (Number.isNaN(balanceNum) || balanceNum < 0) {
      toast.error("Enter a valid balance");
      return;
    }
    // Balance stored as kobo (NGN * 100)
    const balanceKobo = BigInt(Math.round(balanceNum * 100));
    try {
      await createAccount.mutateAsync({
        name: name.trim(),
        institution: institution.trim(),
        balance: balanceKobo,
        accountType,
        currency,
        isDemo: isDemoMode,
      });
      toast.success(`${name} added`);
      handleClose();
    } catch {
      toast.error("Failed to create account");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-w-[92vw] rounded-2xl border-white/10 p-5"
        style={{
          background: "rgba(15,15,20,0.97)",
          backdropFilter: "blur(20px)",
        }}
        data-ocid="accounts.add_account_modal.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold">
            Add Account
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="add-name" className="text-xs text-muted-foreground">
              Account Name
            </Label>
            <Input
              id="add-name"
              placeholder="e.g. GTBank Savings"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50"
              data-ocid="accounts.add_account_modal.name_input"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="add-institution"
              className="text-xs text-muted-foreground"
            >
              Institution
            </Label>
            <Input
              id="add-institution"
              placeholder="e.g. Guaranty Trust Bank"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50"
              data-ocid="accounts.add_account_modal.institution_input"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="add-balance"
              className="text-xs text-muted-foreground"
            >
              Opening Balance (NGN)
            </Label>
            <Input
              id="add-balance"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50"
              data-ocid="accounts.add_account_modal.balance_input"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Account Type
            </Label>
            <Select
              value={accountType}
              onValueChange={(v) => setAccountType(v as AccountType)}
            >
              <SelectTrigger
                className="border-white/10 bg-white/5 text-foreground"
                data-ocid="accounts.add_account_modal.type_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-background">
                <SelectItem value={AccountType.Liquid}>
                  Liquid (Bank/Cash)
                </SelectItem>
                <SelectItem value={AccountType.Investment}>
                  Investment (Brokerage/Crypto)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger
                className="border-white/10 bg-white/5 text-foreground"
                data-ocid="accounts.add_account_modal.currency_select"
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
              onClick={handleClose}
              data-ocid="accounts.add_account_modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground"
              disabled={createAccount.isPending}
              data-ocid="accounts.add_account_modal.submit_button"
            >
              {createAccount.isPending ? "Adding…" : "Add Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
