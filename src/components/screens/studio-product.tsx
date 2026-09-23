"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader, ExitStudioConfirm } from "@/components/studio/screen-header";
import { PrimaryCTA } from "@/components/studio/cta";
import { StudioProgress } from "@/components/studio/studio-progress";
import { formatPrice } from "@/lib/presets";
import { Check, Search, Plus, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StudioProductScreen() {
  const { studio, navigate, startStudio, resetStudio, setActiveTab, pushToast } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [exitOpen, setExitOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    studio.product?.id ?? null,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (!cancelled) setProducts(data.products ?? []);
      } catch {
        if (!cancelled) pushToast({ title: "Couldn't load products", variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pushToast]);

  const filtered = products.filter(
    (p) => !query.trim() || p.name.toLowerCase().includes(query.toLowerCase().trim()),
  );

  const selectedProduct = products.find((p) => p.id === selectedId) ?? null;

  const onExitConfirm = () => {
    resetStudio();
    setExitOpen(false);
    setActiveTab("home");
  };

  const onNext = () => {
    if (!selectedProduct) return;
    // startStudio resets studio state and sets the product, then we advance.
    startStudio(selectedProduct);
    navigate("studio-model");
  };

  return (
    <Screen bottomPad="cta">
      <ScreenHeader
        showClose
        step="1/4"
        title="Create Studio"
        onClose={() => setExitOpen(true)}
        right={<StudioProgress current={0} />}
      />
      <ExitStudioConfirm
        open={exitOpen}
        onKeepWorking={() => setExitOpen(false)}
        onLeave={onExitConfirm}
      />

      <div className="px-5 pt-2">
        <h1 className="font-display text-[28px] leading-tight">
          Choose a product
        </h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          What would you like to photograph?
        </p>
      </div>

      {/* Search */}
      <div className="px-5 mt-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="w-full h-12 rounded-full bg-secondary pl-11 pr-4 text-[15px] placeholder:text-muted-foreground outline-none focus:ring-2 ring-foreground/30 transition"
          />
        </div>
      </div>

      {/* Add new product */}
      <div className="px-5 mt-3">
        <button
          onClick={() => navigate("add-product")}
          className="flex items-center gap-2 text-[14px] text-foreground font-medium active:scale-[0.98] transition"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5">
            <Plus className="h-4 w-4" />
          </span>
          Add new product
        </button>
      </div>

      {/* Grid */}
      <div className="px-5 mt-4 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center mt-4">
            <p className="text-[14px] text-muted-foreground">
              No products found.{" "}
              <button
                onClick={() => navigate("add-product")}
                className="underline text-foreground"
              >
                Add one
              </button>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => {
              const active = selectedId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className="group relative text-left active:scale-[0.98] transition"
                >
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-2xl bg-secondary aspect-[4/5] transition-all duration-300",
                      active
                        ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                        : "ring-1 ring-border",
                    )}
                  >
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-foreground/40 text-[11px] uppercase tracking-widest">
                          No image
                        </span>
                      </div>
                    )}
                    {active && (
                      <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background shadow-md animate-screen-in">
                        <Check className="h-4 w-4" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="text-[14px] font-medium leading-tight line-clamp-1">
                      {p.name}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">
                      {formatPrice(p.price, p.currency)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1" />

      <PrimaryCTA
        onClick={onNext}
        disabled={!selectedProduct}
        icon={<ArrowRight className="h-5 w-5" />}
      >
        Next
      </PrimaryCTA>
    </Screen>
  );
}
