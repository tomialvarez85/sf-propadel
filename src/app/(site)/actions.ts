"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  sendOrderConfirmationEmail,
  sendOrderNotificationEmail,
  sendReceiptUploadedEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import {
  COMPROBANTES_BUCKET,
  COMPROBANTE_ALLOWED_TYPES,
  COMPROBANTE_MAX_SIZE_BYTES,
} from "@/lib/storage-constants";
import { createAdminClient } from "@/lib/supabase/admin";

const checkoutItemSchema = z.object({
  productId: z.string(),
  nombre: z.string(),
  precio: z.number().positive(),
  cantidad: z.number().int().positive(),
  variantes: z.array(z.object({ tipo: z.string(), valor: z.string() })),
});

const checkoutSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá tu nombre"),
  email: z
    .string()
    .trim()
    .min(1, "Ingresá tu email")
    .email("Ingresá un email válido"),
  telefono: z.string().trim().nullable().optional(),
  items: z.array(checkoutItemSchema).min(1, "El carrito está vacío."),
});

export type CheckoutResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

/** Comprobante is now mandatory at checkout (see cart-sheet.tsx — the
 * "Confirmar pedido" button stays disabled until a file is attached), so
 * the order is only ever created with comprobanteUrl already set: upload
 * first (a), create the Order with that path in the same insert (b), only
 * then send the owner email (c) — guaranteeing it always ships with the
 * attachment already in place, instead of racing a later, optional upload.
 * If the upload fails, nothing else happens: no Order, no emails. */
export async function createOrder(
  input: unknown,
  comprobanteFile: File,
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  if (!comprobanteFile || comprobanteFile.size === 0) {
    return {
      success: false,
      error: "Subí el comprobante de pago para confirmar el pedido.",
    };
  }
  if (!COMPROBANTE_ALLOWED_TYPES.includes(comprobanteFile.type)) {
    return {
      success: false,
      error: "Solo se aceptan imágenes (JPG, PNG, WEBP, GIF) o PDF.",
    };
  }
  if (comprobanteFile.size > COMPROBANTE_MAX_SIZE_BYTES) {
    return { success: false, error: "El archivo no puede superar los 5MB." };
  }

  // (a) Upload first — no session exists here to gate this on, same as the
  // rest of the checkout flow, so this uses the service role client rather
  // than relying on the public INSERT policy from a server context.
  const admin = createAdminClient();
  const extension = comprobanteFile.name.split(".").pop() || "bin";
  const comprobantePath = `checkout/${crypto.randomUUID()}.${extension}`;

  try {
    const bytes = Buffer.from(await comprobanteFile.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from(COMPROBANTES_BUCKET)
      .upload(comprobantePath, bytes, { contentType: comprobanteFile.type });
    if (uploadError) throw uploadError;
  } catch (error) {
    console.error("No se pudo subir el comprobante de pago:", error);
    return {
      success: false,
      error: "No se pudo subir el comprobante. Probá de nuevo.",
    };
  }

  const { nombre, email, telefono, items } = parsed.data;
  const total = items.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0,
  );

  // (b) Create the order with comprobanteUrl already set.
  let order;
  try {
    order = await prisma.order.create({
      data: {
        nombreCliente: nombre,
        emailCliente: email,
        telefonoCliente: telefono || null,
        total,
        comprobanteUrl: comprobantePath,
        comprobanteSubidoEn: new Date(),
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
          })),
        },
      },
      include: { items: true },
    });
  } catch (error) {
    console.error("No se pudo registrar el pedido:", error);
    // Order creation failed after the upload succeeded — remove the now
    // orphaned file rather than leaving it in Storage with nothing
    // pointing to it.
    await admin.storage
      .from(COMPROBANTES_BUCKET)
      .remove([comprobantePath])
      .catch(() => {});
    return {
      success: false,
      error: "No se pudo registrar el pedido. Probá de nuevo.",
    };
  }

  // (c) The sale is saved from here on regardless of what happens to either
  // email below — a failed send must never roll back or hide a successful
  // order from the customer. Each failure is only logged, so it can be
  // resent manually later.
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
      `Pedido ${order.id} guardado, pero falló el email al dueño: ${ownerEmailResult.error}`,
    );
  }
  if (!customerEmailResult.success) {
    console.error(
      `Pedido ${order.id} guardado, pero falló el email al cliente: ${customerEmailResult.error}`,
    );
  }

  revalidatePath("/admin/pedidos");
  return { success: true, orderId: order.id };
}

export type SaveComprobanteResult =
  | { success: true }
  | { success: false; error: string };

/** Contingency path only — the main checkout flow now uploads the
 * comprobante before the Order even exists (see createOrder above), so
 * every order created through checkout already has one. This still backs
 * /pedido/[orderId], kept as a fallback for the rare order that reaches
 * /admin/pedidos without a comprobante (e.g. a future admin-created order,
 * or a customer who needs to attach a different file after the fact).
 * `notifyOwner` defaults true here since, unlike checkout, there is no
 * order-creation email this could ride along with. */
export async function saveComprobante(
  orderId: string,
  path: string,
  notifyOwner = true,
): Promise<SaveComprobanteResult> {
  if (!orderId || !path) {
    return { success: false, error: "Datos inválidos." };
  }

  let order;
  try {
    order = await prisma.order.update({
      where: { id: orderId },
      data: { comprobanteUrl: path, comprobanteSubidoEn: new Date() },
    });
  } catch (error) {
    console.error(`No se pudo guardar el comprobante del pedido ${orderId}:`, error);
    return { success: false, error: "No se pudo guardar el comprobante." };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/pedido/${orderId}`);

  if (notifyOwner) {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    const result = await sendReceiptUploadedEmail(
      { id: order.id, nombreCliente: order.nombreCliente, comprobanteUrl: path },
      settings?.emailPedidos,
    );
    if (!result.success) {
      console.error(
        `Pedido ${orderId}: comprobante guardado, pero falló el aviso al dueño: ${result.error}`,
      );
    }
  }

  return { success: true };
}
