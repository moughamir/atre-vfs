"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { PrimaryCTA } from "@/components/studio/cta";
import { MODEL_PRESETS, SCENE_PRESETS, STYLE_PRESETS } from "@/lib/presets";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModelOption, SceneOption, StyleOption } from "@/lib/types";

type EditTarget = "model" | "scene" | "style";

export function EditImageScreen() {
  const {
    studio,
    setStudioModel,
    setStudioScene,
    setStudioStyle,
    navigate,
    setStudioStatus,
    clearEditTarget,
    pushToast,
  } = useApp();
  const [activeTab, setActiveTab] = useState<EditTarget>("model");

  const onRegenerate = () => {
    clearEditTarget();
    setStudioStatus("generating");
    pushToast({
      title: "Regenerating with new settings",
      description: "Keep your studio settings safe.",
    });
    navigate("generating");
  };

  const targetMeta: Record<EditTarget, { title: string; sub: string }> = {
    model: { title: "Change model", sub: "Who should wear it?" },
    scene: { title: "Change scene", sub: "Where should we shoot?" },
    style: { title: "Change style", sub: "How should it feel?" },
  };

  return (
    <Screen bottomPad="cta">
      <ScreenHeader showBack title="Edit image" />

      <div className="px-5 pt-2">
        <h1 className="font-display text-[26px] leading-tight">
          What would you like to change?
        </h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Edit one element at a time, then regenerate.
        </p>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {(["model", "scene", "style"] as EditTarget[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                "shrink-0 h-10 px-4 rounded-full text-[13px] font-medium transition active:scale-95 capitalize",
                activeTab === t
                  ? "bg-foreground text-background"
                  : "bg-secondary text-foreground hover:bg-accent",
              )}
            >
              {targetMeta[t].title.replace("Change ", "")}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5">
        <p className="text-[14px] text-muted-foreground">
          {targetMeta[activeTab].sub}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {activeTab === "model" &&
            MODEL_PRESETS.map((m) => (
              <OptionTile
                key={m.id}
                label={m.label}
                sub={m.description}
                emoji={m.emoji}
                active={studio.model === m.id}
                onClick={() => setStudioModel(m.id as ModelOption)}
              />
            ))}
          {activeTab === "scene" &&
            SCENE_PRESETS.map((s) => (
              <OptionTile
                key={s.id}
                label={s.label}
                sub={s.description}
                imageUrl={`/presets/scene-${s.id}.jpg`}
                active={studio.scene === s.id}
                onClick={() => setStudioScene(s.id as SceneOption)}
              />
            ))}
          {activeTab === "style" &&
            STYLE_PRESETS.map((s) => (
              <OptionTile
                key={s.id}
                label={s.label}
                sub={s.description}
                imageUrl={`/presets/style-${s.id}.jpg`}
                active={studio.style === s.id}
                onClick={() => setStudioStyle(s.id as StyleOption)}
              />
            ))}
        </div>
      </div>

      <div className="flex-1" />

      <PrimaryCTA onClick={onRegenerate} icon={<Sparkles className="h-5 w-5" />}>
        Regenerate
      </PrimaryCTA>
    </Screen>
  );
}

function OptionTile({
  label,
  sub,
  emoji,
  imageUrl,
  active,
  onClick,
}: {
  label: string;
  sub: string;
  emoji?: string;
  imageUrl?: string;
  active: boolean;
  onClick: () => void;
}) {
  const [err, setErr] = useState(false);
  const showImg = imageUrl && !err;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative overflow-hidden rounded-2xl aspect-[5/6] text-left transition-all duration-300 active:scale-[0.97]",
        active
          ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
          : "ring-1 ring-border",
      )}
    >
      <div className="relative h-full w-full">
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={label}
            loading="lazy"
            onError={() => setErr(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-accent to-secondary">
            <span className="text-4xl font-display text-foreground/40 mb-1">{emoji ?? "◇"}</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
          </div>
        )}
        {showImg && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        )}
        {active && (
          <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background shadow-md animate-screen-in">
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div
            className={cn(
              "text-[14px] font-semibold font-display",
              showImg ? "text-white" : "text-foreground",
            )}
          >
            {label}
          </div>
          <div
            className={cn(
              "text-[11px] line-clamp-1",
              showImg ? "text-white/75" : "text-muted-foreground",
            )}
          >
            {sub}
          </div>
        </div>
      </div>
    </button>
  );
}
