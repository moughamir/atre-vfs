"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { fetchProjects, fetchFavorites } from "@/lib/api";
import type { ProjectSummary, Listing, FavoriteImage } from "@/lib/types";
import {
  Layers,
  ImageIcon,
  ShoppingBag,
  Heart,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Camera,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityEvent {
  id: string;
  type: "created" | "generated" | "published" | "favorited";
  label: string;
  detail: string;
  time: string;
  timestamp: number;
}

export function ActivityScreen() {
  const { navigate } = useApp();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<FavoriteImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [pRes, lRes, favs] = await Promise.all([
          fetch("/api/projects").then((r) => r.json()),
          fetch("/api/listings").then((r) => r.json()),
          fetchFavorites(),
        ]);
        if (cancelled) return;
        setProjects(pRes.projects ?? []);
        setListings(lRes.listings ?? []);
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
  }, []);

  // Compute insights
  const totalImages = useMemo(
    () => projects.reduce((sum, p) => sum + p.generations.reduce((s, g) => s + g.images.length, 0), 0),
    [projects],
  );
  const totalGenerations = useMemo(
    () => projects.reduce((sum, p) => sum + p.generations.length, 0),
    [projects],
  );
  const publishedCount = listings.length;
  const favoriteCount = favorites.length;
  const readyProjects = projects.filter((p) => p.status === "ready").length;
  // Estimated time saved: each generation = ~2 min studio time saved vs traditional photoshoot (~4 hours = 240 min)
  const timeSaved = totalGenerations * 240; // minutes

  // Build activity timeline
  const events: ActivityEvent[] = useMemo(() => {
    const evts: ActivityEvent[] = [];
    for (const p of projects) {
      evts.push({
        id: `create-${p.id}`,
        type: "created",
        label: `Created studio`,
        detail: p.product.name,
        time: p.createdAt,
        timestamp: new Date(p.createdAt).getTime(),
      });
      for (const g of p.generations) {
        evts.push({
          id: `gen-${g.id}`,
          type: "generated",
          label: `Generated ${g.images.length} images`,
          detail: p.product.name,
          time: g.createdAt,
          timestamp: new Date(g.createdAt).getTime(),
        });
      }
    }
    for (const l of listings) {
      evts.push({
        id: `pub-${l.id}`,
        type: "published",
        label: `Published to shop`,
        detail: l.name,
        time: l.createdAt,
        timestamp: new Date(l.createdAt).getTime(),
      });
    }
    for (const f of favorites) {
      evts.push({
        id: `fav-${f.id}`,
        type: "favorited",
        label: `Saved to favorites`,
        detail: f.productName,
        time: f.createdAt,
        timestamp: new Date(f.createdAt).getTime(),
      });
    }
    return evts.sort((a, b) => b.timestamp - a.timestamp);
  }, [projects, listings, favorites]);

  const stats = [
    {
      icon: Layers,
      label: "Studios",
      value: projects.length,
      sub: `${readyProjects} ready`,
      color: "bg-foreground text-background",
    },
    {
      icon: ImageIcon,
      label: "Images",
      value: totalImages,
      sub: `${totalGenerations} generations`,
      color: "bg-secondary text-foreground",
    },
    {
      icon: ShoppingBag,
      label: "Published",
      value: publishedCount,
      sub: publishedCount === 1 ? "listing" : "listings",
      color: "bg-secondary text-foreground",
    },
    {
      icon: Heart,
      label: "Favorites",
      value: favoriteCount,
      sub: "saved",
      color: "bg-secondary text-foreground",
    },
  ];

  const eventIcon = {
    created: Camera,
    generated: Sparkles,
    published: CheckCircle2,
    favorited: Heart,
  } as const;

  const eventColor = {
    created: "bg-foreground/5 text-foreground",
    generated: "bg-foreground text-background",
    published: "bg-foreground/5 text-foreground",
    favorited: "bg-foreground/5 text-foreground",
  } as const;

  return (
    <Screen>
      <ScreenHeader showBack title="Activity" />

      <div className="px-5 pt-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          <h1 className="font-display text-[28px] leading-tight">Your activity</h1>
        </div>
        <p className="text-[14px] text-muted-foreground mt-1">
          Insights into your studio usage.
        </p>
      </div>

      {/* Stats grid */}
      <div className="mt-5 px-5 grid grid-cols-2 gap-2.5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={cn(
                "rounded-2xl p-4 flex flex-col",
                s.color,
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background/15">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
              </div>
              <span className="font-display text-[32px] leading-none">{s.value}</span>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-[13px] font-medium">{s.label}</span>
                <span className="text-[11px] opacity-70">{s.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time saved highlight */}
      {totalGenerations > 0 && (
        <div className="mt-4 px-5">
          <div className="rounded-2xl bg-foreground text-background p-5 flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background/10">
              <Clock className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <div className="flex-1">
              <p className="text-[12px] uppercase tracking-[0.18em] opacity-75">
                Time saved
              </p>
              <p className="font-display text-[24px] leading-tight mt-0.5">
                {Math.floor(timeSaved / 60)}h {timeSaved % 60}m
              </p>
              <p className="text-[12px] opacity-75 mt-0.5">
                vs traditional photoshoots
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Activity timeline */}
      <div className="mt-6 px-5">
        <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground font-medium mb-3">
          Recent activity
        </p>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-shimmer rounded-2xl h-14"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="font-display text-[16px]">No activity yet</p>
            <p className="text-[12px] text-muted-foreground mt-1">
              Create a studio to start your activity timeline.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 20).map((evt, i) => {
              const Icon = eventIcon[evt.type];
              return (
                <div
                  key={evt.id}
                  className={cn(
                    "rounded-2xl p-3 flex items-center gap-3",
                    evt.type === "generated" ? "bg-foreground/5" : "bg-secondary/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full shrink-0",
                      eventColor[evt.type],
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium leading-tight">{evt.label}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">
                      {evt.detail}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatRelativeTime(evt.time)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1" />
    </Screen>
  );
}

function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
