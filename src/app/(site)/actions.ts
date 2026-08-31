"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { sendOrderConfirmationEmail, sendOrderNotificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { checkoutFormSchema } from "@/lib/validations/checkout";

const checkoutItemSchema = z.object({
  productId: z.string(),
  nombre: z.string(),
  precio: z.number().positive(),
  cantidad: z.number().int().positive(),
  variantes: z.array(z.object({ tipo: z.string(), valor: z.string() })),
  condicion: z.enum(["NUEVO", "USADO"]),
});

// Reuses the exact nombre/email/telefono rules the client-side form already
// validates against (lib/validations/checkout.ts) instead of a hand-copied
// duplicate — the two can no longer drift out of sync.
const checkoutSchema = checkoutFormSchema.extend({
  items: z.array(checkoutItemSchema).min(1, "El carrito está vacío."),
});

export type CheckoutResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

/** Step 1 of checkout — just registers the Order + OrderItems (estado
 * PENDIENTE, no comprobante yet) and sends nothing. The customer is
 * redirected to /pedido/[orderId] for step 2 (payment info + comprobante +
 * "Finalizar compra"), which is the only place finalizeOrder — and with it
 * the owner email — ever fires. If the customer never comes back, the
 * Order just sits PENDIENTE with no comprobante and nobody was emailed. */
export async function createOrder(input: unknown): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const { nombre, email, telefono, items } = parsed.data;
  const total = items.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0,
  );

  let order;
  try {
    order = await prisma.order.create({
      data: {
        nombreCliente: nombre,
        emailCliente: email,
        telefonoCliente: telefono,
        total,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            nombreProducto: item.nombre,
            variante:
              item.variantes.length > 0
                ? item.variantes.map((v) => `${v.tipo}: ${v.valor}`).join(", ")
                : null,
            cantidad: item.cantidad,
            precioUnitario: item.precio,
            condicion: item.condicion,
          })),
        },
      },
    });
  } catch (error) {
    console.error("No se pudo registrar el pedido:", error);
    return {
      success: false,
      error: "No se pudo registrar el pedido. Probá de nuevo.",
    };
  }

  revalidatePath("/admin/pedidos");
  return { success: true, orderId: order.id };
}

export type FinalizeOrderResult =
  | { success: true }
  | { success: false; error: string };

/** Step 2 of checkout, triggered by "Finalizar compra" on /pedido/[orderId]
 * once a comprobante is already uploaded to Storage (see
 * comprobante-uploader.tsx — upload itself doesn't call this). This is the
 * ONE place in the whole flow that sends the owner notification (with the
 * comprobante attached) and the customer confirmation — never at order
 * creation, never on a bare upload. */
export async function finalizeOrder(
  orderId: string,
  comprobantePath: string,
): Promise<FinalizeOrderResult> {
  if (!orderId || !comprobantePath) {
    return { success: false, error: "Datos inválidos." };
  }

  let order;
  try {
    order = await prisma.order.update({
      where: { id: orderId },
      data: { comprobanteUrl: comprobantePath, comprobanteSubidoEn: new Date() },
      include: { items: true },
    });
  } catch (error) {
    console.error(`No se pudo guardar el comprobante del pedido ${orderId}:`, error);
    return { success: false, error: "No se pudo guardar el comprobante." };
  }

  // From here on the order is already finalized as far as the customer is
  // concerned — a failed send must never surface as an error on this
  // screen. Each failure is only logged, so it can be resent manually.
  // revalidatePath is deliberately called AFTER the emails below (not
  // right after the update) so that a hiccup there can never end up
  // skipping the owner notification.
  const orderForEmail = {
    id: order.id,
    nombreCliente: order.nombreCliente,
    emailCliente: order.emailCliente,
    telefonoCliente: order.telefonoCliente,
    total: order.total.toNumber(),
    createdAt: order.createdAt,
    comprobanteUrl: order.comprobanteUrl,
    items: order.items.map((item) => ({
      nombreProducto: item.nombreProducto,
      variante: item.variante,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario.toNumber(),
    })),
  };

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const paymentInfo = {
    alias: settings?.alias ?? null,
    cbu: settings?.cbu ?? null,
    titular: settings?.titular ?? null,
    banco: settings?.banco ?? null,
  };

  const [ownerEmailResult, customerEmailResult] = await Promise.all([
    sendOrderNotificationEmail(orderForEmail, settings?.emailPedidos),
    sendOrderConfirmationEmail(orderForEmail, paymentInfo, settings?.whatsapp),
  ]);

  if (!ownerEmailResult.success) {
    console.error(
      `Pedido ${order.id} finalizado, pero falló el email al dueño: ${ownerEmailResult.error}`,
    );
  }
  if (!customerEmailResult.success) {
    console.error(
      `Pedido ${order.id} finalizado, pero falló el email al cliente: ${customerEmailResult.error}`,
    );
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/pedido/${orderId}`);

  return { success: true };
}
