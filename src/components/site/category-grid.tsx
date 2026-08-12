"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { ImagePlaceholder } from "@/components/image-placeholder";
import type { HomeCategory } from "@/lib/home-data";

export function CategoryGrid({ categories }: { categories: HomeCategory[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, delay: index * 0.06 }}
        >
          <Link href={`/${category.slug}`} className="group block">
            <div className="bg-muted relative aspect-square overflow-hidden rounded-xl">
              {category.imagen ? (
                <Image
                  src={category.imagen}
                  alt={category.nombre}
                  fill
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
        </motion.div>
      ))}
    </div>
  );
}
