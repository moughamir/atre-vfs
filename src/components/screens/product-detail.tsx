"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { PrimaryCTA } from "@/components/studio/cta";
import { formatPrice } from "@/lib/presets";
import { Sparkles, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ProductDetailScreen() {
  const { selectedProductId, navigate, startStudio, pushToast, setActiveTab } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!selectedProductId) {
      navigate("products");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${selectedProductId}`);
        const data = await res.json();
        if (!cancelled) setProduct(data.product ?? null);
      } catch {
        if (!cancelled) pushToast({ title: "Couldn't load product", variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedProductId, navigate, pushToast]);

  const onDelete = async () => {
    if (!product) return;
    try {
      await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      pushToast({ title: "Product deleted", variant: "success" });
      setActiveTab("products");
    } catch {
      pushToast({ title: "Couldn't delete product", variant: "destructive" });
    }
  };

  return (
    <Screen bottomPad="cta">
      <ScreenHeader
        showBack
        right={
          product && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  aria-label="Delete product"
                  className="flex h-9 w-9 items-center justify-center rounded-full active:bg-foreground/5"
                >
                  <Trash2 className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-sm rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display text-2xl">
                    Delete product?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {product.name} will be permanently removed. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col gap-2">
                  <AlertDialogCancel className="rounded-full h-12 mt-1">
                    Keep
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="rounded-full h-12 bg-destructive text-white hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        }
      />

      {loading ? (
        <div className="px-5">
          <Skeleton className="aspect-[4/5] rounded-3xl" />
        </div>
      ) : !product ? (
        <div className="px-5 py-16 text-center text-muted-foreground">
          Product not found.
        </div>
      ) : (
        <>
          {/* Gallery */}
          <div className="px-5">
            <div className="relative overflow-hidden rounded-3xl bg-secondary aspect-[4/5]">
              {product.images?.[activeImg] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[activeImg]}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-foreground/40 text-[12px] uppercase tracking-widest">
                    No image
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={
                      "shrink-0 h-16 w-16 overflow-hidden rounded-xl ring-1 transition " +
                      (i === activeImg ? "ring-foreground" : "ring-border")
                    }
                    aria-label={`View image ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="px-5 mt-5">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-display text-[28px] leading-tight flex-1">
                {product.name}
              </h1>
              <button
                onClick={() => navigate("edit-product")}
                className="shrink-0 flex h-9 items-center gap-1.5 px-3 rounded-full bg-foreground/5 text-foreground text-[12px] font-medium active:scale-95 transition"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            </div>
            <p className="text-[20px] font-medium mt-1">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>

          {/* Meta */}
          <div className="px-5 mt-5">
            <dl className="divide-y divide-border rounded-2xl bg-secondary/40 px-4">
              <MetaRow label="Category" value={product.category} />
              {product.color && <MetaRow label="Color" value={product.color} />}
              {product.sizeRange && <MetaRow label="Size" value={product.sizeRange} />}
              {product.description && (
                <MetaRow label="Description" value={product.description} multiline />
              )}
            </dl>
          </div>

          <div className="flex-1" />

          {/* CTA */}
          <PrimaryCTA
            onClick={() => startStudio(product)}
            icon={<Sparkles className="h-5 w-5" />}
          >
            Create Studio
          </PrimaryCTA>
        </>
      )}
    </Screen>
  );
}

function MetaRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex py-3 gap-4">
      <dt className="shrink-0 w-24 text-[12px] uppercase tracking-wide text-muted-foreground pt-0.5">
        {label}
      </dt>
      <dd
        className={
          "text-[14px] text-foreground flex-1 " +
          (multiline ? "whitespace-pre-line" : "")
        }
      >
        {value}
      </dd>
    </div>
  );
}
