"use client";

import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { PrimaryCTA } from "@/components/studio/cta";
import {
  getModelPreset,
  getScenePreset,
  getStylePreset,
  formatPrice,
  POSE_PRESETS,
  LIGHTING_PRESETS,
  CAMERA_ANGLE_PRESETS,
} from "@/lib/presets";
import {
  Sparkles,
  Pencil,
  PersonStanding,
  Sun,
  Camera,
  Palette,
  Shirt,
  User,
  Check,
} from "lucide-react";
import type { ScreenId } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEP_TARGET: Record<string, ScreenId> = {
  model: "studio-model",
  pose: "studio-model",
  preference: "studio-model",
  scene: "studio-scene",
  lighting: "studio-scene",
  angle: "studio-style",
  style: "studio-style",
};

export function StudioSummaryScreen() {
  const { studio, navigate, settings } = useApp();

  const model = getModelPreset(studio.model);
  const scene = getScenePreset(studio.scene);
  const style = getStylePreset(studio.style);
  const pose = POSE_PRESETS.find((p) => p.id === studio.pose) ?? POSE_PRESETS[0];
  const lighting = LIGHTING_PRESETS.find((l) => l.id === studio.lighting) ?? LIGHTING_PRESETS[0];
  const cameraAngle = CAMERA_ANGLE_PRESETS.find((a) => a.id === studio.cameraAngle) ?? CAMERA_ANGLE_PRESETS[0];

  const onGenerate = () => {
    navigate("generating");
  };

  const editStep = (target: keyof typeof STEP_TARGET) => {
    navigate(STEP_TARGET[target]);
  };

  if (!studio.product) {
    return (
      <Screen>
        <ScreenHeader showBack title="Your Studio" />
        <div className="px-5 py-16 text-center text-muted-foreground">
          No product selected.
          <button
            onClick={() => navigate("studio-product")}
            className="block mt-4 underline text-foreground"
          >
            Choose a product
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen bottomPad="cta">
      <ScreenHeader showBack title="Your Studio" />

      <div className="px-5 pt-2">
        <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground font-medium">
          Ready to create
        </p>
        <h1 className="font-display text-[28px] leading-tight mt-1">
          Your studio
        </h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Review all {settings.generationCount} dimension{settings.generationCount === 1 ? "" : "s"}. We&rsquo;ll generate {settings.generationCount} image{settings.generationCount === 1 ? "" : "s"}.
        </p>
      </div>

      {/* Product hero card */}
      <div className="px-5 mt-5">
        <div className="relative overflow-hidden rounded-3xl bg-foreground text-background p-5 flex items-center gap-4">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-background/10 blur-2xl" />
          <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-background/10">
            {studio.product.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={studio.product.images[0]}
                alt={studio.product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Shirt className="h-6 w-6 opacity-50" />
              </div>
            )}
          </div>
          <div className="relative flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wide opacity-70">Product</p>
            <p className="font-display text-[20px] leading-tight mt-0.5 line-clamp-1">
              {studio.product.name}
            </p>
            <p className="text-[13px] opacity-75 mt-0.5">
              {formatPrice(studio.product.price, studio.product.currency)} · {studio.product.category}
            </p>
          </div>
          <button
            onClick={() => editStep("model")}
            aria-label="Edit product"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-background/15 active:scale-95 transition shrink-0"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Creative dimensions grid */}
      <div className="px-5 mt-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium mb-3">
          Creative direction
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <DimensionCard
            icon={<User className="h-4 w-4" strokeWidth={1.75} />}
            label="Model"
            value={model.label}
            sub={studio.modelPreference ? `${studio.modelPreference} mood` : model.description}
            onEdit={() => editStep("model")}
          />
          <DimensionCard
            icon={<PersonStanding className="h-4 w-4" strokeWidth={1.75} />}
            label="Pose"
            value={pose.label}
            sub={pose.description}
            onEdit={() => editStep("pose")}
          />
          <DimensionCard
            icon={<Shirt className="h-4 w-4" strokeWidth={1.75} />}
            label="Scene"
            value={scene.label}
            sub={scene.description}
            onEdit={() => editStep("scene")}
          />
          <DimensionCard
            icon={<Sun className="h-4 w-4" strokeWidth={1.75} />}
            label="Lighting"
            value={lighting.label}
            sub={lighting.description}
            onEdit={() => editStep("lighting")}
          />
          <DimensionCard
            icon={<Camera className="h-4 w-4" strokeWidth={1.75} />}
            label="Camera"
            value={cameraAngle.label}
            sub={cameraAngle.description}
            onEdit={() => editStep("angle")}
          />
          <DimensionCard
            icon={<Palette className="h-4 w-4" strokeWidth={1.75} />}
            label="Style"
            value={style.label}
            sub={style.description}
            onEdit={() => editStep("style")}
          />
        </div>
      </div>

      {/* Generation count */}
      <div className="px-5 mt-5">
        <div className="rounded-2xl bg-secondary/60 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-[12px] uppercase tracking-wide text-muted-foreground">
                Generation
              </p>
              <p className="text-[15px] font-medium mt-0.5">
                {settings.generationCount} image{settings.generationCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {settings.generationCount === 4 ? "Default" : "Custom"}
          </span>
        </div>
      </div>

      <div className="flex-1" />

      <PrimaryCTA
        onClick={onGenerate}
        icon={<Sparkles className="h-5 w-5" />}
      >
        Create Images
      </PrimaryCTA>
    </Screen>
  );
}

function DimensionCard({
  icon,
  label,
  value,
  sub,
  onEdit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  onEdit: () => void;
}) {
  return (
    <div className="group relative rounded-2xl bg-secondary/40 p-3.5 active:scale-[0.98] transition">
      <div className="flex items-center justify-between mb-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5">
          {icon}
        </span>
        <button
          onClick={onEdit}
          aria-label={`Edit ${label}`}
          className="flex h-7 w-7 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 active:bg-foreground/5 transition text-muted-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
        {label}
      </p>
      <p className="text-[15px] font-semibold leading-tight mt-0.5">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{sub}</p>
    </div>
  );
}
