import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const listing = await db.listing.findUnique({ where: { id } });
    if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      listing: {
        ...listing,
        images: JSON.parse(listing.images || "[]") as string[],
      },
    });
  } catch (e) {
    console.error("GET /api/listings/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
