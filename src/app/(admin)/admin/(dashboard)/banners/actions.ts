"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { heroBannerSchema } from "@/lib/validations/hero-banner";

export type ActionResult =
  { success: true } | { success: false; error: string };

export async function updateHeroBanner(input: unknown): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = heroBannerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const data = {
    heroImagen: parsed.data.imagen,
    heroLink: parsed.data.link || null,
    heroTitulo: parsed.data.titulo || null,
  };

  try {
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
  } catch (error) {
    console.error("No se pudo guardar la imagen del hero:", error);
    return { success: false, error: "No se pudo guardar la imagen del hero." };
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: true };
}
