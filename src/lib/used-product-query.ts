// Independent from product-query.ts on purpose — /usados must never share
// its listing query with /productos, so a change made for one can't ever
// silently affect the other. No filters/sort/pagination here at all, by
// explicit user request: /usados is a single horizontally-scrollable row
// showing every used product at once.
import { prisma } from "@/lib/prisma";

export type UsedProductCardData = {
  id: string;
  nombre: string;
  slug: string;
  precio: number;
  precioAnterior: number | null;
  stock: number;
  imagen: string | null;
  descripcion: string;
};

export async function getUsedProducts(): Promise<UsedProductCardData[]> {
  try {
    const products = await prisma.product.findMany({
      where: { activo: true, condicion: "USADO" },
      orderBy: [{ destacado: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        nombre: true,
        slug: true,
        precio: true,
        precioAnterior: true,
        stock: true,
        descripcion: true,
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
      descripcion: product.descripcion,
    }));
  } catch (error) {
    console.error("No se pudo cargar el listado de usados:", error);
    return [];
  }
}
