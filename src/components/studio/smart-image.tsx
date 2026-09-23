"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  rounded?: string;
  className?: string;
  imgClassName?: string;
  skeletonClassName?: string;
}

/**
 * Image with progressive load + fade-in transition + skeleton placeholder.
 * Use everywhere a generated or product image is displayed for premium polish.
 */
export function SmartImage({
  src,
  alt,
  rounded = "rounded-2xl",
  className,
  imgClassName,
  skeletonClassName,
  ...rest
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-secondary", rounded, className)}>
      {/* Skeleton shimmer while loading */}
      {!loaded && !errored && (
        <div
          className={cn(
            "absolute inset-0 skeleton-shimmer",
            skeletonClassName,
          )}
          aria-hidden
        />
      )}
      {!errored && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-700",
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
            imgClassName,
          )}
          {...rest}
        />
      )}
      {errored && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-accent to-secondary">
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            No image
          </span>
        </div>
      )}
    </div>
  );
}
