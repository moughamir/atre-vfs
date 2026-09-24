// Client-side API helpers for projects and favorites persistence.

import type { ProjectSummary, FavoriteImage } from "@/lib/types";

// ── Projects ──────────────────────────────────────────────────
export async function createProject(
  productId: string,
  model: string,
  modelPreference: string | null,
  scene: string,
  style: string,
): Promise<ProjectSummary | null> {
  try {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, model, modelPreference, scene, style }),
    });
    const data = await res.json();
    return data.project ?? null;
  } catch (e) {
    console.error("createProject failed", e);
    return null;
  }
}

export async function patchProject(
  id: string,
  patch: Record<string, unknown>,
): Promise<ProjectSummary | null> {
  try {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    return data.project ?? null;
  } catch (e) {
    console.error("patchProject failed", e);
    return null;
  }
}

export async function addGenerationToProject(
  projectId: string,
  payload: {
    prompt: string;
    model: string;
    scene: string;
    style: string;
    images: string[];
  },
): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.generation ?? null;
  } catch (e) {
    console.error("addGenerationToProject failed", e);
    return null;
  }
}

export async function fetchProjects(): Promise<ProjectSummary[]> {
  try {
    const res = await fetch("/api/projects");
    const data = await res.json();
    return data.projects ?? [];
  } catch {
    return [];
  }
}

// ── Favorites ─────────────────────────────────────────────────
export async function fetchFavorites(): Promise<FavoriteImage[]> {
  try {
    const res = await fetch("/api/favorites");
    const data = await res.json();
    return data.favorites ?? [];
  } catch {
    return [];
  }
}

export async function toggleFavoriteAPI(
  url: string,
  productName: string,
  remove: boolean,
): Promise<FavoriteImage[]> {
  try {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, productName, remove }),
    });
    const data = await res.json();
    return data.favorites ?? [];
  } catch {
    return [];
  }
}
