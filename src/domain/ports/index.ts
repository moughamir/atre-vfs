// ── Port barrel exports ─────────────────────────────────────────
// Import ports from here:
//   import { ImageGenerationPort, ProductRepositoryPort } from "@/domain/ports";

export { ImageGenerationPort } from "./ImageGenerationPort";
export { ImageDescriptionPort } from "./ImageDescriptionPort";
export { ImageVariationPort } from "./ImageVariationPort";
export { FileStoragePort } from "./FileStoragePort";
export {
  ProductRepositoryPort,
  ProjectRepositoryPort,
  ListingRepositoryPort,
  FavoritesRepositoryPort,
} from "./RepositoryPorts";
