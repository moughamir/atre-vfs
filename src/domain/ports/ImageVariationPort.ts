// ── Image Variation Port ─────────────────────────────────────────
// Defines the interface for generating image variations.
// Some providers may support this natively (e.g. DALL-E variations),
// others may just re-generate with tweaked prompts.

import type {
  VariationRequest,
  VariationResult,
} from "../entities";

export interface ImageVariationPort {
  /**
   * Generate variation images based on a source image's parameters.
   * @param request - Product name, model, scene, style, count
   * @returns Array of variation image URLs
   */
  createVariations(request: VariationRequest): Promise<VariationResult>;

  /** Provider identifier */
  readonly providerId: string;

  /** Human-readable provider name */
  readonly displayName: string;

  /** Whether this provider is currently available/configured */
  isAvailable(): boolean;
}
