// ── Image Description Port ──────────────────────────────────────
// Defines the interface for AI text generation (product descriptions).
// Implementations: ZAIImageDescriptionAdapter, (future: Gemini, OpenAI, etc.)

import type {
  DescriptionRequest,
  DescriptionResult,
} from "../entities";

export interface ImageDescriptionPort {
  /**
   * Generate a product description from the given parameters.
   * @param request - Product name, category, price, scene, style
   * @returns The generated description text
   */
  describe(request: DescriptionRequest): Promise<DescriptionResult>;

  /** Provider identifier */
  readonly providerId: string;

  /** Human-readable provider name */
  readonly displayName: string;

  /** Whether this provider is currently available/configured */
  isAvailable(): boolean;
}
