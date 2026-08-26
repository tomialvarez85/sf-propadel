"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryOption } from "@/lib/admin-categories";
import { formatCurrency } from "@/lib/format";
import type { FilterOption } from "@/lib/product-query";

const ALL = "__all__";

const STOCK_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "con-stock", label: "Con stock" },
  { value: "bajo", label: "Stock bajo (≤3)" },
  { value: "sin-stock", label: "Sin stock" },
] as const;

const ESTADO_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "activos", label: "Activos" },
  { value: "inactivos", label: "Inactivos" },
] as const;

const GENERO_FILTER_OPTIONS = [
  { value: "hombre", label: "Hombre" },
  { value: "mujer", label: "Mujer" },
  { value: "unisex", label: "Unisex" },
  { value: "sin-especificar", label: "Sin especificar" },
] as const;

type Chip = { key: string; label: string; onRemove: () => void };

export function UsedProductFilters({
  categories,
  brands,
  total,
  totalUnfiltered,
}: {
  categories: CategoryOption[];
  brands: FilterOption[];
  total: number;
  totalUnfiltered: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [precioMin, setPrecioMin] = useState(
    searchParams.get("precioMin") ?? "",
  );
  const [precioMax, setPrecioMax] = useState(
    searchParams.get("precioMax") ?? "",
  );

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
    setPrecioMin(searchParams.get("precioMin") ?? "");
    setPrecioMax(searchParams.get("precioMax") ?? "");
  }, [searchParams]);

  function navigate(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`${pathname}?${params.toString()}`);
  }

  function setParam(key: string, value: string | null) {
    navigate((params) => {
      if (value && value !== ALL) params.set(key, value);
      else params.delete(key);
    });
  }

  // Debounced text search — every other filter here navigates immediately
  // since selects/checkboxes are discrete actions, but a keystroke-per-request
  // would make typing feel laggy.
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (search === current) return;
    const timeout = setTimeout(() => {
      navigate((params) => {
        if (search) params.set("q", search);
        else params.delete("q");
      });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function applyPriceRange() {
    navigate((params) => {
      if (precioMin) params.set("precioMin", precioMin);
      else params.delete("precioMin");
      if (precioMax) params.set("precioMax", precioMax);
      else params.delete("precioMax");
    });
  }

  function clearAll() {
    router.push(pathname);
  }

  const categoryId = searchParams.get("categoria") ?? ALL;
  const brandId = searchParams.get("marca") ?? ALL;
  const genero = searchParams.get("genero") ?? ALL;
  const stock = searchParams.get("stock") ?? "todos";
  const estado = searchParams.get("estado") ?? "todos";
  const destacado = searchParams.get("destacado") === "1";
  const enOferta = searchParams.get("oferta") === "1";

  const moreFiltersCount = [
    genero !== ALL,
    destacado,
    enOferta,
    !!precioMin || !!precioMax,
  ].filter(Boolean).length;

  const hasActiveFilters =
    !!search ||
    categoryId !== ALL ||
    stock !== "todos" ||
    estado !== "todos" ||
    moreFiltersCount > 0;

  const chips: Chip[] = [];
  if (search) {
    chips.push({
      key: "q",
      label: `Búsqueda: "${search}"`,
      onRemove: () => setParam("q", null),
    });
  }
  if (categoryId !== ALL) {
    const category = categories.find((option) => option.id === categoryId);
    if (category) {
      chips.push({
        key: "categoria",
        label: `Categoría: ${category.nombre}`,
        onRemove: () => setParam("categoria", null),
      });
    }
  }
  if (brandId !== ALL) {
    const brand = brands.find((option) => option.id === brandId);
    if (brand) {
      chips.push({
        key: "marca",
        label: `Marca: ${brand.nombre}`,
        onRemove: () => setParam("marca", null),
      });
    }
  }
  if (genero !== ALL) {
    const option = GENERO_FILTER_OPTIONS.find((o) => o.value === genero);
    if (option) {
      chips.push({
        key: "genero",
        label: `Género: ${option.label}`,
        onRemove: () => setParam("genero", null),
      });
    }
  }
  if (stock !== "todos") {
    const option = STOCK_OPTIONS.find((o) => o.value === stock);
    if (option) {
      chips.push({
        key: "stock",
        label: `Stock: ${option.label}`,
        onRemove: () => setParam("stock", null),
      });
    }
  }
  if (estado !== "todos") {
    const option = ESTADO_OPTIONS.find((o) => o.value === estado);
    if (option) {
      chips.push({
        key: "estado",
        label: `Estado: ${option.label}`,
        onRemove: () => setParam("estado", null),
      });
    }
  }
  if (destacado) {
    chips.push({
      key: "destacado",
      label: "Solo destacados",
      onRemove: () => setParam("destacado", null),
    });
  }
  if (enOferta) {
    chips.push({
      key: "oferta",
      label: "Solo en oferta",
      onRemove: () => setParam("oferta", null),
    });
  }
  if (precioMin || precioMax) {
    chips.push({
      key: "precio",
      label: `Precio: ${precioMin ? formatCurrency(Number(precioMin)) : "$0"} - ${precioMax ? formatCurrency(Number(precioMax)) : "sin tope"}`,
      onRemove: () =>
        navigate((params) => {
          params.delete("precioMin");
          params.delete("precioMax");
        }),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-56">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-8"
          />
        </div>

        <Select
          value={categoryId}
          onValueChange={(value) => setParam("categoria", value)}
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={brandId}
          onValueChange={(value) => setParam("marca", value)}
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas las marcas</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={stock}
          onValueChange={(value) => setParam("stock", value)}
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STOCK_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={estado}
          onValueChange={(value) => setParam("estado", value)}
        >
          <SelectTrigger size="sm" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ESTADO_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="size-4" />
              Más filtros
              {moreFiltersCount > 0 && (
                <Badge className="px-1.5">{moreFiltersCount}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Género</Label>
              <Select
                value={genero}
                onValueChange={(value) => setParam("genero", value)}
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {GENERO_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Precio</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="Mín"
                  value={precioMin}
                  onChange={(event) => setPrecioMin(event.target.value)}
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="Máx"
                  value={precioMax}
                  onChange={(event) => setPrecioMax(event.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyPriceRange}
              >
                Aplicar precio
              </Button>
            </div>

            <div className="border-border flex flex-col gap-2 border-t pt-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="filtro-destacado"
                  checked={destacado}
                  onCheckedChange={(checked) =>
                    setParam("destacado", checked ? "1" : null)
                  }
                />
                <Label htmlFor="filtro-destacado" className="font-normal">
                  Solo destacados
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="filtro-oferta"
                  checked={enOferta}
                  onCheckedChange={(checked) =>
                    setParam("oferta", checked ? "1" : null)
                  }
                />
                <Label htmlFor="filtro-oferta" className="font-normal">
                  Solo en oferta
                </Label>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">
          Accesos rápidos:
        </span>
        <Button
          variant={stock === "sin-stock" ? "secondary" : "outline"}
          size="sm"
          onClick={() =>
            setParam("stock", stock === "sin-stock" ? null : "sin-stock")
          }
        >
          Sin stock
        </Button>
        <Button
          variant={stock === "bajo" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setParam("stock", stock === "bajo" ? null : "bajo")}
        >
          Stock bajo
        </Button>
        <Button
          variant={estado === "inactivos" ? "secondary" : "outline"}
          size="sm"
          onClick={() =>
            setParam("estado", estado === "inactivos" ? null : "inactivos")
          }
        >
          Inactivos
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-muted-foreground text-sm">
          {hasActiveFilters
            ? `${total} de ${totalUnfiltered} productos`
            : `${totalUnfiltered} productos`}
        </p>
        {chips.map((chip) => (
          <Badge key={chip.key} variant="outline" className="gap-1 pr-1">
            {chip.label}
            <button
              type="button"
              onClick={chip.onRemove}
              aria-label={`Quitar filtro: ${chip.label}`}
              className="hover:bg-muted flex size-4 items-center justify-center rounded-full transition-colors"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-muted-foreground hover:text-primary text-xs underline-offset-2 transition-colors hover:underline"
          >
            Limpiar todo
          </button>
        )}
      </div>
    </div>
  );
}
