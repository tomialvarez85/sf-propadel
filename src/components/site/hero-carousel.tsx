"use client";

import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { HomeBanner } from "@/lib/home-data";

function BannerSlide({ banner }: { banner: HomeBanner }) {
  const content = (
    <div className="bg-muted relative aspect-[16/5] w-full overflow-hidden rounded-xl">
      <Image
        src={banner.imagen}
        alt={banner.titulo ?? ""}
        fill
        priority
        className="object-cover"
      />
      {banner.titulo && (
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
          <h2 className="text-xl font-semibold text-white sm:text-3xl">
            {banner.titulo}
          </h2>
        </div>
      )}
    </div>
  );

  return banner.link ? <Link href={banner.link}>{content}</Link> : content;
}

export function HeroCarousel({ banners }: { banners: HomeBanner[] }) {
  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
      className="mx-auto max-w-6xl px-6 pt-8"
    >
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            <BannerSlide banner={banner} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
}
