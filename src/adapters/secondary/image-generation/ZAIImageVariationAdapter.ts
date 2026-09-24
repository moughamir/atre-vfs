// ── ZAI Image Variation Adapter ────────────────────────────────
// Implements ImageVariationPort using the z-ai-web-dev-sdk.
// Generates variations by tweaking the prompt for subtle differences.

import ZAI from "z-ai-web-dev-sdk";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { ImageVariationPort } from "@/domain/ports";
import type {
  VariationRequest,
  VariationResult,
} from "@/domain/entities";

export class ZAIImageVariationAdapter implements ImageVariationPort {
  readonly providerId = "zai";
  readonly displayName = "Z.AI (GLM)";
  private outDir: string;

  constructor(outDir?: string) {
    this.outDir = outDir ?? path.join(process.cwd(), "public", "generated");
  }

  isAvailable(): boolean {
    return true;
  }

  async createVariations(request: VariationRequest): Promise<VariationResult> {
    const zai = await ZAI.create();
    const count = Math.max(1, Math.min(4, request.count));

    const prompts = Array.from({ length: count }, (_, i) =>
      this.buildVariationPrompt(request, i),
    );

    const results: string[] = [];
    for (let i = 0; i < prompts.length; i += 2) {
      const batch = prompts.slice(i, i + 2);
      const settled = await Promise.all(
        batch.map((p, j) => this.generateOne(zai, p, i + j)),
      );
      results.push(...settled.filter((r): r is string => r !== null));
    }

    if (results.length === 0) {
      throw new Error("We couldn't create variations. Please try again.");
    }

    return { images: results, prompts, provider: this.providerId };
  }

  private buildVariationPrompt(b: VariationRequest, variant: number): string {
    const product = b.productName?.trim()
      ? b.productName
      : "the featured fashion product";

    const angles = [
      "subtly different composition, same mood",
      "slightly different pose and angle",
      "alternative framing, closer detail",
      "different lighting emphasis, same setting",
    ];
    const angle = angles[variant % angles.length];

    return [
      `High-end fashion editorial photograph of ${product}`,
      `variation: ${angle}`,
      "preserving the exact identity, color, shape, fabric and details of the product",
      "sharp focus on the garment, professional studio lighting, premium magazine quality, photorealistic, 4k",
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
        size: "768x1344",
      });
      const b64 = response.data?.[0]?.base64;
      if (!b64) return null;

      const buffer = Buffer.from(b64, "base64");
      const hash = crypto.randomBytes(6).toString("hex");
      const filename = `var-${Date.now()}-${index}-${hash}.png`;
      await fs.mkdir(this.outDir, { recursive: true });
      await fs.writeFile(path.join(this.outDir, filename), buffer);
      return `/generated/${filename}`;
    } catch (e) {
      console.error(`ZAI variation[${index}] error`, e);
      return null;
    }
  }
}
