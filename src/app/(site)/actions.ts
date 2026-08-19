"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  sendOrderConfirmationEmail,
  sendOrderNotificationEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";

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
        telefonoCliente: telefono || null,
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
          })),
        },
      },
      include: { items: true },
    });
  } catch (error) {
    console.error("No se pudo registrar el pedido:", error);
    return {
      success: false,
      error: "No se pudo registrar el pedido. Probá de nuevo.",
    };
  }

  // The sale is saved from here on regardless of what happens to either
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
