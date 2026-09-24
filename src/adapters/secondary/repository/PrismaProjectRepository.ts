// ── Prisma Project Repository Adapter ─────────────────────────
// Implements ProjectRepositoryPort using Prisma ORM.

import { db } from "@/lib/db";
import type { ProjectRepositoryPort } from "@/domain/ports";
import type { StudioProjectEntity, GenerationEntity } from "@/domain/entities";

function parseImages(imagesStr: string): string[] {
  try {
    return JSON.parse(imagesStr || "[]");
  } catch {
    return [];
  }
}

function toProjectEntity(p: any): StudioProjectEntity {
  return {
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
    generations: (p.generations || []).map((g: any): GenerationEntity => ({
      ...g,
      images: parseImages(g.images),
      createdAt: new Date(g.createdAt),
    })),
  };
}

export class PrismaProjectRepository implements ProjectRepositoryPort {
  async findAll(): Promise<StudioProjectEntity[]> {
    const projects = await db.studioProject.findMany({
      orderBy: { updatedAt: "desc" },
      include: { product: true, generations: true },
    });
    return projects.map((p) => ({
      ...toProjectEntity(p),
      product: {
        ...p.product,
        images: parseImages(p.product.images),
      },
    })) as StudioProjectEntity[];
  }

  async findById(id: string): Promise<StudioProjectEntity | null> {
    const project = await db.studioProject.findUnique({
      where: { id },
      include: { product: true, generations: true },
    });
    if (!project) return null;
    return {
      ...toProjectEntity(project),
      product: {
        ...project.product,
        images: parseImages(project.product.images),
      },
    } as StudioProjectEntity;
  }

  async create(data: Omit<StudioProjectEntity, "id" | "createdAt" | "updatedAt" | "generations">): Promise<StudioProjectEntity> {
    const project = await db.studioProject.create({
      data: {
        productId: data.productId,
        model: data.model,
        modelPreference: data.modelPreference,
        scene: data.scene,
        style: data.style,
        status: data.status,
      },
      include: { product: true, generations: true },
    });
    return {
      ...toProjectEntity(project),
      product: {
        ...project.product,
        images: parseImages(project.product.images),
      },
    } as StudioProjectEntity;
  }

  async update(id: string, data: Partial<Omit<StudioProjectEntity, "id" | "createdAt" | "updatedAt" | "generations">>): Promise<StudioProjectEntity> {
    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) update[key] = value;
    }
    const project = await db.studioProject.update({
      where: { id },
      data: update,
      include: { product: true, generations: true },
    });
    return {
      ...toProjectEntity(project),
      product: {
        ...project.product,
        images: parseImages(project.product.images),
      },
    } as StudioProjectEntity;
  }

  async delete(id: string): Promise<void> {
    await db.studioProject.delete({ where: { id } });
  }

  async addGeneration(projectId: string, data: Omit<GenerationEntity, "id" | "createdAt">): Promise<GenerationEntity> {
    const generation = await db.generation.create({
      data: {
        projectId,
        prompt: data.prompt,
        model: data.model,
        scene: data.scene,
        style: data.style,
        status: data.status,
        images: JSON.stringify(data.images),
      },
    });
    await db.studioProject.update({
      where: { id: projectId },
      data: { status: "ready" },
    });
    return {
      ...generation,
      images: parseImages(generation.images),
      createdAt: new Date(generation.createdAt),
    };
  }
}
