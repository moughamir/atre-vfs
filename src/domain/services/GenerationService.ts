// ── Generation Service ─────────────────────────────────────────
// Domain service that orchestrates image generation.
// Uses ports (not concrete adapters) so AI providers are swappable.

import {
  getImageGenerationAdapter,
  getProjectRepository,
  getFileStorage,
} from "@/adapters/registry";
import type {
  GenerationRequest,
  GenerationResult,
  StudioProjectEntity,
} from "@/domain/entities";

export class GenerationService {
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const adapter = getImageGenerationAdapter();
    return adapter.generate(request);
  }

  async generateAndPersist(
    request: GenerationRequest,
    projectId: string | null,
  ): Promise<{
    result: GenerationResult;
    project: StudioProjectEntity | null;
  }> {
    // 1. Create the project if it doesn't exist yet
    let project: StudioProjectEntity | null = null;
    if (!projectId && request) {
      // Project creation requires a productId — skip if not provided
      // (the API route handles project creation with the full product)
    } else if (projectId) {
      project = await getProjectRepository().findById(projectId);
    }

    // 2. Generate images
    const result = await this.generate(request);

    // 3. Persist the generation to the project
    if (projectId) {
      await getProjectRepository().addGeneration(projectId, {
        prompt: result.prompts[0] ?? "",
        model: request.model,
        scene: request.scene,
        style: request.style,
        status: "completed",
        images: result.images,
      });
    }

    return { result, project };
  }
}
