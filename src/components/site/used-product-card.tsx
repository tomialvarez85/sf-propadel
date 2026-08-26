"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import type { UsedProductCardData } from "@/lib/used-product-query";
import { formatCurrency, getDiscountPercent, INSTALLMENTS } from "@/lib/format";

/** Visually similar to `ProductCard`, but fully independent — no shared
 * type, no shared query. Adds a truncated description line that the
 * standard card deliberately omits, and always shows the "Usado" badge
 * (every product here is one, by construction — see used-product-query.ts). */
export function UsedProductCard({
  product,
}: {
  product: UsedProductCardData;
}) {
  const { addItem } = useCart();
  const discountPercent = getDiscountPercent(
    product.precio,
    product.precioAnterior,
  );
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
    <Card className="h-full gap-3 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <Link
        href={`/productos/${product.slug}`}
        className="focus-visible:ring-ring/50 flex h-full flex-col rounded-t-xl outline-none focus-visible:ring-3"
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
            <Badge variant="secondary">Usado</Badge>
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col gap-1 pb-2">
          <h3 className="line-clamp-2 min-h-10 text-sm font-medium">
            {product.nombre}
          </h3>

          {product.descripcion && (
            <p className="text-muted-foreground line-clamp-3 text-xs">
              {product.descripcion}
            </p>
          )}

          <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-1">
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

      <div className="px-4 pb-4">
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
  );
}
