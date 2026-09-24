import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const project = await db.studioProject.findUnique({
      where: { id },
      include: { product: true, generations: true },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    console.error("GET /api/projects/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

interface PatchBody {
  model?: string;
  modelPreference?: string | null;
  scene?: string;
  style?: string;
  status?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as PatchBody;
    const update: Record<string, unknown> = {};
    for (const k of ["model", "modelPreference", "scene", "style", "status"]) {
      if (body[k as keyof PatchBody] !== undefined) {
        update[k] = body[k as keyof PatchBody];
      }
    }
    const project = await db.studioProject.update({
      where: { id },
      data: update,
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
    console.error("PATCH /api/projects/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await db.studioProject.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/projects/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Add a generation to a project
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as {
      prompt: string;
      model: string;
      scene: string;
      style: string;
      images: string[];
      status?: string;
    };
    const generation = await db.generation.create({
      data: {
        projectId: id,
        prompt: body.prompt ?? "",
        model: body.model,
        scene: body.scene,
        style: body.style,
        status: body.status ?? "completed",
        images: JSON.stringify(body.images ?? []),
      },
    });
    // bump project status
    await db.studioProject.update({
      where: { id },
      data: { status: "ready" },
    });
    return NextResponse.json({
      generation: {
        ...generation,
        images: JSON.parse(generation.images || "[]") as string[],
      },
    });
  } catch (e) {
    console.error("PUT /api/projects/[id] (add generation) error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
