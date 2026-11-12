import type {
  AccountView,
  AssetView,
  HoldingView,
  NetWorthResult,
  NetWorthSnapshot,
  PassiveIncomeEntry,
  RiskBalance,
  TransactionView,
} from "@/backend";

export type {
  AccountView,
  AssetView,
  HoldingView,
  NetWorthResult,
  NetWorthSnapshot,
  PassiveIncomeEntry,
  RiskBalance,
  TransactionView,
};

export type CurrencyCode = "NGN" | "USD";

export type SummaryView = "budget" | "networth";

export interface ModalStates {
  settings: boolean;
  addAccount: boolean;
  addAsset: boolean;
  addHolding: boolean;
  addTransaction: boolean;
}

export interface AppState {
  activeTab: TabKey;
  summaryView: SummaryView;
  modalStates: ModalStates;
  isDemoMode: boolean;
  setActiveTab: (tab: TabKey) => void;
  setSummaryView: (view: SummaryView) => void;
  setModal: (key: keyof ModalStates, open: boolean) => void;
  setDemoMode: (active: boolean) => void;
}

export type TabKey =
  | "overview"
  | "summary"
  | "accounts"
  | "growth"
  | "settings";

export interface TabConfig {
  key: TabKey;
  label: string;
  path: string;
}

export interface AssetAllocation {
  stocks: number;
  crypto: number;
  cash: number;
  bonds: number;
  etf: number;
}
