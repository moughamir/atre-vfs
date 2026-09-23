import type {
  ModelOption,
  ModelPreference,
  SceneOption,
  StyleOption,
} from "./types";

// ── Model presets ──────────────────────────────────────────────
export interface ModelPreset {
  id: ModelOption;
  label: string;
  description: string;
  emoji: string;
}

export const MODEL_PRESETS: ModelPreset[] = [
  { id: "woman", label: "Woman", description: "Female fashion model", emoji: "♀" },
  { id: "man", label: "Man", description: "Male fashion model", emoji: "♂" },
  { id: "none", label: "No model", description: "Product only, ghost-mannequin", emoji: "○" },
  { id: "custom", label: "My model", description: "Upload your own model", emoji: "＋" },
];

export const MODEL_PREFERENCES: { id: ModelPreference; label: string }[] = [
  { id: "natural", label: "Natural" },
  { id: "elegant", label: "Elegant" },
  { id: "editorial", label: "Editorial" },
];

// ── Pose presets ───────────────────────────────────────────────
export interface PosePreset {
  id: PoseOption;
  label: string;
  description: string;
  promptHint: string;
}

export const POSE_PRESETS: PosePreset[] = [
  {
    id: "standing",
    label: "Standing",
    description: "Front-facing, classic lookbook",
    promptHint: "standing pose, front-facing, full body, classic lookbook composition",
  },
  {
    id: "walking",
    label: "Walking",
    description: "In motion, editorial energy",
    promptHint: "mid-stride walking pose, dynamic editorial movement, three-quarter angle",
  },
  {
    id: "seated",
    label: "Seated",
    description: "Relaxed, intimate framing",
    promptHint: "seated pose, relaxed and intimate framing, composed posture",
  },
  {
    id: "detail",
    label: "Detail",
    description: "Close-up on fabric & fit",
    promptHint: "close-up detail shot, focus on fabric texture and garment fit, macro composition",
  },
  {
    id: "dynamic",
    label: "Dynamic",
    description: "Bold, angular, high-impact",
    promptHint: "dynamic angular pose, high-impact editorial composition, bold silhouette",
  },
];

// ── Scene presets ──────────────────────────────────────────────
export interface ScenePreset {
  id: SceneOption;
  label: string;
  description: string;
  previewPrompt: string;
}

export const SCENE_PRESETS: ScenePreset[] = [
  {
    id: "studio",
    label: "Studio",
    description: "Clean, neutral ecommerce studio",
    previewPrompt:
      "minimalist fashion photography studio backdrop, soft seamless paper, neutral beige background, professional soft lighting, high-end product photography",
  },
  {
    id: "street",
    label: "Street",
    description: "Urban fashion environment",
    previewPrompt:
      "modern urban street setting, contemporary city architecture, soft natural daylight, editorial street fashion photography, cobblestone and concrete textures",
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    description: "Real-world environment",
    previewPrompt:
      "warm sunlit interior, modern minimalist apartment, natural light through large windows, lifestyle fashion photography, cozy refined atmosphere",
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Luxury magazine environment",
    previewPrompt:
      "luxury fashion editorial set, dramatic studio environment, bold architectural shapes, moody sophisticated lighting, vogue magazine aesthetic",
  },
];

// ── Style presets ──────────────────────────────────────────────
export interface StylePreset {
  id: StyleOption;
  label: string;
  description: string;
  previewPrompt: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "clean",
    label: "Clean",
    description: "Bright, minimal, ecommerce-ready",
    previewPrompt:
      "clean bright minimal fashion photography, soft diffused lighting, pure white background, crisp and airy, high-end ecommerce look",
  },
  {
    id: "luxury",
    label: "Luxury",
    description: "Premium, rich, sophisticated",
    previewPrompt:
      "luxury fashion editorial photography, rich tonal contrast, deep shadows with soft highlights, premium glossy magazine quality, opulent and refined",
  },
  {
    id: "summer",
    label: "Summer",
    description: "Warm, sunlit, effortless",
    previewPrompt:
      "warm summer fashion photography, golden hour sunlight, soft warm tones, breezy and effortless mood, natural outdoor glow",
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Magazine-grade, dramatic",
    previewPrompt:
      "high fashion editorial photography, vogue magazine style, dramatic directional lighting, sophisticated mood, refined color grading",
  },
  {
    id: "urban",
    label: "Urban",
    description: "Edgy, modern, streetwear",
    previewPrompt:
      "modern urban street fashion photography, contemporary streetwear aesthetic, cool concrete tones, editorial street style, raw and refined",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Stripped back, monochrome",
    previewPrompt:
      "minimal fashion photography, monochrome palette, stripped back composition, soft natural light, quiet and refined aesthetic",
  },
  {
    id: "noir",
    label: "Noir",
    description: "Cinematic, moody, high-contrast",
    previewPrompt:
      "cinematic noir fashion photography, dramatic high-contrast lighting, deep blacks with rim light, moody film-noir atmosphere, sophisticated and timeless",
  },
  {
    id: "pastel",
    label: "Pastel",
    description: "Soft, dreamy, romantic",
    previewPrompt:
      "soft pastel fashion photography, dreamy romantic color palette, gentle diffused light, airy and ethereal mood, delicate and refined",
  },
];

// ── Product categories ──────────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  "All",
  "Shirts",
  "Dresses",
  "Knitwear",
  "Outerwear",
  "Trousers",
  "Shoes",
  "Accessories",
];

export const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.filter((c) => c !== "All");

// ── Helpers ─────────────────────────────────────────────────────
export function formatPrice(price: number, currency = "EUR"): string {
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "£";
  return `${symbol}${Math.round(price)}`;
}

export function getScenePreset(id: SceneOption): ScenePreset {
  return SCENE_PRESETS.find((s) => s.id === id) ?? SCENE_PRESETS[0];
}

export function getStylePreset(id: StyleOption): StylePreset {
  return STYLE_PRESETS.find((s) => s.id === id) ?? STYLE_PRESETS[0];
}

export function getModelPreset(id: ModelOption): ModelPreset {
  return MODEL_PRESETS.find((m) => m.id === id) ?? MODEL_PRESETS[0];
}

// ── Greeting ────────────────────────────────────────────────────
export function getGreeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// ── Generation progress steps ───────────────────────────────────
export const GENERATION_STEPS = [
  { id: "prep", label: "Preparing your product" },
  { id: "model", label: "Preparing model" },
  { id: "scene", label: "Building the scene" },
  { id: "images", label: "Creating images" },
  { id: "final", label: "Finalizing results" },
];
