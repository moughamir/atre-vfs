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
} from "@/lib/presets";
import { Sparkles, Pencil } from "lucide-react";
import type { ScreenId } from "@/lib/types";

const STEP_TARGET: Record<string, ScreenId> = {
  model: "studio-model",
  scene: "studio-scene",
  style: "studio-style",
};

export function StudioSummaryScreen() {
  const { studio, navigate } = useApp();

  const model = getModelPreset(studio.model);
  const scene = getScenePreset(studio.scene);
  const style = getStylePreset(studio.style);

  const onGenerate = () => {
    navigate("generating");
  };

  const editStep = (target: "product" | "model" | "scene" | "style") => {
    if (target === "product") {
      navigate("studio-product");
    } else {
      navigate(STEP_TARGET[target]);
    }
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
        <h1 className="font-display text-[28px] leading-tight">
          Ready to create
        </h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Review your choices. We&rsquo;ll generate 4 images.
        </p>
      </div>

      {/* Product card with image */}
      <div className="px-5 mt-5">
        <SummaryRow
          label="Product"
          value={studio.product.name}
          sub={`${formatPrice(studio.product.price, studio.product.currency)} · ${studio.product.category}`}
          imageUrl={studio.product.images?.[0]}
          onEdit={() => editStep("product")}
        />
      </div>

      <div className="px-5 mt-3 space-y-3">
        <SummaryRow
          label="Model"
          value={model.label}
          sub={studio.modelPreference ? `${studio.modelPreference} mood` : model.description}
          emoji={model.emoji}
          onEdit={() => editStep("model")}
        />
        <SummaryRow
          label="Scene"
          value={scene.label}
          sub={scene.description}
          emoji="◇"
          onEdit={() => editStep("scene")}
        />
        <SummaryRow
          label="Style"
          value={style.label}
          sub={style.description}
          emoji="❖"
          onEdit={() => editStep("style")}
        />
      </div>

      {/* Count */}
      <div className="px-5 mt-5">
        <div className="rounded-2xl bg-secondary/60 p-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] uppercase tracking-wide text-muted-foreground">
              Images
            </p>
            <p className="text-[16px] font-medium mt-0.5">4 images</p>
          </div>
          <span className="text-[12px] text-muted-foreground">Default</span>
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

function SummaryRow({
  label,
  value,
  sub,
  imageUrl,
  emoji,
  onEdit,
}: {
  label: string;
  value: string;
  sub?: string;
  imageUrl?: string;
  emoji?: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-secondary/40 px-3 py-3">
      <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-secondary flex items-center justify-center">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={value} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl font-display opacity-70">{emoji}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-[15px] font-medium leading-tight mt-0.5 line-clamp-1">
          {value}
        </p>
        {sub && <p className="text-[12px] text-muted-foreground line-clamp-1">{sub}</p>}
      </div>
      <button
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        className="flex h-9 w-9 items-center justify-center rounded-full active:bg-foreground/5 text-muted-foreground"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}
