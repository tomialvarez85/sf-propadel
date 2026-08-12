"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/site/wishlist-button";
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/productos?marca=${brand.slug}`}
            className="text-muted-foreground hover:text-primary text-sm"
          >
            {brand.nombre}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{nombre}</h1>
        </div>
        <WishlistButton
          product={{ id, nombre, slug, precio, precioAnterior, stock, imagen }}
          variant="label"
          className="shrink-0"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          {discountPercent !== null && (
            <span className="text-muted-foreground text-base line-through">
              {formatCurrency(precioAnterior!)}
            </span>
          )}
          <span className="text-3xl font-semibold">
            {formatCurrency(precio)}
          </span>
          {discountPercent !== null && (
            <Badge variant="destructive">-{discountPercent}%</Badge>
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
          "text-sm font-medium",
          effectiveStock <= 0
            ? "text-destructive"
            : effectiveStock <= 3
              ? "text-destructive"
              : "text-muted-foreground",
        )}
      >
        {stockLabel}
      </p>

      {whatsappHref && effectiveStock > 0 ? (
        <Button asChild size="lg" className="w-full sm:w-auto">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            Comprar por WhatsApp
          </a>
        </Button>
      ) : (
        <Button size="lg" disabled className="w-full sm:w-auto">
          Comprar por WhatsApp
        </Button>
      )}
    </div>
  );
}
