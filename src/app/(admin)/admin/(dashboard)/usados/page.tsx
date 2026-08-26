import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import type { Genero } from "@/generated/prisma";
import { UsedProductFilters } from "@/components/admin/used-product-filters";
import { UsedProductList } from "@/components/admin/used-product-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAllCategoriesFlat } from "@/lib/admin-categories";
import { getUsedProductList, type StockStatus } from "@/lib/admin-usados";
import { getBrandOptions } from "@/lib/product-query";

export const metadata: Metadata = {
  title: "Usados | SF ProPadel Admin",
};

const STOCK_VALUES = new Set(["con-stock", "bajo", "sin-stock"]);
const GENERO_VALUES = new Set(["HOMBRE", "MUJER", "UNISEX"]);

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseNumber(value: string | string[] | undefined): number | undefined {
  const raw = firstValue(value);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function AdminUsadosPage(
  props: PageProps<"/admin/usados">,
) {
  const searchParams = await props.searchParams;

  const search = firstValue(searchParams.q);
  const categoryId = firstValue(searchParams.categoria);
  const brandId = firstValue(searchParams.marca);
  const generoRaw = firstValue(searchParams.genero);
  const stockRaw = firstValue(searchParams.stock);
  const estado = firstValue(searchParams.estado);
  const destacado = firstValue(searchParams.destacado) === "1";
  const enOferta = firstValue(searchParams.oferta) === "1";
  const precioMin = parseNumber(searchParams.precioMin);
  const precioMax = parseNumber(searchParams.precioMax);

  const generoUpper = generoRaw?.toUpperCase();
  const genero =
    generoRaw === "sin-especificar"
      ? null
      : generoUpper && GENERO_VALUES.has(generoUpper)
        ? (generoUpper as Genero)
        : undefined;

  const stockStatus =
    stockRaw && STOCK_VALUES.has(stockRaw) ? (stockRaw as StockStatus) : undefined;

  const [{ products, total, totalUnfiltered }, categories, brands] =
    await Promise.all([
      getUsedProductList({
        search,
        categoryId,
        brandId,
        genero,
        stockStatus,
        activo:
          estado === "activos" ? true : estado === "inactivos" ? false : undefined,
        destacado,
        enOferta,
        precioMin,
        precioMax,
      }),
      getAllCategoriesFlat(),
      getBrandOptions(),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Usados</h1>
        <Button asChild>
          <Link href="/admin/usados/nuevo">
            <Plus className="size-4" />
            Nuevo producto usado
          </Link>
        </Button>
      </div>

      <UsedProductFilters
        categories={categories}
        brands={brands}
        total={total}
        totalUnfiltered={totalUnfiltered}
      />

      <Card>
        <CardContent>
          <UsedProductList
            products={products}
            categories={categories}
            brands={brands}
            hasActiveFilters={total !== totalUnfiltered}
          />
        </CardContent>
      </Card>
    </div>
  );
}
