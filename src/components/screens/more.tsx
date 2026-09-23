"use client";

import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import {
  User,
  Users,
  CreditCard,
  Settings,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Github,
  Sun,
  Moon,
  Heart,
  Layers,
} from "lucide-react";
import { useTheme } from "next-themes";

export function MoreScreen() {
  const { pushToast, navigate } = useApp();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = (resolvedTheme ?? theme) === "dark";

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    pushToast({
      title: next === "dark" ? "Dark mode on" : "Light mode on",
      variant: "default",
    });
  };

  const groups: {
    title: string;
    items: {
      icon: typeof User;
      label: string;
      onClick: () => void;
      hint?: string;
    }[];
  }[] = [
    {
      title: "Library",
      items: [
        {
          icon: Layers,
          label: "My projects",
          onClick: () => navigate("projects"),
          hint: "All studios",
        },
        {
          icon: Heart,
          label: "Favorites",
          onClick: () => navigate("favorites"),
          hint: "Collection",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Brand profile",
          onClick: () =>
            pushToast({ title: "Coming soon", description: "Brand profile is in the roadmap." }),
        },
        {
          icon: Users,
          label: "Team",
          onClick: () =>
            pushToast({ title: "Coming soon", description: "Team invites will land here." }),
        },
        {
          icon: CreditCard,
          label: "Subscription",
          hint: "Free plan",
          onClick: () => pushToast({ title: "You're on the Free plan", variant: "success" }),
        },
      ],
    },
    {
      title: "App",
      items: [
        {
          icon: isDark ? Sun : Moon,
          label: "Appearance",
          onClick: toggleTheme,
          hint: isDark ? "Dark" : "Light",
        },
        {
          icon: Settings,
          label: "Settings",
          onClick: () => navigate("settings"),
        },
        {
          icon: HelpCircle,
          label: "Help",
          onClick: () => pushToast({ title: "Help center coming soon" }),
        },
        {
          icon: MessageSquare,
          label: "Feedback",
          onClick: () =>
            pushToast({ title: "Thanks — we'll keep improving.", variant: "success" }),
        },
      ],
    },
  ];

  return (
    <Screen>
      <ScreenHeader />

      <div className="px-5 pt-2">
        <h1 className="font-display text-[32px] leading-[1.05]">More</h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Account and application settings
        </p>
      </div>

      {/* Brand card */}
      <div className="px-5 mt-6">
        <div className="rounded-3xl bg-foreground text-background p-6 overflow-hidden relative">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-background/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-background/5 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] opacity-75">
              <Sparkles className="h-3.5 w-3.5" />
              Atré · Virtual Studio
            </div>
            <p className="font-display text-[24px] leading-tight mt-3">
              Turn products into
              <br />
              fashion shoots.
            </p>
            <button
              onClick={() => navigate("studio-product")}
              className="mt-4 inline-flex items-center gap-2 bg-background text-foreground h-10 px-5 rounded-full text-[13px] font-semibold uppercase tracking-wide active:scale-95 transition hover:opacity-90"
            >
              Create Studio
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Groups */}
      <div className="px-5 mt-6 space-y-6">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground mb-2 font-medium">
              {g.title}
            </p>
            <div className="rounded-2xl bg-secondary/40 divide-y divide-border overflow-hidden">
              {g.items.map((it) => {
                const Icon = it.icon;
                return (
                  <button
                    key={it.label}
                    onClick={it.onClick}
                    className="w-full flex items-center gap-3 h-14 px-4 active:bg-foreground/5 transition text-left"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="flex-1 text-[15px] font-medium">{it.label}</span>
                    {it.hint && (
                      <span className="text-[12px] text-muted-foreground">{it.hint}</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 mt-8 mb-4 text-center">
        <a
          href="https://chat.z.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition"
        >
          <Github className="h-3.5 w-3.5" />
          Atré Studio · v1.0
        </a>
      </div>
    </Screen>
  );
}
