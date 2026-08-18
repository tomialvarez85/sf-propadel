"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WishlistButton } from "@/components/site/wishlist-button";
import { useCart } from "@/hooks/use-cart";
import {
  formatCurrency,
  getDiscountPercent,
  INSTALLMENTS,
  LOW_STOCK_THRESHOLD,
} from "@/lib/format";

export type ProductCardData = {
  id: string;
  nombre: string;
  slug: string;
  precio: number;
  precioAnterior: number | null;
  stock: number;
  imagen: string | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const discountPercent = getDiscountPercent(
    product.precio,
    product.precioAnterior,
  );
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
  const outOfStock = product.stock <= 0;

  function handleAddToCart() {
    addItem({
      productId: product.id,
      nombre: product.nombre,
      slug: product.slug,
      precio: product.precio,
      imagen: product.imagen,
    });
    toast.success("Agregado al carrito", { description: product.nombre });
  }

  return (
    <div className="relative h-full">
      <Card className="h-full gap-3 overflow-hidden py-0 transition-shadow hover:shadow-md">
        <Link
          href={`/productos/${product.slug}`}
          className="focus-visible:ring-ring/50 block rounded-t-xl outline-none focus-visible:ring-3"
        >
          <div className="bg-muted relative aspect-square">
            {product.imagen ? (
              <Image
                src={product.imagen}
                alt={product.nombre}
                fill
                quality={85}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder />
            )}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discountPercent !== null && (
                <Badge variant="lime">-{discountPercent}%</Badge>
              )}
            </div>
          </div>

          <CardContent className="flex flex-col gap-1 pb-2">
            <h3 className="line-clamp-2 min-h-10 text-sm font-medium">
              {product.nombre}
            </h3>

            <div className="flex flex-wrap items-baseline gap-2">
              {discountPercent !== null && (
                <span className="text-muted-foreground text-xs line-through">
                  {formatCurrency(product.precioAnterior!)}
                </span>
              )}
              <span className="font-heading text-xl font-extrabold tracking-[-0.01em] break-words">
                {formatCurrency(product.precio)}
              </span>
            </div>

            <span className="text-muted-foreground text-xs">
              {INSTALLMENTS} cuotas de{" "}
              {formatCurrency(product.precio / INSTALLMENTS)}
            </span>
          </CardContent>
        </Link>

        <div className="mt-auto px-4 pb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            disabled={outOfStock}
            onClick={handleAddToCart}
          >
            {outOfStock ? "Sin stock" : "Agregar al carrito"}
          </Button>
        </div>
      </Card>

      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
        <WishlistButton product={product} />
        {lowStock && <Badge variant="secondary">¡Últimas unidades!</Badge>}
      </div>
    </div>
  );
}
