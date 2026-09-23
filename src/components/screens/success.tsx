"use client";

import { useApp } from "@/lib/store";
import { Screen } from "@/components/studio/screen";
import { PrimaryCTA, SecondaryCTA } from "@/components/studio/cta";
import { Check } from "lucide-react";
import { formatPrice } from "@/lib/presets";

export function SuccessScreen() {
  const { studio, setActiveTab, resetStudio } = useApp();

  const productName = studio.product?.name ?? "Your product";
  const price = studio.product ? formatPrice(studio.product.price, studio.product.currency) : "";
  const cover = studio.currentImages.find((i) => i.selected)?.url ?? studio.currentImages[0]?.url;

  const onDone = () => {
    resetStudio();
    setActiveTab("shop");
  };

  const onView = () => {
    resetStudio();
    setActiveTab("shop");
  };

  return (
    <Screen noPadding noMaxWidth>
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-8 py-12 text-center">
        {/* Check badge */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-foreground/5 blur-2xl animate-pulse" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-foreground text-background animate-screen-in">
            <Check className="h-12 w-12" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="font-display text-[30px] leading-tight">
          Product published
        </h1>
        <p className="text-[15px] text-muted-foreground mt-2 max-w-xs">
          {productName} is now live in your shop.
        </p>

        {/* Preview card */}
        {cover && (
          <div className="mt-8 w-full max-w-xs">
            <div className="relative overflow-hidden rounded-3xl bg-secondary aspect-[4/5] shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt={productName} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute top-3 left-3">
                <span className="bg-background/90 backdrop-blur text-foreground text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full font-medium">
                  Live
                </span>
              </div>
            </div>
            <div className="mt-3 text-left">
              <p className="font-display text-[18px] leading-tight">{productName}</p>
              {price && <p className="text-[14px] text-muted-foreground mt-0.5">{price}</p>}
            </div>
          </div>
        )}

        <div className="mt-10 w-full max-w-md flex flex-col gap-2.5">
          <PrimaryCTA onClick={onView} className="static max-w-none">
            View Product
          </PrimaryCTA>
          <SecondaryCTA onClick={onDone} full variant="ghost">
            Done
          </SecondaryCTA>
        </div>
      </div>
    </Screen>
  );
}
