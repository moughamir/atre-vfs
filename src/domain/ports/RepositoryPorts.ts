// ── Repository Ports ────────────────────────────────────────────
// Define persistence interfaces for each domain entity.
// Implementations use Prisma (current) but could be swapped for
// PostgreSQL, MongoDB, Supabase, etc.

import type {
  ProductEntity,
  StudioProjectEntity,
  GenerationEntity,
  ListingEntity,
  FavoriteEntity,
} from "../entities";

// ── Product Repository ──────────────────────────────────────────
export interface ProductRepositoryPort {
  findAll(): Promise<ProductEntity[]>;
  findById(id: string): Promise<ProductEntity | null>;
  create(data: Omit<ProductEntity, "id" | "createdAt" | "updatedAt">): Promise<ProductEntity>;
  update(id: string, data: Partial<Omit<ProductEntity, "id" | "createdAt" | "updatedAt">>): Promise<ProductEntity>;
  delete(id: string): Promise<void>;
}

// ── Studio Project Repository ───────────────────────────────────
export interface ProjectRepositoryPort {
  findAll(): Promise<StudioProjectEntity[]>;
  findById(id: string): Promise<StudioProjectEntity | null>;
  create(data: Omit<StudioProjectEntity, "id" | "createdAt" | "updatedAt" | "generations">): Promise<StudioProjectEntity>;
  update(id: string, data: Partial<Omit<StudioProjectEntity, "id" | "createdAt" | "updatedAt" | "generations">>): Promise<StudioProjectEntity>;
  delete(id: string): Promise<void>;
  addGeneration(projectId: string, data: Omit<GenerationEntity, "id" | "createdAt">): Promise<GenerationEntity>;
}

// ── Listing Repository ──────────────────────────────────────────
export interface ListingRepositoryPort {
  findAll(): Promise<ListingEntity[]>;
  findById(id: string): Promise<ListingEntity | null>;
  create(data: Omit<ListingEntity, "id" | "createdAt" | "updatedAt">): Promise<ListingEntity>;
  delete(id: string): Promise<void>;
}

// ── Favorites Repository ────────────────────────────────────────
export interface FavoritesRepositoryPort {
  findAll(): Promise<FavoriteEntity[]>;
  add(favorite: Omit<FavoriteEntity, "id" | "createdAt">): Promise<FavoriteEntity>;
  remove(url: string): Promise<void>;
}
