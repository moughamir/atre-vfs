import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await db.studioProject.findMany({
      orderBy: { updatedAt: "desc" },
      include: { product: true, generations: true },
    });
    const parsed = projects.map((p) => ({
      ...p,
      product: {
        ...p.product,
        images: JSON.parse(p.product.images || "[]") as string[],
      },
      generations: p.generations.map((g) => ({
        ...g,
        images: JSON.parse(g.images || "[]") as string[],
      })),
    }));
    return NextResponse.json({ projects: parsed });
  } catch (e) {
    console.error("GET /api/projects error", e);
    return NextResponse.json({ projects: [] });
  }
}

interface CreateBody {
  productId: string;
  model?: string;
  modelPreference?: string | null;
  scene?: string;
  style?: string;
  status?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateBody;
    if (!body.productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }
    const project = await db.studioProject.create({
      data: {
        productId: body.productId,
        model: body.model ?? "woman",
        modelPreference: body.modelPreference ?? null,
        scene: body.scene ?? "studio",
        style: body.style ?? "clean",
        status: body.status ?? "configuring",
      },
      include: { product: true, generations: true },
    });
    return NextResponse.json({
      project: {
        ...project,
        product: {
          ...project.product,
          images: JSON.parse(project.product.images || "[]") as string[],
        },
        generations: project.generations.map((g) => ({
          ...g,
          images: JSON.parse(g.images || "[]") as string[],
        })),
      },
    });
  } catch (e) {
    console.error("POST /api/projects error", e);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
