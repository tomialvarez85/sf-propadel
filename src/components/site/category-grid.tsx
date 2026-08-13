import Link from "next/link";
import Image from "next/image";

import { ImagePlaceholder } from "@/components/image-placeholder";
import type { HomeCategory } from "@/lib/home-data";

export function CategoryGrid({ categories }: { categories: HomeCategory[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/${category.slug}`}
          className="group focus-visible:ring-ring/50 block rounded-xl outline-none focus-visible:ring-3"
        >
          <div className="bg-muted relative aspect-square overflow-hidden rounded-xl">
            {category.imagen ? (
              <Image
                src={category.imagen}
                alt={category.nombre}
                fill
                quality={85}
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <ImagePlaceholder />
            )}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-4">
              <span className="text-sm font-semibold text-white sm:text-base">
                {category.nombre}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
