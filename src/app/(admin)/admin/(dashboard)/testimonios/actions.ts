"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { testimonialSchema } from "@/lib/validations/testimonial";

export type ActionResult =
  { success: true } | { success: false; error: string };

function revalidateTestimonialPaths() {
  revalidatePath("/admin/testimonios");
  revalidatePath("/");
}

function normalizeTestimonialData(data: ReturnType<typeof testimonialSchema.parse>) {
  return {
    nombreCliente: data.nombreCliente,
    comentario: data.comentario,
    avatarUrl: data.avatarUrl || null,
    activo: data.activo,
  };
}

export async function createTestimonial(input: unknown): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    const last = await prisma.testimonial.aggregate({ _max: { orden: true } });
    await prisma.testimonial.create({
      data: {
        ...normalizeTestimonialData(parsed.data),
        orden: (last._max.orden ?? -1) + 1,
      },
    });
  } catch (error) {
    console.error("No se pudo crear el testimonio:", error);
    return { success: false, error: "No se pudo crear el testimonio." };
  }

  revalidateTestimonialPaths();
  return { success: true };
}

export async function updateTestimonial(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await prisma.testimonial.update({
      where: { id },
      data: normalizeTestimonialData(parsed.data),
    });
  } catch (error) {
    console.error("No se pudo actualizar el testimonio:", error);
    return { success: false, error: "No se pudo actualizar el testimonio." };
  }

  revalidateTestimonialPaths();
  return { success: true };
}

export async function toggleTestimonialActivo(
  id: string,
  activo: boolean,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  try {
    await prisma.testimonial.update({ where: { id }, data: { activo } });
  } catch (error) {
    console.error("No se pudo actualizar el estado del testimonio:", error);
    return { success: false, error: "No se pudo actualizar el estado." };
  }

  revalidateTestimonialPaths();
  return { success: true };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  try {
    await prisma.testimonial.delete({ where: { id } });
  } catch (error) {
    console.error("No se pudo eliminar el testimonio:", error);
    return { success: false, error: "No se pudo eliminar el testimonio." };
  }

  revalidateTestimonialPaths();
  return { success: true };
}

export async function moveTestimonial(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { orden: "asc" },
      select: { id: true, orden: true },
    });

    const index = testimonials.findIndex((testimonial) => testimonial.id === id);
    if (index === -1) {
      return { success: false, error: "Testimonio no encontrado." };
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= testimonials.length) {
      return { success: true };
    }

    const current = testimonials[index];
    const swap = testimonials[swapIndex];

    await prisma.$transaction([
      prisma.testimonial.update({
        where: { id: current.id },
        data: { orden: swap.orden },
      }),
      prisma.testimonial.update({
        where: { id: swap.id },
        data: { orden: current.orden },
      }),
    ]);
  } catch (error) {
    console.error("No se pudo reordenar el testimonio:", error);
    return { success: false, error: "No se pudo reordenar el testimonio." };
  }

  revalidateTestimonialPaths();
  return { success: true };
}
