import { prisma } from "@/lib/prisma";

export type DashboardStats = {
  activeCount: number;
  outOfStockCount: number;
  onOfferCount: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [activeCount, outOfStockCount, onOfferCount] = await Promise.all([
      prisma.product.count({ where: { activo: true } }),
      prisma.product.count({ where: { activo: true, stock: 0 } }),
      prisma.product.count({ where: { activo: true, enOferta: true } }),
    ]);

    return { activeCount, outOfStockCount, onOfferCount };
  } catch (error) {
    console.error("No se pudieron cargar las métricas del dashboard:", error);
    return { activeCount: 0, outOfStockCount: 0, onOfferCount: 0 };
  }
}

export type RecentProduct = {
  id: string;
  nombre: string;
  slug: string;
  precio: number;
  stock: number;
  categoria: string;
  createdAt: Date;
};

export async function getRecentProducts(): Promise<RecentProduct[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        nombre: true,
        slug: true,
        precio: true,
        stock: true,
        createdAt: true,
        category: { select: { nombre: true } },
      },
    });

    return products.map((product) => ({
      id: product.id,
      nombre: product.nombre,
      slug: product.slug,
      precio: product.precio.toNumber(),
      stock: product.stock,
      categoria: product.category.nombre,
      createdAt: product.createdAt,
    }));
  } catch (error) {
    console.error("No se pudieron cargar los últimos productos:", error);
    return [];
  }
}
