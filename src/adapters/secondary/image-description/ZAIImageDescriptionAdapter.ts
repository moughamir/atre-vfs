// ── ZAI Image Description Adapter ──────────────────────────────
// Implements ImageDescriptionPort using the z-ai-web-dev-sdk for
// LLM-based product description generation.

import ZAI from "z-ai-web-dev-sdk";
import type { ImageDescriptionPort } from "@/domain/ports";
import type {
  DescriptionRequest,
  DescriptionResult,
} from "@/domain/entities";

export class ZAIImageDescriptionAdapter implements ImageDescriptionPort {
  readonly providerId = "zai";
  readonly displayName = "Z.AI (GLM)";

  isAvailable(): boolean {
    return true;
  }

  async describe(request: DescriptionRequest): Promise<DescriptionResult> {
    const zai = await ZAI.create();

    const styleVibe =
      request.style === "luxury"
        ? "luxurious, premium, sophisticated"
        : request.style === "editorial"
          ? "editorial, refined, magazine-grade"
          : request.style === "summer"
            ? "warm, breezy, effortless"
            : request.style === "urban"
              ? "modern, urban, contemporary"
              : request.style === "minimal"
                ? "minimal, quiet, refined"
                : "clean, fresh, modern";

    const sceneContext =
      request.scene === "street"
        ? "an urban streetwear setting"
        : request.scene === "lifestyle"
          ? "a lifestyle, real-world setting"
          : request.scene === "editorial"
            ? "a high-fashion editorial setting"
            : "a clean studio setting";

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are an expert fashion copywriter. Write short, premium product descriptions for an online fashion boutique. Keep it under 60 words. No bullet points. No markdown. Just two or three elegant sentences. Focus on fabric, fit, mood and occasion. Do not include the price or product name. Do not use emojis.",
        },
        {
          role: "user",
          content: `Write a product description for "${request.productName}"${
            request.category ? `, a ${request.category.toLowerCase()}` : ""
          }. The photoshoot uses a ${styleVibe} style in ${sceneContext}. Price is ${
            request.price ? `€${Math.round(request.price)}` : "a premium"
          }.`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const description = completion.choices?.[0]?.message?.content?.trim() ?? "";
    return { description, provider: this.providerId };
  }
}
