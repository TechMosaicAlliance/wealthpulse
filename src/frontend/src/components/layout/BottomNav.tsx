import { useAppStore } from "@/store/useAppStore";
import type { TabConfig, TabKey } from "@/types";
import { useNavigate, useRouter } from "@tanstack/react-router";
import {
  BarChart2,
  CreditCard,
  Home,
  Settings,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";

const TABS: TabConfig[] = [
  { key: "overview", label: "Home", path: "/" },
  { key: "summary", label: "Summary", path: "/summary" },
  { key: "accounts", label: "Accounts", path: "/accounts" },
  { key: "growth", label: "Growth", path: "/growth" },
  { key: "settings", label: "Settings", path: "/settings" },
];

const ICONS: Record<TabKey, typeof Home> = {
  overview: Home,
  summary: BarChart2,
  accounts: CreditCard,
  growth: TrendingUp,
  settings: Settings,
};

export function BottomNav() {
  const { setActiveTab } = useAppStore();
  const navigate = useNavigate();
  const router = useRouter();

  const currentPath = router.state.location.pathname;

  const getActiveKey = (): TabKey => {
    if (currentPath === "/") return "overview";
    const match = TABS.find(
      (t) => t.path !== "/" && currentPath.startsWith(t.path),
    );
    return match?.key ?? "overview";
  };

  const activeKey = getActiveKey();

  const handleTab = (tab: TabConfig) => {
    setActiveTab(tab.key);
    navigate({ to: tab.path });
  };

  return (
    <nav
      data-ocid="bottom_nav"
      className="bottom-nav fixed bottom-0 left-0 right-0 z-40 flex justify-around"
      style={{
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {TABS.map((tab) => {
        const Icon = ICONS[tab.key];
        const isActive = activeKey === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            data-ocid={`nav.${tab.key}_tab`}
            onClick={() => handleTab(tab)}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-smooth"
            style={{ minHeight: 56, minWidth: 0 }}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
          >
            <div className="relative flex items-center justify-center">
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 -m-2 rounded-xl"
                  style={{ background: "rgba(59,130,246,0.18)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className="relative h-5 w-5 transition-smooth"
                style={{
                  color: isActive ? "#3B82F6" : "rgba(255,255,255,0.4)",
                }}
              />
            </div>
            <span
              className="text-[10px] font-medium transition-smooth"
              style={{ color: isActive ? "#3B82F6" : "rgba(255,255,255,0.4)" }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
