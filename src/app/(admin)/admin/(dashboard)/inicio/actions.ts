"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { homeBlockSchema } from "@/lib/validations/home-block";

export type ActionResult =
  { success: true } | { success: false; error: string };

function revalidateHomePaths() {
  revalidatePath("/admin/inicio");
  revalidatePath("/");
}

function parse(input: unknown) {
  const parsed = homeBlockSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    } as const;
  }
  const data = parsed.data;
  return {
    ok: true,
    data: {
      tipo: data.tipo,
      titulo: data.titulo || null,
      imagen: data.imagen,
      imagenMobile: data.tipo === "BANNER" ? data.imagenMobile || null : null,
      link: data.link || null,
      activo: data.activo,
    },
  } as const;
}

export async function createHomeBlock(input: unknown): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = parse(input);
  if (!parsed.ok) return { success: false, error: parsed.error };

  try {
    const last = await prisma.homeBlock.aggregate({
      where: { tipo: parsed.data.tipo },
      _max: { orden: true },
    });
    await prisma.homeBlock.create({
      data: { ...parsed.data, orden: (last._max.orden ?? -1) + 1 },
    });
  } catch (error) {
    console.error("No se pudo crear el bloque del home:", error);
    return { success: false, error: "No se pudo guardar." };
  }

  revalidateHomePaths();
  return { success: true };
}

export async function updateHomeBlock(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = parse(input);
  if (!parsed.ok) return { success: false, error: parsed.error };

  try {
    // El tipo no cambia al editar (un banner no se convierte en tarjeta).
    await prisma.homeBlock.update({
      where: { id },
      data: { ...parsed.data, tipo: undefined },
    });
  } catch (error) {
    console.error("No se pudo actualizar el bloque del home:", error);
    return { success: false, error: "No se pudo guardar." };
  }

  revalidateHomePaths();
  return { success: true };
}

export async function toggleHomeBlockActivo(
  id: string,
  activo: boolean,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  try {
    await prisma.homeBlock.update({ where: { id }, data: { activo } });
  } catch (error) {
    console.error("No se pudo cambiar el estado del bloque del home:", error);
    return { success: false, error: "No se pudo actualizar el estado." };
  }

  revalidateHomePaths();
  return { success: true };
}

export async function deleteHomeBlock(id: string): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  try {
    await prisma.homeBlock.delete({ where: { id } });
  } catch (error) {
    console.error("No se pudo eliminar el bloque del home:", error);
    return { success: false, error: "No se pudo eliminar." };
  }

  revalidateHomePaths();
  return { success: true };
}

export async function moveHomeBlock(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  try {
    const block = await prisma.homeBlock.findUnique({
      where: { id },
      select: { tipo: true },
    });
    if (!block) return { success: false, error: "No encontrado." };

    const siblings = await prisma.homeBlock.findMany({
      where: { tipo: block.tipo },
      orderBy: { orden: "asc" },
      select: { id: true },
    });

    const index = siblings.findIndex((sibling) => sibling.id === id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= siblings.length) {
      return { success: true };
    }

    // Reescribe el orden completo (0..n-1) en vez de intercambiar valores,
    // así dos filas con el mismo `orden` nunca dejan el botón sin efecto.
    const reordered = [...siblings];
    [reordered[index], reordered[swapIndex]] = [
      reordered[swapIndex],
      reordered[index],
    ];
    await prisma.$transaction(
      reordered.map((sibling, orden) =>
        prisma.homeBlock.update({ where: { id: sibling.id }, data: { orden } }),
      ),
    );
  } catch (error) {
    console.error("No se pudo reordenar el bloque del home:", error);
    return { success: false, error: "No se pudo reordenar." };
  }

  revalidateHomePaths();
  return { success: true };
}
