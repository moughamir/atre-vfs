// ── Domain Entities ─────────────────────────────────────────────
// Pure TypeScript entities with no external dependencies.
// These represent the core business concepts of Atré Virtual Studio.

export interface ProductEntity {
  id: string;
  name: string;
  category: string;
  color: string | null;
  sizeRange: string | null;
  price: number;
  currency: string;
  description: string | null;
  images: string[];
  status: "draft" | "ready" | "published" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationEntity {
  id: string;
  projectId: string;
  prompt: string;
  model: string;
  scene: string;
  style: string;
  status: "pending" | "completed" | "failed";
  images: string[];
  createdAt: Date;
}

export interface StudioProjectEntity {
  id: string;
  productId: string;
  model: string;
  modelPreference: string | null;
  pose: string;
  scene: string;
  lighting: string;
  cameraAngle: string;
  style: string;
  status: "configuring" | "generating" | "ready" | "publishing" | "published" | "failed";
  createdAt: Date;
  updatedAt: Date;
  generations: GenerationEntity[];
}

export interface ListingEntity {
  id: string;
  productId: string;
  projectId: string | null;
  name: string;
  price: number;
  currency: string;
  description: string | null;
  mainImage: string;
  images: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FavoriteEntity {
  id: string;
  url: string;
  productName: string;
  createdAt: string;
}

// ── Generation Request / Response value objects ────────────────

export interface GenerationRequest {
  productName: string;
  productDescription?: string;
  model: string;
  modelPreference?: string | null;
  pose?: string;
  scene: string;
  lighting?: string;
  cameraAngle?: string;
  style: string;
  count: number;
}

export interface GenerationResult {
  images: string[];
  prompts: string[];
  provider: string;
}

export interface DescriptionRequest {
  productName: string;
  category?: string;
  price?: number;
  scene?: string;
  style?: string;
}

export interface DescriptionResult {
  description: string;
  provider: string;
}

export interface VariationRequest {
  productName?: string;
  model?: string;
  scene?: string;
  style?: string;
  count: number;
}

export interface VariationResult {
  images: string[];
  prompts: string[];
  provider: string;
}

// ── File storage value objects ─────────────────────────────────

export interface FileStorageRequest {
  buffer: Buffer;
  directory: string;
  filename: string;
}

export interface FileStorageResult {
  url: string;
  path: string;
}
