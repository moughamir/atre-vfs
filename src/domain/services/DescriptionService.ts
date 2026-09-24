// ── Description Service ────────────────────────────────────────
// Domain service for AI-generated product descriptions.

import { getImageDescriptionAdapter } from "@/adapters/registry";
import type { DescriptionRequest, DescriptionResult } from "@/domain/entities";

export class DescriptionService {
  async generate(request: DescriptionRequest): Promise<DescriptionResult> {
    const adapter = getImageDescriptionAdapter();
    try {
      return await adapter.describe(request);
    } catch {
      // Fallback description
      return {
        description: "A refined piece with a relaxed silhouette, designed for everyday wear.",
        provider: "fallback",
      };
    }
  }
}
