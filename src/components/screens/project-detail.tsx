"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { PrimaryCTA, SecondaryCTA } from "@/components/studio/cta";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/presets";
import {
  getModelPreset,
  getScenePreset,
  getStylePreset,
} from "@/lib/presets";
import { Sparkles, RefreshCw, ChevronRight, ImageIcon, ShoppingBag } from "lucide-react";
import type { ProjectSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/studio/smart-image";

export function ProjectDetailScreen() {
  const { selectedProjectId, projects, navigate, pushToast, startStudio } = useApp();
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProjectId) return;
    // Try local cache first
    const cached = projects.find((p) => p.id === selectedProjectId);
    if (cached) {
      setProject(cached);
      setLoading(false);
    }
    // Then refresh from server
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/projects/${selectedProjectId}`);
        const data = await res.json();
        if (!cancelled && data.project) setProject(data.project);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedProjectId, projects]);

  if (loading) {
    return (
      <Screen>
        <ScreenHeader showBack title="Project" />
        <div className="px-5 mt-5">
          <Skeleton className="aspect-[4/5] rounded-3xl" />
          <Skeleton className="h-6 w-2/3 mt-4 rounded" />
          <Skeleton className="h-4 w-1/2 mt-2 rounded" />
        </div>
      </Screen>
    );
  }

  if (!project) {
    return (
      <Screen>
        <ScreenHeader showBack title="Project" />
        <div className="px-5 py-16 text-center text-muted-foreground">
          Project not found.
        </div>
      </Screen>
    );
  }

  const model = getModelPreset(project.model as never);
  const scene = getScenePreset(project.scene as never);
  const style = getStylePreset(project.style as never);
  const allImages = project.generations.flatMap((g) => g.images);

  const onContinue = () => {
    // Resume the studio flow with this project's config
    startStudio(project.product);
    useApp.getState().setStudioProjectId(project.id);
    useApp.getState().setStudioModel(project.model as never);
    useApp.getState().setStudioModelPreference((project.modelPreference as never) ?? null);
    useApp.getState().setStudioScene(project.scene as never);
    useApp.getState().setStudioStyle(project.style as never);
    // If has generations, jump to results; otherwise go to summary
    if (allImages.length > 0) {
      useApp.getState().setStudioImages(
        allImages.map((url, i) => ({
          id: `img-${project.id}-${i}`,
          url,
          selected: false,
          favorite: false,
          prompt: "",
        })),
      );
      navigate("results");
    } else {
      navigate("studio-summary");
    }
  };

  return (
    <Screen bottomPad="cta">
      <ScreenHeader showBack title="Project" />

      {/* Header */}
      <div className="px-5 pt-2">
        <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
          Studio project
        </p>
        <h1 className="font-display text-[28px] leading-tight mt-0.5">
          {project.product.name}
        </h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          {formatPrice(project.product.price, project.product.currency)} · {project.product.category}
        </p>
      </div>

      {/* Cover image */}
      {allImages.length > 0 && (
        <div className="px-5 mt-5">
          <div className="relative">
            <SmartImage
              src={allImages[0]}
              alt={project.product.name}
              rounded="rounded-3xl"
              className="aspect-[4/5]"
            />
            <span className="absolute top-3 left-3 bg-background/90 backdrop-blur text-foreground text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full font-medium shadow-sm">
              Latest generation
            </span>
          </div>
        </div>
      )}

      {/* Config summary */}
      <div className="px-5 mt-5">
        <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground mb-2">
          Configuration
        </p>
        <div className="rounded-2xl bg-secondary/40 divide-y divide-border">
          <ConfigRow label="Model" value={model.label} hint={model.description} />
          <ConfigRow label="Scene" value={scene.label} hint={scene.description} />
          <ConfigRow label="Style" value={style.label} hint={style.description} />
          <ConfigRow
            label="Generations"
            value={`${project.generations.length} · ${allImages.length} images`}
          />
        </div>
      </div>

      {/* Generation history */}
      {project.generations.length > 0 && (
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              <h3 className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                Generation history
              </h3>
            </div>
            <span className="text-[12px] text-muted-foreground">
              {project.generations.length} runs
            </span>
          </div>
          <div className="space-y-4">
            {project.generations.map((g, i) => (
              <div key={g.id} className="rounded-2xl bg-secondary/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-medium text-foreground">
                    Generation {project.generations.length - i}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(g.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {g.images.map((url, j) => (
                    <div
                      key={j}
                      className="relative aspect-[4/5] overflow-hidden rounded-lg bg-secondary"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Generation ${i + 1} image ${j + 1}`}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      <PrimaryCTA
        onClick={onContinue}
        icon={<Sparkles className="h-5 w-5" />}
      >
        {allImages.length > 0 ? "Open in studio" : "Continue studio"}
      </PrimaryCTA>
    </Screen>
  );
}

function ConfigRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="py-3 px-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="text-[14px] font-medium text-right">{value}</div>
      </div>
      {hint && (
        <div className="text-[12px] text-muted-foreground mt-1 line-clamp-1">
          {hint}
        </div>
      )}
    </div>
  );
}
