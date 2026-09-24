"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  Camera,
  Image as ImageIcon,
  ShoppingBag,
  Layers,
  Heart,
  Settings,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: { category: string; items: FAQItem[] }[] = [
  {
    category: "Getting started",
    items: [
      {
        q: "How do I create my first studio?",
        a: "Tap the Studio tab (center button) or 'Create new studio' on the Home screen. Select a product, then choose a model, scene, and style. Tap 'Create Images' to generate 4 fashion photos in about 2 minutes.",
      },
      {
        q: "Do I need a product photo to start?",
        a: "Yes. You can add a product from the Products tab — upload at least one photo, enter a name, category, and price. The product photo is the source of truth for your generated images.",
      },
      {
        q: "How long does generation take?",
        a: "Each generation produces 4 images and takes approximately 2 minutes. You can adjust the image count in Settings (1–4 images per generation).",
      },
    ],
  },
  {
    category: "Studio & generation",
    items: [
      {
        q: "What's the difference between Model, Scene, and Style?",
        a: "Model is who wears the product (woman, man, or no model). Scene is the environment (studio, street, lifestyle, editorial). Style is the visual mood (clean, luxury, noir, etc.). Each affects the final image independently.",
      },
      {
        q: "Can I edit a single image without regenerating all?",
        a: "Yes. Open any image from the Results grid, tap 'Edit', and change just the model, scene, or style. The new generation is added to your history — you can switch between all generations.",
      },
      {
        q: "Why does the product look different in some images?",
        a: "AI generation interprets your product photo. While we preserve identity, small details may vary. Use 'Regenerate' to get new variations, or try a different style for a different interpretation.",
      },
      {
        q: "What are model preferences (Natural, Elegant, Editorial)?",
        a: "These fine-tune the model's pose and expression. Natural is relaxed, Elegant is refined, Editorial is dramatic. They're optional — the default works well for most shoots.",
      },
    ],
  },
  {
    category: "Projects & history",
    items: [
      {
        q: "Are my projects saved?",
        a: "Yes. Every studio you create is automatically saved. Find them under Home → Projects, or the 'My projects' shortcut in the More tab. You can resume any project anytime.",
      },
      {
        q: "What is the Lookbook?",
        a: "The Lookbook aggregates every generated image across all your projects into one gallery. Filter by project, tap any image to download, share, or open its studio.",
      },
      {
        q: "How do favorites work?",
        a: "Tap the heart icon on any generated image to save it. Favorites persist across sessions and appear in the Favorites screen (Home → Favorites tile).",
      },
    ],
  },
  {
    category: "Publishing & shop",
    items: [
      {
        q: "How do I publish to my shop?",
        a: "From the Results screen, select the images you want, tap 'Publish', review the listing (name, price, AI-generated description), then tap 'Publish Product'. The listing appears in your Shop immediately.",
      },
      {
        q: "Can I edit the AI-generated description?",
        a: "Yes. On the Publish screen, the description is pre-filled by AI but fully editable. Tap the regenerate button to get a new description, or type your own.",
      },
      {
        q: "Can I search and sort my shop?",
        a: "Yes. The Shop screen has a search box (filters by name and description) and a sort button (Newest, Price ↑, Price ↓, A–Z).",
      },
    ],
  },
  {
    category: "Settings & data",
    items: [
      {
        q: "Can I set default studio preferences?",
        a: "Yes. Go to More → Settings → Defaults to set your default model, scene, and style. New studios will start with these. You can also set the image count per generation (1–4).",
      },
      {
        q: "How do I switch to dark mode?",
        a: "More → Appearance. The theme persists across sessions. Dark mode uses an OLED-friendly palette.",
      },
      {
        q: "Is my data stored locally or in the cloud?",
        a: "Products, projects, and listings are stored in a local database. Favorites and settings are stored in your browser. Nothing leaves your device — this is a demo app.",
      },
    ],
  },
];

const QUICK_LINKS = [
  {
    icon: Camera,
    label: "Create a studio",
    screen: "studio-product" as const,
  },
  {
    icon: Layers,
    label: "View projects",
    screen: "projects" as const,
  },
  {
    icon: ImageIcon,
    label: "Open lookbook",
    screen: "lookbook" as const,
  },
  {
    icon: ShoppingBag,
    label: "Browse shop",
    screen: "shop" as const,
  },
  {
    icon: Heart,
    label: "See favorites",
    screen: "favorites" as const,
  },
  {
    icon: Settings,
    label: "Open settings",
    screen: "settings" as const,
  },
];

export function HelpScreen() {
  const { navigate } = useApp();
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex((prev) => (prev === key ? null : key));
  };

  return (
    <Screen>
      <ScreenHeader showBack title="Help" />

      <div className="px-5 pt-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          <h1 className="font-display text-[28px] leading-tight">Help center</h1>
        </div>
        <p className="text-[14px] text-muted-foreground mt-1">
          Everything you need to know about Atré.
        </p>
      </div>

      {/* Quick links */}
      <div className="mt-5 -mx-5 px-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => navigate(link.screen)}
                className="shrink-0 flex items-center gap-2 h-10 px-3.5 rounded-full bg-secondary text-foreground text-[12px] font-medium transition active:scale-95 hover:bg-accent"
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {link.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ accordions */}
      <div className="mt-6 px-5 space-y-6">
        {FAQS.map((group) => (
          <div key={group.category}>
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground font-medium mb-2">
              {group.category}
            </p>
            <div className="rounded-2xl bg-secondary/40 divide-y divide-border overflow-hidden">
              {group.items.map((item, i) => {
                const key = `${group.category}-${i}`;
                const isOpen = openIndex === key;
                return (
                  <div key={key}>
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left active:bg-foreground/5 transition"
                      aria-expanded={isOpen}
                    >
                      <span className="text-[14px] font-medium leading-snug">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300",
                        isOpen ? "max-h-60" : "max-h-0",
                      )}
                    >
                      <p className="px-4 pb-4 text-[13px] text-muted-foreground leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact card */}
      <div className="px-5 mt-8">
        <div className="rounded-2xl bg-foreground text-background p-5 flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10">
            <Sparkles className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <p className="font-display text-[16px]">Still need help?</p>
            <p className="text-[12px] opacity-75 mt-0.5">
              Send feedback and we'll get back to you.
            </p>
          </div>
          <button
            onClick={() => navigate("more")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background/15 active:scale-95 transition"
            aria-label="Send feedback"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1" />
    </Screen>
  );
}
