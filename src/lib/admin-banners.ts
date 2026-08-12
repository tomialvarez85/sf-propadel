import { prisma } from "@/lib/prisma";

export type BannerListItem = {
  id: string;
  imagen: string;
  titulo: string | null;
  link: string | null;
  activo: boolean;
  orden: number;
};

export async function getBannerList(): Promise<BannerListItem[]> {
  try {
    return await prisma.banner.findMany({
      orderBy: { orden: "asc" },
      select: {
        id: true,
        imagen: true,
        titulo: true,
        link: true,
        activo: true,
        orden: true,
      },
    });
  } catch (error) {
    console.error("No se pudieron cargar los banners:", error);
    return [];
  }
}

export type BannerEditData = {
  id: string;
  imagen: string;
  titulo: string | null;
  link: string | null;
  activo: boolean;
};

export async function getBannerForEdit(
  id: string,
): Promise<BannerEditData | null> {
  try {
    return await prisma.banner.findUnique({
      where: { id },
      select: {
        id: true,
        imagen: true,
        titulo: true,
        link: true,
        activo: true,
      },
    });
  } catch (error) {
    console.error("No se pudo cargar el banner:", error);
    return null;
  }
}
