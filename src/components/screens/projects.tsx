"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProjects } from "@/lib/api";
import { getModelPreset, getScenePreset, getStylePreset, formatPrice } from "@/lib/presets";
import { ChevronRight, Sparkles, Layers, Clock, Plus } from "lucide-react";
import type { ProjectSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProjectsScreen() {
  const { openProject, projects, setProjects, projectsLoaded, startStudio, navigate, pushToast } = useApp();
  const [loading, setLoading] = useState(!projectsLoaded);

  useEffect(() => {
    if (projectsLoaded) return;
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
  }, [projectsLoaded, setProjects]);

  const drafts = projects.filter((p) => p.status === "configuring" || p.status === "generating" || p.status === "failed");
  const ready = projects.filter((p) => p.status === "ready" || p.status === "published");

  return (
    <Screen>
      <ScreenHeader showBack title="Projects" />

      <div className="px-5 pt-2">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          <h1 className="font-display text-[28px] leading-tight">Your studios</h1>
        </div>
        <p className="text-[14px] text-muted-foreground mt-1">
          {projects.length > 0
            ? `${projects.length} projects · ${drafts.length} in progress`
            : "Every photoshoot lives here. Come back anytime."}
        </p>
      </div>

      {/* New studio CTA */}
      <div className="px-5 mt-5">
        <button
          onClick={() => navigate("studio-product")}
          className="w-full rounded-2xl border border-dashed border-border p-4 flex items-center gap-3 active:scale-[0.99] transition hover:border-foreground/30"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background">
            <Plus className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="text-left flex-1">
            <p className="text-[15px] font-medium">Start a new studio</p>
            <p className="text-[12px] text-muted-foreground">Choose a product to begin</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Drafts / In progress */}
      {drafts.length > 0 && (
        <div className="mt-7 px-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <h3 className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              In progress
            </h3>
            <span className="text-[12px] text-muted-foreground/70">· {drafts.length}</span>
          </div>
          <div className="space-y-2.5">
            {drafts.map((p) => (
              <ProjectRow
                key={p.id}
                project={p}
                onClick={() => openProject(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ready / Published */}
      {ready.length > 0 && (
        <div className="mt-7 px-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <h3 className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Ready
            </h3>
            <span className="text-[12px] text-muted-foreground/70">· {ready.length}</span>
          </div>
          <div className="space-y-2.5">
            {ready.map((p) => (
              <ProjectRow
                key={p.id}
                project={p}
                onClick={() => openProject(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="mt-7 px-5 space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && projects.length === 0 && (
        <div className="px-5 mt-8">
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5">
              <Layers className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-display text-[18px] mt-3">No projects yet</p>
            <p className="text-[13px] text-muted-foreground mt-1 max-w-[16rem] mx-auto">
              When you create a studio, it will be saved here automatically. Come back any time.
            </p>
          </div>
        </div>
      )}
    </Screen>
  );
}

function ProjectRow({
  project,
  onClick,
}: {
  project: ProjectSummary;
  onClick: () => void;
}) {
  const model = getModelPreset(project.model as never);
  const scene = getScenePreset(project.scene as never);
  const style = getStylePreset(project.style as never);
  const imageCount = project.generations.reduce(
    (sum, g) => sum + g.images.length,
    0,
  );
  const cover = project.generations[0]?.images?.[0] ?? project.product.images?.[0];

  const statusLabel =
    project.status === "configuring"
      ? "Draft"
      : project.status === "generating"
        ? "Generating"
        : project.status === "failed"
          ? "Failed"
          : project.status === "published"
            ? "Published"
            : "Ready";

  const statusColor =
    project.status === "failed"
      ? "bg-destructive/15 text-destructive"
      : project.status === "published"
        ? "bg-foreground text-background"
        : "bg-foreground/8 text-foreground";

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl bg-secondary/40 p-2.5 flex items-center gap-3 active:scale-[0.99] transition hover:bg-secondary"
    >
      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="text-[15px] font-medium leading-tight line-clamp-1">
          {project.product.name}
        </div>
        <div className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
          <span className="capitalize">{scene.label.toLowerCase()}</span>
          <span className="opacity-50">·</span>
          <span className="capitalize">{style.label.toLowerCase()}</span>
          {imageCount > 0 && (
            <>
              <span className="opacity-50">·</span>
              <span>{imageCount} images</span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className={cn("text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium", statusColor)}>
          {statusLabel}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </button>
  );
}
