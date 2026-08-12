import { prisma } from "@/lib/prisma";

export type BrandListItem = {
  id: string;
  nombre: string;
  slug: string;
  logo: string | null;
  productCount: number;
};

export async function getBrandList(): Promise<BrandListItem[]> {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        slug: true,
        logo: true,
        _count: { select: { products: true } },
      },
    });

    return brands.map((brand) => ({
      id: brand.id,
      nombre: brand.nombre,
      slug: brand.slug,
      logo: brand.logo,
      productCount: brand._count.products,
    }));
  } catch (error) {
    console.error("No se pudieron cargar las marcas:", error);
    return [];
  }
}

export type BrandEditData = {
  id: string;
  nombre: string;
  slug: string;
  logo: string | null;
};

export async function getBrandForEdit(
  id: string,
): Promise<BrandEditData | null> {
  try {
    return await prisma.brand.findUnique({
      where: { id },
      select: { id: true, nombre: true, slug: true, logo: true },
    });
  } catch (error) {
    console.error("No se pudo cargar la marca:", error);
    return null;
  }
}
