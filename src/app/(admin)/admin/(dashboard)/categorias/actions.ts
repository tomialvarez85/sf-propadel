"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { getDescendantIds, type CategoryOption } from "@/lib/admin-categories";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category";

export type ActionResult =
  { success: true } | { success: false; error: string };

function revalidateCategoryPaths() {
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/productos");
}

function normalizeCategoryData(data: ReturnType<typeof categorySchema.parse>) {
  return {
    nombre: data.nombre,
    slug: data.slug,
    descripcion: data.descripcion || null,
    imagen: data.imagen || null,
    parentId: data.parentId || null,
    orden: data.orden,
  };
}

export async function createCategory(input: unknown): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await prisma.category.create({ data: normalizeCategoryData(parsed.data) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "Ya existe una categoría con ese slug." };
    }
    console.error("No se pudo crear la categoría:", error);
    return { success: false, error: "No se pudo crear la categoría." };
  }

  revalidateCategoryPaths();
  return { success: true };
}

export async function updateCategory(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  if (parsed.data.parentId) {
    if (parsed.data.parentId === id) {
      return {
        success: false,
        error: "Una categoría no puede ser su propia categoría padre.",
      };
    }
    const all: CategoryOption[] = await prisma.category.findMany({
      select: { id: true, nombre: true, parentId: true },
    });
    const descendants = getDescendantIds(id, all);
    if (descendants.has(parsed.data.parentId)) {
      return {
        success: false,
        error: "No podés elegir una subcategoría como categoría padre.",
      };
    }
  }

  try {
    await prisma.category.update({
      where: { id },
      data: normalizeCategoryData(parsed.data),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "Ya existe una categoría con ese slug." };
    }
    console.error("No se pudo actualizar la categoría:", error);
    return { success: false, error: "No se pudo actualizar la categoría." };
  }

  revalidateCategoryPaths();
  return { success: true };
}

export async function updateCategoryNombre(
  id: string,
  nombre: string,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const trimmed = nombre.trim();
  if (trimmed.length < 2) {
    return { success: false, error: "Ingresá un nombre." };
  }

  try {
    await prisma.category.update({ where: { id }, data: { nombre: trimmed } });
  } catch (error) {
    console.error("No se pudo actualizar el nombre de la categoría:", error);
    return { success: false, error: "No se pudo guardar el cambio." };
  }

  revalidateCategoryPaths();
  return { success: true };
}

export async function updateCategoryImage(
  id: string,
  imagen: string,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  if (!imagen.trim()) {
    return { success: false, error: "Falta la URL de la imagen." };
  }

  try {
    await prisma.category.update({ where: { id }, data: { imagen } });
  } catch (error) {
    console.error("No se pudo actualizar la imagen de la categoría:", error);
    return { success: false, error: "No se pudo guardar la imagen." };
  }

  revalidateCategoryPaths();
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  let childrenCount: number;
  let productsCount: number;
  try {
    [childrenCount, productsCount] = await Promise.all([
      prisma.category.count({ where: { parentId: id } }),
      prisma.product.count({ where: { categoryId: id } }),
    ]);
  } catch (error) {
    console.error("No se pudo validar la categoría antes de eliminar:", error);
    return {
      success: false,
      error: "No se pudo verificar la categoría. Intentá de nuevo.",
    };
  }

  if (childrenCount > 0 || productsCount > 0) {
    const parts: string[] = [];
    if (childrenCount > 0) {
      parts.push(
        `${childrenCount} subcategoría${childrenCount === 1 ? "" : "s"}`,
      );
    }
    if (productsCount > 0) {
      parts.push(`${productsCount} producto${productsCount === 1 ? "" : "s"}`);
    }
    return {
      success: false,
      error: `No se puede eliminar: tiene ${parts.join(" y ")} asociados. Reasigná o eliminá esos registros primero.`,
    };
  }

  try {
    await prisma.category.delete({ where: { id } });
  } catch (error) {
    console.error("No se pudo eliminar la categoría:", error);
    return { success: false, error: "No se pudo eliminar la categoría." };
  }

  revalidateCategoryPaths();
  return { success: true };
}
