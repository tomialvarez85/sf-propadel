import Link from "next/link";
import Image from "next/image";

import { ImagePlaceholder } from "@/components/image-placeholder";

export type CategoryTile = {
  key: string;
  nombre: string;
  href: string;
  imagen: string | null;
};

export function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <div className="category-tiles grid w-full grid-cols-1 sm:grid-cols-3">
      {tiles.map((tile) => (
        <Link
          key={tile.key}
          href={tile.href}
          className="category-tile group focus-visible:ring-ring/50 relative block aspect-[15/14] overflow-hidden outline-none focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-inset sm:aspect-[20/21]"
        >
          {tile.imagen ? (
            <Image
              src={tile.imagen}
              alt={tile.nombre}
              fill
              quality={85}
              sizes="(min-width: 640px) 34vw, 100vw"
              className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:scale-110"
            />
          ) : (
            <div className="bg-muted absolute inset-0">
              <ImagePlaceholder />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 motion-safe:transition-colors motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:bg-black/65" />
          <div className="absolute inset-0 flex items-end p-6 sm:p-8">
            <span className="font-heading inline-block text-2xl font-bold tracking-[-0.015em] text-white motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:-translate-y-1 sm:text-3xl">
              {tile.nombre}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
