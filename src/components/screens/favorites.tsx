"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Download, Share2, Trash2 } from "lucide-react";
import { fetchFavorites, toggleFavoriteAPI } from "@/lib/api";
import type { FavoriteImage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FavoritesScreen() {
  const { favorites, setFavorites, favoritesLoaded, pushToast } = useApp();
  const [loading, setLoading] = useState(!favoritesLoaded);

  useEffect(() => {
    if (favoritesLoaded) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const favs = await fetchFavorites();
      if (!cancelled) {
        setFavorites(favs);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [favoritesLoaded, setFavorites]);

  const onRemove = async (url: string, productName: string) => {
    const updated = await toggleFavoriteAPI(url, productName, true);
    if (updated) setFavorites(updated);
    pushToast({ title: "Removed from favorites", variant: "default" });
  };

  const onDownload = async (url: string, i: number) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = `favorite-${i + 1}.png`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      pushToast({ title: "Image downloaded", variant: "success" });
    } catch {
      pushToast({ title: "Couldn't download image", variant: "destructive" });
    }
  };

  const onShare = async (url: string) => {
    try {
      const fullUrl = window.location.origin + url;
      if (navigator.share) {
        await navigator.share({ title: "Atré favorite", url: fullUrl });
      } else {
        await navigator.clipboard.writeText(fullUrl);
        pushToast({ title: "Link copied", variant: "success" });
      }
    } catch {
      // ignore
    }
  };

  return (
    <Screen>
      <ScreenHeader showBack title="Favorites" />

      <div className="px-5 pt-2">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          <h1 className="font-display text-[28px] leading-tight">Collection</h1>
        </div>
        <p className="text-[14px] text-muted-foreground mt-1">
          {favorites.length > 0
            ? `${favorites.length} saved image${favorites.length === 1 ? "" : "s"}`
            : "Tap the heart on any image to save it here."}
        </p>
      </div>

      {loading ? (
        <div className="px-5 mt-5 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="px-5 mt-8">
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5">
              <Heart className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="font-display text-[18px] mt-3">No favorites yet</p>
            <p className="text-[13px] text-muted-foreground mt-1 max-w-[16rem] mx-auto">
              Save images from your studio results to build a personal collection.
            </p>
          </div>
        </div>
      ) : (
        <div className="px-5 mt-5 grid grid-cols-2 gap-3">
          {favorites.map((fav, i) => (
            <div
              key={fav.id}
              className="group relative overflow-hidden rounded-2xl bg-secondary aspect-[4/5]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fav.url}
                alt={fav.productName}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
              <div className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur">
                <Heart className="h-4 w-4 fill-foreground text-foreground" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-[12px] font-medium line-clamp-1">
                  {fav.productName}
                </p>
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() => onDownload(fav.url, i)}
                    aria-label="Download"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-background/20 backdrop-blur text-white active:scale-95 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onShare(fav.url)}
                    aria-label="Share"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-background/20 backdrop-blur text-white active:scale-95 transition"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onRemove(fav.url, fav.productName)}
                    aria-label="Remove"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-background/20 backdrop-blur text-white active:scale-95 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
}
