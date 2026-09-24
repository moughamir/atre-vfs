"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { SmartImage } from "@/components/studio/smart-image";
import { fetchProjects } from "@/lib/api";
import type { ProjectSummary } from "@/lib/types";
import {
  Images,
  Download,
  Share2,
  Heart,
  Filter,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LookbookImage {
  url: string;
  productName: string;
  projectId: string;
  projectName: string;
  scene: string;
  style: string;
  model: string;
}

export function LookbookScreen() {
  const { favorites, pushToast, openProject, navigate } = useApp();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState<string>("all");
  const [detail, setDetail] = useState<LookbookImage | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const p = await fetchProjects();
      if (!cancelled) {
        setProjects(p);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Flatten all generation images across projects
  const allImages = useMemo<LookbookImage[]>(() => {
    const imgs: LookbookImage[] = [];
    for (const p of projects) {
      for (const g of p.generations) {
        for (const url of g.images) {
          imgs.push({
            url,
            productName: p.product.name,
            projectId: p.id,
            projectName: p.product.name,
            scene: p.scene,
            style: p.style,
            model: p.model,
          });
        }
      }
    }
    return imgs;
  }, [projects]);

  const filtered =
    filterProject === "all"
      ? allImages
      : allImages.filter((i) => i.projectId === filterProject);

  const isFavorited = (url: string) =>
    favorites.some((f) => f.url === url);

  const onDownload = async (url: string, name: string) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.toLowerCase().replace(/\s+/g, "-")}.png`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      pushToast({ title: "Image downloaded", variant: "success" });
    } catch {
      pushToast({ title: "Couldn't download", variant: "destructive" });
    }
  };

  const onShare = async (url: string, name: string) => {
    try {
      const fullUrl = window.location.origin + url;
      if (navigator.share) {
        await navigator.share({ title: name, url: fullUrl });
      } else {
        await navigator.clipboard.writeText(fullUrl);
        pushToast({ title: "Link copied", variant: "success" });
      }
    } catch {
      // cancelled
    }
  };

  return (
    <Screen>
      <ScreenHeader showBack title="Lookbook" />

      <div className="px-5 pt-2">
        <div className="flex items-center gap-2">
          <Images className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          <h1 className="font-display text-[28px] leading-tight">Lookbook</h1>
        </div>
        <p className="text-[14px] text-muted-foreground mt-1">
          {allImages.length > 0
            ? `${allImages.length} image${allImages.length === 1 ? "" : "s"} across ${projects.length} studio${projects.length === 1 ? "" : "s"}`
            : "Every generated image, in one gallery."}
        </p>
      </div>

      {/* Filter chips */}
      {projects.length > 1 && (
        <div className="mt-4 -mx-5 px-5">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Filter
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setFilterProject("all")}
              className={cn(
                "shrink-0 h-9 px-3.5 rounded-full text-[12px] font-medium transition active:scale-95",
                filterProject === "all"
                  ? "bg-foreground text-background"
                  : "bg-secondary text-foreground",
              )}
            >
              All
            </button>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterProject(p.id)}
                className={cn(
                  "shrink-0 h-9 px-3.5 rounded-full text-[12px] font-medium transition active:scale-95 line-clamp-1 max-w-[10rem]",
                  filterProject === p.id
                    ? "bg-foreground text-background"
                    : "bg-secondary text-foreground",
                )}
              >
                {p.product.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gallery */}
      <div className="mt-5 px-5 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-shimmer rounded-2xl aspect-[4/5]"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center mt-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5">
              <Images className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="font-display text-[18px] mt-3">No images yet</p>
            <p className="text-[13px] text-muted-foreground mt-1 max-w-[16rem] mx-auto">
              Create a studio and generate images to fill your lookbook.
            </p>
            <button
              onClick={() => navigate("studio-product")}
              className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-foreground text-background text-[13px] font-semibold uppercase tracking-wide active:scale-95 transition"
            >
              <Sparkles className="h-4 w-4" /> Create Studio
            </button>
          </div>
        ) : (
          /* Masonry-style two-column gallery */
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((img, i) => {
              const fav = isFavorited(img.url);
              // Vary the aspect ratio for a masonry feel
              const aspects = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[3/4]", "aspect-[4/5]"];
              const aspect = aspects[i % aspects.length];
              return (
                <button
                  key={img.url}
                  onClick={() => setDetail(img)}
                  className={cn(
                    "group relative block w-full overflow-hidden rounded-2xl active:scale-[0.98] transition",
                    aspect,
                  )}
                  aria-label={`View ${img.productName} image ${i + 1}`}
                >
                  <SmartImage
                    src={img.url}
                    alt={`${img.productName} — ${img.style}`}
                    rounded="rounded-2xl"
                    className="absolute inset-0"
                    imgClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Favorite badge */}
                  {fav && (
                    <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/85 backdrop-blur">
                      <Heart className="h-3.5 w-3.5 fill-foreground text-foreground" strokeWidth={2} />
                    </span>
                  )}
                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-[11px] font-medium line-clamp-1">
                      {img.productName}
                    </p>
                    <p className="text-white/70 text-[10px] capitalize line-clamp-1">
                      {img.style} · {img.scene}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Image detail sheet */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/80 backdrop-blur-sm animate-screen-in"
          onClick={() => setDetail(null)}
        >
          <div
            className="relative w-full max-w-md bg-background rounded-t-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
          >
            <div className="relative">
              <SmartImage
                src={detail.url}
                alt={detail.productName}
                rounded="rounded-t-3xl"
                className="aspect-[4/5] rounded-b-none"
              />
              <button
                onClick={() => setDetail(null)}
                aria-label="Close"
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur text-foreground active:scale-95 transition"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
                {detail.productName}
              </p>
              <p className="text-[15px] font-medium mt-1 capitalize">
                {detail.model} · {detail.scene} · {detail.style}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => onDownload(detail.url, detail.productName)}
                  className="flex flex-col items-center gap-1.5 h-20 rounded-2xl bg-secondary/60 justify-center active:scale-95 transition hover:bg-secondary"
                >
                  <Download className="h-5 w-5" strokeWidth={1.75} />
                  <span className="text-[11px] font-medium">Download</span>
                </button>
                <button
                  onClick={() => onShare(detail.url, detail.productName)}
                  className="flex flex-col items-center gap-1.5 h-20 rounded-2xl bg-secondary/60 justify-center active:scale-95 transition hover:bg-secondary"
                >
                  <Share2 className="h-5 w-5" strokeWidth={1.75} />
                  <span className="text-[11px] font-medium">Share</span>
                </button>
                <button
                  onClick={() => {
                    openProject(detail.projectId);
                    setDetail(null);
                  }}
                  className="flex flex-col items-center gap-1.5 h-20 rounded-2xl bg-secondary/60 justify-center active:scale-95 transition hover:bg-secondary"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
                  <span className="text-[11px] font-medium">Open studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
