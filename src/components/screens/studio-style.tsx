"use client";

import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader, ExitStudioConfirm } from "@/components/studio/screen-header";
import { PrimaryCTA } from "@/components/studio/cta";
import { StudioProgress } from "@/components/studio/studio-progress";
import { ChoiceCard } from "@/components/studio/choice-card";
import { STYLE_PRESETS, CAMERA_ANGLE_PRESETS } from "@/lib/presets";
import { Sparkles, Camera } from "lucide-react";
import { useState } from "react";
import type { StyleOption, CameraAngleOption } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StudioStyleScreen() {
  const { studio, setStudioStyle, setStudioCameraAngle, navigate, resetStudio, setActiveTab } = useApp();
  const [exitOpen, setExitOpen] = useState(false);

  const onExitConfirm = () => {
    resetStudio();
    setExitOpen(false);
    setActiveTab("home");
  };

  const onCreate = () => {
    setStudioStyle(studio.style); // ensure state persisted
    navigate("studio-summary");
  };

  return (
    <Screen bottomPad="cta">
      <ScreenHeader
        showBack
        showClose
        step="4/4"
        title="Create Studio"
        onClose={() => setExitOpen(true)}
        right={<StudioProgress current={3} />}
      />
      <ExitStudioConfirm
        open={exitOpen}
        onKeepWorking={() => setExitOpen(false)}
        onLeave={onExitConfirm}
      />

      <div className="px-5 pt-2">
        <h1 className="font-display text-[28px] leading-tight">
          Choose your style
        </h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          How should it feel?
        </p>
      </div>

      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        {STYLE_PRESETS.map((s) => (
          <ChoiceCard
            key={s.id}
            label={s.label}
            description={s.description}
            selected={studio.style === s.id}
            onClick={() => setStudioStyle(s.id as StyleOption)}
            imageUrl={`/presets/style-${s.id}.jpg`}
            size="md"
          />
        ))}
      </div>

      {/* Camera angle presets */}
      <div className="px-5 mt-6">
        <div className="flex items-center gap-2 mb-1">
          <Camera className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          <p className="text-[14px] font-medium">Camera angle</p>
        </div>
        <p className="text-[12px] text-muted-foreground mb-3">
          From which perspective?
        </p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
          {CAMERA_ANGLE_PRESETS.map((a) => {
            const active = studio.cameraAngle === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setStudioCameraAngle(a.id as CameraAngleOption)}
                className={cn(
                  "shrink-0 flex flex-col items-start rounded-2xl p-3 w-28 transition-all duration-200 active:scale-95",
                  active
                    ? "bg-foreground text-background shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)]"
                    : "bg-secondary text-foreground hover:bg-accent",
                )}
                aria-pressed={active}
              >
                <span className="text-[13px] font-semibold">{a.label}</span>
                <span
                  className={cn(
                    "text-[11px] mt-1 line-clamp-2",
                    active ? "opacity-70" : "text-muted-foreground",
                  )}
                >
                  {a.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1" />

      <PrimaryCTA
        onClick={onCreate}
        icon={<Sparkles className="h-5 w-5" />}
      >
        Create Images
      </PrimaryCTA>
    </Screen>
  );
}
