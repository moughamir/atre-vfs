import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const SEED_PRODUCTS = [
  {
    name: "White Linen Shirt",
    category: "Shirts",
    color: "White",
    sizeRange: "S — XL",
    price: 49,
    description: "Lightweight linen shirt with a relaxed fit.",
    images: [
      "/products/seed-white-linen-shirt.jpg",
    ],
  },
  {
    name: "Summer Linen Dress",
    category: "Dresses",
    color: "Sand",
    sizeRange: "XS — L",
    price: 79,
    description: "Breezy linen dress for warm afternoons.",
    images: [
      "/products/seed-linen-dress.jpg",
    ],
  },
  {
    name: "Tailored Wool Coat",
    category: "Outerwear",
    color: "Camel",
    sizeRange: "S — L",
    price: 189,
    description: "Structured wool coat with refined shoulders.",
    images: [
      "/products/seed-wool-coat.jpg",
    ],
  },
  {
    name: "Cashmere Knit Sweater",
    category: "Knitwear",
    color: "Ecru",
    sizeRange: "XS — XL",
    price: 129,
    description: "Soft cashmere knit with a clean silhouette.",
    images: [
      "/products/seed-knit-sweater.jpg",
    ],
  },
];

export async function POST() {
  try {
    // Count existing
    const count = await db.product.count();
    if (count > 0) {
      return NextResponse.json({ seeded: false, message: "Already seeded" });
    }

    for (const p of SEED_PRODUCTS) {
      await db.product.create({
        data: {
          ...p,
          currency: "EUR",
          images: JSON.stringify(p.images),
          status: "ready",
        },
      });
    }

    return NextResponse.json({ seeded: true, count: SEED_PRODUCTS.length });
  } catch (e) {
    console.error("Seed error", e);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
