"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { PrimaryCTA } from "@/components/studio/cta";
import {
  User,
  Palette,
  Check,
  Sparkles,
  Camera,
  ChevronRight,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BRAND_AESTHETICS = [
  { id: "minimal", label: "Minimal", description: "Clean, stripped back, quiet", emoji: "◯" },
  { id: "luxury", label: "Luxury", description: "Premium, rich, sophisticated", emoji: "✦" },
  { id: "editorial", label: "Editorial", description: "Magazine-grade, dramatic", emoji: "❖" },
  { id: "street", label: "Street", description: "Urban, edgy, modern", emoji: "◈" },
] as const;

const BRAND_COLORS = [
  { id: "sand", label: "Sand", hex: "#D4C5A9" },
  { id: "noir", label: "Noir", hex: "#1A1A1A" },
  { id: "blush", label: "Blush", hex: "#E8C5C5" },
  { id: "sage", label: "Sage", hex: "#A8B5A0" },
  { id: "ivory", label: "Ivory", hex: "#F5F0E8" },
  { id: "clay", label: "Clay", hex: "#B5634A" },
] as const;

export function BrandProfileScreen() {
  const { pushToast, navigate, settings, setSettings } = useApp();
  const [brandName, setBrandName] = useState("Atré Studio");
  const [tagline, setTagline] = useState("Virtual fashion photography");
  const [aesthetic, setAesthetic] = useState<string>(settings.defaultStyle);
  const [color, setColor] = useState<string>("sand");

  const onSave = () => {
    // Apply aesthetic as default style
    setSettings({ defaultStyle: aesthetic as never });
    pushToast({
      title: "Brand profile saved",
      description: `${brandName} · ${aesthetic} aesthetic`,
      variant: "success",
    });
    navigate("more");
  };

  return (
    <Screen bottomPad="cta">
      <ScreenHeader showBack title="Brand profile" />

      <div className="px-5 pt-2">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          <h1 className="font-display text-[28px] leading-tight">Your brand</h1>
        </div>
        <p className="text-[14px] text-muted-foreground mt-1">
          Define your identity. New studios inherit these defaults.
        </p>
      </div>

      {/* Brand identity card */}
      <div className="px-5 mt-5">
        <div className="rounded-3xl bg-foreground text-background p-6 overflow-hidden relative">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-background/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-background/5 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] opacity-75">
              <Sparkles className="h-3.5 w-3.5" />
              Brand preview
            </div>
            <p className="font-display text-[26px] leading-tight mt-3">{brandName || "Your brand"}</p>
            <p className="text-[14px] opacity-75 mt-1">{tagline || "Add a tagline"}</p>
            <div className="mt-4 flex items-center gap-2">
              <span
                className="h-5 w-5 rounded-full ring-2 ring-background/30"
                style={{ backgroundColor: BRAND_COLORS.find((c) => c.id === color)?.hex }}
              />
              <span className="text-[12px] uppercase tracking-wide opacity-80">
                {BRAND_AESTHETICS.find((a) => a.id === aesthetic)?.label} · {BRAND_COLORS.find((c) => c.id === color)?.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Brand name + tagline */}
      <div className="px-5 mt-6 space-y-4">
        <Field label="Brand name">
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Atré Studio"
            className="w-full h-12 rounded-xl bg-secondary px-4 text-[15px] outline-none focus:ring-2 ring-foreground/30 transition"
          />
        </Field>
        <Field label="Tagline">
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Virtual fashion photography"
            className="w-full h-12 rounded-xl bg-secondary px-4 text-[15px] outline-none focus:ring-2 ring-foreground/30 transition"
          />
        </Field>
      </div>

      {/* Aesthetic */}
      <div className="px-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
            Aesthetic
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {BRAND_AESTHETICS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAesthetic(a.id)}
              className={cn(
                "relative h-16 rounded-2xl flex flex-col items-start justify-center px-4 transition-all active:scale-95",
                aesthetic === a.id
                  ? "bg-foreground text-background shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)]"
                  : "bg-secondary text-foreground hover:bg-accent",
              )}
              aria-pressed={aesthetic === a.id}
            >
              <div className="flex items-center gap-2">
                <span className="text-[18px] opacity-80">{a.emoji}</span>
                <span className="text-[14px] font-medium">{a.label}</span>
              </div>
              <span className={cn("text-[11px] mt-0.5", aesthetic === a.id ? "opacity-70" : "text-muted-foreground")}>
                {a.description}
              </span>
              {aesthetic === a.id && (
                <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-background text-foreground">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Brand color */}
      <div className="px-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-4 w-4 rounded-full" style={{ backgroundColor: BRAND_COLORS.find((c) => c.id === color)?.hex }} />
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
            Brand color
          </p>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {BRAND_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              className={cn(
                "relative aspect-square rounded-2xl transition-all active:scale-95",
                color === c.id
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "ring-1 ring-border hover:ring-foreground/30",
              )}
              style={{ backgroundColor: c.hex }}
              aria-label={c.label}
              aria-pressed={color === c.id}
            >
              {color === c.id && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white drop-shadow" strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="text-[12px] text-muted-foreground mt-2">
          {BRAND_COLORS.find((c) => c.id === color)?.label}
        </p>
      </div>

      <div className="flex-1" />

      <PrimaryCTA onClick={onSave} icon={<Check className="h-5 w-5" />}>
        Save brand
      </PrimaryCTA>
    </Screen>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
