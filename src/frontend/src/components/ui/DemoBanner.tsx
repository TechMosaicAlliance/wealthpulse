import { useClearDemoData, useLoadDemoData } from "@/hooks/useQueries";
import { useAppStore } from "@/store/useAppStore";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export function DemoBanner() {
  const isDemoMode = useAppStore((s) => s.isDemoMode);
  const { mutate: clearDemo, isPending: isClearing } = useClearDemoData();
  const { mutate: loadDemo, isPending: isLoading } = useLoadDemoData();

  return (
    <AnimatePresence mode="wait">
      {isDemoMode ? (
        <motion.div
          key="demo-active"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          data-ocid="demo.banner"
          className="overflow-hidden"
        >
          <div
            className="flex items-center justify-between gap-2 px-4 py-2 text-xs font-medium"
            style={{
              background: "rgba(249,115,22,0.15)",
              borderBottom: "1px solid rgba(249,115,22,0.25)",
              color: "#F97316",
            }}
          >
            <span>📊 Demo Mode — showing sample data</span>
            <button
              type="button"
              data-ocid="demo.clear_button"
              onClick={() => clearDemo()}
              disabled={isClearing}
              className="flex items-center gap-1 rounded-md px-2 py-1 font-semibold transition-smooth hover:bg-white/10 disabled:opacity-50"
            >
              <X className="h-3 w-3" />
              {isClearing ? "Clearing…" : "Clear Demo Data"}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="demo-inactive"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          data-ocid="demo.try_banner"
          className="overflow-hidden"
        >
          <div
            className="flex items-center justify-between gap-2 px-4 py-2 text-xs font-medium"
            style={{
              background: "rgba(120,80,255,0.10)",
              borderBottom: "1px solid rgba(120,80,255,0.20)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <span>✨ See how it works with sample data</span>
            <button
              type="button"
              data-ocid="demo.load_button"
              onClick={() => loadDemo()}
              disabled={isLoading}
              className="flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-primary transition-smooth hover:bg-white/10 disabled:opacity-50"
            >
              {isLoading ? "Loading…" : "Try with Sample Data"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
