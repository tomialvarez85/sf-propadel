"use server";

import { revalidatePath } from "next/cache";

import { OrderStatus } from "@/generated/prisma";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { COMPROBANTES_BUCKET } from "@/lib/storage-constants";
import { createAdminClient } from "@/lib/supabase/admin";

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

/** OrderItem has onDelete: Cascade on its Order relation (schema.prisma),
 * so deleting the Order alone removes its items too — no explicit
 * OrderItem cleanup needed. The comprobante file, if any, lives in Storage
 * (not the DB) and needs its own delete so it doesn't become orphaned. */
export async function deleteOrder(id: string): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  let deleted;
  try {
    deleted = await prisma.order.delete({ where: { id } });
  } catch (error) {
    console.error("No se pudo eliminar el pedido:", error);
    return { success: false, error: "No se pudo eliminar el pedido." };
  }

  if (deleted.comprobanteUrl) {
    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from(COMPROBANTES_BUCKET)
      .remove([deleted.comprobanteUrl]);
    if (error) {
      // The order is already gone — a leftover file in Storage is a minor
      // cleanup issue, not worth failing the whole delete over.
      console.error(
        `Pedido ${id} eliminado, pero falló el borrado del comprobante en Storage: ${error.message}`,
      );
    }
  }

  revalidatePath("/admin/pedidos");
  return { success: true };
}
