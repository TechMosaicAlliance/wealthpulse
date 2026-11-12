import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light";

export type LanguageCode = "en" | "fr" | "es" | "pt" | "yo" | "ha" | "ig";

export const LANGUAGE_OPTIONS: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "pt", label: "Portuguese" },
  { code: "yo", label: "Yoruba" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
];

interface ThemeState {
  theme: ThemeMode;
  language: LanguageCode;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (lang: LanguageCode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      language: "en",
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute("data-theme", theme);
      },
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
        document.documentElement.setAttribute("data-theme", next);
      },
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "wealthpulse-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute("data-theme", state.theme);
        }
      },
    },
  ),
);
