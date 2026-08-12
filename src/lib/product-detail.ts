import { cache } from "react";

import type { ProductCardData } from "@/components/site/product-card";
import { prisma } from "@/lib/prisma";

export type ProductDetail = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioAnterior: number | null;
  stock: number;
  categoryId: string;
  brand: { nombre: string; slug: string };
  images: { id: string; url: string }[];
  variants: { id: string; tipo: string; valor: string; stock: number }[];
};

export const getProductBySlug = cache(
  async (slug: string): Promise<ProductDetail | null> => {
    try {
      const product = await prisma.product.findFirst({
        where: { slug, activo: true },
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          precio: true,
          precioAnterior: true,
          stock: true,
          categoryId: true,
          brand: { select: { nombre: true, slug: true } },
          images: {
            orderBy: { orden: "asc" },
            select: { id: true, url: true },
          },
          variants: {
            select: { id: true, tipo: true, valor: true, stock: true },
          },
        },
      });

      if (!product) return null;

      return {
        ...product,
        precio: product.precio.toNumber(),
        precioAnterior: product.precioAnterior?.toNumber() ?? null,
      };
    } catch (error) {
      console.error("No se pudo cargar el producto:", error);
      return null;
    }
  },
);

export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
): Promise<ProductCardData[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        activo: true,
        id: { not: excludeProductId },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        nombre: true,
        slug: true,
        precio: true,
        precioAnterior: true,
        stock: true,
        images: {
          orderBy: { orden: "asc" },
          take: 1,
          select: { url: true },
        },
      },
    });

    return products.map((product) => ({
      id: product.id,
      nombre: product.nombre,
      slug: product.slug,
      precio: product.precio.toNumber(),
      precioAnterior: product.precioAnterior?.toNumber() ?? null,
      stock: product.stock,
      imagen: product.images[0]?.url ?? null,
    }));
  } catch (error) {
    console.error("No se pudieron cargar los productos relacionados:", error);
    return [];
  }
}
