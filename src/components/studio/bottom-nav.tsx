"use client";

import { useApp } from "@/lib/store";
import type { TabId } from "@/lib/types";
import { Home, Shirt, Sparkles, ShoppingBag, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: { id: TabId; label: string; icon: typeof Home; accent?: boolean }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "products", label: "Products", icon: Shirt },
  { id: "studio", label: "Studio", icon: Sparkles, accent: true },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "more", label: "More", icon: MoreHorizontal },
];

export function BottomNav() {
  const { activeTab, setActiveTab, screen } = useApp();
  // Determine if we are deep inside a tab (e.g. studio flow, product detail)
  // Hide bottom nav only on immersive screens (generating, image-detail)
  const hiddenOn: string[] = ["generating", "image-detail"];
  if (hiddenOn.includes(screen)) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-xl border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Primary navigation"
    >
      <div className="mx-auto max-w-md px-2">
        <ul className="flex items-stretch justify-between h-16">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            if (tab.accent) {
              return (
                <li key={tab.id} className="flex-1 flex justify-center">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className="group flex flex-col items-center justify-center gap-1 -mt-6"
                    aria-label={tab.label}
                    aria-current={active ? "page" : undefined}
                  >
                    <span
                      className={cn(
                        "relative flex h-14 w-14 items-center justify-center rounded-full shadow-[0_10px_24px_-8px_rgba(0,0,0,0.45)] transition-all duration-300 border",
                        active
                          ? "bg-foreground text-background scale-110 border-foreground"
                          : "bg-foreground text-background border-foreground/90 group-active:scale-95 group-hover:scale-105",
                      )}
                    >
                      {/* Subtle glow ring */}
                      <span
                        className={cn(
                          "absolute inset-0 rounded-full transition-opacity duration-500",
                          active ? "opacity-100" : "opacity-0",
                        )}
                        style={{
                          boxShadow: "0 0 0 6px rgba(0,0,0,0.04), 0 0 0 12px rgba(0,0,0,0.02)",
                        }}
                      />
                      <Icon className="relative h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-medium tracking-wide uppercase transition-colors",
                        active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {tab.label}
                    </span>
                  </button>
                </li>
              );
            }
            return (
              <li key={tab.id} className="flex-1 flex justify-center">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-col items-center justify-center gap-1 h-full w-full group"
                  aria-label={tab.label}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
                      active
                        ? "bg-foreground/5 text-foreground"
                        : "text-muted-foreground group-active:scale-90",
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium tracking-wide uppercase",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {tab.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
