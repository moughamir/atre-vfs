"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { PrimaryCTA } from "@/components/studio/cta";
import {
  Sparkles,
  Camera,
  ShoppingBag,
  ArrowRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    icon: Camera,
    title: "Turn products into shoots",
    description:
      "Upload a product photo, choose a model, scene and style. Atré handles the rest.",
    accent: "from-foreground to-foreground/80",
  },
  {
    icon: Sparkles,
    title: "Generate in minutes",
    description:
      "Get 4 professional fashion images per shoot. No photographer, studio or editing software required.",
    accent: "from-foreground/80 to-foreground/60",
  },
  {
    icon: ShoppingBag,
    title: "Publish to your shop",
    description:
      "Select your favorites, write a listing with AI-generated descriptions, and publish in one tap.",
    accent: "from-foreground/60 to-foreground/40",
  },
];

export function OnboardingScreen() {
  const { completeOnboarding, navigate, settings } = useApp();
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const Icon = slide.icon;
  const isLast = step === SLIDES.length - 1;

  const onNext = () => {
    if (isLast) {
      completeOnboarding();
      navigate("home");
    } else {
      setStep((s) => s + 1);
    }
  };

  const onSkip = () => {
    completeOnboarding();
    navigate("home");
  };

  return (
    <Screen noPadding noMaxWidth>
      <div className="min-h-[100dvh] flex flex-col bg-background">
        {/* Skip button */}
        <div className="flex justify-end p-5" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.25rem)" }}>
          <button
            onClick={onSkip}
            className="text-[13px] text-muted-foreground hover:text-foreground transition font-medium"
          >
            Skip
          </button>
        </div>

        {/* Slide content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          {/* Decorative icon */}
          <div className="relative mb-10">
            <div
              className={cn(
                "absolute inset-0 rounded-full blur-3xl opacity-20 bg-gradient-to-br",
                slide.accent,
              )}
            />
            <div
              className={cn(
                "relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br text-background shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)]",
                slide.accent,
              )}
            >
              <Icon className="h-10 w-10" strokeWidth={1.5} />
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-6">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-400",
                  i === step
                    ? "w-7 bg-foreground"
                    : i < step
                      ? "w-1.5 bg-foreground/60"
                      : "w-1.5 bg-foreground/20",
                )}
              />
            ))}
          </div>

          <h1 className="font-display text-[32px] leading-[1.05] tracking-[-0.01em] max-w-[18rem]">
            {slide.title}
          </h1>
          <p className="text-[15px] text-muted-foreground mt-4 leading-relaxed max-w-[20rem]">
            {slide.description}
          </p>

          {/* Features checklist on last slide */}
          {isLast && (
            <div className="mt-8 space-y-2.5 max-w-[20rem] w-full">
              {[
                "AI image generation",
                "Project persistence",
                "Shop with search & sort",
                "Dark mode",
              ].map((feat) => (
                <div
                  key={feat}
                  className="flex items-center gap-3 rounded-2xl bg-secondary/50 px-4 py-2.5"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-[14px] font-medium">{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div
          className="px-5 pb-8"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)" }}
        >
          <div className="mx-auto max-w-md">
            <button
              onClick={onNext}
              className="group relative w-full h-14 rounded-full text-[15px] font-semibold tracking-[0.12em] uppercase bg-foreground text-background shadow-[0_12px_28px_-10px_rgba(0,0,0,0.4)] active:scale-[0.98] transition flex items-center justify-center gap-2.5 overflow-hidden"
            >
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                }}
              />
              {isLast ? (
                <>
                  Start creating
                  <ArrowRight className="h-5 w-5 relative" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-5 w-5 relative" />
                </>
              )}
            </button>
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="w-full mt-3 text-[13px] text-muted-foreground hover:text-foreground transition font-medium"
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    </Screen>
  );
}
