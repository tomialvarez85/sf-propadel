import { prisma } from "@/lib/prisma";

export type PublicOrderItem = {
  nombreProducto: string;
  variante: string | null;
  cantidad: number;
  precioUnitario: number;
};

export type PublicOrder = {
  id: string;
  nombreCliente: string;
  total: number;
  createdAt: Date;
  comprobanteSubidoEn: Date | null;
  items: PublicOrderItem[];
};

/** Customer-facing order lookup for /pedido/[orderId] — no auth, the
 * unguessable cuid id is the only access control (same trust model as the
 * checkout confirmation screen itself). Only exposes fields safe to show
 * to whoever holds the link: no email/telefono, no internal `estado`, and
 * no `comprobanteUrl` (the Storage object path) — the page only ever needs
 * to know *whether* one was uploaded (`comprobanteSubidoEn`), not the path
 * itself, which has no reason to leave the server even though the private
 * bucket's RLS would still block reading it either way. */
export async function getPublicOrder(orderId: string): Promise<PublicOrder | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      nombreCliente: true,
      total: true,
      createdAt: true,
      comprobanteSubidoEn: true,
      items: {
        select: {
          nombreProducto: true,
          variante: true,
          cantidad: true,
          precioUnitario: true,
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    nombreCliente: order.nombreCliente,
    total: order.total.toNumber(),
    createdAt: order.createdAt,
    comprobanteSubidoEn: order.comprobanteSubidoEn,
    items: order.items.map((item) => ({
      nombreProducto: item.nombreProducto,
      variante: item.variante,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario.toNumber(),
    })),
  };
}
