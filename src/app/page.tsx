"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { BottomNav } from "@/components/studio/bottom-nav";
import { InlineToasts } from "@/components/studio/toasts";

import { HomeScreen } from "@/components/screens/home";
import { ProductsScreen } from "@/components/screens/products";
import { ProductDetailScreen } from "@/components/screens/product-detail";
import { AddProductScreen } from "@/components/screens/add-product";
import { StudioProductScreen } from "@/components/screens/studio-product";
import { StudioModelScreen } from "@/components/screens/studio-model";
import { StudioSceneScreen } from "@/components/screens/studio-scene";
import { StudioStyleScreen } from "@/components/screens/studio-style";
import { StudioSummaryScreen } from "@/components/screens/studio-summary";
import { GeneratingScreen } from "@/components/screens/generating";
import { ResultsScreen } from "@/components/screens/results";
import { ImageDetailScreen } from "@/components/screens/image-detail";
import { EditImageScreen } from "@/components/screens/edit-image";
import { PublishScreen } from "@/components/screens/publish";
import { ShopScreen } from "@/components/screens/shop";
import { ShopDetailScreen } from "@/components/screens/shop-detail";
import { MoreScreen } from "@/components/screens/more";
import { SuccessScreen } from "@/components/screens/success";

import { Loader2 } from "lucide-react";

export default function Home() {
  const screen = useApp((s) => s.screen);
  const [booting, setBooting] = useState(true);

  // Boot: seed DB on first load so the user sees a populated catalog
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetch("/api/seed", { method: "POST" });
      } catch {
        // ignore — not critical
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (booting) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background text-foreground">
        <div className="font-display text-[28px] tracking-tight">Atré</div>
        <p className="text-[12px] uppercase tracking-[0.22em] text-muted-foreground mt-2">
          Virtual Studio
        </p>
        <Loader2 className="h-5 w-5 mt-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const render = () => {
    switch (screen) {
      case "home":
        return <HomeScreen />;
      case "products":
        return <ProductsScreen />;
      case "product-detail":
        return <ProductDetailScreen />;
      case "add-product":
        return <AddProductScreen />;
      case "edit-product":
        return <AddProductScreen editing />;
      case "studio-product":
        return <StudioProductScreen />;
      case "studio-model":
        return <StudioModelScreen />;
      case "studio-scene":
        return <StudioSceneScreen />;
      case "studio-style":
        return <StudioStyleScreen />;
      case "studio-summary":
        return <StudioSummaryScreen />;
      case "generating":
        return <GeneratingScreen />;
      case "results":
        return <ResultsScreen />;
      case "image-detail":
        return <ImageDetailScreen />;
      case "edit-image":
        return <EditImageScreen />;
      case "publish":
        return <PublishScreen />;
      case "shop":
        return <ShopScreen />;
      case "shop-detail":
        return <ShopDetailScreen />;
      case "more":
        return <MoreScreen />;
      case "success":
        return <SuccessScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Screens that take over the whole viewport (no bottom nav, no max-width)
  const immersive = ["generating", "image-detail", "success"];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className={immersive.includes(screen) ? "" : "mx-auto max-w-md min-h-[100dvh] relative"}>
        {render()}
        {!immersive.includes(screen) && <BottomNav />}
        <InlineToasts />
      </div>
    </div>
  );
}
