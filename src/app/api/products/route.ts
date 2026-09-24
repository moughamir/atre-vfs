import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    const parsed = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || "[]") as string[],
    }));
    return NextResponse.json({ products: parsed });
  } catch (e) {
    console.error("GET /api/products error", e);
    return NextResponse.json({ products: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, color, sizeRange, price, description, images } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, category, price" },
        { status: 400 },
      );
    }

    const product = await db.product.create({
      data: {
        name,
        category,
        color: color ?? null,
        sizeRange: sizeRange ?? null,
        price: Number(price) || 0,
        currency: "EUR",
        description: description ?? null,
        images: JSON.stringify(images ?? []),
        status: "ready",
      },
    });

    return NextResponse.json({
      product: {
        ...product,
        images: JSON.parse(product.images || "[]") as string[],
      },
    });
  } catch (e) {
    console.error("POST /api/products error", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
