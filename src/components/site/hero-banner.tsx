import Link from "next/link";
import Image from "next/image";

// Fijo en el código, no editable desde el admin (antes SiteSettings.hero* /
// /admin/banners, ambos eliminados) — ver DESIGN.md > Hero Banner. Cambiar
// esto significa reemplazar /public/hero/banner-principal.jpg y estos
// valores, y redeployar.
const HERO_IMAGEN = "/hero/banner-principal.jpg";
const HERO_TITULO = "Nueva colección de paletas 2026";
const HERO_LINK = "/productos?categoria=paletas";

export function HeroBanner() {
  const content = (
    <div className="bg-muted relative w-full overflow-hidden h-[calc(100dvh_-_var(--header-height))]">
      <Image
        src={HERO_IMAGEN}
        alt={HERO_TITULO}
        fill
        priority
        quality={85}
        sizes="(min-width: 1152px) 1152px, 100vw"
        className="object-cover"
      />
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
      <div className="absolute inset-0 z-20 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
        <h2 className="font-heading text-xl font-extrabold tracking-[-0.02em] text-white sm:text-3xl">
          {HERO_TITULO}
        </h2>
      </div>
    </div>
  );

  return (
    <Link
      href={HERO_LINK}
      className="focus-visible:ring-ring/50 block outline-none focus-visible:ring-3"
    >
      {content}
    </Link>
  );
}
