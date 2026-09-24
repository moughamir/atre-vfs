"use client";

import { cn } from "@/lib/utils";

interface StudioProgressProps {
  current: number; // 0..3 (for 4 steps)
  total?: number;
}

export function StudioProgress({ current, total = 4 }: StudioProgressProps) {
  return (
    <div className="flex items-center gap-1.5 px-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 flex items-center">
          <div
            className={cn(
              "studio-dot h-1 rounded-full transition-all duration-500",
              i <= current ? "bg-foreground" : "bg-foreground/15",
            )}
            style={{ flex: 1, height: i === current ? "5px" : "3px" }}
          />
        </div>
      ))}
    </div>
  );
}
