import { prisma } from "@/lib/prisma";

export type CategoryNavItem = {
  id: string;
  nombre: string;
  slug: string;
  children: { id: string; nombre: string; slug: string }[];
};

export async function getCategoryNav(): Promise<CategoryNavItem[]> {
  try {
    return await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { orden: "asc" },
      select: {
        id: true,
        nombre: true,
        slug: true,
        children: {
          orderBy: { orden: "asc" },
          select: { id: true, nombre: true, slug: true },
        },
      },
    });
  } catch (error) {
    console.error("No se pudieron cargar las categorías:", error);
    return [];
  }
}

export type SiteSettingsData = {
  whatsapp: string | null;
  instagram: string | null;
  email: string | null;
  direccion: string | null;
  horarioAtencion: string | null;
  textoEnvioGratis: string | null;
  textoCuotas: string | null;
  textoNosotros: string | null;
  imagenGeneroHombre: string | null;
  imagenGeneroMujer: string | null;
  heroImagen: string | null;
  heroLink: string | null;
  heroTitulo: string | null;
  alias: string | null;
  cbu: string | null;
  titular: string | null;
  banco: string | null;
} | null;

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    return await prisma.siteSettings.findUnique({ where: { id: 1 } });
  } catch (error) {
    console.error("No se pudo cargar SiteSettings:", error);
    return null;
  }
}
