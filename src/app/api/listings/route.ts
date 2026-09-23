import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const listings = await db.listing.findMany({
      orderBy: { createdAt: "desc" },
    });
    const parsed = listings.map((l) => ({
      ...l,
      images: JSON.parse(l.images || "[]") as string[],
    }));
    return NextResponse.json({ listings: parsed });
  } catch (e) {
    console.error("GET /api/listings error", e);
    return NextResponse.json({ listings: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, projectId, name, price, description, mainImage, images } = body;

    if (!productId || !name || !mainImage) {
      return NextResponse.json(
        { error: "productId, name and mainImage are required" },
        { status: 400 },
      );
    }

    const listing = await db.listing.create({
      data: {
        productId,
        projectId: projectId ?? null,
        name,
        price: Number(price) || 0,
        currency: "EUR",
        description: description ?? null,
        mainImage,
        images: JSON.stringify(images ?? [mainImage]),
        status: "published",
      },
    });

    // mark product as published
    await db.product.update({
      where: { id: productId },
      data: { status: "published" },
    });

    return NextResponse.json({
      listing: {
        ...listing,
        images: JSON.parse(listing.images || "[]") as string[],
      },
    });
  } catch (e) {
    console.error("POST /api/listings error", e);
    return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
  }
}
