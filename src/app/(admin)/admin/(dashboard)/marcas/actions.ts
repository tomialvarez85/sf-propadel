"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { brandSchema } from "@/lib/validations/brand";

export type ActionResult =
  { success: true } | { success: false; error: string };

function revalidateBrandPaths() {
  revalidatePath("/admin/marcas");
  revalidatePath("/");
  revalidatePath("/productos");
}

function normalizeBrandData(data: ReturnType<typeof brandSchema.parse>) {
  return {
    nombre: data.nombre,
    slug: data.slug,
    logo: data.logo || null,
  };
}

export async function createBrand(input: unknown): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await prisma.brand.create({ data: normalizeBrandData(parsed.data) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "Ya existe una marca con ese slug." };
    }
    console.error("No se pudo crear la marca:", error);
    return { success: false, error: "No se pudo crear la marca." };
  }

  revalidateBrandPaths();
  return { success: true };
}

export async function updateBrand(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await prisma.brand.update({
      where: { id },
      data: normalizeBrandData(parsed.data),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "Ya existe una marca con ese slug." };
    }
    console.error("No se pudo actualizar la marca:", error);
    return { success: false, error: "No se pudo actualizar la marca." };
  }

  revalidateBrandPaths();
  return { success: true };
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  let productsCount: number;
  try {
    productsCount = await prisma.product.count({ where: { brandId: id } });
  } catch (error) {
    console.error("No se pudo validar la marca antes de eliminar:", error);
    return {
      success: false,
      error: "No se pudo verificar la marca. Intentá de nuevo.",
    };
  }

  if (productsCount > 0) {
    return {
      success: false,
      error: `No se puede eliminar: tiene ${productsCount} producto${productsCount === 1 ? "" : "s"} asociado${productsCount === 1 ? "" : "s"}. Reasigná o eliminá esos productos primero.`,
    };
  }

  try {
    await prisma.brand.delete({ where: { id } });
  } catch (error) {
    console.error("No se pudo eliminar la marca:", error);
    return { success: false, error: "No se pudo eliminar la marca." };
  }

  revalidateBrandPaths();
  return { success: true };
}
