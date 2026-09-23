"use client";

import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader, ExitStudioConfirm } from "@/components/studio/screen-header";
import { PrimaryCTA } from "@/components/studio/cta";
import { StudioProgress } from "@/components/studio/studio-progress";
import { ChoiceCard } from "@/components/studio/choice-card";
import { SCENE_PRESETS, LIGHTING_PRESETS } from "@/lib/presets";
import { ArrowRight, Sun } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SceneOption, LightingOption } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StudioSceneScreen() {
  const { studio, setStudioScene, setStudioLighting, navigate, resetStudio, setActiveTab } = useApp();
  const [exitOpen, setExitOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);

  const onExitConfirm = () => {
    resetStudio();
    setExitOpen(false);
    setActiveTab("home");
  };

  const onNext = () => navigate("studio-style");

  return (
    <Screen bottomPad="cta">
      <ScreenHeader
        showBack
        showClose
        step="3/4"
        title="Create Studio"
        onClose={() => setExitOpen(true)}
        right={<StudioProgress current={2} />}
      />
      <ExitStudioConfirm
        open={exitOpen}
        onKeepWorking={() => setExitOpen(false)}
        onLeave={onExitConfirm}
      />

      <div className="px-5 pt-2">
        <h1 className="font-display text-[28px] leading-tight">
          Choose your scene
        </h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Where should we shoot?
        </p>
      </div>

      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        {SCENE_PRESETS.map((s) => (
          <ChoiceCard
            key={s.id}
            label={s.label}
            description={s.description}
            selected={studio.scene === s.id}
            onClick={() => setStudioScene(s.id as SceneOption)}
            imageUrl={`/presets/scene-${s.id}.jpg`}
            size="md"
          />
        ))}
      </div>

      {/* Lighting presets */}
      <div className="px-5 mt-6">
        <div className="flex items-center gap-2 mb-1">
          <Sun className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          <p className="text-[14px] font-medium">Lighting</p>
        </div>
        <p className="text-[12px] text-muted-foreground mb-3">
          How should it be lit?
        </p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
          {LIGHTING_PRESETS.map((l) => {
            const active = studio.lighting === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setStudioLighting(l.id as LightingOption)}
                className={cn(
                  "shrink-0 flex flex-col items-start rounded-2xl p-3 w-28 transition-all duration-200 active:scale-95",
                  active
                    ? "bg-foreground text-background shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)]"
                    : "bg-secondary text-foreground hover:bg-accent",
                )}
                aria-pressed={active}
              >
                <span className="text-[13px] font-semibold">{l.label}</span>
                <span
                  className={cn(
                    "text-[11px] mt-1 line-clamp-2",
                    active ? "opacity-70" : "text-muted-foreground",
                  )}
                >
                  {l.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-4">
        <button
          onClick={() => setCustomOpen(true)}
          className="flex items-center gap-2 text-[14px] text-foreground font-medium active:scale-[0.98] transition"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5">
            +
          </span>
          Create custom scene
        </button>
      </div>

      <div className="flex-1" />

      <PrimaryCTA
        onClick={onNext}
        icon={<ArrowRight className="h-5 w-5" />}
      >
        Next
      </PrimaryCTA>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogTitle className="font-display text-2xl text-center">
            Custom scenes
          </DialogTitle>
          <DialogDescription className="text-center text-[14px]">
            Custom scenes are coming soon. For now, pick from the four presets — they cover most fashion shoots.
          </DialogDescription>
          <DialogFooter className="mt-3">
            <Button
              onClick={() => setCustomOpen(false)}
              className="rounded-full h-12 bg-foreground text-background hover:bg-foreground/90"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Screen>
  );
}
