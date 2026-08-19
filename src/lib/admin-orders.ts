import type { OrderStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export type OrderListItem = {
  id: string;
  nombreCliente: string;
  emailCliente: string;
  total: number;
  estado: OrderStatus;
  createdAt: Date;
  itemCount: number;
};

export async function getOrderList(): Promise<OrderListItem[]> {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nombreCliente: true,
        emailCliente: true,
        total: true,
        estado: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      nombreCliente: order.nombreCliente,
      emailCliente: order.emailCliente,
      total: order.total.toNumber(),
      estado: order.estado,
      createdAt: order.createdAt,
      itemCount: order._count.items,
    }));
  } catch (error) {
    console.error("No se pudieron cargar los pedidos:", error);
    return [];
  }
}
