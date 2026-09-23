"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { ScreenHeader } from "@/components/studio/screen-header";
import { PrimaryCTA } from "@/components/studio/cta";
import { CATEGORY_OPTIONS } from "@/lib/presets";
import { Camera, X, Loader2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AddProductScreenProps {
  editing?: boolean;
}

export function AddProductScreen({ editing }: AddProductScreenProps) {
  const { navigate, selectedProductId, startStudio, pushToast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Shirts");
  const [price, setPrice] = useState("");
  const [color, setColor] = useState("");
  const [sizeRange, setSizeRange] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  // Load existing if editing
  useEffect(() => {
    if (!editing || !selectedProductId) return;
    (async () => {
      try {
        const res = await fetch(`/api/products/${selectedProductId}`);
        const data = await res.json();
        const p: Product | undefined = data.product;
        if (p) {
          setExistingId(p.id);
          setName(p.name);
          setCategory(p.category);
          setPrice(String(p.price));
          setColor(p.color ?? "");
          setSizeRange(p.sizeRange ?? "");
          setDescription(p.description ?? "");
          setImages(p.images ?? []);
        }
      } catch {
        // ignore
      }
    })();
  }, [editing, selectedProductId]);

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        // Convert to base64 data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl, name: name || "product" }),
        });
        const data = await res.json();
        if (data.url) setImages((prev) => [...prev, data.url]);
      }
    } catch {
      pushToast({
        title: "That photo couldn't be uploaded.",
        description: "Try another image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    if (!name.trim() || !category || price === "") {
      pushToast({
        title: "Almost there",
        description: "Name, category and price are required.",
        variant: "destructive",
      });
      return;
    }
    if (images.length === 0) {
      pushToast({
        title: "Add a photo",
        description: "At least one product photo is required.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        category,
        price: Number(price) || 0,
        color: color || null,
        sizeRange: sizeRange || null,
        description: description || null,
        images,
      };
      const url = existingId
        ? `/api/products/${existingId}`
        : "/api/products";
      const method = existingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.product) {
        pushToast({
          title: existingId ? "Product updated" : "Product saved",
          variant: "success",
        });
        if (editing) {
          navigate("product-detail");
        } else {
          // Offer to go to studio directly
          startStudio(data.product);
        }
      } else {
        throw new Error("Save failed");
      }
    } catch {
      pushToast({
        title: "Couldn't save product",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen bottomPad="cta">
      <ScreenHeader showBack title={editing ? "Edit product" : "Add product"} />

      <div className="px-5 pt-2 pb-2">
        <h1 className="font-display text-[26px] leading-tight">
          {editing ? "Edit your product" : "Add your product"}
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          The minimum to start a studio shoot.
        </p>
      </div>

      {/* Photo uploader */}
      <div className="px-5 mt-3">
        <label className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
          Photos
        </label>
        <div className="mt-2 grid grid-cols-3 gap-2.5">
          {/* Existing images */}
          {images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-secondary ring-1 ring-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                aria-label="Remove image"
                className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {/* Add button */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={cn(
              "aspect-[4/5] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-muted-foreground active:scale-[0.98] transition",
              uploading && "opacity-60",
            )}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Camera className="h-6 w-6" strokeWidth={1.5} />
                <span className="text-[11px] font-medium uppercase tracking-wide">
                  Add photo
                </span>
              </>
            )}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        <p className="text-[11px] text-muted-foreground mt-2">
          Front, back and detail shots work best.
        </p>
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
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-12 rounded-xl bg-secondary px-4 text-[15px] outline-none focus:ring-2 ring-foreground/30 transition appearance-none"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
        <div className="grid grid-cols-2 gap-3">
          <Field label="Color">
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="White"
              className="w-full h-12 rounded-xl bg-secondary px-4 text-[15px] outline-none focus:ring-2 ring-foreground/30 transition"
            />
          </Field>
          <Field label="Sizes">
            <input
              value={sizeRange}
              onChange={(e) => setSizeRange(e.target.value)}
              placeholder="S — XL"
              className="w-full h-12 rounded-xl bg-secondary px-4 text-[15px] outline-none focus:ring-2 ring-foreground/30 transition"
            />
          </Field>
        </div>
        <Field label="Description (optional)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Lightweight linen shirt with a relaxed fit."
            rows={3}
            className="w-full rounded-xl bg-secondary p-4 text-[15px] outline-none focus:ring-2 ring-foreground/30 transition resize-none"
          />
        </Field>
      </div>

      <div className="flex-1" />

      <PrimaryCTA
        onClick={save}
        loading={saving}
        disabled={uploading}
      >
        {editing ? "Save changes" : "Save product"}
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
