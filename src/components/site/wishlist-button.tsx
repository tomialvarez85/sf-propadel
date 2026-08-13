"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWishlist, type WishlistItem } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({
  product,
  variant = "icon",
  className,
}: {
  product: WishlistItem;
  variant?: "icon" | "label";
  className?: string;
}) {
  const { isFavorite, toggle } = useWishlist();
  const favorite = isFavorite(product.id);
  const label = favorite ? "Quitar de favoritos" : "Agregar a favoritos";

  if (variant === "label") {
    return (
      <Button
        type="button"
        variant="outline"
        aria-pressed={favorite}
        onClick={() => toggle(product)}
        className={className}
      >
        <Heart
          className={cn(
            "transition-colors duration-200",
            favorite && "fill-destructive text-destructive animate-heart-pop",
          )}
        />
        {favorite ? "En favoritos" : "Agregar a favoritos"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label={label}
      aria-pressed={favorite}
      onClick={() => toggle(product)}
      className={cn("size-8 rounded-full shadow-sm", className)}
    >
      <Heart
        className={cn(
          "size-4 transition-colors duration-200",
          favorite && "fill-destructive text-destructive animate-heart-pop",
        )}
      />
    </Button>
  );
}
