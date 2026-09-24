"use client";

import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader, ExitStudioConfirm } from "@/components/studio/screen-header";
import { PrimaryCTA } from "@/components/studio/cta";
import { StudioProgress } from "@/components/studio/studio-progress";
import { MODEL_PRESETS, MODEL_PREFERENCES, POSE_PRESETS } from "@/lib/presets";
import { ArrowRight, PersonStanding } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ModelOption, ModelPreference, PoseOption } from "@/lib/types";

export function StudioModelScreen() {
  const { studio, setStudioModel, setStudioModelPreference, setStudioPose, navigate, resetStudio, setActiveTab } = useApp();
  const [exitOpen, setExitOpen] = useState(false);

  const onExitConfirm = () => {
    resetStudio();
    setExitOpen(false);
    setActiveTab("home");
  };

  const onNext = () => navigate("studio-scene");

  return (
    <Screen bottomPad="cta">
      <ScreenHeader
        showBack
        showClose
        step="2/4"
        title="Create Studio"
        onClose={() => setExitOpen(true)}
        right={<StudioProgress current={1} />}
      />
      <ExitStudioConfirm
        open={exitOpen}
        onKeepWorking={() => setExitOpen(false)}
        onLeave={onExitConfirm}
      />

      <div className="px-5 pt-2">
        <h1 className="font-display text-[28px] leading-tight">
          Choose your model
        </h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Who should wear it?
        </p>
      </div>

      {/* Options grid */}
      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        {MODEL_PRESETS.map((m) => {
          const active = studio.model === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setStudioModel(m.id as ModelOption)}
              className={cn(
                "relative overflow-hidden rounded-3xl aspect-[5/6] flex flex-col items-center justify-center p-5 text-center transition-all duration-300 active:scale-[0.97]",
                active
                  ? "bg-foreground text-background ring-2 ring-foreground ring-offset-2 ring-offset-background shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)]"
                  : "bg-secondary text-foreground ring-1 ring-border hover:ring-foreground/30",
              )}
              aria-pressed={active}
            >
              <span className="font-display text-5xl mb-3 opacity-90">
                {m.emoji}
              </span>
              <span className="text-[16px] font-semibold font-display">
                {m.label}
              </span>
              <span
                className={cn(
                  "text-[12px] mt-1 max-w-[10rem]",
                  active ? "opacity-75" : "text-muted-foreground",
                )}
              >
                {m.description}
              </span>
              {active && (
                <span className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-background text-foreground text-[11px] font-bold animate-screen-in">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pose presets */}
      <div className="px-5 mt-6">
        <div className="flex items-center gap-2 mb-1">
          <PersonStanding className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          <p className="text-[14px] font-medium">Pose</p>
        </div>
        <p className="text-[12px] text-muted-foreground mb-3">
          How should the model stand?
        </p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
          {POSE_PRESETS.map((p) => {
            const active = studio.pose === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setStudioPose(p.id as PoseOption)}
                className={cn(
                  "shrink-0 flex flex-col items-start rounded-2xl p-3 w-28 transition-all duration-200 active:scale-95",
                  active
                    ? "bg-foreground text-background shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)]"
                    : "bg-secondary text-foreground hover:bg-accent",
                )}
                aria-pressed={active}
              >
                <span className="text-[13px] font-semibold">{p.label}</span>
                <span
                  className={cn(
                    "text-[11px] mt-1 line-clamp-2",
                    active ? "opacity-70" : "text-muted-foreground",
                  )}
                >
                  {p.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional model preference */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-medium">Model preferences</p>
            <p className="text-[12px] text-muted-foreground">Optional</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {MODEL_PREFERENCES.map((p) => {
            const active = studio.modelPreference === p.id;
            return (
              <button
                key={p.id}
                onClick={() =>
                  setStudioModelPreference(active ? null : (p.id as ModelPreference))
                }
                className={cn(
                  "h-10 px-4 rounded-full text-[13px] font-medium transition-all active:scale-95",
                  active
                    ? "bg-foreground text-background"
                    : "bg-secondary text-foreground hover:bg-accent",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1" />

      <PrimaryCTA
        onClick={onNext}
        icon={<ArrowRight className="h-5 w-5" />}
      >
        Next
      </PrimaryCTA>
    </Screen>
  );
}
