// ── Prisma Listing Repository Adapter ─────────────────────────
// Implements ListingRepositoryPort using Prisma ORM.

import { db } from "@/lib/db";
import type { ListingRepositoryPort } from "@/domain/ports";
import type { ListingEntity } from "@/domain/entities";

function parseImages(imagesStr: string): string[] {
  try {
    return JSON.parse(imagesStr || "[]");
  } catch {
    return [];
  }
}

function toEntity(l: any): ListingEntity {
  return {
    ...l,
    images: parseImages(l.images),
    createdAt: new Date(l.createdAt),
    updatedAt: new Date(l.updatedAt),
  };
}

export class PrismaListingRepository implements ListingRepositoryPort {
  async findAll(): Promise<ListingEntity[]> {
    const listings = await db.listing.findMany({
      orderBy: { createdAt: "desc" },
    });
    return listings.map(toEntity);
  }

  async findById(id: string): Promise<ListingEntity | null> {
    const listing = await db.listing.findUnique({ where: { id } });
    return listing ? toEntity(listing) : null;
  }

  async create(data: Omit<ListingEntity, "id" | "createdAt" | "updatedAt">): Promise<ListingEntity> {
    const listing = await db.listing.create({
      data: {
        ...data,
        images: JSON.stringify(data.images),
      },
    });
    return toEntity(listing);
  }

  async delete(id: string): Promise<void> {
    await db.listing.delete({ where: { id } });
  }
}
