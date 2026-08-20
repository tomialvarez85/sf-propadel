import type { OrderStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export type OrderListItem = {
  id: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  total: number;
  estado: OrderStatus;
  createdAt: Date;
  itemCount: number;
  comprobanteUrl: string | null;
};

export async function getOrderList(): Promise<OrderListItem[]> {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nombreCliente: true,
        emailCliente: true,
        telefonoCliente: true,
        total: true,
        estado: true,
        createdAt: true,
        comprobanteUrl: true,
        _count: { select: { items: true } },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      nombreCliente: order.nombreCliente,
      emailCliente: order.emailCliente,
      telefonoCliente: order.telefonoCliente,
      total: order.total.toNumber(),
      estado: order.estado,
      createdAt: order.createdAt,
      itemCount: order._count.items,
      comprobanteUrl: order.comprobanteUrl,
    }));
  } catch (error) {
    console.error("No se pudieron cargar los pedidos:", error);
    return [];
  }
}
