"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { PrimaryCTA, SecondaryCTA } from "@/components/studio/cta";
import { formatPrice } from "@/lib/presets";
import { Share2, Heart, ShoppingBag } from "lucide-react";
import type { Listing } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/studio/smart-image";

export function ShopDetailScreen() {
  const { selectedListingId, pushToast } = useApp();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!selectedListingId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/listings/${selectedListingId}`);
        const data = await res.json();
        if (!cancelled) setListing(data.listing ?? null);
      } catch {
        if (!cancelled) pushToast({ title: "Couldn't load listing", variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedListingId, pushToast]);

  const onShare = async () => {
    if (!listing) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.name,
          text: listing.description ?? "",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        pushToast({ title: "Link copied", variant: "success" });
      }
    } catch {
      // ignore
    }
  };

  return (
    <Screen bottomPad="cta">
      <ScreenHeader
        showBack
        right={
          <button
            aria-label="Share"
            onClick={onShare}
            className="flex h-9 w-9 items-center justify-center rounded-full active:bg-foreground/5"
          >
            <Share2 className="h-5 w-5" strokeWidth={1.75} />
          </button>
        }
      />

      {loading ? (
        <div className="px-5">
          <Skeleton className="aspect-[4/5] rounded-3xl" />
        </div>
      ) : !listing ? (
        <div className="px-5 py-16 text-center text-muted-foreground">
          Listing not found.
        </div>
      ) : (
        <>
          <div className="px-5">
            <div className="relative">
              <SmartImage
                src={listing.images[activeImg] ?? listing.mainImage}
                alt={listing.name}
                rounded="rounded-3xl"
                className="aspect-[4/5]"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-background/90 backdrop-blur text-foreground text-[10px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                Published
              </div>
            </div>
            {listing.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
                {listing.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={
                      "shrink-0 h-16 w-16 overflow-hidden rounded-xl ring-1 transition " +
                      (i === activeImg ? "ring-2 ring-foreground" : "ring-border")
                    }
                    aria-label={`View image ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-5 mt-5">
            <h1 className="font-display text-[28px] leading-tight">{listing.name}</h1>
            <p className="text-[22px] font-medium mt-1">
              {formatPrice(listing.price, listing.currency)}
            </p>
          </div>

          {listing.description && (
            <div className="px-5 mt-5">
              <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
                Description
              </p>
              <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}

          <div className="flex-1" />

          <div className="sticky bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-background via-background to-background/0 pt-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}>
            <div className="mx-auto max-w-md px-5 flex gap-3">
              <SecondaryCTA
                icon={<Heart className="h-4 w-4" />}
                variant="outline"
                onClick={() => pushToast({ title: "Added to favorites", variant: "success" })}
                className="flex-1"
              >
                Save
              </SecondaryCTA>
              <PrimaryCTA
                onClick={() => pushToast({ title: "This is a demo shop — no checkout", variant: "default" })}
                icon={<ShoppingBag className="h-5 w-5" />}
                className="flex-1"
              >
                Add to cart
              </PrimaryCTA>
            </div>
          </div>
        </>
      )}
    </Screen>
  );
}
