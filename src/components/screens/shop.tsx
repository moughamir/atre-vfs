"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { formatPrice } from "@/lib/presets";
import { ShoppingBag, Search, Eye, ArrowUpDown, X } from "lucide-react";
import type { Listing } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/studio/smart-image";
import { cn } from "@/lib/utils";

type SortKey = "recent" | "price-asc" | "price-desc" | "name";

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "recent", label: "Newest" },
  { id: "price-asc", label: "Price ↑" },
  { id: "price-desc", label: "Price ↓" },
  { id: "name", label: "A–Z" },
];

export function ShopScreen() {
  const { openListing, pushToast } = useApp();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [sortOpen, setSortOpen] = useState(false);

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? listings.filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            (l.description ?? "").toLowerCase().includes(q),
        )
      : listings;
    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recent":
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
    return sorted;
  }, [listings, query, sort]);

  return (
    <Screen>
      <ScreenHeader />

      <div className="px-5 pt-2">
        <h1 className="font-display text-[32px] leading-[1.05]">Shop</h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          {listings.length > 0
            ? `${listings.length} published product${listings.length === 1 ? "" : "s"}`
            : "Published products"}
        </p>
      </div>

      {/* Search + sort */}
      {listings.length > 0 && (
        <div className="mt-4 px-5 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shop"
              className="w-full h-11 rounded-full bg-secondary pl-11 pr-10 text-[14px] placeholder:text-muted-foreground outline-none focus:ring-2 ring-foreground/30 transition"
              aria-label="Search shop"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setSortOpen((v) => !v)}
            aria-label="Sort"
            className={cn(
              "shrink-0 flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95",
              sortOpen ? "bg-foreground text-background" : "bg-secondary text-foreground",
            )}
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Sort dropdown */}
      {sortOpen && (
        <div className="mt-2 px-5">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSort(opt.id);
                  setSortOpen(false);
                }}
                className={cn(
                  "shrink-0 h-9 px-3.5 rounded-full text-[12px] font-medium transition active:scale-95",
                  sort === opt.id
                    ? "bg-foreground text-background"
                    : "bg-secondary text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 px-5 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          query ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center mt-4">
              <p className="font-display text-[18px]">No matches</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                Try a different search term.
              </p>
            </div>
          ) : (
            <EmptyShop />
          )
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((l) => (
              <button
                key={l.id}
                onClick={() => openListing(l.id)}
                className="group text-left active:scale-[0.98] transition"
              >
                <div className="relative">
                  <SmartImage
                    src={l.mainImage}
                    alt={l.name}
                    rounded="rounded-2xl"
                    className="aspect-[4/5]"
                    imgClassName="transition-transform duration-500 group-active:scale-105"
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
