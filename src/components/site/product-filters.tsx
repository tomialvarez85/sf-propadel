"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { FilterOption } from "@/lib/product-query";

function parseListParam(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

function FilterForm({
  categories,
  brands,
  hideCategoryFilter,
  onNavigate,
}: {
  categories: FilterOption[];
  brands: FilterOption[];
  hideCategoryFilter: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategories = parseListParam(searchParams.get("categoria"));
  const activeBrands = parseListParam(searchParams.get("marca"));
  const soloOfertas = searchParams.get("oferta") === "1";

  const [precioMin, setPrecioMin] = useState(
    searchParams.get("precioMin") ?? "",
  );
  const [precioMax, setPrecioMax] = useState(
    searchParams.get("precioMax") ?? "",
  );

  function navigate(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    onNavigate?.();
  }

  function toggleListValue(
    key: "categoria" | "marca",
    slug: string,
    active: string[],
  ) {
    navigate((params) => {
      const next = active.includes(slug)
        ? active.filter((value) => value !== slug)
        : [...active, slug];
      if (next.length > 0) {
        params.set(key, next.join(","));
      } else {
        params.delete(key);
      }
    });
  }

  function applyPriceRange() {
    navigate((params) => {
      if (precioMin) params.set("precioMin", precioMin);
      else params.delete("precioMin");
      if (precioMax) params.set("precioMax", precioMax);
      else params.delete("precioMax");
    });
  }

  function toggleOfertas() {
    navigate((params) => {
      if (soloOfertas) params.delete("oferta");
      else params.set("oferta", "1");
    });
  }

  function clearFilters() {
    router.push(pathname);
    onNavigate?.();
  }

  return (
    <div className="flex flex-col gap-6">
      {!hideCategoryFilter && categories.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Categoría</h3>
          <div className="flex flex-col gap-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={activeCategories.includes(category.slug)}
                  onCheckedChange={() =>
                    toggleListValue(
                      "categoria",
                      category.slug,
                      activeCategories,
                    )
                  }
                />
                {category.nombre}
              </label>
            ))}
          </div>
        </div>
      )}

      {brands.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Marca</h3>
          <div className="flex flex-col gap-2">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={activeBrands.includes(brand.slug)}
                  onCheckedChange={() =>
                    toggleListValue("marca", brand.slug, activeBrands)
                  }
                />
                {brand.nombre}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Precio</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Mín"
            value={precioMin}
            onChange={(event) => setPrecioMin(event.target.value)}
            className="w-full"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            min={0}
            placeholder="Máx"
            value={precioMax}
            onChange={(event) => setPrecioMax(event.target.value)}
            className="w-full"
          />
        </div>
        <Button size="sm" variant="outline" onClick={applyPriceRange}>
          Aplicar
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="solo-ofertas"
          checked={soloOfertas}
          onCheckedChange={toggleOfertas}
        />
        <Label htmlFor="solo-ofertas" className="text-sm font-normal">
          Solo ofertas
        </Label>
      </div>

      <Button variant="ghost" size="sm" onClick={clearFilters}>
        Limpiar filtros
      </Button>
    </div>
  );
}

export function ProductFilters({
  categories,
  brands,
  hideCategoryFilter = false,
}: {
  categories: FilterOption[];
  brands: FilterOption[];
  hideCategoryFilter?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-56 shrink-0 md:block">
        <FilterForm
          categories={categories}
          brands={brands}
          hideCategoryFilter={hideCategoryFilter}
        />
      </aside>

      <div className="mb-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="size-4" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto p-4">
            <SheetHeader className="p-0">
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <FilterForm
              categories={categories}
              brands={brands}
              hideCategoryFilter={hideCategoryFilter}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
