"use client";

import Link from "next/link";
import { HeartOff } from "lucide-react";

import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";

export function FavoritesList() {
  const { items, hydrated } = useWishlist();

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <HeartOff className="text-muted-foreground size-10" />
        <p className="text-muted-foreground max-w-sm">
          Todavía no agregaste productos a tus favoritos. Tocá el corazón en
          cualquier producto para guardarlo acá.
        </p>
        <Button asChild>
          <Link href="/productos">Ver productos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
