"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { getGreeting, formatPrice } from "@/lib/presets";
import { Sparkles, Bell, ArrowRight, Plus, Heart, Layers, ChevronRight, Clock } from "lucide-react";
import type { Product, Listing, ProjectSummary, FavoriteImage } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProjects, fetchFavorites } from "@/lib/api";
import { SmartImage } from "@/components/studio/smart-image";
import { cn } from "@/lib/utils";

export function HomeScreen() {
  const { navigate, setActiveTab, startStudio, pushToast, setProjects, setFavorites, projects, favorites } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [pRes, lRes, projs, favs] = await Promise.all([
          fetch("/api/products").then((r) => r.json()),
          fetch("/api/listings").then((r) => r.json()),
          fetchProjects(),
          fetchFavorites(),
        ]);
        if (cancelled) return;
        setProducts(pRes.products ?? []);
        setListings(lRes.listings ?? []);
        useApp.getState().setListings(lRes.listings ?? []);
        setProjects(projs);
        setFavorites(favs);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const greeting = getGreeting();
  const recent = products.slice(0, 6);
  const inProgress = projects.filter(
    (p) => p.status === "configuring" || p.status === "generating" || p.status === "failed",
  );

  const onStartStudio = () => {
    navigate("studio-product");
  };

  return (
    <Screen>
      <ScreenHeader
        right={
          <button
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-full active:bg-foreground/5"
            onClick={() => pushToast({ title: "No new notifications" })}
          >
            <Bell className="h-5 w-5" strokeWidth={1.75} />
          </button>
        }
      />

      <div className="px-5 pt-2 pb-4">
        <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground font-medium">
          {greeting}
        </p>
        <h1 className="font-display text-[36px] leading-[1.02] mt-2 tracking-[-0.01em]">
          Let&rsquo;s create
          <br />
          something.
        </h1>
      </div>

      {/* Hero CTA */}
      <div className="px-5">
        <button
          onClick={onStartStudio}
          className="relative w-full overflow-hidden rounded-[28px] bg-foreground text-background aspect-[4/3] sm:aspect-[16/10] active:scale-[0.99] transition-all duration-300 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.4)]"
          aria-label="Create new studio"
        >
          {/* Decorative sparkle */}
          <div className="absolute inset-0 opacity-90">
            <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative h-full flex flex-col justify-between p-7 text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background/15 backdrop-blur">
                <Sparkles className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="text-[12px] uppercase tracking-[0.18em] opacity-80">
                New studio
              </span>
            </div>
            <div>
              <h2 className="font-display text-[28px] leading-tight">
                Create Studio
              </h2>
              <p className="text-[14px] opacity-75 mt-1 max-w-[16rem]">
                Turn a product into a fashion shoot in minutes.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium opacity-90">
                Start
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Quick access tiles */}
      <div className="mt-5 px-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("projects")}
          className="relative overflow-hidden rounded-2xl bg-secondary/60 p-4 text-left active:scale-[0.98] transition hover:bg-secondary"
          aria-label="View all projects"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
              <Layers className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="font-display text-[18px] mt-3">Projects</p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {projects.length} studio{projects.length === 1 ? "" : "s"}
          </p>
          {inProgress.length > 0 && (
            <span className="absolute top-3 right-3 flex h-2 w-2 rounded-full bg-foreground animate-pulse" />
          )}
        </button>
        <button
          onClick={() => navigate("favorites")}
          className="relative overflow-hidden rounded-2xl bg-secondary/60 p-4 text-left active:scale-[0.98] transition hover:bg-secondary"
          aria-label="View favorites"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
              <Heart className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="font-display text-[18px] mt-3">Favorites</p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {favorites.length} saved
          </p>
        </button>
      </div>

      {/* In-progress banner */}
      {!loading && inProgress.length > 0 && (
        <div className="mt-4 px-5">
          <button
            onClick={() => navigate("projects")}
            className="w-full rounded-2xl bg-foreground text-background p-4 flex items-center gap-3 active:scale-[0.99] transition"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background/15">
              <Clock className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="flex-1 text-left">
              <p className="text-[13px] font-medium">
                {inProgress.length} project{inProgress.length === 1 ? "" : "s"} in progress
              </p>
              <p className="text-[12px] opacity-75">
                Pick up where you left off
              </p>
            </div>
            <ChevronRight className="h-4 w-4 opacity-80" />
          </button>
        </div>
      )}

      {/* Recent Projects */}
      <div className="mt-8 px-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[20px] font-display">Recent</h3>
          {recent.length > 0 && (
            <button
              onClick={() => setActiveTab("products")}
              className="text-[13px] text-muted-foreground active:text-foreground"
            >
              See all
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyHome onCreate={onStartStudio} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {recent.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  useApp.getState().selectProduct(p);
                  navigate("product-detail");
                }}
                className="group text-left active:scale-[0.98] transition"
              >
                <div className="relative">
                  <SmartImage
                    src={p.images?.[0] ?? ""}
                    alt={p.name}
                    rounded="rounded-2xl"
                    className="aspect-[4/5]"
                    imgClassName="transition-transform duration-500 group-active:scale-105"
                  />
                  <div className="absolute top-2 right-2">
                    <StatusPill status={p.status} />
                  </div>
                </div>
                <div className="mt-2.5">
                  <div className="text-[15px] font-semibold leading-tight line-clamp-1 tracking-[-0.005em]">
                    {p.name}
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-[13px] font-medium text-foreground">
                      {formatPrice(p.price, p.currency)}
                    </span>
                    <span className="text-[11px] text-muted-foreground/80 uppercase tracking-wide">
                      {p.category}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Shop preview */}
      {listings.length > 0 && (
        <div className="mt-10 px-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[20px] font-display">Published</h3>
            <button
              onClick={() => setActiveTab("shop")}
              className="text-[13px] text-muted-foreground active:text-foreground"
            >
              Open shop
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
            {listings.slice(0, 6).map((l) => (
              <button
                key={l.id}
                onClick={() => useApp.getState().openListing(l.id)}
                className="shrink-0 w-32 text-left active:scale-[0.98] transition"
              >
                <SmartImage
                  src={l.mainImage}
                  alt={l.name}
                  rounded="rounded-2xl"
                  className="aspect-[4/5]"
                />
                <div className="mt-1.5 text-[13px] font-medium line-clamp-1">{l.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {formatPrice(l.price, l.currency)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />
    </Screen>
  );
}

function EmptyHome({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <p className="font-display text-[18px]">No studio projects yet</p>
      <p className="text-[13px] text-muted-foreground mt-1">
        Create your first fashion shoot.
      </p>
      <button
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-2 h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-semibold uppercase tracking-wide active:scale-95 transition"
      >
        <Plus className="h-4 w-4" /> Create Studio
      </button>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string }> = {
    draft: { label: "Draft", bg: "bg-foreground/60" },
    ready: { label: "Ready", bg: "bg-foreground/80" },
    published: { label: "Published", bg: "bg-foreground" },
    archived: { label: "Archived", bg: "bg-foreground/40" },
  };
  const s = map[status] ?? map.ready;
  return (
    <span
      className={`${s.bg} text-background text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full backdrop-blur`}
    >
      {s.label}
    </span>
  );
}
