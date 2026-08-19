"use server";

import { revalidatePath } from "next/cache";

import { OrderStatus } from "@/generated/prisma";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export type ActionResult =
  { success: true } | { success: false; error: string };

const VALID_STATUSES = new Set(Object.values(OrderStatus));

export async function updateOrderEstado(
  id: string,
  estado: string,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  if (!VALID_STATUSES.has(estado as OrderStatus)) {
    return { success: false, error: "Estado inválido." };
  }

  try {
    await prisma.order.update({
      where: { id },
      data: { estado: estado as OrderStatus },
    });
  } catch (error) {
    console.error("No se pudo actualizar el estado del pedido:", error);
    return { success: false, error: "No se pudo actualizar el estado." };
  }

  revalidatePath("/admin/pedidos");
  return { success: true };
}
