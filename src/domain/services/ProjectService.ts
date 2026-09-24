// ── Project Service ────────────────────────────────────────────
// Domain service for studio project management.

import { getProjectRepository } from "@/adapters/registry";
import type { StudioProjectEntity, GenerationEntity } from "@/domain/entities";

export class ProjectService {
  async getAll(): Promise<StudioProjectEntity[]> {
    return getProjectRepository().findAll();
  }

  async getById(id: string): Promise<StudioProjectEntity | null> {
    return getProjectRepository().findById(id);
  }

  async create(data: Omit<StudioProjectEntity, "id" | "createdAt" | "updatedAt" | "generations">): Promise<StudioProjectEntity> {
    return getProjectRepository().create(data);
  }

  async update(id: string, data: Partial<Omit<StudioProjectEntity, "id" | "createdAt" | "updatedAt" | "generations">>): Promise<StudioProjectEntity> {
    return getProjectRepository().update(id, data);
  }

  async delete(id: string): Promise<void> {
    return getProjectRepository().delete(id);
  }

  async addGeneration(projectId: string, data: Omit<GenerationEntity, "id" | "createdAt">): Promise<GenerationEntity> {
    return getProjectRepository().addGeneration(projectId, data);
  }
}
