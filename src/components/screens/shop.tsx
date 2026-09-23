"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { formatPrice } from "@/lib/presets";
import { ShoppingBag, Eye } from "lucide-react";
import type { Listing } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export function ShopScreen() {
  const { openListing, pushToast } = useApp();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/listings");
        const data = await res.json();
        if (!cancelled) {
          setListings(data.listings ?? []);
          useApp.getState().setListings(data.listings ?? []);
        }
      } catch {
        if (!cancelled) pushToast({ title: "Couldn't load shop", variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pushToast]);

  return (
    <Screen>
      <ScreenHeader />

      <div className="px-5 pt-2">
        <h1 className="font-display text-[32px] leading-[1.05]">Shop</h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Published products
        </p>
      </div>

      <div className="mt-5 px-5 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyShop />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {listings.map((l) => (
              <button
                key={l.id}
                onClick={() => openListing(l.id)}
                className="group text-left active:scale-[0.98] transition"
              >
                <div className="relative overflow-hidden rounded-2xl bg-secondary aspect-[4/5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={l.mainImage}
                    alt={l.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-active:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-background/90 backdrop-blur text-foreground text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                    Published
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 transition">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-[14px] font-medium leading-tight line-clamp-1">
                    {l.name}
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">
                    {formatPrice(l.price, l.currency)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}

function EmptyShop() {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center mt-6">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5">
        <ShoppingBag className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="font-display text-[18px] mt-3">Nothing published yet</p>
      <p className="text-[13px] text-muted-foreground mt-1">
        Your finished products will appear here.
      </p>
    </div>
  );
}
