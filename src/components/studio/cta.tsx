"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PrimaryCTAProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "outline" | "ghost";
  icon?: ReactNode;
  className?: string;
}

export function PrimaryCTA({
  children,
  onClick,
  disabled,
  loading,
  variant = "primary",
  icon,
  className,
}: PrimaryCTAProps) {
  return (
    <div
      className="sticky bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-background via-background to-background/0 pt-3"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
    >
      <div className="mx-auto max-w-md px-5">
        <button
          onClick={onClick}
          disabled={disabled || loading}
          className={cn(
            "group relative w-full h-14 rounded-full text-[15px] font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2.5 overflow-hidden",
            "active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100",
            variant === "primary" &&
              "bg-foreground text-background shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]",
            variant === "outline" &&
              "bg-transparent text-foreground border border-border hover:border-foreground/40",
            variant === "ghost" && "bg-transparent text-foreground hover:bg-foreground/5",
            className,
          )}
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {!loading && icon}
          <span className="uppercase tracking-[0.12em]">{children}</span>
        </button>
      </div>
    </div>
  );
}

interface SecondaryCTAProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "outline" | "ghost";
  className?: string;
  full?: boolean;
}

export function SecondaryCTA({
  children,
  onClick,
  icon,
  variant = "outline",
  className,
  full,
}: SecondaryCTAProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-12 rounded-full px-5 text-[14px] font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]",
        variant === "outline"
          ? "bg-transparent text-foreground border border-border hover:border-foreground/40"
          : "bg-foreground/5 text-foreground",
        full && "w-full",
        className,
      )}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
