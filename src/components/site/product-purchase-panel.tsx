"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { formatCurrency, getDiscountPercent, INSTALLMENTS } from "@/lib/format";

type Variant = { id: string; tipo: string; valor: string; stock: number };

function groupVariants(variants: Variant[]) {
  const groups = new Map<string, Variant[]>();
  for (const variant of variants) {
    const group = groups.get(variant.tipo) ?? [];
    group.push(variant);
    groups.set(variant.tipo, group);
  }
  return [...groups.entries()];
}

export function ProductPurchasePanel({
  id,
  slug,
  nombre,
  imagen,
  brand,
  precio,
  precioAnterior,
  stock,
  variants,
  whatsapp,
}: {
  id: string;
  slug: string;
  nombre: string;
  imagen: string | null;
  brand: { nombre: string; slug: string };
  precio: number;
  precioAnterior: number | null;
  stock: number;
  variants: Variant[];
  whatsapp: string | null;
}) {
  const variantGroups = useMemo(() => groupVariants(variants), [variants]);

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      variantGroups.map(([tipo, options]) => [
        tipo,
        (options.find((o) => o.stock > 0) ?? options[0]).valor,
      ]),
    ),
  );

  const discountPercent = getDiscountPercent(precio, precioAnterior);

  const selectedVariants = variantGroups.map(([tipo, options]) =>
    options.find((o) => o.valor === selected[tipo])!,
  );

  const effectiveStock =
    selectedVariants.length > 0
      ? Math.min(...selectedVariants.map((v) => v.stock))
      : stock;

  const stockLabel =
    effectiveStock <= 0
      ? "Sin stock"
      : effectiveStock <= 3
        ? `¡Últimas unidades! (${effectiveStock} disponibles)`
        : `${effectiveStock} disponibles`;

  const whatsappHref = useMemo(() => {
    if (!whatsapp) return null;
    const variantText = variantGroups
      .map(([tipo]) => `${tipo}: ${selected[tipo]}`)
      .join(", ");
    const message = variantText
      ? `Hola! Quiero comprar "${nombre}" (${variantText})`
      : `Hola! Quiero comprar "${nombre}"`;
    const phone = whatsapp.replace(/\D/g, "");
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [whatsapp, nombre, variantGroups, selected]);

  const { addItem } = useCart();

  function handleAddToCart() {
    addItem({
      productId: id,
      nombre,
      slug,
      precio,
      imagen,
      variants: selectedVariants.map((variant) => ({
        tipo: variant.tipo,
        valor: variant.valor,
      })),
    });
    toast.success("Agregado al carrito", { description: nombre });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href={`/productos?marca=${brand.slug}`}
          className="text-muted-foreground hover:text-primary text-sm"
        >
          {brand.nombre}
        </Link>
        <h1 className="font-heading text-2xl font-bold tracking-[-0.015em]">
          {nombre}
        </h1>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {discountPercent !== null && (
            <span className="text-muted-foreground text-base line-through">
              {formatCurrency(precioAnterior!)}
            </span>
          )}
          <span className="font-heading bg-primary text-primary-foreground inline-flex items-center rounded-md px-3 py-1 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">
            {formatCurrency(precio)}
          </span>
          {discountPercent !== null && (
            <Badge variant="lime">-{discountPercent}%</Badge>
          )}
        </div>
        <span className="text-muted-foreground text-sm">
          {INSTALLMENTS} cuotas de {formatCurrency(precio / INSTALLMENTS)}
        </span>
      </div>

      {variantGroups.map(([tipo, options]) => (
        <div key={tipo} className="flex flex-col gap-2">
          <span className="text-sm font-semibold">{tipo}</span>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const isSelected = selected[tipo] === option.valor;
              const outOfStock = option.stock <= 0;
              return (
                <Button
                  key={option.id}
                  type="button"
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  disabled={outOfStock}
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [tipo]: option.valor }))
                  }
                  className={cn(outOfStock && "line-through")}
                >
                  {option.valor}
                </Button>
              );
            })}
          </div>
        </div>
      ))}

      <p
        className={cn(
          "text-sm font-medium transition-colors duration-200",
          effectiveStock <= 3 ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {stockLabel}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <Button
          type="button"
          size="lg"
          disabled={effectiveStock <= 0}
          onClick={handleAddToCart}
          className="font-heading h-12 w-full px-6 text-base font-bold shadow-lg shadow-primary/25 sm:w-auto"
        >
          Agregar al carrito
        </Button>

        {whatsappHref && effectiveStock > 0 ? (
          <Button
            asChild
            variant="outline"
            size="lg"
            className="font-heading h-12 w-full px-6 text-base font-bold sm:w-auto"
          >
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              Comprar por WhatsApp
            </a>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            disabled
            className="font-heading h-12 w-full px-6 text-base font-bold sm:w-auto"
          >
            Comprar por WhatsApp
          </Button>
        )}
      </div>
    </div>
  );
}
