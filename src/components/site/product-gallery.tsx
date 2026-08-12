"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { ImagePlaceholder } from "@/components/image-placeholder";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  productName,
}: {
  images: { id: string; url: string }[];
  productName: string;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (images.length === 0) {
    return (
      <div className="bg-muted relative aspect-square rounded-xl">
        <ImagePlaceholder iconClassName="size-16" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Carousel setApi={setApi}>
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image.id}>
              <div className="bg-muted relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={image.url}
                  alt={productName}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>

      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg ring-2 ring-transparent",
                current === index && "ring-primary",
              )}
            >
              <Image src={image.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
