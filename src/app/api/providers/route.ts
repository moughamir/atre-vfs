import { NextResponse } from "next/server";
import {
  getAvailableImageProviders,
  getActiveImageProviderId,
} from "@/adapters/registry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({
      providers: getAvailableImageProviders(),
      active: getActiveImageProviderId(),
    });
  } catch (e) {
    console.error("GET /api/providers error", e);
    return NextResponse.json({ providers: [], active: "zai" });
  }
}
