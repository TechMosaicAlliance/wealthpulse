import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "strong" | "sm";
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  variant = "default",
  onClick,
}: GlassCardProps) {
  const base = {
    default: "glass",
    strong: "glass-strong",
    sm: "glass-sm",
  }[variant];

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        base,
        "p-4",
        onClick && "cursor-pointer active:scale-[0.98] transition-smooth",
        className,
      )}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
