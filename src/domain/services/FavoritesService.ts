// ── Favorites Service ───────────────────────────────────────────
// Domain service for favorites management.

import { getFavoritesRepository } from "@/adapters/registry";
import type { FavoriteEntity } from "@/domain/entities";

export class FavoritesService {
  async getAll(): Promise<FavoriteEntity[]> {
    return getFavoritesRepository().findAll();
  }

  async add(url: string, productName: string): Promise<FavoriteEntity> {
    return getFavoritesRepository().add({ url, productName });
  }

  async remove(url: string): Promise<void> {
    return getFavoritesRepository().remove(url);
  }
}
