// ── Adapter Registry / Service Container ───────────────────────
// Central registry for all ports and their active adapters.
// This is the composition root — the only place where concrete
// adapters are instantiated and wired to ports.
//
// To add a new AI provider (e.g. Gemini, Fal.AI, Fashn):
//   1. Create a new adapter implementing the relevant port
//   2. Register it in the registry below
//   3. Switch the active adapter via env var or settings
//
// The rest of the app only depends on the ports, never on
// concrete adapters.

import { ImageGenerationPort } from "@/domain/ports";
import { ImageDescriptionPort } from "@/domain/ports";
import { ImageVariationPort } from "@/domain/ports";
import { ProductRepositoryPort } from "@/domain/ports";
import { ProjectRepositoryPort } from "@/domain/ports";
import { ListingRepositoryPort } from "@/domain/ports";
import { FavoritesRepositoryPort } from "@/domain/ports";
import { FileStoragePort } from "@/domain/ports";

// ── Adapters ───────────────────────────────────────────────────
import { ZAIImageGenerationAdapter } from "@/adapters/secondary/image-generation/ZAIImageGenerationAdapter";
import { ZAIImageDescriptionAdapter } from "@/adapters/secondary/image-description/ZAIImageDescriptionAdapter";
import { ZAIImageVariationAdapter } from "@/adapters/secondary/image-generation/ZAIImageVariationAdapter";
import { PrismaProductRepository } from "@/adapters/secondary/repository/PrismaProductRepository";
import { PrismaProjectRepository } from "@/adapters/secondary/repository/PrismaProjectRepository";
import { PrismaListingRepository } from "@/adapters/secondary/repository/PrismaListingRepository";
import { JsonFavoritesRepository } from "@/adapters/secondary/repository/JsonFavoritesRepository";
import { LocalFileStorageAdapter } from "@/adapters/secondary/storage/LocalFileStorageAdapter";

// ── Registry ───────────────────────────────────────────────────

// The active AI provider is selected via the IMAGE_GEN_PROVIDER env var.
// Default: "zai". Future: "gemini", "fal-ai", "fashn"
const ACTIVE_IMAGE_PROVIDER = process.env.IMAGE_GEN_PROVIDER ?? "zai";
const ACTIVE_DESC_PROVIDER = process.env.DESC_GEN_PROVIDER ?? "zai";

// ── Available Image Generation Adapters ────────────────────────
const imageGenerationAdapters: Record<string, ImageGenerationPort> = {
  zai: new ZAIImageGenerationAdapter(),
  // To add Gemini:
  //   gemini: new GeminiImageGenerationAdapter(),
  // To add Fal.AI:
  //   "fal-ai": new FalAIImageGenerationAdapter(),
  // To add Fashn:
  //   fashn: new FashnImageGenerationAdapter(),
};

// ── Available Description Adapters ─────────────────────────────
const imageDescriptionAdapters: Record<string, ImageDescriptionPort> = {
  zai: new ZAIImageDescriptionAdapter(),
  // gemini: new GeminiImageDescriptionAdapter(),
};

// ── Available Variation Adapters ───────────────────────────────
const imageVariationAdapters: Record<string, ImageVariationPort> = {
  zai: new ZAIImageVariationAdapter(),
};

// ── Repository Adapters (single-implementation) ────────────────
const productRepository: ProductRepositoryPort = new PrismaProductRepository();
const projectRepository: ProjectRepositoryPort = new PrismaProjectRepository();
const listingRepository: ListingRepositoryPort = new PrismaListingRepository();
const favoritesRepository: FavoritesRepositoryPort = new JsonFavoritesRepository();
const fileStorage: FileStoragePort = new LocalFileStorageAdapter();

// ── Public API ─────────────────────────────────────────────────
// Services and API routes import these functions to get the
// active adapter. They never import concrete adapters directly.

export function getImageGenerationAdapter(): ImageGenerationPort {
  const adapter = imageGenerationAdapters[ACTIVE_IMAGE_PROVIDER];
  if (!adapter) {
    console.warn(
      `Image generation provider "${ACTIVE_IMAGE_PROVIDER}" not found, falling back to "zai"`,
    );
    return imageGenerationAdapters.zai;
  }
  return adapter;
}

export function getImageDescriptionAdapter(): ImageDescriptionPort {
  const adapter = imageDescriptionAdapters[ACTIVE_DESC_PROVIDER];
  if (!adapter) {
    console.warn(
      `Description provider "${ACTIVE_DESC_PROVIDER}" not found, falling back to "zai"`,
    );
    return imageDescriptionAdapters.zai;
  }
  return adapter;
}

export function getImageVariationAdapter(): ImageVariationPort {
  const adapter = imageVariationAdapters[ACTIVE_IMAGE_PROVIDER];
  if (!adapter) {
    return imageVariationAdapters.zai;
  }
  return adapter;
}

export function getProductRepository(): ProductRepositoryPort {
  return productRepository;
}

export function getProjectRepository(): ProjectRepositoryPort {
  return projectRepository;
}

export function getListingRepository(): ListingRepositoryPort {
  return listingRepository;
}

export function getFavoritesRepository(): FavoritesRepositoryPort {
  return favoritesRepository;
}

export function getFileStorage(): FileStoragePort {
  return fileStorage;
}

// ── Provider info (for UI / settings) ──────────────────────────
export function getAvailableImageProviders() {
  return Object.entries(imageGenerationAdapters).map(([id, adapter]) => ({
    id,
    name: adapter.displayName,
    available: adapter.isAvailable(),
  }));
}

export function getActiveImageProviderId(): string {
  return ACTIVE_IMAGE_PROVIDER;
}
