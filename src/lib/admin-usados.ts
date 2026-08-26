// Independent from admin-products.ts on purpose — /admin/usados must never
// share its query layer with /admin/productos (see used-product-query.ts
// for the same reasoning on the public-site side).
import type { Genero, Prisma } from "@/generated/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export type UsedProductListItem = {
  id: string;
  nombre: string;
  slug: string;
  precio: number;
  stock: number;
  activo: boolean;
  imagen: string | null;
  imageCount: number;
  categoryId: string;
  categoryNombre: string;
  brandId: string;
  brandNombre: string;
};

export type StockStatus = "con-stock" | "bajo" | "sin-stock";

export type UsedProductListFilters = {
  search?: string;
  categoryId?: string;
  brandId?: string;
  genero?: Genero | null;
  stockStatus?: StockStatus;
  activo?: boolean;
  destacado?: boolean;
  enOferta?: boolean;
  precioMin?: number;
  precioMax?: number;
};

export type UsedProductListResult = {
  products: UsedProductListItem[];
  total: number;
  totalUnfiltered: number;
};

function stockWhere(status?: StockStatus): Prisma.ProductWhereInput {
  if (status === "sin-stock") return { stock: { lte: 0 } };
  if (status === "bajo") return { stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } };
  if (status === "con-stock") return { stock: { gt: LOW_STOCK_THRESHOLD } };
  return {};
}

export async function getUsedProductList(
  filters: UsedProductListFilters = {},
): Promise<UsedProductListResult> {
  try {
    const where: Prisma.ProductWhereInput = {
      condicion: "USADO",
      ...(filters.search
        ? { nombre: { contains: filters.search, mode: "insensitive" } }
        : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.brandId ? { brandId: filters.brandId } : {}),
      ...(filters.genero === null
        ? { genero: null }
        : filters.genero
          ? { genero: filters.genero }
          : {}),
      ...(filters.activo !== undefined ? { activo: filters.activo } : {}),
      ...(filters.destacado ? { destacado: true } : {}),
      ...(filters.enOferta ? { enOferta: true } : {}),
      ...(filters.precioMin != null || filters.precioMax != null
        ? {
            precio: {
              ...(filters.precioMin != null ? { gte: filters.precioMin } : {}),
              ...(filters.precioMax != null ? { lte: filters.precioMax } : {}),
            },
          }
        : {}),
      ...stockWhere(filters.stockStatus),
    };

    const [products, total, totalUnfiltered] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          nombre: true,
          slug: true,
          precio: true,
          stock: true,
          activo: true,
          categoryId: true,
          category: { select: { nombre: true } },
          brandId: true,
          brand: { select: { nombre: true } },
          images: {
            orderBy: { orden: "asc" },
            take: 1,
            select: { url: true },
          },
          _count: { select: { images: true } },
        },
      }),
      prisma.product.count({ where }),
      prisma.product.count({ where: { condicion: "USADO" } }),
    ]);

    return {
      products: products.map((product) => ({
        id: product.id,
        nombre: product.nombre,
        slug: product.slug,
        precio: product.precio.toNumber(),
        stock: product.stock,
        activo: product.activo,
        imagen: product.images[0]?.url ?? null,
        imageCount: product._count.images,
        categoryId: product.categoryId,
        categoryNombre: product.category.nombre,
        brandId: product.brandId,
        brandNombre: product.brand.nombre,
      })),
      total,
      totalUnfiltered,
    };
  } catch (error) {
    console.error("No se pudieron cargar los productos usados:", error);
    return { products: [], total: 0, totalUnfiltered: 0 };
  }
}

export type UsedProductEditData = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  estadoConservacion: string | null;
  precio: number;
  precioAnterior: number | null;
  stock: number;
  genero: Genero | null;
  categoryId: string;
  brandId: string;
  destacado: boolean;
  enOferta: boolean;
  activo: boolean;
  images: { url: string }[];
  variants: { tipo: string; valor: string; stock: number }[];
};

export async function getUsedProductForEdit(
  id: string,
): Promise<UsedProductEditData | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id, condicion: "USADO" },
      select: {
        id: true,
        nombre: true,
        slug: true,
        descripcion: true,
        estadoConservacion: true,
        precio: true,
        precioAnterior: true,
        stock: true,
        genero: true,
        categoryId: true,
        brandId: true,
        destacado: true,
        enOferta: true,
        activo: true,
        images: { orderBy: { orden: "asc" }, select: { url: true } },
        variants: { select: { tipo: true, valor: true, stock: true } },
      },
    });

    if (!product) return null;

    return {
      ...product,
      precio: product.precio.toNumber(),
      precioAnterior: product.precioAnterior?.toNumber() ?? null,
    };
  } catch (error) {
    console.error("No se pudo cargar el producto usado:", error);
    return null;
  }
}
