"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteOrder, updateOrderEstado } from "@/app/(admin)/admin/(dashboard)/pedidos/actions";
import { InlineSelectCell } from "@/components/admin/inline-edit-cell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

/** PENDIENTE covers two very different states now that checkout is
 * split in two steps (see finalizeOrder in (site)/actions.ts): an order
 * that hasn't even reached step 2 yet (no comprobante — nothing to review)
 * vs one that has and is just waiting on the owner's ok. This label is
 * what tells those apart at a glance in the table. */
function comprobanteLabel(order: OrderListItem): string {
  if (!order.comprobanteUrl) return "Esperando comprobante";
  if (order.estado === "PENDIENTE") return "Pendiente de revisión";
  return "Ver comprobante";
}

function ComprobanteCell({ order }: { order: OrderListItem }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const path = order.comprobanteUrl;
  const label = comprobanteLabel(order);

  if (!path) {
    return (
      <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
        <AlertCircle className="size-4 shrink-0" />
        {label}
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
        className="text-primary inline-flex items-center gap-1.5 text-xs hover:opacity-80"
      >
        <CheckCircle2 className="size-4 shrink-0" />
        {label}
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

/** The owner's main use for this field is contacting the customer on
 * WhatsApp, so it's a direct wa.me link, not just text to copy. */
function TelefonoCell({ order }: { order: OrderListItem }) {
  const whatsappHref = `https://wa.me/${order.telefonoCliente.replace(/\D/g, "")}`;

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary inline-flex items-center gap-1.5 hover:opacity-80"
    >
      <MessageCircle className="size-4 shrink-0" />
      {order.telefonoCliente}
    </a>
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

/** Permanent delete, for cleaning up test/junk orders — pasar a estado
 * Cancelado (ya existente en EstadoCell) sigue siendo lo recomendado para
 * pedidos reales que no se van a concretar pero cuyo registro conviene
 * conservar. */
function DeleteOrderButton({ order }: { order: OrderListItem }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteOrder(order.id);
      setConfirmOpen(false);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Pedido eliminado");
      router.refresh();
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Eliminar pedido de ${order.nombreCliente}`}
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="text-destructive size-4" />
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar el pedido de {order.nombreCliente} por{" "}
              {formatCurrency(order.total)}? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
                <div className="mt-0.5 text-xs">
                  <TelefonoCell order={order} />
                </div>
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
              <div className="flex items-center gap-2">
                <ComprobanteCell order={order} />
                <EstadoCell order={order} />
                <DeleteOrderButton order={order} />
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
              <TableHead>Teléfono</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Comprobante</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
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
                <TableCell>
                  <TelefonoCell order={order} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {order.itemCount}
                </TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <ComprobanteCell order={order} />
                </TableCell>
                <TableCell>
                  <EstadoCell order={order} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell>
                  <DeleteOrderButton order={order} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
