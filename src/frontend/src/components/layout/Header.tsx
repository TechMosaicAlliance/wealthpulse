import { useCurrency } from "@/hooks/useCurrency";
import { useAppStore } from "@/store/useAppStore";
import { Settings } from "lucide-react";
import { motion } from "motion/react";

export function Header() {
  const { currency, toggle } = useCurrency();
  const setModal = useAppStore((s) => s.setModal);

  return (
    <header
      data-ocid="header"
      className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
      style={{
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl glass-strong shadow-glow">
          <span className="font-display text-sm font-bold text-primary">W</span>
        </div>
        <span
          className="font-display text-base font-semibold tracking-tight"
          style={{ color: "#ffffff" }}
        >
          WealthPulse
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Currency toggle */}
        <motion.button
          type="button"
          data-ocid="header.currency_toggle"
          onClick={toggle}
          whileTap={{ scale: 0.93 }}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-smooth glass-sm"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          <span>{currency === "NGN" ? "🇳🇬" : "🇺🇸"}</span>
          <span>{currency}</span>
        </motion.button>

        {/* Settings */}
        <button
          type="button"
          data-ocid="header.settings_button"
          onClick={() => setModal("settings", true)}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-smooth hover:bg-white/10"
          aria-label="Settings"
        >
          <Settings
            className="h-4 w-4"
            style={{ color: "rgba(255,255,255,0.6)" }}
          />
        </button>
      </div>
    </header>
  );
}
