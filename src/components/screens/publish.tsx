"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { PrimaryCTA } from "@/components/studio/cta";
import { formatPrice } from "@/lib/presets";
import { Check, RefreshCw, Star, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublishScreen() {
  const { studio, navigate, addListing, pushToast, setActiveTab } = useApp();

  const selected = studio.currentImages.filter((i) => i.selected);
  const [mainIdx, setMainIdx] = useState(0);
  const [name, setName] = useState(studio.product?.name ?? "");
  const [price, setPrice] = useState(
    studio.product ? String(studio.product.price) : "",
  );
  const [description, setDescription] = useState("");
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    // Auto-generate description on first mount
    if (!studio.product) return;
    let cancelled = false;
    (async () => {
      setGeneratingDesc(true);
      try {
        const res = await fetch("/api/studio/describe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: studio.product.name,
            category: studio.product.category,
            price: Number(price) || 0,
            scene: studio.scene,
            style: studio.style,
          }),
        });
        const data = await res.json();
        if (!cancelled && data.description) setDescription(data.description);
      } catch {
        if (!cancelled)
          setDescription(
            "A refined piece with a relaxed silhouette, designed for everyday wear.",
          );
      } finally {
        if (!cancelled) setGeneratingDesc(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (selected.length === 0 || !studio.product) {
    return (
      <Screen>
        <ScreenHeader showBack title="Publish" />
        <div className="px-5 py-16 text-center text-muted-foreground">
          Select at least one image to publish.
          <button
            onClick={() => navigate("results")}
            className="block mt-4 underline text-foreground"
          >
            Back to results
          </button>
        </div>
      </Screen>
    );
  }

  const regenerateDescription = async () => {
    setGeneratingDesc(true);
    try {
      const res = await fetch("/api/studio/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: name || studio.product.name,
          category: studio.product.category,
          price: Number(price) || 0,
          scene: studio.scene,
          style: studio.style,
        }),
      });
      const data = await res.json();
      if (data.description) setDescription(data.description);
    } catch {
      pushToast({ title: "Couldn't generate description", variant: "destructive" });
    } finally {
      setGeneratingDesc(false);
    }
  };

  const onPublish = async () => {
    if (publishing) return;
    if (!name.trim() || !price) {
      pushToast({
        title: "Missing details",
        description: "Name and price are required.",
        variant: "destructive",
      });
      return;
    }
    setPublishing(true);
    try {
      const images = selected.map((i) => i.url);
      const mainImage = images[mainIdx] ?? images[0];
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: studio.product.id,
          name,
          price: Number(price) || 0,
          description,
          mainImage,
          images,
        }),
      });
      const data = await res.json();
      if (data.listing) {
        addListing(data.listing);
        pushToast({ title: "Product published", variant: "success" });
        // navigate to success screen
        navigate("success");
      } else {
        throw new Error("Publish failed");
      }
    } catch {
      pushToast({
        title: "We couldn't publish your product.",
        description: "Nothing has been lost. Try again.",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Screen bottomPad="cta">
      <ScreenHeader showBack title="Publish Product" />

      <div className="px-5 pt-2">
        <h1 className="font-display text-[28px] leading-tight">
          Your product is ready
        </h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Review and publish to your shop.
        </p>
      </div>

      {/* Main image preview */}
      <div className="px-5 mt-5">
        <div className="relative overflow-hidden rounded-3xl bg-secondary aspect-[4/5]">
          {selected[mainIdx] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected[mainIdx].url}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute top-3 left-3">
            <span className="bg-foreground text-background text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full font-medium">
              Main image
            </span>
          </div>
        </div>
      </div>

      {/* Image picker */}
      <div className="px-5 mt-4">
        <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
          Images · {selected.length} selected
        </p>
        <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
          {selected.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setMainIdx(i)}
              className={cn(
                "relative shrink-0 h-20 w-16 overflow-hidden rounded-xl ring-1 transition",
                i === mainIdx ? "ring-2 ring-foreground" : "ring-border",
              )}
              aria-label={`Set as main image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              {i === mainIdx && (
                <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                  <Star className="h-3 w-3 fill-background" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="px-5 mt-5 space-y-4">
        <Field label="Product name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="White Linen Shirt"
            className="w-full h-12 rounded-xl bg-secondary px-4 text-[15px] outline-none focus:ring-2 ring-foreground/30 transition"
          />
        </Field>
        <Field label="Price (€)">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">
              €
            </span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              placeholder="49"
              className="w-full h-12 rounded-xl bg-secondary pl-9 pr-4 text-[15px] outline-none focus:ring-2 ring-foreground/30 transition"
            />
          </div>
        </Field>
        <Field label="Description">
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Lightweight linen shirt with a relaxed fit..."
              className="w-full rounded-xl bg-secondary p-4 pr-12 text-[15px] outline-none focus:ring-2 ring-foreground/30 transition resize-none"
            />
            <button
              onClick={regenerateDescription}
              disabled={generatingDesc}
              aria-label="Regenerate description"
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur active:scale-95 transition disabled:opacity-50"
            >
              <RefreshCw
                className={cn("h-4 w-4", generatingDesc && "animate-spin")}
              />
            </button>
          </div>
          {generatingDesc && (
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Generating description&hellip;
            </p>
          )}
        </Field>
      </div>

      <div className="flex-1" />

      <PrimaryCTA onClick={onPublish} loading={publishing} icon={<Check className="h-5 w-5" />}>
        Publish Product
      </PrimaryCTA>
    </Screen>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
