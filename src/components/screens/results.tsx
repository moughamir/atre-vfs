"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { PrimaryCTA, SecondaryCTA } from "@/components/studio/cta";
import { SmartImage } from "@/components/studio/smart-image";
import { RefreshCw, Check, Heart, Layers, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResultsScreen() {
  const {
    studio,
    toggleImageSelected,
    navigate,
    setStudioStatus,
    pushToast,
    setActiveGeneration,
  } = useApp();
  const [regenerating, setRegenerating] = useState(false);

  const images = studio.currentImages;
  const selectedCount = images.filter((i) => i.selected).length;
  const allSelected = images.length > 0 && selectedCount === images.length;
  const hasHistory = studio.allGenerations.length > 1;

  const toggleSelectAll = () => {
    if (allSelected) {
      images.forEach((i) => i.selected && toggleImageSelected(i.id));
    } else {
      images.forEach((i) => !i.selected && toggleImageSelected(i.id));
    }
  };

  const onRegenerate = async () => {
    if (regenerating) return;
    setRegenerating(true);
    setStudioStatus("generating");
    navigate("generating");
  };

  const onPublish = () => {
    if (selectedCount === 0) return;
    navigate("publish");
  };

  if (images.length === 0) {
    return (
      <Screen>
        <ScreenHeader showBack title="Your Studio" />
        <div className="px-5 py-16 text-center text-muted-foreground">
          No images yet.{" "}
          <button
            onClick={() => navigate("studio-summary")}
            className="underline text-foreground"
          >
            Create some
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen bottomPad="cta">
      <ScreenHeader showBack title="Your Studio" />

      <div className="px-5 pt-2">
        <h1 className="font-display text-[28px] leading-tight">
          Your collection
        </h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          {images.length} images · {selectedCount} selected
          {hasHistory && (
            <span className="ml-1.5">· {studio.allGenerations.length} generations</span>
          )}
        </p>
      </div>

      {/* Generation history strip */}
      {hasHistory && (
        <div className="mt-4 -mx-5 px-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Generations
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {studio.allGenerations.map((gen, gi) => {
              const active = gi === studio.activeGeneration;
              const cover = gen[0]?.url;
              return (
                <button
                  key={gi}
                  onClick={() => setActiveGeneration(gi)}
                  className={cn(
                    "relative shrink-0 h-20 w-16 overflow-hidden rounded-xl transition-all duration-200 active:scale-95",
                    active
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : "ring-1 ring-border opacity-70 hover:opacity-100",
                  )}
                  aria-label={`Generation ${studio.allGenerations.length - gi}`}
                  aria-pressed={active}
                >
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1">
                    <span className="text-white text-[10px] font-medium">
                      {studio.allGenerations.length - gi}
                    </span>
                  </div>
                  {active && (
                    <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground">
                      <Check className="h-2.5 w-2.5 text-background" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Image grid */}
      <div className="px-5 mt-5">
        <div className="grid grid-cols-2 gap-3">
          {images.map((img, i) => (
            <div
              key={img.id}
              role="button"
              tabIndex={0}
              onClick={() => toggleImageSelected(img.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleImageSelected(img.id);
                }
              }}
              onDoubleClick={() => {
                useApp.getState().setSelectedImageIndex(i);
                navigate("image-detail");
              }}
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-secondary aspect-[4/5] active:scale-[0.98] transition-all duration-300 cursor-pointer",
                img.selected && "ring-2 ring-foreground ring-offset-2 ring-offset-background shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)]",
              )}
              aria-label={`Image ${i + 1}${img.selected ? ", selected" : ""}`}
              aria-pressed={img.selected}
            >
              <SmartImage
                src={img.url}
                alt={`Generated fashion image ${i + 1}`}
                rounded="rounded-2xl"
                className="absolute inset-0"
                imgClassName={cn(
                  "transition-all duration-300",
                  img.selected ? "scale-100" : "scale-100 group-active:scale-105",
                )}
              />
              {/* Selected overlay */}
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-200 pointer-events-none",
                  img.selected
                    ? "bg-foreground/0"
                    : "bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100",
                )}
              />
              {/* Selection check */}
              <div
                className={cn(
                  "absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200",
                  img.selected
                    ? "bg-foreground text-background scale-100"
                    : "bg-background/80 text-foreground scale-90 opacity-0 group-active:opacity-100",
                )}
              >
                {img.selected ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <span className="text-[10px] font-medium">+</span>
                )}
              </div>
              {/* Favorite toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useApp.getState().toggleImageFavorite(img.id);
                  // Also sync to favorites API
                  fetch("/api/favorites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      url: img.url,
                      productName: studio.product?.name ?? "Untitled",
                      remove: img.favorite,
                    }),
                  })
                    .then((r) => r.json())
                    .then((d) => {
                      if (d.favorites) useApp.getState().setFavorites(d.favorites);
                    })
                    .catch(() => {});
                  pushToast({
                    title: img.favorite ? "Removed from favorites" : "Saved to favorites",
                    variant: img.favorite ? "default" : "success",
                  });
                }}
                aria-label="Toggle favorite"
                className="absolute top-2.5 left-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur active:scale-90 transition"
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition",
                    img.favorite
                      ? "fill-foreground text-foreground"
                      : "text-foreground",
                  )}
                  strokeWidth={2}
                />
              </button>
              {/* Index badge */}
              <div className="absolute bottom-2 left-2.5 text-white text-[11px] font-medium tracking-wide drop-shadow">
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Select all */}
      <div className="px-5 mt-4">
        <button
          onClick={toggleSelectAll}
          className={cn(
            "flex items-center gap-2 h-10 px-4 rounded-full text-[13px] font-medium transition active:scale-95",
            allSelected
              ? "bg-foreground text-background"
              : "bg-secondary text-foreground",
          )}
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full border-2 transition",
              allSelected ? "border-background bg-background" : "border-foreground/40",
            )}
          >
            {allSelected && <Check className="h-3 w-3 text-foreground" strokeWidth={3} />}
          </span>
          {allSelected ? "All selected" : "Select all"}
        </button>
      </div>

      <div className="flex-1" />

      {/* Action buttons */}
      <div className="sticky bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-background via-background to-background/0 pt-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}>
        <div className="mx-auto max-w-md px-5 flex gap-3">
          <SecondaryCTA
            onClick={onRegenerate}
            icon={<RefreshCw className={cn("h-4 w-4", regenerating && "animate-spin")} />}
            variant="outline"
            className="flex-1"
          >
            Regenerate
          </SecondaryCTA>
          <PrimaryCTA
            onClick={onPublish}
            disabled={selectedCount === 0}
            className="flex-1"
          >
            Publish
          </PrimaryCTA>
        </div>
      </div>
    </Screen>
  );
}
