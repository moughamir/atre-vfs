import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Favorites are stored as a simple JSON file in /public/favorites.json for MVP simplicity.
// This avoids schema changes and lets us persist favorites across sessions.
import fs from "fs/promises";
import path from "path";

const FAV_FILE = path.join(process.cwd(), "public", "favorites.json");

async function readFavs(): Promise<
  Array<{ id: string; url: string; productName: string; createdAt: string }>
> {
  try {
    const data = await fs.readFile(FAV_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeFavs(
  favs: Array<{ id: string; url: string; productName: string; createdAt: string }>,
) {
  await fs.mkdir(path.dirname(FAV_FILE), { recursive: true });
  await fs.writeFile(FAV_FILE, JSON.stringify(favs, null, 2));
}

export async function GET() {
  const favs = await readFavs();
  return NextResponse.json({ favorites: favs });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    url: string;
    productName: string;
    remove?: boolean;
  };
  const favs = await readFavs();
  const id = `${body.url}-${Date.now()}`;

  if (body.remove) {
    const filtered = favs.filter((f) => f.url !== body.url);
    await writeFavs(filtered);
    return NextResponse.json({ favorites: filtered });
  }

  if (favs.some((f) => f.url === body.url)) {
    return NextResponse.json({ favorites: favs });
  }

  const newFav = {
    id,
    url: body.url,
    productName: body.productName ?? "Untitled",
    createdAt: new Date().toISOString(),
  };
  const updated = [newFav, ...favs];
  await writeFavs(updated);
  return NextResponse.json({ favorites: updated });
}
