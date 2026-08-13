import Link from "next/link";

import type { Genero } from "@/generated/prisma";
import { ActiveFilters } from "@/components/site/active-filters";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/product-card";
import {
  ProductFilters,
  type FilterOptionWithCount,
} from "@/components/site/product-filters";
import { ProductPagination } from "@/components/site/product-pagination";
import { ProductSort } from "@/components/site/product-sort";
import { getCategoryNav } from "@/lib/site-data";
import {
  GENERO_OPTIONS,
  parseGeneroOption,
} from "@/lib/product-genero-options";
import {
  getBrandOptions,
  getFilterFacetCounts,
  getProductListing,
  resolveBrandIdsBySlugs,
  resolveCategoryIdsBySlugs,
  type CategoryScope,
} from "@/lib/product-query";
import { parseSortOption } from "@/lib/product-sort-options";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseList(value: string | string[] | undefined): string[] {
  const raw = firstValue(value);
  return raw ? raw.split(",").filter(Boolean) : [];
}

function parseNumber(value: string | string[] | undefined): number | undefined {
  const raw = firstValue(value);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function ProductListing({
  searchParams,
  categoryScope,
  basePath,
}: {
  searchParams: RawSearchParams;
  categoryScope: CategoryScope | null;
  basePath: string;
}) {
  const sort = parseSortOption(firstValue(searchParams.orden));
  const page = Math.max(1, Number(firstValue(searchParams.page)) || 1);
  const soloOfertas = firstValue(searchParams.oferta) === "1";
  const precioMin = parseNumber(searchParams.precioMin);
  const precioMax = parseNumber(searchParams.precioMax);
  const brandSlugs = parseList(searchParams.marca);
  const generoOption = parseGeneroOption(firstValue(searchParams.genero));
  const genero = generoOption
    ? (generoOption.toUpperCase() as Genero)
    : undefined;

  const [categoryIds, brandIds, categoryNav, brands, facetCounts] =
    await Promise.all([
      categoryScope
        ? Promise.resolve(categoryScope.ids)
        : resolveCategoryIdsBySlugs(parseList(searchParams.categoria)),
      resolveBrandIdsBySlugs(brandSlugs),
      categoryScope ? Promise.resolve([]) : getCategoryNav(),
      getBrandOptions(),
      getFilterFacetCounts(categoryScope?.ids),
    ]);

  const { products, total, totalPages } = await getProductListing({
    categoryIds,
    brandIds,
    genero,
    precioMin,
    precioMax,
    soloOfertas,
    sort,
    page,
  });

  const categories: FilterOptionWithCount[] = categoryNav.map((category) => {
    const ownCount = facetCounts.categoryCounts[category.id] ?? 0;
    const childrenCount = category.children.reduce(
      (sum, child) => sum + (facetCounts.categoryCounts[child.id] ?? 0),
      0,
    );
    return {
      id: category.id,
      nombre: category.nombre,
      slug: category.slug,
      count: ownCount + childrenCount,
    };
  });

  const brandsWithCounts: FilterOptionWithCount[] = brands.map((brand) => ({
    ...brand,
    count: facetCounts.brandCounts[brand.id] ?? 0,
  }));

  const generoCounts = Object.fromEntries(
    GENERO_OPTIONS.map((option) => [
      option.value,
      facetCounts.generoCounts[option.value.toUpperCase() as Genero] ?? 0,
    ]),
  );

  const hasActiveFilters =
    soloOfertas ||
    precioMin !== undefined ||
    precioMax !== undefined ||
    brandSlugs.length > 0 ||
    genero !== undefined ||
    (!categoryScope && parseList(searchParams.categoria).length > 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-heading text-2xl font-bold tracking-[-0.015em]">
        {categoryScope?.nombre ?? "Productos"}
      </h1>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <ProductFilters
          categories={categories}
          brands={brandsWithCounts}
          generoCounts={generoCounts}
          hideCategoryFilter={!!categoryScope}
        />

        <div className="min-w-0 flex-1">
          <ActiveFilters categories={categories} brands={brandsWithCounts} />

          <div className="border-border mb-6 flex items-center justify-between gap-4 border-b pb-4">
            <p className="text-muted-foreground text-sm">
              {total} {total === 1 ? "producto" : "productos"}
            </p>
            <ProductSort />
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-muted-foreground text-sm">
                No encontramos productos con estos filtros.
              </p>
              {hasActiveFilters && (
                <Button asChild variant="outline" size="sm">
                  <Link href={basePath}>Limpiar filtros</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <ProductPagination
            basePath={basePath}
            searchParams={searchParams}
            page={page}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}
