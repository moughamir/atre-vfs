import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Accepts a base64 image (data URL or raw), saves to /public/products, returns URL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dataUrl, name } = body as { dataUrl?: string; name?: string };

    if (!dataUrl) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 },
      );
    }

    // Strip data URL prefix if present
    const matches = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = "png";

    if (matches) {
      const mime = matches[1];
      ext = mime.split("/")[1].replace("jpeg", "jpg").replace("svg+xml", "svg");
      buffer = Buffer.from(matches[2], "base64");
    } else {
      // raw base64
      buffer = Buffer.from(dataUrl, "base64");
    }

    const hash = crypto.randomBytes(8).toString("hex");
    const safeName = name
      ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20)
      : "img";
    const filename = `${safeName}-${Date.now()}-${hash}.${ext}`;
    const outDir = path.join(process.cwd(), "public", "products");
    await fs.mkdir(outDir, { recursive: true });
    const fullPath = path.join(outDir, filename);
    await fs.writeFile(fullPath, buffer);

    return NextResponse.json({ url: `/products/${filename}` });
  } catch (e) {
    console.error("Upload error", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
