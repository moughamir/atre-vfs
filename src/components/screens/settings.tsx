"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { PrimaryCTA } from "@/components/studio/cta";
import {
  MODEL_PRESETS,
  POSE_PRESETS,
  LIGHTING_PRESETS,
  CAMERA_ANGLE_PRESETS,
  SCENE_PRESETS,
  STYLE_PRESETS,
} from "@/lib/presets";
import type {
  ModelOption,
  PoseOption,
  LightingOption,
  CameraAngleOption,
  SceneOption,
  StyleOption,
} from "@/lib/types";
import {
  User,
  Sliders,
  Trash2,
  AlertTriangle,
  Check,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SettingsScreen() {
  const { settings, setSettings, pushToast, navigate } = useApp();
  const [section, setSection] = useState<"defaults" | "generation" | "data">(
    "defaults",
  );

  const sections = [
    { id: "defaults" as const, label: "Defaults" },
    { id: "generation" as const, label: "Generation" },
    { id: "data" as const, label: "Data" },
  ];

  const clearAll = async () => {
    try {
      // Clear favorites file
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "", productName: "", remove: true }),
      }).catch(() => {});
      // Clear all favorites in state by removing each
      useApp.getState().setFavorites([]);
      // Reset settings
      setSettings({
        defaultModel: "woman",
        defaultScene: "studio",
        defaultStyle: "clean",
        generationCount: 4,
      });
      pushToast({
        title: "All data cleared",
        description: "Settings reset to defaults.",
        variant: "success",
      });
    } catch {
      pushToast({ title: "Couldn't clear data", variant: "destructive" });
    }
  };

  return (
    <Screen bottomPad="nav">
      <ScreenHeader showBack title="Settings" />

      <div className="px-5 pt-2">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          <h1 className="font-display text-[28px] leading-tight">Settings</h1>
        </div>
        <p className="text-[14px] text-muted-foreground mt-1">
          Personalize your studio defaults.
        </p>
      </div>

      {/* Section tabs */}
      <div className="px-5 mt-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "shrink-0 h-10 px-4 rounded-full text-[13px] font-medium transition active:scale-95",
                section === s.id
                  ? "bg-foreground text-background"
                  : "bg-secondary text-foreground hover:bg-accent",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Defaults section */}
      {section === "defaults" && (
        <div className="px-5 mt-6 space-y-6">
          <SettingGroup
            label="Default model"
            description="Pre-selected when you start a new studio."
          >
            <div className="grid grid-cols-2 gap-2.5">
              {MODEL_PRESETS.map((m) => (
                <PresetChip
                  key={m.id}
                  label={m.label}
                  emoji={m.emoji}
                  active={settings.defaultModel === m.id}
                  onClick={() =>
                    setSettings({ defaultModel: m.id as ModelOption })
                  }
                />
              ))}
            </div>
          </SettingGroup>

          <SettingGroup
            label="Default scene"
            description="Where your photoshoots happen by default."
          >
            <div className="grid grid-cols-2 gap-2.5">
              {SCENE_PRESETS.map((s) => (
                <PresetChip
                  key={s.id}
                  label={s.label}
                  active={settings.defaultScene === s.id}
                  onClick={() =>
                    setSettings({ defaultScene: s.id as SceneOption })
                  }
                />
              ))}
            </div>
          </SettingGroup>

          <SettingGroup
            label="Default style"
            description="The mood applied to new generations."
          >
            <div className="grid grid-cols-3 gap-2">
              {STYLE_PRESETS.map((s) => (
                <PresetChip
                  key={s.id}
                  label={s.label}
                  active={settings.defaultStyle === s.id}
                  onClick={() =>
                    setSettings({ defaultStyle: s.id as StyleOption })
                  }
                />
              ))}
            </div>
          </SettingGroup>

          <SettingGroup
            label="Default pose"
            description="How the model stands in new studios."
          >
            <div className="grid grid-cols-3 gap-2">
              {POSE_PRESETS.map((p) => (
                <PresetChip
                  key={p.id}
                  label={p.label}
                  active={settings.defaultPose === p.id}
                  onClick={() =>
                    setSettings({ defaultPose: p.id as PoseOption })
                  }
                />
              ))}
            </div>
          </SettingGroup>

          <SettingGroup
            label="Default lighting"
            description="The light quality for new studios."
          >
            <div className="grid grid-cols-3 gap-2">
              {LIGHTING_PRESETS.map((l) => (
                <PresetChip
                  key={l.id}
                  label={l.label}
                  active={settings.defaultLighting === l.id}
                  onClick={() =>
                    setSettings({ defaultLighting: l.id as LightingOption })
                  }
                />
              ))}
            </div>
          </SettingGroup>

          <SettingGroup
            label="Default camera angle"
            description="The perspective for new studios."
          >
            <div className="grid grid-cols-3 gap-2">
              {CAMERA_ANGLE_PRESETS.map((a) => (
                <PresetChip
                  key={a.id}
                  label={a.label}
                  active={settings.defaultCameraAngle === a.id}
                  onClick={() =>
                    setSettings({ defaultCameraAngle: a.id as CameraAngleOption })
                  }
                />
              ))}
            </div>
          </SettingGroup>
        </div>
      )}

      {/* Generation section */}
      {section === "generation" && (
        <div className="px-5 mt-6 space-y-6">
          <SettingGroup
            label="Images per generation"
            description="How many variations to create at once. More images = more variety but slower."
          >
            <div className="grid grid-cols-4 gap-2.5">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setSettings({ generationCount: n })}
                  className={cn(
                    "h-14 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95",
                    settings.generationCount === n
                      ? "bg-foreground text-background"
                      : "bg-secondary text-foreground hover:bg-accent",
                  )}
                  aria-pressed={settings.generationCount === n}
                >
                  <span className="font-display text-[20px] leading-none">
                    {n}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide opacity-70 mt-0.5">
                    {n === 1 ? "image" : "images"}
                  </span>
                </button>
              ))}
            </div>
          </SettingGroup>

          <div className="rounded-2xl bg-secondary/40 p-4 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-[13px] font-medium">Tip</p>
              <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
                4 images gives the best balance of variety and speed. Lower the count if you want faster results.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data section */}
      {section === "data" && (
        <div className="px-5 mt-6 space-y-4">
          <SettingGroup
            label="Your data"
            description="Manage what's stored on this device."
          >
            <div className="rounded-2xl bg-secondary/40 divide-y divide-border overflow-hidden">
              <DataRow
                icon={<ImageIcon className="h-5 w-5" strokeWidth={1.75} />}
                label="Favorites"
                value={`${useApp.getState().favorites.length} saved`}
              />
              <DataRow
                icon={<User className="h-5 w-5" strokeWidth={1.75} />}
                label="Projects"
                value={`${useApp.getState().projects.length} studios`}
              />
            </div>
          </SettingGroup>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full rounded-2xl border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3 active:scale-[0.99] transition text-left">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <Trash2 className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-destructive">
                    Clear favorites & reset settings
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    Products and published listings are preserved.
                  </p>
                </div>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-sm rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-2xl flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Clear all data?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Your favorites will be removed and settings reset to defaults. Products and published shop listings are preserved. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col gap-2">
                <AlertDialogCancel className="rounded-full h-12">
                  Keep
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={clearAll}
                  className="rounded-full h-12 bg-destructive text-white hover:bg-destructive/90"
                >
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <div className="flex-1" />

      <PrimaryCTA
        onClick={() => navigate("more")}
        variant="ghost"
      >
        Done
      </PrimaryCTA>
    </Screen>
  );
}

function SettingGroup({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
        {label}
      </p>
      {description && (
        <p className="text-[12px] text-muted-foreground/80 mt-1 mb-3 leading-relaxed">
          {description}
        </p>
      )}
      {!description && <div className="mb-3" />}
      {children}
    </div>
  );
}

function PresetChip({
  label,
  emoji,
  active,
  onClick,
}: {
  label: string;
  emoji?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative h-12 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95",
        active
          ? "bg-foreground text-background shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)]"
          : "bg-secondary text-foreground hover:bg-accent",
      )}
    >
      {emoji && <span className="text-[16px] opacity-80">{emoji}</span>}
      <span className="text-[13px] font-medium">{label}</span>
      {active && (
        <Check className="h-3.5 w-3.5 ml-0.5" strokeWidth={3} />
      )}
    </button>
  );
}

function DataRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 h-14 px-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5">
        {icon}
      </span>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <span className="text-[13px] text-muted-foreground">{value}</span>
    </div>
  );
}
