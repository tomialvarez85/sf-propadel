import Link from "next/link";
import Image from "next/image";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { WishlistButton } from "@/components/site/wishlist-button";
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
  const discountPercent = getDiscountPercent(
    product.precio,
    product.precioAnterior,
  );
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <div className="relative">
      <Link href={`/productos/${product.slug}`} className="block">
        <Card className="gap-3 overflow-hidden py-0 transition-shadow hover:shadow-md">
          <div className="bg-muted relative aspect-square">
            {product.imagen ? (
              <Image
                src={product.imagen}
                alt={product.nombre}
                fill
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder />
            )}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discountPercent !== null && (
                <Badge variant="destructive">-{discountPercent}%</Badge>
              )}
            </div>
          </div>

          <CardContent className="flex flex-col gap-1 pb-4">
            <h3 className="line-clamp-2 text-sm font-medium">
              {product.nombre}
            </h3>

            <div className="flex items-baseline gap-2">
              {discountPercent !== null && (
                <span className="text-muted-foreground text-xs line-through">
                  {formatCurrency(product.precioAnterior!)}
                </span>
              )}
              <span className="text-lg font-semibold">
                {formatCurrency(product.precio)}
              </span>
            </div>

            <span className="text-muted-foreground text-xs">
              {INSTALLMENTS} cuotas de{" "}
              {formatCurrency(product.precio / INSTALLMENTS)}
            </span>
          </CardContent>
        </Card>
      </Link>

      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
        <WishlistButton product={product} />
        {lowStock && <Badge variant="secondary">¡Últimas unidades!</Badge>}
      </div>
    </div>
  );
}
