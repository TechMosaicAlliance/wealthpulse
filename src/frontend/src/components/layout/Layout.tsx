import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { Toaster } from "@/components/ui/sonner";
import { useThemeStore } from "@/store/useThemeStore";
import { useEffect } from "react";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const bgColor = theme === "light" ? "#f5f7fa" : "#0a0a0a";

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ backgroundColor: bgColor }}
    >
      <DemoBanner />
      <Header />

      {/* Scrollable content area with bottom nav clearance */}
      <main
        data-ocid="main_content"
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={{
          paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="mx-auto w-full max-w-[480px] px-4 py-4">{children}</div>
      </main>

      <BottomNav />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background:
              theme === "light"
                ? "rgba(255,255,255,0.95)"
                : "rgba(255,255,255,0.10)",
            backdropFilter: "blur(12px)",
            border:
              theme === "light"
                ? "1px solid rgba(0,0,0,0.10)"
                : "1px solid rgba(255,255,255,0.12)",
            color: theme === "light" ? "#111" : "#ffffff",
          },
        }}
      />
    </div>
  );
}
