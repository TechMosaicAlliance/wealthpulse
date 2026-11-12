import { AssetClass } from "@/backend";
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
import { Switch } from "@/components/ui/switch";
import { useCreateAsset } from "@/hooks/useQueries";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ASSET_CLASSES = [
  { value: AssetClass.Stock, label: "Stock" },
  { value: AssetClass.ETF, label: "ETF" },
  { value: AssetClass.Crypto, label: "Crypto" },
  { value: AssetClass.Bond, label: "Bond" },
  { value: AssetClass.Cash, label: "Cash" },
];

export function AddAssetModal({ open, onClose }: Props) {
  const createAsset = useCreateAsset();
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [assetClass, setAssetClass] = useState<AssetClass>(AssetClass.Stock);
  const [isFortress, setIsFortress] = useState(false);
  const [yieldPct, setYieldPct] = useState("0");

  function reset() {
    setTicker("");
    setName("");
    setAssetClass(AssetClass.Stock);
    setIsFortress(false);
    setYieldPct("0");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticker.trim() || !name.trim()) return;
    try {
      await createAsset.mutateAsync({
        ticker: ticker.trim().toUpperCase(),
        name: name.trim(),
        assetClass,
        isFortress,
        expectedYieldPct: Number.parseFloat(yieldPct) || 0,
        isDemo: false,
      });
      toast.success(`${ticker.toUpperCase()} added to your portfolio`);
      handleClose();
    } catch {
      toast.error("Failed to add asset");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="mx-auto max-w-[360px] border-white/10"
        style={{
          background: "rgba(16,16,20,0.96)",
          backdropFilter: "blur(16px)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">
            Add Asset
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="ticker"
              className="text-muted-foreground text-xs uppercase tracking-wide"
            >
              Ticker Symbol
            </Label>
            <Input
              id="ticker"
              data-ocid="add_asset.ticker.input"
              placeholder="e.g. AAPL, BTC"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="border-white/10 bg-white/5 uppercase placeholder:normal-case"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="asset-name"
              className="text-muted-foreground text-xs uppercase tracking-wide"
            >
              Asset Name
            </Label>
            <Input
              id="asset-name"
              data-ocid="add_asset.name.input"
              placeholder="e.g. Apple Inc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-white/10 bg-white/5"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Asset Class
            </Label>
            <Select
              value={assetClass}
              onValueChange={(v) => setAssetClass(v as AssetClass)}
            >
              <SelectTrigger
                data-ocid="add_asset.class.select"
                className="border-white/10 bg-white/5"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: "rgba(16,16,20,0.97)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {ASSET_CLASSES.map((ac) => (
                  <SelectItem key={ac.value} value={ac.value}>
                    {ac.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="yield"
              className="text-muted-foreground text-xs uppercase tracking-wide"
            >
              Expected Annual Yield %
            </Label>
            <Input
              id="yield"
              data-ocid="add_asset.yield.input"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="0.00"
              value={yieldPct}
              onChange={(e) => setYieldPct(e.target.value)}
              className="border-white/10 bg-white/5"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Fortress Asset</p>
              <p className="text-muted-foreground text-xs">
                Low-risk, stable (bonds, T-bills, savings)
              </p>
            </div>
            <Switch
              data-ocid="add_asset.fortress.toggle"
              checked={isFortress}
              onCheckedChange={setIsFortress}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/10"
              onClick={handleClose}
              data-ocid="add_asset.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createAsset.isPending}
              data-ocid="add_asset.submit_button"
            >
              {createAsset.isPending ? "Adding…" : "Add Asset"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
