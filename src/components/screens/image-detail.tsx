"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { Heart, Pencil, Download, Share2, MoreHorizontal, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toggleFavoriteAPI } from "@/lib/api";

export function ImageDetailScreen() {
  const { studio, selectedImageIndex, setSelectedImageIndex, toggleImageFavorite, favorites, navigate, pushToast } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);

  const img =
    selectedImageIndex !== null
      ? studio.currentImages[selectedImageIndex]
      : null;

  if (!img) {
    return (
      <Screen>
        <ScreenHeader showBack title="Image" />
        <div className="px-5 py-16 text-center text-muted-foreground">
          No image selected.
        </div>
      </Screen>
    );
  }

  // Derive favorite state from the global favorites list (persisted) for resilience
  const isFavorited =
    favorites.some((f) => f.url === img.url) || img.favorite;

  const onToggleFavorite = async () => {
    toggleImageFavorite(img.id); // optimistic local toggle
    const productName = studio.product?.name ?? "Untitled";
    const updated = await toggleFavoriteAPI(img.url, productName, isFavorited);
    if (updated) {
      useApp.getState().setFavorites(updated);
    }
    pushToast({
      title: isFavorited ? "Removed from favorites" : "Saved to favorites",
      variant: isFavorited ? "default" : "success",
    });
  };

  const onDownload = async () => {
    try {
      const a = document.createElement("a");
      a.href = img.url;
      a.download = `studio-image-${selectedImageIndex! + 1}.png`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      pushToast({ title: "Image downloaded", variant: "success" });
    } catch {
      pushToast({ title: "Couldn't download image", variant: "destructive" });
    }
  };

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Studio image",
          text: "Generated in Atré Studio",
          url: window.location.origin + img.url,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin + img.url);
        pushToast({ title: "Link copied", variant: "success" });
      }
    } catch {
      // user cancelled or unsupported
    }
  };

  return (
    <Screen noPadding noMaxWidth>
      <div className="min-h-[100dvh] bg-foreground flex flex-col">
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-3 py-3 text-background"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
        >
          <button
            onClick={() => {
              setSelectedImageIndex(null);
              navigate("results");
            }}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background/15 backdrop-blur active:scale-95 transition"
          >
            <span className="text-[18px]">←</span>
          </button>
          <div className="text-[13px] uppercase tracking-[0.16em] text-background/70">
            {selectedImageIndex! + 1} / {studio.currentImages.length}
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="More options"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background/15 backdrop-blur active:scale-95 transition"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="rounded-t-3xl px-4 pb-8"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)" }}
            >
              <SheetHeader>
                <SheetTitle className="font-display text-xl text-center">
                  Image options
                </SheetTitle>
              </SheetHeader>
              <div className="mt-3 space-y-1">
                <SheetItem
                  icon={<Heart className={cn("h-5 w-5", isFavorited && "fill-foreground")} />}
                  label={isFavorited ? "Remove favorite" : "Save to favorites"}
                  onClick={() => {
                    onToggleFavorite();
                    setSheetOpen(false);
                  }}
                />
                <SheetItem
                  icon={<Pencil className="h-5 w-5" />}
                  label="Edit image"
                  onClick={() => {
                    setSheetOpen(false);
                    navigate("edit-image");
                  }}
                />
                <SheetItem
                  icon={<Sparkles className="h-5 w-5" />}
                  label="Create variations"
                  onClick={() => {
                    setSheetOpen(false);
                    navigate("variations");
                  }}
                />
                <SheetItem
                  icon={<Download className="h-5 w-5" />}
                  label="Download"
                  onClick={() => {
                    onDownload();
                    setSheetOpen(false);
                  }}
                />
                <SheetItem
                  icon={<Share2 className="h-5 w-5" />}
                  label="Share"
                  onClick={() => {
                    onShare();
                    setSheetOpen(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Image */}
        <div className="flex-1 flex items-center justify-center px-4 py-4">
          <div className="relative w-full max-w-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt="Generated fashion image"
              className="w-full rounded-2xl object-contain max-h-[75vh]"
            />
          </div>
        </div>

        {/* Bottom action bar */}
        <div
          className="sticky bottom-0 z-20 bg-foreground/95 backdrop-blur"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
        >
          <div className="mx-auto max-w-md px-5 py-3 flex items-center justify-around">
            <ActionIcon
              icon={<Heart className={cn("h-6 w-6", isFavorited && "fill-background")} />}
              label="Save"
              onClick={onToggleFavorite}
            />
            <ActionIcon
              icon={<Pencil className="h-6 w-6" />}
              label="Edit"
              onClick={() => navigate("edit-image")}
            />
            <ActionIcon
              icon={<Sparkles className="h-6 w-6" />}
              label="Variations"
              onClick={() => navigate("variations")}
            />
            <ActionIcon
              icon={<Download className="h-6 w-6" />}
              label="Download"
              onClick={onDownload}
            />
            <ActionIcon
              icon={<Share2 className="h-6 w-6" />}
              label="Share"
              onClick={onShare}
            />
          </div>
        </div>
      </div>
    </Screen>
  );
}

function ActionIcon({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-background/90 active:scale-95 transition"
      aria-label={label}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background/10 active:bg-background/20 transition">
        {icon}
      </span>
      <span className="text-[11px] uppercase tracking-wide">{label}</span>
    </button>
  );
}

function SheetItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 h-14 px-3 rounded-xl active:bg-foreground/5 transition"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5">
        {icon}
      </span>
      <span className="text-[15px] font-medium">{label}</span>
    </button>
  );
}
