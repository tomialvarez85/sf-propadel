"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { bannerSchema } from "@/lib/validations/banner";

export type ActionResult =
  { success: true } | { success: false; error: string };

function revalidateBannerPaths() {
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

function normalizeBannerData(data: ReturnType<typeof bannerSchema.parse>) {
  return {
    imagen: data.imagen,
    link: data.link || null,
    titulo: data.titulo || null,
    activo: data.activo,
  };
}

export async function createBanner(input: unknown): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    const last = await prisma.banner.aggregate({ _max: { orden: true } });
    await prisma.banner.create({
      data: {
        ...normalizeBannerData(parsed.data),
        orden: (last._max.orden ?? -1) + 1,
      },
    });
  } catch (error) {
    console.error("No se pudo crear el banner:", error);
    return { success: false, error: "No se pudo crear el banner." };
  }

  revalidateBannerPaths();
  return { success: true };
}

export async function updateBanner(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await prisma.banner.update({
      where: { id },
      data: normalizeBannerData(parsed.data),
    });
  } catch (error) {
    console.error("No se pudo actualizar el banner:", error);
    return { success: false, error: "No se pudo actualizar el banner." };
  }

  revalidateBannerPaths();
  return { success: true };
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  try {
    await prisma.banner.delete({ where: { id } });
  } catch (error) {
    console.error("No se pudo eliminar el banner:", error);
    return { success: false, error: "No se pudo eliminar el banner." };
  }

  revalidateBannerPaths();
  return { success: true };
}

export async function moveBanner(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  try {
    const banners = await prisma.banner.findMany({
      orderBy: { orden: "asc" },
      select: { id: true, orden: true },
    });

    const index = banners.findIndex((banner) => banner.id === id);
    if (index === -1) {
      return { success: false, error: "Banner no encontrado." };
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= banners.length) {
      return { success: true };
    }

    const current = banners[index];
    const swap = banners[swapIndex];

    await prisma.$transaction([
      prisma.banner.update({
        where: { id: current.id },
        data: { orden: swap.orden },
      }),
      prisma.banner.update({
        where: { id: swap.id },
        data: { orden: current.orden },
      }),
    ]);
  } catch (error) {
    console.error("No se pudo reordenar el banner:", error);
    return { success: false, error: "No se pudo reordenar el banner." };
  }

  revalidateBannerPaths();
  return { success: true };
}
