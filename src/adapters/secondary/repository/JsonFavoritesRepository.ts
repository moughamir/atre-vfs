// ── JSON Favorites Repository Adapter ─────────────────────────
// Implements FavoritesRepositoryPort using a JSON file.
// This is the MVP implementation; can be swapped for a DB adapter.

import fs from "fs/promises";
import path from "path";
import type { FavoritesRepositoryPort } from "@/domain/ports";
import type { FavoriteEntity } from "@/domain/entities";

const FAV_FILE = path.join(process.cwd(), "public", "favorites.json");

type FavRecord = {
  id: string;
  url: string;
  productName: string;
  createdAt: string;
};

export class JsonFavoritesRepository implements FavoritesRepositoryPort {
  private async read(): Promise<FavRecord[]> {
    try {
      const data = await fs.readFile(FAV_FILE, "utf8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async write(records: FavRecord[]): Promise<void> {
    await fs.mkdir(path.dirname(FAV_FILE), { recursive: true });
    await fs.writeFile(FAV_FILE, JSON.stringify(records, null, 2));
  }

  async findAll(): Promise<FavoriteEntity[]> {
    return this.read();
  }

  async add(favorite: Omit<FavoriteEntity, "id" | "createdAt">): Promise<FavoriteEntity> {
    const records = await this.read();
    if (records.some((r) => r.url === favorite.url)) {
      return records.find((r) => r.url === favorite.url)!;
    }
    const newFav: FavRecord = {
      id: `${favorite.url}-${Date.now()}`,
      url: favorite.url,
      productName: favorite.productName,
      createdAt: new Date().toISOString(),
    };
    await this.write([newFav, ...records]);
    return newFav;
  }

  async remove(url: string): Promise<void> {
    const records = await this.read();
    const filtered = records.filter((r) => r.url !== url);
    await this.write(filtered);
  }
}
