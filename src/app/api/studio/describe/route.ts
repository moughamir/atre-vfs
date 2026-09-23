import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface DescribeBody {
  productName: string;
  category?: string;
  price?: number;
  scene?: string;
  style?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DescribeBody;
    if (!body.productName) {
      return NextResponse.json({ error: "Product name required" }, { status: 400 });
    }

    const zai = await ZAI.create();

    const styleVibe =
      body.style === "luxury"
        ? "luxurious, premium, sophisticated"
        : body.style === "editorial"
          ? "editorial, refined, magazine-grade"
          : body.style === "summer"
            ? "warm, breezy, effortless"
            : body.style === "urban"
              ? "modern, urban, contemporary"
              : body.style === "minimal"
                ? "minimal, quiet, refined"
                : "clean, fresh, modern";

    const sceneContext =
      body.scene === "street"
        ? "an urban streetwear setting"
        : body.scene === "lifestyle"
          ? "a lifestyle, real-world setting"
          : body.scene === "editorial"
            ? "a high-fashion editorial setting"
            : "a clean studio setting";

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are an expert fashion copywriter. Write short, premium product descriptions for an online fashion boutique. Keep it under 60 words. No bullet points. No markdown. Just two or three elegant sentences. Focus on fabric, fit, mood and occasion. Do not include the price or product name. Do not use emojis.",
        },
        {
          role: "user",
          content: `Write a product description for "${body.productName}"${
            body.category ? `, a ${body.category.toLowerCase()}` : ""
          }. The photoshoot uses a ${styleVibe} style in ${sceneContext}. Price is ${
            body.price ? `€${Math.round(body.price)}` : "a premium"
          }.`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const description = completion.choices?.[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ description });
  } catch (e) {
    console.error("Describe error", e);
    return NextResponse.json(
      { description: "A refined piece with a relaxed silhouette, designed for everyday wear." },
      { status: 200 },
    );
  }
}
