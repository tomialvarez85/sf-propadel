import type { Metadata } from "next";

import { OrderList } from "@/components/admin/order-list";
import { Card, CardContent } from "@/components/ui/card";
import { getOrderList } from "@/lib/admin-orders";

export const metadata: Metadata = {
  title: "Pedidos | SF ProPadel Admin",
};

export default async function AdminPedidosPage() {
  const orders = await getOrderList();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground text-sm">
          {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
        </p>
      </div>

      <Card>
        <CardContent>
          <OrderList orders={orders} />
        </CardContent>
      </Card>
    </div>
  );
}
