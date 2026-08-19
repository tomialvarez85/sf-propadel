"use client";

import { updateOrderEstado } from "@/app/(admin)/admin/(dashboard)/pedidos/actions";
import { InlineSelectCell } from "@/components/admin/inline-edit-cell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import type { OrderListItem } from "@/lib/admin-orders";

const ESTADO_OPTIONS = [
  { id: "PENDIENTE", nombre: "Pendiente" },
  { id: "CONFIRMADO", nombre: "Confirmado" },
  { id: "ENVIADO", nombre: "Enviado" },
  { id: "CANCELADO", nombre: "Cancelado" },
];

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  ENVIADO: "Enviado",
  CANCELADO: "Cancelado",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function EstadoCell({ order }: { order: OrderListItem }) {
  return (
    <InlineSelectCell
      valueId={order.estado}
      valueLabel={ESTADO_LABELS[order.estado] ?? order.estado}
      options={ESTADO_OPTIONS}
      onSave={(id) => updateOrderEstado(order.id, id)}
      successMessage="Estado actualizado"
    />
  );
}

export function OrderList({ orders }: { orders: OrderListItem[] }) {
  if (orders.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Todavía no hay pedidos registrados.
      </p>
    );
  }

  return (
    <>
      <ul className="md:hidden">
        {orders.map((order) => (
          <li
            key={order.id}
            className="border-border flex flex-col gap-3 border-b py-4 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">{order.nombreCliente}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {order.emailCliente}
                </p>
              </div>
              <span className="font-semibold whitespace-nowrap">
                {formatCurrency(order.total)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                {formatDate(order.createdAt)} · {order.itemCount}{" "}
                {order.itemCount === 1 ? "producto" : "productos"}
              </span>
              <EstadoCell order={order} />
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.nombreCliente}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {order.emailCliente}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {order.itemCount}
                </TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <EstadoCell order={order} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
