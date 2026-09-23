"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScreenProps {
  children: ReactNode;
  noPadding?: boolean;
  className?: string;
  noMaxWidth?: boolean;
  // Adds extra bottom padding so content clears a sticky CTA + bottom nav.
  // Use "cta" on screens that render a sticky PrimaryCTA.
  bottomPad?: "none" | "nav" | "cta";
}

export function Screen({
  children,
  noPadding,
  className,
  noMaxWidth,
  bottomPad = "nav",
}: ScreenProps) {
  // nav: clears the fixed bottom nav (~64px + safe area). pb-24 = 96px.
  // cta: clears a sticky PrimaryCTA (~156px) + bottom nav. pb-44 = 176px.
  const padClass =
    bottomPad === "cta"
      ? "pb-44"
      : bottomPad === "nav"
        ? "pb-24"
        : "";

  return (
    <div
      className={cn(
        "min-h-[100dvh] flex flex-col animate-screen-in",
        !noPadding && padClass,
        className,
      )}
    >
      <div className={cn("flex-1 flex flex-col w-full", !noMaxWidth && "mx-auto max-w-md")}>
        {children}
      </div>
    </div>
  );
}
