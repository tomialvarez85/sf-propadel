"use client";

import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import { Hero3DBackground } from "@/components/site/hero-3d-background";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useHero3DCapability } from "@/hooks/use-hero-3d-capability";
import type { HomeBanner } from "@/lib/home-data";

function BannerSlide({
  banner,
  hide2DBallFallback,
}: {
  banner: HomeBanner;
  hide2DBallFallback: boolean;
}) {
  const content = (
    <div className="bg-muted hero-corner-cut relative w-full overflow-hidden aspect-[16/9] lg:aspect-auto lg:h-[calc(100vh_-_var(--header-height))]">
      <Image
        src={banner.imagen}
        alt={banner.titulo ?? ""}
        fill
        priority
        quality={85}
        sizes="(min-width: 1152px) 1152px, 100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 z-20 size-[18px] sm:size-6 md:size-[30px] lg:size-10"
        style={{
          background:
            "linear-gradient(135deg, transparent 48%, var(--color-lime) 50%, var(--color-lime) 55%, transparent 57%)",
        }}
      />
      {!hide2DBallFallback && (
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="hero-ball-bounce text-primary pointer-events-none absolute top-[18%] right-[22%] size-20 opacity-[0.18]"
        >
          <circle cx="50" cy="50" r="48" fill="currentColor" />
          <path
            d="M6 34 Q50 12 94 34"
            fill="none"
            stroke="var(--color-background)"
            strokeWidth="3"
            opacity="0.5"
          />
          <path
            d="M6 66 Q50 88 94 66"
            fill="none"
            stroke="var(--color-background)"
            strokeWidth="3"
            opacity="0.5"
          />
        </svg>
      )}
      {banner.titulo && (
        <div className="absolute inset-0 z-20 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
          <h2 className="font-heading text-xl font-extrabold tracking-[-0.02em] text-white sm:text-3xl">
            {banner.titulo}
          </h2>
        </div>
      )}
    </div>
  );

  return banner.link ? (
    <Link
      href={banner.link}
      className="focus-visible:ring-ring/50 block outline-none focus-visible:ring-3"
    >
      {content}
    </Link>
  ) : (
    content
  );
}

export function HeroCarousel({ banners }: { banners: HomeBanner[] }) {
  const canRender3D = useHero3DCapability();

  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
      className="w-full"
    >
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            <BannerSlide banner={banner} hide2DBallFallback={!!canRender3D} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* z-20 to sit above the corner-cut gradient and title overlay, which
          share that layer inside each slide. */}
      <CarouselPrevious className="z-20" />
      <CarouselNext className="z-20" />
      <Hero3DBackground />
    </Carousel>
  );
}
