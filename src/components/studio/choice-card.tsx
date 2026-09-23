"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChoiceCardProps {
  label: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
  imageUrl?: string;
  emoji?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ChoiceCard({
  label,
  description,
  selected,
  onClick,
  imageUrl,
  emoji,
  size = "md",
  className,
}: ChoiceCardProps) {
  const heightClass =
    size === "lg"
      ? "aspect-[4/5]"
      : size === "sm"
        ? "aspect-square"
        : "aspect-[5/6]";
  const [imgError, setImgError] = useState(false);
  const showImg = imageUrl && !imgError;

  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-secondary text-left transition-all duration-300 active:scale-[0.97]",
        selected ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "ring-1 ring-border",
        className,
      )}
    >
      <div className={cn("relative w-full", heightClass)}>
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={label}
            loading="lazy"
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-active:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-accent to-secondary">
            <span className="font-display text-3xl text-foreground/40 mb-1">
              {emoji ?? "◇"}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </span>
          </div>
        )}
        {/* Gradient overlay for legibility */}
        {showImg && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        )}

        {/* Selected check */}
        {selected && (
          <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background shadow-md animate-screen-in">
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </div>
        )}

        {/* Label */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div
            className={cn(
              "text-[15px] font-semibold tracking-wide font-display drop-shadow",
              showImg ? "text-white" : "text-foreground",
            )}
          >
            {label}
          </div>
          {description && (
            <div
              className={cn(
                "text-[12px] mt-0.5 line-clamp-1",
                showImg ? "text-white/75" : "text-muted-foreground",
              )}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
