import type { Genero, Prisma } from "@/generated/prisma";
import type { ProductCardData } from "@/components/site/product-card";
import { prisma } from "@/lib/prisma";
import { type SortOption } from "@/lib/product-sort-options";

export const PAGE_SIZE = 12;

const ORDER_BY: Record<SortOption, Prisma.ProductOrderByWithRelationInput[]> = {
  relevancia: [{ destacado: "desc" }, { createdAt: "desc" }],
  "precio-asc": [{ precio: "asc" }],
  "precio-desc": [{ precio: "desc" }],
  nuevos: [{ createdAt: "desc" }],
};

export type ProductListingParams = {
  categoryIds?: string[];
  brandIds?: string[];
  genero?: Genero;
  precioMin?: number;
  precioMax?: number;
  soloOfertas?: boolean;
  sort: SortOption;
  page: number;
};

export type ProductListingResult = {
  products: ProductCardData[];
  total: number;
  totalPages: number;
  page: number;
};

export async function getProductListing(
  params: ProductListingParams,
): Promise<ProductListingResult> {
  try {
    return await queryProductListing(params);
  } catch (error) {
    console.error("No se pudo cargar el listado de productos:", error);
    return { products: [], total: 0, totalPages: 1, page: 1 };
  }
}

async function queryProductListing(
  params: ProductListingParams,
): Promise<ProductListingResult> {
  const where: Prisma.ProductWhereInput = {
    activo: true,
    // Baseline scope, same status as `activo: true` above — not a removable
    // filter. /productos never shows usados; that has its own independent
    // page/query (used-product-query.ts) with condicion: "USADO" instead.
    condicion: "NUEVO",
    ...(params.categoryIds?.length
      ? { categoryId: { in: params.categoryIds } }
      : {}),
    ...(params.brandIds?.length ? { brandId: { in: params.brandIds } } : {}),
    ...(params.genero ? { genero: params.genero } : {}),
    ...(params.soloOfertas ? { enOferta: true } : {}),
    ...(params.precioMin != null || params.precioMax != null
      ? {
          precio: {
            ...(params.precioMin != null ? { gte: params.precioMin } : {}),
            ...(params.precioMax != null ? { lte: params.precioMax } : {}),
          },
        }
      : {}),
  };

  const page = Math.max(1, params.page);

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: ORDER_BY[params.sort],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        nombre: true,
        slug: true,
        precio: true,
        precioAnterior: true,
        stock: true,
        condicion: true,
        images: {
          orderBy: { orden: "asc" },
          take: 1,
          select: { url: true },
        },
      },
    }),
  ]);

  return {
    products: products.map((product) => ({
      id: product.id,
      nombre: product.nombre,
      slug: product.slug,
      precio: product.precio.toNumber(),
      precioAnterior: product.precioAnterior?.toNumber() ?? null,
      stock: product.stock,
      imagen: product.images[0]?.url ?? null,
      condicion: product.condicion,
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    page,
  };
}

export type FilterOption = { id: string; nombre: string; slug: string };

/**
 * Static per-facet counts (how many active products match each category/
 * brand/género), scoped to the current category if any. Deliberately NOT a
 * full faceted-search count that also reacts to the other currently-active
 * filters (marca/género/precio/oferta) — that would need a count query per
 * facet combination. This is the "how many products are there in general"
 * number, same idea as a catalog sidebar, not a live-narrowing count.
 */
export type FilterFacetCounts = {
  categoryCounts: Record<string, number>;
  brandCounts: Record<string, number>;
  generoCounts: Partial<Record<Genero, number>>;
};

export async function getFilterFacetCounts(
  categoryIds?: string[],
): Promise<FilterFacetCounts> {
  try {
    const baseWhere: Prisma.ProductWhereInput = {
      activo: true,
      condicion: "NUEVO",
    };
    const scopedWhere: Prisma.ProductWhereInput = {
      ...baseWhere,
      ...(categoryIds?.length ? { categoryId: { in: categoryIds } } : {}),
    };

    const [categoryGroups, brandGroups, generoGroups] = await Promise.all([
      prisma.product.groupBy({
        by: ["categoryId"],
        where: baseWhere,
        _count: true,
      }),
      prisma.product.groupBy({
        by: ["brandId"],
        where: scopedWhere,
        _count: true,
      }),
      prisma.product.groupBy({
        by: ["genero"],
        where: scopedWhere,
        _count: true,
      }),
    ]);

    return {
      categoryCounts: Object.fromEntries(
        categoryGroups.map((group) => [group.categoryId, group._count]),
      ),
      brandCounts: Object.fromEntries(
        brandGroups.map((group) => [group.brandId, group._count]),
      ),
      generoCounts: Object.fromEntries(
        generoGroups
          .filter((group) => group.genero !== null)
          .map((group) => [group.genero as Genero, group._count]),
      ),
    };
  } catch (error) {
    console.error("No se pudieron calcular los contadores de filtros:", error);
    return { categoryCounts: {}, brandCounts: {}, generoCounts: {} };
  }
}

export async function getBrandOptions(): Promise<FilterOption[]> {
  try {
    return await prisma.brand.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, slug: true },
    });
  } catch (error) {
    console.error("No se pudieron cargar las marcas:", error);
    return [];
  }
}

export async function resolveCategoryIdsBySlugs(
  slugs: string[],
): Promise<string[]> {
  if (slugs.length === 0) return [];
  try {
    const categories = await prisma.category.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, children: { select: { id: true } } },
    });
    return categories.flatMap((category) => [
      category.id,
      ...category.children.map((child) => child.id),
    ]);
  } catch (error) {
    console.error("No se pudieron resolver las categorías:", error);
    return [];
  }
}

export async function resolveBrandIdsBySlugs(
  slugs: string[],
): Promise<string[]> {
  if (slugs.length === 0) return [];
  try {
    const brands = await prisma.brand.findMany({
      where: { slug: { in: slugs } },
      select: { id: true },
    });
    return brands.map((brand) => brand.id);
  } catch (error) {
    console.error("No se pudieron resolver las marcas:", error);
    return [];
  }
}

export type CategoryScope = {
  id: string;
  nombre: string;
  slug: string;
  ids: string[];
};

export async function resolveCategoryScope(
  slug: string,
): Promise<CategoryScope | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        nombre: true,
        slug: true,
        children: { select: { id: true } },
      },
    });

    if (!category) return null;

    return {
      id: category.id,
      nombre: category.nombre,
      slug: category.slug,
      ids: [category.id, ...category.children.map((child) => child.id)],
    };
  } catch (error) {
    console.error("No se pudo resolver la categoría:", error);
    return null;
  }
}
