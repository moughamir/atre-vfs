// ── Listing Service ────────────────────────────────────────────
// Domain service for shop listing management.

import { getListingRepository, getProductRepository } from "@/adapters/registry";
import type { ListingEntity } from "@/domain/entities";

export class ListingService {
  async getAll(): Promise<ListingEntity[]> {
    return getListingRepository().findAll();
  }

  async getById(id: string): Promise<ListingEntity | null> {
    return getListingRepository().findById(id);
  }

  async create(data: Omit<ListingEntity, "id" | "createdAt" | "updatedAt">): Promise<ListingEntity> {
    const listing = await getListingRepository().create(data);
    // Mark product as published
    await getProductRepository().update(data.productId, { status: "published" });
    return listing;
  }

  async delete(id: string): Promise<void> {
    return getListingRepository().delete(id);
  }
}
