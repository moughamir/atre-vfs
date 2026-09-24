// ── Variations Service ──────────────────────────────────────────
// Domain service for generating image variations.

import { getImageVariationAdapter } from "@/adapters/registry";
import type { VariationRequest, VariationResult } from "@/domain/entities";

export class VariationsService {
  async createVariations(request: VariationRequest): Promise<VariationResult> {
    const adapter = getImageVariationAdapter();
    return adapter.createVariations(request);
  }
}
