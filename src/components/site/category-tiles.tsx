import Link from "next/link";
// SafeImage: workaround temporal por el límite de transformaciones de Vercel
// (ver src/components/safe-image.tsx).
import { SafeImage as Image } from "@/components/safe-image";

import { ImagePlaceholder } from "@/components/image-placeholder";

export type CategoryTile = {
  key: string;
  nombre: string;
  href: string;
  imagen: string | null;
};

/**
 * Categorías destacadas del home — editables desde /admin/banners (HomeBlock
 * tipo TILE), ver DESIGN.md > Category Tiles. Mismo ancho de contenedor que
 * el banner; tarjetas 3:2 con separación pareja. En celular pasan a una fila
 * con scroll horizontal (cada tarjeta ocupa ~80% del ancho, así se ve que
 * hay más para deslizar).
 */
export function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <section className="mx-auto max-w-6xl pt-4 sm:px-6">
      <div className="category-tiles flex snap-x snap-mandatory scroll-px-6 [scrollbar-width:none] gap-3 overflow-x-auto px-6 pb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {tiles.map((tile) => {
          const external = /^https?:\/\//.test(tile.href);
          return (
            <Link
              key={tile.key}
              href={tile.href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="category-tile group focus-visible:ring-ring/50 relative block aspect-[3/2] w-[80%] shrink-0 snap-start overflow-hidden rounded-xl outline-none focus-visible:ring-3 sm:w-auto"
            >
              {tile.imagen ? (
                <Image
                  src={tile.imagen}
                  alt={tile.nombre}
                  fill
                  quality={85}
                  sizes="(min-width: 1200px) 357px, (min-width: 640px) 31vw, 80vw"
                  className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:scale-110"
                />
              ) : (
                <div className="bg-muted absolute inset-0">
                  <ImagePlaceholder />
                </div>
              )}
              {/* Degradado oscuro sutil solo abajo, para leer el título. */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent motion-safe:transition-colors motion-safe:duration-300 motion-safe:group-hover:from-black/75" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <span className="font-heading inline-block text-xl font-bold tracking-[-0.015em] text-white motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:-translate-y-1 sm:text-2xl">
                  {tile.nombre}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
