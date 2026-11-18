import type { HomeBlockTipo } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export type { HomeBlockTipo };

/** Cuántas tarjetas de categoría entran en la grilla del home (1 fila de 3). */
export const MAX_HOME_TILES = 3;

export type HomeBlockItem = {
  id: string;
  tipo: HomeBlockTipo;
  titulo: string | null;
  imagen: string;
  imagenMobile: string | null;
  link: string | null;
  orden: number;
  activo: boolean;
};

const SELECT = {
  id: true,
  tipo: true,
  titulo: true,
  imagen: true,
  imagenMobile: true,
  link: true,
  orden: true,
  activo: true,
} as const;

/** Home: slides del banner o tarjetas activas, en orden. */
export async function getActiveHomeBlocks(
  tipo: HomeBlockTipo,
): Promise<HomeBlockItem[]> {
  try {
    return await prisma.homeBlock.findMany({
      where: { tipo, activo: true },
      orderBy: { orden: "asc" },
      take: tipo === "TILE" ? MAX_HOME_TILES : undefined,
      select: SELECT,
    });
  } catch (error) {
    console.error(`No se pudieron cargar los bloques ${tipo} del home:`, error);
    return [];
  }
}

/** Admin: todos los bloques (activos e inactivos) de un tipo, en orden. */
export async function getHomeBlockList(
  tipo: HomeBlockTipo,
): Promise<HomeBlockItem[]> {
  try {
    return await prisma.homeBlock.findMany({
      where: { tipo },
      orderBy: { orden: "asc" },
      select: SELECT,
    });
  } catch (error) {
    console.error(`No se pudieron cargar los bloques ${tipo}:`, error);
    return [];
  }
}

export type LinkTarget = { label: string; href: string };

/**
 * Admin: destinos posibles para el selector "Lleva a" del formulario —
 * categorías (/[slug]) y productos activos (/productos/[slug]).
 */
export async function getLinkTargets(): Promise<{
  categories: LinkTarget[];
  products: LinkTarget[];
}> {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        orderBy: [{ orden: "asc" }, { nombre: "asc" }],
        select: {
          nombre: true,
          slug: true,
          parent: { select: { nombre: true } },
        },
      }),
      prisma.product.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
        select: { nombre: true, slug: true, condicion: true },
      }),
    ]);
    return {
      categories: categories.map((category) => ({
        label: category.parent
          ? `${category.parent.nombre} › ${category.nombre}`
          : category.nombre,
        href: `/${category.slug}`,
      })),
      products: products.map((product) => ({
        label:
          product.condicion === "USADO"
            ? `${product.nombre} (usado)`
            : product.nombre,
        href: `/productos/${product.slug}`,
      })),
    };
  } catch (error) {
    console.error("No se pudieron cargar los destinos de link:", error);
    return { categories: [], products: [] };
  }
}

export async function getHomeBlockForEdit(
  id: string,
): Promise<HomeBlockItem | null> {
  try {
    return await prisma.homeBlock.findUnique({ where: { id }, select: SELECT });
  } catch (error) {
    console.error("No se pudo cargar el bloque del home:", error);
    return null;
  }
}
