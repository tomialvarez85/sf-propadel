"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getImageProps } from "next/image";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { HomeBlockItem } from "@/lib/home-blocks";
import { SITE_NAME } from "@/lib/seo";
import { cn } from "@/lib/utils";

// Slides editables desde /admin/inicio (modelo HomeBlock, tipo BANNER).
// Alto fijo de 380px en todos los tamaños de pantalla — ver DESIGN.md >
// Hero Banner.

const AUTOPLAY_MS = 6000;

/**
 * Imagen del slide con "art direction": la versión de celular (si se cargó)
 * por debajo de md, la de computadora desde md. Usa <picture> vía
 * getImageProps porque next/image no permite elegir archivo por breakpoint.
 *
 * Incluye el mismo fallback que SafeImage (workaround temporal por el límite
 * de transformaciones de Vercel): si la versión optimizada falla, se vuelve a
 * pedir la imagen original sin optimizar.
 */
function SlidePicture({
  slide,
  priority,
}: {
  slide: HomeBlockItem;
  priority: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const common = {
    alt: slide.titulo ?? "",
    fill: true,
    quality: 85,
    sizes: "100vw",
    priority,
    unoptimized: failed,
  } as const;

  const desktop = getImageProps({ ...common, src: slide.imagen }).props;
  const {
    props: { srcSet: mobileSrcSet, ...imgProps },
  } = getImageProps({ ...common, src: slide.imagenMobile ?? slide.imagen });

  // Errores ocurridos antes de hidratar no disparan onError: los detectamos
  // al montar revisando si la imagen terminó de cargar sin dimensiones.
  const checkEarlyError = useCallback(
    (img: HTMLImageElement | null) => {
      if (img && !failed && img.complete && img.naturalWidth === 0) {
        setFailed(true);
      }
    },
    [failed],
  );

  return (
    <picture>
      <source
        media="(min-width: 768px)"
        srcSet={desktop.srcSet ?? desktop.src}
      />
      {/* Patrón oficial de art direction con getImageProps. */}
      <img
        {...imgProps}
        alt={imgProps.alt}
        srcSet={mobileSrcSet}
        ref={checkEarlyError}
        onError={() => setFailed(true)}
        className="object-cover object-center"
      />
    </picture>
  );
}

function Slide({ slide, index }: { slide: HomeBlockItem; index: number }) {
  const content = (
    <div className="relative h-[380px] w-full overflow-hidden bg-white">
      <SlidePicture slide={slide} priority={index === 0} />
      {slide.titulo && (
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6 pb-10">
          <p className="font-heading mx-auto w-full max-w-6xl text-xl font-extrabold tracking-[-0.02em] text-white sm:text-3xl">
            {slide.titulo}
          </p>
        </div>
      )}
    </div>
  );

  if (!slide.link) return content;

  const external = /^https?:\/\//.test(slide.link);
  return (
    <Link
      href={slide.link}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={slide.titulo || `Ver promoción ${index + 1}`}
      className="focus-visible:ring-ring/50 block outline-none focus-visible:ring-3 focus-visible:ring-inset"
    >
      {content}
    </Link>
  );
}

export function HeroBanner({ slides }: { slides: HomeBlockItem[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  // Sin autoplay para quien pidió reducir movimiento en su sistema.
  const [plugins] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? []
      : [Autoplay({ delay: AUTOPLAY_MS, stopOnMouseEnter: true })],
  );

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  // El h1 del home: los textos de los slides son opcionales y cambian con
  // cada promo, así que el título de la página no depende de ellos.
  const heading = (
    <h1 className="sr-only">{SITE_NAME} — Tienda de pádel online</h1>
  );

  if (slides.length === 0) return heading;

  return (
    <section className="relative w-full">
      {heading}

      {slides.length === 1 ? (
        <Slide slide={slides[0]} index={0} />
      ) : (
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          plugins={plugins}
          aria-roledescription="carrusel"
        >
          {/* -ml-0/pl-0: los slides van pegados, sin el gap por defecto. */}
          <CarouselContent className="-ml-0">
            {slides.map((slide, index) => (
              <CarouselItem
                key={slide.id}
                className="pl-0"
                aria-roledescription="slide"
                aria-label={`${index + 1} de ${slides.length}`}
              >
                <Slide slide={slide} index={index} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Ir al slide ${index + 1}`}
              aria-current={current === index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-200",
                current === index
                  ? "bg-lime w-6"
                  : "w-2 bg-white/70 hover:bg-white",
              )}
            />
          ))}
        </div>
      )}

      {/* Angled Corner motif (see DESIGN.md > Shapes) — a solid-lime quarter-disc
          pie slice centered on the true corner, curving concave into the image. */}
      <svg
        aria-hidden
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        className="pointer-events-none absolute right-0 bottom-0 z-20 size-[18px] sm:size-6 md:size-[30px] lg:size-10"
      >
        <path d="M1,0 A1,1 0 0,0 0,1 L1,1 Z" fill="var(--color-lime)" />
      </svg>
    </section>
  );
}
