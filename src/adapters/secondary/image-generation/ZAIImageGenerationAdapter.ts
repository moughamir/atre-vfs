// ── ZAI Image Generation Adapter ────────────────────────────────
// Implements ImageGenerationPort using the z-ai-web-dev-sdk.
// This is the default provider; others (Gemini, Fal.AI, Fashn) can
// be added by implementing the same interface.

import ZAI from "z-ai-web-dev-sdk";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { ImageGenerationPort } from "@/domain/ports";
import type {
  GenerationRequest,
  GenerationResult,
} from "@/domain/entities";
import {
  MODEL_PRESETS,
  POSE_PRESETS,
  LIGHTING_PRESETS,
  CAMERA_ANGLE_PRESETS,
  SCENE_PRESETS,
  STYLE_PRESETS,
} from "@/lib/presets";

export class ZAIImageGenerationAdapter implements ImageGenerationPort {
  readonly providerId = "zai";
  readonly displayName = "Z.AI (GLM)";
  private outDir: string;

  constructor(outDir?: string) {
    this.outDir = outDir ?? path.join(process.cwd(), "public", "generated");
  }

  isAvailable(): boolean {
    return true; // ZAI SDK is always available in this environment
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const zai = await ZAI.create();
    const count = Math.max(1, Math.min(4, request.count));

    // Build prompts for each variation
    const prompts = Array.from({ length: count }, (_, i) =>
      this.buildPrompt(request, i),
    );

    // Generate in parallel batches of 2
    const results: string[] = [];
    for (let i = 0; i < prompts.length; i += 2) {
      const batch = prompts.slice(i, i + 2);
      const settled = await Promise.all(
        batch.map((p, j) => this.generateOne(zai, p, i + j)),
      );
      results.push(...settled.filter((r): r is string => r !== null));
    }

    if (results.length === 0) {
      throw new Error("We couldn't create your images. Please try again.");
    }

    return { images: results, prompts, provider: this.providerId };
  }

  private buildPrompt(b: GenerationRequest, variant: number): string {
    const scene = SCENE_PRESETS.find((s) => s.id === b.scene);
    const style = STYLE_PRESETS.find((s) => s.id === b.style);
    const pose = POSE_PRESETS.find((p) => p.id === b.pose) ?? POSE_PRESETS[0];
    const lighting = LIGHTING_PRESETS.find((l) => l.id === b.lighting) ?? LIGHTING_PRESETS[0];
    const cameraAngle = CAMERA_ANGLE_PRESETS.find((a) => a.id === b.cameraAngle) ?? CAMERA_ANGLE_PRESETS[0];

    const modelPart =
      b.model === "none"
        ? "presented on an invisible ghost mannequin, product only, no person"
        : b.model === "woman"
          ? "worn by an elegant female fashion model"
          : b.model === "man"
            ? "worn by an elegant male fashion model"
            : "worn by a fashion model";

    const prefPart = b.modelPreference ? `, ${b.modelPreference} mood` : "";

    const product =
      b.productName && b.productName.trim().length > 0
        ? b.productName
        : "the featured fashion product";

    const variations = [
      "subtly different framing",
      "slight pose variation",
      "alternative angle emphasis",
      "different moment captured",
    ];
    const variation = variations[variant % variations.length];

    return [
      `High-end fashion editorial photograph of ${product}`,
      b.productDescription ? `(${b.productDescription})` : "",
      modelPart + prefPart,
      pose?.promptHint,
      cameraAngle?.promptHint,
      `set in a ${scene?.label.toLowerCase() ?? "studio"} environment`,
      scene?.previewPrompt,
      style?.previewPrompt,
      lighting?.promptHint,
      variation,
      "preserving the exact identity, color, shape, fabric and details of the product",
      "sharp focus on the garment, premium magazine quality, photorealistic, 4k, depth of field",
      "no text, no watermark, no logos, no distorted anatomy",
    ]
      .filter(Boolean)
      .join(", ");
  }

  private async generateOne(
    zai: Awaited<ReturnType<typeof ZAI.create>>,
    prompt: string,
    index: number,
  ): Promise<string | null> {
    try {
      const response = await zai.images.generations.create({
        prompt,
        size: "768x1344", // portrait, fashion-friendly
      });
      const b64 = response.data?.[0]?.base64;
      if (!b64) return null;

      const buffer = Buffer.from(b64, "base64");
      const hash = crypto.randomBytes(6).toString("hex");
      const filename = `gen-${Date.now()}-${index}-${hash}.png`;
      await fs.mkdir(this.outDir, { recursive: true });
      await fs.writeFile(path.join(this.outDir, filename), buffer);
      return `/generated/${filename}`;
    } catch (e) {
      console.error(`ZAI generateOne[${index}] error`, e);
      return null;
    }
  }
}
