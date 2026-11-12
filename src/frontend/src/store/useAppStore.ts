import type { AppState, ModalStates, SummaryView, TabKey } from "@/types";
import { create } from "zustand";

const DEFAULT_MODALS: ModalStates = {
  settings: false,
  addAccount: false,
  addAsset: false,
  addHolding: false,
  addTransaction: false,
};

export const useAppStore = create<AppState>((set) => ({
  activeTab: "overview",
  summaryView: "budget",
  modalStates: { ...DEFAULT_MODALS },
  isDemoMode: false,

  setActiveTab: (tab: TabKey) => set({ activeTab: tab }),
  setSummaryView: (view: SummaryView) => set({ summaryView: view }),
  setModal: (key: keyof ModalStates, open: boolean) =>
    set((s) => ({ modalStates: { ...s.modalStates, [key]: open } })),
  setDemoMode: (active: boolean) => set({ isDemoMode: active }),
}));
