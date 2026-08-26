import type { Prisma } from "@/generated/prisma";
import type { ProductCardData } from "@/components/site/product-card";
import { prisma } from "@/lib/prisma";

export type HomeTestimonial = {
  id: string;
  nombreCliente: string;
  comentario: string;
  avatarUrl: string | null;
};

export async function getActiveTestimonials(): Promise<HomeTestimonial[]> {
  try {
    return await prisma.testimonial.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      select: { id: true, nombreCliente: true, comentario: true, avatarUrl: true },
    });
  } catch (error) {
    console.error("No se pudieron cargar los testimonios:", error);
    return [];
  }
}

export type HomeCategory = {
  id: string;
  nombre: string;
  slug: string;
  imagen: string | null;
};

export async function getMainCategories(): Promise<HomeCategory[]> {
  try {
    return await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { orden: "asc" },
      select: { id: true, nombre: true, slug: true, imagen: true },
    });
  } catch (error) {
    console.error("No se pudieron cargar las categorías:", error);
    return [];
  }
}

export async function getCategoryBySlug(
  slug: string,
): Promise<HomeCategory | null> {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      select: { id: true, nombre: true, slug: true, imagen: true },
    });
  } catch (error) {
    console.error("No se pudo cargar la categoría:", error);
    return null;
  }
}

async function getProducts(
  where: Prisma.ProductWhereInput,
): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 8,
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
  });

  return products.map((product) => ({
    id: product.id,
    nombre: product.nombre,
    slug: product.slug,
    precio: product.precio.toNumber(),
    precioAnterior: product.precioAnterior?.toNumber() ?? null,
    stock: product.stock,
    imagen: product.images[0]?.url ?? null,
    condicion: product.condicion,
  }));
}

export async function getOfertaProducts(): Promise<ProductCardData[]> {
  try {
    return await getProducts({ activo: true, enOferta: true });
  } catch (error) {
    console.error("No se pudieron cargar las ofertas:", error);
    return [];
  }
}

export async function getDestacadoProducts(): Promise<ProductCardData[]> {
  try {
    return await getProducts({ activo: true, destacado: true });
  } catch (error) {
    console.error("No se pudieron cargar los destacados:", error);
    return [];
  }
}
