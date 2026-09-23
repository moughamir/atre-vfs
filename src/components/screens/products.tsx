"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { PRODUCT_CATEGORIES, formatPrice } from "@/lib/presets";
import { Plus, Search, Sparkles } from "lucide-react";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/studio/smart-image";
import { cn } from "@/lib/utils";

export function ProductsScreen() {
  const { navigate, selectProduct, pushToast } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

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

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = category === "All" || p.category === category;
      const matchesQuery =
        !query.trim() ||
        p.name.toLowerCase().includes(query.toLowerCase().trim()) ||
        (p.description ?? "").toLowerCase().includes(query.toLowerCase().trim());
      return matchesCat && matchesQuery;
    });
  }, [products, query, category]);

  return (
    <Screen>
      <ScreenHeader
        right={
          <button
            aria-label="Add product"
            onClick={() => navigate("add-product")}
            className="flex h-9 w-9 items-center justify-center rounded-full active:bg-foreground/5"
          >
            <Plus className="h-5 w-5" strokeWidth={1.75} />
          </button>
        }
      />

      <div className="px-5 pt-2 pb-4">
        <h1 className="font-display text-[32px] leading-[1.05]">Products</h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Your fashion catalog
        </p>
      </div>

      {/* Search */}
      <div className="px-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="w-full h-12 rounded-full bg-secondary pl-11 pr-4 text-[15px] placeholder:text-muted-foreground outline-none focus:ring-2 ring-foreground/30 transition"
            aria-label="Search products"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mt-4 -mx-5 px-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {PRODUCT_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 h-9 px-4 rounded-full text-[13px] font-medium transition-all active:scale-95",
                category === c
                  ? "bg-foreground text-background"
                  : "bg-secondary text-foreground hover:bg-accent",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-5 px-5 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyProducts onAdd={() => navigate("add-product")} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  selectProduct(p);
                  navigate("product-detail");
                }}
                className="group text-left active:scale-[0.98] transition"
              >
                <SmartImage
                  src={p.images?.[0] ?? ""}
                  alt={p.name}
                  rounded="rounded-2xl"
                  className="aspect-[4/5]"
                  imgClassName="transition-transform duration-500 group-active:scale-105"
                />
                <div className="mt-2">
                  <div className="text-[14px] font-medium leading-tight line-clamp-1">
                    {p.name}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[12px] text-muted-foreground">
                      {formatPrice(p.price, p.currency)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground/80">
                      {p.category}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {!loading && filtered.length > 0 && (
        <button
          onClick={() => navigate("add-product")}
          aria-label="Add product"
          className="fixed right-5 bottom-24 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-[0_10px_30px_-8px_rgba(0,0,0,0.4)] active:scale-95 transition"
        >
          <Plus className="h-6 w-6" strokeWidth={2} />
        </button>
      )}
    </Screen>
  );
}

function EmptyProducts({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center mt-6">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
        <Sparkles className="h-6 w-6" />
      </div>
      <p className="font-display text-[18px] mt-3">Your catalog is empty</p>
      <p className="text-[13px] text-muted-foreground mt-1">
        Add your first product to create a studio shoot.
      </p>
      <button
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-foreground text-background text-[13px] font-semibold uppercase tracking-wide active:scale-95 transition"
      >
        <Plus className="h-4 w-4" /> Add Product
      </button>
    </div>
  );
}
