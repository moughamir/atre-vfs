import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

interface VariationBody {
  imageUrl?: string;
  productName?: string;
  model?: string;
  scene?: string;
  style?: string;
  count?: number;
}

function buildVariationPrompt(b: VariationBody, variant: number): string {
  const product = b.productName && b.productName.trim().length > 0
    ? b.productName
    : "the featured fashion product";

  const angles = [
    "subtly different composition, same mood",
    "slightly different pose and angle",
    "alternative framing, closer detail",
    "different lighting emphasis, same setting",
  ];
  const angle = angles[variant % angles.length];

  return [
    `High-end fashion editorial photograph of ${product}`,
    `variation: ${angle}`,
    "preserving the exact identity, color, shape, fabric and details of the product",
    "sharp focus on the garment, professional studio lighting, premium magazine quality, photorealistic, 4k",
    "no text, no watermark, no logos, no distorted anatomy",
  ]
    .filter(Boolean)
    .join(", ");
}

async function generateOne(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  prompt: string,
  outDir: string,
  index: number,
): Promise<string | null> {
  try {
    const response = await zai.images.generations.create({
      prompt,
      size: "768x1344",
    });
    const b64 = response.data?.[0]?.base64;
    if (!b64) return null;

    const buffer = Buffer.from(b64, "base64");
    const hash = crypto.randomBytes(6).toString("hex");
    const filename = `var-${Date.now()}-${index}-${hash}.png`;
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, filename), buffer);
    return `/generated/${filename}`;
  } catch (e) {
    console.error(`variation[${index}] error`, e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VariationBody;
    const count = Math.max(1, Math.min(4, body.count ?? 3));

    const zai = await ZAI.create();
    const outDir = path.join(process.cwd(), "public", "generated");

    const prompts = Array.from({ length: count }, (_, i) =>
      buildVariationPrompt(body, i),
    );

    const results: string[] = [];
    for (let i = 0; i < prompts.length; i += 2) {
      const batch = prompts.slice(i, i + 2);
      const settled = await Promise.all(
        batch.map((p, j) => generateOne(zai, p, outDir, i + j)),
      );
      results.push(...settled.filter((r): r is string => r !== null));
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "We couldn't create variations. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      images: results,
      prompts,
    });
  } catch (e) {
    console.error("Variations error", e);
    return NextResponse.json(
      { error: "We couldn't create variations. Try again." },
      { status: 500 },
    );
  }
}
