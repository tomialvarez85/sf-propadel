"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateOrderEstado } from "@/app/(admin)/admin/(dashboard)/pedidos/actions";
import { InlineSelectCell } from "@/components/admin/inline-edit-cell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { getComprobanteSignedUrl } from "@/lib/supabase/storage";
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

function ComprobanteCell({ path }: { path: string | null }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  if (!path) {
    return (
      <span
        className="text-muted-foreground inline-flex items-center"
        title="El cliente todavía no subió el comprobante"
      >
        <AlertCircle className="size-4" />
      </span>
    );
  }

  const isPdf = path.toLowerCase().endsWith(".pdf");

  async function handleOpen() {
    setOpen(true);
    if (signedUrl) return;
    setLoading(true);
    try {
      const url = await getComprobanteSignedUrl(path!);
      setSignedUrl(url);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el comprobante.",
      );
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="text-primary inline-flex items-center hover:opacity-80"
        title="Ver comprobante"
      >
        <CheckCircle2 className="size-4" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comprobante de pago</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="text-muted-foreground size-6 animate-spin" />
            </div>
          ) : signedUrl && isPdf ? (
            <Button asChild variant="outline">
              <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                Abrir PDF
              </a>
            </Button>
          ) : signedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed URL, expires in minutes, not an optimizable static asset
            <img
              src={signedUrl}
              alt="Comprobante de pago"
              className="max-h-[70vh] w-full rounded-md object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
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
              <div className="flex items-center gap-3">
                <ComprobanteCell path={order.comprobanteUrl} />
                <EstadoCell order={order} />
              </div>
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
              <TableHead>Comprobante</TableHead>
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
                  <ComprobanteCell path={order.comprobanteUrl} />
                </TableCell>
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
