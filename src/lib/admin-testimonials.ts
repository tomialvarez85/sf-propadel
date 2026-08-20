import { prisma } from "@/lib/prisma";

export type TestimonialListItem = {
  id: string;
  nombreCliente: string;
  comentario: string;
  avatarUrl: string | null;
  activo: boolean;
  orden: number;
};

export async function getTestimonialList(): Promise<TestimonialListItem[]> {
  try {
    return await prisma.testimonial.findMany({
      orderBy: { orden: "asc" },
      select: {
        id: true,
        nombreCliente: true,
        comentario: true,
        avatarUrl: true,
        activo: true,
        orden: true,
      },
    });
  } catch (error) {
    console.error("No se pudieron cargar los testimonios:", error);
    return [];
  }
}

export type TestimonialEditData = {
  id: string;
  nombreCliente: string;
  comentario: string;
  avatarUrl: string | null;
  activo: boolean;
};

export async function getTestimonialForEdit(
  id: string,
): Promise<TestimonialEditData | null> {
  try {
    return await prisma.testimonial.findUnique({
      where: { id },
      select: {
        id: true,
        nombreCliente: true,
        comentario: true,
        avatarUrl: true,
        activo: true,
      },
    });
  } catch (error) {
    console.error("No se pudo cargar el testimonio:", error);
    return null;
  }
}
