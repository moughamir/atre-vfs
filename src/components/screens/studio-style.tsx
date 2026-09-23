"use client";

import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader, ExitStudioConfirm } from "@/components/studio/screen-header";
import { PrimaryCTA } from "@/components/studio/cta";
import { StudioProgress } from "@/components/studio/studio-progress";
import { ChoiceCard } from "@/components/studio/choice-card";
import { STYLE_PRESETS } from "@/lib/presets";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import type { StyleOption } from "@/lib/types";

export function StudioStyleScreen() {
  const { studio, setStudioStyle, navigate, resetStudio, setActiveTab } = useApp();
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
