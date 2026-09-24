"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { SmartImage } from "@/components/studio/smart-image";
import { PrimaryCTA, SecondaryCTA } from "@/components/studio/cta";
import {
  Sparkles,
  Check,
  Heart,
  Download,
  Share2,
  RefreshCw,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeneratedImage } from "@/lib/types";
import { toggleFavoriteAPI } from "@/lib/api";

const VARIATION_STEPS = [
  { id: "analyzing", label: "Analyzing image" },
  { id: "composing", label: "Composing variations" },
  { id: "generating", label: "Generating alternatives" },
  { id: "finalizing", label: "Finalizing results" },
];

export function VariationsScreen() {
  const {
    studio,
    selectedImageIndex,
    navigate,
    pushToast,
    favorites,
    setFavorites,
    addGeneration,
  } = useApp();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [variations, setVariations] = useState<GeneratedImage[]>([]);
  const [selectedVariations, setSelectedVariations] = useState<Set<string>>(
    new Set(),
  );
  const startedRef = useRef(false);

  const sourceImg =
    selectedImageIndex !== null
      ? studio.currentImages[selectedImageIndex]
      : null;

  const isFavorited = (url: string) =>
    favorites.some((f) => f.url === url);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    runVariations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runVariations = async () => {
    if (!sourceImg) return;
    setLoading(true);
    setStep(0);

    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    VARIATION_STEPS.forEach((_, i) => {
      stepTimers.push(
        setTimeout(() => {
          if (loading || variations.length === 0) setStep(i);
        }, 300 + i * 600),
      );
    });

    try {
      const res = await fetch("/api/studio/variations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: sourceImg.url,
          productName: studio.product?.name,
          model: studio.model,
          scene: studio.scene,
          style: studio.style,
          count: 3,
        }),
      });
      if (!res.ok) {
        let errorMsg = "Variations failed";
        try {
          const errData = await res.json();
          errorMsg = errData.error ?? errorMsg;
        } catch {
          // Response wasn't JSON
        }
        throw new Error(errorMsg);
      }
      const data = await res.json();
      if (!data.images || data.images.length === 0) {
        throw new Error(data.error ?? "Variations failed");
      }
      setStep(VARIATION_STEPS.length - 1);
      const imgs: GeneratedImage[] = data.images.map(
        (url: string, i: number) => ({
          id: `var-${Date.now()}-${i}`,
          url,
          selected: false,
          favorite: false,
          prompt: data.prompts?.[i] ?? "",
        }),
      );
      setVariations(imgs);
      // Add to project generation history
      addGeneration(imgs);
      setLoading(false);
    } catch (e) {
      console.error("Variations failed", e);
      pushToast({
        title: "We couldn't create variations.",
        description: "Your image is safe. Try again.",
        variant: "destructive",
      });
      setLoading(false);
      setTimeout(() => navigate("image-detail"), 1000);
    } finally {
      stepTimers.forEach((t) => clearTimeout(t));
    }
  };

  const toggleVariation = (id: string) => {
    setSelectedVariations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onToggleFavorite = async (img: GeneratedImage) => {
    const isFav = isFavorited(img.url);
    const updated = await toggleFavoriteAPI(
      img.url,
      studio.product?.name ?? "Untitled",
      isFav,
    );
    if (updated) setFavorites(updated);
    pushToast({
      title: isFav ? "Removed from favorites" : "Saved to favorites",
      variant: isFav ? "default" : "success",
    });
  };

  const onDownload = (url: string, i: number) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = `atre-variation-${i + 1}.png`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      pushToast({ title: "Image downloaded", variant: "success" });
    } catch {
      pushToast({ title: "Couldn't download", variant: "destructive" });
    }
  };

  if (!sourceImg) {
    return (
      <Screen>
        <ScreenHeader showBack title="Variations" />
        <div className="px-5 py-16 text-center text-muted-foreground">
          No source image selected.
        </div>
      </Screen>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Screen noPadding noMaxWidth>
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-foreground text-background px-8 py-12">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-background/20 blur-2xl animate-pulse" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-background/10 backdrop-blur-sm border border-background/20">
              <Sparkles className="h-10 w-10" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-display text-[28px] text-center leading-tight">
            Creating
            <br />
            variations&hellip;
          </h1>
          <div className="mt-10 w-full max-w-xs space-y-4" aria-live="polite">
            {VARIATION_STEPS.map((s, i) => {
              const done = i < step;
              const current = i === step;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center gap-3 transition-all duration-300",
                    i > step && "opacity-40",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border transition-all",
                      done && "bg-background text-foreground border-background",
                      current && "bg-background/10 text-background border-background/40",
                      !done && !current && "border-background/20 text-background/40",
                    )}
                  >
                    {done ? (
                      <Check className="h-4 w-4" strokeWidth={3} />
                    ) : current ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-background animate-pulse" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-background/40" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[15px] tracking-wide transition",
                      current && "text-background",
                      done && "text-background/80",
                      !done && !current && "text-background/40",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Screen>
    );
  }

  // Results
  return (
    <Screen bottomPad="cta">
      <ScreenHeader showBack title="Variations" />

      <div className="px-5 pt-2">
        <h1 className="font-display text-[28px] leading-tight">
          {variations.length} variations
        </h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Based on {studio.product?.name ?? "your image"} · {selectedVariations.size} selected
        </p>
      </div>

      {/* Source image + variations grid */}
      <div className="px-5 mt-5">
        {/* Source label */}
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium mb-2">
          Source
        </p>
        <div className="relative mb-5">
          <SmartImage
            src={sourceImg.url}
            alt="Source image"
            rounded="rounded-2xl"
            className="aspect-[4/5] w-32"
          />
          <span className="absolute top-2 left-2 bg-background/90 backdrop-blur text-foreground text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium">
            Original
          </span>
        </div>

        {/* Variations */}
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium mb-2">
          Variations
        </p>
        <div className="grid grid-cols-2 gap-3">
          {variations.map((img, i) => {
            const selected = selectedVariations.has(img.id);
            const fav = isFavorited(img.url);
            return (
              <div
                key={img.id}
                role="button"
                tabIndex={0}
                onClick={() => toggleVariation(img.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleVariation(img.id);
                  }
                }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl bg-secondary aspect-[4/5] active:scale-[0.98] transition-all duration-300 cursor-pointer",
                  selected && "ring-2 ring-foreground ring-offset-2 ring-offset-background shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)]",
                )}
                aria-label={`Variation ${i + 1}${selected ? ", selected" : ""}`}
                aria-pressed={selected}
              >
                <SmartImage
                  src={img.url}
                  alt={`Variation ${i + 1}`}
                  rounded="rounded-2xl"
                  className="absolute inset-0"
                />
                <div
                  className={cn(
                    "absolute inset-0 transition-all duration-200 pointer-events-none",
                    selected ? "bg-foreground/0" : "bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100",
                  )}
                />
                {/* Selection check */}
                <div
                  className={cn(
                    "absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200",
                    selected ? "bg-foreground text-background scale-100" : "bg-background/80 text-foreground scale-90 opacity-0 group-active:opacity-100",
                  )}
                >
                  {selected ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <span className="text-[10px] font-medium">+</span>
                  )}
                </div>
                {/* Favorite */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(img);
                  }}
                  aria-label="Toggle favorite"
                  className="absolute top-2.5 left-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur active:scale-90 transition"
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition",
                      fav ? "fill-foreground text-foreground" : "text-foreground",
                    )}
                    strokeWidth={2}
                  />
                </button>
                {/* Index */}
                <div className="absolute bottom-2 left-2.5 text-white text-[11px] font-medium tracking-wide drop-shadow">
                  V{String(i + 1).padStart(2, "0")}
                </div>
                {/* Download */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(img.url, i);
                  }}
                  aria-label="Download"
                  className="absolute bottom-2 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur active:scale-90 transition"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="sticky bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-background via-background to-background/0 pt-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}>
        <div className="mx-auto max-w-md px-5 flex gap-3">
          <SecondaryCTA
            onClick={runVariations}
            icon={<RefreshCw className="h-4 w-4" />}
            variant="outline"
            className="flex-1"
          >
            New variations
          </SecondaryCTA>
          <PrimaryCTA
            onClick={() => {
              if (selectedVariations.size === 0) {
                pushToast({ title: "Select at least one variation", variant: "destructive" });
                return;
              }
              // Merge selected variations into current results
              const selected = variations.filter((v) => selectedVariations.has(v.id));
              pushToast({
                title: `${selected.length} variation${selected.length === 1 ? "" : "s"} added to results`,
                variant: "success",
              });
              navigate("results");
            }}
            disabled={selectedVariations.size === 0}
            className="flex-1"
          >
            Add to results
          </PrimaryCTA>
        </div>
      </div>
    </Screen>
  );
}
