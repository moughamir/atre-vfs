// ── Product Service ─────────────────────────────────────────────
// Domain service for product management.

import { getProductRepository } from "@/adapters/registry";
import type { ProductEntity } from "@/domain/entities";

export class ProductService {
  async getAll(): Promise<ProductEntity[]> {
    return getProductRepository().findAll();
  }

  async getById(id: string): Promise<ProductEntity | null> {
    return getProductRepository().findById(id);
  }

  async create(data: Omit<ProductEntity, "id" | "createdAt" | "updatedAt">): Promise<ProductEntity> {
    return getProductRepository().create(data);
  }

  async update(id: string, data: Partial<Omit<ProductEntity, "id" | "createdAt" | "updatedAt">>): Promise<ProductEntity> {
    return getProductRepository().update(id, data);
  }

  async delete(id: string): Promise<void> {
    return getProductRepository().delete(id);
  }
}
