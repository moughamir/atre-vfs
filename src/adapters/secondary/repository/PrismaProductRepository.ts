// ── Prisma Product Repository Adapter ──────────────────────────
// Implements ProductRepositoryPort using Prisma ORM.

import { db } from "@/lib/db";
import type { ProductRepositoryPort } from "@/domain/ports";
import type { ProductEntity } from "@/domain/entities";

function parseImages(imagesStr: string): string[] {
  try {
    return JSON.parse(imagesStr || "[]");
  } catch {
    return [];
  }
}

function toEntity(p: any): ProductEntity {
  return {
    ...p,
    images: parseImages(p.images),
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  };
}

export class PrismaProductRepository implements ProductRepositoryPort {
  async findAll(): Promise<ProductEntity[]> {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return products.map(toEntity);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await db.product.findUnique({ where: { id } });
    return product ? toEntity(product) : null;
  }

  async create(data: Omit<ProductEntity, "id" | "createdAt" | "updatedAt">): Promise<ProductEntity> {
    const product = await db.product.create({
      data: {
        ...data,
        images: JSON.stringify(data.images),
      },
    });
    return toEntity(product);
  }

  async update(id: string, data: Partial<Omit<ProductEntity, "id" | "createdAt" | "updatedAt">>): Promise<ProductEntity> {
    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === "images") {
        update[key] = JSON.stringify(value);
      } else if (value !== undefined) {
        update[key] = key === "price" ? Number(value) : value;
      }
    }
    const product = await db.product.update({ where: { id }, data: update });
    return toEntity(product);
  }

  async delete(id: string): Promise<void> {
    await db.product.delete({ where: { id } });
  }
}
