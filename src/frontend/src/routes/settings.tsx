import { AccountType } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FREQUENCY_OPTIONS,
  useDetectedTrades,
  useEmailScanSettings,
  useSimulateEmailScan,
} from "@/hooks/useEmailScan";
import {
  useAccounts,
  useClearDemoData,
  useLoadDemoData,
} from "@/hooks/useQueries";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { LANGUAGE_OPTIONS, useThemeStore } from "@/store/useThemeStore";
import { createRoute } from "@tanstack/react-router";
import {
  Bot,
  ChevronDown,
  Clock,
  DollarSign,
  Globe,
  Moon,
  RefreshCw,
  Sun,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Route as rootRoute } from "./__root";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border border-white/8 p-4"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: "rgba(120,80,255,0.18)" }}
        >
          {icon}
        </div>
        <h2 className="font-display text-sm font-semibold text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

function SettingsPage() {
  const { settings, update } = useEmailScanSettings();
  const { scan, isPending: isScanning } = useSimulateEmailScan();
  const { trades } = useDetectedTrades();
  const {
    currency,
    toggle: toggleCurrency,
    exchangeRate,
    setExchangeRate,
  } = useCurrencyStore();
  const { theme, toggleTheme, language, setLanguage } = useThemeStore();
  const { mutate: loadDemo, isPending: loadingDemo } = useLoadDemoData();
  const { mutate: clearDemo, isPending: clearingDemo } = useClearDemoData();

  const [rateInput, setRateInput] = useState<string>(String(exchangeRate));

  async function handleScan() {
    await scan();
  }

  const lastScanLabel = settings.lastScanAt
    ? settings.lastScanAt.toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  return (
    <div
      data-ocid="settings.page"
      className="min-h-screen space-y-4 pb-28 text-foreground"
    >
      {/* Page header */}
      <div className="flex items-center justify-between py-1">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Settings
          </h1>
          <p className="text-xs text-muted-foreground">App preferences</p>
        </div>
      </div>

      {/* ── Section 1: Appearance ─────────────────────────────────── */}
      <SectionCard
        title="Appearance"
        icon={
          theme === "dark" ? (
            <Moon className="h-4 w-4 text-primary" />
          ) : (
            <Sun className="h-4 w-4 text-primary" />
          )
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-foreground">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"}
            </p>
          </div>
          <button
            type="button"
            data-ocid="settings.theme_toggle"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="relative h-6 w-11 rounded-full transition-smooth"
            style={{
              background:
                theme === "light"
                  ? "rgba(120,80,255,0.85)"
                  : "rgba(255,255,255,0.15)",
            }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-smooth"
              style={{
                left: theme === "light" ? "calc(100% - 22px)" : "2px",
              }}
            />
          </button>
        </div>
      </SectionCard>

      {/* ── Section 2: Language ───────────────────────────────────── */}
      <SectionCard
        title="Default Language"
        icon={<Globe className="h-4 w-4 text-primary" />}
      >
        <div className="relative">
          <select
            id="lang-sel"
            data-ocid="settings.language_select"
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as Parameters<typeof setLanguage>[0])
            }
            className="w-full appearance-none rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 pr-8 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option
                key={opt.code}
                value={opt.code}
                style={{ background: "#0f0f14" }}
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </SectionCard>

      {/* ── Section 3: Exchange Rate ──────────────────────────────── */}
      <SectionCard
        title="Exchange Rate"
        icon={<DollarSign className="h-4 w-4 text-primary" />}
      >
        <p className="mb-3 text-[11px] text-muted-foreground">
          Set the NGN/USD rate used across the app. Current rate:{" "}
          <span className="font-semibold text-foreground">
            1 USD = ₦{exchangeRate.toLocaleString()}
          </span>
        </p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              1 USD =
            </span>
            <input
              type="number"
              data-ocid="settings.exchange_rate_input"
              min={1}
              step={10}
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/6 py-2.5 pl-14 pr-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              style={{ background: "rgba(255,255,255,0.06)" }}
              placeholder="1600"
            />
          </div>
          <span className="text-xs text-muted-foreground">₦</span>
          <Button
            type="button"
            size="sm"
            data-ocid="settings.exchange_rate_save_button"
            onClick={() => {
              const parsed = Number(rateInput);
              if (parsed > 0) setExchangeRate(parsed);
            }}
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Apply
          </Button>
        </div>
      </SectionCard>

      {/* ── Section 4: AI Trade Detection ─────────────────────────── */}
      <SectionCard
        title="AI Trade Detection"
        icon={<Bot className="h-4 w-4 text-primary" />}
      >
        {/* Enable toggle */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-foreground">
              Auto-scan emails
            </p>
            <p className="text-[11px] text-muted-foreground">
              Parse trade confirmations from inbox
            </p>
          </div>
          <button
            type="button"
            data-ocid="settings.scan_toggle"
            aria-label="Toggle email scan"
            onClick={() => update({ isEnabled: !settings.isEnabled })}
            className="relative h-6 w-11 rounded-full transition-smooth"
            style={{
              background: settings.isEnabled
                ? "rgba(120,80,255,0.85)"
                : "rgba(255,255,255,0.12)",
            }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-smooth"
              style={{ left: settings.isEnabled ? "calc(100% - 22px)" : "2px" }}
            />
          </button>
        </div>

        {/* Frequency select */}
        <div className="mb-3">
          <label
            htmlFor="scan-freq"
            className="mb-1 block text-[11px] text-muted-foreground"
          >
            Scan frequency
          </label>
          <div className="relative">
            <select
              id="scan-freq"
              data-ocid="settings.scan_frequency_select"
              value={settings.scanIntervalMinutes}
              onChange={(e) =>
                update({
                  scanIntervalMinutes: Number(
                    e.target.value,
                  ) as typeof settings.scanIntervalMinutes,
                })
              }
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 pr-8 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  style={{ background: "#0f0f14" }}
                >
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Last scan + scan now */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Last scanned: {lastScanLabel}</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-ocid="settings.scan_now_button"
            onClick={handleScan}
            disabled={isScanning}
            className="gap-1.5 border-white/10 bg-white/5 text-xs hover:bg-white/10"
          >
            <RefreshCw
              className={`h-3 w-3 ${isScanning ? "animate-spin" : ""}`}
            />
            {isScanning ? "Scanning…" : "Scan Now"}
          </Button>
        </div>

        {trades.length > 0 && (
          <p className="mt-2 text-[11px] text-primary">
            {trades.length} trade{trades.length > 1 ? "s" : ""} detected —
            review on Summary page
          </p>
        )}
      </SectionCard>

      {/* ── Section 5: Currency ───────────────────────────────────── */}
      <SectionCard
        title="Display Currency"
        icon={
          <span className="text-xs font-bold text-primary">
            {currency === "NGN" ? "₦" : "$"}
          </span>
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-foreground">
              {currency === "NGN" ? "Nigerian Naira (₦)" : "US Dollar ($)"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Tap to switch display currency
            </p>
          </div>
          <button
            type="button"
            data-ocid="settings.currency_toggle"
            onClick={toggleCurrency}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold transition-smooth active:scale-95 hover:bg-white/8"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <span
              className={
                currency === "NGN" ? "text-foreground" : "text-muted-foreground"
              }
            >
              ₦ NGN
            </span>
            <span className="text-muted-foreground">/</span>
            <span
              className={
                currency === "USD" ? "text-foreground" : "text-muted-foreground"
              }
            >
              $ USD
            </span>
          </button>
        </div>
      </SectionCard>

      {/* ── Section 6: Demo Data ─────────────────────────────────── */}
      <SectionCard
        title="Demo Data"
        icon={<Trash2 className="h-4 w-4 text-primary" />}
      >
        <p className="mb-3 text-[11px] text-muted-foreground">
          Load sample data to explore WealthPulse, or clear it when you're ready
          to start fresh with your real portfolio.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-ocid="settings.load_demo_button"
            onClick={() => loadDemo()}
            disabled={loadingDemo || clearingDemo}
            className="flex-1 border-white/10 bg-white/5 text-xs hover:bg-white/10"
          >
            {loadingDemo ? "Loading…" : "Load Sample Data"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-ocid="settings.clear_demo_button"
            onClick={() => clearDemo()}
            disabled={clearingDemo || loadingDemo}
            className="flex-1 border-red-500/20 bg-red-500/5 text-xs text-red-400 hover:bg-red-500/10"
          >
            {clearingDemo ? "Clearing…" : "Clear Demo Data"}
          </Button>
        </div>
      </SectionCard>

      {/* Footer */}
      <p className="pb-4 text-center text-[11px] text-muted-foreground">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
        >
          Built with caffeine.ai
        </a>
      </p>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});
