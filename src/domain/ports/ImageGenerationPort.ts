// ── Image Generation Port ───────────────────────────────────────
// Defines the interface for AI image generation providers.
// Implementations: ZAIImageGenerationAdapter, (future: Gemini, Fal.AI, Fashn)

import type {
  GenerationRequest,
  GenerationResult,
} from "../entities";

export interface ImageGenerationPort {
  /**
   * Generate fashion images based on the creative request.
   * @param request - The generation parameters (product, model, scene, style, etc.)
   * @returns Array of image URLs and the prompts used
   */
  generate(request: GenerationRequest): Promise<GenerationResult>;

  /** Provider identifier (e.g. "zai", "gemini", "fal-ai", "fashn") */
  readonly providerId: string;

  /** Human-readable provider name */
  readonly displayName: string;

  /** Whether this provider is currently available/configured */
  isAvailable(): boolean;
}
