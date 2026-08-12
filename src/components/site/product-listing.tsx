import { ProductCard } from "@/components/site/product-card";
import { ProductFilters } from "@/components/site/product-filters";
import { ProductPagination } from "@/components/site/product-pagination";
import { ProductSort } from "@/components/site/product-sort";
import { getMainCategories } from "@/lib/home-data";
import {
  getBrandOptions,
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

  const [categoryIds, brandIds, categories, brands] = await Promise.all([
    categoryScope
      ? Promise.resolve(categoryScope.ids)
      : resolveCategoryIdsBySlugs(parseList(searchParams.categoria)),
    resolveBrandIdsBySlugs(brandSlugs),
    categoryScope ? Promise.resolve([]) : getMainCategories(),
    getBrandOptions(),
  ]);

  const { products, total, totalPages } = await getProductListing({
    categoryIds,
    brandIds,
    precioMin,
    precioMax,
    soloOfertas,
    sort,
    page,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        {categoryScope?.nombre ?? "Productos"}
      </h1>

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <ProductFilters
          categories={categories}
          brands={brands}
          hideCategoryFilter={!!categoryScope}
        />

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              {total} {total === 1 ? "producto" : "productos"}
            </p>
            <ProductSort />
          </div>

          {products.length === 0 ? (
            <p className="text-muted-foreground py-16 text-center text-sm">
              No encontramos productos con estos filtros.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
