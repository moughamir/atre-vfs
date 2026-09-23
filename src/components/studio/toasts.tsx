"use client";

import { useApp } from "@/lib/store";
import { Check, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function InlineToasts() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-3 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto max-w-md w-full rounded-2xl bg-foreground text-background px-4 py-3 shadow-xl flex items-start gap-3 animate-screen-in",
          )}
        >
          <span className="mt-0.5 shrink-0">
            {t.variant === "success" ? (
              <Check className="h-4 w-4" />
            ) : t.variant === "destructive" ? (
              <X className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium leading-tight">{t.title}</div>
            {t.description && (
              <div className="text-[12px] opacity-80 mt-0.5">{t.description}</div>
            )}
          </div>
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss"
            className="opacity-60 active:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
