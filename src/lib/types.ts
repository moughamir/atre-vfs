// Core domain types for Virtual Studio

export type TabId = "home" | "products" | "studio" | "shop" | "more";

export type ScreenId =
  | "home"
  | "products"
  | "product-detail"
  | "add-product"
  | "edit-product"
  | "studio-product"
  | "studio-model"
  | "studio-scene"
  | "studio-style"
  | "studio-summary"
  | "generating"
  | "results"
  | "image-detail"
  | "edit-image"
  | "publish"
  | "shop"
  | "shop-detail"
  | "more"
  | "success";

export type ModelOption = "none" | "woman" | "man" | "custom";
export type ModelPreference = "natural" | "elegant" | "editorial";
export type SceneOption = "studio" | "street" | "lifestyle" | "editorial";
export type StyleOption =
  | "clean"
  | "luxury"
  | "summer"
  | "editorial"
  | "urban"
  | "minimal";

export type ProjectStatus =
  | "configuring"
  | "generating"
  | "ready"
  | "publishing"
  | "published"
  | "failed";

export type ProductStatus = "draft" | "ready" | "published" | "archived";

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  color?: string | null;
  sizeRange?: string | null;
  price: number;
  currency: string;
  description?: string | null;
  images: string[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  selected: boolean;
  favorite: boolean;
  prompt: string;
}

export interface StudioProjectState {
  id?: string;
  product?: Product;
  model: ModelOption;
  modelPreference?: ModelPreference;
  scene: SceneOption;
  style: StyleOption;
  status: ProjectStatus;
  currentGeneration: GeneratedImage[];
  allGenerations: GeneratedImage[][];
  selectedStep: number; // 0..3
}

export interface Listing {
  id: string;
  productId: string;
  productName: string;
  price: number;
  currency: string;
  description?: string | null;
  mainImage: string;
  images: string[];
  status: string;
  createdAt: string;
}
