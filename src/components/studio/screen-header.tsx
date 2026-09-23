"use client";

import { useApp } from "@/lib/store";
import type { ReactNode } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  right?: ReactNode;
  step?: string; // e.g. "2/4"
  centered?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack,
  showClose,
  onBack,
  onClose,
  right,
  step,
  centered,
}: ScreenHeaderProps) {
  const goBack = useApp((s) => s.goBack);

  return (
    <header
      className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="px-5 pt-3 pb-3">
        <div className="flex items-center justify-between min-h-10">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {showBack && (
              <button
                onClick={onBack ?? goBack}
                aria-label="Go back"
                className="flex h-9 w-9 items-center justify-center rounded-full -ml-2 active:bg-foreground/5 transition"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
              </button>
            )}
            {showClose && (
              <button
                onClick={onClose ?? goBack}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full -ml-2 active:bg-foreground/5 transition"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            )}
            {(title || step) && (
              <div className="min-w-0">
                {step && (
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {step}
                  </div>
                )}
                {title && (
                  <div
                    className={cn(
                      "truncate text-[15px] font-medium text-foreground",
                      step && "leading-tight",
                    )}
                  >
                    {title}
                  </div>
                )}
              </div>
            )}
          </div>
          {right && <div className="flex items-center gap-1">{right}</div>}
        </div>
        {subtitle && (
          <p
            className={
              centered
                ? "mt-1 text-center text-[13px] text-muted-foreground"
                : "mt-1 text-[13px] text-muted-foreground"
            }
          >
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}

interface ExitConfirmProps {
  open: boolean;
  onKeepWorking: () => void;
  onLeave: () => void;
}

export function ExitStudioConfirm({
  open,
  onKeepWorking,
  onLeave,
}: ExitConfirmProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onKeepWorking()}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogTitle className="font-display text-2xl text-center">
          Leave Studio?
        </DialogTitle>
        <DialogDescription className="text-center text-[14px]">
          Your progress will be saved. You can return to this project from Home.
        </DialogDescription>
        <DialogFooter className="flex flex-col gap-2 mt-2">
          <Button onClick={onKeepWorking} variant="outline" className="rounded-full h-12">
            Keep working
          </Button>
          <Button
            onClick={onLeave}
            className="rounded-full h-12 bg-foreground text-background hover:bg-foreground/90"
          >
            Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
