"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { GENERO_OPTIONS } from "@/lib/product-genero-options";
import type { FilterOption } from "@/lib/product-query";

export type FilterOptionWithCount = FilterOption & { count: number };

function parseListParam(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

function FilterForm({
  categories,
  brands,
  generoCounts,
  hideCategoryFilter,
  onNavigate,
}: {
  categories: FilterOptionWithCount[];
  brands: FilterOptionWithCount[];
  generoCounts: Record<string, number>;
  hideCategoryFilter: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategories = parseListParam(searchParams.get("categoria"));
  const activeBrands = parseListParam(searchParams.get("marca"));
  const activeGenero = searchParams.get("genero");
  const soloOfertas = searchParams.get("oferta") === "1";

  const [precioMin, setPrecioMin] = useState(
    searchParams.get("precioMin") ?? "",
  );
  const [precioMax, setPrecioMax] = useState(
    searchParams.get("precioMax") ?? "",
  );

  useEffect(() => {
    setPrecioMin(searchParams.get("precioMin") ?? "");
    setPrecioMax(searchParams.get("precioMax") ?? "");
  }, [searchParams]);

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

  function toggleGenero(value: string) {
    navigate((params) => {
      if (activeGenero === value) {
        params.delete("genero");
      } else {
        params.set("genero", value);
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

  const defaultOpen = ["categoria", "marca", "precio"];

  return (
    <div className="flex flex-col">
      <Accordion type="multiple" defaultValue={defaultOpen}>
        {!hideCategoryFilter && categories.length > 0 && (
          <AccordionItem value="categoria">
            <AccordionTrigger>
              <h3 className="font-heading text-base font-medium">Categoría</h3>
            </AccordionTrigger>
            <AccordionContent>
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
                    <span className="flex-1">{category.nombre}</span>
                    <span className="text-muted-foreground text-xs">
                      ({category.count})
                    </span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {brands.length > 0 && (
          <AccordionItem value="marca">
            <AccordionTrigger>
              <h3 className="font-heading text-base font-medium">Marca</h3>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                {brands.map((brand) => (
                  <label
                    key={brand.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={activeBrands.includes(brand.slug)}
                      onCheckedChange={() =>
                        toggleListValue("marca", brand.slug, activeBrands)
                      }
                    />
                    <span className="flex-1">{brand.nombre}</span>
                    <span className="text-muted-foreground text-xs">
                      ({brand.count})
                    </span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="genero">
          <AccordionTrigger>
            <h3 className="font-heading text-base font-medium">Género</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              {GENERO_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={activeGenero === option.value}
                    onCheckedChange={() => toggleGenero(option.value)}
                  />
                  <span className="flex-1">{option.label}</span>
                  <span className="text-muted-foreground text-xs">
                    ({generoCounts[option.value] ?? 0})
                  </span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="precio">
          <AccordionTrigger>
            <h3 className="font-heading text-base font-medium">Precio</h3>
          </AccordionTrigger>
          <AccordionContent>
            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                applyPriceRange();
              }}
            >
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
              <Button type="submit" size="sm" variant="outline">
                Aplicar
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex items-center gap-2 pt-4">
        <Checkbox
          id="solo-ofertas"
          checked={soloOfertas}
          onCheckedChange={toggleOfertas}
        />
        <Label htmlFor="solo-ofertas" className="text-sm font-normal">
          Solo ofertas
        </Label>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-3 w-fit"
        onClick={clearFilters}
      >
        Limpiar filtros
      </Button>
    </div>
  );
}

export function ProductFilters({
  categories,
  brands,
  generoCounts,
  hideCategoryFilter = false,
}: {
  categories: FilterOptionWithCount[];
  brands: FilterOptionWithCount[];
  generoCounts: Record<string, number>;
  hideCategoryFilter?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="md:sticky md:top-[calc(var(--header-height)+1.5rem)] md:max-h-[calc(100vh-var(--header-height)-3rem)] md:overflow-y-auto">
          <FilterForm
            categories={categories}
            brands={brands}
            generoCounts={generoCounts}
            hideCategoryFilter={hideCategoryFilter}
          />
        </div>
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
              generoCounts={generoCounts}
              hideCategoryFilter={hideCategoryFilter}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
