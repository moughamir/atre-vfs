"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { GENERATION_STEPS } from "@/lib/presets";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeneratedImage } from "@/lib/types";
import { createProject, addGenerationToProject, patchProject } from "@/lib/api";

export function GeneratingScreen() {
  const { studio, navigate, setStudioStatus, addGeneration, pushToast, setStudioProjectId, upsertProject, settings } = useApp();
  const [step, setStep] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    setStudioStatus("generating");

    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    GENERATION_STEPS.forEach((_, i) => {
      stepTimers.push(
        setTimeout(() => {
          if (!cancelled) setStep(i);
        }, 400 + i * 700),
      );
    });

    const run = async () => {
      // 1. Ensure the project is persisted (create if not yet saved)
      let projectId = studio.id;
      if (!projectId && studio.product) {
        const proj = await createProject(
          studio.product.id,
          studio.model,
          studio.modelPreference,
          studio.scene,
          studio.style,
        );
        if (proj) {
          projectId = proj.id;
          setStudioProjectId(proj.id);
          upsertProject(proj);
        }
      }

      // 2. Call the generation API
      try {
        const res = await fetch("/api/studio/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: studio.product?.name,
            productDescription: studio.product?.description,
            model: studio.model,
            modelPreference: studio.modelPreference,
            pose: studio.pose,
            scene: studio.scene,
            lighting: studio.lighting,
            style: studio.style,
            count: settings.generationCount,
          }),
        });
        if (cancelled) return;
        const data = await res.json();
        if (!res.ok || !data.images || data.images.length === 0) {
          throw new Error(data.error ?? "Generation failed");
        }
        if (cancelled) return;
        setStep(GENERATION_STEPS.length - 1);
        const images: GeneratedImage[] = data.images.map(
          (url: string, i: number) => ({
            id: `img-${Date.now()}-${i}`,
            url,
            selected: false,
            favorite: false,
            prompt: data.prompts?.[i] ?? "",
          }),
        );
        addGeneration(images);

        // 3. Persist the generation to the project
        if (projectId) {
          await addGenerationToProject(projectId, {
            prompt: data.prompts?.[0] ?? "",
            model: studio.model,
            scene: studio.scene,
            style: studio.style,
            images: data.images,
          });
        }

        setStudioStatus("ready");
        setTimeout(() => {
          if (!cancelled) navigate("results");
        }, 700);
      } catch (e) {
        if (cancelled) return;
        console.error("Generation failed", e);
        setStudioStatus("failed");
        // Mark project as failed in DB
        if (projectId) {
          await patchProject(projectId, { status: "failed" }).catch(() => {});
        }
        pushToast({
          title: "We couldn't create your images.",
          description: "Your settings are safe. Try again.",
          variant: "destructive",
        });
        setTimeout(() => {
          if (!cancelled) navigate("studio-summary");
        }, 1100);
      }
    };

    run();

    return () => {
      cancelled = true;
      stepTimers.forEach((t) => clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen noPadding noMaxWidth>
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-foreground text-background px-8 py-12">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-background/20 blur-2xl animate-pulse" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-background/10 backdrop-blur-sm border border-background/20">
            <Sparkles className="h-10 w-10" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="font-display text-[28px] text-center leading-tight">
          Creating your
          <br />
          studio&hellip;
        </h1>

        <div className="mt-10 w-full max-w-xs space-y-4" aria-live="polite">
          {GENERATION_STEPS.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-3 transition-all duration-300",
                  i > step && "opacity-40",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border transition-all",
                    done && "bg-background text-foreground border-background",
                    current && "bg-background/10 text-background border-background/40",
                    !done && !current && "border-background/20 text-background/40",
                  )}
                >
                  {done ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : current ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-background animate-pulse" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-background/40" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[15px] tracking-wide transition",
                    current && "text-background",
                    done && "text-background/80",
                    !done && !current && "text-background/40",
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {step >= GENERATION_STEPS.length - 1 && (
          <p className="mt-10 text-[13px] text-background/60 uppercase tracking-[0.18em] animate-pulse">
            Almost there
          </p>
        )}
      </div>
    </Screen>
  );
}
