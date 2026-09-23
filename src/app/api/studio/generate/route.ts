import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  MODEL_PRESETS,
  POSE_PRESETS,
  SCENE_PRESETS,
  STYLE_PRESETS,
} from "@/lib/presets";
import type { ModelOption, PoseOption, SceneOption, StyleOption } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

interface GenerateBody {
  productName?: string;
  productDescription?: string;
  productImageHint?: string;
  model: ModelOption;
  modelPreference?: string | null;
  pose?: PoseOption;
  scene: SceneOption;
  style: StyleOption;
  count?: number;
}

function buildFashionPrompt(b: GenerateBody, variant: number): string {
  const model = MODEL_PRESETS.find((m) => m.id === b.model);
  const scene = SCENE_PRESETS.find((s) => s.id === b.scene);
  const style = STYLE_PRESETS.find((s) => s.id === b.style);
  const pose = POSE_PRESETS.find((p) => p.id === b.pose) ?? POSE_PRESETS[0];

  const modelPart =
    b.model === "none"
      ? "presented on an invisible ghost mannequin, product only, no person"
      : b.model === "woman"
        ? "worn by an elegant female fashion model"
        : b.model === "man"
          ? "worn by an elegant male fashion model"
          : "worn by a fashion model";

  const prefPart = b.modelPreference
    ? `, ${b.modelPreference} mood`
    : "";

  const product =
    b.productName && b.productName.trim().length > 0
      ? b.productName
      : "the featured fashion product";

  // Variation angles
  const angles = [
    "front-facing composition",
    "three-quarter angle composition",
    "side profile composition",
    "dynamic editorial angle",
  ];
  const angle = angles[variant % angles.length];

  return [
    `High-end fashion editorial photograph of ${product}`,
    product.trim().length > 0 && b.productDescription
      ? `(${b.productDescription})`
      : "",
    modelPart + prefPart,
    pose?.promptHint,
    `set in a ${scene?.label.toLowerCase() ?? "studio"} environment`,
    scene?.previewPrompt,
    style?.previewPrompt,
    angle,
    "preserving the exact identity, color, shape, fabric and details of the product",
    "sharp focus on the garment, professional studio lighting, premium magazine quality, photorealistic, 4k, depth of field",
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
      size: "768x1344", // portrait, fashion-friendly
    });
    const b64 = response.data?.[0]?.base64;
    if (!b64) return null;

    const buffer = Buffer.from(b64, "base64");
    const hash = crypto.randomBytes(6).toString("hex");
    const filename = `gen-${Date.now()}-${index}-${hash}.png`;
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, filename), buffer);
    return `/generated/${filename}`;
  } catch (e) {
    console.error(`generateOne[${index}] error`, e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateBody;
    const count = Math.max(1, Math.min(4, body.count ?? 4));

    const zai = await ZAI.create();
    const outDir = path.join(process.cwd(), "public", "generated");

    // Build 4 prompts with slight variations
    const prompts = Array.from({ length: count }, (_, i) =>
      buildFashionPrompt(body, i),
    );

    // Generate in parallel (with slight concurrency cap via Promise.all batches of 2)
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
        { error: "We couldn't create your images. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      images: results,
      prompts,
    });
  } catch (e) {
    console.error("Generate error", e);
    return NextResponse.json(
      { error: "We couldn't create your images. Your settings are safe. Try again." },
      { status: 500 },
    );
  }
}
