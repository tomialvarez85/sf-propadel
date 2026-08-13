"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import { GENERO_OPTIONS } from "@/lib/product-genero-options";
import type { FilterOption } from "@/lib/product-query";

function parseListParam(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

type Chip = { key: string; label: string; onRemove: () => void };

export function ActiveFilters({
  categories,
  brands,
}: {
  categories: FilterOption[];
  brands: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeCategories = parseListParam(searchParams.get("categoria"));
  const activeBrands = parseListParam(searchParams.get("marca"));
  const activeGenero = searchParams.get("genero");
  const precioMin = searchParams.get("precioMin");
  const precioMax = searchParams.get("precioMax");
  const soloOfertas = searchParams.get("oferta") === "1";

  const chips: Chip[] = [];

  for (const slug of activeCategories) {
    const category = categories.find((option) => option.slug === slug);
    if (!category) continue;
    chips.push({
      key: `categoria-${slug}`,
      label: `Categoría: ${category.nombre}`,
      onRemove: () =>
        navigate((params) => {
          const next = activeCategories.filter((value) => value !== slug);
          if (next.length > 0) params.set("categoria", next.join(","));
          else params.delete("categoria");
        }),
    });
  }

  for (const slug of activeBrands) {
    const brand = brands.find((option) => option.slug === slug);
    if (!brand) continue;
    chips.push({
      key: `marca-${slug}`,
      label: `Marca: ${brand.nombre}`,
      onRemove: () =>
        navigate((params) => {
          const next = activeBrands.filter((value) => value !== slug);
          if (next.length > 0) params.set("marca", next.join(","));
          else params.delete("marca");
        }),
    });
  }

  const generoOption = GENERO_OPTIONS.find(
    (option) => option.value === activeGenero,
  );
  if (generoOption) {
    chips.push({
      key: "genero",
      label: `Género: ${generoOption.label}`,
      onRemove: () => navigate((params) => params.delete("genero")),
    });
  }

  if (precioMin || precioMax) {
    const min = precioMin ? formatCurrency(Number(precioMin)) : "$0";
    const max = precioMax ? formatCurrency(Number(precioMax)) : "sin tope";
    chips.push({
      key: "precio",
      label: `Precio: ${min} - ${max}`,
      onRemove: () =>
        navigate((params) => {
          params.delete("precioMin");
          params.delete("precioMax");
        }),
    });
  }

  if (soloOfertas) {
    chips.push({
      key: "oferta",
      label: "Solo ofertas",
      onRemove: () => navigate((params) => params.delete("oferta")),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="border-primary/30 bg-primary/5 text-primary animate-in fade-in-0 zoom-in-95 inline-flex items-center gap-1.5 rounded-4xl border py-1 pr-1.5 pl-3 text-xs font-medium duration-150"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Quitar filtro: ${chip.label}`}
            className="hover:bg-primary/10 flex size-4 items-center justify-center rounded-full transition-colors"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => router.push(pathname)}
        className="text-muted-foreground hover:text-primary text-xs font-medium underline-offset-2 transition-colors hover:underline"
      >
        Limpiar todo
      </button>
    </div>
  );
}
