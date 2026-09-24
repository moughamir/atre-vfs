import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      product: {
        ...product,
        images: JSON.parse(product.images || "[]") as string[],
      },
    });
  } catch (e) {
    console.error("GET /api/products/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const update: Record<string, unknown> = {};
    for (const key of ["name", "category", "color", "sizeRange", "price", "description", "status"]) {
      if (body[key] !== undefined) {
        update[key] = key === "price" ? Number(body[key]) : body[key];
      }
    }
    if (body.images !== undefined) update.images = JSON.stringify(body.images);

    const product = await db.product.update({ where: { id }, data: update });
    return NextResponse.json({
      product: {
        ...product,
        images: JSON.parse(product.images || "[]") as string[],
      },
    });
  } catch (e) {
    console.error("PATCH /api/products/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await db.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/products/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
